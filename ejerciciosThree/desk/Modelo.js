import * as THREE from '../libs/three.module.js'
import { MTLLoader } from '../libs/MTLLoader.js'
import { OBJLoader } from '../libs/OBJLoader.js'

class Desk extends THREE.Object3D{
    constructor(){
        super();

        var materialLoader = new MTLLoader();
        var objectLoader = new OBJLoader();
        materialLoader.load('../models/desk/DeskV1.mtl', 
            (materials) => {
                objectLoader.setMaterials(materials);
                objectLoader.load('../models/desk/DeskV1.obj',
                    (object) => {this.add(object);
                    }, null, null);
            }
        );

    }

    update(){}
}

export { Desk }