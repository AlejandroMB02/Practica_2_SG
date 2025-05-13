import * as THREE from '../libs/three.module.js'

// Clases de mi proyecto
import { Rey } from '../rey/Modelo.js'
import { Peon } from '../peon/Modelo.js'
import { Alfil } from '../alfil/Modelo.js'
import { Caballo } from '../caballo/Modelo.js'

class Modelo extends THREE.Object3D{
    constructor(){
        super()

        var rey = new Rey();
        var alfil = new Alfil();
        var peon = new Peon();
        var caballo = new Caballo();

        rey.position.set(-0.15, 0, 0);
        alfil.position.set(0.05, 0, 0);
        peon.position.set(0.15, 0, 0);
        caballo.position.set(-0.05, 0, 0);

        this.add(rey);
        this.add(alfil);
        this.add(peon);
        this.add(caballo);
    }
    update(){}
}

export { Modelo }