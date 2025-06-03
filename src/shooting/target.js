import * as THREE from 'three';

/**
 * Dart shooting target as a class component (extends THREE.Group).
 */
export class ShootingTarget extends THREE.Group {
  constructor() {
    super();

    // Target base (white)
    const outer = new THREE.Mesh(
      new THREE.CylinderGeometry(2, 2, 0.2, 64),
      new THREE.MeshStandardMaterial({ color: 0xffffff })
    );
    outer.rotation.x = Math.PI / 2;
    outer.receiveShadow = true;
    this.add(outer);

    // Middle ring (red)
    const middle = new THREE.Mesh(
      new THREE.CylinderGeometry(1.3, 1.3, 0.21, 64),
      new THREE.MeshStandardMaterial({ color: 0xff3333 })
    );
    middle.rotation.x = Math.PI / 2;
    this.add(middle);

    // Inner ring (blue)
    const inner = new THREE.Mesh(
      new THREE.CylinderGeometry(0.6, 0.6, 0.22, 64),
      new THREE.MeshStandardMaterial({ color: 0x3366ff })
    );
    inner.rotation.x = Math.PI / 2;
    this.add(inner);

    // Bullseye (yellow)
    const bullseye = new THREE.Mesh(
      new THREE.CylinderGeometry(0.25, 0.25, 0.23, 64),
      new THREE.MeshStandardMaterial({ color: 0xffff00 })
    );
    bullseye.rotation.x = Math.PI / 2;
    this.add(bullseye);

    // Set initial position
    this.position.set(0, 2, -20);
  }

  moveLeft() {
    this.position.x = Math.max(this.position.x - 0.2, -2);
  }

  moveRight() {
    this.position.x = Math.min(this.position.x + 0.2, 2);
  }
}
