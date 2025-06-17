import * as THREE from 'three';

export class ShootingTarget extends THREE.Group {
  constructor() {
    super();

    // Define target dimensions
    const targetWidth = 4; // Total width (diameter) of the target
    const targetHeight = 4; // Total height of the target
    const targetDepth = 0.2; // Thickness of the target

    // Target base (white)
    const outer = new THREE.Mesh(
      new THREE.CylinderGeometry(2, 2, targetDepth, 64),
      new THREE.MeshStandardMaterial({ color: 0xffffff })
    );
    outer.rotation.x = Math.PI / 2;
    outer.receiveShadow = true;
    outer.castShadow = true;
    this.add(outer);

    // Middle ring (red)
    const middle = new THREE.Mesh(
      new THREE.CylinderGeometry(1.3, 1.3, targetDepth + 0.01, 64),
      new THREE.MeshStandardMaterial({ color: 0xff3333 })
    );
    middle.rotation.x = Math.PI / 2;
    middle.receiveShadow = true;
    middle.castShadow = true;
    this.add(middle);

    // Inner ring (blue)
    const inner = new THREE.Mesh(
      new THREE.CylinderGeometry(0.6, 0.6, targetDepth + 0.02, 64),
      new THREE.MeshStandardMaterial({ color: 0x3366ff })
    );
    inner.rotation.x = Math.PI / 2;
    inner.receiveShadow = true;
    inner.castShadow = true;
    this.add(inner);

    // Bullseye (yellow)
    const bullseye = new THREE.Mesh(
      new THREE.CylinderGeometry(0.25, 0.25, targetDepth + 0.03, 64),
      new THREE.MeshStandardMaterial({ color: 0xffff00 })
    );
    bullseye.rotation.x = Math.PI / 2;
    bullseye.receiveShadow = true;
    bullseye.castShadow = true;
    this.add(bullseye);

    // Set initial position
    this.position.set(0, 2, -20);

    // Add collision box (slightly larger than the target)
    this.collider = new THREE.Mesh(
      new THREE.BoxGeometry(4.2, 4.2, 0.3),
      new THREE.MeshBasicMaterial({ visible: false })
    );
    this.collider.rotation.x = Math.PI / 2; // Match target orientation
    this.collider.userData.isTargetCollider = true;
    this.add(this.collider);

    // Make sure target parts don't interfere with collision
    outer.userData.ignoreCollision = true;
    middle.userData.ignoreCollision = true;
    inner.userData.ignoreCollision = true;
    bullseye.userData.ignoreCollision = true;
  }

  moveLeft() {
    this.position.x = Math.max(this.position.x - 0.2, -2);
  }

  moveRight() {
    this.position.x = Math.min(this.position.x + 0.2, 2);
  }
}
