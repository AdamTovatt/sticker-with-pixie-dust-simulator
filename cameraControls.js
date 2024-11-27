export function addCameraControls(camera, radius, cube) {
  let theta = 0;
  let phi = Math.PI / 2;
  let isDragging = false;
  let previousMousePosition = { x: 0, y: 0 };

  // Mouse control: drag to rotate
  document.addEventListener("mousedown", () => {
    isDragging = true;
  });

  document.addEventListener("mouseup", () => {
    isDragging = false;
  });

  document.addEventListener("mousemove", (event) => {
    if (isDragging) {
      const deltaX = event.movementX || 0;
      const deltaY = event.movementY || 0;

      theta += deltaX * 0.01;
      phi -= deltaY * 0.01;

      phi = Math.max(0.1, Math.min(Math.PI - 0.1, phi)); // Clamp phi to prevent camera from flipping
    }
  });

  // Zoom functionality: scroll to zoom in and out
  document.addEventListener(
    "wheel",
    (event) => {
      event.preventDefault(); // Prevent default scrolling behavior (avoid page scroll)

      const delta = event.deltaY; // The scroll amount

      // Zoom in when scrolling up (negative deltaY), zoom out when scrolling down (positive deltaY)
      radius -= delta * -0.01; // Adjust the zoom speed (change 0.1 to make it faster/slower)

      // Limit the zoom range to prevent the camera from going too close or too far
      radius = Math.max(2, Math.min(50, radius)); // Change these values as needed (min and max zoom distance)
    },
    { passive: false }
  ); // Ensures that preventDefault works

  return () => {
    // Update the camera's position based on the spherical coordinates (theta, phi, radius)
    camera.position.x = radius * Math.sin(phi) * Math.cos(theta);
    camera.position.y = radius * Math.cos(phi);
    camera.position.z = radius * Math.sin(phi) * Math.sin(theta);

    // Ensure the camera always looks at the cube
    camera.lookAt(cube.position);
  };
}
