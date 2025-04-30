import * as THREE from '../libs/three.module.js'
import * as CSG from '../libs/three-bvh-csg.js'

class Lapiz extends THREE.Object3D{
    constructor(){
        super()

        var material_amarillo = new THREE.MeshStandardMaterial({color: 0xFBFF00});
        var material_madera = new THREE.MeshStandardMaterial({color: 0xCB9C5E});
        var material_negro = new THREE.MeshStandardMaterial({color: 0x000000});

        //Geometrias
        var cuerpo_lapiz = new THREE.CylinderGeometry(0.007, 0.007, 0.2, 6);
        var cuerpo_lapiz_2 = new THREE.CylinderGeometry(0.007, 0.007, 0.2, 6);
        var madera = new THREE.CylinderGeometry(0.002, 0.01, 0.02, 30);
        var punta = new THREE.CylinderGeometry(0, 0.002, 0.004, 30);

        //Transformaciones
        madera.translate(0,0.1095,0);
        cuerpo_lapiz.translate(0,0.1095,0);
        punta.translate(0,0.1215,0);

        //Brush
        var cuerpo_lapiz_brush = new CSG.Brush(cuerpo_lapiz, material_amarillo);
        var madera_brush = new CSG.Brush(madera, material_madera);
        var cuerpo_lapiz_2_brush = new CSG.Brush(cuerpo_lapiz_2, material_amarillo);
        var punta_brush = new CSG.Brush(punta, material_negro);

        //Operaciones
        var evaluador = new CSG.Evaluator();
        var punta_madera = evaluador.evaluate(cuerpo_lapiz_brush, madera_brush, CSG.INTERSECTION);
        var lapiz_no_punta = evaluador.evaluate(punta_madera, cuerpo_lapiz_2_brush, CSG.ADDITION);
        var lapiz = evaluador.evaluate(lapiz_no_punta, punta_brush, CSG.ADDITION);

        this.add(lapiz);
    }
    update(){}
}

export { Lapiz }