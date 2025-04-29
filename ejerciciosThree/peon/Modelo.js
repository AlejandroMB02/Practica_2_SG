import * as THREE from '../libs/three.module.js'
import * as CSG from '../libs/three-bvh-csg.js'

// Clases de mi proyecto
import { Goma } from './goma.js'
import { Lapiz } from './lapiz.js'

class Modelo extends THREE.Object3D{
    constructor(){
        super()

        var material_rosa = new THREE.MeshStandardMaterial({color: 0xE69FE6});
        var material_blanco = new THREE.MeshStandardMaterial({color: 0xF6F6F6});
        var material_rojo = new THREE.MeshStandardMaterial({color: 0xFF0000});
        var material_negro = new THREE.MeshStandardMaterial({color: 0x000000});
        var material_negro_brillante = new THREE.MeshPhongMaterial({
            color: 0x000000,
            emissive: 0x072534,
            specular: 0xffffff, // Color del reflejo especular
            shininess: 100,    // Nivel de brillo (0 a 100)
            flatShading: false
        });

        //***************************************
        //Objetos complejos ya creados
        var cuerpo = new Goma();
        var lanza = new Lapiz();

        lanza.scale.set(0.75,0.75,0.75);
        lanza.position.set(0.04, 0.02, 0);
        //***************************************

        //Geometrias
        var ojo_izq = new THREE.SphereGeometry(0.005, 50, 50);
        var ojo_der = new THREE.SphereGeometry(0.005, 50, 50);

        var pie_izq = new THREE.SphereGeometry(0.01, 50, 50);
        var pie_der = new THREE.SphereGeometry(0.01, 50, 50);
        var suela = new THREE.BoxGeometry(0.1, 0.1, 0.1);
        var pierna_izq = new THREE.CylinderGeometry(0.0025, 0.0025, 0.015);
        var pierna_der = new THREE.CylinderGeometry(0.0025, 0.0025, 0.015);

        var brazo_izq = new THREE.CylinderGeometry(0.0025, 0.0025, 0.015);
        var brazo_der = new THREE.CylinderGeometry(0.0025, 0.0025, 0.015);
        var mano_izq = new THREE.SphereGeometry(0.005, 50, 50);
        var mano_der = new THREE.SphereGeometry(0.005, 50, 50);

        //Transformaciones
        ojo_izq.scale(1,1.5,1);
        ojo_der.scale(1,1.5,1);
        ojo_izq.translate(-0.01, 0.025, 0.01);
        ojo_der.translate(0.01, 0.025, 0.01);

        pie_izq.translate(-0.012, -0.065, 0);
        pie_der.translate(0.012, -0.065, 0);
        suela.translate(0, -0.115, 0);
        pierna_izq.translate(-0.012,-0.05,0);
        pierna_der.translate(0.012,-0.05,0);

        brazo_der.rotateZ(Math.PI/2);
        brazo_der.translate(0.025, 0, 0);
        brazo_izq.rotateZ(-Math.PI/4);
        brazo_izq.translate(-0.025, 0, 0);
        mano_der.translate(0, -0.0075, 0);
        mano_der.rotateZ(Math.PI/2);
        mano_der.translate(0.025, 0, 0);
        mano_izq.translate(0, -0.0075, 0);
        mano_izq.rotateZ(-Math.PI/4);
        mano_izq.translate(-0.025, 0, 0);

        //Brush
        var ojo_izq_brush = new CSG.Brush(ojo_izq, material_negro_brillante);
        var ojo_der_brush = new CSG.Brush(ojo_der, material_negro_brillante);

        var pie_izq_brush = new CSG.Brush(pie_izq, material_rojo);
        var pie_der_brush = new CSG.Brush(pie_der, material_rojo);
        var suela_brush = new CSG.Brush(suela, material_rojo);
        var pierna_izq_brush = new CSG.Brush(pierna_izq, material_negro);
        var pierna_der_brush = new CSG.Brush(pierna_der, material_negro);

        var brazo_der_brush = new CSG.Brush(brazo_der, material_negro);
        var brazo_izq_brush = new CSG.Brush(brazo_izq, material_negro);
        var mano_der_brush = new CSG.Brush(mano_der, material_negro);
        var mano_izq_brush = new CSG.Brush(mano_izq, material_negro);

        //Operaciones
        var evaluador = new CSG.Evaluator();
        var ojo = evaluador.evaluate(ojo_izq_brush, ojo_der_brush, CSG.ADDITION);
        var pies = evaluador.evaluate(pie_izq_brush, pie_der_brush, CSG.ADDITION);
        var zapatos = evaluador.evaluate(pies, suela_brush, CSG.SUBTRACTION);
        var piernas = evaluador.evaluate(pierna_izq_brush, pierna_der_brush, CSG.ADDITION);
        var piernas_final = evaluador.evaluate(piernas, zapatos, CSG.ADDITION);
        var brazos = evaluador.evaluate(brazo_izq_brush, brazo_der_brush, CSG.ADDITION);
        var manos = evaluador.evaluate(mano_izq_brush, mano_der_brush, CSG.ADDITION);
        var brazos_final = evaluador.evaluate(brazos, manos, CSG.ADDITION);

        this.add(lanza);
        this.add(cuerpo);
        this.add(ojo);
        this.add(piernas_final);
        this.add(brazos_final);
    }
    update(){}
}

export { Modelo }