import * as THREE from '../libs/three.module.js';
import { MovementStrategy } from './MovementStrategies.js';

class ChessPiece extends THREE.Mesh {
  /**
   * @param {THREE.Geometry} geometry
   * @param {THREE.Material} material
   * @param {MovementStrategy} movementStrategy
   */
  constructor(geometry, material, movementStrategy) {
    super(geometry, material);
    if (!(movementStrategy instanceof MovementStrategy)) {
      throw new Error("movementStrategy debe extender MovementStrategy");
    }
    this.movementStrategy = movementStrategy;
    this.userData = { fila: 0, columna: 0 };
  }
  getLegalMoves(board) {
    const { fila, columna } = this.userData;
    return this.movementStrategy.getLegalMoves(fila, columna, board);
  }
}

export { ChessPiece };
