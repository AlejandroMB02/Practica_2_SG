import * as THREE from '../libs/three.module.js'
import * as CSG from '../libs/three-bvh-csg.js'

// Clases de mi proyecto
import { Sacapuntas } from './sacapuntas.js'
import { Lapiz } from './lapiz.js'

class Alfil extends THREE.Object3D{
    constructor(){
        super()

        var material_rosa = new THREE.MeshStandardMaterial({color: 0xE69FE6});
        var material_marron = new THREE.MeshStandardMaterial({color: 0xCB9C5E});
        var material_rojo = new THREE.MeshStandardMaterial({color: 0xFF0000});
        var material_negro = new THREE.MeshStandardMaterial({color: 0x000000});
        var material_negro_brillante = new THREE.MeshPhongMaterial({
            color: 0x000000,
            emissive: 0x072534,
            specular: 0xffffff, // Color del reflejo especular
            shininess: 100,    // Nivel de brillo (0 a 100)
            flatShading: false
        });
        const metalMaterial = new THREE.MeshStandardMaterial({
            color: 0xCCCCCC,
            roughness: 0.3,
            metalness: 0.5,
        });
        const metalQuirurgico = new THREE.MeshStandardMaterial({
            color: 0xEEEEEE,
            roughness: 0.3,
            metalness: 0.5,
        });

        //***************************************
        //Objetos complejos ya creados
        var cuerpo = new Lapiz();
        var casco = new Sacapuntas();

        casco.position.set(0.0008, 0.107+0.12, 0.01);
        cuerpo.position.set(0, 0.12, 0);
        //***************************************

        //Geometrias
        var pie_izq = new THREE.SphereGeometry(0.01, 50, 50);
        var pie_der = new THREE.SphereGeometry(0.01, 50, 50);
        var suela = new THREE.BoxGeometry(0.1, 0.1, 0.1);
        var pierna_izq = new THREE.CylinderGeometry(0.0025, 0.0025, 0.015);
        var pierna_der = new THREE.CylinderGeometry(0.0025, 0.0025, 0.015);

        var brazo_izq = new THREE.CylinderGeometry(0.0025, 0.0025, 0.015);
        var brazo_der = new THREE.CylinderGeometry(0.0025, 0.0025, 0.015);
        var mano_izq = new THREE.SphereGeometry(0.005, 50, 50);
        var mano_der = new THREE.SphereGeometry(0.005, 50, 50);

        var lanza = new THREE.CylinderGeometry(0.0017, 0.0017, 0.2);
        var cuchilla = new THREE.BoxGeometry(0.012, 0.0427, 0.0005);
        var filo = new THREE.BoxGeometry(0.012, 0.05, 0.002);
        var cuerpo_tornillo = new THREE.SphereGeometry(0.0025);
        var end_tor_ver = new THREE.BoxGeometry(0.0004, 0.0029, 0.0022);
        var end_tor_hor = new THREE.BoxGeometry(0.0029, 0.0004, 0.0022);

        //Transformaciones
        pie_izq.translate(-0.012, -0.12+0.12, 0);
        pie_der.translate(0.012, -0.12+0.12, 0);
        suela.translate(0, -0.17+0.12, 0);
        pierna_izq.translate(0,-0.0075,0);
        pierna_der.translate(0,-0.0075,0);
        pierna_izq.rotateZ(-Math.PI/8);
        pierna_der.rotateZ(Math.PI/8);
        pierna_izq.translate(-0.004,-0.098+0.12,0);
        pierna_der.translate(0.004,-0.098+0.12,0);

        brazo_der.rotateZ(Math.PI/2);
        brazo_der.translate(0.013, 0, 0);
        brazo_izq.rotateZ(-Math.PI/2);
        brazo_izq.translate(-0.013, 0, 0);
        mano_der.translate(0, -0.0075, 0);
        mano_der.rotateZ(Math.PI/2);
        mano_der.translate(0.013, 0, 0);
        mano_izq.translate(0, -0.0075, 0);
        mano_izq.rotateZ(-Math.PI/2);
        mano_izq.translate(-0.013, 0, 0);

        brazo_izq.rotateZ(Math.PI/4);
        mano_izq.rotateZ(Math.PI/4);
        brazo_izq.rotateY(Math.PI/4);
        mano_izq.rotateY(Math.PI/4);

        brazo_der.rotateZ(Math.PI/4);
        mano_der.rotateZ(Math.PI/4);
        brazo_der.rotateY(-Math.PI/4);
        mano_der.rotateY(-Math.PI/4);

        brazo_der.translate(0, 0.12,0);
        brazo_izq.translate(0, 0.12, 0);
        mano_der.translate(0, 0.12, 0);
        mano_izq.translate(0, 0.12, 0);
        ////////////////////////
        cuchilla.translate(-0.003, 0.085, 0.0017);

        filo.translate(0, 0, 0.00125);
        filo.rotateY(-0.16514877);
        filo.translate(-0.006, 0.085, 0.0017);

        cuerpo_tornillo.scale(1, 1, 0.5);
        cuerpo_tornillo.translate(0, 0.085, 0.0017);
        end_tor_ver.translate(0, 0.085, 0.0028);
        end_tor_hor.translate(0, 0.085, 0.0028);

        lanza.rotateZ(-Math.PI/6);
        lanza.translate(0, 0.004+0.12, 0.015);
        cuchilla.rotateZ(-Math.PI/6);
        cuchilla.translate(0, 0.004+0.12, 0.015);
        cuerpo_tornillo.rotateZ(-Math.PI/6);
        cuerpo_tornillo.translate(0, 0.004+0.12, 0.015);
        end_tor_ver.rotateZ(-Math.PI/6);
        end_tor_ver.translate(0, 0.004+0.12, 0.015);
        end_tor_hor.rotateZ(-Math.PI/6);
        end_tor_hor.translate(0, 0.004+0.12, 0.015);
        filo.rotateZ(-Math.PI/6);
        filo.translate(0, 0.004+0.12, 0.015);
        

        //Brush
        var pie_izq_brush = new CSG.Brush(pie_izq, material_rojo);
        var pie_der_brush = new CSG.Brush(pie_der, material_rojo);
        var suela_brush = new CSG.Brush(suela, material_rojo);
        var pierna_izq_brush = new CSG.Brush(pierna_izq, material_negro);
        var pierna_der_brush = new CSG.Brush(pierna_der, material_negro);

        var brazo_der_brush = new CSG.Brush(brazo_der, material_negro);
        var brazo_izq_brush = new CSG.Brush(brazo_izq, material_negro);
        var mano_der_brush = new CSG.Brush(mano_der, material_negro);
        var mano_izq_brush = new CSG.Brush(mano_izq, material_negro);

        var lanza_brush = new CSG.Brush(lanza, material_marron);

        var cuchilla_brush = new CSG.Brush(cuchilla, metalQuirurgico);
        var filo_brush = new CSG.Brush(filo, metalQuirurgico);
        var cuerpo_tornillo_brush = new CSG.Brush(cuerpo_tornillo, metalMaterial);
        var end_tor_ver_brush = new CSG.Brush(end_tor_ver, metalMaterial);
        var end_tor_hor_brush = new CSG.Brush(end_tor_hor, metalMaterial);

        //Operaciones
        var evaluador = new CSG.Evaluator();
        var pies = evaluador.evaluate(pie_izq_brush, pie_der_brush, CSG.ADDITION);
        var zapatos = evaluador.evaluate(pies, suela_brush, CSG.SUBTRACTION);
        var piernas = evaluador.evaluate(pierna_izq_brush, pierna_der_brush, CSG.ADDITION);
        var piernas_final = evaluador.evaluate(piernas, zapatos, CSG.ADDITION);
        var brazos = evaluador.evaluate(brazo_izq_brush, brazo_der_brush, CSG.ADDITION);
        var manos = evaluador.evaluate(mano_izq_brush, mano_der_brush, CSG.ADDITION);
        var brazos_final = evaluador.evaluate(brazos, manos, CSG.ADDITION);

        var lanza_borrar = evaluador.evaluate(lanza_brush, lanza_brush, CSG.ADDITION);

        var cuchilla_filo = evaluador.evaluate(cuchilla_brush, filo_brush, CSG.SUBTRACTION);
        var endidura = evaluador.evaluate(end_tor_ver_brush, end_tor_hor_brush, CSG.ADDITION);
        var tornillo = evaluador.evaluate(cuerpo_tornillo_brush, endidura, CSG.SUBTRACTION);
        var cuchilla_completa = evaluador.evaluate(cuchilla_filo, tornillo, CSG.ADDITION);

        this.add(casco);
        this.add(cuerpo);
        this.add(piernas_final);
        this.add(brazos_final);
        this.add(lanza_borrar);
        this.add(cuchilla_completa);
    }
    update(){}
}

export { Alfil }