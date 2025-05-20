import * as THREE from '../libs/three.module.js'
import * as CSG from '../libs/three-bvh-csg.js'
import { ChessPiece } from './ChessPiece.js'
import {
  RookMovement, BishopMovement, KnightMovement,
  QueenMovement, KingMovement, PawnMovement
} from './MovementStrategies.js'
import { Rey } from '../rey/Modelo.js'
import { Peon } from '../peon/Modelo.js'
import { Alfil } from '../alfil/Modelo.js'
import { Caballo } from '../caballo/Modelo.js'
import { Reina } from '../reina/Modelo.js'
import { Torre } from '../torre/Modelo.js'

class Tablero extends THREE.Object3D {
  constructor() {
    super()
    this.squares = []
    this.pieces = []

    const material_blanco = new THREE.MeshStandardMaterial({ color: 0xFFFFFF })
    const material_negro = new THREE.MeshStandardMaterial({ color: 0x000000 })
    const boardGroup = new THREE.Group()
    const marco = new THREE.BoxGeometry(1.1, 0.02, 1.1)
    const marco_interior = new THREE.BoxGeometry(1.0, 0.02, 1.0)

    // Tablero 8x8
    for (let fila = 0; fila < 8; fila++) {
      for (let col = 0; col < 8; col++) {
        const geom = new THREE.BoxGeometry(0.125, 0.02, 0.125)
        const baseMat = ((fila + col) % 2 === 0) ? material_blanco : material_negro
        const mat = baseMat.clone()
        const square = new THREE.Mesh(geom, mat)
        square.position.set(
          0.0625 + col * 0.125,
          0,
          0.0625 + fila * 0.125
        )
        square.userData = { fila, columna: col, resaltada: false }
        boardGroup.add(square)
        this.squares.push(square)
      }
    }

    const cellCenter = i => 0.0625 + i * 0.125

    // Modelos previamente instanciados

    const alfilModel = new Alfil()
    const caballoModel = new Caballo()
    const reinaModel = new Reina()
    const reyModel = new Rey()
    const peonBlanco = new Peon()
    const peonNegro = new Peon()
    const torreModel = new Torre()
    // Función para añadir piezas
    const addPiece = (model3D, strategy, fila, col, team) => {
      const piece = new ChessPiece(model3D, strategy)
      piece.userData = { fila, columna: col }
      piece.team = team
      piece.position.set(
        cellCenter(col),
        0.01,
        cellCenter(fila)
      )
      // Si es negro, rotamos 180º para que mire hacia adelante
      if (team === 'black') {
      
        piece.rotation.y = Math.PI
       
      }
      boardGroup.add(piece)
      this.pieces.push(piece)
    }

    // Colocación de piezas con instancias

    addPiece(alfilModel, new BishopMovement(), 7, 6, 'black')
    addPiece(caballoModel, new KnightMovement(), 0, 1, 'white')
    addPiece(reinaModel, new QueenMovement(), 0, 3, 'white')
    addPiece(reyModel, new KingMovement(), 0, 4, 'white')
    addPiece(torreModel, new RookMovement(), 7 , 7, 'black' )

    // Peones: clonamos modelo si queremos que sean independientes
    for (let col = 0; col < 8; col++) {
      addPiece(peonBlanco.clone(), new PawnMovement(+1), 1, col, 'white')
      addPiece(peonNegro.clone(), new PawnMovement(-1), 6, col, 'black')
    }

    boardGroup.position.set(-0.5, -0.01, -0.5)
    marco.translate(0, -0.01, 0)
    marco_interior.translate(0, -0.01, 0)
    const evalr = new CSG.Evaluator()
    const marco_final = evalr.evaluate(
      new CSG.Brush(marco, material_negro),
      new CSG.Brush(marco_interior, material_negro),
      CSG.SUBTRACTION
    )
    this.add(marco_final)
    this.add(boardGroup)
  }

  getSquare(fila, columna) {
    return this.squares[fila * 8 + columna]
  }

  resaltarCasillasLegales(pieza) {
    this.limpiarResaltado()
    for (const sq of pieza.getLegalMoves(this)) {
      sq.material.emissive.setHex(0x00ff00)
      sq.userData.resaltada = true
    }
  }

  limpiarResaltado() {
    for (const sq of this.squares) {
      sq.material.emissive.setHex(0x000000)
      sq.userData.resaltada = false
    }
  }

  getPiece(fila, columna) {
    return this.pieces.find(p =>
      p.userData.fila === fila &&
      p.userData.columna === columna
    ) || null
  }

  update() { }
}

export { Tablero }