import * as THREE from '../libs/three.module.js'
import { GUI } from '../libs/dat.gui.module.js'
import { TrackballControls } from '../libs/TrackballControls.js'
import { Tablero } from './Modelo.js'
import * as TWEEN from '../libs/tween.module.js'

class MyScene extends THREE.Scene {
  constructor(myCanvas) {
    super();

    // Estado de captura y turnos
    this.capturedWhite = []
    this.capturedBlack = []
    this.currentTurnTeam = 'white'  // empieza el turno de las blancas

    this.renderer = this.createRenderer(myCanvas)
    this.gui = this.createGUI()
    this.createLights()
    this.createCamera()

    this.axis = new THREE.AxesHelper(0.1)
    this.add(this.axis)

    // Tablero y piezas
    this.model = new Tablero()
    this.add(this.model)
    this.piezas = this.model.pieces;

    this.raycaster = new THREE.Raycaster()
    this.mouse = new THREE.Vector2()
    this.piezaSeleccionada = null

    const canvas = this.renderer.domElement
    // Listeners en fase captura para bloquear inercias
    canvas.addEventListener('pointerdown', this.onPointerDown.bind(this), true)
    canvas.addEventListener('pointermove', ev => {
      if (this.piezaSeleccionada) {
        ev.stopPropagation()
        ev.preventDefault()
      }
    }, true)
    canvas.addEventListener('pointerup', ev => {
      if (this.piezaSeleccionada) {
        ev.stopPropagation()
        ev.preventDefault()
      }
    }, true)
  }

 onPointerDown(event) {
  // 1) Coordenadas normalizadas
  const rect = this.renderer.domElement.getBoundingClientRect()
  this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1
  this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1
  this.raycaster.setFromCamera(this.mouse, this.camera)

  // 2) Si no hay pieza seleccionada: intento SELECT
  if (!this.piezaSeleccionada) {
    const hits = this.raycaster.intersectObjects(this.piezas)
    if (hits.length > 0) {
      const pieza = hits[0].object
      if (pieza.team === this.currentTurnTeam) {
        // evitamos que TrackballControls reciba este evento
        event.stopPropagation()
        event.preventDefault()
        this.piezaSeleccionada = pieza
        this.cameraControl.noRotate = true
        this.cameraControl.noPan    = true

        // animación de elevación
        new TWEEN.Tween(pieza.position)
          .to({ y: 0.12 }, 300)
          .easing(TWEEN.Easing.Quadratic.Out)
          .start()

        // tras subir un poco, resaltamos movimientos
        setTimeout(() => this.model.resaltarCasillasLegales(pieza), 200)
      }
    }
    return
  }

  // 3) Si ya había una pieza seleccionada, permitimos cambio de selección
  const piezaHits = this.raycaster.intersectObjects(this.piezas)
  if (piezaHits.length > 0) {
    const otra = piezaHits[0].object
    if (otra.team === this.currentTurnTeam && otra !== this.piezaSeleccionada) {
      event.stopPropagation()
      event.preventDefault()
      // bajar la anterior antes de cambiar
      new TWEEN.Tween(this.piezaSeleccionada.position)
        .to({ y: 0.04 }, 200)
        .easing(TWEEN.Easing.Quadratic.In)
        .start()
      this.model.limpiarResaltado()
      this.piezaSeleccionada = otra
      // elevar la nueva
      new TWEEN.Tween(otra.position)
        .to({ y: 0.12 }, 300)
        .easing(TWEEN.Easing.Quadratic.Out)
        .start()
      setTimeout(() => this.model.resaltarCasillasLegales(otra), 200)
      return
    }
  }

  // 4) Intento mover / capturar en una casilla resaltada
  const sqHits = this.raycaster.intersectObjects(this.model.squares)
  if (sqHits.length > 0) {
    const casilla = sqHits[0].object
    if (casilla.userData.resaltada) {
      const destF = casilla.userData.fila
      const destC = casilla.userData.columna
      // captura si hay enemigo
      const target = this.model.getPiece(destF, destC)
      if (target && target.team !== this.currentTurnTeam) {
        const arr = target.team === 'white'
          ? this.capturedWhite
          : this.capturedBlack
        arr.push(target)
        // expulsar al lateral
        target.position.set(
          -0.5 + (target.team==='white'? -0.15 : 1.25),
          0.02,
          -0.3 + (arr.length - 1) * 0.06
        )
        target.userData.captured = true
        this.model.pieces = this.model.pieces.filter(p => p !== target)
        this.piezas       = this.piezas.filter(p => p !== target)
      }

      const pieza = this.piezaSeleccionada
      const destX = casilla.position.x
      const destZ = casilla.position.z

      // 1) deslizamiento horizontal
      new TWEEN.Tween(pieza.position)
        .to({ x: destX, z: destZ }, 400)
        .easing(TWEEN.Easing.Quadratic.InOut)
        .onComplete(() => {
          // 2) bajada al tablero
          new TWEEN.Tween(pieza.position)
            .to({ y: 0.04 }, 200)
            .easing(TWEEN.Easing.Quadratic.In)
            .start()
          // actualizar estado interno
          pieza.userData = { fila: destF, columna: destC }
          this.model.limpiarResaltado()
          this.piezaSeleccionada = null
          this.cameraControl.noRotate = false
          this.cameraControl.noPan    = false
          // cambiar turno
          this.currentTurnTeam =
            this.currentTurnTeam === 'white' ? 'black' : 'white'
        })
        .start()

      return
    }
  }

  // 5) clic fuera o casilla no resaltada: cancelar selección
  this.model.limpiarResaltado()
  // si estaba elevada, bajarla
  new TWEEN.Tween(this.piezaSeleccionada.position)
    .to({ y: 0.04 }, 200)
    .easing(TWEEN.Easing.Quadratic.In)
    .start()
  this.piezaSeleccionada = null
  this.cameraControl.noRotate = false
  this.cameraControl.noPan    = false
}

  createCamera() {
    this.camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.01, 10)
    this.camera.position.set(0.2, 0.05, 0.2)
    const look = new THREE.Vector3(0, 0, 0)
    this.camera.lookAt(look)
    this.add(this.camera)
    this.cameraControl = new TrackballControls(this.camera, this.renderer.domElement)
    this.cameraControl.rotateSpeed = 5
    this.cameraControl.zoomSpeed = -2
    this.cameraControl.panSpeed = 0.5
    this.cameraControl.target = look
  }

  createGUI() {
    const gui = new GUI()
    this.guiControls = {
      lightPower: 50.0,
      ambientIntensity: 0.5,
      axisOnOff: true
    }
    const folder = gui.addFolder('Luz y Ejes')
    folder.add(this.guiControls, 'lightPower', 0, 1000, 20)
      .name('Luz puntual')
      .onChange(value => this.setLightPower(value))
    folder.add(this.guiControls, 'ambientIntensity', 0, 1, 0.05)
      .name('Luz ambiental')
      .onChange(value => this.setAmbientIntensity(value))
    folder.add(this.guiControls, 'axisOnOff')
      .name('Mostrar ejes')
      .onChange(value => this.setAxisVisible(value))
    return gui
  }

  createLights() {
    this.ambientLight = new THREE.AmbientLight('white', this.guiControls.ambientIntensity)
    this.add(this.ambientLight)
    this.pointLight = new THREE.SpotLight(0xffffff)
    this.pointLight.power = this.guiControls.lightPower
    this.pointLight.position.set(2, 3, 1)
    this.add(this.pointLight)
  }

  setLightPower(v) { this.pointLight.power = v }
  setAmbientIntensity(v) { this.ambientLight.intensity = v }
  setAxisVisible(v) { this.axis.visible = v }

  createRenderer(myCanvas) {
    const renderer = new THREE.WebGLRenderer()
    renderer.setClearColor(new THREE.Color(0xEEEEEE), 1.0)
    renderer.setSize(window.innerWidth, window.innerHeight)
    $(myCanvas).append(renderer.domElement)
    return renderer
  }

  getCamera() { return this.camera }
  setCameraAspect(r) { this.camera.aspect = r; this.camera.updateProjectionMatrix() }
  onWindowResize() { this.setCameraAspect(window.innerWidth / window.innerHeight); this.renderer.setSize(window.innerWidth, window.innerHeight) }

  update() {
    this.renderer.render(this, this.getCamera())
    TWEEN.update()
    this.cameraControl.update()
    this.model.update()
    requestAnimationFrame(() => this.update())
  }
}

$(function () {
  const scene = new MyScene("#WebGL-output")
  window.addEventListener("resize", () => scene.onWindowResize())
  scene.update()
})