import * as THREE from 'three';

export class Arrow extends THREE.Mesh {
  constructor() {
    const geometry = new THREE.CylinderGeometry(0.05, 0.05, 2, 8);
    const material = new THREE.MeshStandardMaterial({
      color: 0xcccc00,
      metalness: 0.5,
      roughness: 0.7,
    });

    super(geometry, material);

    // Rotate to point forward (cylinder is initially vertical)
    this.rotation.x = Math.PI / 2;

    // Physics properties
    this.velocity = new THREE.Vector3();
    this.isActive = true;
    this.damage = 10;

    // Enable shadows
    this.castShadow = true;
    this.receiveShadow = true;
  }

  update(delta) {
    if (!this.isActive) return;


    // Apply velocity
    this.position.add(this.velocity.clone().multiplyScalar(delta * 20));



    // Rotate arrow based on velocity
    if (this.velocity.lengthSq() > 0.01) {
      this.lookAt(this.position.clone().add(this.velocity));
    }
  }

  dispose() {
    this.geometry.dispose();
    this.material.dispose();
    this.isActive = false;
  }
}
