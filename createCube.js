import * as THREE from "https://cdn.jsdelivr.net/npm/three@latest/build/three.module.js";

export function createCube(scene) {
  const geometry = new THREE.BoxGeometry();
  const material = new THREE.MeshStandardMaterial({ color: 0x808080 });
  const cube = new THREE.Mesh(geometry, material);
  scene.add(cube);

  return cube;
}
