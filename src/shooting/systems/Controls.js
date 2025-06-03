import * as THREE from 'three';

export class Controls {
  constructor(camera, domElement) {
    this.camera = camera;
    this.domElement = domElement;

    // Movement state
    this.velocity = new THREE.Vector3();
    this.isOnGround = true;
    this.jumpRequested = false;

    // Camera rotation
    this.yaw = 0;
    this.pitch = 0;
    this.sensitivity = 0.002;

    // Key state
    this.keyState = {};

    // Setup event listeners
    this.setupEventListeners();
  }

  setupEventListeners() {
    // Pointer lock change event
    document.addEventListener('pointerlockchange', () => {
      if (document.pointerLockElement === this.domElement) {
        document.addEventListener('mousemove', this.onMouseMove);
      } else {
        document.removeEventListener('mousemove', this.onMouseMove);
      }
    });

    // Keyboard events
    window.addEventListener('keydown', (event) => {
      const key = event.key.toLowerCase();
      if (key === 'd') event.preventDefault();
      this.keyState[key] = true;

      if (key === ' ' && this.isOnGround) {
        this.jumpRequested = true;
      }

      // Toggle pointer lock with Enter key
      if (key === 'enter' && !document.pointerLockElement) {
        this.lock();
      }
    });

    window.addEventListener('keyup', (event) => {
      this.keyState[event.key.toLowerCase()] = false;
    });
  }

  onMouseMove = (event) => {
    this.yaw -= event.movementX * this.sensitivity;
    this.pitch -= event.movementY * this.sensitivity;
    this.pitch = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, this.pitch));
    this.camera.rotation.set(this.pitch, this.yaw, 0, 'YXZ');
  };

  lock() {
    this.domElement.requestPointerLock();
  }

  update(delta) {
    // Get camera direction vectors
    const forward = new THREE.Vector3(0, 0, -1).applyQuaternion(
      this.camera.quaternion
    );
    const right = new THREE.Vector3(1, 0, 0).applyQuaternion(
      this.camera.quaternion
    );

    // Ignore vertical component for movement
    forward.y = 0;
    right.y = 0;
    forward.normalize();
    right.normalize();

    // Movement speed
    let moveSpeed = 0.01;
    if (this.keyState['shift']) {
      moveSpeed *= 2; // Sprint when shift is held
    }

    // Apply movement based on key state
    if (this.keyState['w']) {
      this.velocity.add(forward.multiplyScalar(moveSpeed * delta * 60));
    }
    if (this.keyState['s']) {
      this.velocity.add(forward.multiplyScalar(-moveSpeed * delta * 60));
    }
    if (this.keyState['a']) {
      this.velocity.add(right.multiplyScalar(-moveSpeed * delta * 60));
    }
    if (this.keyState['d']) {
      this.velocity.add(right.multiplyScalar(moveSpeed * delta * 60));
    }

    // Apply gravity
    this.velocity.y -= 0.02 * delta * 60;

    // Handle jumping
    if (this.jumpRequested && this.isOnGround) {
      this.velocity.y = 0.35;
      this.isOnGround = false;
      this.jumpRequested = false;
    }

    // Apply velocity to camera position
    this.camera.position.add(this.velocity.clone().multiplyScalar(delta * 60));

    // Ground collision
    if (this.camera.position.y < 1) {
      this.camera.position.y = 1;
      this.velocity.y = 0;
      this.isOnGround = true;
    }

    // Apply damping (friction)
    this.velocity.multiplyScalar(0.9);

    // Reset velocity if it becomes too small
    if (this.velocity.length() < 0.001) {
      this.velocity.set(0, 0, 0);
    }
  }
}
