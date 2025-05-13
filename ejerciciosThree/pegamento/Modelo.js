import * as THREE from '../libs/three.module.js'
import * as CSG from '../libs/three-bvh-csg.js'

class Modelo extends THREE.Object3D{
    constructor(){
        super()

        var material_gris = new THREE.MeshStandardMaterial({color: 0xC6C6C6});
        var material_rojo = new THREE.MeshStandardMaterial({color: 0xE80000});

        // Cargar textura de madera
        const loader = new THREE.TextureLoader();
        const etiqueta = loader.load('./etiqueta.png');

        const materialEtiqueta = new THREE.MeshStandardMaterial({
            map: etiqueta,
            roughness: 0
        });

        //Geometrias
        var cuerpo_central = new THREE.CylinderGeometry(0.02, 0.02, 0.1);
        var tapon = new THREE.CylinderGeometry(0.02, 0.02, 0.03);
        var rosca = new THREE.CylinderGeometry(0.02, 0.02, 0.015, 7);
        var agarre = new THREE.TorusGeometry(0.02, 0.0007, 100, 100);

        //Transformaciones
        tapon.translate(0, 0.065, 0);
        rosca.translate(0, -0.0575, 0);
        agarre.rotateX(Math.PI/2);
        agarre.translate(0, 0.055, 0);

        //Brush
        var cuerpo_central_brush = new CSG.Brush(cuerpo_central, materialEtiqueta);
        var tapon_brush = new CSG.Brush(tapon, material_rojo);
        var rosca_brush = new CSG.Brush(rosca, material_rojo);
        var agarre_brush = new CSG.Brush(agarre, material_rojo);

        //Operaciones
        var evaluador = new CSG.Evaluator();
        var cuerpo_rosca = evaluador.evaluate(cuerpo_central_brush, rosca_brush, CSG.ADDITION);
        var tapon_final = evaluador.evaluate(tapon_brush, agarre_brush, CSG.ADDITION);
        var final = evaluador.evaluate(cuerpo_rosca, tapon_final, CSG.ADDITION);

        this.add(final);
        this.rotateY(Math.PI);
    }
    update(){}
}

export { Modelo }