import * as THREE from '../libs/three.module.js';
import * as CSG from '../libs/three-bvh-csg.js';

class Regla extends THREE.Group {
    constructor() {
        super();

        // Cargar textura de madera
        const loader = new THREE.TextureLoader();
        const texturaMadera = loader.load('./Texturas/madera.jpeg');

        const materialMadera = new THREE.MeshStandardMaterial({
            map: texturaMadera,
            roughness: 0.4
        });
        const materialNegro = new THREE.MeshStandardMaterial({ color: 0x000000 });

    
        // Cuerpo de la regla
        const reglaGeo = new THREE.BoxGeometry(0.05, 0.1, 0.004);
        

        // Borde de la regla
        const bordeGeo = new THREE.BoxGeometry(0.05, 0.15, 0.006);
        
        bordeGeo.translate(0, 0.01, 0);
        reglaGeo.rotateX(Math.PI / 2);
        bordeGeo.rotateX(Math.PI / 2);
        bordeGeo.rotateZ(Math.PI / 6);
        bordeGeo.translate(0.024,0,0);
        var borde_brush = new CSG.Brush(bordeGeo, materialMadera);
        var regla_brush = new CSG.Brush(reglaGeo, materialMadera);
        var evaluador = new CSG.Evaluator();
        var regla = evaluador.evaluate(regla_brush, borde_brush, CSG.SUBTRACTION);
        

        const numMarcas = 6;
        for (let i = 0; i < numMarcas; i++) {
            const marcaGeo = new THREE.BoxGeometry(0.001, 0.008, 0.001); // más larga en Y
            const y = -0.045 + i * (0.09 / (numMarcas - 1)); // repartidas verticalmente
            marcaGeo.rotateZ(Math.PI / 2);
            marcaGeo.rotateZ(Math.PI / 6);
            // Posicionar la geometría
            marcaGeo.translate(0.0175, 0, y); // en el lateral derecho (x = +0.025)
            const marcaBrush = new CSG.Brush(marcaGeo, materialNegro);
    
            // Añadir a la regla con CSG.ADDITION
            regla = evaluador.evaluate(regla, marcaBrush, CSG.ADDITION);
        }
       
           
        
        this.add(regla);
    }
}

export { Regla };
