import * as THREE from '../libs/three.module.js'
import * as CSG from '../libs/three-bvh-csg.js'

class Sacapuntas extends THREE.Object3D{
    constructor(){
        super()

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

        //Geometrias
        var cuerpo = new THREE.BoxGeometry(0.026, 0.04, 0.02);
        var borrador_cuerpo = new THREE.BoxGeometry(0.1, 0.1, 0.02);
        var apertura_cuadrada = new THREE.BoxGeometry(0.016, 0.028, 0.014);
        var curva_apertura = new THREE.CylinderGeometry(0.008, 0.008, 0.02);
        var agarre_izq = new THREE.CylinderGeometry(0.008, 0.008, 0.02);
        var agarre_der = new THREE.CylinderGeometry(0.008, 0.008, 0.02);
        var agujero = new THREE.CylinderGeometry(0.0072, 0.0072, 0.04);
        var cuchilla = new THREE.BoxGeometry(0.012, 0.0427, 0.0005);
        var filo = new THREE.BoxGeometry(0.012, 0.0427, 0.002);
        var cuerpo_tornillo = new THREE.SphereGeometry(0.0025);
        var end_tor_ver = new THREE.BoxGeometry(0.0004, 0.0029, 0.0022);
        var end_tor_hor = new THREE.BoxGeometry(0.0029, 0.0004, 0.0022);

        //Transformaciones
        cuerpo.translate(0, 0.02, -0.01);
        borrador_cuerpo.translate(0, 0.02, 0.01);
        borrador_cuerpo.rotateX(-Math.PI/8);
        apertura_cuadrada.translate(0, 0.026, -0.009568544);
        curva_apertura.rotateX(Math.PI/2);
        curva_apertura.translate(0, 0.012, -0.006568544);
        agarre_izq.rotateX(Math.PI/2);
        agarre_der.rotateX(Math.PI/2);
        agarre_izq.scale(0.3, 1, 1);
        agarre_der.scale(0.3, 1, 1);
        agarre_izq.translate(-0.013, 0.02, -0.01);
        agarre_der.translate(0.013, 0.02, -0.01);
        agujero.translate(-0.0008, 0.02, -0.009368544);

        filo.translate(0, 0, 0.00125);
        filo.rotateY(-0.16514877);
        filo.translate(-0.003, 0, 0);

        cuerpo_tornillo.scale(1, 1, 0.5);
        cuerpo_tornillo.translate(0.003, 0, 0);
        end_tor_ver.translate(0.003, 0, 0.0011);
        end_tor_hor.translate(0.003, 0, 0.0011);


        cuchilla.translate(0, 0.0427/2, 0.00025);
        cuchilla.rotateX(-Math.PI/8);
        cuchilla.translate(0.002, 0, -0.001);
        //
        filo.translate(0, 0.0427/2, 0.00025);
        filo.rotateX(-Math.PI/8);
        filo.translate(0.002, 0, -0.001);
        //
        cuerpo_tornillo.translate(0, 0.0427/2, 0.00025);
        cuerpo_tornillo.rotateX(-Math.PI/8);
        cuerpo_tornillo.translate(0.002, 0, -0.001);
        //
        end_tor_ver.translate(0, 0.0427/2, 0.00025);
        end_tor_ver.rotateX(-Math.PI/8);
        end_tor_ver.translate(0.002, 0, -0.001);
        //
        end_tor_hor.translate(0, 0.0427/2, 0.00025);
        end_tor_hor.rotateX(-Math.PI/8);
        end_tor_hor.translate(0.002, 0, -0.001);
        

        /*
        cuerpo.translate(0, 0, 0.011);
        borrador_cuerpo.translate(0, 0, 0.011);
        */

        //Brush
        var cuerpo_brush = new CSG.Brush(cuerpo, metalMaterial);
        var borrador_brush = new CSG.Brush(borrador_cuerpo, metalMaterial);
        var apertura_cuadrada_brush = new CSG.Brush(apertura_cuadrada, metalMaterial);
        var curva_apertura_brush = new CSG.Brush(curva_apertura, metalMaterial);
        var agarre_izq_brush = new CSG.Brush(agarre_izq, metalMaterial);
        var agarre_der_brush = new CSG.Brush(agarre_der, metalMaterial);
        var agujero_brush = new CSG.Brush(agujero, metalMaterial);

        var cuchilla_brush = new CSG.Brush(cuchilla, metalQuirurgico);
        var filo_brush = new CSG.Brush(filo, metalQuirurgico);
        var cuerpo_tornillo_brush = new CSG.Brush(cuerpo_tornillo, metalMaterial);
        var end_tor_ver_brush = new CSG.Brush(end_tor_ver, metalMaterial);
        var end_tor_hor_brush = new CSG.Brush(end_tor_hor, metalMaterial);

        //Operaciones
        var evaluador = new CSG.Evaluator();
        var base = evaluador.evaluate(cuerpo_brush, borrador_brush, CSG.SUBTRACTION);
        var apertura = evaluador.evaluate(base, apertura_cuadrada_brush, CSG.SUBTRACTION);
        var apertura_final = evaluador.evaluate(apertura, curva_apertura_brush, CSG.SUBTRACTION);
        var cuerpo_izq = evaluador.evaluate(apertura_final, agarre_izq_brush, CSG.SUBTRACTION);
        var cuerpo_der = evaluador.evaluate(cuerpo_izq, agarre_der_brush, CSG.SUBTRACTION);
        var cuerpo_final = evaluador.evaluate(cuerpo_der, agujero_brush, CSG.SUBTRACTION);

        var cuchilla_filo = evaluador.evaluate(cuchilla_brush, filo_brush, CSG.SUBTRACTION);

        var endidura = evaluador.evaluate(end_tor_ver_brush, end_tor_hor_brush, CSG.ADDITION);
        var tornillo = evaluador.evaluate(cuerpo_tornillo_brush, endidura, CSG.SUBTRACTION);

        var cuchilla_completa = evaluador.evaluate(cuchilla_filo, tornillo, CSG.ADDITION);

        var final = evaluador.evaluate(cuerpo_final, cuchilla_completa, CSG.ADDITION);

        this.add(final);
        this.position.set(0.0008, 0, 0.01);
    }
    update(){}
}

export { Sacapuntas }