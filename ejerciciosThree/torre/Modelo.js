import * as THREE from '../libs/three.module.js';
import * as TWEEN from '../libs/tween.module.js';
import * as CSG from '../libs/three-bvh-csg.js';
import { RotationAnimator } from './Animator.js';

class Torre extends THREE.Object3D {
    constructor() {
        super();
        
        const textureLoader = new THREE.TextureLoader();
        const bumpTexture = textureLoader.load('./Texturas/escamas.jpg');
        this.material_escamas = new THREE.MeshPhongMaterial({
            color: 0x535B15,
            bumpMap: bumpTexture,
            bumpScale: 10
        });
        this.metalMaterial = new THREE.MeshStandardMaterial({
            color: 0xCCCCCC,
            roughness: 0.3,
            metalness: 0.5,
        });
        this.metalQuirurgico = new THREE.MeshStandardMaterial({
            color: 0xFFFFFF,
            roughness: 0.3,
            metalness: 0.5,
        });
        this.MaterialVerde = new THREE.MeshStandardMaterial({
            color: 0x535B15,
            roughness: 0.3,
            metalness: 0.5,
        });
        this.material_negro_brillante = new THREE.MeshPhongMaterial({
            color: 0x000000,
            emissive: 0x072534,
            specular: 0xffffff,
            shininess: 100,
            flatShading: false
        });

        // COLA
        this.segmentoPunta = null;
        this.segmentoMitad = null;
        this.segmentoBase = null;
        this.cola = this.createCola();
        this.cola.translateZ(-0.06);

        // BASE
        var shape = new THREE.Shape();
        shape.moveTo(0.015, -0.05);
        shape.lineTo (0.015, 0.05);
        shape.lineTo(-0.015, 0.05);
        shape.lineTo(-0.015, -0.05);
        shape.lineTo(0.015, -0.05);
        var options = { depth: 0.007, steps: 2, curveSegments : 4, bevelThickness: 0.005 , bevelSize: 0.005 , bevelSegments: 15 };
        var baseFijaGeom = new THREE.ExtrudeGeometry ( shape , options );
        baseFijaGeom.rotateX(Math.PI/2);
        var baseFija = new THREE.Mesh(baseFijaGeom, this.metalMaterial);

        var geom_apoyo_1 = new THREE.BoxGeometry(0.003, 0.012, 0.01);
        var geom_apoyo_2 = new THREE.BoxGeometry(0.003, 0.012, 0.01);
        var geom_cil_1 = new THREE.CylinderGeometry(0.005, 0.005, 0.003);
        var geom_cil_2 = new THREE.CylinderGeometry(0.005, 0.005, 0.003);
        var geom_eje = new THREE.CylinderGeometry(0.003, 0.003, 0.04)

        geom_apoyo_1.translate(0.015, 0.007, 0);
        geom_apoyo_2.translate(-0.015, 0.007, 0);
        geom_cil_1.rotateZ(Math.PI/2);
        geom_cil_2.rotateZ(Math.PI/2);
        geom_cil_1.translate(0.015, 0.013, 0);
        geom_cil_2.translate(-0.015, 0.013, 0);
        geom_eje.rotateZ(Math.PI/2);
        geom_eje.translate(0, 0.013, 0);

        geom_apoyo_1.translate(0, 0, -0.035);
        geom_apoyo_2.translate(0, 0, -0.035);
        geom_cil_1.translate(0, 0, -0.035);
        geom_cil_2.translate(0, 0, -0.035);
        geom_eje.translate(0, 0, -0.035);

        var apoyo1_brush = new CSG.Brush(geom_apoyo_1, this.metalMaterial);
        var apoyo2_brush = new CSG.Brush(geom_apoyo_2, this.metalMaterial);
        var cil1_brush = new CSG.Brush(geom_cil_1, this.metalMaterial);
        var cil2_brush = new CSG.Brush(geom_cil_2, this.metalMaterial);
        var eje_brush = new CSG.Brush(geom_eje, this.metalMaterial);

        var evaluador = new CSG.Evaluator();
        var baseApoyo = evaluador.evaluate(apoyo1_brush, apoyo2_brush, CSG.ADDITION);
        var cilApoyo = evaluador.evaluate(cil1_brush, cil2_brush, CSG.ADDITION);
        var apoyoSin = evaluador.evaluate(baseApoyo, cilApoyo, CSG.ADDITION);
        var apoyoFinal = evaluador.evaluate(apoyoSin, eje_brush, CSG.SUBTRACTION);

        this.add(apoyoFinal);

        // Boca
        var boca = this.createBoca();
        boca.position.set(0, 0.013, -0.035);

        // Piernas
        var piernas = this.createPiernas();

        this.add(baseFija);
        this.add(this.cola);
        this.add(boca);
        this.add(piernas);

        // Animaciones
        this.bocaRotationAnimator = new RotationAnimator();
        this.tailBaseAnimator = new RotationAnimator();
        this.tailMidAnimator = new RotationAnimator();
        this.tailTipAnimator = new RotationAnimator();
        this.piernasRotationAnimator1 = new RotationAnimator();
        this.piernasRotationAnimator2 = new RotationAnimator();
        this.piernasRotationAnimator3 = new RotationAnimator();
        this.piernasRotationAnimator4 = new RotationAnimator();
        this.updatePiernasRotation(0);
    }

    createGUI(gui, titleGui) {
        this.guiControls = {
            rotacionCola: 0,
            aperturaBoca: 0,
            movimientoPiernas: 0
        };

        var folder = gui.addFolder(titleGui);

        folder.add(this.guiControls, 'rotacionCola', -Math.PI / 4, Math.PI / 4, 0.001)
            .name('Cola Y : ')
            .onChange((value) => this.updateTailRotation(value));

        folder.add(this.guiControls, 'aperturaBoca', -Math.PI / 4, Math.PI / 50, 0.001)
            .name('Boca X : ')
            .onChange((value) => this.updateBocaRotation(value));

        folder.add(this.guiControls, 'movimientoPiernas', -Math.PI / 4, Math.PI / 4, 0.001)
            .name('Piernas X : ')
            .onChange((value) => this.updatePiernasRotation(value));
    }

    createPiernas(){
        var cadera_geom = new THREE.SphereGeometry(0.006);
        var rodilla_geom = new THREE.SphereGeometry(0.006);
        var muslo_geom = new THREE.CylinderGeometry(0.006, 0.006, 0.02);
        var pie_geom = new THREE.BoxGeometry(0.012, 0.005, 0.02);

        cadera_geom.translate(0, 0, 0);
        rodilla_geom.translate(0, -0.02, 0);
        rodilla_geom.rotateX(-Math.PI/10);
        rodilla_geom.translate(0, 0, 0);
        muslo_geom.translate(0, -0.01, 0);
        muslo_geom.rotateX(-Math.PI/10);
        muslo_geom.translate(0, 0, 0);
        pie_geom.translate(0, -0.023, 0.01);

        var pierna1 = new THREE.Object3D();
        var pierna2 = new THREE.Object3D();
        var pierna3 = new THREE.Object3D();
        var pierna4 = new THREE.Object3D();
        for (let i = 0; i < 4; i++) {
            var cadera = new THREE.Mesh(cadera_geom, this.material_escamas);
            var rodilla = new THREE.Mesh(rodilla_geom, this.material_escamas);
            var muslo = new THREE.Mesh(muslo_geom, this.material_escamas);
            var pie = new THREE.Mesh(pie_geom, this.material_escamas);
            if(i == 0){
                pierna1.add(cadera);
                pierna1.add(rodilla);
                pierna1.add(muslo);
                pierna1.add(pie);
            }
            if(i == 1){
                pierna2.add(cadera);
                pierna2.add(rodilla);
                pierna2.add(muslo);
                pierna2.add(pie);
            }
            if(i == 2){
                pierna3.add(cadera);
                pierna3.add(rodilla);
                pierna3.add(muslo);
                pierna3.add(pie);
            }
            if(i == 3){
                pierna4.add(cadera);
                pierna4.add(rodilla);
                pierna4.add(muslo);
                pierna4.add(pie);
            }
        }

        this.pierna1 = pierna1;
        this.pierna2 = pierna2;
        this.pierna3 = pierna3;
        this.pierna4 = pierna4;
        
        var piernas = new THREE.Object3D();
        piernas.add(pierna1);
        piernas.add(pierna2);
        piernas.add(pierna3);
        piernas.add(pierna4);

        return piernas;
    }

    createBoca(){
        var shape = new THREE.Shape();
        shape.moveTo(0.015, -0.05);
        shape.lineTo (0.015, 0.05);
        shape.lineTo(-0.015, 0.05);
        shape.lineTo(-0.015, -0.05);
        shape.lineTo(0.015, -0.05);
        var options = { depth: 0.02, steps: 2, curveSegments : 4, bevelThickness: 0.005 , bevelSize: 0.005 , bevelSegments: 15 };
        var bocaGeom = new THREE.ExtrudeGeometry ( shape , options );
        bocaGeom.rotateX(-Math.PI/2);
        bocaGeom.translate(0, 0.026, 0);
        bocaGeom.computeVertexNormals();
        bocaGeom.computeBoundingBox();
        var bocaMesh = new THREE.Mesh(bocaGeom, this.MaterialVerde);

        var geom_apoyo_1 = new THREE.BoxGeometry(0.003, 0.012, 0.01);
        var geom_apoyo_2 = new THREE.BoxGeometry(0.003, 0.012, 0.01);
        var geom_cil_1 = new THREE.CylinderGeometry(0.005, 0.005, 0.003);
        var geom_cil_2 = new THREE.CylinderGeometry(0.005, 0.005, 0.003);
        var geom_eje = new THREE.CylinderGeometry(0.003, 0.003, 0.04);

        geom_apoyo_1.translate(0.015, -0.019, 0);
        geom_apoyo_2.translate(-0.015, -0.019, 0);
        geom_apoyo_1.rotateX(Math.PI);
        geom_apoyo_2.rotateX(Math.PI);
        geom_cil_1.rotateZ(Math.PI/2);
        geom_cil_2.rotateZ(Math.PI/2);
        geom_cil_1.translate(0.015, 0.013, 0);
        geom_cil_2.translate(-0.015, 0.013, 0);
        geom_eje.rotateZ(Math.PI/2);
        geom_eje.translate(0, 0.013, 0);

        geom_apoyo_1.translate(-0.003, 0, -0.035);
        geom_apoyo_2.translate(0.003, 0, -0.035);
        geom_cil_1.translate(-0.003, 0, -0.035);
        geom_cil_2.translate(0.003, 0, -0.035);
        geom_eje.translate(0, 0, -0.035);

        var apoyo1_brush = new CSG.Brush(geom_apoyo_1, this.metalMaterial);
        var apoyo2_brush = new CSG.Brush(geom_apoyo_2, this.metalMaterial);
        var cil1_brush = new CSG.Brush(geom_cil_1, this.metalMaterial);
        var cil2_brush = new CSG.Brush(geom_cil_2, this.metalMaterial);
        var eje_brush = new CSG.Brush(geom_eje, this.metalMaterial);

        var evaluador = new CSG.Evaluator();
        var baseApoyo = evaluador.evaluate(apoyo1_brush, apoyo2_brush, CSG.ADDITION);
        var cilApoyo = evaluador.evaluate(cil1_brush, cil2_brush, CSG.ADDITION);
        var apoyoSin = evaluador.evaluate(baseApoyo, cilApoyo, CSG.ADDITION);
        var apoyoFinal = evaluador.evaluate(apoyoSin, eje_brush, CSG.SUBTRACTION);

        const grupoDientes1 = new THREE.Group();
        for (let j = 0; j < 10; j++) {
            const geometry = new THREE.CylinderGeometry(0.0045, 0, 0.008);
            const diente = new THREE.Mesh(geometry, this.metalQuirurgico);
            diente.position.x = 0.01;
            diente.position.y = 0.017;
            diente.position.z = 0.045 - (j*0.0045);
            grupoDientes1.add(diente);
        }
        const grupoDientes2 = new THREE.Group();
        for (let j = 0; j < 10; j++) {
            const geometry = new THREE.CylinderGeometry(0.0045, 0, 0.008);
            const diente = new THREE.Mesh(geometry, this.metalQuirurgico);
            diente.position.x = -0.01;
            diente.position.y = 0.017;
            diente.position.z = 0.045 - (j*0.0045);
            grupoDientes2.add(diente);
        }
        const grupoDientes3 = new THREE.Group();
        for (let j = 0; j < 5; j++) {
            const geometry = new THREE.CylinderGeometry(0.0045, 0, 0.008);
            const diente = new THREE.Mesh(geometry, this.metalQuirurgico);
            diente.position.x = 0.01 - (j*0.0045);
            diente.position.y = 0.017;
            diente.position.z = 0.045;
            grupoDientes3.add(diente);
        }

        var geom_eje_final = new THREE.CylinderGeometry(0.003, 0.003, 0.03);
        geom_eje_final.rotateZ(Math.PI/2);
        geom_eje_final.translate(0, 0.013, 0);
        geom_eje_final.translate(0, 0, -0.035);
        var eje_final = new THREE.Mesh(geom_eje_final, this.metalMaterial);

        const grupoEscamas = new THREE.Group();
        for (let j = 0; j < 15; j++) {
            const geometry = new THREE.CylinderGeometry(0, 0.004, 0.008, 4);
            const escama = new THREE.Mesh(geometry, this.metalMaterial);
            escama.scale.set(0.5, 1, 1);
            escama.position.y = 0.053;
            escama.position.z = 0.035 - (j*0.005);
            grupoEscamas.add(escama);
        }
        grupoEscamas.rotateX(-Math.PI/60);

        const grupoOjos = new THREE.Group();
        var ojo_der = new THREE.SphereGeometry(0.003);
        var ojo_izq = new THREE.SphereGeometry(0.003);
        var cuenca_der = new THREE.CylinderGeometry(0, 0.0032, 0.01);
        var cuenca_izq = new THREE.CylinderGeometry(0, 0.0032, 0.01);

        ojo_der.translate(0.015, 0.052, 0.035);
        ojo_izq.translate(-0.015, 0.052, 0.035);

        cuenca_der.translate(0, 0.005, 0);
        cuenca_der.rotateX(-Math.PI/1.9);
        cuenca_der.translate(0.015, 0.052, 0.035);
        cuenca_izq.translate(0, 0.005, 0);
        cuenca_izq.rotateX(-Math.PI/1.9);
        cuenca_izq.translate(-0.015, 0.052, 0.035);

        var ojo_der_mesh = new THREE.Mesh(ojo_der, this.material_negro_brillante);
        var ojo_izq_mesh = new THREE.Mesh(ojo_izq, this.material_negro_brillante);
        var cuenca_der_mesh = new THREE.Mesh(cuenca_der, this.MaterialVerde);
        var cuenca_izq_mesh = new THREE.Mesh(cuenca_izq, this.MaterialVerde);

        grupoOjos.add(ojo_der_mesh);
        grupoOjos.add(ojo_izq_mesh);
        grupoOjos.add(cuenca_der_mesh);
        grupoOjos.add(cuenca_izq_mesh);

        const grupoBoca = new THREE.Group();
        grupoBoca.add(bocaMesh);
        grupoBoca.add(grupoDientes1);
        grupoBoca.add(grupoDientes2);
        grupoBoca.add(grupoDientes3);
        grupoBoca.add(apoyoFinal);
        grupoBoca.add(eje_final);
        grupoBoca.add(grupoEscamas);
        grupoBoca.add(grupoOjos);
        grupoBoca.position.set(0, -0.013, 0.035);

        var grupoReturn = new THREE.Group();
        grupoReturn.add(grupoBoca);
        this.boca = grupoReturn;

        return this.boca;
    }

    createPuntaCola() {
        var puntaGeo = new THREE.CylinderGeometry(0, 0.0075, 0.0167, 16);
        var ejePuntaGeo = new THREE.SphereGeometry(0.0074);

        puntaGeo.translate(0, (0.0167 / 2)+0.003, 0);
        puntaGeo.rotateX(-Math.PI / 2);

        var puntaMesh = new THREE.Mesh(puntaGeo, this.material_escamas);
        var ejeMesh = new THREE.Mesh(ejePuntaGeo, this.material_escamas);

        var segmento = new THREE.Object3D();
        segmento.add(puntaMesh);
        segmento.add(ejeMesh);

        this.segmentoPunta = segmento;
        return segmento;
    }

    createMitadCola() {
        var punta = this.createPuntaCola();
        punta.position.set(0, 0, -0.0167);

        var mitadGeo = new THREE.CylinderGeometry(0.0075, 0.015, 0.0167, 16);
        var ejeMitadGeo = new THREE.SphereGeometry(0.014);

        mitadGeo.translate(0, (0.0167 / 2)+0.003, 0);
        mitadGeo.rotateX(-Math.PI / 2);

        var mitadMesh = new THREE.Mesh(mitadGeo, this.material_escamas);
        var ejeMesh = new THREE.Mesh(ejeMitadGeo, this.material_escamas);

        var segmento = new THREE.Object3D();
        segmento.add(mitadMesh);
        segmento.add(ejeMesh);
        segmento.add(punta);

        this.segmentoMitad = segmento;
        return segmento;
    }

    createCola() {
        var mitad = this.createMitadCola();
        mitad.position.set(0, 0, -0.0167);

        var baseGeo = new THREE.CylinderGeometry(0.015, 0.0225, 0.0167, 16);
        var ejeBaseGeo = new THREE.SphereGeometry(0.02);

        baseGeo.translate(0, (0.0167 / 2)+0.003, 0);
        baseGeo.rotateX(-Math.PI / 2);

        var baseMesh = new THREE.Mesh(baseGeo, this.material_escamas);
        var ejeMesh = new THREE.Mesh(ejeBaseGeo, this.material_escamas);

        var segmento = new THREE.Object3D();
        segmento.add(baseMesh);
        segmento.add(ejeMesh);
        segmento.add(mitad);

        this.segmentoBase = segmento;
        return segmento;
    }

    updateTailRotation(valor) {
        const targetBase = new THREE.Euler(0, valor / 4, 0);
        const targetMid = new THREE.Euler(0, valor / 2, 0);
        const targetTip = new THREE.Euler(0, valor, 0);

        if (this.segmentoBase) {
            this.tailBaseAnimator.setAndStart(
                this.segmentoBase.rotation,
                targetBase,
                500
            );
        }
        if (this.segmentoMitad) {
            this.tailMidAnimator.setAndStart(
                this.segmentoMitad.rotation,
                targetMid,
                500
            );
        }
        if (this.segmentoPunta) {
            this.tailTipAnimator.setAndStart(
                this.segmentoPunta.rotation,
                targetTip,
                500
            );
        }
    }

    updateBocaRotation(valor) {
        const targetBocaRotation = new THREE.Euler(valor, 0, 0);
        this.bocaRotationAnimator.setAndStart(
            this.boca.rotation,
            targetBocaRotation,
            300
        );
    }

    updatePiernasRotation(valor) {
        this.pierna1.position.set(0.022, 0, 0.04);
        this.pierna2.position.set(0.022, 0, -0.04);
        this.pierna3.position.set(-0.022, 0, -0.04);
        this.pierna4.position.set(-0.022, 0, 0.04);

        const duration = 300;

        if (this.pierna1) {
            const targetRotation1 = new THREE.Euler(valor, 0, 0);
            this.piernasRotationAnimator1.setAndStart(
                this.pierna1.rotation,
                targetRotation1,
                duration
            );
        }
        if (this.pierna2) {
            const targetRotation2 = new THREE.Euler(valor, 0, 0);
            this.piernasRotationAnimator2.setAndStart(
                this.pierna2.rotation,
                targetRotation2,
                duration
            );
        }
        if (this.pierna3) {
            const targetRotation3 = new THREE.Euler(-valor, 0, 0);
            this.piernasRotationAnimator3.setAndStart(
                this.pierna3.rotation,
                targetRotation3,
                duration
            );
        }
        if (this.pierna4) {
            const targetRotation4 = new THREE.Euler(-valor, 0, 0);
            this.piernasRotationAnimator4.setAndStart(
                this.pierna4.rotation,
                targetRotation4,
                duration
            );
        }
    }

    // --- Nuevas funciones de animación compuestas ---

    /**
     * Activa una animación de "caminar" para la torre,
     * animando las piernas y la cola de manera coordinada.
     */
    startWalkingAnimation() {
        const walkingDuration = 800; // Duración de un ciclo de paso
        const legMovementAmplitude = Math.PI / 8; // Amplitud del movimiento de las piernas
        const tailMovementAmplitude = Math.PI / 8; // Amplitud del movimiento de la cola

        // Animación de piernas (ida y vuelta para simular un paso)
        const walkForward = () => {
            this.updatePiernasRotation(legMovementAmplitude);
            new TWEEN.Tween(this.guiControls)
                .to({ movimientoPiernas: -legMovementAmplitude }, walkingDuration / 2)
                .easing(TWEEN.Easing.Sinusoidal.InOut)
                .onComplete(() => {
                    this.updatePiernasRotation(-legMovementAmplitude);
                    new TWEEN.Tween(this.guiControls)
                        .to({ movimientoPiernas: legMovementAmplitude }, walkingDuration / 2)
                        .easing(TWEEN.Easing.Sinusoidal.InOut)
                        .onComplete(walkForward) // Repetir el ciclo
                        .start();
                })
                .start();
        };

        // Animación de la cola (balanceo lateral)
        const tailSwing = () => {
            this.updateTailRotation(tailMovementAmplitude);
            new TWEEN.Tween(this.guiControls)
                .to({ rotacionCola: -tailMovementAmplitude }, walkingDuration / 2)
                .easing(TWEEN.Easing.Sinusoidal.InOut)
                .onComplete(() => {
                    this.updateTailRotation(-tailMovementAmplitude);
                    new TWEEN.Tween(this.guiControls)
                        .to({ rotacionCola: tailMovementAmplitude }, walkingDuration / 2)
                        .easing(TWEEN.Easing.Sinusoidal.InOut)
                        .onComplete(tailSwing) // Repetir el ciclo
                        .start();
                })
                .start();
        };

        // Iniciar ambas animaciones
        walkForward();
        tailSwing();
    }

    /**
     * Activa una animación de "lucha" para la torre,
     * moviendo la boca y la cola de manera agresiva.
     */
    startFightingAnimation() {
        const fightDuration = 400; // Duración de un movimiento de lucha
        const mouthOpenAngle = Math.PI / 5; // Ángulo máximo de apertura de la boca
        const mouthCloseAngle = Math.PI / 50; // Ángulo mínimo de cierre (el valor actual que tienes)
        const tailWhipAmplitude = Math.PI / 3; // Amplitud del latigazo de la cola

        // Animación de la boca (abrir y cerrar repetidamente)
        const mouthAttack = () => {
            this.updateBocaRotation(mouthOpenAngle); // Abre la boca
            new TWEEN.Tween(this.guiControls)
                .to({ aperturaBoca: mouthCloseAngle }, fightDuration / 2)
                .easing(TWEEN.Easing.Quadratic.Out)
                .onComplete(() => {
                    this.updateBocaRotation(mouthCloseAngle); // Cierra la boca
                    new TWEEN.Tween(this.guiControls)
                        .to({ aperturaBoca: mouthOpenAngle }, fightDuration / 2)
                        .easing(TWEEN.Easing.Quadratic.In)
                        .onComplete(mouthAttack) // Repetir
                        .start();
                })
                .start();
        };

        // Animación de la cola (latigazo)
        const tailWhip = () => {
            this.updateTailRotation(tailWhipAmplitude); // Latigazo hacia un lado
            new TWEEN.Tween(this.guiControls)
                .to({ rotacionCola: -tailWhipAmplitude }, fightDuration / 2)
                .easing(TWEEN.Easing.Sinusoidal.InOut)
                .onComplete(() => {
                    this.updateTailRotation(-tailWhipAmplitude); // Latigazo hacia el otro lado
                    new TWEEN.Tween(this.guiControls)
                        .to({ rotacionCola: tailWhipAmplitude }, fightDuration / 2)
                        .easing(TWEEN.Easing.Sinusoidal.InOut)
                        .onComplete(tailWhip) // Repetir
                        .start();
                })
                .start();
        };

        // Iniciar ambas animaciones
        mouthAttack();
        tailWhip();
    }

    /**
     * Detiene todas las animaciones iniciadas por `startWalkingAnimation` o `startFightingAnimation`.
     * Esto es importante para que las animaciones no sigan ejecutándose indefinidamente.
     */
    stopAllAnimations() {
        TWEEN.removeAll(); // Detiene todos los tweens activos
        // Puedes opcionalmente reiniciar los valores a su posición original si lo deseas
        this.updatePiernasRotation(0);
        this.updateBocaRotation(0);
        this.updateTailRotation(0);
    }

    update() {
        TWEEN.update();
    }
}

export { Torre };