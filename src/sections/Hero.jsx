import HeroText from "../components/HeroText";
import ParallaxBackground from "../components/parallaxBackground";
import { useMediaQuery } from "react-responsive";
import { Canvas, useFrame } from "@react-three/fiber";
import { useGLTF, OrbitControls } from "@react-three/drei";
import React, { useState, useEffect, useRef } from "react";

const base =
  typeof import.meta.env.BASE_URL !== "undefined"
    ? import.meta.env.BASE_URL
    : "/";

function KatussaModel(props) {
  const { scene } = useGLTF(base + "models/gorilla.glb");
  const [rotationY, setRotationY] = useState(Math.PI / 2);
  const [positionY, setPositionY] = useState(5); // Start from above
  const modelRef = useRef();

  useEffect(() => {
    // Initial drop-down animation
    let dropStart = null;
    let dropDuration = 3000; // 1 second drop
    let dropInitial = 10;
    let dropTarget = 0;

    function dropAnimate(ts) {
      if (!dropStart) dropStart = ts;
      const elapsed = ts - dropStart;
      if (elapsed < dropDuration) {
        const progress = elapsed / dropDuration;
        // Ease-out animation for smooth landing
        const easeOut = 1 - Math.pow(1 - progress, 3);
        setPositionY(dropInitial + (dropTarget - dropInitial) * easeOut);
        requestAnimationFrame(dropAnimate);
      } else {
        setPositionY(dropTarget);
      }
    }

    // Start drop animation immediately
    requestAnimationFrame(dropAnimate);

    // Rotation animation starts after model has dropped
    let start = null;
    let initial = Math.PI / 2;
    let target = -Math.PI / 1.5;
    let duration = 6000; // 6 seconds for smoother rotation

    function animate(ts) {
      if (!start) start = ts;
      const elapsed = ts - start;
      if (elapsed < duration) {
        const progress = elapsed / duration;
        setRotationY(initial + (target - initial) * progress);
        requestAnimationFrame(animate);
      } else {
        setRotationY(target);
      }
    }

    const timer = setTimeout(() => {
      requestAnimationFrame(animate);
    }, 1500); // Start rotation after drop completes

    return () => {
      clearTimeout(timer);
      start = null;
      dropStart = null;
    };
  }, []);

  // Add smooth floating motion after animations complete
  useFrame((state) => {
    if (modelRef.current) {
      // Gentle up and down floating motion
      modelRef.current.position.y = positionY + Math.sin(state.clock.elapsedTime * 0.8) * 0.1;
      // Slight rotation oscillation
      modelRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.6) * 0.05;
    }
  });

  return <primitive ref={modelRef} object={scene} rotation={[0, rotationY, 0]} {...props} />;
}

const Hero = () => {
  const isMobile = useMediaQuery({ maxWidth: 853 });
  const [show3DModel, setShow3DModel] = useState(false);

  useEffect(() => {
    // Show 3D model after 2 seconds
    const timer = setTimeout(() => {
      setShow3DModel(true);
    },50 );

    return () => clearTimeout(timer);
  }, []);

  return (
    <section className="flex items-start justify-center min-h-screen overflow-hidden md:items-start md:justify-start c-space">
      <HeroText />
      <ParallaxBackground />
      {show3DModel && (
        <div className="absolute inset-0 flex items-center justify-end pr-20 h-full w-full z-10">
          <Canvas
            camera={{ position: [0, 0, 5], fov: 50 }}
            style={{
              width: isMobile ? "100vw" : "1400px",
              height: isMobile ? "100vh" : "1400px", // full screen height for mobile
              maxWidth: "100%",
              maxHeight: "100%",
              zIndex: 10,
            }}
          >
            <ambientLight intensity={0.7} />
            <directionalLight position={[5, 5, 5]} intensity={1} />

            {/* Desktop position/scale unchanged | Mobile adjusted */}
            <group position={isMobile ? [0.3, -0.8, 0] : [0.9, 0, 0]}>
              <KatussaModel scale={isMobile ? 2 : 3.5} />
            </group>

            <OrbitControls enablePan={false} enableZoom={false} />
          </Canvas>
        </div>
      )}
    </section>
  );
};

export default Hero;
