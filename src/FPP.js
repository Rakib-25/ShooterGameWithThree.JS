import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
window.THREE = THREE; // Make it global so your FPP.js can access

// Add these variables at the top
let cameraParent, playerModel, mixer, clock, actions;
const animationSettings = {
  idle: { weight: 1 },
  walk: { weight: 0 },
  run: { weight: 0 },
};


// Main variables
let scene, camera, renderer;
let keyState = {};
let objects = [];
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
const posX = document.getElementById("pos-x");
const posY = document.getElementById("pos-y");
const posZ = document.getElementById("pos-z");
const rotX = document.getElementById("rot-x");
const rotY = document.getElementById("rot-y");
const rotZ = document.getElementById("rot-z");

// Initialize the scene
function init() {
  // Create scene
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x0a192f);
  scene.fog = new THREE.Fog(0x0a192f, 20, 100);

  // Create camera parent for player
  cameraParent = new THREE.Group();
  scene.add(cameraParent);

  // Camera setup
  camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.set(0, 1.6, 5); // Position behind player
  cameraParent.add(camera);


  // Create renderer
  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  document.getElementById("container").appendChild(renderer.domElement);

  // Add lighting
  addLighting();

  // Add environment
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
// GLTF Loader for player model
function loadPlayerModel() {
  const loader = new GLTFLoader();
  loader.load("./models/gltf/Soldier.glb", function (gltf) {
    playerModel = gltf.scene;
    
    // Position and scale the model
    playerModel.position.set(0, -0.5, 0);
    playerModel.scale.set(0.5, 0.5, 0.5);
    playerModel.rotation.y = Math.PI; // Rotate to face forward
    
    // Add to camera parent
    cameraParent.add(playerModel);

    // Setup animations
    mixer = new THREE.AnimationMixer(playerModel);
    const animations = gltf.animations;
    
    actions = {
      idle: mixer.clipAction(animations[0]),
      walk: mixer.clipAction(animations[3]),
      run: mixer.clipAction(animations[1])
    };
    
    // Activate all actions
    Object.values(actions).forEach(action => {
      action.play();
    });
    
    // Set initial weights
    setAnimationWeight('idle', 1);
  });
}

// Animation helper function
function setAnimationWeight(name, weight) {
  animationSettings[name].weight = weight;
  actions[name].setEffectiveWeight(weight);
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

// Create the environment
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

  // Create random buildings
  const buildingGeometry = new THREE.BoxGeometry(1, 1, 1);

  for (let i = 0; i < 50; i++) {
    const height = Math.random() * 5 + 1;
    const buildingMaterial = new THREE.MeshStandardMaterial({
      color: new THREE.Color(Math.random() * 0xffffff),
      metalness: 0.3,
      roughness: 0.6,
    });

    const building = new THREE.Mesh(buildingGeometry, buildingMaterial);
    building.scale.set(1, height, 1);
    building.position.set(
      (Math.random() - 0.5) * 80,
      height / 2 - 0.5,
      (Math.random() - 0.5) * 80
    );
    building.castShadow = true;
    building.receiveShadow = true;
    scene.add(building);
    objects.push(building);
  }

  // Create player sphere
  const sphereGeometry = new THREE.SphereGeometry(0.5, 32, 32);
  const sphereMaterial = new THREE.MeshStandardMaterial({
    color: 0xff0066,
    emissive: 0xff0066,
    emissiveIntensity: 0.3,
    metalness: 0.7,
    roughness: 0.2,
  });
  const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
  sphere.position.set(0, 0.5, 0);
  sphere.castShadow = true;
  scene.add(sphere);
  objects.push(sphere);
}

// Set up event listeners
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
      // Pointer is locked
      infoPanel.style.opacity = "0.5";
      controlsPanel.style.opacity = "0.5";
      document.addEventListener("mousemove", onMouseMove);
    } else {
      // Pointer is unlocked
      infoPanel.style.opacity = "1";
      controlsPanel.style.opacity = "1";
      document.removeEventListener("mousemove", onMouseMove);
    }
  });

  // Mouse movement handler
  function onMouseMove(event) {
    // Calculate rotation based on mouse movement
    yaw -= event.movementX * sensitivity;
    pitch -= event.movementY * sensitivity;

    // Limit pitch to prevent flipping
    pitch = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, pitch));

    // Update camera rotation
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


  const isMoving = velocity.length() > 0.01;
  const isRunning = keyState["shift"] && isMoving;
  if (isRunning) {
    setAnimationWeight('run', 1);
    setAnimationWeight('walk', 0);
    setAnimationWeight('idle', 0);
  } else if (isMoving) {
    setAnimationWeight('run', 0);
    setAnimationWeight('walk', 1);
    setAnimationWeight('idle', 0);
  } else {
    setAnimationWeight('run', 0);
    setAnimationWeight('walk', 0);
    setAnimationWeight('idle', 1);
  }
}

// Update status display
function updateStatusDisplay() {
  // Position
  posX.textContent = camera.position.x.toFixed(2);
  posY.textContent = camera.position.y.toFixed(2);
  posZ.textContent = camera.position.z.toFixed(2);

  // Rotation
  rotX.textContent = THREE.MathUtils.radToDeg(pitch).toFixed(2);
  rotY.textContent = THREE.MathUtils.radToDeg(yaw).toFixed(2);
  rotZ.textContent = THREE.MathUtils.radToDeg(camera.rotation.z).toFixed(2);
}

// Animate function
function animate() {
  requestAnimationFrame(animate);

  // Calculate time delta for smooth movement
  const delta = Math.min(0.1, clock.getDelta());

    // Update animations
  if (mixer) {
    mixer.update(delta);
  }

  // Handle camera movement
  handleMovement(delta);

  // Update status display
  updateStatusDisplay();

  // Animate objects
  const time = clock.getElapsedTime();
  objects.forEach((obj, index) => {
    if (index > 0) {
      // Skip player sphere
      obj.rotation.y = time * 0.2 + index;
      obj.position.y =
        Math.sin(time * 0.5 + index) * 0.2 +
        (obj.position.y - Math.sin((time - delta) * 0.5 + index) * 0.2);
    }
  });

  // Render scene
  renderer.render(scene, camera);
}

// Initialize everything
function setup() {
  init();
  loadPlayerModel();
  // ... other setup ...
}

// Start the application
setup();
// Start animation loop after initialization
setTimeout(animate, 100);
