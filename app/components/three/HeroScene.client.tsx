import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

const NOISE = /* glsl */ `
vec3 mod289(vec3 x){return x-floor(x*(1.0/289.0))*289.0;}
vec2 mod289(vec2 x){return x-floor(x*(1.0/289.0))*289.0;}
vec3 permute(vec3 x){return mod289(((x*34.0)+1.0)*x);}
float snoise(vec2 v){
  const vec4 C=vec4(0.211324865405187,0.366025403784439,-0.577350269189626,0.024390243902439);
  vec2 i=floor(v+dot(v,C.yy));vec2 x0=v-i+dot(i,C.xx);
  vec2 i1=(x0.x>x0.y)?vec2(1.0,0.0):vec2(0.0,1.0);
  vec4 x12=x0.xyxy+C.xxzz;x12.xy-=i1;i=mod289(i);
  vec3 p=permute(permute(i.y+vec3(0.0,i1.y,1.0))+i.x+vec3(0.0,i1.x,1.0));
  vec3 m=max(0.5-vec3(dot(x0,x0),dot(x12.xy,x12.xy),dot(x12.zw,x12.zw)),0.0);m=m*m;m=m*m;
  vec3 x=2.0*fract(p*C.www)-1.0;vec3 h=abs(x)-0.5;vec3 ox=floor(x+0.5);vec3 a0=x-ox;
  m*=1.79284291400159-0.85373472095314*(a0*a0+h*h);
  vec3 g;g.x=a0.x*x0.x+h.x*x0.y;g.yz=a0.yz*x12.xz+h.yz*x12.yw;return 130.0*dot(m,g);
}`;

const VERT = /* glsl */ `
uniform float uTime; uniform vec2 uMouse; uniform float uPixelRatio; uniform float uReveal; uniform float uStrength; uniform float uIsLine;
attribute float aRandom;
varying float vAlpha; varying float vMix;
${NOISE}
void main(){
  vec3 p = position;
  float n = snoise(vec2(p.x*0.22 + uTime*0.10, p.y*0.22 - uTime*0.07));
  float n2 = snoise(vec2(p.x*0.7 - uTime*0.04, p.y*0.7 + uTime*0.09));
  float d = distance(p.xy, uMouse);
  float influence = smoothstep(2.6, 0.0, d) * uStrength;
  float ring = smoothstep(0.35, 0.0, abs(d - mod(uTime*0.9, 4.0))) * uStrength * 0.35;
  p.z += n*0.42 + n2*0.14 + influence*0.55*(0.6+0.4*sin(uTime*2.2 + d*3.0));
  vec4 mv = modelViewMatrix * vec4(p, 1.0);
  gl_Position = projectionMatrix * mv;
  float scan = smoothstep(0.5, 0.0, abs(mod(uTime*0.28 + p.x*0.045 - p.y*0.09, 3.0) - 1.5));
  float base = mix(0.18, 0.38, 0.5+0.5*n2);
  float fade = smoothstep(-6.2, -4.2, p.y) * smoothstep(6.2, 3.6, p.y) * smoothstep(10.0, 4.0, abs(p.x));
  vAlpha = (base + influence*0.75 + ring + scan*0.3) * uReveal * fade * (uIsLine > 0.5 ? 0.38 : 1.0);
  vMix = clamp(influence + ring*0.6, 0.0, 1.0);
  gl_PointSize = (3.0 + influence*3.2 + aRandom*1.4) * uPixelRatio * (9.0 / -mv.z);
}`;

const FRAG = /* glsl */ `
uniform vec3 uAccent; uniform vec3 uAccent2; uniform float uIsLine;
varying float vAlpha; varying float vMix;
void main(){
  float soft = 1.0;
  if (uIsLine < 0.5) {
    vec2 c = gl_PointCoord - 0.5; float r = length(c);
    if (r > 0.5) discard;
    soft = smoothstep(0.5, 0.15, r);
  }
  vec3 col = mix(uAccent2, uAccent, vMix);
  gl_FragColor = vec4(col, vAlpha * soft);
  #include <colorspace_fragment>
}`;

interface LatticeProps {
  accent: string;
  accent2: string;
  cols: number;
  rows: number;
}

function Lattice({ accent, accent2, cols, rows }: LatticeProps) {
  const pointsRef = useRef<THREE.Points>(null);
  const linesRef = useRef<THREE.LineSegments>(null);
  const { viewport, pointer } = useThree();
  const mouse = useRef(new THREE.Vector2(0, -2));
  const target = useRef(new THREE.Vector2(0, -2));
  const strength = useRef(0);
  const auto = useRef(true);
  const lastMove = useRef(0);
  const revealStart = useRef<number | null>(null);

  const { geometry, lineGeometry } = useMemo(() => {
    const spacingX = 0.13;
    const spacingY = 0.13;
    const count = cols * rows;
    const positions = new Float32Array(count * 3);
    const randoms = new Float32Array(count);
    let i = 0;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        positions[i * 3] = (c - cols / 2) * spacingX;
        positions[i * 3 + 1] = (r - rows / 2) * spacingY;
        positions[i * 3 + 2] = 0;
        randoms[i] = Math.random();
        i++;
      }
    }
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute("aRandom", new THREE.BufferAttribute(randoms, 1));

    const indices: number[] = [];
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const idx = r * cols + c;
        if (c < cols - 1 && r % 4 === 0) indices.push(idx, idx + 1);
        if (r < rows - 1 && c % 4 === 0) indices.push(idx, idx + cols);
      }
    }
    const lineGeometry = new THREE.BufferGeometry();
    lineGeometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    lineGeometry.setAttribute("aRandom", new THREE.BufferAttribute(randoms, 1));
    lineGeometry.setIndex(indices);
    return { geometry, lineGeometry };
  }, [cols, rows]);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uMouse: { value: new THREE.Vector2(0, -2) },
      uPixelRatio: { value: Math.min(typeof window !== "undefined" ? window.devicePixelRatio : 1, 1.5) },
      uReveal: { value: 0 },
      uStrength: { value: 0 },
      uAccent: { value: new THREE.Color(accent) },
      uAccent2: { value: new THREE.Color(accent2) },
      uIsLine: { value: 0 },
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );
  const lineUniforms = useMemo(() => ({ ...uniforms, uIsLine: { value: 1 } }), [uniforms]);

  // Materials are created imperatively so uniform mutations in useFrame always reach the GPU.
  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        uniforms,
        vertexShader: VERT,
        fragmentShader: FRAG,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      }),
    [uniforms],
  );
  const lineMaterial = useMemo(
    () =>
      new THREE.ShaderMaterial({
        uniforms: lineUniforms,
        vertexShader: VERT,
        fragmentShader: FRAG,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      }),
    [lineUniforms],
  );

  useEffect(
    () => () => {
      material.dispose();
      lineMaterial.dispose();
      geometry.dispose();
      lineGeometry.dispose();
    },
    [material, lineMaterial, geometry, lineGeometry],
  );

  useEffect(() => {
    uniforms.uAccent.value.set(accent);
    uniforms.uAccent2.value.set(accent2);
  }, [accent, accent2, uniforms]);

  useEffect(() => {
    const onMove = () => {
      auto.current = false;
      lastMove.current = performance.now();
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, []);

  const plane = useMemo(() => new THREE.Plane(new THREE.Vector3(0, 0, 1), 0), []);
  const ray = useMemo(() => new THREE.Raycaster(), []);
  const hit = useMemo(() => new THREE.Vector3(), []);

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime;

    // Deriva de cámara: un movimiento lento y continuo, como una toma sostenida.
    const scroll = typeof window !== "undefined" ? Math.min(window.scrollY / Math.max(window.innerHeight, 1), 1) : 0;
    const cam = state.camera;
    cam.position.x += (Math.sin(t * 0.12) * 0.45 - cam.position.x) * 0.02;
    cam.position.y += (1.2 + Math.sin(t * 0.09) * 0.18 + scroll * 1.1 - cam.position.y) * 0.02;
    cam.position.z += (6.2 - scroll * 1.6 - cam.position.z) * 0.02;
    cam.lookAt(0, -0.6 + scroll * 0.5, 0);
    if (revealStart.current === null) revealStart.current = t;
    const reveal = THREE.MathUtils.clamp((t - revealStart.current) / 2.4, 0, 1);
    uniforms.uReveal.value = reveal * reveal * (3 - 2 * reveal);
    uniforms.uTime.value = t;

    if (!auto.current && performance.now() - lastMove.current > 4000) auto.current = true;

    if (auto.current) {
      target.current.set(Math.sin(t * 0.35) * viewport.width * 0.28, Math.cos(t * 0.27) * viewport.height * 0.22 - 0.4);
      strength.current += (0.9 - strength.current) * 0.02;
    } else {
      ray.setFromCamera(pointer, state.camera);
      const mesh = pointsRef.current;
      if (mesh) {
        plane.normal.set(0, 0, 1).applyQuaternion(mesh.quaternion);
        plane.constant = -plane.normal.dot(mesh.position);
        if (ray.ray.intersectPlane(plane, hit)) {
          mesh.worldToLocal(hit);
          target.current.set(hit.x, hit.y);
        }
      }
      strength.current += (1 - strength.current) * 0.08;
    }
    mouse.current.lerp(target.current, 1 - Math.pow(0.001, delta));
    uniforms.uMouse.value.copy(mouse.current);
    uniforms.uStrength.value = strength.current;
  });

  const rotation: [number, number, number] = [-0.95, 0, 0];
  const position: [number, number, number] = [0, -1.6, 0];

  return (
    <group>
      <points ref={pointsRef} geometry={geometry} material={material} rotation={rotation} position={position} frustumCulled={false} />
      <lineSegments ref={linesRef} geometry={lineGeometry} material={lineMaterial} rotation={rotation} position={position} frustumCulled={false} />
    </group>
  );
}

export default function HeroScene({ accent, accent2 }: { accent: string; accent2: string }) {
  const [active, setActive] = useState(true);
  const wrap = useRef<HTMLDivElement>(null);
  const small = typeof window !== "undefined" && window.innerWidth < 768;
  const cols = small ? 70 : 150;
  const rows = small ? 70 : 90;

  useEffect(() => {
    const el = wrap.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setActive(e.isIntersecting), { threshold: 0.05 });
    io.observe(el);
    const onVis = () => setActive(!document.hidden);
    document.addEventListener("visibilitychange", onVis);
    return () => {
      io.disconnect();
      document.removeEventListener("visibilitychange", onVis);
    };
  }, []);

  return (
    <div ref={wrap} className="absolute inset-0" aria-hidden="true">
      <Canvas
        dpr={[1, 1.5]}
        frameloop={active ? "always" : "never"}
        camera={{ position: [0, 1.2, 6.2], fov: 50, near: 0.1, far: 60 }}
        gl={{ antialias: false, alpha: true, powerPreference: "high-performance" }}
        eventSource={typeof document !== "undefined" ? document.body : undefined}
        eventPrefix="client"
        style={{ pointerEvents: "none" }}
      >
        <Lattice accent={accent} accent2={accent2} cols={cols} rows={rows} />
      </Canvas>
    </div>
  );
}
