export function addCameraControls(camera, radius, cube) {
  let theta = 0;
  let phi = Math.PI / 2;
  let isDragging = false;
  let previousMousePosition = { x: 0, y: 0 };

  let isTouching = false;
  let previousTouch = { x: 0, y: 0 };

  // Mouse control: drag to rotate
  document.addEventListener("mousedown", (event) => {
    isDragging = true;
    previousMousePosition.x = event.clientX;
    previousMousePosition.y = event.clientY;
  });

  document.addEventListener("mouseup", () => {
    isDragging = false;
  });

  document.addEventListener("mousemove", (event) => {
    if (isDragging) {
      const deltaX = event.clientX - previousMousePosition.x;
      const deltaY = event.clientY - previousMousePosition.y;

      theta += deltaX * 0.01;
      phi -= deltaY * 0.01;

      phi = Math.max(0.1, Math.min(Math.PI - 0.1, phi)); // Clamp phi to prevent camera from flipping

      previousMousePosition.x = event.clientX;
      previousMousePosition.y = event.clientY;
    }
  });

  // Touch control: drag to rotate (touchstart, touchmove, touchend)
  document.addEventListener("touchstart", (event) => {
    if (event.touches.length === 1) {
      isTouching = true;
      previousTouch.x = event.touches[0].clientX;
      previousTouch.y = event.touches[0].clientY;
    }
  });

  document.addEventListener("touchend", () => {
    isTouching = false;
  });

  document.addEventListener("touchmove", (event) => {
    if (isTouching && event.touches.length === 1) {
      const deltaX = event.touches[0].clientX - previousTouch.x;
      const deltaY = event.touches[0].clientY - previousTouch.y;

      theta += deltaX * 0.01;
      phi -= deltaY * 0.01;

      phi = Math.max(0.1, Math.min(Math.PI - 0.1, phi)); // Clamp phi to prevent camera from flipping

      previousTouch.x = event.touches[0].clientX;
      previousTouch.y = event.touches[0].clientY;
    }
  });

  // Zoom functionality: scroll to zoom in and out (using mouse wheel)
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

  // Touch zoom functionality (using two-finger pinch)
  document.addEventListener("touchmove", (event) => {
    if (event.touches.length === 2) {
      const dx = event.touches[0].clientX - event.touches[1].clientX;
      const dy = event.touches[0].clientY - event.touches[1].clientY;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (previousTouch.distance) {
        const zoomFactor = distance - previousTouch.distance;
        radius -= zoomFactor * 0.05; // Adjust zoom speed
        radius = Math.max(2, Math.min(50, radius)); // Limit the zoom
      }

      previousTouch.distance = distance;
    }
  });

  // Reset the touch distance after touchend
  document.addEventListener("touchend", () => {
    previousTouch.distance = null;
  });

  return () => {
    // Update the camera's position based on the spherical coordinates (theta, phi, radius)
    camera.position.x = radius * Math.sin(phi) * Math.cos(theta);
    camera.position.y = radius * Math.cos(phi);
    camera.position.z = radius * Math.sin(phi) * Math.sin(theta);

    // Ensure the camera always looks at the cube
    camera.lookAt(cube.position);
  };
}
