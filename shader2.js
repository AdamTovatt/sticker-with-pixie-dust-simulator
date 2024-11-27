export const vertexShader = `
  varying vec2 vUv;
  varying vec3 vPosition; // Add world position

  void main() {
    vUv = uv;
    vPosition = position; // Pass the vertex position to fragment shader
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

export const fragmentShader = `
  varying vec2 vUv;
  varying vec3 vPosition; // World space position of the fragment

  uniform sampler2D uTexture; // The base texture (used for alpha and color)
  uniform vec3 uLightPosition; // Light position
  uniform float uTime; // Time for noise animation (optional)

  // Function to generate noise
  float random(vec2 st) {
    return fract(sin(dot(st, vec2(12.9898, 78.233))) * 43758.5453);
  }

  void main() {
    // Get the base color and alpha from the texture
    vec4 texColor = texture2D(uTexture, vUv);

    // Basic lighting model: fixed normal for a flat surface (paper)
    vec3 normal = vec3(0.0, 0.0, 1.0); // Assuming flat surface with z-up normal
    vec3 lightDir = normalize(uLightPosition - vPosition); // Direction of light
    float diff = max(dot(normal, lightDir), 0.0); // Lambertian diffuse lighting

    // Ambient light component to brighten the paper
    float ambient = 0.2; // Low ambient light to prevent darkness
    float diffuse = diff + ambient; // Adding ambient light to the diffuse component

    // Ensure that the base color is a bit more intense (boost the brightness)
    vec3 baseColor = vec3(1.0, 1.0, 1.0); // Paper is white
    vec3 shadedColor = baseColor * diffuse * 2.9; // Apply light shading and make it brighter

    // Adding noise to simulate paper texture
    // Using object/world space coordinates instead of screen space
    float noiseScale = 5000.0; // Increase the scale to make the noise more visible
    float noise = random(vPosition.xy * noiseScale + uTime); // Use vPosition for consistent noise
    vec3 noiseColor = vec3(noise * 0.2); // Slightly noisy color variation

    // Combine the base color, shading, and noise
    vec3 finalColor = mix(shadedColor, shadedColor + noiseColor, 0.3); // Mix noise slightly

    // Apply the alpha from the texture (only if the alpha is greater than 0)
    if (texColor.a > 0.0) {
      gl_FragColor = vec4(finalColor, texColor.a); // White paper color with alpha
    } else {
      discard; // Make it transparent where there's no alpha
    }
  }
`;
