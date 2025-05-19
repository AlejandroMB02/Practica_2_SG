import * as THREE from '../libs/three.module.js';
import * as CSG from '../libs/three-bvh-csg.js';

class Torre extends THREE.Object3D {
    constructor(gui,titleGui) {
        super();
        this.createGUI(gui,titleGui);

        //--------------------------------------------------------------------------------------------------
        // COLA
        //--------------------------------------------------------------------------------------------------

        // Material común para todas las partes
        this.material = new THREE.MeshStandardMaterial({ color: 0x888888 });

        // Propiedades para almacenar las referencias a los segmentos para poder rotarlos dinámicamente
        this.segmentoPunta = null;
        this.segmentoMitad = null;
        this.segmentoBase = null;

        // Crear la jerarquía de la cola llamando al método que crea la base
        this.cola = this.createCola();
        this.cola.translateZ(-0.06);

        //--------------------------------------------------------------------------------------------------
        // BASE
        //--------------------------------------------------------------------------------------------------

        var shape = new THREE.Shape();
        shape.moveTo(0.015, -0.05);
        shape.lineTo (0.015, 0.05);
        shape.lineTo(-0.015, 0.05);
        shape.lineTo(-0.015, -0.05);
        shape.lineTo(0.015, -0.05);
        var options = { depth: 0.007, steps: 2, curveSegments : 4, bevelThickness: 0.005 , bevelSize: 0.005 , bevelSegments: 15 };
        var baseFijaGeom = new THREE.ExtrudeGeometry ( shape , options );
        baseFijaGeom.rotateX(Math.PI/2);

        var baseFija = new THREE.Mesh(baseFijaGeom, this.material);

        var geom_apoyo_1 = new THREE.BoxGeometry(0.003, 0.012, 0.01);
        var geom_apoyo_2 = new THREE.BoxGeometry(0.003, 0.012, 0.01);
        var geom_cil_1 = new THREE.CylinderGeometry(0.005, 0.005, 0.003);
        var geom_cil_2 = new THREE.CylinderGeometry(0.005, 0.005, 0.003);
        var geom_eje = new THREE.CylinderGeometry(0.003, 0.003, 0.04)

        //Transformaciones
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

        var apoyo1_brush = new CSG.Brush(geom_apoyo_1, this.material);
        var apoyo2_brush = new CSG.Brush(geom_apoyo_2, this.material);
        var cil1_brush = new CSG.Brush(geom_cil_1, this.material);
        var cil2_brush = new CSG.Brush(geom_cil_2, this.material);
        var eje_brush = new CSG.Brush(geom_eje, this.material);

        //Operaciones
        var evaluador = new CSG.Evaluator();
        var baseApoyo = evaluador.evaluate(apoyo1_brush, apoyo2_brush, CSG.ADDITION);
        var cilApoyo = evaluador.evaluate(cil1_brush, cil2_brush, CSG.ADDITION);
        var apoyoSin = evaluador.evaluate(baseApoyo, cilApoyo, CSG.ADDITION);
        var apoyoFinal = evaluador.evaluate(apoyoSin, eje_brush, CSG.SUBTRACTION);

        this.add(apoyoFinal);

        //--------------------------------------------------------------------------------------------------
        // 
        //--------------------------------------------------------------------------------------------------

        this.add(baseFija);
        this.add(this.cola); 

        var boca = this.createBoca();
        this.add(boca);
    }

    createGUI(gui, titleGui) {
        this.guiControls = {
            rotacionCola: 0 // Valor inicial para el control GUI
        };

        // Se crea una sección para los controles
        var folder = gui.addFolder(titleGui);

        // Corregido: El nombre de la propiedad en this.guiControls debe coincidir ('rotacionCola')
        folder.add(this.guiControls, 'rotacionCola', -Math.PI / 4, Math.PI / 4, 0.001) // Rango de rotación en radianes
            .name('Oscilación Y : ') // Nombre que se muestra en la GUI
            .onChange((value) => this.updateTailRotation(value)); // Llama a la función para actualizar la rotación
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
        var bocaMesh = new THREE.Mesh(bocaGeom, this.material); //Cubo superior

        var geom_apoyo_1 = new THREE.BoxGeometry(0.003, 0.012, 0.01);
        var geom_apoyo_2 = new THREE.BoxGeometry(0.003, 0.012, 0.01);
        var geom_cil_1 = new THREE.CylinderGeometry(0.005, 0.005, 0.003);
        var geom_cil_2 = new THREE.CylinderGeometry(0.005, 0.005, 0.003);
        var geom_eje = new THREE.CylinderGeometry(0.003, 0.003, 0.04)

        //Transformaciones
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

        var apoyo1_brush = new CSG.Brush(geom_apoyo_1, this.material);
        var apoyo2_brush = new CSG.Brush(geom_apoyo_2, this.material);
        var cil1_brush = new CSG.Brush(geom_cil_1, this.material);
        var cil2_brush = new CSG.Brush(geom_cil_2, this.material);
        var eje_brush = new CSG.Brush(geom_eje, this.material);

        //Operaciones
        var evaluador = new CSG.Evaluator();
        var baseApoyo = evaluador.evaluate(apoyo1_brush, apoyo2_brush, CSG.ADDITION);
        var cilApoyo = evaluador.evaluate(cil1_brush, cil2_brush, CSG.ADDITION);
        var apoyoSin = evaluador.evaluate(baseApoyo, cilApoyo, CSG.ADDITION);
        var apoyoFinal = evaluador.evaluate(apoyoSin, eje_brush, CSG.SUBTRACTION); //Eje de apoyo

        //////////////////////////
        // Dientes
        //////////////////////////
        const grupoDientes1 = new THREE.Group();
        for (let j = 0; j < 10; j++) {
            const geometry = new THREE.CylinderGeometry(0.0045, 0, 0.008);
            const diente = new THREE.Mesh(geometry, this.material);
            diente.position.x = 0.01;
            diente.position.y = 0.017;
            diente.position.z = 0.045 - (j*0.0045);
            grupoDientes1.add(diente);
        }
        const grupoDientes2 = new THREE.Group();
        for (let j = 0; j < 10; j++) {
            const geometry = new THREE.CylinderGeometry(0.0045, 0, 0.008);
            const diente = new THREE.Mesh(geometry, this.material);
            diente.position.x = -0.01;
            diente.position.y = 0.017;
            diente.position.z = 0.045 - (j*0.0045);
            grupoDientes2.add(diente);
        }
        const grupoDientes3 = new THREE.Group();
        for (let j = 0; j < 5; j++) {
            const geometry = new THREE.CylinderGeometry(0.0045, 0, 0.008);
            const diente = new THREE.Mesh(geometry, this.material);
            diente.position.x = 0.01 - (j*0.0045);
            diente.position.y = 0.017;
            diente.position.z = 0.045;
            grupoDientes3.add(diente);
        }

        const grupoBoca = new THREE.Group();
        grupoBoca.add(bocaMesh);
        grupoBoca.add(grupoDientes1);
        grupoBoca.add(grupoDientes2);
        grupoBoca.add(grupoDientes3);
        grupoBoca.add(apoyoFinal);

        return grupoBoca;
    }

    createPuntaCola() {
        // Geometrías para la punta (cono) y su eje (esfera)
        var puntaGeo = new THREE.CylinderGeometry(0, 0.0075, 0.0167, 16); // Cono
        var ejePuntaGeo = new THREE.SphereGeometry(0.0074); // Esfera para el "eje" visual

        // Transformaciones: Mover el origen de la geometría del cono para que la base esté en (0,0,0)
        // y luego rotarla para que apunte a lo largo del eje Z positivo
        puntaGeo.translate(0, (0.0167 / 2)+0.003, 0);
        puntaGeo.rotateX(-Math.PI / 2);

        // Crear los Mesh (combinación de geometría y material)
        var puntaMesh = new THREE.Mesh(puntaGeo, this.material);
        var ejeMesh = new THREE.Mesh(ejePuntaGeo, this.material);

        // Crear un Object3D que servirá como el nodo de transformación para este segmento (la punta)
        var segmento = new THREE.Object3D();
        // No aplicamos la rotación inicial aquí, se controlará dinámicamente

        // Corregido: Añadir los Mesh (no las geometrías) al Object3D del segmento
        segmento.add(puntaMesh);
        segmento.add(ejeMesh);

        // Almacenar la referencia a este Object3D para poder rotarlo después
        this.segmentoPunta = segmento;

        return segmento;
    }

    createMitadCola() {
        // Crear el segmento hijo (la punta)
        // createPuntaCola ya almacena la referencia en this.segmentoPunta
        var punta = this.createPuntaCola();

        // Posicionar el segmento hijo (la punta) relativo a este segmento padre (la mitad)
        // La punta se coloca en el "extremo" de este segmento base
        // Como los cilindros/conos se orientaron a lo largo de Z, el extremo está en (0, 0, 1.67)
        punta.position.set(0, 0, -0.0167);

        // Geometrías para la mitad de la cola (cilindro) y su eje (esfera)
        var mitadGeo = new THREE.CylinderGeometry(0.0075, 0.015, 0.0167, 16);
        var ejeMitadGeo = new THREE.SphereGeometry(0.014);

        // Transformaciones a la geometría
        mitadGeo.translate(0, (0.0167 / 2)+0.003, 0);
        mitadGeo.rotateX(-Math.PI / 2);

        // Crear los Mesh
        var mitadMesh = new THREE.Mesh(mitadGeo, this.material);
        var ejeMesh = new THREE.Mesh(ejeMitadGeo, this.material);

        // Crear un Object3D que servirá como el nodo de transformación para este segmento (la mitad)
        var segmento = new THREE.Object3D();
        // No aplicamos la rotación inicial aquí

        // Corregido: Añadir los Mesh de este segmento Y el Object3D del segmento hijo
        segmento.add(mitadMesh);
        segmento.add(ejeMesh);
        segmento.add(punta); // Añadir el Object3D retornado por createPuntaCola (que ahora es this.segmentoPunta)

        // Almacenar la referencia a este Object3D
        this.segmentoMitad = segmento;

        return segmento;
    }

    createCola() {
        // Crear el segmento hijo (la mitad), que a su vez crea la punta
        // createMitadCola ya almacena las referencias en this.segmentoMitad y this.segmentoPunta
        var mitad = this.createMitadCola();

        // Posicionar el segmento hijo (la mitad) relativo a este segmento padre (la base)
        // La mitad se coloca en el "extremo" de este segmento base
        mitad.position.set(0, 0, -0.0167);

        // Geometrías para la base de la cola (cilindro más grueso) y su eje (esfera)
        var baseGeo = new THREE.CylinderGeometry(0.015, 0.0225, 0.0167, 16);
        var ejeBaseGeo = new THREE.SphereGeometry(0.02);

        // Transformaciones a la geometría
        baseGeo.translate(0, (0.0167 / 2)+0.003, 0);
        baseGeo.rotateX(-Math.PI / 2);

        // Crear los Mesh
        var baseMesh = new THREE.Mesh(baseGeo, this.material);
        var ejeMesh = new THREE.Mesh(ejeBaseGeo, this.material);

        // Crear un Object3D que servirá como el nodo de transformación para este segmento (la base)
        var segmento = new THREE.Object3D();
        // No aplicamos la rotación inicial aquí

        // Corregido: Añadir los Mesh de este segmento Y el Object3D del segmento hijo
        segmento.add(baseMesh);
        segmento.add(ejeMesh);
        segmento.add(mitad); // Añadir el Object3D retornado por createMitadCola (que ahora es this.segmentoMitad)

        // Almacenar la referencia a este Object3D
        this.segmentoBase = segmento;

        // Retornar el Object3D raíz de la jerarquía de la cola
        return segmento;
    }

    // Corregido: Nuevo nombre para la función que actualiza la rotación y uso de las referencias almacenadas
    updateTailRotation(valor) {
        // Aplicar rotación a los segmentos si existen
        // Aplicamos las rotaciones con diferentes factores para simular una curva
        // Originalmente la base tenía /4, la mitad /2 y la punta /1
        if (this.segmentoBase) {
             this.segmentoBase.rotation.y = valor / 4;
        }
        if (this.segmentoMitad) {
             this.segmentoMitad.rotation.y = valor / 2;
        }
         if (this.segmentoPunta) {
             this.segmentoPunta.rotation.y = valor;
        }
    }

    update() {
        // Este método queda vacío si la animación solo depende del evento 'onChange' del GUI.
        // Si necesitaras animación continua (ej: mover la cola automáticamente), la lógica iría aquí.
    }
}

export { Torre };