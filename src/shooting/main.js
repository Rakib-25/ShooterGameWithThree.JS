import * as THREE from 'three';
import { World } from './systems/World.js';
import { Controls } from './systems/Controls.js';

// Main application class
class ShootingRange {
  constructor() {
    this.init();
  }

  async init() {
    // Create world
    this.world = new World();

    // Create controls
    this.controls = new Controls(
      this.world.camera,
      this.world.renderer.domElement
    );

    // Setup event listeners
    this.setupUI();

    // Start animation loop
    this.animate();
  }

  setupUI() {
    const loadingScreen = document.getElementById('loading');
    const startScreen = document.getElementById('start-screen');
    const startButton = document.getElementById('start-button');
    const infoPanel = document.getElementById('info');
    const controlsPanel = document.getElementById('controls');

    // Hide loading screen
    setTimeout(() => {
      loadingScreen.style.opacity = '0';
      setTimeout(() => {
        loadingScreen.style.display = 'none';
        startScreen.style.display = 'flex';
      }, 500);
    }, 1500);

    // Start button
    startButton.addEventListener('click', () => {
      startScreen.style.display = 'none';
      infoPanel.style.opacity = '0.5';
      controlsPanel.style.opacity = '0.5';
      this.controls.lock();
    });
  }

  animate() {
    requestAnimationFrame(() => this.animate());

    // Update controls
    const delta = this.world.clock.getDelta();
    this.controls.update(delta);

    // Render scene
    this.world.renderer.render(this.world.scene, this.world.camera);
  }
}

// Start the application
new ShootingRange();
