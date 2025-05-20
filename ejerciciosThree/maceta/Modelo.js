import * as THREE from '../libs/three.module.js'
import { MTLLoader } from '../libs/MTLLoader.js'
import { OBJLoader } from '../libs/OBJLoader.js'

class Maceta extends THREE.Object3D{
    constructor(){
        super();

        var materialLoader = new MTLLoader();
        var objectLoader = new OBJLoader();
        materialLoader.load('../models/plant/flower.mtl', 
            (materials) => {
                objectLoader.setMaterials(materials);
                objectLoader.load('../models/plant/flower.obj',
                    (object) => {this.add(object);
                    }, null, null);
            }
        );

    }

    update(){}
}

export { Maceta }