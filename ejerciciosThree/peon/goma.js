import * as THREE from '../libs/three.module.js'
import * as CSG from '../libs/three-bvh-csg.js'

class Goma extends THREE.Object3D{
    constructor(){
        super()

        var material_rosa = new THREE.MeshStandardMaterial({color: 0xE69FE6});
        var material_blanco = new THREE.MeshStandardMaterial({color: 0xF6F6F6});

        //Geometrias
        var cuerpo_abajo = new THREE.BoxGeometry(0.05, 0.025, 0.02);
        var cuerpo_arriba = new THREE.BoxGeometry(0.05, 0.05, 0.02);
        var cabeza = new THREE.CylinderGeometry(0.025, 0.025, 0.02, 50);

        //Transformaciones
        cuerpo_abajo.translate(0,-0.0375,0);
        cabeza.rotateX(Math.PI/2);
        cabeza.translate(0,0.025,0);

        //Brush
        var cuerpo_abajo_brush = new CSG.Brush(cuerpo_abajo, material_rosa);
        var cuerpo_arriba_brush = new CSG.Brush(cuerpo_arriba, material_blanco);
        var cabeza_brush = new CSG.Brush(cabeza, material_blanco);

        //Operaciones
        var evaluador = new CSG.Evaluator();
        var cuerpo = evaluador.evaluate(cuerpo_abajo_brush, cuerpo_arriba_brush, CSG.ADDITION);
        var goma = evaluador.evaluate(cuerpo, cabeza_brush, CSG.ADDITION);

        this.add(goma);
    }
    update(){}
}

export { Goma }