import * as THREE from 'three';

export class Arrow extends THREE.Mesh {
  constructor() {
    const geometry = new THREE.CylinderGeometry(0.05, 0.05, 2, 8);
    const material = new THREE.MeshStandardMaterial({ color: 0xcccc00 });

    super(geometry, material);

    // Rotate geometry to point forward (matches createArrow())
    geometry.rotateX(Math.PI / 2);

    // Enable shadows (matches createArrow())
    this.castShadow = true;
    this.receiveShadow = true;

    // Initialize velocity (for movement in update)
    this.velocity = new THREE.Vector3();
  }

  update(delta) {
    // Basic movement (matches shootArrow() behavior)
    this.position.add(this.velocity.clone().multiplyScalar(delta * 20));
  }

  dispose() {
    this.geometry.dispose();
    this.material.dispose();
  }
}
