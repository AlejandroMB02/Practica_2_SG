// MovementStrategies.js
import * as THREE from '../libs/three.module.js';
/**
 * Interfaz base para estrategias de movimiento.
 */
class MovementStrategy {
  /**
   * @param {number} fila - fila actual de la pieza (0-7)
   * @param {number} col - columna actual de la pieza (0-7)
   * @param {Tablero} board - instancia del tablero
   * @param {ChessPiece} piece - la pieza que se mueve
   * @returns {Array.<THREE.Mesh>} casillas legales
   */
  getLegalMoves(fila, col, board, piece) {
    throw new Error("Implementar en la subclase");
  }
}

// Estrategia para torre
class RookMovement extends MovementStrategy {
  getLegalMoves(fila, col, board, piece) {
    const moves = [];
    const dirs = [ [1,0], [-1,0], [0,1], [0,-1] ];
    for (const [df, dc] of dirs) {
      let i = fila + df, j = col + dc;
      while (i >= 0 && i < 8 && j >= 0 && j < 8) {
        const sq = board.getSquare(i, j);
        const ocup = board.getPiece(i, j);
        if (ocup) {
          if (ocup.team !== piece.team) moves.push(sq);
          break;
        }
        moves.push(sq);
        i += df; j += dc;
      }
    }
    return moves;
  }
}

// Estrategia para alfil
class BishopMovement extends MovementStrategy {
  getLegalMoves(fila, col, board, piece) {
    const moves = [];
    const dirs = [ [1,1], [1,-1], [-1,1], [-1,-1] ];
    for (const [df, dc] of dirs) {
      let i = fila + df, j = col + dc;
      while (i >= 0 && i < 8 && j >= 0 && j < 8) {
        const sq = board.getSquare(i, j);
        const ocup = board.getPiece(i, j);
        if (ocup) {
          if (ocup.team !== piece.team) moves.push(sq);
          break;
        }
        moves.push(sq);
        i += df; j += dc;
      }
    }
    return moves;
  }
}

// Estrategia para caballo
class KnightMovement extends MovementStrategy {
  getLegalMoves(fila, col, board, piece) {
    const moves = [];
    const deltas = [ [2,1],[2,-1],[-2,1],[-2,-1],[1,2],[1,-2],[-1,2],[-1,-2] ];
    for (const [df, dc] of deltas) {
      const i = fila + df, j = col + dc;
      if (i >= 0 && i < 8 && j >= 0 && j < 8) {
        const sq = board.getSquare(i, j);
        const ocup = board.getPiece(i, j);
        if (!ocup) {
          moves.push(sq);
        } else if (ocup.team !== piece.team) {
          moves.push(sq);
        }
      }
    }
    return moves;
  }
}

// Estrategia para reina (combina torre y alfil)
class QueenMovement extends MovementStrategy {
  getLegalMoves(fila, col, board, piece) {
    const moves = [];
    const dirs = [ [1,0],[-1,0],[0,1],[0,-1],[1,1],[1,-1],[-1,1],[-1,-1] ];
    for (const [df, dc] of dirs) {
      let i = fila + df, j = col + dc;
      while (i >= 0 && i < 8 && j >= 0 && j < 8) {
        const sq = board.getSquare(i, j);
        const ocup = board.getPiece(i, j);
        if (ocup) {
          if (ocup.team !== piece.team) moves.push(sq);
          break;
        }
        moves.push(sq);
        i += df; j += dc;
      }
    }
    return moves;
  }
}

// Estrategia para rey
class KingMovement extends MovementStrategy {
  getLegalMoves(fila, col, board, piece) {
    const moves = [];
    const deltas = [ [1,0],[-1,0],[0,1],[0,-1],[1,1],[1,-1],[-1,1],[-1,-1] ];
    for (const [df, dc] of deltas) {
      const i = fila + df, j = col + dc;
      if (i >= 0 && i < 8 && j >= 0 && j < 8) {
        const sq = board.getSquare(i, j);
        const ocup = board.getPiece(i, j);
        if (!ocup) {
          moves.push(sq);
        } else if (ocup.team !== piece.team) {
          moves.push(sq);
        }
      }
    }
    return moves;
  }
}

// Estrategia para peón
class PawnMovement extends MovementStrategy {
  /**
   * @param {number} direction +1 para avanzar en filas crecientes, -1 para filas decrecientes
   */
  constructor(direction) {
    super();
    this.dir = direction;
    this.startRow = direction > 0 ? 1 : 6;
  }
  getLegalMoves(fila, col, board, piece) {
    const moves = [];
    const forward = fila + this.dir;
    // avance simple
    if (forward >= 0 && forward < 8) {
      const ocupF = board.getPiece(forward, col);
      if (!ocupF) {
        moves.push(board.getSquare(forward, col));
        // avance doble
        const twoForward = fila + 2*this.dir;
        if (fila === this.startRow && twoForward>=0 && twoForward<8) {
          const ocupTF = board.getPiece(twoForward, col);
          if (!ocupTF && !ocupF) {
            moves.push(board.getSquare(twoForward, col));
          }
        }
      }
    }
    // capturas diagonales
    for (const dc of [-1,1]) {
      const i = fila + this.dir, j = col + dc;
      if (i>=0 && i<8 && j>=0 && j<8) {
        const ocup = board.getPiece(i, j);
        if (ocup && ocup.team !== piece.team) {
          moves.push(board.getSquare(i, j));
        }
      }
    }
    return moves;
  }
}

export {
  MovementStrategy,
  RookMovement,
  BishopMovement,
  KnightMovement,
  QueenMovement,
  KingMovement,
  PawnMovement
};
