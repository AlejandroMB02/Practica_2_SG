// ChessPiece.js
import * as THREE from '../libs/three.module.js'
import { MovementStrategy } from './MovementStrategies.js'

/**
 * ChessPiece envuelve un gráfico y delega raycast correctamente.
 */
class ChessPiece extends THREE.Object3D {
  /**
   * @param {THREE.Object3D} model - gráfico de la pieza (puede ser Group con Meshes)
   * @param {MovementStrategy} movementStrategy
   */
  constructor(model, movementStrategy) {
    super()
    if (!(movementStrategy instanceof MovementStrategy)) {
      throw new Error('movementStrategy debe extender MovementStrategy')
    }
    this.movementStrategy = movementStrategy
    // Clonamos todo el modelo (jerarquía)
    this.graphic = model.clone(true)
    this.add(this.graphic)
    this.userData = { fila: 0, columna: 0 }
  }

  /**
   * Raycast personalizado: solo reasignamos los intersecciones nuevas a esta pieza
   */
  raycast(raycaster, intersects) {
    // Guarda longitud previa
    const prevLen = intersects.length
    // Lanza raycast sobre cada Mesh hijo
    this.graphic.traverse(child => {
      if (child.isMesh) child.raycast(raycaster, intersects)
    })
    // Reasigna solo las nuevas intersecciones a este wrapper
    for (let i = prevLen; i < intersects.length; i++) {
      intersects[i].object = this
    }
  }

  /**
   * Devuelve las casillas legales según la estrategia
   */
  getLegalMoves(board) {
    const { fila, columna } = this.userData
    return this.movementStrategy.getLegalMoves(fila, columna, board, this)
  }
}

export { ChessPiece }
