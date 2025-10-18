import { useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { Button } from '@/components/ui/button';
import { GameScene3D } from './GameScene3D';

export const GameCanvas = () => {
  const [gameState, setGameState] = useState<'menu' | 'playing' | 'gameover'>('menu');
  const [score, setScore] = useState(0);
  const [playerHealth, setPlayerHealth] = useState(100);

  const startGame = () => {
    setGameState('playing');
    setScore(0);
    setPlayerHealth(100);
  };

  const handleGameOver = () => {
    setGameState('gameover');
  };

  return (
    <div className="relative w-full h-screen bg-background">
      {gameState === 'menu' && (
        <div className="absolute inset-0 flex flex-col items-center justify-center z-10 bg-background/95 backdrop-blur-sm">
          <h1 className="text-7xl font-bold mb-4 text-primary animate-pulse-neon" style={{ textShadow: 'var(--glow-text)' }}>
            ROAD RAGE 3D
          </h1>
          <p className="text-xl text-muted-foreground mb-8">Kick, Punch, and Race to Victory!</p>
          <div className="space-y-4 text-center mb-8 bg-card/50 backdrop-blur-sm p-6 rounded-lg border-2 border-primary/30">
            <p className="text-foreground text-lg font-semibold">Controls:</p>
            <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-left">
              <p className="text-foreground">⬅️ ➡️ - Change Lanes</p>
              <p className="text-foreground">⬆️ ⬇️ - Speed Control</p>
              <p className="text-accent font-bold">Z/X - Kick (Legs)</p>
              <p className="text-secondary font-bold">A/S - Punch (Hands)</p>
            </div>
            <p className="text-xs text-muted-foreground mt-2">Punches deal more damage but shorter range!</p>
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
        <div className="absolute inset-0 flex flex-col items-center justify-center z-10 bg-background/95 backdrop-blur-sm">
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
          <div className="bg-card/80 backdrop-blur-sm p-3 rounded-lg border border-primary/50 text-xs space-y-1">
            <p className="text-accent">Z/X - Kick (Legs)</p>
            <p className="text-secondary">A/S - Punch (Hands)</p>
            <p className="text-muted-foreground">Arrows - Move</p>
          </div>
        </div>
      )}

      <Canvas
        shadows
        gl={{ antialias: true }}
        className="w-full h-full"
      >
        <GameScene3D 
          gameState={gameState}
          onScoreChange={setScore}
          onHealthChange={setPlayerHealth}
          onGameOver={handleGameOver}
        />
      </Canvas>
    </div>
  );
};
