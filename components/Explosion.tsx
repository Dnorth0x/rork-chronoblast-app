import React, { useEffect } from 'react';
import { Circle, Group } from '@shopify/react-native-skia';
import {
  useSharedValue,
  useDerivedValue,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { ExplosionParticle } from '@/types/gameState';

interface ExplosionProps {
  particles: ExplosionParticle[];
}

interface ParticleProps {
  particle: ExplosionParticle;
}

const Particle: React.FC<ParticleProps> = ({ particle }) => {
  // PHASE 2: Enhanced VFX implementation using Skia Integration Doctrine v3
  const x = useSharedValue(particle.x);
  const y = useSharedValue(particle.y);
  const radius = useSharedValue(particle.radius);
  const alpha = useSharedValue(particle.alpha);

  useEffect(() => {
    // Smooth animation bridge from game engine to Skia
    x.value = withTiming(particle.x, {
      duration: 50,
      easing: Easing.linear,
    });
    y.value = withTiming(particle.y, {
      duration: 50,
      easing: Easing.linear,
    });
    
    // Animate particle fade and shrink
    alpha.value = withTiming(particle.alpha, {
      duration: 100,
      easing: Easing.out(Easing.quad),
    });
    
    // Slight radius animation for more dynamic effect
    radius.value = withTiming(particle.radius * (0.8 + particle.alpha * 0.2), {
      duration: 100,
      easing: Easing.out(Easing.quad),
    });
  }, [particle.x, particle.y, particle.alpha, particle.radius]);

  // Animated props for Skia
  const cx = useDerivedValue(() => x.value);
  const cy = useDerivedValue(() => y.value);
  
  // Static props derived from shared values
  const animatedRadius = useDerivedValue(() => radius.value);
  const animatedAlpha = useDerivedValue(() => alpha.value);
  
  // Create color with alpha
  const particleColor = useDerivedValue(() => {
    const alphaHex = Math.floor(animatedAlpha.value * 255).toString(16).padStart(2, '0');
    return `${particle.color}${alphaHex}`;
  });

  return (
    <Circle
      cx={cx}
      cy={cy}
      r={animatedRadius}
      color={particleColor}
    />
  );
};

const Explosion: React.FC<ExplosionProps> = ({ particles }) => {
  if (!particles || particles.length === 0) {
    return null;
  }

  return (
    <Group>
      {particles.map((particle) => (
        <Particle key={particle.id} particle={particle} />
      ))}
    </Group>
  );
};

export default Explosion;