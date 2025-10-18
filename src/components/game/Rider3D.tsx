import { useRef, useEffect } from 'react';
import { Group } from 'three';
import { useFrame } from '@react-three/fiber';

interface Rider3DProps {
  action?: 'kick-left' | 'kick-right' | 'punch-left' | 'punch-right' | null;
  color: string;
}

export const Rider3D = ({ action, color }: Rider3DProps) => {
  const riderRef = useRef<Group>(null);
  const leftArmRef = useRef<Group>(null);
  const rightArmRef = useRef<Group>(null);
  const leftLegRef = useRef<Group>(null);
  const rightLegRef = useRef<Group>(null);
  
  const animationProgress = useRef(0);

  useFrame((state, delta) => {
    if (!riderRef.current) return;

    // Animate based on action
    if (action) {
      animationProgress.current = Math.min(animationProgress.current + delta * 8, 1);
    } else {
      animationProgress.current = Math.max(animationProgress.current - delta * 10, 0);
    }

    const progress = animationProgress.current;

    // Reset positions
    if (leftArmRef.current) {
      leftArmRef.current.rotation.x = -0.3;
      leftArmRef.current.position.x = 0.25;
    }
    if (rightArmRef.current) {
      rightArmRef.current.rotation.x = -0.3;
      rightArmRef.current.position.x = -0.25;
    }
    if (leftLegRef.current) {
      leftLegRef.current.rotation.x = 0.5;
    }
    if (rightLegRef.current) {
      rightLegRef.current.rotation.x = 0.5;
    }

    // Apply action animations
    if (action === 'kick-left' && leftLegRef.current) {
      leftLegRef.current.rotation.x = 0.5 - progress * 1.2;
      leftLegRef.current.position.x = 0.15 - progress * 0.4;
    } else if (action === 'kick-right' && rightLegRef.current) {
      rightLegRef.current.rotation.x = 0.5 - progress * 1.2;
      rightLegRef.current.position.x = -0.15 + progress * 0.4;
    } else if (action === 'punch-left' && leftArmRef.current) {
      leftArmRef.current.rotation.x = -0.3 - progress * 1.5;
      leftArmRef.current.position.x = 0.25 - progress * 0.5;
      leftArmRef.current.position.z = progress * 0.6;
    } else if (action === 'punch-right' && rightArmRef.current) {
      rightArmRef.current.rotation.x = -0.3 - progress * 1.5;
      rightArmRef.current.position.x = -0.25 + progress * 0.5;
      rightArmRef.current.position.z = progress * 0.6;
    }

    // Slight idle bobbing
    if (!action) {
      riderRef.current.position.y = Math.sin(state.clock.elapsedTime * 3) * 0.02;
    }
  });

  return (
    <group ref={riderRef} position={[0, 0.5, -0.1]}>
      {/* Torso */}
      <mesh position={[0, 0.3, 0]} castShadow>
        <boxGeometry args={[0.35, 0.5, 0.25]} />
        <meshStandardMaterial color="#2a2a2a" />
      </mesh>
      
      {/* Head */}
      <group position={[0, 0.7, 0]}>
        {/* Helmet */}
        <mesh castShadow>
          <sphereGeometry args={[0.15, 16, 16]} />
          <meshStandardMaterial 
            color={color} 
            metalness={0.9} 
            roughness={0.1}
            emissive={color}
            emissiveIntensity={0.2}
          />
        </mesh>
        {/* Visor */}
        <mesh position={[0, 0, 0.12]}>
          <boxGeometry args={[0.25, 0.08, 0.05]} />
          <meshStandardMaterial 
            color="#000000" 
            transparent
            opacity={0.7}
            metalness={1}
            roughness={0}
          />
        </mesh>
      </group>

      {/* Left Arm */}
      <group ref={leftArmRef} position={[0.25, 0.25, 0]}>
        {/* Upper arm */}
        <mesh position={[0, -0.15, 0]} castShadow>
          <cylinderGeometry args={[0.06, 0.06, 0.3]} />
          <meshStandardMaterial color="#2a2a2a" />
        </mesh>
        {/* Lower arm */}
        <mesh position={[0, -0.35, 0]} castShadow>
          <cylinderGeometry args={[0.05, 0.05, 0.25]} />
          <meshStandardMaterial color="#2a2a2a" />
        </mesh>
        {/* Hand/Glove */}
        <mesh position={[0, -0.5, 0]} castShadow>
          <sphereGeometry args={[0.07, 12, 12]} />
          <meshStandardMaterial color="#ff3300" metalness={0.3} roughness={0.7} />
        </mesh>
      </group>

      {/* Right Arm */}
      <group ref={rightArmRef} position={[-0.25, 0.25, 0]}>
        {/* Upper arm */}
        <mesh position={[0, -0.15, 0]} castShadow>
          <cylinderGeometry args={[0.06, 0.06, 0.3]} />
          <meshStandardMaterial color="#2a2a2a" />
        </mesh>
        {/* Lower arm */}
        <mesh position={[0, -0.35, 0]} castShadow>
          <cylinderGeometry args={[0.05, 0.05, 0.25]} />
          <meshStandardMaterial color="#2a2a2a" />
        </mesh>
        {/* Hand/Glove */}
        <mesh position={[0, -0.5, 0]} castShadow>
          <sphereGeometry args={[0.07, 12, 12]} />
          <meshStandardMaterial color="#ff3300" metalness={0.3} roughness={0.7} />
        </mesh>
      </group>

      {/* Left Leg */}
      <group ref={leftLegRef} position={[0.15, 0.05, 0]}>
        {/* Thigh */}
        <mesh position={[0, -0.2, 0]} castShadow>
          <cylinderGeometry args={[0.08, 0.07, 0.35]} />
          <meshStandardMaterial color="#1a1a1a" />
        </mesh>
        {/* Lower leg */}
        <mesh position={[0, -0.45, 0]} castShadow>
          <cylinderGeometry args={[0.06, 0.06, 0.3]} />
          <meshStandardMaterial color="#1a1a1a" />
        </mesh>
        {/* Boot */}
        <mesh position={[0, -0.65, 0.05]} castShadow>
          <boxGeometry args={[0.1, 0.1, 0.18]} />
          <meshStandardMaterial color="#000000" metalness={0.5} roughness={0.5} />
        </mesh>
      </group>

      {/* Right Leg */}
      <group ref={rightLegRef} position={[-0.15, 0.05, 0]}>
        {/* Thigh */}
        <mesh position={[0, -0.2, 0]} castShadow>
          <cylinderGeometry args={[0.08, 0.07, 0.35]} />
          <meshStandardMaterial color="#1a1a1a" />
        </mesh>
        {/* Lower leg */}
        <mesh position={[0, -0.45, 0]} castShadow>
          <cylinderGeometry args={[0.06, 0.06, 0.3]} />
          <meshStandardMaterial color="#1a1a1a" />
        </mesh>
        {/* Boot */}
        <mesh position={[0, -0.65, 0.05]} castShadow>
          <boxGeometry args={[0.1, 0.1, 0.18]} />
          <meshStandardMaterial color="#000000" metalness={0.5} roughness={0.5} />
        </mesh>
      </group>
    </group>
  );
};
