import * as THREE from '../libs/three.module.js'
import * as CSG from '../libs/three-bvh-csg.js'

class Tablero extends THREE.Object3D {
    constructor() {
        super()
        this.squares = [];
        const material_blanco = new THREE.MeshStandardMaterial({ color: 0xFFFFFF });
        const material_negro = new THREE.MeshStandardMaterial({ color: 0x000000 });

        // Grupo que contiene las casillas y la pieza
        const boardGroup = new THREE.Group();

        // Geometrías para el marco
        const marco = new THREE.BoxGeometry(1.1, 0.02, 1.1);
        const marco_interior = new THREE.BoxGeometry(1.0, 0.02, 1.0);

        // Construcción de la cuadrícula
        for (let i = 0; i < 8; i++) {
            for (let j = 0; j < 8; j++) {
                const geom = new THREE.BoxGeometry(0.125, 0.02, 0.125);
                const baseMat = ((i + j) % 2 === 0) ? material_blanco : material_negro;
                const mat = baseMat.clone();
                const square = new THREE.Mesh(geom, mat);
                square.position.x = 0.0625 + j * 0.125;
                square.position.z = 0.0625 + i * 0.125;
                square.userData = { fila: i, columna: j, resaltada: false };
                boardGroup.add(square);
                this.squares.push(square);
            }
        }

        // Creación y posición de la pieza (torre)
        this.pieza = new THREE.Mesh(
            new THREE.CylinderGeometry(0.04, 0.04, 0.08, 32),
            new THREE.MeshStandardMaterial({ color: 0xff0000 })
        );
        // Posición relativa dentro de boardGroup para que coincida con (0,0)
        this.pieza.position.set(0.0625, 0.04, 0.0625);
        this.pieza.userData = { fila: 0, columna: 0 };
        boardGroup.add(this.pieza);

        // Ajuste del tablero al sistema de coordenadas global
        marco.translate(0, -0.01, 0);
        marco_interior.translate(0, -0.01, 0);
        boardGroup.position.set(-0.5, -0.01, -0.5);

        // Operación CSG para el marco
        const brush1 = new CSG.Brush(marco, material_negro);
        const brush2 = new CSG.Brush(marco_interior, material_negro);
        const evalr = new CSG.Evaluator();
        const marco_final = evalr.evaluate(brush1, brush2, CSG.SUBTRACTION);

        this.add(marco_final);
        this.add(boardGroup);
    }

    resaltarCasillasLegales(fila, columna) {
        this.limpiarResaltado();
        for (const sq of this.squares) {
            if ((sq.userData.fila === fila || sq.userData.columna === columna) &&
                !(sq.userData.fila === fila && sq.userData.columna === columna)) {
                sq.material.emissive.setHex(0x00ff00);
                sq.userData.resaltada = true;
            }
        }
    }

    limpiarResaltado() {
        for (const sq of this.squares) {
            sq.material.emissive.setHex(0x000000);
            sq.userData.resaltada = false;
        }
    }

    update() { }
}

export { Tablero };