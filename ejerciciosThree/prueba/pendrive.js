import * as THREE from 'three'
import * as CSG from '../libs/three-bvh-csg.js'

class pendrive extends THREE.Object3D {
    constructor() {
        super();
        
        var materialBase = new THREE.MeshStandardMaterial({color: 0x0017FF});
        var materialClavija = new THREE.MeshStandardMaterial({color: 0xADADAD});

        var tamano = 0.10;

        //Construimos las geometrías
        var base = this.createBase(tamano);
        var clavija = this.createClavija(tamano);
        var hueco = this.createHueco(tamano);

        //Construimos los brush
        var baseBrush = new CSG.Brush(base, materialBase);
        var clavijaBrush = new CSG.Brush(clavija, materialClavija);
        var huecoBrush = new CSG.Brush(hueco, materialClavija);

        //Objeto evaluador
        var evaluador = new CSG.Evaluator();
        var conexion = evaluador.evaluate(clavijaBrush, huecoBrush, CSG.SUBTRACTION);
        var pen = evaluador.evaluate(conexion, baseBrush, CSG.ADDITION);

        //this.add(clavija);
        this.add(pen);
    }

    // Si no usaramos brush
    /*
    createBase(t){
        var base = new THREE.Object3D();
        
        //Siempre necesitamos una gemoetría y un material
        var baseGeometry = new THREE.BoxGeometry(t, t*0.1, t*0.3);
        var baseMaterial = new THREE.MeshStandardMaterial({color: 0x0017FF});
        //podemos crear el mesh
        var baseMesh = new THREE.Mesh(baseGeometry, baseMaterial);

        base.add(baseMesh);
        

        return base;
    }
    */
    createBase(t){
        var baseGeometry = new THREE.BoxGeometry(t, t*0.1, t*0.3);

        return baseGeometry;
    }

    createClavija(t){
        var clavijaGeometry = new THREE.BoxGeometry(t/5, t*0.07, t/5);

        clavijaGeometry.translate((t/2)+((t/5)/2), 0, 0);

        return clavijaGeometry;
    }

    createHueco(t){
        var huecoGeometry = new THREE.BoxGeometry(t/5.5, t*0.04, t/5.5);

        huecoGeometry.translate((t/2)+((t/5)/2)+((0.1*t)/5.5)/2, 0, 0);

        return huecoGeometry;
    }

    update(){}
}

export { pendrive }