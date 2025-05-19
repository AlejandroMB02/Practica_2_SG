import * as THREE from '../libs/three.module.js'
import { GUI } from '../libs/dat.gui.module.js'
import { TrackballControls } from '../libs/TrackballControls.js'
import { Tablero } from './Modelo.js'

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

    // 2) Si no hay selección activa: intento seleccionar pieza
    if (!this.piezaSeleccionada) {
      const hits = this.raycaster.intersectObjects(this.piezas)
      if (hits.length > 0) {
        const pieza = hits[0].object
        // solo permito seleccionar si es turno de su equipo
        if (pieza.team === this.currentTurnTeam) {
          event.stopPropagation()
          event.preventDefault()
          this.piezaSeleccionada = pieza
          this.cameraControl.noRotate = true
          this.cameraControl.noPan = true
          this.model.resaltarCasillasLegales(pieza)
        }
      }
      return
    }

    // 3) Si ya había selección activa:
    // A) Cambio de selección si clic en otra pieza de mi equipo
    const piezaHits = this.raycaster.intersectObjects(this.piezas)
    if (piezaHits.length > 0) {
      const otra = piezaHits[0].object
      if (otra.team === this.currentTurnTeam) {
        // cambio de selección
        event.stopPropagation()
        event.preventDefault()
        this.model.limpiarResaltado()
        this.piezaSeleccionada = otra
        this.model.resaltarCasillasLegales(otra)
        return
      }
    }

    // B) Intento mover / capturar en casilla resaltada
    const sqHits = this.raycaster.intersectObjects(this.model.squares)
    if (sqHits.length > 0) {
      const casilla = sqHits[0].object
      if (casilla.userData.resaltada) {
        const destF = casilla.userData.fila
        const destC = casilla.userData.columna
        // captura si existe enemigo
        const target = this.model.getPiece(destF, destC)
        if (target && target.team !== this.currentTurnTeam) {
          // expulsar pieza capturada
          // expulsar pieza capturada en cuadrícula de 4
          const arr = target.team === 'white'
            ? this.capturedWhite
            : this.capturedBlack;
          arr.push(target);

          const idx = arr.length - 1;
          const perRow = 4;
          const spacing = 0.15;
          // calcula fila y columna dentro de la zona de captura
          const row = Math.floor(idx / perRow);
          const col = idx % perRow;

          // define offsets base según equipo
          const xBase = target.team === 'white' ? -0.15 : 1.25;

          // cuánto se aleja cada fila de 4 piezas
          const rowSpacing = 0.15;

          // Z avanza por columnas, X por “filas”
          const xPos = xBase + row * rowSpacing;
          const zPos = -0.3 + spacing / 2 + col * spacing;
          // misma altura para todas
          const yPos = 0.02;

          target.position.set(xPos, yPos, zPos);
          target.userData.captured = true
          // quitar de juego
          this.model.pieces = this.model.pieces.filter(p => p !== target)
          this.piezas = this.piezas.filter(p => p !== target)
        }
        // mover la pieza seleccionada
        this.piezaSeleccionada.position.set(casilla.position.x, this.piezaSeleccionada.position.y, casilla.position.z)
        this.piezaSeleccionada.userData = { fila: destF, columna: destC }
        // limpiar y deseleccionar
        this.model.limpiarResaltado()
        this.piezaSeleccionada = null
        // restaurar cámara
        this.cameraControl.noRotate = false
        this.cameraControl.noPan = false
        // cambiar turno
        this.currentTurnTeam = this.currentTurnTeam === 'white' ? 'black' : 'white'
        return
      }
    }

    // C) Cualquier otro clic: cancelar selección
    this.model.limpiarResaltado()
    this.piezaSeleccionada = null
    this.cameraControl.noRotate = false
    this.cameraControl.noPan = false
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
