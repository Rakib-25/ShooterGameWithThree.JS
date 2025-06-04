import * as THREE from 'three';

// Ambient light for soft global illumination
export function createAmbientLight() {
  // Slightly warmer tone for a more natural look
  return new THREE.AmbientLight(0xf0e9e0, 0.7); // Increased intensity
}

// Directional light simulating sunlight
export function createDirectionalLight() {
  const sunLight = new THREE.DirectionalLight(0xffffff, 2.0); // Brighter sun
  sunLight.position.set(50, 100, 50); // Higher, more "noon" sun
  sunLight.castShadow = true;
  sunLight.shadow.mapSize.width = 4096;
  sunLight.shadow.mapSize.height = 4096;
  sunLight.shadow.camera.near = 1;
  sunLight.shadow.camera.far = 200;
  sunLight.shadow.camera.left = -60;
  sunLight.shadow.camera.right = 60;
  sunLight.shadow.camera.top = 60;
  sunLight.shadow.camera.bottom = -60;
  sunLight.shadow.bias = -0.0005; // Reduce shadow artifacts
  // Optional: visualize shadow camera for debugging
  // const helper = new THREE.CameraHelper(sunLight.shadow.camera);
  // sunLight.add(helper);
  return sunLight;
}

// Hemisphere light for subtle sky/ground color blending
export function createHemisphereLight() {
  return new THREE.HemisphereLight(0xb1e1ff, 0x888866, 1.0); // Brighter, warmer ground
}

// Point light for highlights or effects (e.g., muzzle flash, pickups)
export function createPointLight() {
  const pointLight = new THREE.PointLight(0xffaa33, 1, 100);
  pointLight.position.set(0, 10, 0);
  pointLight.castShadow = true;
  pointLight.shadow.mapSize.width = 1024;
  pointLight.shadow.mapSize.height = 1024;
  pointLight.shadow.camera.near = 0.5;
  pointLight.shadow.camera.far = 50;
  return pointLight;
}