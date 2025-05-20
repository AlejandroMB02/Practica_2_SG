import * as THREE from '../libs/three.module.js'
import * as CSG from '../libs/three-bvh-csg.js'

// Clases de mi proyecto
import { Corona } from './corona.js'
import { Pegamento } from './pegamento.js'

class Rey extends THREE.Object3D{
    constructor(){
        super()

        var material_amarillo = new THREE.MeshStandardMaterial({color: 0xFBFF00});
        var material_madera = new THREE.MeshStandardMaterial({color: 0xCB9C5E});
        var material_gris = new THREE.MeshStandardMaterial({color: 0xA0A0A0});
        var material_negro_brillante = new THREE.MeshPhongMaterial({
                    color: 0x000000,
                    emissive: 0x072534,
                    specular: 0xffffff, // Color del reflejo especular
                    shininess: 100,    // Nivel de brillo (0 a 100)
                    flatShading: false
        });

        //Geometrias
        var ojo_izq = new THREE.SphereGeometry(0.005);
        var ojo_der = new THREE.SphereGeometry(0.005);

        var base_bigote_izq = new THREE.SphereGeometry(0.005);
        var base_bigote_der = new THREE.SphereGeometry(0.005);

        var cuerpo_bigote_izq = new THREE.CylinderGeometry(0.0005, 0.006, 0.01);
        var cuerpo_bigote_der = new THREE.CylinderGeometry(0.0005, 0.006, 0.01);
        var uni_izq = new THREE.CylinderGeometry(0.005, 0.005, 0.01);
        var uni_der = new THREE.CylinderGeometry(0.005, 0.005, 0.01);
        
        //Objetos complejos ya creados
        var cuerpo = new Pegamento();
        var corona = new Corona();

        //Transformaciones
        corona.position.set(0, 0.085+0.065, 0);
        cuerpo.position.set(0, 0.065, 0);

        ojo_izq.scale(1,1.5,1);
        ojo_der.scale(1,1.5,1);
        ojo_izq.translate(-0.01, 0.025+0.065, 0.016);
        ojo_der.translate(0.01, 0.025+0.065, 0.016);

        base_bigote_izq.translate(-0.0026, 0.013+0.065, 0.019);
        base_bigote_der.translate(0.0026, 0.013+0.065, 0.019);
        cuerpo_bigote_izq.translate(0, 0.005, 0);
        cuerpo_bigote_der.translate(0, 0.005, 0);
        cuerpo_bigote_izq.rotateZ(Math.PI/3);
        cuerpo_bigote_der.rotateZ(-Math.PI/3);
        cuerpo_bigote_izq.translate(-0.0026, 0.013+0.065, 0.019);
        cuerpo_bigote_der.translate(0.0026, 0.013+0.065, 0.019);

        uni_izq.translate(0, 0.005, 0);
        uni_der.translate(0, 0.005, 0);
        uni_izq.rotateZ(Math.PI/3);
        uni_der.rotateZ(-Math.PI/3);
        uni_izq.translate(-0.0026, 0.013+0.065, 0.019);
        uni_der.translate(0.0026, 0.013+0.065, 0.019);

        //Brush
        var ojo_izq_brush = new CSG.Brush(ojo_izq, material_negro_brillante);
        var ojo_der_brush = new CSG.Brush(ojo_der, material_negro_brillante);

        var base_bigote_izq_brush = new CSG.Brush(base_bigote_izq, material_gris);
        var base_bigote_der_brush = new CSG.Brush(base_bigote_der, material_gris);
        var cuerpo_bigote_izq_brush = new CSG.Brush(cuerpo_bigote_izq, material_gris);
        var cuerpo_bigote_der_brush = new CSG.Brush(cuerpo_bigote_der, material_gris);
        var uni_izq_brush = new CSG.Brush(uni_izq, material_gris);
        var uni_der_brush = new CSG.Brush(uni_der, material_gris);

        //Operaciones
        var evaluador = new CSG.Evaluator();
        var ojo = evaluador.evaluate(ojo_izq_brush, ojo_der_brush, CSG.ADDITION);
        var baseBigote = evaluador.evaluate(base_bigote_izq_brush, base_bigote_der_brush, CSG.ADDITION);
        var cuerpoBigote = evaluador.evaluate(cuerpo_bigote_izq_brush, cuerpo_bigote_der_brush, CSG.ADDITION);
        var union = evaluador.evaluate(uni_izq_brush, uni_der_brush, CSG.ADDITION);
        var interseccion = evaluador.evaluate(union, cuerpoBigote, CSG.INTERSECTION);
        var bigote = evaluador.evaluate(baseBigote, interseccion, CSG.ADDITION);

        this.add(corona);
        this.add(cuerpo);
        this.add(ojo);
        this.add(bigote);
    }
    update(){}
}

export { Rey }