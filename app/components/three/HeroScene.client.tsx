import { Component, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface Props { accent: string; accent2: string; scene: string; intensity: number; speed: number }
const vertex = `
uniform float uTime; uniform float uScroll; uniform float uShape;
attribute vec2 aParam;
varying float vLight;
void main() {
  float a = aParam.x; float b = aParam.y;
  float r = 1.65 + .48 * cos(b);
  vec3 orbit = vec3(r*cos(a), .48*sin(b), r*sin(a));
  orbit.y += .16 * sin(a*3. + b + uTime*.25);
  float x = (a/6.2831853-.5)*5.8;
  float z = (b/6.2831853-.5)*5.8;
  vec3 field = vec3(x, sin(x*1.4 + uTime*.5)*cos(z*1.1+uTime*.2)*.45, z);
  vec3 p = mix(orbit, field, uShape);
  p.y += sin(a*2. + uTime*.3)*uScroll*.3;
  p.xz *= 1. + uScroll*.32;
  vLight = .35 + .65*pow(.5+.5*sin(a + b*.4 + uTime*.25),2.);
  gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.);
}`;
const fragment = `
uniform vec3 uAccent; uniform vec3 uAccent2; uniform float uIntensity;
varying float vLight;
void main() {
  vec3 color = mix(uAccent2, uAccent, vLight);
  color = mix(color, vec3(.88,.96,1.), pow(vLight, 8.)*.65);
  gl_FragColor = vec4(color, (.13 + vLight*.43)*uIntensity);
  #include <colorspace_fragment>
}`;

function Field({ accent, accent2, scene, intensity, speed }: Props) {
  const group = useRef<THREE.Group>(null);
  const scroll = useRef(0);
  const pointer = useRef({ x: 0, y: 0 });
  const elapsed = useRef(0);
  const { geometry, dust } = useMemo(() => {
    // Parametric curves, one draw call. No textures or per-frame allocations.
    const coords: number[] = [], params: number[] = [];
    const rings = 52, segments = 200;
    for (let ring = 0; ring < rings; ring++) {
      for (let j = 0; j < segments; j++) {
        for (const step of [j, j + 1]) {
          coords.push(0, 0, 0);
          params.push(step / segments * Math.PI * 2, ring / rings * Math.PI * 2);
        }
      }
    }
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.Float32BufferAttribute(coords, 3));
    geometry.setAttribute("aParam", new THREE.Float32BufferAttribute(params, 2));
    const positions = new Float32Array(420 * 3);
    for (let i = 0; i < 420; i++) {
      // Deterministic sparse points; the composition remains stable on every visit.
      const h = (n: number) => { const x = Math.sin(n * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
      positions[i*3] = (h(i+1)-.5)*12;
      positions[i*3+1] = (h(i+421)-.5)*8;
      positions[i*3+2] = (h(i+841)-.5)*7;
    }
    const dust = new THREE.BufferGeometry();
    dust.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    return { geometry, dust };
  }, []);
  const uniforms = useMemo(() => ({
    uTime: { value: 0 }, uScroll: { value: 0 }, uShape: { value: 0 },
    uAccent: { value: new THREE.Color(accent) }, uAccent2: { value: new THREE.Color(accent2) },
    uIntensity: { value: intensity / 75 },
  }), []);
  const material = useMemo(() => new THREE.ShaderMaterial({ uniforms, vertexShader: vertex, fragmentShader: fragment, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }), [uniforms]);
  useEffect(() => {
    uniforms.uAccent.value.set(accent); uniforms.uAccent2.value.set(accent2);
    uniforms.uIntensity.value = intensity / 75;
    uniforms.uShape.value = scene === "waves" || scene === "grid" ? 1 : 0;
  }, [accent, accent2, scene, intensity, uniforms]);
  useEffect(() => {
    const onScroll = () => { scroll.current = Math.min(window.scrollY / Math.max(window.innerHeight, 1), 1.5); };
    const onMove = (e: PointerEvent) => { pointer.current.x = e.clientX / window.innerWidth - .5; pointer.current.y = e.clientY / window.innerHeight - .5; };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => { window.removeEventListener("scroll", onScroll); window.removeEventListener("pointermove", onMove); };
  }, []);
  useEffect(() => () => { geometry.dispose(); dust.dispose(); material.dispose(); }, [geometry, dust, material]);
  useFrame((_, delta) => {
    const dt = Math.min(delta, .05);
    elapsed.current += dt * speed / 30;
    uniforms.uTime.value = scene === "grid" ? 0 : elapsed.current;
    uniforms.uScroll.value = THREE.MathUtils.damp(uniforms.uScroll.value, scroll.current, 3, dt);
    if (group.current) {
      const t = elapsed.current;
      group.current.rotation.x = THREE.MathUtils.damp(group.current.rotation.x, .52 + pointer.current.y*.12 + scroll.current*.3, 3, dt);
      group.current.rotation.z = THREE.MathUtils.damp(group.current.rotation.z, -.43 + pointer.current.x*.13 + scroll.current*.12, 3, dt);
      group.current.rotation.y = t * .035;
    }
  });
  return <>
    <group ref={group} rotation={[.52, 0, -.43]}>
      <lineSegments geometry={geometry} material={material} frustumCulled={false} />
    </group>
    <points geometry={dust}>
      <pointsMaterial color="#cedee9" size={.012} transparent opacity={.5} sizeAttenuation depthWrite={false} />
    </points>
  </>;
}

class SceneBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  render() { return this.state.failed ? null : this.props.children; }
}

export default function HeroScene(props: Props) {
  const wrap = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(true);
  useEffect(() => {
    let visible = true;
    const update = () => setActive(visible && !document.hidden);
    const io = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; update(); });
    if (wrap.current) io.observe(wrap.current);
    document.addEventListener("visibilitychange", update);
    return () => { io.disconnect(); document.removeEventListener("visibilitychange", update); };
  }, []);
  return <div ref={wrap} className="cosmic-canvas" aria-hidden="true">
    <SceneBoundary>
      <Canvas camera={{ position: [0, .25, 6.1], fov: 45 }} dpr={[1, 1.5]} gl={{ alpha: true, antialias: false, powerPreference: "low-power" }} frameloop={active ? "always" : "never"}>
        <Field {...props} />
      </Canvas>
    </SceneBoundary>
  </div>;
}
