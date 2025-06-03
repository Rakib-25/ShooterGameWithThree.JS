import * as THREE from 'three';
import { ShootingTarget } from './target.js';
window.THREE = THREE; // Make it global so your FPP.js can access

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
const loadingScreen = document.getElementById('loading');
const startScreen = document.getElementById('start-screen');
const startButton = document.getElementById('start-button');
const infoPanel = document.getElementById('info');
const controlsPanel = document.getElementById('controls');

// Initialize the scene
function init() {
  // Create scene
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x0a192f);
  scene.fog = new THREE.Fog(0x0a192f, 20, 100);

  // Camera setup
  camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  camera.position.set(0, 1.6, 5);

  // Create renderer
  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  document.getElementById('container').appendChild(renderer.domElement);

  // Add lighting
  addLighting();

  // Add environment (ground, grid, and target only)
  createEnvironment();

  // Event listeners
  setupEventListeners();

  // Hide loading screen
  setTimeout(() => {
    loadingScreen.style.opacity = '0';
    setTimeout(() => {
      loadingScreen.style.display = 'none';
      startScreen.style.display = 'flex';
    }, 500);
  }, 1500);
}

// Add lighting to the scene
function addLighting() {
  // Ambient light
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
  scene.add(ambientLight);

  // Directional light (sun)
  const sunLight = new THREE.DirectionalLight(0xffffff, 0.8);
  sunLight.position.set(10, 20, 10);
  sunLight.castShadow = true;
  sunLight.shadow.mapSize.width = 2048;
  sunLight.shadow.mapSize.height = 2048;
  sunLight.shadow.camera.near = 0.5;
  sunLight.shadow.camera.far = 50;
  sunLight.shadow.camera.left = -20;
  sunLight.shadow.camera.right = 20;
  sunLight.shadow.camera.top = 20;
  sunLight.shadow.camera.bottom = -20;
  scene.add(sunLight);

  // Hemisphere light for more natural outdoor lighting
  const hemiLight = new THREE.HemisphereLight(0xffffbb, 0x080820, 0.5);
  scene.add(hemiLight);

  // Add a subtle point light for additional ambiance
  const pointLight = new THREE.PointLight(0xff6600, 0.5, 50);
  pointLight.position.set(5, 5, -5);
  scene.add(pointLight);
}

// Create the environment (ground, grid, and target only)
function createEnvironment() {
  // Create ground
  const groundGeometry = new THREE.PlaneGeometry(100, 100);
  const groundMaterial = new THREE.MeshStandardMaterial({
    color: 0x2a5b7c,
    roughness: 0.8,
    metalness: 0.2,
  });
  const ground = new THREE.Mesh(groundGeometry, groundMaterial);
  ground.rotation.x = -Math.PI / 2;
  ground.position.y = -0.5;
  ground.receiveShadow = true;
  scene.add(ground);

  // Grid helper
  const gridHelper = new THREE.GridHelper(50, 50, 0xffffff, 0xffffff);
  gridHelper.material.opacity = 0.2;
  gridHelper.material.transparent = true;
  scene.add(gridHelper);

  // Create and add a target object to the scene
  const target = new ShootingTarget();
  scene.add(target);
}

// Set up event listeners
function setupEventListeners() {
  // Start button
  startButton.addEventListener('click', () => {
    startScreen.style.display = 'none';
    infoPanel.style.opacity = '0.5';
    controlsPanel.style.opacity = '0.5';
    renderer.domElement.requestPointerLock();
  });

  // Pointer lock change event
  document.addEventListener('pointerlockchange', () => {
    if (document.pointerLockElement === renderer.domElement) {
      infoPanel.style.opacity = '0.5';
      controlsPanel.style.opacity = '0.5';
      document.addEventListener('mousemove', onMouseMove);
    } else {
      infoPanel.style.opacity = '1';
      controlsPanel.style.opacity = '1';
      document.removeEventListener('mousemove', onMouseMove);
    }
  });

  // Mouse movement handler
  function onMouseMove(event) {
    yaw -= event.movementX * sensitivity;
    pitch -= event.movementY * sensitivity;
    pitch = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, pitch));
    camera.rotation.set(pitch, yaw, 0, 'YXZ');
  }

  // Keyboard events
  window.addEventListener('keydown', (event) => {
    const key = event.key.toLowerCase();
    keyState[key] = true;

    if (key === ' ' && isOnGround) {
      jumpRequested = true;
    }

    // Toggle pointer lock with Enter key
    if (key === 'enter' && !document.pointerLockElement) {
      renderer.domElement.requestPointerLock();
    }
  });

  window.addEventListener('keyup', (event) => {
    keyState[event.key.toLowerCase()] = false;
  });

  // Window resize
  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
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
  if (keyState['shift']) {
    moveSpeed *= 2; // Sprint when shift is held
  }

  // Apply movement based on key state
  if (keyState['w']) {
    velocity.add(forward.multiplyScalar(moveSpeed * delta * 60));
  }
  if (keyState['s']) {
    velocity.add(forward.multiplyScalar(-moveSpeed * delta * 60));
  }
  if (keyState['a']) {
    velocity.add(right.multiplyScalar(-moveSpeed * delta * 60));
  }
  if (keyState['d']) {
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

  // Calculate time delta for smooth movement
  const delta = Math.min(0.1, clock.getDelta());

  // Handle camera movement
  handleMovement(delta);

  // Render scene
  renderer.render(scene, camera);
}

// Initialize everything
function setup() {
  init();
}

// Start the application
setup();
setTimeout(animate, 100);
