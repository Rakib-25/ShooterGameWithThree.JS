import * as THREE from 'three';

export class Ground extends THREE.Mesh {
  constructor() {
    const geometry = new THREE.PlaneGeometry(100, 100);
    const material = new THREE.MeshStandardMaterial({
      color: 0x2a5b7c,
      roughness: 0.8,
      metalness: 0.2,
    });

    super(geometry, material);

    this.rotation.x = -Math.PI / 2;
    this.position.y = -0.5;
    this.receiveShadow = true;
  }
}
