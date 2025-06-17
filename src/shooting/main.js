import * as THREE from 'three';
import { World } from './systems/World.js';

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

    // Physics constants
    this.arrowGravity = 0.02; // Gravity force
    this.initialArrowSpeed = 1; // Initial speed of the arrow

    this.init();
  }

  init() {
    this.setupUI();
    this.setupEventListeners();
    this.animate();
  }

  shootArrow() {
    const arrow = this.createArrow();
    arrow.position.copy(this.camera.position);

    // Get camera direction
    const direction = new THREE.Vector3();
    this.camera.getWorldDirection(direction);
    
    // Calculate initial velocity based on pitch angle
    const horizontalDirection = new THREE.Vector3(direction.x, 0, direction.z).normalize();
    const verticalAngle = this.pitch; // Camera pitch is the launch angle
    
    // Calculate velocity components using projectile motion physics
    const horizontalSpeed = this.initialArrowSpeed * Math.cos(verticalAngle);
    const verticalSpeed = this.initialArrowSpeed * Math.sin(verticalAngle);
    
    // Set initial velocity components
    arrow.userData.velocity = new THREE.Vector3(
      horizontalDirection.x * horizontalSpeed,
      verticalSpeed,
      horizontalDirection.z * horizontalSpeed
    );

    // Set initial rotation based on launch angle
    const launchDirection = horizontalDirection.clone();
    launchDirection.y = Math.tan(verticalAngle);
    arrow.quaternion.setFromUnitVectors(
      new THREE.Vector3(0, 1, 0),
      launchDirection.normalize()
    );

    this.scene.add(arrow);
    this.arrows.push(arrow);
  }


  createArrow() {
    const geometry = new THREE.CylinderGeometry(0.05, 0.05, 2, 8);
    const material = new THREE.MeshStandardMaterial({ color: 0xcccc00 });
    const arrow = new THREE.Mesh(geometry, material);
    arrow.castShadow = true;
    arrow.receiveShadow = true;
    // geometry.rotateX(Math.PI / 2); // Align cylinder to point forward
    return arrow;
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
            // Apply gravity to arrow's velocity
      arrow.userData.velocity.y -= this.arrowGravity * delta * 20;
      arrow.position.add(
        arrow.userData.velocity.clone().multiplyScalar(delta * 20)
      );

            // NEW: Update arrow rotation to match velocity direction
      if (arrow.userData.velocity.lengthSq() > 0.01) {
        const velocityDirection = arrow.userData.velocity.clone().normalize();
        arrow.quaternion.setFromUnitVectors(
          new THREE.Vector3(0, 1, 0), // Original cylinder orientation
          velocityDirection
        );
      }

      // Remove arrow if too far
      if (arrow.position.distanceTo(this.camera.position) > 100 || arrow.position.y < 0) {
        this.scene.remove(arrow);
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
