import * as THREE from 'three';
import { createScene } from '../components/scene.js';
import { createCamera } from '../components/camera.js';
import {
  createAmbientLight,
  createDirectionalLight,
  createHemisphereLight,
  createPointLight,
} from '../components/light.js';
import { Ground } from '../components/ground.js';
import { ShootingTarget } from '../components/target.js';
import { Resizer } from './Resizer.js';

export class World {
  constructor() {
    this.clock = new THREE.Clock();

    // Create scene
    this.scene = createScene(0x0a192f, 20, 100);

    // Create camera
    this.camera = createCamera();

    // Create renderer
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    document.getElementById('container').appendChild(this.renderer.domElement);

    // Add lighting
    this.addLighting();

    // Add environment
    this.createEnvironment();

    // Handle resizing
    this.resizer = new Resizer(
      document.getElementById('container'),
      this.camera,
      this.renderer
    );
  }

  addLighting() {
    this.scene.add(createAmbientLight());
    this.scene.add(createDirectionalLight());
    this.scene.add(createHemisphereLight());
    this.scene.add(createPointLight());
  }

  createEnvironment() {
    // Add ground
    const ground = new Ground();
    this.scene.add(ground);

    // Add target
    const target = new ShootingTarget();
    this.scene.add(target);
  }
}
