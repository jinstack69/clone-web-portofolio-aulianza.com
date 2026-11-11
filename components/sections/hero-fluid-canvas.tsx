'use client';

import React, { useRef, useEffect } from 'react';

const VERTEX_SHADER = `
attribute vec2 p;
void main() { gl_Position = vec4(p, 0.0, 1.0); }
`;

const FRAGMENT_SHADER = `
precision highp float;
uniform vec2 uRes;
uniform float uTime;
uniform vec2 uMouse;
uniform float uForce;

float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float noise(vec2 p) {
  vec2 i = floor(p), f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1, 0)), u.x), mix(hash(i + vec2(0, 1)), hash(i + vec2(1, 1)), u.x), u.y);
}
float fbm(vec2 p) {
  float v = 0.0, a = 0.5;
  for (int i = 0; i < 5; i++) { v += a * noise(p); p *= 2.02; a *= 0.5; }
  return v;
}

void main() {
  vec2 uv = gl_FragCoord.xy / uRes.xy;
  vec2 p = uv * vec2(uRes.x / uRes.y, 1.0) * 2.2;
  vec2 m = uMouse * vec2(uRes.x / uRes.y, 1.0) * 2.2;

  float d = distance(p, m);
  float ripple = sin(d * 14.0 - uTime * 5.0) * exp(-d * 2.4) * uForce;
  vec2 pull = normalize(p - m + 0.0001) * exp(-d * 1.8) * uForce * 0.6;

  float t = uTime * 0.07;
  vec2 q = vec2(fbm(p + t), fbm(p + vec2(5.2, 1.3) - t));
  vec2 r = vec2(fbm(p + 3.5 * q + vec2(1.7, 9.2) + t * 1.6 + pull), fbm(p + 3.5 * q + vec2(8.3, 2.8) - t));
  float f = fbm(p + 3.0 * r) + ripple * 0.18;

  vec3 night = vec3(0.027, 0.039, 0.102);
  vec3 deep = vec3(0.08, 0.11, 0.42);
  vec3 cobalt = vec3(0.184, 0.271, 1.0);
  vec3 lilac = vec3(0.455, 0.514, 1.0);
  vec3 col = mix(night, deep, smoothstep(0.15, 0.6, f));
  col = mix(col, cobalt, smoothstep(0.5, 0.85, f) * 0.85);
  col = mix(col, lilac, smoothstep(0.78, 1.0, f + length(q) * 0.15) * 0.6);
  col += vec3(0.25, 0.3, 1.0) * exp(-d * 3.0) * uForce * 0.35;

  // Keep the left side darker so the headline stays readable
  col *= mix(0.55, 1.0, smoothstep(0.0, 0.85, uv.x));
  col *= smoothstep(1.25, 0.35, length(uv - 0.5));
  gl_FragColor = vec4(col, 1.0);
}
`;

export function HeroFluidCanvas({ className }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext('webgl', { antialias: false, alpha: false });
    if (!gl) return;

    canvas.style.opacity = '1';

    const compileShader = (type: number, source: string) => {
      const shader = gl.createShader(type);
      if (!shader) return null;
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      return shader;
    };

    const vs = compileShader(gl.VERTEX_SHADER, VERTEX_SHADER);
    const fs = compileShader(gl.FRAGMENT_SHADER, FRAGMENT_SHADER);
    if (!vs || !fs) return;

    const program = gl.createProgram();
    if (!program) return;
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return;
    gl.useProgram(program);

    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]),
      gl.STATIC_DRAW
    );

    const pLoc = gl.getAttribLocation(program, 'p');
    gl.enableVertexAttribArray(pLoc);
    gl.vertexAttribPointer(pLoc, 2, gl.FLOAT, false, 0, 0);

    const uRes = gl.getUniformLocation(program, 'uRes');
    const uTime = gl.getUniformLocation(program, 'uTime');
    const uMouse = gl.getUniformLocation(program, 'uMouse');
    const uForce = gl.getUniformLocation(program, 'uForce');

    const handleResize = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = Math.max(1, Math.floor(0.6 * rect.width));
      canvas.height = Math.max(1, Math.floor(0.6 * rect.height));
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.uniform2f(uRes, canvas.width, canvas.height);
    };

    const mouse = { x: 0.7, y: 0.5, tx: 0.7, ty: 0.5, force: 0, target: 0 };
    const container = canvas.parentElement ?? canvas;

    const onPointerMove = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect();
      mouse.tx = (e.clientX - r.left) / r.width;
      mouse.ty = 1 - (e.clientY - r.top) / r.height;
      mouse.target = 1;
    };

    const onPointerLeave = () => {
      mouse.target = 0;
    };

    let animId = 0;
    let isVisible = true;
    let startTime = 0;

    const render = (now: number) => {
      if (!startTime) startTime = now;
      mouse.x += (mouse.tx - mouse.x) * 0.06;
      mouse.y += (mouse.ty - mouse.y) * 0.06;
      mouse.force += (mouse.target - mouse.force) * 0.04;

      gl.uniform1f(uTime, 12 + (now - startTime) / 1000);
      gl.uniform2f(uMouse, mouse.x, mouse.y);
      gl.uniform1f(uForce, mouse.force);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

      if (isVisible) {
        animId = requestAnimationFrame(render);
      }
    };

    const observer = new IntersectionObserver(([entry]) => {
      isVisible = entry.isIntersecting;
      cancelAnimationFrame(animId);
      if (isVisible) {
        animId = requestAnimationFrame(render);
      }
    });

    handleResize();
    observer.observe(canvas);
    container.addEventListener('pointermove', onPointerMove as EventListener);
    container.addEventListener('pointerleave', onPointerLeave as EventListener);
    window.addEventListener('resize', handleResize);
    animId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animId);
      observer.disconnect();
      container.removeEventListener('pointermove', onPointerMove as EventListener);
      container.removeEventListener('pointerleave', onPointerLeave as EventListener);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className={className}
      style={{ opacity: 0, transition: 'opacity 0.4s ease' }}
    />
  );
}
