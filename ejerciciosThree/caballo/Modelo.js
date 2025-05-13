import * as THREE from '../libs/three.module.js';
import { Lapiz } from '../lapiz/Modelo.js';
import { Regla } from './Regla.js'; 
import * as CSG from '../libs/three-bvh-csg.js'

class Caballo extends THREE.Object3D {
    constructor() {
        super();

        var lanza = new Lapiz();
        lanza.rotateX(Math.PI/2);
        lanza.position.set(0, -0.01, 0);
        const loader = new THREE.TextureLoader();
                const texturaMadera = loader.load('./Texturas/madera.jpeg');
        
                const materialMadera = new THREE.MeshStandardMaterial({
                    map: texturaMadera,
                    roughness: 0.4
                });
        var pierna = new THREE.BoxGeometry(0.005, 0.1, 0.01);
        var pierna1 = new THREE.BoxGeometry(0.005, 0.1, 0.01);
        var pierna2 = new THREE.BoxGeometry(0.005, 0.1, 0.01);
        var pierna3 = new THREE.BoxGeometry(0.005, 0.1, 0.01);
        pierna.rotateZ(Math.PI / 2);
        pierna1.rotateZ(Math.PI / 2);
        pierna2.rotateZ(Math.PI / 2);
        pierna3.rotateZ(Math.PI / 2);
        pierna.translate(-0.04, -0.005, 0.04);
        pierna1.translate(-0.04, 0.005, -0.04);
        pierna2.translate(-0.04, -0.005, -0.04);
        pierna3.translate(-0.04, 0.005, 0.04);

        var pierna1_brush = new CSG.Brush(pierna, materialMadera);
        var pierna2_brush = new CSG.Brush(pierna1, materialMadera); 
        var pierna3_brush = new CSG.Brush(pierna2, materialMadera);
        var pierna4_brush = new CSG.Brush(pierna3, materialMadera);
        var evaluador = new CSG.Evaluator();
        var pierna1fig = evaluador.evaluate(pierna1_brush, pierna2_brush, CSG.ADDITION);
        var pierna2fig = evaluador.evaluate(pierna1fig, pierna4_brush, CSG.ADDITION);
        var pierna3fig = evaluador.evaluate(pierna2fig, pierna3_brush, CSG.ADDITION);
        
        var material_negro_brillante = new THREE.MeshPhongMaterial({
            color: 0x000000,
            emissive: 0x072534,
            specular: 0xffffff, // Color del reflejo especular
            shininess: 100,    // Nivel de brillo (0 a 100)
            flatShading: false
});

//Geometrias
var ojo_izq = new THREE.SphereGeometry(0.005, 50, 50);
var ojo_der = new THREE.SphereGeometry(0.005, 50, 50);

//Transformaciones
ojo_izq.scale(1,1.5,1);
ojo_der.scale(1,1.5,1);
ojo_izq.translate(-0.006, 0.045, 0.06);
ojo_der.translate(0.006, 0.045, 0.06);
ojo_der.rotateZ(-Math.PI/2);
ojo_izq.rotateZ(-Math.PI/2);
//Brush
var ojo_izq_brush = new CSG.Brush(ojo_izq, material_negro_brillante);
var ojo_der_brush = new CSG.Brush(ojo_der, material_negro_brillante);
        // Crear y añadir la regla debajo del círculo de lápices
        const regla = new Regla();
        
        this.rotateZ(Math.PI / 2); // Rotar la regla para que esté en la posición correcta
        const regla2 = new Regla();
        
        regla2.rotateY(Math.PI / 3);
        regla2.translateX(-0.03);
        regla2.translateZ(0.05);
        this.add(regla);
        this.add(regla2);
        this.add(pierna3fig);
        var ojo = evaluador.evaluate(ojo_izq_brush, ojo_der_brush, CSG.ADDITION);
        this.add(ojo);

        this.add(lanza);
    }

    update() {}
}

export { Caballo };
