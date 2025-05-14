import * as THREE from 'three'
import * as TWEEN from 'tween'

class StraightAnimator {
  
    constructor () {
        this.from = null; // Vector3, the position attribute of the node to move. It will be modified during animation
        this.fromRef = new THREE.Vector3();  // A copy of this.from. It is used for interpolation
        this.to = null;   // A Vector3 with the destination of movement. It can be the position attribute of other node. It will not be modified.
        this.promise = null;   // For sincronization with other methods

        const begin = { t : 0.0 };
        const end = { t : 1.0 };
        this.anim = new TWEEN.Tween (begin).to (end)
          .onUpdate (() => {
            this.from.lerpVectors (this.fromRef, this.to, begin.t);
          })
          .onComplete (() => {
            if (this.promise) {
                this.promise.resolve();
            }
            begin.t = 0.0;
          })
          .easing (TWEEN.Easing.Quadratic.InOut);
    }

    setAndStart (from, to, time = 1000, promise = null) {
        // Evitamos que se relance una animación que no ha acabado aún
        if (!this.anim.isPlaying()) {
            // Seteamos la animación con los nuevos parámetros y la lanzamos
            this.from = from;
            this.fromRef.set (from.x, from.y, from.z);
            this.to = to;
            this.anim.duration (time);
            this.promise = promise;
            this.anim.start();
        } else {
            console.log ('Error: The previous animation did not finish yet');
        }
    }
}

export { StraightAnimator };
