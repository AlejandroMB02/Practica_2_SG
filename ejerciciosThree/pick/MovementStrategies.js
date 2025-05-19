class MovementStrategy {
    /**
     * @param {number} fila - fila actual de la pieza (0-7)
     * @param {number} col - columna actual de la pieza (0-7)
     * @param {Tablero} board - instancia del tablero que incluye squares 2D
     * @returns {Array.<THREE.Mesh>} lista de casillas legales
     */
    getLegalMoves(fila, col, board) {
        throw new Error("Implementar en la subclase");
    }
}

// Estrategia para torre
class RookMovement extends MovementStrategy {
    getLegalMoves(fila, col, board) {
        const moves = [];
        // 4 direcciones (df,dc)
        const dirs = [
            [1, 0], [-1, 0],
            [0, 1], [0, -1]
        ];
        for (const [df, dc] of dirs) {
            let i = fila + df, j = col + dc;
            while (i >= 0 && i < 8 && j >= 0 && j < 8) {
                const sq = board.getSquare(i, j);
                // ¿está ocupada?
                const occupied = board.pieces.some(p =>
                    p.userData.fila === i &&
                    p.userData.columna === j
                );
                if (occupied) {
                    break;  // ¡corta la dirección!
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
    getLegalMoves(fila, col, board) {
        const moves = [];
        // 4 diagonales
        const dirs = [
            [1, 1], [1, -1],
            [-1, 1], [-1, -1]
        ];
        for (const [df, dc] of dirs) {
            let i = fila + df, j = col + dc;
            while (i >= 0 && i < 8 && j >= 0 && j < 8) {
                const sq = board.getSquare(i, j);
                const occupied = board.pieces.some(p =>
                    p.userData.fila === i &&
                    p.userData.columna === j
                );
                if (occupied) {
                    break;
                }
                moves.push(sq);
                i += df; j += dc;
            }
        }
        return moves;
    }
}

export { MovementStrategy, RookMovement, BishopMovement };
