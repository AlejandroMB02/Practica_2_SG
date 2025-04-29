import * as THREE from '../libs/three.module.js'

class MyCone extends THREE.Object3D{
    constructor(){
        super();

        var coneGeom = new THREE.ConeGeometry (1, 1, 6);
        var coneMat = new THREE.MeshStandardMaterial({color: 0xCF0000});

        var cone = new THREE.Mesh(coneGeom, coneMat);
    }
}