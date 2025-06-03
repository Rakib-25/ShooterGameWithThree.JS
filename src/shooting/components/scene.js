import { Color, Fog, Scene } from 'three';

function createScene(color, near, far) {
  const scene = new Scene();

  if (color) {
    scene.background = new Color(color);
  }

  if (color && near && far) {
    scene.fog = new Fog(color, near, far);
  }

  return scene;
}

export { createScene };
