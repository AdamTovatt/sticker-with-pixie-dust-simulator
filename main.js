import * as THREE from "https://cdn.jsdelivr.net/npm/three@latest/build/three.module.js"; // Ensure THREE is imported
import { setupScene } from "./sceneSetup.js";
import { addLights } from "./addLights.js";
import { createCustomShaderPlane } from "./createPlane.js";
import { addCameraControls } from "./cameraControls.js";

const { scene, camera, renderer } = setupScene();
const lights = addLights(scene); // Returns [light1, light2, light3]

// Initial settings
let numGroups = 4; // Default value for NUM_GROUPS
let maskInverted = true; // Default for the mask inversion
let texture, maskTexture; // Initialize texture and mask texture variables
let grainSize = 0.004; // Default grain size

// Create the plane with the initial settings
let plane = createCustomShaderPlane(
  scene,
  lights,
  5,
  5,
  numGroups,
  maskInverted,
  texture,
  maskTexture,
  grainSize
);

// Add camera controls
const radius = 5;
const updateCamera = addCameraControls(camera, radius, plane);

// Get the checkbox, slider, and input elements
const invertMaskCheckbox = document.getElementById("invertMaskCheckbox");
const numGroupsSlider = document.getElementById("numGroupsSlider");
const numGroupsValue = document.getElementById("numGroupsValue");
const textureInput = document.getElementById("textureInput");
const maskInput = document.getElementById("maskInput");
const grainSizeSlider = document.getElementById("grainSizeSlider");
const grainSizeValue = document.getElementById("grainSizeValue");
const toggleConfigBtn = document.getElementById("toggleConfigBtn");
const configBox = document.getElementById("config-box");

// Log button to check if it's selected correctly
console.log("Toggle button:", toggleConfigBtn);

// Listen for checkbox changes
invertMaskCheckbox.addEventListener("change", (event) => {
  maskInverted = event.target.checked; // true if checked, false if unchecked
  updatePlane();
});

// Listen for slider changes for number of groups
numGroupsSlider.addEventListener("input", (event) => {
  numGroups = parseInt(event.target.value, 10); // Get the value from the slider
  numGroupsValue.textContent = numGroups; // Update the displayed value
  updatePlane();
});

// Listen for slider changes for glitter size (grain size)
grainSizeSlider.addEventListener("input", (event) => {
  grainSize = parseFloat(event.target.value); // Get the value from the slider
  grainSizeValue.textContent = grainSize.toFixed(4); // Update the displayed value
  updatePlane();
});

// Listen for texture file input
textureInput.addEventListener("change", (event) => {
  if (event.target.files.length > 0) {
    const reader = new FileReader();
    reader.onload = function (e) {
      const loader = new THREE.TextureLoader();
      texture = loader.load(e.target.result); // Load the texture
      updatePlane(); // Update the plane with the new texture
    };
    reader.readAsDataURL(event.target.files[0]);
  }
});

// Listen for mask texture file input
maskInput.addEventListener("change", (event) => {
  if (event.target.files.length > 0) {
    const reader = new FileReader();
    reader.onload = function (e) {
      const loader = new THREE.TextureLoader();
      maskTexture = loader.load(e.target.result); // Load the mask texture
      updatePlane(); // Update the plane with the new mask
    };
    reader.readAsDataURL(event.target.files[0]);
  }
});

// Listen for the collapse/expand button click
toggleConfigBtn.addEventListener("click", () => {
  // Toggle the 'collapsed' class on the config box
  configBox.classList.toggle("collapsed");

  // Change button text based on whether the box is collapsed
  if (configBox.classList.contains("collapsed")) {
    toggleConfigBtn.textContent = "Expand";
  } else {
    toggleConfigBtn.textContent = "Collapse";
  }
});

// Function to update the plane when settings change (texture, mask, etc.)
function updatePlane() {
  // Ensure both texture and mask are loaded before updating the plane
  if (texture && maskTexture) {
    scene.remove(plane); // Remove the existing plane

    // Create a new plane with the updated settings
    plane = createCustomShaderPlane(
      scene,
      lights,
      5,
      5,
      numGroups,
      maskInverted,
      texture,
      maskTexture,
      grainSize // Pass the updated grain size
    );
  }
}

function animate() {
  requestAnimationFrame(animate);

  // Update the camera position in the shader
  plane.material.uniforms.uCameraPos.value.copy(camera.position);

  // Update the camera movement
  updateCamera();

  // Render the scene
  renderer.render(scene, camera);
}
animate();
