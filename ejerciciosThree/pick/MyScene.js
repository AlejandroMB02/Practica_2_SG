import * as THREE from '../libs/three.module.js'
import { GUI } from '../libs/dat.gui.module.js'
import { TrackballControls } from '../libs/TrackballControls.js'
import { Tablero } from './Modelo.js' // Este es tu archivo Tablero.js
import * as TWEEN from '../libs/tween.module.js'

class MyScene extends THREE.Scene {
    constructor(myCanvas) {
        super();

        // Variables de animación para caminar
        this.walkAnimationTime = 0;
        this.walkSpeed = 0;
        this.walkAmplitude = Math.PI/2;
        this.piernasRotationValue = 0;

        this.bocaAnimationTime = 0;
        this.bocaSpeed = 0;
        this.bocaAmplitude = Math.PI/15;

        this.colaAnimationTime = 0;
        this.colaSpeed = 0.1;
        this.colaAmplitude = Math.PI/15;

        // Estado de captura y turnos
        this.capturedWhite = [];
        this.capturedBlack = [];
        this.currentTurnTeam = 'white';

        // Parámetros de la animación de introducción
        this.inIntro = true;
        this.introAngle = 0;
        this.introRadius = 12;
        this.introHeight = 2;

        this.renderer = this.createRenderer(myCanvas);
        this.gui = this.createGUI();
        this.createLights();
        this.createCamera();

        // Desactivar controles de cámara al inicio
        this.cameraControl.noRotate = true;
        this.cameraControl.noPan = true;
        this.cameraControl.noZoom = true;

        this.axis = new THREE.AxesHelper(0.1);
        this.add(this.axis);

        // Tablero y piezas
        this.model = new Tablero();
        this.add(this.model);
        this.piezas = this.model.pieces;

        // Referencia a la pieza torre
        this.torreChessPiece = this.model.torreEnTablero;

        this.raycaster = new THREE.Raycaster();
        this.mouse = new THREE.Vector2();
        this.piezaSeleccionada = null;

        const canvas = this.renderer.domElement;
        canvas.addEventListener('pointerdown', this.onPointerDown.bind(this), true);
        canvas.addEventListener('pointermove', ev => {
            if (this.piezaSeleccionada) {
                ev.stopPropagation(); ev.preventDefault();
            }
        }, true);
        canvas.addEventListener('pointerup', ev => {
            if (this.piezaSeleccionada) {
                ev.stopPropagation(); ev.preventDefault();
            }
        }, true);
    }

    onPointerDown(event) {
        if (this.inIntro) {
            this.inIntro = false;
            this.updateCameraPosition();
            return;
        }

        const rect = this.renderer.domElement.getBoundingClientRect();
        this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
        this.raycaster.setFromCamera(this.mouse, this.camera);

        if (!this.piezaSeleccionada) {
            const hits = this.raycaster.intersectObjects(this.piezas, false);
            if (hits.length > 0) {
                const pieza = hits[0].object;
                if (pieza.team === this.currentTurnTeam) {
                    event.stopPropagation(); event.preventDefault();
                    this.piezaSeleccionada = pieza;

                    // Encender/apagar luz roja según selección de torre
                    if (pieza === this.torreChessPiece) {
                        this.walkSpeed = 0.1;
                        this.redLight.power = 200;
                    } else {
                        this.walkSpeed = 0;
                        this.bocaSpeed = 0;
                        this.redLight.power = 0;
                    }

                    new TWEEN.Tween(pieza.position)
                        .to({ y: 0.12 }, 300)
                        .easing(TWEEN.Easing.Quadratic.Out)
                        .start();
                    setTimeout(() => this.model.resaltarCasillasLegales(pieza), 200);
                }
            }
            return;
        }

        // Selección de otra pieza
        const piezaHits = this.raycaster.intersectObjects(this.piezas, false);
        if (piezaHits.length > 0) {
            const otra = piezaHits[0].object;
            if (otra.team === this.currentTurnTeam && otra !== this.piezaSeleccionada) {
                event.stopPropagation(); event.preventDefault();

                new TWEEN.Tween(this.piezaSeleccionada.position)
                    .to({ y: 0.01 }, 300)
                    .easing(TWEEN.Easing.Quadratic.In)
                    .start();
                this.model.limpiarResaltado();
                this.piezaSeleccionada = otra;

                if (otra === this.torreChessPiece) {
                    this.walkSpeed = 0.1;
                    this.redLight.power = 200;
                } else {
                    this.walkSpeed = 0;
                    this.bocaSpeed = 0;
                    this.redLight.power = 0;
                }

                new TWEEN.Tween(otra.position)
                    .to({ y: 0.12 }, 300)
                    .easing(TWEEN.Easing.Quadratic.Out)
                    .start();
                setTimeout(() => this.model.resaltarCasillasLegales(otra), 200);
                return;
            }
        }

        // Movimiento a casilla
        const sqHits = this.raycaster.intersectObjects(this.model.squares);
        if (sqHits.length > 0) {
            const casilla = sqHits[0].object;
            if (casilla.userData.resaltada) {
                event.stopPropagation(); event.preventDefault();
                const destF = casilla.userData.fila;
                const destC = casilla.userData.columna;
                const pieza = this.piezaSeleccionada;
                const target = this.model.getPiece(destF, destC);

                if (target && target.team !== this.currentTurnTeam) {
                    if (pieza === this.torreChessPiece) {
                        this.bocaSpeed = 0.5;
                    }
                    new TWEEN.Tween(target.position)
                        .to({ y: 0.12 }, 600)
                        .easing(TWEEN.Easing.Quadratic.Out)
                        .onComplete(() => {
                            new TWEEN.Tween(target.position)
                                .to({ x: (target.team === 'white' ? -0.15 : 1.12), y: 0.12, z: 0 }, 600)
                                .easing(TWEEN.Easing.Quadratic.InOut)
                                .onComplete(() => {
                                    new TWEEN.Tween(target.position)
                                        .to({ y: 0.01 }, 300)
                                        .easing(TWEEN.Easing.Quadratic.In)
                                        .start();
                                })
                                .start();
                        })
                        .start();
                    target.userData.captured = true;
                    this.model.pieces = this.model.pieces.filter(p => p !== target);
                    this.piezas = this.piezas.filter(p => p !== target);
                    this.walkSpeed = 0;
                    this.piernasRotationValue = 0;
                    this.torreChessPiece.originalModel.update();
                }

                const destX = casilla.position.x;
                const destZ = casilla.position.z;

                new TWEEN.Tween(pieza.position)
                    .to({ x: destX, z: destZ }, 1200)
                    .easing(TWEEN.Easing.Quadratic.InOut)
                    .onComplete(() => {
                        new TWEEN.Tween(pieza.position)
                            .to({ y: 0.01 }, 300)
                            .easing(TWEEN.Easing.Quadratic.In)
                            .start();
                        pieza.userData = { fila: destF, columna: destC };
                        this.model.limpiarResaltado();
                        this.piezaSeleccionada = null;
                        this.currentTurnTeam = (this.currentTurnTeam === 'white' ? 'black' : 'white');
                        this.updateCameraPosition();
                    })
                    .start();
                return;
            }
        }

        // Deselección
        this.model.limpiarResaltado();
        if (this.piezaSeleccionada) {
            if (this.piezaSeleccionada === this.torreChessPiece) {
                this.walkSpeed = 0;
                this.piernasRotationValue = 0;
                this.bocaSpeed = 0;
                this.torreChessPiece.originalModel.update();
                this.redLight.power = 0;
            }
            new TWEEN.Tween(this.piezaSeleccionada.position)
                .to({ y: 0.01 }, 200)
                .easing(TWEEN.Easing.Quadratic.In)
                .start();
        }
        this.piezaSeleccionada = null;
    }

    createCamera() {
        this.camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.01, 100);
        const initDistance = this.inIntro ? this.introRadius : 1.6;
        const initY = this.inIntro ? this.introHeight : 1.5;
        const z = this.currentTurnTeam === 'white' ? -initDistance : initDistance;
        const look = new THREE.Vector3(0, 0, 0);

        this.camera.position.set(0, initY, z);
        this.camera.lookAt(look);
        this.add(this.camera);

        this.cameraControl = new TrackballControls(this.camera, this.renderer.domElement);
        this.cameraControl.rotateSpeed = 5;
        this.cameraControl.zoomSpeed = -2;
        this.cameraControl.panSpeed = 0.5;
        this.cameraControl.target = look;
    }

    updateCameraPosition() {
        const center = new THREE.Vector3(0, 0, 0);
        const distance = 1.6;
        const y = 1.5;
        const z = this.currentTurnTeam === 'white' ? -distance : distance;
        this.walkSpeed = 0;
        this.bocaSpeed = 0;
        this.redLight.power = 0;
        new TWEEN.Tween(this.camera.position)
            .to({ x: 0, y: y, z: z }, 500)
            .easing(TWEEN.Easing.Quadratic.InOut)
            .onUpdate(() => {
                this.camera.lookAt(center);
                this.cameraControl.target.copy(center);
            })
            .start();
    }

    createGUI() {
        const gui = new GUI();
        this.guiControls = {
            lightPower: 20.0,
            ambientIntensity: 0.5,
            warmLightPower: 30.0,
            axisOnOff: true
        };
        const folder = gui.addFolder('Luz y Ejes');
        folder.add(this.guiControls, 'lightPower', 0, 1000, 20).name('Luz puntual').onChange(v => this.setLightPower(v));
        folder.add(this.guiControls, 'ambientIntensity', 0, 1, 0.05).name('Luz ambiental').onChange(v => this.setAmbientIntensity(v));
        folder.add(this.guiControls, 'warmLightPower', 0, 5000, 10).name('Luz cálida').onChange(v => this.setWarmLightPower(v));
        folder.add(this.guiControls, 'axisOnOff').name('Mostrar ejes').onChange(v => this.setAxisVisible(v));
        return gui;
    }

    createLights() {
        this.ambientLight = new THREE.AmbientLight('white', this.guiControls.ambientIntensity);
        this.add(this.ambientLight);

        this.pointLight = new THREE.SpotLight(0xffffff);
        this.pointLight.power = this.guiControls.lightPower;
        this.pointLight.position.set(2, 3, 1);
        this.add(this.pointLight);

        this.warmLight = new THREE.PointLight(0xFFD700, this.guiControls.warmLightPower);
        this.warmLight.position.set(-2, 2.5, -1.5);
        this.warmLight.distance = 10;
        this.warmLight.decay = 2;
        this.add(this.warmLight);

        // Nueva luz roja inicialmente apagada
        this.redLight = new THREE.SpotLight(0xff0000);
        this.redLight.power = 0;
        this.redLight.position.set(0, 5, 0);
        this.add(this.redLight);
    }

    setLightPower(v) { this.pointLight.power = v; }
    setAmbientIntensity(v) { this.ambientLight.intensity = v; }
    setWarmLightPower(v) { this.warmLight.power = v; }
    setAxisVisible(v) { this.axis.visible = v; }

    createRenderer(myCanvas) {
        const renderer = new THREE.WebGLRenderer();
        renderer.setClearColor(new THREE.Color(0xEEEEEE), 1.0);
        renderer.setSize(window.innerWidth, window.innerHeight);
        $(myCanvas).append(renderer.domElement);
        return renderer;
    }

    getCamera() { return this.camera; }
    setCameraAspect(r) { this.camera.aspect = r; this.camera.updateProjectionMatrix(); }
    onWindowResize() {
        this.setCameraAspect(window.innerWidth / window.innerHeight);
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }
    update() {
        this.renderer.render(this, this.getCamera());
        TWEEN.update(); // CRÍTICO: Aquí se actualizan todas las animaciones TWEEN

        if (this.inIntro) {
            this.introAngle += 0.005;
            const x = Math.sin(this.introAngle) * this.introRadius;
            const z = Math.cos(this.introAngle) * this.introRadius;
            this.camera.position.set(x, this.introHeight, z);
            this.camera.lookAt(new THREE.Vector3(0, 0, 0));
        }
        // En modo por turnos, no se llama a cameraControl.update(), manteniendo cámara fija
        
        // this.model.update(); // El método update en Tablero.js no hace nada actualmente,
        // y TWEEN.update() ya se llama globalmente.
        // Puedes eliminar esta línea o mantenerla si planeas añadir lógica futura.

        // Update walk
        this.walkAnimationTime += this.walkSpeed;
        this.piernasRotationValue = Math.sin(this.walkAnimationTime) * this.walkAmplitude;
        this.torreChessPiece.originalModel.updatePiernasRotation(this.piernasRotationValue);

        // Update Boca
        this.bocaAnimationTime += this.bocaSpeed;
        const bocaRotationValue = Math.sin(this.bocaAnimationTime) * this.bocaAmplitude;
        this.torreChessPiece.originalModel.updateBocaRotation(bocaRotationValue);

        // Update Cola
        this.colaAnimationTime += this.colaSpeed;
        const colaRotationValue = Math.sin(this.colaAnimationTime) * this.colaAmplitude;
        this.torreChessPiece.originalModel.updateTailRotation(colaRotationValue);

        this.torreChessPiece.originalModel.update();

        requestAnimationFrame(() => this.update());
    }

}

$(function () {
    const scene = new MyScene('#WebGL-output');
    window.addEventListener('resize', () => scene.onWindowResize());
    scene.update();
});
