import * as THREE from '../libs/three.module.js'
import * as CSG from '../libs/three-bvh-csg.js'


class Reina extends THREE.Object3D{
    constructor(){
        super()

        this.material = new THREE.MeshStandardMaterial({color: 0xFF0080});
                 

        //Creamos el dibujo con un shape
        var shape = new THREE.Shape();
        //creamos una circunferencia
        shape.absarc(0, 0, 0.0009, 0, Math.PI * 2, false);
       
        //Tenemos que rotar el shape para evitar un error de este tipo de geometrías
        //¡IMPORTANTE! Añade la función que se encuentra en este código para la rotación
        shape = this.rotateShape(shape, Math.PI*2, 50);

        //Creamos el camino que seguirá la extrusión
        const camino = new THREE.CatmullRomCurve3([
            //X-Y-Z
            new THREE.Vector3(0, 0, 0),
            new THREE.Vector3(0, 0.01, 0),
            new THREE.Vector3(0, 0.012, 0.004),
            new THREE.Vector3(0, 0.01, 0.008),
            new THREE.Vector3(0, -0.005, 0.009),
            new THREE.Vector3(0, -0.01, 0.008),
            new THREE.Vector3(0, -0.012, 0.0035),
            new THREE.Vector3(0, -0.01, 0),
            new THREE.Vector3(0, -0.005, -0.002),
            new THREE.Vector3(0, 0, -0.0025),
            new THREE.Vector3(0, 0.012, -0.002),
            new THREE.Vector3(0, 0.0145, 0.0035),
            new THREE.Vector3(0, 0.012, 0.01),
            new THREE.Vector3(0, 0.0, 0.012),

        ]);
        var options = { steps: 50, curveSegments: 4, extrudePath: camino };
        
        //Creamos la geometría con el shape y el camino
        var geometry = new THREE.ExtrudeGeometry(shape, options);
        geometry.scale(0.4, 0.6, 0.4); //Escalamos la geometría para que se vea mejor
        geometry.translate(0, 0.0075, 0);
        geometry.rotateY(Math.PI/2);
        geometry.translate(-0.0014, 0, 0);
        var brush = new CSG.Brush(geometry, this.material);
        var shape2 = new THREE.Shape();
        shape2.moveTo(0.006, 0);
        shape2.lineTo(0.012, 0);
        shape2.quadraticCurveTo(0.006, 0.006, 0.008, 0.007);
        shape2.lineTo(0.006, 0.007);
        shape2.quadraticCurveTo(0.006, 0.006, 0.006, 0);
        
        //Extraemos los puntos del shape
        var points = shape2.extractPoints(50).shape;
        
        var geometria = new THREE.LatheGeometry (points, 24, 0, Math.PI*2);
        geometria.scale(0.4, 0.6, 0.4); //Escalamos la geometría para que se vea mejor
        geometria.translate(0,-0.0048+0.0075,0);
        var ojo_izq = new THREE.SphereGeometry(0.005);
        var ojo_der = new THREE.SphereGeometry(0.005);
        
        //Transformaciones
        ojo_izq.scale(0.1,0.2,0.1);
        ojo_der.scale(0.1,0.2,0.1);
        ojo_izq.translate(0-0.0014, 0.005+0.0075, 0.0005);
        ojo_der.translate(0.0032-0.0014, 0.005+0.0075, 0.0005);
        //Brush
        var material_negro_brillante = new THREE.MeshPhongMaterial({
                    color: 0x000000,
                    emissive: 0x072534,
                    specular: 0xffffff, // Color del reflejo especular
                    shininess: 100,    // Nivel de brillo (0 a 100)
                    flatShading: false
        });
        var ojo_izq_brush = new CSG.Brush(ojo_izq, material_negro_brillante);
        var ojo_der_brush = new CSG.Brush(ojo_der, material_negro_brillante);
        var base_brush = new CSG.Brush(geometria,this.material);        
        var evaluador = new CSG.Evaluator();
        var p1 = evaluador.evaluate(brush, base_brush, CSG.ADDITION);
        var p2 = evaluador.evaluate(ojo_der_brush,p1,CSG.ADDITION);
        var p3 = evaluador.evaluate(ojo_izq_brush,p2,CSG.ADDITION);

        const escala_grupo = new THREE.Group();
        escala_grupo.add(p3);
        escala_grupo.scale.set(6, 6, 6);
        this.add(escala_grupo);
    }

    //Añade esta función a tu código
    rotateShape( aShape, angle, res = 6, center = new THREE.Vector2(0, 0) ) {
        var points = aShape.extractPoints(res).shape; //Extraemos los puntos 2D del shape
        points.forEach ( ( p ) => {
        p.rotateAround ( center , angle ); //Los giramos
        });
        return new THREE.Shape ( points ); //Construimos y devolvemos un nuevo shape
    }            

    update(){}
}

export { Reina }