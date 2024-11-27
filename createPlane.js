import * as THREE from "https://cdn.jsdelivr.net/npm/three@latest/build/three.module.js";
import { vertexShader, fragmentShader } from "./shaders.js";
import {
  vertexShader as vertexShader2,
  fragmentShader as fragmentShader2,
} from "./shader2.js"; // Import the new shader

export function createCustomShaderPlane(
  scene,
  lights,
  width = 5,
  height = 5,
  glitterGroupCount,
  maskInverted,
  texture, // Accept texture as an argument
  maskTexture, // Accept mask texture as an argument
  grainSize, // Accept grain size as an argument
  uTime // Time for noise animation
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

  // Custom Shader Material for the front plane (glitter effect)
  const materialFront = new THREE.ShaderMaterial({
    uniforms: {
      uTexture: { value: texture },
      uMask: { value: maskTexture },
      uLightPositions: { value: lights.map((light) => light.position) },
      uCameraPos: { value: new THREE.Vector3(0, 0, 5) },
      uTime: { value: uTime }, // Pass the time for noise animation
    },
    vertexShader: vertexShader,
    fragmentShader: updatedFragmentShader,
    transparent: true,
  });

  // Custom Shader Material for the back plane (white paper-like effect)
  const materialBack = new THREE.ShaderMaterial({
    uniforms: {
      uTexture: { value: texture }, // Use the texture (only one texture)
      uTime: { value: uTime }, // Pass the time for noise animation
    },
    vertexShader: vertexShader2,
    fragmentShader: fragmentShader2,
    transparent: true,
    side: THREE.BackSide, // Make this material render on the backside of the plane
  });

  // Plane geometry
  const geometry = new THREE.PlaneGeometry(width, height);

  // Front plane with glitter effect (using the original shader)
  const planeFront = new THREE.Mesh(geometry, materialFront);
  planeFront.rotation.y = Math.PI / 2; // Rotate 90 degrees upright
  scene.add(planeFront);

  // Back plane with simple white paper-like effect (using the second shader)
  const planeBack = new THREE.Mesh(geometry, materialBack);
  planeBack.rotation.y = Math.PI / 2; // Rotate 180 degrees to face the opposite side
  scene.add(planeBack);

  // Return only the front plane (glitter effect)
  return planeFront;
}
