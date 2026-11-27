/** GLSL ES 3.00 sources for the procedural cover renderer. */

export const VERTEX_SHADER_SRC = `#version 300 es
precision highp float;

layout(location = 0) in vec2 a_position;
out vec2 v_uv;

void main() {
  v_uv = a_position * 0.5 + 0.5;
  gl_Position = vec4(a_position, 0.0, 1.0);
}
`;

export const FRAGMENT_SHADER_SRC = `#version 300 es
precision highp float;
precision highp int;

in vec2 v_uv;
out vec4 fragColor;

uniform vec2 u_resolution;
uniform float u_seed;
uniform int u_composition;

uniform float u_zoom;
uniform vec2 u_pan;
uniform float u_fieldBias;
uniform float u_noiseScale;
uniform float u_warpStrength;

uniform float u_grainStrength;
uniform float u_grainProfile;

uniform vec2 u_lightPos;
uniform float u_lightStrength;
uniform float u_vignette;
uniform float u_accentStrength;
uniform float u_overprint;
uniform float u_bandCount;
uniform float u_contrast;

uniform vec3 u_color0; // paper / highlight mist
uniform vec3 u_color1; // primary pastel ink
uniform vec3 u_color2; // secondary earth / mineral ink
uniform vec3 u_color3; // accent / overprint shadow

// --- Deterministic hash + quintic value noise ---
float hash12(vec2 p) {
  vec3 p3 = fract(vec3(p.xyx) * 0.1031);
  p3 += dot(p3, p3.yzx + 33.33);
  return fract((p3.x + p3.y) * p3.z);
}

float valueNoise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * f * (f * (f * 6.0 - 15.0) + 10.0);

  float a = hash12(i);
  float b = hash12(i + vec2(1.0, 0.0));
  float c = hash12(i + vec2(0.0, 1.0));
  float d = hash12(i + vec2(1.0, 1.0));

  return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
}

// Three low-gain octaves; rotated to avoid axis-aligned artefacts.
float fbm(vec2 p) {
  float value = 0.0;
  float amplitude = 0.52;
  float frequency = 1.0;
  mat2 rot = mat2(0.80, -0.60, 0.60, 0.80);

  for (int i = 0; i < 3; i++) {
    value += amplitude * valueNoise(p * frequency);
    p = rot * p;
    frequency *= 1.88;
    amplitude *= 0.42;
  }
  return value;
}

vec3 toLinear(vec3 c) {
  return pow(max(c, vec3(0.0)), vec3(2.2));
}

vec3 toSRGB(vec3 c) {
  return pow(max(c, vec3(0.0)), vec3(1.0 / 2.2));
}

// Serigraph ink overprint, with a seeded strength.
vec3 overprint(vec3 baseLinear, vec3 inkLinear, float opacity) {
  float amount = clamp(opacity * u_overprint, 0.0, 1.0);
  vec3 multiplied = baseLinear * mix(vec3(1.0), inkLinear * 1.12, 0.85);
  vec3 normalBlend = mix(baseLinear, inkLinear, 0.65);
  vec3 combined = mix(normalBlend, multiplied, 0.55);
  return mix(baseLinear, combined, amount);
}

void main() {
  float aspect = u_resolution.x / max(u_resolution.y, 1.0);

  // Seeded crop: a different view of the same kind of colour field.
  vec2 p = (v_uv - 0.5) * vec2(aspect, 1.0) / u_zoom + u_pan;

  vec2 seedOffset = vec2(
    mod(u_seed * 13.7, 97.0),
    mod(u_seed * 29.3, 89.0)
  );

  // One gentle domain warp keeps the composition calm but organic.
  vec2 noiseCoord = p * u_noiseScale + seedOffset;
  vec2 warpVec = vec2(
    fbm(noiseCoord + vec2(1.7, 9.2)),
    fbm(noiseCoord + vec2(8.3, 2.8))
  ) - 0.5;

  vec2 warpedP = p + warpVec * u_warpStrength;
  float organicField = fbm(warpedP * (u_noiseScale * 0.85) + seedOffset * 0.5);
  float secondaryField = fbm(warpedP * (u_noiseScale * 1.45) - seedOffset * 0.3 + vec2(4.2));

  vec3 c0 = toLinear(u_color0);
  vec3 c1 = toLinear(u_color1);
  vec3 c2 = toLinear(u_color2);
  vec3 c3 = toLinear(u_color3);

  vec3 col = mix(
    c0,
    c1,
    smoothstep(0.22 - u_fieldBias, 0.78 - u_fieldBias, organicField)
  );

  float accentMask = 0.0;

  if (u_composition == 0) {
    // Desert horizon: distant haze, foreground earth, soft sun.
    float horizonY = -0.14 + (organicField - 0.5) * 0.22;
    float ground = smoothstep(horizonY + 0.03, horizonY - 0.04, warpedP.y);
    float distantRidge = smoothstep(horizonY + 0.14, horizonY + 0.01, warpedP.y + (secondaryField - 0.5) * 0.12);

    col = mix(col, c1, distantRidge * 0.65);
    col = mix(col, c2, ground * 0.88);

    vec2 sunPos = vec2((fract(u_seed * 0.17) - 0.5) * 0.6 * aspect, horizonY + 0.22);
    float sunDisc = smoothstep(0.24, 0.16, length(warpedP - sunPos));
    accentMask = sunDisc * (1.0 - ground * 0.75) * 0.72;
  }
  else if (u_composition == 1) {
    // Diagonal serigraph cut.
    float angle = (fract(u_seed * 0.31) > 0.5) ? 0.68 : -0.68;
    float diag = warpedP.x * cos(angle) + warpedP.y * sin(angle);
    float cut1 = smoothstep(-0.18, 0.14, diag + (organicField - 0.5) * 0.25);
    float cut2 = smoothstep(0.12, 0.42, diag + (secondaryField - 0.5) * 0.22);

    col = mix(col, c2, cut1 * 0.82);
    accentMask = cut2 * 0.55;
  }
  else if (u_composition == 2) {
    // Orbital halo.
    vec2 center = vec2((fract(u_seed * 0.23) - 0.5) * 0.45 * aspect, (fract(u_seed * 0.41) - 0.5) * 0.25);
    float d = length(warpedP - center);
    float disc = smoothstep(0.36, 0.18, d);
    float outerHalo = smoothstep(0.62, 0.25, d) * (1.0 - disc);

    col = mix(col, c1, outerHalo * 0.75);
    col = mix(col, c2, disc * 0.78);

    float innerCore = smoothstep(0.22, 0.06, length(warpedP - center - vec2(0.06, -0.05)));
    accentMask = innerCore * 0.65;
  }
  else if (u_composition == 3) {
    // Layered strata: the number of layers is seeded too.
    float wave = warpedP.y * (0.7 + u_bandCount * 0.42)
      + sin(warpedP.x * 2.2 + u_seed) * 0.08
      + (organicField - 0.5) * 0.18;
    float layer = fract(wave);

    float band1 = smoothstep(0.92, 0.70, layer);
    float band2 = smoothstep(0.58, 0.36, layer);
    float band3 = smoothstep(0.24, 0.06, layer);

    col = mix(col, c1, band1 * 0.72);
    col = mix(col, c2, band2 * 0.80);
    accentMask = band3 * 0.68;
  }
  else {
    // Asymmetric overprint.
    float blobA = smoothstep(0.56, 0.34, organicField + length(p * vec2(0.6, 0.9)) * 0.35);
    float blobB = smoothstep(0.58, 0.36, secondaryField + length((p - vec2(0.22, -0.12)) * vec2(0.8, 0.7)) * 0.38);

    col = overprint(col, c2, blobA * 0.88);
    accentMask = blobB * 0.78;
  }

  col = overprint(col, c3, accentMask * u_accentStrength);

  // Directional light and vignette, both optional in strength.
  vec2 lightVec = (u_lightPos - 0.5) * vec2(aspect, 1.0);
  float directionalLight = smoothstep(1.45, 0.15, length(p - lightVec));
  col *= mix(1.0, mix(0.86, 1.12, directionalLight), clamp(u_lightStrength, 0.0, 1.0));

  float vignette = smoothstep(1.25, 0.35, length(p * vec2(0.85, 0.95)));
  col *= mix(1.0, mix(0.84, 1.03, vignette), clamp(u_vignette, 0.0, 1.0));

  col = clamp((col - 0.5) * u_contrast + 0.5, 0.0, 1.0);
  vec3 srgb = toSRGB(col);

  // Analog paper grain: clamp vs fibre balance is seeded.
  vec2 pixelCoord = gl_FragCoord.xy;
  float fineGrain = hash12(pixelCoord + fract(u_seed) * 100.0) - 0.5;
  float clumpNoise = valueNoise(pixelCoord * 0.18 + seedOffset);
  float paperFiber = (valueNoise(pixelCoord * vec2(0.06, 0.45)) - 0.5) * 0.35;

  float luma = dot(srgb, vec3(0.299, 0.587, 0.114));
  float midtoneWeight = 1.0 - pow(abs(luma - 0.5) * 2.0, 1.6);

  float textureMix = mix(
    fineGrain * (0.35 + 0.85 * clumpNoise),
    paperFiber * 1.2,
    u_grainProfile * 0.55
  );
  float grain = textureMix * u_grainStrength * (0.45 + 0.75 * midtoneWeight);
  srgb += vec3(grain);

  // Subtle warm print bias.
  srgb = mix(srgb, srgb * vec3(1.015, 1.002, 0.975), 0.55);

  fragColor = vec4(clamp(srgb, 0.0, 1.0), 1.0);
}
`;
