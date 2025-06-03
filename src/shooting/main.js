import * as THREE from "three";
import { ShootingTarget } from "./components/target.js";
import { createScene } from "./components/scene.js";
import { createCamera } from "./components/camera.js";
import {
  createAmbientLight,
  createDirectionalLight,
  createHemisphereLight,
  createPointLight,
} from "./components/light.js";
import { Ground } from "./components/ground.js";
window.THREE = THREE;

// Main variables
let scene, camera, renderer, clock;
let keyState = {};
clock = new THREE.Clock();

// Camera rotation variables
let yaw = 0;
let pitch = 0;
const sensitivity = 0.002;

// Movement variables
let velocity = new THREE.Vector3();
let isOnGround = true;
let jumpRequested = false;

// DOM elements
const loadingScreen = document.getElementById("loading");
const startScreen = document.getElementById("start-screen");
const startButton = document.getElementById("start-button");
const infoPanel = document.getElementById("info");
const controlsPanel = document.getElementById("controls");

// Initialize the scene
function init() {
  // Create scene
  scene = createScene(0x0a192f, 20, 100);

  // Camera setup
  camera = createCamera();

  // Create renderer
  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  document.getElementById("container").appendChild(renderer.domElement);

  // Add lighting
  addLighting();

  // Add environment (ground, grid, and target only)
  createEnvironment();

  // Event listeners
  setupEventListeners();

  // Hide loading screen
  setTimeout(() => {
    loadingScreen.style.opacity = "0";
    setTimeout(() => {
      loadingScreen.style.display = "none";
      startScreen.style.display = "flex";
    }, 500);
  }, 1500);
}

// Add lighting to the scene
function addLighting() {
  scene.add(createAmbientLight());
  scene.add(createDirectionalLight());
  scene.add(createHemisphereLight());
  scene.add(createPointLight());
}

// Create the environment (ground, grid, and target only)
function createEnvironment() {
  // Add ground
  const ground = new Ground();
  scene.add(ground);

  // Add grind helper if needed
  // const gridHelper = new THREE.GridHelper(50, 50, 0xffffff, 0xffffff);
  // gridHelper.material.opacity = 0.2;
  // gridHelper.material.transparent = true;
  // scene.add(gridHelper);

  // Add target
  const target = new ShootingTarget();
  scene.add(target);
}

function createArrow() {
  const geometry = new THREE.CylinderGeometry(0.05, 0.05, 2, 8);
  const material = new THREE.MeshStandardMaterial({ color: 0xcccc00 });
  const arrow = new THREE.Mesh(geometry, material);
  arrow.castShadow = true;
  arrow.receiveShadow = true;
  // Point the arrow forward (z axis)
  geometry.rotateX(Math.PI / 2); // Align cylinder to point forward
  return arrow;
}

let arrows = [];

function shootArrow() {
  const arrow = createArrow();



  // Step 2: Start at camera position
  arrow.position.copy(camera.position);

  // Step 3: Get camera forward direction
  const direction = new THREE.Vector3();
  camera.getWorldDirection(direction);

  // Step 4: Look in the same direction as the camera
  const target = camera.position.clone().add(direction);
  // console.log("Shooting arrow from", camera.position, "to", target);
  arrow.lookAt(target); // THIS handles both horizontal and vertical alignment

  // arrow.rotateOnWorldAxis(new THREE.Vector3(1, 0, 0), -(Math.PI / 2)); // Rotate around X to align cylinder length with forward direction

  // Step 5: Set velocity to move in that direction
  arrow.userData.velocity = direction.clone().multiplyScalar(1); // adjust speed

  // Add to scene
  scene.add(arrow);
  arrows.push(arrow);
}


// Set up event listeners  arrow.rotation.z = -Math.atan2(dir.x, dir.z); // Rotate around Z to align forward direction
function setupEventListeners() {
  // Start button
  startButton.addEventListener("click", () => {
    startScreen.style.display = "none";
    infoPanel.style.opacity = "0.5";
    controlsPanel.style.opacity = "0.5";
    renderer.domElement.requestPointerLock();
  });

  // Pointer lock change event
  document.addEventListener("pointerlockchange", () => {
    if (document.pointerLockElement === renderer.domElement) {
      infoPanel.style.opacity = "0.5";
      controlsPanel.style.opacity = "0.5";
      document.addEventListener("mousemove", onMouseMove);
    } else {
      infoPanel.style.opacity = "1";
      controlsPanel.style.opacity = "1";
      document.removeEventListener("mousemove", onMouseMove);
    }
  });

  // Mouse movement handler
  function onMouseMove(event) {
    yaw -= event.movementX * sensitivity;
    pitch -= event.movementY * sensitivity;
    pitch = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, pitch));
    camera.rotation.set(pitch, yaw, 0, "YXZ");
  }

  // Keyboard events
  window.addEventListener("keydown", (event) => {
    const key = event.key.toLowerCase();
    keyState[key] = true;

    if (key === " " && isOnGround) {
      jumpRequested = true;
    }

    // Toggle pointer lock with Enter key
    if (key === "enter" && !document.pointerLockElement) {
      renderer.domElement.requestPointerLock();
    }
  });

  window.addEventListener("keyup", (event) => {
    keyState[event.key.toLowerCase()] = false;
  });

  // Window resize
  window.addEventListener("resize", () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  renderer.domElement.addEventListener("mousedown", (event) => {
    if (document.pointerLockElement === renderer.domElement) {
      shootArrow();
    }
  });
}

// Handle camera movement based on keyboard input
function handleMovement(delta) {
  // Get camera direction vectors
  const forward = new THREE.Vector3(0, 0, -1).applyQuaternion(
    camera.quaternion
  );
  const right = new THREE.Vector3(1, 0, 0).applyQuaternion(camera.quaternion);

  // Ignore vertical component for movement
  forward.y = 0;
  right.y = 0;
  forward.normalize();
  right.normalize();

  // Movement speed
  let moveSpeed = 0.01;
  if (keyState["shift"]) {
    moveSpeed *= 2; // Sprint when shift is held
  }

  // Apply movement based on key state
  if (keyState["w"]) {
    velocity.add(forward.multiplyScalar(moveSpeed * delta * 60));
  }
  if (keyState["s"]) {
    velocity.add(forward.multiplyScalar(-moveSpeed * delta * 60));
  }
  if (keyState["a"]) {
    velocity.add(right.multiplyScalar(-moveSpeed * delta * 60));
  }
  if (keyState["d"]) {
    velocity.add(right.multiplyScalar(moveSpeed * delta * 60));
  }

  // Apply gravity
  velocity.y -= 0.02 * delta * 60;

  // Handle jumping
  if (jumpRequested && isOnGround) {
    velocity.y = 0.35;
    isOnGround = false;
    jumpRequested = false;
  }

  // Apply velocity to camera position
  camera.position.add(velocity.clone().multiplyScalar(delta * 60));

  // Ground collision
  if (camera.position.y < 1) {
    camera.position.y = 1;
    velocity.y = 0;
    isOnGround = true;
  }

  // Apply damping (friction)
  velocity.multiplyScalar(0.9);

  // Reset velocity if it becomes too small
  if (velocity.length() < 0.001) {
    velocity.set(0, 0, 0);
  }
}

// Animate function
function animate() {
  requestAnimationFrame(animate);

  const delta = Math.min(0.1, clock.getDelta());

  handleMovement(delta);

  // Move arrows
  for (let i = arrows.length - 1; i >= 0; i--) {
    const arrow = arrows[i];
    arrow.position.add(arrow.userData.velocity.clone().multiplyScalar(delta * 20));
    // Remove arrow if too far
    if (arrow.position.distanceTo(camera.position) > 100) {
      scene.remove(arrow);
      arrows.splice(i, 1);
    }
  }

  renderer.render(scene, camera);
}

// Initialize everything
function setup() {
  init();
}

// Start the application
setup();
setTimeout(animate, 100);
