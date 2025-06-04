import * as THREE from 'three';
import { World } from './systems/World.js';
import { Arrow } from './components/arrow.js';

// Main application class
class ShootingRange {
  constructor() {
    // Initialize World (composition)
    this.world = new World();

    // Game Specific Properties
    this.clock = this.world.clock;
    this.camera = this.world.camera;
    this.scene = this.world.scene;
    this.renderer = this.world.renderer;

    // Game objects
    this.arrows = [];
    this.keyState = {};

    // Camera rotation variables
    this.yaw = 0;
    this.pitch = 0;
    this.sensitivity = 0.002;

    // Movement variables
    this.velocity = new THREE.Vector3();
    this.isOnGround = true;
    this.jumpRequested = false;

    // UI elements
    this.loadingScreen = null;
    this.startScreen = null;
    this.startButton = null;
    this.infoPanel = null;
    this.controlsPanel = null;

    this.init();
  }

  init() {
    this.setupUI();
    this.setupEventListeners();
    this.animate();
  }

  shootArrow() {
    const arrow = new Arrow();
    arrow.position.copy(this.camera.position);

    const direction = new THREE.Vector3();
    this.camera.getWorldDirection(direction);
    const target = this.camera.position.clone().add(direction);
    arrow.lookAt(target);

    arrow.userData.velocity = direction.clone().multiplyScalar(1);
    this.scene.add(arrow);
    this.arrows.push(arrow);
  }

  setupUI() {
    this.loadingScreen = document.getElementById('loading');
    this.startScreen = document.getElementById('start-screen');
    this.startButton = document.getElementById('start-button');
    this.infoPanel = document.getElementById('info');
    this.controlsPanel = document.getElementById('controls');

    // Hide loading screen
    setTimeout(() => {
      this.loadingScreen.style.opacity = '0';
      setTimeout(() => {
        this.loadingScreen.style.display = 'none';
        this.startScreen.style.display = 'flex';
      }, 500);
    }, 1500);

    this.startButton.addEventListener('click', () => {
      this.startScreen.style.display = 'none';
      this.infoPanel.style.opacity = '0.5';
      this.controlsPanel.style.opacity = '0.5';
      this.renderer.domElement.requestPointerLock();
    });
  }

  setupEventListeners() {
    // Pointer lock change event
    document.addEventListener('pointerlockchange', () => {
      if (document.pointerLockElement === this.renderer.domElement) {
        this.infoPanel.style.opacity = '0.5';
        this.controlsPanel.style.opacity = '0.5';
        document.addEventListener('mousemove', this.onMouseMove.bind(this));
      } else {
        this.infoPanel.style.opacity = '1';
        this.controlsPanel.style.opacity = '1';
        document.removeEventListener('mousemove', this.onMouseMove.bind(this));
      }
    });

    // Keyboard events
    window.addEventListener('keydown', (event) => {
      const key = event.key.toLowerCase();
      this.keyState[key] = true;

      if (key === ' ' && this.isOnGround) {
        this.jumpRequested = true;
      }

      if (key === 'enter' && !document.pointerLockElement) {
        this.renderer.domElement.requestPointerLock();
      }
    });

    window.addEventListener('keyup', (event) => {
      this.keyState[event.key.toLowerCase()] = false;
    });

    // Window resize
    window.addEventListener('resize', () => {
      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(window.innerWidth, window.innerHeight);
    });

    this.renderer.domElement.addEventListener('mousedown', (event) => {
      if (document.pointerLockElement === this.renderer.domElement) {
        this.shootArrow();
      }
    });
  }

  handleMovement(delta) {
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
      moveSpeed *= 2;
    }

    // Apply movement
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

    // Apply velocity
    this.camera.position.add(this.velocity.clone().multiplyScalar(delta * 60));

    // Ground collision
    if (this.camera.position.y < 1) {
      this.camera.position.y = 1;
      this.velocity.y = 0;
      this.isOnGround = true;
    }

    // Apply damping
    this.velocity.multiplyScalar(0.9);

    // Reset velocity if too small
    if (this.velocity.length() < 0.001) {
      this.velocity.set(0, 0, 0);
    }
  }

  animate() {
    requestAnimationFrame(() => this.animate());

    const delta = Math.min(0.1, this.clock.getDelta());

    // Handle player movement
    this.handleMovement(delta);

    // Move arrows
    for (let i = this.arrows.length - 1; i >= 0; i--) {
      const arrow = this.arrows[i];
      arrow.position.add(
        arrow.userData.velocity.clone().multiplyScalar(delta * 20)
      );

      // Remove arrow if too far
      if (arrow.position.distanceTo(this.camera.position) > 100) {
        this.scene.remove(arrow);

        if (typeof arrow.dispose === 'function') {
          arrow.dispose(); // Free geometry/material GPU memory
        }

        this.arrows.splice(i, 1);
      }
    }

    this.renderer.render(this.scene, this.camera);
  }

  onMouseMove(event) {
    this.yaw -= event.movementX * this.sensitivity;
    this.pitch -= event.movementY * this.sensitivity;
    this.pitch = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, this.pitch));
    this.camera.rotation.set(this.pitch, this.yaw, 0, 'YXZ');
  }
}

// Start the application
new ShootingRange();
