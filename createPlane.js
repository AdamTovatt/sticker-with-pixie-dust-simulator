import * as THREE from "https://cdn.jsdelivr.net/npm/three@latest/build/three.module.js";
import { vertexShader, fragmentShader } from "./shaders.js";

export function createCustomShaderPlane(
  scene,
  lights,
  width = 5,
  height = 5,
  glitterGroupCount,
  maskInverted,
  texture, // Accept texture as an argument
  maskTexture, // Accept mask texture as an argument
  grainSize // Accept grain size as an argument
) {
  const numGroups = glitterGroupCount !== undefined ? glitterGroupCount : 3;
  const invertMask = maskInverted !== undefined ? maskInverted : false;

  // Dynamically update the constants in the fragment shader
  let updatedFragmentShader = fragmentShader.replace(
    "{{mask_inverted_value}}",
    `${invertMask}`
  );
  updatedFragmentShader = updatedFragmentShader.replace(
    "{{num_groups_value}}", // Replace the NUM_GROUPS value
    `${numGroups}`
  );
  updatedFragmentShader = updatedFragmentShader.replace(
    "{{grain_size}}", // Replace the grain_size value
    `${grainSize}`
  );

  // Custom Shader Material
  const material = new THREE.ShaderMaterial({
    uniforms: {
      uTexture: { value: texture }, // Use the updated texture
      uMask: { value: maskTexture }, // Use the updated mask texture
      uLightPositions: { value: lights.map((light) => light.position) },
      uCameraPos: { value: new THREE.Vector3(0, 0, 5) },
    },
    vertexShader: vertexShader,
    fragmentShader: updatedFragmentShader,
    transparent: true,
  });

  // Plane geometry
  const geometry = new THREE.PlaneGeometry(width, height);
  const plane = new THREE.Mesh(geometry, material);

  // Plane settings
  plane.rotation.y = Math.PI / 2; // Rotate 90 degrees upright
  plane.position.set(0, 0, 0);
  scene.add(plane);

  return plane;
}
