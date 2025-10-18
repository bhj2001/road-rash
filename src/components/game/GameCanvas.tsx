import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';

interface Biker {
  x: number;
  y: number;
  speed: number;
  health: number;
  isPlayer: boolean;
  lane: number;
  color: string;
}

export const GameCanvas = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [gameState, setGameState] = useState<'menu' | 'playing' | 'gameover'>('menu');
  const [score, setScore] = useState(0);
  const [playerHealth, setPlayerHealth] = useState(100);
  const gameLoopRef = useRef<number>();
  
  const player = useRef<Biker>({
    x: 200,
    y: 400,
    speed: 5,
    health: 100,
    isPlayer: true,
    lane: 1,
    color: '#00ffff'
  });
  
  const opponents = useRef<Biker[]>([]);
  const roadOffset = useRef(0);
  const keys = useRef<Set<string>>(new Set());

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      keys.current.add(e.key);
      
      // Combat controls
      if (e.key === 'z' || e.key === 'Z') {
        performKick('left');
      }
      if (e.key === 'x' || e.key === 'X') {
        performKick('right');
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
  }, []);

  const performKick = (direction: 'left' | 'right') => {
    const kickRange = 60;
    const kickDamage = 20;
    
    opponents.current = opponents.current.filter(opp => {
      const distance = Math.abs(opp.x - player.current.x) + Math.abs(opp.y - player.current.y);
      const isInRange = distance < kickRange;
      const correctSide = direction === 'left' ? opp.x < player.current.x : opp.x > player.current.x;
      
      if (isInRange && correctSide) {
        opp.health -= kickDamage;
        if (opp.health <= 0) {
          setScore(prev => prev + 100);
          return false;
        }
        // Push opponent away
        opp.x += direction === 'left' ? -30 : 30;
      }
      return true;
    });
  };

  const startGame = () => {
    setGameState('playing');
    setScore(0);
    setPlayerHealth(100);
    player.current.health = 100;
    player.current.x = 200;
    player.current.y = 400;
    opponents.current = [];
    spawnOpponent();
  };

  const spawnOpponent = () => {
    const lanes = [100, 200, 300];
    const lane = Math.floor(Math.random() * 3);
    opponents.current.push({
      x: lanes[lane],
      y: -50,
      speed: 3 + Math.random() * 2,
      health: 100,
      isPlayer: false,
      lane: lane,
      color: '#ff00ff'
    });
  };

  useEffect(() => {
    if (gameState !== 'playing') return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let lastSpawn = Date.now();

    const gameLoop = () => {
      // Clear canvas
      ctx.fillStyle = '#1a1f2e';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw road
      roadOffset.current += 8;
      if (roadOffset.current > 50) roadOffset.current = 0;

      ctx.strokeStyle = '#ffd700';
      ctx.lineWidth = 3;
      for (let i = -1; i < 12; i++) {
        const y = i * 50 + roadOffset.current;
        ctx.beginPath();
        ctx.moveTo(canvas.width / 2, y);
        ctx.lineTo(canvas.width / 2, y + 25);
        ctx.stroke();
      }

      // Draw lane lines
      ctx.strokeStyle = '#ffffff33';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(133, 0);
      ctx.lineTo(133, canvas.height);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(267, 0);
      ctx.lineTo(267, canvas.height);
      ctx.stroke();

      // Handle player movement
      if (keys.current.has('ArrowLeft') && player.current.x > 60) {
        player.current.x -= 5;
      }
      if (keys.current.has('ArrowRight') && player.current.x < 340) {
        player.current.x += 5;
      }
      if (keys.current.has('ArrowUp') && player.current.y > 200) {
        player.current.y -= 4;
      }
      if (keys.current.has('ArrowDown') && player.current.y < 500) {
        player.current.y += 4;
      }

      // Update and draw opponents
      opponents.current = opponents.current.filter(opp => {
        opp.y += opp.speed;
        
        // Check collision with player
        const distance = Math.sqrt(
          Math.pow(opp.x - player.current.x, 2) + 
          Math.pow(opp.y - player.current.y, 2)
        );
        
        if (distance < 40) {
          player.current.health -= 0.5;
          setPlayerHealth(Math.max(0, player.current.health));
          if (player.current.health <= 0) {
            setGameState('gameover');
          }
        }
        
        if (opp.y > canvas.height) {
          setScore(prev => prev + 10);
          return false;
        }
        
        // Draw opponent bike
        ctx.fillStyle = opp.color;
        ctx.shadowColor = opp.color;
        ctx.shadowBlur = 15;
        ctx.beginPath();
        ctx.ellipse(opp.x, opp.y, 15, 25, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
        
        // Draw health bar
        const healthWidth = 30;
        const healthPercent = opp.health / 100;
        ctx.fillStyle = '#333';
        ctx.fillRect(opp.x - 15, opp.y - 40, healthWidth, 4);
        ctx.fillStyle = opp.health > 50 ? '#00ff00' : '#ff0000';
        ctx.fillRect(opp.x - 15, opp.y - 40, healthWidth * healthPercent, 4);
        
        return true;
      });

      // Draw player bike
      ctx.fillStyle = player.current.color;
      ctx.shadowColor = player.current.color;
      ctx.shadowBlur = 20;
      ctx.beginPath();
      ctx.ellipse(player.current.x, player.current.y, 15, 25, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;

      // Spawn new opponents
      if (Date.now() - lastSpawn > 2000) {
        spawnOpponent();
        lastSpawn = Date.now();
      }

      gameLoopRef.current = requestAnimationFrame(gameLoop);
    };

    gameLoop();

    return () => {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current);
      }
    };
  }, [gameState]);

  return (
    <div className="relative w-full h-screen flex items-center justify-center bg-background">
      {gameState === 'menu' && (
        <div className="absolute inset-0 flex flex-col items-center justify-center z-10 bg-background/95">
          <h1 className="text-7xl font-bold mb-4 text-primary animate-pulse-neon" style={{ textShadow: 'var(--glow-text)' }}>
            ROAD RAGE
          </h1>
          <p className="text-xl text-muted-foreground mb-8">Kick, Punch, and Race to Victory!</p>
          <div className="space-y-4 text-center mb-8">
            <p className="text-foreground">Arrow Keys - Move</p>
            <p className="text-foreground">Z - Kick Left | X - Kick Right</p>
          </div>
          <Button 
            onClick={startGame}
            className="bg-primary text-primary-foreground hover:bg-primary/90 text-2xl px-12 py-6 rounded-lg"
            style={{ boxShadow: 'var(--shadow-neon)' }}
          >
            START RACE
          </Button>
        </div>
      )}

      {gameState === 'gameover' && (
        <div className="absolute inset-0 flex flex-col items-center justify-center z-10 bg-background/95">
          <h2 className="text-6xl font-bold mb-4 text-destructive animate-pulse-neon">
            WRECKED!
          </h2>
          <p className="text-3xl text-foreground mb-8">Final Score: {score}</p>
          <Button 
            onClick={startGame}
            className="bg-primary text-primary-foreground hover:bg-primary/90 text-xl px-8 py-4"
            style={{ boxShadow: 'var(--shadow-neon)' }}
          >
            RETRY
          </Button>
        </div>
      )}

      {gameState === 'playing' && (
        <div className="absolute top-8 left-8 z-10 space-y-4">
          <div className="bg-card/90 backdrop-blur-sm p-4 rounded-lg border-2 border-primary" style={{ boxShadow: 'var(--shadow-neon)' }}>
            <p className="text-2xl font-bold text-accent">SCORE: {score}</p>
          </div>
          <div className="bg-card/90 backdrop-blur-sm p-4 rounded-lg border-2 border-primary" style={{ boxShadow: 'var(--shadow-neon)' }}>
            <p className="text-sm text-muted-foreground mb-2">HEALTH</p>
            <div className="w-48 h-6 bg-muted rounded-full overflow-hidden border-2 border-primary">
              <div 
                className="h-full transition-all duration-300"
                style={{
                  width: `${playerHealth}%`,
                  background: playerHealth > 50 
                    ? 'linear-gradient(90deg, hsl(var(--primary)), hsl(var(--accent)))' 
                    : 'linear-gradient(90deg, hsl(var(--destructive)), hsl(var(--secondary)))',
                  boxShadow: playerHealth > 30 ? 'var(--shadow-neon)' : 'var(--shadow-combat)'
                }}
              />
            </div>
          </div>
        </div>
      )}

      <canvas
        ref={canvasRef}
        width={400}
        height={600}
        className="border-4 border-primary rounded-lg"
        style={{ boxShadow: 'var(--shadow-neon)' }}
      />
    </div>
  );
};
