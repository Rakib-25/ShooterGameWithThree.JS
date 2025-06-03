import * as THREE from 'three';

export function createAmbientLight() {
  return new THREE.AmbientLight(0xffffff, 0.3);
}

export function createDirectionalLight() {
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
  return sunLight;
}

export function createHemisphereLight() {
  return new THREE.HemisphereLight(0xffffbb, 0x080820, 0.5);
}

export function createPointLight() {
  const pointLight = new THREE.PointLight(0xff6600, 0.5, 50);
  pointLight.position.set(5, 5, -5);
  return pointLight;
}
