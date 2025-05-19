import * as THREE from '../libs/three.module.js'
import * as CSG   from '../libs/three-bvh-csg.js'
import { ChessPiece }                               from './ChessPiece.js'
import {
  RookMovement, BishopMovement, KnightMovement,
  QueenMovement, KingMovement, PawnMovement
} from './MovementStrategies.js'

class Tablero extends THREE.Object3D {
  constructor() {
    super()
    // Arrays de casillas y piezas
    this.squares = []
    this.pieces  = []

    const material_blanco = new THREE.MeshStandardMaterial({ color: 0xFFFFFF })
    const material_negro  = new THREE.MeshStandardMaterial({ color: 0x000000 })

    // Grupo para casillas y piezas
    const boardGroup = new THREE.Group()

    // Geometrías para marco
    const marco          = new THREE.BoxGeometry(1.1,  0.02, 1.1)
    const marco_interior = new THREE.BoxGeometry(1.0,  0.02, 1.0)

    // Construcción de la cuadrícula 8x8
    for (let fila = 0; fila < 8; fila++) {
      for (let col = 0; col < 8; col++) {
        const geom   = new THREE.BoxGeometry(0.125, 0.02, 0.125)
        const baseMat= ((fila + col) % 2 === 0)
          ? material_blanco
          : material_negro
        const mat    = baseMat.clone()  // instancia única
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

    // Función auxiliar: centra cada casilla y pieza
    const cellCenterX = i => 0.0625 + i * 0.125

    // === Creación de piezas modulares ===
    const addPiece = (piece, fila, col, team) => {
      piece.userData = { fila, columna: col }
      piece.team     = team
      piece.position.set(
        cellCenterX(col),
        0.04,
        cellCenterX(fila)
      )
      boardGroup.add(piece)
      this.pieces.push(piece)
    }

    // Torre blanca en a1
    addPiece(
      new ChessPiece(
        new THREE.CylinderGeometry(0.04, 0.04, 0.08, 32),
        new THREE.MeshStandardMaterial({ color: 0xff0000 }),
        new RookMovement()
      ),
      0, 0, 'white'
    )

    // Alfil negro en h8
    addPiece(
      new ChessPiece(
        new THREE.ConeGeometry(0.04, 0.08, 32),
        new THREE.MeshStandardMaterial({ color: 0x0000ff }),
        new BishopMovement()
      ),
      7, 7, 'black'
    )

    // Caballo blanco en b1
    addPiece(
      new ChessPiece(
        new THREE.BoxGeometry(0.06, 0.08, 0.06),
        new THREE.MeshStandardMaterial({ color: 0x00ff00 }),
        new KnightMovement()
      ),
      0, 1, 'white'
    )

    // Reina blanca en d1
    addPiece(
      new ChessPiece(
        new THREE.CylinderGeometry(0.04, 0.04, 0.08, 32),
        new THREE.MeshStandardMaterial({ color: 0xffff00 }),
        new QueenMovement()
      ),
      0, 3, 'white'
    )

    // Rey blanco en e1
    addPiece(
      new ChessPiece(
        new THREE.BoxGeometry(0.08, 0.08, 0.08),
        new THREE.MeshStandardMaterial({ color: 0xffffff }),
        new KingMovement()
      ),
      0, 4, 'white'
    )

    // Peones
    for (let col = 0; col < 8; col++) {
      addPiece(
        new ChessPiece(
          new THREE.CylinderGeometry(0.035, 0.035, 0.07, 16),
          new THREE.MeshStandardMaterial({ color: 0xffffff }),
          new PawnMovement(+1)
        ),
        1, col, 'white'
      )
      addPiece(
        new ChessPiece(
          new THREE.CylinderGeometry(0.035, 0.035, 0.07, 16),
          new THREE.MeshStandardMaterial({ color: 0x000000 }),
          new PawnMovement(-1)
        ),
        6, col, 'black'
      )
    }

    // Ajuste del grupo en coordenadas globales
    boardGroup.position.set(-0.5, -0.01, -0.5)

    // CSG para marco
    marco.translate(0, -0.01, 0)
    marco_interior.translate(0, -0.01, 0)
    const evalr      = new CSG.Evaluator()
    const marco_final= evalr.evaluate(
      new CSG.Brush(marco, material_negro),
      new CSG.Brush(marco_interior, material_negro),
      CSG.SUBTRACTION
    )

    this.add(marco_final)
    this.add(boardGroup)
  }

  // Retorna casilla en coordenadas (fila, columna)
  getSquare(fila, columna) {
    return this.squares[fila * 8 + columna]
  }

  // Resalta según movimientos legales de la pieza
  resaltarCasillasLegales(pieza) {
    this.limpiarResaltado()
    for (const sq of pieza.getLegalMoves(this)) {
      sq.material.emissive.setHex(0x00ff00)
      sq.userData.resaltada = true
    }
  }

  // Limpia resaltado en todas las casillas
  limpiarResaltado() {
    for (const sq of this.squares) {
      sq.material.emissive.setHex(0x000000)
      sq.userData.resaltada = false
    }
  }

  // Devuelve la pieza en (fila, columna) o null
  getPiece(fila, columna) {
    return this.pieces.find(p =>
      p.userData.fila    === fila &&
      p.userData.columna === columna
    ) || null
  }

  update() {}
}

export { Tablero }
