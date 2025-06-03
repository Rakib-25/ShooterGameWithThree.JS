import * as THREE from 'three';

/**
 * Adds a dart shooting target to the given scene.
 * @param {THREE.Scene} scene - The THREE.js scene to add the target to.
 */
export function addShootingTarget(scene) {
  // Target base (white)
  const outer = new THREE.Mesh(
    new THREE.CylinderGeometry(2, 2, 0.2, 64),
    new THREE.MeshStandardMaterial({ color: 0xffffff })
  );
  outer.position.set(0, 2, -20);
  outer.rotation.x = Math.PI / 2;
  outer.receiveShadow = true;
  scene.add(outer);

  // Middle ring (red)
  const middle = new THREE.Mesh(
    new THREE.CylinderGeometry(1.3, 1.3, 0.21, 64),
    new THREE.MeshStandardMaterial({ color: 0xff3333 })
  );
  middle.position.set(0, 2, -20.01);
  middle.rotation.x = Math.PI / 2;
  scene.add(middle);

  // Inner ring (blue)
  const inner = new THREE.Mesh(
    new THREE.CylinderGeometry(0.6, 0.6, 0.22, 64),
    new THREE.MeshStandardMaterial({ color: 0x3366ff })
  );
  inner.position.set(0, 2, -20.02);
  inner.rotation.x = Math.PI / 2;
  scene.add(inner);

  // Bullseye (yellow)
  const bullseye = new THREE.Mesh(
    new THREE.CylinderGeometry(0.25, 0.25, 0.23, 64),
    new THREE.MeshStandardMaterial({ color: 0xffff00 })
  );
  bullseye.position.set(0, 2, -20.03);
  bullseye.rotation.x = Math.PI / 2;
  scene.add(bullseye);
}
