
import * as THREE from 'three'
import * as TWEEN from 'tween'
import { StraightAnimator } from './Animator.js';

class Cajas extends THREE.Object3D {
  constructor(gui,titleGui) {
    super();
    
    // Se crea la parte de la interfaz que corresponde a las cajas
    this.createGUI(gui,titleGui);
    
    const materialR = new THREE.MeshStandardMaterial({color: 0xCF0000});
    const materialV = new THREE.MeshStandardMaterial({color: 0x00CF00});

    const tamano = 0.04; 
    const geom = new THREE.BoxGeometry (tamano, tamano, tamano);
    // Nos interesa que el origen de coordenadas local este en el centro DE LA BASE
    // Como la caja se ha creado con el origen centrado,
    // subimos la caja la caja la mitad de su altura
    geom.translate (0, tamano/2, 0);
    
    this.cajaR = new THREE.Mesh (geom, materialR);
    this.add (this.cajaR);

    // Reutilizamos la geometría
    this.cajaV = new THREE.Mesh (geom, materialV);
    // La separamos un poco de la roja, como posición inicial
    this.cajaV.position.z = tamano*2;
    this.add (this.cajaV);

    // Creamos una única animación Tween a compartir por ambas cajas 
    // y para todas las animaciones que ejecutemos
    // Reusaremos este objeto Tween todas las veces
    this.anim = new StraightAnimator ();
    
    // Necesitamos un Vector3 para indicar el final del recorrido en cada animación
    this.finPos = new THREE.Vector3();
  
  }
  
  createGUI (gui,titleGui) {
    // Controles para mover las cajas
    this.guiControls = {
      x : 0,  // x, z: la posición de destino de cada animación sobre el suelo
      z : 0,
      t : 1000,   // El tiempo (en milisegundos) que va a tardar
      roja : () => {
        var wait = $.Deferred();
        this.pos = this.cajaR.position;
        this.finPos.x = this.guiControls.x;
        this.finPos.z = this.guiControls.z;
        this.anim.setAndStart(this.pos, this.finPos, this.guiControls.t, wait);
        wait.done (() => {
          console.log ('Este mensaje no sale hasta que la animación termine');
          console.log ('En general, este bloque no se ejecuta hasta que se resuelva la "promesa"');
        });
        console.log ('Este mensaje NO espera a que acabe la animación');
      },
      verde : () => {
        // Para la caja verde no mostramos ejemplos de sincronización
        this.pos = this.cajaV.position;
        this.finPos.x = this.guiControls.x;
        this.finPos.z = this.guiControls.z;
        this.anim.setAndStart(this.pos, this.finPos, this.guiControls.t);
      }
    } 
    
    // Se crea una sección para los controles de la caja
    var folder = gui.addFolder (titleGui);
    folder.add (this.guiControls, 'x', -0.2, 0.2, 0.01).name('X: ');
    folder.add (this.guiControls, 'z', -0.2, 0.2, 0.01).name('Z: ');
    folder.add (this.guiControls, 't', 500, 5000, 100).name('Tiempo: ');
    folder.add (this.guiControls, 'roja').name ('[Roja]');
    folder.add (this.guiControls, 'verde').name ('[Verde]');
  }
  
  
  update () {
    TWEEN.update();
  }
}

export { Cajas }
