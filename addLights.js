import * as THREE from "https://cdn.jsdelivr.net/npm/three@latest/build/three.module.js";

export function addLights(scene) {
  const light1 = new THREE.PointLight(0xffffff, 1, 100);
  light1.position.set(5, 5, 5);
  scene.add(light1);

  const light2 = new THREE.PointLight(0xffffff, 0.8, 100);
  light2.position.set(-5, 5, 5);
  scene.add(light2);

  const light3 = new THREE.PointLight(0xffffff, 0.6, 100);
  light3.position.set(0, -5, 5);
  scene.add(light3);

  return [light1, light2, light3];
}
