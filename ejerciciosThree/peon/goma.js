import * as THREE from '../libs/three.module.js'
import * as CSG from '../libs/three-bvh-csg.js'

class Goma extends THREE.Object3D{
    constructor(){
        super()

        var material_rosa = new THREE.MeshStandardMaterial({color: 0xE69FE6});
        var material_blanco = new THREE.MeshStandardMaterial({color: 0xF6F6F6});

        const numPuntos = 50;
        const fraccion = Math.PI/numPuntos;
        const puntos = [];
        //Geometrias
        var shape = new THREE.Shape();
        shape.moveTo(0.025, -0.05);
        shape.lineTo (0.025, 0.025);
        for(let i = 1; i < numPuntos; i++){
            var x_aux = 0.025*Math.cos(fraccion*i);
            var y_aux = 0.025+(0.025*Math.sin(fraccion*i));
            puntos.push(new THREE.Vector2(x_aux, y_aux));
        }
        shape.splineThru(puntos);
        shape.lineTo(-0.025, -0.05);
        shape.moveTo(0.025, -0.05);
        var options = { depth: 0.02, steps: 2, curveSegments : 4, bevelThickness: 0.005 , bevelSize: 0.005 , bevelSegments: 15 };
        var cuerpo = new THREE. ExtrudeGeometry ( shape , options );

        var borrador = new THREE.BoxGeometry(1, 0.1, 1);
        var borrador2 = new THREE.BoxGeometry(1, 0.1, 1);

        //Transformaciones
        cuerpo.translate(0, 0, -0.01);
        borrador.translate(0, 0.025, 0);
        borrador2.translate(0, -0.075, 0);

        //Brush
        var cuerpo_brush = new CSG.Brush(cuerpo, material_blanco);
        var cuerpo_rosa_brush = new CSG.Brush(cuerpo, material_rosa);
        var borrador_brush = new CSG.Brush( borrador, material_rosa);
        var borrador2_brush = new CSG.Brush( borrador2, material_rosa);

        //Operaciones
        var evaluador = new CSG.Evaluator();
        var parte_rosa = evaluador.evaluate(cuerpo_rosa_brush, borrador_brush, CSG.SUBTRACTION);
        var parte_gris = evaluador.evaluate(cuerpo_brush, borrador2_brush, CSG.SUBTRACTION);
        var cuerpo_final = evaluador.evaluate(parte_gris, parte_rosa, CSG.ADDITION);

        this.add(cuerpo_final);
    }
    update(){}
}

export { Goma }