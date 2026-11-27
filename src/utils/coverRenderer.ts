/**
 * One shared WebGL2 context for every cover on the page. Cards consume cached
 * data URLs, so we never create one GL context per post.
 */
import {
  COVER_PALETTES,
  createCoverParams,
  type CoverParams,
} from "./cover";
import { FRAGMENT_SHADER_SRC, VERTEX_SHADER_SRC } from "./coverShader";

const UNIFORM_NAMES = [
  "u_resolution",
  "u_seed",
  "u_composition",
  "u_zoom",
  "u_pan",
  "u_fieldBias",
  "u_noiseScale",
  "u_warpStrength",
  "u_grainStrength",
  "u_grainProfile",
  "u_lightPos",
  "u_lightStrength",
  "u_vignette",
  "u_accentStrength",
  "u_overprint",
  "u_bandCount",
  "u_contrast",
  "u_color0",
  "u_color1",
  "u_color2",
  "u_color3",
] as const;

type UniformName = (typeof UNIFORM_NAMES)[number];

function compileShader(
  gl: WebGL2RenderingContext,
  type: number,
  source: string,
): WebGLShader | null {
  const shader = gl.createShader(type);
  if (!shader) return null;

  gl.shaderSource(shader, source);
  gl.compileShader(shader);

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.warn("Cover shader compile failed:", gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}

function createProgram(gl: WebGL2RenderingContext): WebGLProgram | null {
  const vertex = compileShader(gl, gl.VERTEX_SHADER, VERTEX_SHADER_SRC);
  const fragment = compileShader(gl, gl.FRAGMENT_SHADER, FRAGMENT_SHADER_SRC);
  if (!vertex || !fragment) return null;

  const program = gl.createProgram();
  if (!program) return null;

  gl.attachShader(program, vertex);
  gl.attachShader(program, fragment);
  gl.linkProgram(program);
  gl.deleteShader(vertex);
  gl.deleteShader(fragment);

  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.warn("Cover shader link failed:", gl.getProgramInfoLog(program));
    gl.deleteProgram(program);
    return null;
  }
  return program;
}

function hexToVec3(hex: string): number[] {
  const value = hex.replace("#", "");
  return [
    parseInt(value.slice(0, 2), 16) / 255,
    parseInt(value.slice(2, 4), 16) / 255,
    parseInt(value.slice(4, 6), 16) / 255,
  ];
}

class CoverRenderer {
  private canvas: HTMLCanvasElement | null = null;
  private gl: WebGL2RenderingContext | null = null;
  private program: WebGLProgram | null = null;
  private vao: WebGLVertexArrayObject | null = null;
  private uniforms: Partial<Record<UniformName, WebGLUniformLocation | null>> = {};
  private cache = new Map<string, string>();
  private unavailable = false;

  private setup(): boolean {
    if (this.gl) return true;
    if (this.unavailable || typeof document === "undefined") return false;

    const canvas = document.createElement("canvas");
    const gl = canvas.getContext("webgl2", {
      preserveDrawingBuffer: true,
      antialias: true,
      alpha: false,
    });

    if (!gl) {
      this.unavailable = true;
      return false;
    }

    const program = createProgram(gl);
    if (!program) {
      this.unavailable = true;
      return false;
    }

    const vao = gl.createVertexArray();
    const buffer = gl.createBuffer();
    gl.bindVertexArray(vao);
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([
        -1, -1, 1, -1, -1, 1,
        -1, 1, 1, -1, 1, 1,
      ]),
      gl.STATIC_DRAW,
    );
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
    gl.bindVertexArray(null);

    for (const name of UNIFORM_NAMES) {
      this.uniforms[name] = gl.getUniformLocation(program, name);
    }

    canvas.addEventListener("webglcontextlost", (event) => {
      event.preventDefault();
      this.gl = null;
      this.program = null;
      this.vao = null;
      this.uniforms = {};
    });

    this.canvas = canvas;
    this.gl = gl;
    this.program = program;
    this.vao = vao;
    return true;
  }

  /** Render one frame offscreen and return it as a data URL. */
  render(params: CoverParams, width: number, height: number): string | null {
    if (!this.setup()) return null;
    const { canvas, gl, program, vao } = this;
    if (!canvas || !gl || !program || !vao) return null;

    canvas.width = width;
    canvas.height = height;
    gl.viewport(0, 0, width, height);
    gl.useProgram(program);
    gl.bindVertexArray(vao);

    const palette = COVER_PALETTES[params.palette % COVER_PALETTES.length];
    const colors = palette.colors.map(hexToVec3);

    gl.uniform2f(this.uniforms.u_resolution ?? null, width, height);
    gl.uniform1f(this.uniforms.u_seed ?? null, params.seed);
    gl.uniform1i(this.uniforms.u_composition ?? null, params.composition);
    gl.uniform1f(this.uniforms.u_zoom ?? null, params.zoom);
    gl.uniform2f(this.uniforms.u_pan ?? null, params.panX, params.panY);
    gl.uniform1f(this.uniforms.u_fieldBias ?? null, params.fieldBias);
    gl.uniform1f(this.uniforms.u_noiseScale ?? null, params.noiseScale);
    gl.uniform1f(this.uniforms.u_warpStrength ?? null, params.warpStrength);
    gl.uniform1f(this.uniforms.u_grainStrength ?? null, params.grainStrength);
    gl.uniform1f(this.uniforms.u_grainProfile ?? null, params.grainProfile);
    gl.uniform2f(this.uniforms.u_lightPos ?? null, params.lightX, params.lightY);
    gl.uniform1f(this.uniforms.u_lightStrength ?? null, params.lightStrength);
    gl.uniform1f(this.uniforms.u_vignette ?? null, params.vignette);
    gl.uniform1f(this.uniforms.u_accentStrength ?? null, params.accentStrength);
    gl.uniform1f(this.uniforms.u_overprint ?? null, params.overprint);
    gl.uniform1f(this.uniforms.u_bandCount ?? null, params.bandCount);
    gl.uniform1f(this.uniforms.u_contrast ?? null, params.contrast);

    gl.uniform3fv(this.uniforms.u_color0 ?? null, colors[0]);
    gl.uniform3fv(this.uniforms.u_color1 ?? null, colors[1]);
    gl.uniform3fv(this.uniforms.u_color2 ?? null, colors[2]);
    gl.uniform3fv(this.uniforms.u_color3 ?? null, colors[3]);

    gl.drawArrays(gl.TRIANGLES, 0, 6);
    gl.bindVertexArray(null);

    return canvas.toDataURL("image/webp", 0.9);
  }

  /** Seed → cached image. Repeated calls do no extra GL work. */
  get(seed: string, width = 640, height = 400): string | null {
    const key = `${seed}@${width}x${height}`;
    const cached = this.cache.get(key);
    if (cached) return cached;

    const image = this.render(createCoverParams(seed), width, height);
    if (image) this.cache.set(key, image);
    return image;
  }
}

export const coverRenderer = new CoverRenderer();

export function getCoverImage(seed: string, width?: number, height?: number) {
  return coverRenderer.get(seed, width, height);
}
