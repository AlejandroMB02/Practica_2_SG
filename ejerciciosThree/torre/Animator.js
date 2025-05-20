// RotationAnimator.js
import * as THREE from '../libs/three.module.js'
import * as TWEEN from '../libs/tween.module.js'

class RotationAnimator {

    constructor () {
        this.from = null; // THREE.Euler, the rotation attribute of the node to rotate. It will be modified during animation
        this.fromRef = new THREE.Euler(); // A copy of this.from. It is used for interpolation
        this.to = null;   // A THREE.Euler with the destination rotation. It will not be modified.
        this.promise = null; // For synchronization with other methods

        const begin = { t : 0.0 };
        const end = { t : 1.0 };
        this.anim = new TWEEN.Tween (begin).to (end)
            .onUpdate (() => {
                // Interpolate each component of the Euler angles
                // Ensure the rotation order is consistent if using non-default (XYZ)
                this.from.x = THREE.MathUtils.lerp(this.fromRef.x, this.to.x, begin.t);
                this.from.y = THREE.MathUtils.lerp(this.fromRef.y, this.to.y, begin.t);
                this.from.z = THREE.MathUtils.lerp(this.fromRef.z, this.to.z, begin.t);
            })
            .onComplete (() => {
                if (this.promise) {
                    this.promise.resolve();
                }
                begin.t = 0.0;
            })
            .easing (TWEEN.Easing.Quadratic.InOut); // Smooth interpolation
    }

    setAndStart (fromEuler, toEuler, time = 500, promise = null) {
        // fromEuler: The actual THREE.Euler object to animate (e.g., this.object.rotation)
        // toEuler: The target THREE.Euler object (a new Euler instance with desired angles)
        // time: Duration of the animation in milliseconds

        // Avoid relaunching an animation that hasn't finished yet
        if (!this.anim.isPlaying()) {
            this.from = fromEuler;
            this.fromRef.copy(fromEuler); // Copy the current rotation state
            this.to = toEuler;
            this.anim.duration(time);
            this.promise = promise;
            this.anim.start();
        } else {
            console.log ('Warning: Previous animation did not finish yet. Skipping new animation.');
            // Optionally, you could stop the current animation here if you want new animations to always override
            // this.anim.stop();
            // this.anim.start();
        }
    }
}

export { RotationAnimator };