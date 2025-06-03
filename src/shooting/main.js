import * as THREE from "three";
import { World } from "./systems/World.js";
import { Controls } from "./systems/Controls.js";

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

    // Add mouse event for shooting arrows
    this.world.renderer.domElement.addEventListener("mousedown", (event) => {
      if (document.pointerLockElement === this.world.renderer.domElement) {
        shootArrow.call(this);
      }
    });

    // Start animation loop
    this.animate();
  }

  setupUI() {
    const loadingScreen = document.getElementById("loading");
    const startScreen = document.getElementById("start-screen");
    const startButton = document.getElementById("start-button");
    const infoPanel = document.getElementById("info");
    const controlsPanel = document.getElementById("controls");

    // Hide loading screen
    setTimeout(() => {
      loadingScreen.style.opacity = "0";
      setTimeout(() => {
        loadingScreen.style.display = "none";
        startScreen.style.display = "flex";
      }, 500);
    }, 1500);

    // Start button
    startButton.addEventListener("click", () => {
      startScreen.style.display = "none";
      infoPanel.style.opacity = "0.5";
      controlsPanel.style.opacity = "0.5";
      this.controls.lock();
    });
  }

  animate() {
    requestAnimationFrame(() => this.animate());

    // Update controls
    const delta = this.world.clock.getDelta();
    this.controls.update(delta);

    // Move arrows
    for (let i = arrows.length - 1; i >= 0; i--) {
      const arrow = arrows[i];
      arrow.position.add(
        arrow.userData.velocity.clone().multiplyScalar(delta * 10)
      ); // Adjust speed multiplier as needed
      // Remove arrow if too far
      if (arrow.position.distanceTo(this.world.camera.position) > 100) {
        this.world.scene.remove(arrow);
        arrows.splice(i, 1);
      }
    }

    // Render scene
    this.world.renderer.render(this.world.scene, this.world.camera);
  }
}

// --- Arrow shooting logic ---

function createArrow() {
  const geometry = new THREE.CylinderGeometry(0.05, 0.05, 2, 8);
  geometry.rotateX(Math.PI / 2); // Align cylinder to point forward (z+)
  const material = new THREE.MeshStandardMaterial({ color: 0xcccc00 });
  const arrow = new THREE.Mesh(geometry, material);
  arrow.castShadow = true;
  arrow.receiveShadow = true;
  return arrow;
}

let arrows = [];

function shootArrow() {
  const arrow = createArrow();
  // Start at camera position
  arrow.position.copy(this.world.camera.position);
  // Get camera forward direction
  const direction = new THREE.Vector3();
  this.world.camera.getWorldDirection(direction);
  // Look in the same direction as the camera
  const target = this.world.camera.position.clone().add(direction);
  arrow.lookAt(target);
  // Set velocity to move in that direction
  arrow.userData.velocity = direction.clone().multiplyScalar(1.5); // Adjust speed as needed
  // Add to scene
  this.world.scene.add(arrow);
  arrows.push(arrow);
}

// Start the application
new ShootingRange();
