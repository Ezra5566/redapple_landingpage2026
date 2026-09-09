import { Suspense, useMemo, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { ContactShadows, Sparkles, OrbitControls, Float } from '@react-three/drei';
import * as THREE from 'three';
import { scrollState } from '../lib/scrollState';

/** Is this a mouse/trackpad device? Touch devices get auto-rotation only,
 *  so the canvas never swallows vertical page scrolling. */
function useFinePointer(): boolean {
  return useMemo(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return true;
    return window.matchMedia('(pointer: fine)').matches;
  }, []);
}

/** Smoothstep easing — Apple-style gentle start/end. */
const smooth = (t: number) => t * t * (3 - 2 * t);

/**
 * Glossy "apple body" sphere with a red rim + thin glowing orbit rings.
 * Everything responds to scroll:
 *
 *  - the group recedes, rises and rotates away as you scroll (0 → 1)
 *  - ring emissive intensity breathes with the scroll
 *  - scroll *velocity* injects a temporary ring glow + spin boost that
 *    decays back to rest — the scene "feels" fast scrolling
 */
function Core() {
  const root = useRef<THREE.Group>(null);
  const body = useRef<THREE.Mesh>(null);
  const ring = useRef<THREE.Mesh>(null);
  const ring2 = useRef<THREE.Mesh>(null);
  const ringMat = useRef<THREE.MeshStandardMaterial>(null);
  const ring2Mat = useRef<THREE.MeshStandardMaterial>(null);

  // persistent mutable frame-state (avoids re-allocating per frame)
  const fx = useRef({ boost: 0, boost2: 0 });

  useFrame((state, dt) => {
    const { progress, velocity } = scrollState;
    const d = Math.min(dt, 0.05); // clamp tab-switch spikes

    // ---- scroll-driven transforms (the Apple "product recedes" move) ----
    if (root.current) {
      const p = smooth(progress);
      root.current.position.y = p * 2.6; // rises away from the viewer
      root.current.position.z = -p * 5.5; // recedes into depth
      root.current.rotation.y += d * (0.12 + Math.abs(velocity) * 0.004); // spin speeds up with flicks
      root.current.rotation.x = p * 0.55; // tips over as it leaves
      // camera-relative scale — subtle shrink so the object feels far
      const s = 1 - p * 0.25;
      root.current.scale.setScalar(s);
    }

    // ---- velocity impulse: ring glow + spin that decays to rest ----
    fx.current.boost += Math.abs(velocity) * 0.012;
    fx.current.boost *= Math.pow(0.001, d); // fast exponential decay
    fx.current.boost = Math.min(fx.current.boost, 3.5);
    fx.current.boost2 += Math.abs(velocity) * 0.006;
    fx.current.boost2 *= Math.pow(0.002, d);
    fx.current.boost2 = Math.min(fx.current.boost2, 2);

    if (ring.current) ring.current.rotation.z += d * (0.18 + fx.current.boost * 0.9);
    if (ringMat.current) {
      const target = 2.4 + fx.current.boost * 1.6 + progress * -1.2; // dims as it recedes
      ringMat.current.emissiveIntensity = THREE.MathUtils.lerp(
        ringMat.current.emissiveIntensity,
        Math.max(0.4, target),
        0.1,
      );
    }
    if (ring2Mat.current) {
      const target2 = 1.1 + fx.current.boost2 * 1.4;
      ring2Mat.current.emissiveIntensity = THREE.MathUtils.lerp(
        ring2Mat.current.emissiveIntensity,
        Math.max(0.3, target2),
        0.1,
      );
    }

    // ---- pointer parallax (unchanged feel, slightly softer under scroll) ----
    const { x, y } = state.pointer;
    const soften = 1 - progress * 0.5;
    if (body.current) {
      body.current.rotation.x = THREE.MathUtils.lerp(
        body.current.rotation.x,
        y * 0.25 * soften,
        0.04,
      );
    }
    if (ring.current) {
      ring.current.rotation.x = THREE.MathUtils.lerp(
        ring.current.rotation.x,
        (Math.PI / 2.4 + y * 0.3) * soften,
        0.04,
      );
      ring.current.rotation.y = THREE.MathUtils.lerp(ring.current.rotation.y, x * 0.4 * soften, 0.04);
    }
  });

  return (
    <group ref={root}>
      {/* the body */}
      <mesh ref={body} castShadow>
        <sphereGeometry args={[1.55, 96, 96]} />
        <meshPhysicalMaterial
          color="#0a0a0c"
          metalness={0.55}
          roughness={0.18}
          clearcoat={1}
          clearcoatRoughness={0.08}
          reflectivity={0.9}
        />
      </mesh>

      {/* the red orbit ring — brand-mark energy */}
      <mesh ref={ring} rotation={[Math.PI / 2.4, 0, 0]}>
        <torusGeometry args={[2.35, 0.035, 32, 220]} />
        <meshStandardMaterial ref={ringMat} color="#dc2626" emissive="#dc2626" emissiveIntensity={2.4} toneMapped={false} />
      </mesh>

      {/* secondary faint ring for depth */}
      <mesh ref={ring2} rotation={[Math.PI / 1.7, 0.4, 0]}>
        <torusGeometry args={[2.75, 0.014, 24, 220]} />
        <meshStandardMaterial
          ref={ring2Mat}
          color="#ef4444"
          emissive="#ef4444"
          emissiveIntensity={1.1}
          transparent
          opacity={0.55}
          toneMapped={false}
        />
      </mesh>

      {/* floating satellites — drift away faster than the core on scroll */}
      <Float speed={2.2} rotationIntensity={0.6} floatIntensity={1.4}>
        <mesh position={[2.9, 1.15, -0.6]}>
          <icosahedronGeometry args={[0.16, 0]} />
          <meshStandardMaterial color="#fff" emissive="#fff" emissiveIntensity={0.6} />
        </mesh>
      </Float>
      <Float speed={1.6} rotationIntensity={0.4} floatIntensity={1.8}>
        <mesh position={[-3.05, -0.9, 0.4]}>
          <octahedronGeometry args={[0.12, 0]} />
          <meshStandardMaterial color="#dc2626" emissive="#dc2626" emissiveIntensity={1.6} />
        </mesh>
      </Float>
      <Float speed={1.9} rotationIntensity={0.5} floatIntensity={1.2}>
        <mesh position={[-2.4, 1.5, -1.2]}>
          <sphereGeometry args={[0.09, 32, 32]} />
          <meshStandardMaterial color="#fff" emissive="#fff" emissiveIntensity={0.4} />
        </mesh>
      </Float>
    </group>
  );
}

function Lighting() {
  return (
    <>
      {/* key light — white studio */}
      <spotLight position={[6, 8, 6]} angle={0.5} penumbra={1} intensity={220} color="#ffffff" castShadow />
      {/* red rim from behind-left — brand glow on the sphere edge */}
      <spotLight position={[-7, 3, -5]} angle={0.6} penumbra={1} intensity={180} color="#dc2626" />
      {/* cool fill from the right for contrast */}
      <pointLight position={[5, -3, 4]} intensity={30} color="#93c5fd" />
      <ambientLight intensity={0.25} />
    </>
  );
}

export default function HeroScene() {
  const finePointer = useFinePointer();

  return (
    <Canvas
      dpr={[1, 2]}
      shadows
      camera={{ position: [0, 0.4, 7.2], fov: 42 }}
      gl={{ antialias: true, alpha: true }}
      className="!absolute inset-0"
    >
      <Suspense fallback={null}>
        <Lighting />
        <Core />

        {/* red-tinted dust field — thins out as you scroll away */}
        <Sparkles count={110} scale={[11, 7, 6]} size={2.2} speed={0.32} color="#f87171" opacity={0.55} />
        <Sparkles count={60} scale={[12, 8, 7]} size={1.6} speed={0.22} color="#ffffff" opacity={0.4} />
        <ContactShadows position={[0, -2.35, 0]} opacity={0.55} scale={12} blur={2.8} far={4} color="#dc2626" />

        {/* drag to rotate — desktop pointers only, so touch scroll stays free */}
        {finePointer && (
          <OrbitControls
            enableZoom={false}
            enablePan={false}
            rotateSpeed={0.45}
            minPolarAngle={Math.PI / 3.1}
            maxPolarAngle={Math.PI / 1.75}
          />
        )}
      </Suspense>
    </Canvas>
  );
}
