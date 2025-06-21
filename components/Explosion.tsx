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
  const x = useSharedValue(particle.x);
  const y = useSharedValue(particle.y);
  const alpha = useSharedValue(particle.alpha);

  useEffect(() => {
    x.value = withTiming(particle.x, {
      duration: 50,
      easing: Easing.linear,
    });
    y.value = withTiming(particle.y, {
      duration: 50,
      easing: Easing.linear,
    });
    alpha.value = withTiming(particle.alpha, {
      duration: 50,
      easing: Easing.linear,
    });
  }, [particle.x, particle.y, particle.alpha]);

  const cx = useDerivedValue(() => x.value);
  const cy = useDerivedValue(() => y.value);
  const opacity = useDerivedValue(() => alpha.value);

  return (
    <Circle
      cx={cx}
      cy={cy}
      r={particle.radius}
      color={particle.color}
      opacity={opacity}
    />
  );
};

const Explosion: React.FC<ExplosionProps> = ({ particles }) => {
  return (
    <Group>
      {particles.map(particle => (
        <Particle key={particle.id} particle={particle} />
      ))}
    </Group>
  );
};

export default Explosion;