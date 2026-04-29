import { Suspense, useRef, Component, ReactNode } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import {
  Environment,
  ContactShadows,
  PresentationControls,
  useGLTF,
  Float,
  Html,
} from "@react-three/drei";
import * as THREE from "three";

// Free hosted glb models from Khronos sample assets repo (verified live)
const KHRONOS = "https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Assets/main/Models";
export const MODELS = {
  chair: `${KHRONOS}/SheenChair/glTF-Binary/SheenChair.glb`,
  sofa:  `${KHRONOS}/GlamVelvetSofa/glTF-Binary/GlamVelvetSofa.glb`,
  hero:  `${KHRONOS}/SheenChair/glTF-Binary/SheenChair.glb`,
};

function Model({ url, scale = 1 }: { url: string; scale?: number }) {
  const { scene } = useGLTF(url);
  const ref = useRef<THREE.Group>(null);
  useFrame((_, delta) => {
    if (ref.current) ref.current.rotation.y += delta * 0.25;
  });
  return <primitive ref={ref} object={scene} scale={scale} />;
}

function Loader() {
  return (
    <Html center>
      <div className="text-xs uppercase tracking-widest text-muted animate-pulse">Loading 3D…</div>
    </Html>
  );
}

// Error boundary to keep model failures from crashing the whole page
class ThreeErrorBoundary extends Component<{ children: ReactNode; fallback: ReactNode }, { hasError: boolean }> {
  state = { hasError: false };
  static getDerivedStateFromError() { return { hasError: true }; }
  componentDidCatch(err: unknown) { console.warn("[3D] failed:", err); }
  render() { return this.state.hasError ? this.props.fallback : this.props.children; }
}

interface Props {
  url?: string;
  scale?: number;
  interactive?: boolean;
  className?: string;
  fallbackImage?: string;
}

export default function Product3D({
  url = MODELS.hero,
  scale = 6,
  interactive = true,
  className = "",
  fallbackImage = "https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?w=1200",
}: Props) {
  return (
    <div className={`w-full h-full ${className}`}>
      <ThreeErrorBoundary
        fallback={
          <img src={fallbackImage} alt="" className="w-full h-full object-cover" />
        }
      >
        <Canvas
          shadows
          dpr={[1, 2]}
          camera={{ position: [0, 0.5, 4], fov: 35 }}
          gl={{ antialias: true, preserveDrawingBuffer: true }}
        >
          <ambientLight intensity={0.4} />
          <directionalLight position={[5, 8, 5]} intensity={1.2} castShadow shadow-mapSize={[2048, 2048]} />
          <directionalLight position={[-5, 4, -5]} intensity={0.4} />

          <Suspense fallback={<Loader />}>
            {interactive ? (
              <PresentationControls
                global
                snap
                rotation={[0, 0, 0]}
                polar={[-0.4, 0.4]}
                azimuth={[-Math.PI / 2, Math.PI / 2]}
                config={{ mass: 2, tension: 200 }}
              >
                <Float rotationIntensity={0.3} floatIntensity={0.5} speed={1.2}>
                  <Model url={url} scale={scale} />
                </Float>
              </PresentationControls>
            ) : (
              <Float rotationIntensity={0.3} floatIntensity={0.5} speed={1.2}>
                <Model url={url} scale={scale} />
              </Float>
            )}

            <ContactShadows
              position={[0, -1.2, 0]}
              opacity={0.45}
              scale={10}
              blur={2.5}
              far={4}
            />
            <Environment preset="apartment" />
          </Suspense>
        </Canvas>
      </ThreeErrorBoundary>
    </div>
  );
}

useGLTF.preload(MODELS.hero);
