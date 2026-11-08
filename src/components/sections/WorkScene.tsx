"use client";

import { useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { gsap } from "@/lib/gsap";

export type PointerRef = React.RefObject<{ x: number; y: number; over: boolean }>;

const IDLE = { x: 0.5, y: 0.5, over: false };

const vertex = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position.xy, 0.0, 1.0);
  }
`;

const fragment = /* glsl */ `
  uniform float uTime;
  uniform float uProgress;
  uniform float uHover;
  uniform vec2 uMouse;
  uniform vec2 uRes;
  uniform vec3 uA; uniform vec3 uB; uniform vec3 uC;
  uniform vec3 uPA; uniform vec3 uPB; uniform vec3 uPC;
  varying vec2 vUv;

  float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
  float noise(vec2 p) {
    vec2 i = floor(p), f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
               mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
  }
  float fbm(vec2 p) {
    float v = 0.0, a = 0.5;
    for (int i = 0; i < 5; i++) { v += a * noise(p); p *= 2.02; a *= 0.5; }
    return v;
  }
  // Domain-warped noise painted with a three-colour palette
  vec3 paint(vec2 p, vec3 a, vec3 b, vec3 c, float t) {
    vec2 q = vec2(fbm(p * 1.6 + t * 0.07), fbm(p * 1.6 + vec2(5.2, 1.3) - t * 0.05));
    float f = fbm(p * 2.2 + q * 2.0 + t * 0.04);
    vec3 col = mix(b, a, smoothstep(0.28, 0.78, f));
    col = mix(col, c, smoothstep(0.55, 0.95, f * q.y * 1.9));
    return col;
  }

  void main() {
    vec2 aspect = vec2(uRes.x / uRes.y, 1.0);
    vec2 uv = vUv;

    // Ripple around the cursor while hovering
    vec2 d = (uv - uMouse) * aspect;
    float dist = length(d);
    uv += normalize(d + 1e-5) * 0.025 * uHover * exp(-dist * 5.0) * sin(dist * 28.0 - uTime * 4.0);

    vec2 p = uv * aspect;
    vec3 cur = paint(p, uA, uB, uC, uTime);
    vec3 prev = paint(p, uPA, uPB, uPC, uTime);

    // New palette wipes up from the bottom with a soft, noisy edge
    float edge = uProgress * 1.4 - 0.2;
    float m = 1.0 - smoothstep(edge - 0.06, edge + 0.06, vUv.y + (fbm(p * 3.0) - 0.5) * 0.3);
    vec3 col = mix(prev, cur, m);

    col *= 1.0 - 0.45 * pow(length(vUv - 0.5), 2.0);       // vignette
    col += (hash(vUv * uRes + fract(uTime)) - 0.5) * 0.05;  // grain
    gl_FragColor = vec4(col, 1.0);
    #include <colorspace_fragment>
  }
`;

type U<T> = { value: T };
type Uniforms = {
  uTime: U<number>;
  uProgress: U<number>;
  uHover: U<number>;
  uMouse: U<THREE.Vector2>;
  uRes: U<THREE.Vector2>;
} & Record<"uA" | "uB" | "uC" | "uPA" | "uPB" | "uPC", U<THREE.Color>>;

function Plane({ colors, pointer }: { colors: [string, string, string]; pointer?: PointerRef }) {
  // Uniforms are mutated through the material ref (React Compiler forbids mutating memo values)
  const material = useRef<THREE.ShaderMaterial>(null);
  const initialUniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uProgress: { value: 1 },
      uHover: { value: 0 },
      uMouse: { value: new THREE.Vector2(0.5, 0.5) },
      uRes: { value: new THREE.Vector2(1, 1) },
      uA: { value: new THREE.Color(colors[0]) },
      uB: { value: new THREE.Color(colors[1]) },
      uC: { value: new THREE.Color(colors[2]) },
      uPA: { value: new THREE.Color(colors[0]) },
      uPB: { value: new THREE.Color(colors[1]) },
      uPC: { value: new THREE.Color(colors[2]) },
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  const first = useRef(true);
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    const u = material.current!.uniforms as Uniforms;
    u.uPA.value.copy(u.uA.value);
    u.uPB.value.copy(u.uB.value);
    u.uPC.value.copy(u.uC.value);
    u.uA.value.set(colors[0]);
    u.uB.value.set(colors[1]);
    u.uC.value.set(colors[2]);
    const tween = gsap.fromTo(u.uProgress, { value: 0 }, { value: 1, duration: 1.2, ease: "out" });
    return () => {
      tween.progress(1).kill();
    };
  }, [colors]);

  useFrame((state, delta) => {
    const u = material.current!.uniforms as Uniforms;
    u.uTime.value += delta;
    u.uRes.value.set(state.size.width, state.size.height);
    const p = pointer?.current ?? IDLE;
    const k = 1 - Math.pow(0.001, delta);
    u.uHover.value += ((p.over ? 1 : 0) - u.uHover.value) * k;
    u.uMouse.value.x += (p.x - u.uMouse.value.x) * k;
    u.uMouse.value.y += (p.y - u.uMouse.value.y) * k;
  });

  return (
    <mesh frustumCulled={false}>
      <planeGeometry args={[2, 2]} />
      <shaderMaterial
        ref={material}
        vertexShader={vertex}
        fragmentShader={fragment}
        uniforms={initialUniforms}
        depthWrite={false}
      />
    </mesh>
  );
}

export default function WorkScene({
  colors,
  paused,
  pointer,
}: {
  colors: [string, string, string];
  paused: boolean;
  pointer?: PointerRef;
}) {
  return (
    <Canvas
      flat
      dpr={[1, 1.75]}
      frameloop={paused ? "demand" : "always"}
      gl={{ antialias: false, alpha: false, powerPreference: "high-performance" }}
      style={{ position: "absolute", inset: 0 }}
    >
      <Plane colors={colors} pointer={pointer} />
    </Canvas>
  );
}
