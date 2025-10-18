import { useRef } from 'react';
import { Mesh, Group } from 'three';
import { useFrame } from '@react-three/fiber';
import { Rider3D } from './Rider3D';

interface Bike3DProps {
  position: [number, number, number];
  color: string;
  action?: 'kick-left' | 'kick-right' | 'punch-left' | 'punch-right' | null;
  rotation?: number;
}

export const Bike3D = ({ position, color, action, rotation = 0 }: Bike3DProps) => {
  const bikeRef = useRef<Group>(null);
  const tiltOffset = useRef(0);

  useFrame((state) => {
    if (bikeRef.current) {
      // Smooth tilt animation for any action
      if (action?.includes('left')) {
        tiltOffset.current = Math.min(tiltOffset.current + 0.1, 0.4);
        bikeRef.current.rotation.z = -tiltOffset.current;
      } else if (action?.includes('right')) {
        tiltOffset.current = Math.min(tiltOffset.current + 0.1, 0.4);
        bikeRef.current.rotation.z = tiltOffset.current;
      } else {
        tiltOffset.current = Math.max(tiltOffset.current - 0.15, 0);
        bikeRef.current.rotation.z = 0;
      }
      
      // Slight bobbing animation
      bikeRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 5) * 0.05;
    }
  });

  return (
    <group ref={bikeRef} position={position} rotation={[0, rotation, 0]}>
      {/* Bike body */}
      <mesh position={[0, 0.3, 0]} castShadow>
        <boxGeometry args={[0.6, 0.4, 1.2]} />
        <meshStandardMaterial 
          color={color} 
          metalness={0.8} 
          roughness={0.2}
          emissive={color}
          emissiveIntensity={0.3}
        />
      </mesh>
      
      {/* Handlebars */}
      <mesh position={[0, 0.6, 0.4]} castShadow>
        <cylinderGeometry args={[0.05, 0.05, 0.8]} />
        <meshStandardMaterial color="#333333" metalness={0.9} roughness={0.1} />
        <mesh rotation={[0, 0, Math.PI / 2]} position={[0, 0, 0]}>
          <cylinderGeometry args={[0.05, 0.05, 0.8]} />
          <meshStandardMaterial color="#333333" metalness={0.9} roughness={0.1} />
        </mesh>
      </mesh>
      
      {/* Front wheel */}
      <group position={[0, 0.2, 0.6]}>
        <mesh rotation={[Math.PI / 2, 0, 0]} castShadow>
          <torusGeometry args={[0.25, 0.1, 16, 32]} />
          <meshStandardMaterial color="#1a1a1a" metalness={0.5} roughness={0.5} />
        </mesh>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <circleGeometry args={[0.2, 32]} />
          <meshStandardMaterial color="#444444" metalness={0.7} roughness={0.3} />
        </mesh>
      </group>
      
      {/* Back wheel */}
      <group position={[0, 0.2, -0.5]}>
        <mesh rotation={[Math.PI / 2, 0, 0]} castShadow>
          <torusGeometry args={[0.25, 0.1, 16, 32]} />
          <meshStandardMaterial color="#1a1a1a" metalness={0.5} roughness={0.5} />
        </mesh>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <circleGeometry args={[0.2, 32]} />
          <meshStandardMaterial color="#444444" metalness={0.7} roughness={0.3} />
        </mesh>
      </group>
      
      {/* Seat */}
      <mesh position={[0, 0.5, -0.1]} castShadow>
        <boxGeometry args={[0.4, 0.15, 0.6]} />
        <meshStandardMaterial color="#222222" roughness={0.8} />
      </mesh>
      
      {/* Exhaust pipes with glow */}
      <mesh position={[0.3, 0.2, -0.6]} castShadow>
        <cylinderGeometry args={[0.05, 0.05, 0.4]} />
        <meshStandardMaterial 
          color="#ff6600" 
          emissive="#ff3300"
          emissiveIntensity={0.5}
          metalness={0.9} 
        />
      </mesh>
      <mesh position={[-0.3, 0.2, -0.6]} castShadow>
        <cylinderGeometry args={[0.05, 0.05, 0.4]} />
        <meshStandardMaterial 
          color="#ff6600" 
          emissive="#ff3300"
          emissiveIntensity={0.5}
          metalness={0.9} 
        />
      </mesh>
      
      {/* Headlight */}
      <mesh position={[0, 0.4, 0.7]}>
        <sphereGeometry args={[0.1, 16, 16]} />
        <meshStandardMaterial 
          color="#ffff00" 
          emissive="#ffff00"
          emissiveIntensity={1}
        />
      </mesh>
      <pointLight position={[0, 0.4, 0.9]} intensity={2} distance={5} color="#ffff00" />
      
      {/* Neon underglow */}
      <pointLight position={[0, -0.1, 0]} intensity={1.5} distance={3} color={color} />
      
      {/* Rider */}
      <Rider3D action={action} color={color} />
    </group>
  );
};
