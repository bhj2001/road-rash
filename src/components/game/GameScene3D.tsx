import { useRef, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { PerspectiveCamera } from '@react-three/drei';
import { Bike3D } from './Bike3D';
import { Road3D } from './Road3D';

interface Biker {
  id: number;
  x: number;
  z: number;
  speed: number;
  health: number;
  isPlayer: boolean;
  color: string;
}

interface GameScene3DProps {
  onScoreChange: (score: number) => void;
  onHealthChange: (health: number) => void;
  onGameOver: () => void;
  gameState: 'menu' | 'playing' | 'gameover';
}

export const GameScene3D = ({ onScoreChange, onHealthChange, onGameOver, gameState }: GameScene3DProps) => {
  const [player] = useState<Biker>({
    id: 0,
    x: 0,
    z: 5,
    speed: 0,
    health: 100,
    isPlayer: true,
    color: '#00ffff'
  });
  
  const [opponents, setOpponents] = useState<Biker[]>([]);
  const [kickState, setKickState] = useState<'left' | 'right' | null>(null);
  const keys = useRef<Set<string>>(new Set());
  const playerRef = useRef(player);
  const lastSpawn = useRef(Date.now());
  const scoreRef = useRef(0);
  
  useEffect(() => {
    playerRef.current = player;
  }, [player]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      keys.current.add(e.key);
      
      if (gameState !== 'playing') return;
      
      if (e.key === 'z' || e.key === 'Z') {
        performKick('left');
        setKickState('left');
        setTimeout(() => setKickState(null), 300);
      }
      if (e.key === 'x' || e.key === 'X') {
        performKick('right');
        setKickState('right');
        setTimeout(() => setKickState(null), 300);
      }
    };
    
    const handleKeyUp = (e: KeyboardEvent) => {
      keys.current.delete(e.key);
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [gameState]);

  const performKick = (direction: 'left' | 'right') => {
    const kickRange = 2;
    const kickDamage = 25;
    
    setOpponents(prev => prev.filter(opp => {
      const distance = Math.sqrt(
        Math.pow(opp.x - playerRef.current.x, 2) + 
        Math.pow(opp.z - playerRef.current.z, 2)
      );
      const isInRange = distance < kickRange;
      const correctSide = direction === 'left' ? opp.x < playerRef.current.x : opp.x > playerRef.current.x;
      
      if (isInRange && correctSide && Math.abs(opp.z - playerRef.current.z) < 2) {
        opp.health -= kickDamage;
        if (opp.health <= 0) {
          scoreRef.current += 100;
          onScoreChange(scoreRef.current);
          return false;
        }
        // Push opponent away
        opp.x += direction === 'left' ? -1.5 : 1.5;
      }
      return true;
    }));
  };

  const spawnOpponent = () => {
    const lanes = [-2.5, 0, 2.5];
    const lane = lanes[Math.floor(Math.random() * 3)];
    const newId = Date.now() + Math.random();
    
    setOpponents(prev => [...prev, {
      id: newId,
      x: lane,
      z: -20,
      speed: 0.1 + Math.random() * 0.05,
      health: 100,
      isPlayer: false,
      color: ['#ff00ff', '#ff0066', '#9900ff'][Math.floor(Math.random() * 3)]
    }]);
  };

  useFrame((state, delta) => {
    if (gameState !== 'playing') return;

    // Player movement
    if (keys.current.has('ArrowLeft') && playerRef.current.x > -3.5) {
      playerRef.current.x -= 0.15;
    }
    if (keys.current.has('ArrowRight') && playerRef.current.x < 3.5) {
      playerRef.current.x += 0.15;
    }
    if (keys.current.has('ArrowUp') && playerRef.current.z > 2) {
      playerRef.current.z -= 0.1;
    }
    if (keys.current.has('ArrowDown') && playerRef.current.z < 8) {
      playerRef.current.z += 0.1;
    }

    // Update opponents
    setOpponents(prev => {
      const updated = prev.map(opp => {
        const newZ = opp.z + opp.speed;
        
        // Check collision
        const distance = Math.sqrt(
          Math.pow(opp.x - playerRef.current.x, 2) + 
          Math.pow(newZ - playerRef.current.z, 2)
        );
        
        if (distance < 1.2) {
          playerRef.current.health -= 0.3;
          onHealthChange(Math.max(0, playerRef.current.health));
          if (playerRef.current.health <= 0) {
            onGameOver();
          }
        }
        
        return { ...opp, z: newZ };
      });
      
      // Remove opponents that passed
      const filtered = updated.filter(opp => {
        if (opp.z > 15) {
          scoreRef.current += 10;
          onScoreChange(scoreRef.current);
          return false;
        }
        return true;
      });
      
      return filtered;
    });

    // Spawn opponents
    if (Date.now() - lastSpawn.current > 2000) {
      spawnOpponent();
      lastSpawn.current = Date.now();
    }
  });

  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 6, 12]} rotation={[-0.4, 0, 0]} />
      
      <ambientLight intensity={0.3} />
      <directionalLight 
        position={[5, 10, 5]} 
        intensity={1} 
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
      />
      <pointLight position={[0, 5, 0]} intensity={0.5} color="#00ffff" />
      
      <Road3D />
      
      {gameState === 'playing' && (
        <>
          <Bike3D 
            position={[playerRef.current.x, 0, playerRef.current.z]} 
            color={player.color}
            isKicking={kickState}
          />
          
          {opponents.map((opp) => (
            <Bike3D 
              key={opp.id}
              position={[opp.x, 0, opp.z]} 
              color={opp.color}
              rotation={Math.PI}
            />
          ))}
        </>
      )}
      
      {/* Fog for depth */}
      <fog attach="fog" args={['#1a1f2e', 10, 40]} />
    </>
  );
};
