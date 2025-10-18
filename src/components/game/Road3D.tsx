import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Mesh } from 'three';

export const Road3D = () => {
  const roadRef = useRef<Mesh>(null);
  const linesRef = useRef<Mesh[]>([]);

  useFrame((state) => {
    // Animate road lines moving
    linesRef.current.forEach((line, i) => {
      if (line) {
        line.position.z += 0.3;
        if (line.position.z > 10) {
          line.position.z = -50;
        }
      }
    });
  });

  return (
    <group>
      {/* Main road surface */}
      <mesh 
        ref={roadRef}
        rotation={[-Math.PI / 2, 0, 0]} 
        position={[0, -0.5, 0]}
        receiveShadow
      >
        <planeGeometry args={[8, 100]} />
        <meshStandardMaterial 
          color="#2a2a2a" 
          roughness={0.9}
          metalness={0.1}
        />
      </mesh>
      
      {/* Road edges */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-4.1, -0.49, 0]} receiveShadow>
        <planeGeometry args={[0.5, 100]} />
        <meshStandardMaterial color="#ff0000" emissive="#ff0000" emissiveIntensity={0.3} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[4.1, -0.49, 0]} receiveShadow>
        <planeGeometry args={[0.5, 100]} />
        <meshStandardMaterial color="#ff0000" emissive="#ff0000" emissiveIntensity={0.3} />
      </mesh>
      
      {/* Center line dashes */}
      {Array.from({ length: 20 }).map((_, i) => (
        <mesh
          key={`center-${i}`}
          ref={(el) => {
            if (el) linesRef.current[i] = el;
          }}
          rotation={[-Math.PI / 2, 0, 0]}
          position={[0, -0.48, -50 + i * 5]}
        >
          <planeGeometry args={[0.2, 2]} />
          <meshStandardMaterial 
            color="#ffd700" 
            emissive="#ffd700"
            emissiveIntensity={0.5}
          />
        </mesh>
      ))}
      
      {/* Lane markers */}
      {Array.from({ length: 20 }).map((_, i) => (
        <group key={`lanes-${i}`}>
          <mesh
            ref={(el) => {
              if (el) linesRef.current[20 + i] = el;
            }}
            rotation={[-Math.PI / 2, 0, 0]}
            position={[-2.5, -0.48, -50 + i * 5]}
          >
            <planeGeometry args={[0.1, 1.5]} />
            <meshStandardMaterial color="#666666" />
          </mesh>
          <mesh
            ref={(el) => {
              if (el) linesRef.current[40 + i] = el;
            }}
            rotation={[-Math.PI / 2, 0, 0]}
            position={[2.5, -0.48, -50 + i * 5]}
          >
            <planeGeometry args={[0.1, 1.5]} />
            <meshStandardMaterial color="#666666" />
          </mesh>
        </group>
      ))}
      
      {/* Ground beyond road */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.51, 0]} receiveShadow>
        <planeGeometry args={[50, 100]} />
        <meshStandardMaterial color="#1a1f2e" roughness={1} />
      </mesh>
    </group>
  );
};
