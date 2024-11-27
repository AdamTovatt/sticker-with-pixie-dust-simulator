export const vertexShader = `
      varying vec2 vUv;
      varying vec3 vPosition;
  
      void main() {
        vUv = uv;
        vPosition = position;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
`;

export const fragmentShader = `
varying vec2 vUv;
varying vec3 vPosition;

uniform sampler2D uTexture;
uniform sampler2D uMask; // Add the mask texture uniform
uniform vec3 uLightPositions[3];
uniform vec3 uCameraPos;

const int NUM_GROUPS = {{num_groups_value}}; // Number of grain groups
const bool MASK_INVERTED = {{mask_inverted_value}}; // Control whether the mask is inverted

// Function to shift the hue of a color
vec3 shiftHue(vec3 color, float angle) {
  float cosA = cos(angle);
  float sinA = sin(angle);

  // Hue rotation matrix
  mat3 hueRotation = mat3(
    0.299 + 0.701 * cosA + 0.168 * sinA, 0.587 - 0.587 * cosA + 0.330 * sinA, 0.114 - 0.114 * cosA - 0.497 * sinA,
    0.299 - 0.299 * cosA - 0.328 * sinA, 0.587 + 0.413 * cosA + 0.035 * sinA, 0.114 - 0.114 * cosA + 0.292 * sinA,
    0.299 - 0.300 * cosA + 1.250 * sinA, 0.587 - 0.588 * cosA - 1.050 * sinA, 0.114 + 0.886 * cosA - 0.203 * sinA
  );

  return clamp(hueRotation * color, 0.0, 1.0);
}

void main() {
  // Base texture
  vec4 texColor = texture2D(uTexture, vUv);

  // Mask texture (alpha channel)
  float maskAlpha = texture2D(uMask, vUv).a;

  // Apply mask inversion if enabled
  maskAlpha = MASK_INVERTED ? 1.0 - maskAlpha : maskAlpha;

  // Grain size and UV rounding
  float grainSize = {{grain_size}}; // Adjust for grain size
  vec2 grainUv = floor(vUv / grainSize) * grainSize;

  // Initialize sparkle intensity and color
  float sparkle = 0.0;
  vec3 glitterColor = vec3(0.0); // Additive color for the glitter

  // Calculate hue shift based on the view angle once (same for all groups)
  vec3 viewDir = normalize(uCameraPos - vPosition);
  float viewAngleFactor = max(dot(viewDir, vec3(0.0, 0.0, 1.0)), 0.0); // Simple view angle calculation
  float hueShift = viewAngleFactor * 6.14159; // Shift up to ±180 degrees

  // Loop through grain groups (using the same hueShift for all groups)
  for (int group = 0; group < NUM_GROUPS; group++) {
    // Generate unique noise for each group
    float grainNoise = fract(sin(dot(grainUv * (100.0 + float(group) * 10.0), vec2(12.9898, 78.233))) * 43758.5453123);
    vec3 randomDir = normalize(vec3(
      sin(grainNoise * 6.2831 + float(group)), // Random X
      cos(grainNoise * 6.2831 + float(group)), // Random Y
      grainNoise * 2.0 - 1.0                   // Random Z
    ));

    // Base warm color
    vec3 baseColor = vec3(0.5, 0.8, 1);

    // Apply the same hue shift to all groups
    vec3 shiftedColor = shiftHue(baseColor, hueShift);

    // Calculate dynamic sparkle for each light
    for (int i = 0; i < 3; i++) {
      vec3 lightDir = normalize(uLightPositions[i] - vPosition);

      // Specular highlight using randomized grain direction
      float specular = pow(max(dot(reflect(-lightDir, randomDir), viewDir), 0.0), 25.0);

      // Diffuse-like contribution for ambient visibility
      float diffuse = max(dot(lightDir, randomDir), 0.0);

      // Blend specular and diffuse
      float sparkleContribution = mix(diffuse * 0.1, specular, 0.9);

      // Add to total sparkle intensity and color
      sparkle += sparkleContribution;
      glitterColor += shiftedColor * sparkleContribution; // Add tinted contribution
    }
  }

  // Add random noise for scattered sparkles
  float noise = fract(sin(dot(grainUv * 100.0, vec2(12.9898, 78.233))) * 43758.5453123);
  sparkle *= step(0.6, noise); // Balanced noise threshold
  glitterColor *= step(0.6, noise); // Apply noise to tint

  // Apply the mask to the glitter effect
  sparkle *= maskAlpha;       // Multiply sparkle intensity by the mask alpha
  glitterColor *= maskAlpha;  // Multiply glitter color by the mask alpha

  // Combine texture and glitter
  vec3 finalColor = texColor.rgb + glitterColor * sparkle;

  gl_FragColor = vec4(finalColor, texColor.a); // Preserve texture alpha
}
`;
