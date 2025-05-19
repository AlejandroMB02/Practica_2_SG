import * as THREE from '../libs/three.module.js'
import * as CSG from '../libs/three-bvh-csg.js'

class Tablero extends THREE.Object3D{
    constructor(){
        super()

        var material_blanco = new THREE.MeshStandardMaterial({color: 0xFFFFFF});
        var material_negro = new THREE.MeshStandardMaterial({color: 0x000000});

        //Grupos
        const boardGroup = new THREE.Group();

        //Geometrias
        var marco = new THREE.BoxGeometry(1.1, 0.02, 1.1);
        var marco_interior = new THREE.BoxGeometry(1, 0.02, 1);

        //Cuadrícula
        for (let i = 0; i < 8; i++) {
            for (let j = 0; j < 8; j++) {
                if(((i+j)%2) == 0){
                    const geometry = new THREE.BoxGeometry(0.125, 0.02, 0.125);
                    const square = new THREE.Mesh(geometry, material_blanco);
                    square.position.x = 0.0625 + (j*0.125);
                    square.position.z = 0.0625 + (i*0.125);
                    boardGroup.add(square);
                }
                else{
                    const geometry = new THREE.BoxGeometry(0.125, 0.02, 0.125);
                    const square = new THREE.Mesh(geometry, material_negro);
                    square.position.x = 0.0625 + (j*0.125);
                    square.position.z = 0.0625 + (i*0.125);
                    boardGroup.add(square);
                }
            }
        }

        //Transformaciones
        marco.translate(0, -0.01, 0);
        marco_interior.translate(0, -0.01, 0);
        boardGroup.position.set(-0.5, -0.01, -0.5);

        //Brush
        var marco_brush = new CSG.Brush(marco, material_negro);
        var marco_interior_brush = new CSG.Brush(marco_interior, material_negro);

        //Operaciones
        var evaluador = new CSG.Evaluator();
        var marco_final = evaluador.evaluate(marco_brush, marco_interior_brush, CSG.SUBTRACTION);

        this.add(marco_final);
        this.add(boardGroup);
    }
    update(){}
}

export { Tablero }