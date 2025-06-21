import { GameState, GameAction, ExplosionObject } from '@/types/gameState';

export class ExplosionSystem {
  static update(gameState: GameState, dispatch: (action: GameAction) => void): void {
    // Update all explosion particles
    const updatedExplosions: ExplosionObject[] = [];
    let hasChanges = false;

    gameState.explosions.forEach(explosion => {
      // Update each particle in the explosion
      const updatedParticles = explosion.particles.map(particle => {
        const newLife = particle.life - 1;
        const alpha = Math.max(0, newLife / particle.maxLife);
        
        return {
          ...particle,
          x: particle.x + particle.vx,
          y: particle.y + particle.vy,
          vx: particle.vx * 0.98, // Slight deceleration
          vy: particle.vy * 0.98,
          life: newLife,
          alpha,
        };
      }).filter(particle => particle.life > 0);

      // Only keep explosions that still have living particles
      if (updatedParticles.length > 0) {
        updatedExplosions.push({
          ...explosion,
          particles: updatedParticles,
        });
      } else {
        hasChanges = true; // Explosion was removed
      }

      // Check if particles were updated
      if (updatedParticles.length !== explosion.particles.length) {
        hasChanges = true;
      }
    });

    // Dispatch update if there were changes
    if (hasChanges || updatedExplosions.length !== gameState.explosions.length) {
      dispatch({ type: 'UPDATE_EXPLOSIONS' });
    }
  }
}

export default ExplosionSystem;