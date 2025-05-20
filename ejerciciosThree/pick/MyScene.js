import * as THREE from '../libs/three.module.js'
import { GUI } from '../libs/dat.gui.module.js'
import { TrackballControls } from '../libs/TrackballControls.js'
import { Tablero } from './Modelo.js'
import * as TWEEN from '../libs/tween.module.js'

class MyScene extends THREE.Scene {
  constructor(myCanvas) {
    super();

    // Estado de captura y turnos
    this.capturedWhite = [];
    this.capturedBlack = [];
    this.currentTurnTeam = 'white'; // empieza el turno de las blancas

    // Parámetros de la animación de introducción
    this.inIntro = true;
    this.introAngle = 0;
    this.introRadius = 3;    // distancia inicial panorámica
    this.introHeight = 2;    // altura de la cámara en la introducción

    this.renderer = this.createRenderer(myCanvas);
    this.gui = this.createGUI();
    this.createLights();
    this.createCamera();

    // Desactivar control de cámara al inicio y en modo por turnos
    this.cameraControl.noRotate = true;
    this.cameraControl.noPan = true;
    this.cameraControl.noZoom = true;

    this.axis = new THREE.AxesHelper(0.1);
    this.add(this.axis);

    // Tablero y piezas
    this.model = new Tablero();
    this.add(this.model);
    this.piezas = this.model.pieces;

    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();
    this.piezaSeleccionada = null;

    const canvas = this.renderer.domElement;
    // Siempre desactivar controles según noRotate/noPan/noZoom
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
    // Animation variables for walking
    this.model.torre.walkAnimationTime = 0;
    this.model.torre.walkSpeed = 0.1; // Adjust this value to control walking speed
    this.model.torre.walkAmplitude = Math.PI / 2; //
  }

  onPointerDown(event) {
    // Primer clic: salir de la introducción y pasar a modo turnos fijo
    if (this.inIntro) {
      this.inIntro = false;
      // Mantener controles desactivados
      this.updateCameraPosition();
      return;
    }

    // Código existente de selección y movimiento (idéntico)
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

          new TWEEN.Tween(pieza.position)
            .to({ y: 0.12 }, 300)
            .easing(TWEEN.Easing.Quadratic.Out)
            .start();
          setTimeout(() => this.model.resaltarCasillasLegales(pieza), 200);
        }
      }
      return;
    }

    const piezaHits = this.raycaster.intersectObjects(this.piezas, false);
    if (piezaHits.length > 0) {
      const otra = piezaHits[0].object;
      if (otra.team === this.currentTurnTeam && otra !== this.piezaSeleccionada) {
        event.stopPropagation(); event.preventDefault();
        new TWEEN.Tween(this.piezaSeleccionada.position)
          .to({ y: 0.01 }, 200)
          .easing(TWEEN.Easing.Quadratic.In)
          .start();
        this.model.limpiarResaltado();
        this.piezaSeleccionada = otra;
        new TWEEN.Tween(otra.position)
          .to({ y: 0.12 }, 300)
          .easing(TWEEN.Easing.Quadratic.Out)
          .start();
        setTimeout(() => this.model.resaltarCasillasLegales(otra), 200);
        return;
      }
    }

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
          target
          const perRow = 4, spacing = 0.06, rowSpacing = 0.15;
          const idx = (target.team === 'white' ? this.capturedWhite : this.capturedBlack).length;
          const baseX = target.team === 'white' ? -0.15 : 1.12;
          const capX = baseX + Math.floor(idx / perRow) * rowSpacing;
          const capZ = -0.3 + (idx % perRow) * spacing;
          if (target.team === 'white') this.capturedWhite.push(target);
          else this.capturedBlack.push(target);
          new TWEEN.Tween(target.position)
            .to({ y: 0.12 }, 1200)
            .easing(TWEEN.Easing.Quadratic.Out)
            .onComplete(() => {
              new TWEEN.Tween(target.position)
                .to({ x: capX, y: 0.12, z: capZ }, 1200)
                .easing(TWEEN.Easing.Quadratic.InOut)
                .onComplete(() => {
                  new TWEEN.Tween(target.position)
                    .to({ y: 0.01 }, 1200)
                    .easing(TWEEN.Easing.Quadratic.In)
                    .start();
                })
                .start();
            })
            .start();
          target.userData.captured = true;
          this.model.pieces = this.model.pieces.filter(p => p !== target);
          this.piezas = this.piezas.filter(p => p !== target);
        }

        const destX = casilla.position.x;
        const destZ = casilla.position.z;
        new TWEEN.Tween(pieza.position)
          .to({ x: destX, z: destZ }, 1200)
          .easing(TWEEN.Easing.Quadratic.InOut)
          .onComplete(() => {
            new TWEEN.Tween(pieza.position)
              .to({ y: 0.01 }, 1200)
              .easing(TWEEN.Easing.Quadratic.In)
              .start();
            pieza.userData = { fila: destF, columna: destC };
            this.model.limpiarResaltado();
            this.piezaSeleccionada = null;
            this.currentTurnTeam = (this.currentTurnTeam === 'white') ? 'black' : 'white';
            this.updateCameraPosition();
          })
          .start();
        return;
      }
    }

    this.model.limpiarResaltado();
    if (this.piezaSeleccionada) {
      new TWEEN.Tween(this.piezaSeleccionada.position)
        .to({ y: 0.01 }, 200)
        .easing(TWEEN.Easing.Quadratic.In)
        .start();
    }
    this.piezaSeleccionada = null;
  }

  createCamera() {
    this.camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.01, 10);
    // Posición inicial: panorámica o por turno
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

  // Ajusta la cámara según el equipo activo
  updateCameraPosition() {
    const center = new THREE.Vector3(0, 0, 0);
    const distance = 1.6;
    const y = 1.5;
    const z = this.currentTurnTeam === 'white' ? -distance : distance;
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
    this.guiControls = { lightPower: 50.0, ambientIntensity: 0.5, axisOnOff: true };
    const folder = gui.addFolder('Luz y Ejes');
    folder.add(this.guiControls, 'lightPower', 0, 1000, 20)
      .name('Luz puntual').onChange(v => this.setLightPower(v));
    folder.add(this.guiControls, 'ambientIntensity', 0, 1, 0.05)
      .name('Luz ambiental').onChange(v => this.setAmbientIntensity(v));
    folder.add(this.guiControls, 'axisOnOff')
      .name('Mostrar ejes').onChange(v => this.setAxisVisible(v));
    return gui;
  }

  createLights() {
    this.ambientLight = new THREE.AmbientLight('white', this.guiControls.ambientIntensity);
    this.add(this.ambientLight);
    this.pointLight = new THREE.SpotLight(0xffffff);
    this.pointLight.power = this.guiControls.lightPower;
    this.pointLight.position.set(2, 3, 1);
    this.add(this.pointLight);
  }

  setLightPower(v) { this.pointLight.power = v; }
  setAmbientIntensity(v) { this.ambientLight.intensity = v; }
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
    TWEEN.update();
    if (this.inIntro) {
      this.introAngle += 0.005;
      const x = Math.sin(this.introAngle) * this.introRadius;
      const z = Math.cos(this.introAngle) * this.introRadius;
      this.camera.position.set(x, this.introHeight, z);
      this.camera.lookAt(new THREE.Vector3(0, 0, 0));
    }
    // En modo por turnos, no se llama a cameraControl.update(), manteniendo cámara fija
    this.model.update();
    requestAnimationFrame(() => this.update());
  }
  caminar() {
  for (let i = 0; i < 4; i++) {
    // Update walk animation time
    this.walkAnimationTime += this.walkSpeed;
    // Calculate the value for leg rotation using a sine wave
    // This will create a smooth back-and-forth motion
    const piernasRotationValue = Math.sin(this.walkAnimationTime) * this.walkAmplitude;

    // Apply the rotation to the model's legs
    this.model.updatePiernasRotation(piernasRotationValue);
    requestAnimationFrame(() => this.update())
  }
}
}

$(function () {
  const scene = new MyScene('#WebGL-output');
  window.addEventListener('resize', () => scene.onWindowResize());
  scene.update();
});
