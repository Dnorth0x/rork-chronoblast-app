import React, { useEffect, useRef } from 'react';
import { StyleSheet, View, Animated } from 'react-native';

interface ChronoShardProps {
  x: number;
  y: number;
  size: number;
  value: number;
}

export default function ChronoShard({ x, y, size }: ChronoShardProps) {
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Rotation animation
    const rotateAnimation = Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 3000,
        useNativeDriver: true,
      })
    );

    // Pulse animation
    const pulseAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.2,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );

    rotateAnimation.start();
    pulseAnimation.start();

    return () => {
      rotateAnimation.stop();
      pulseAnimation.stop();
    };
  }, []);

  const rotation = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <Animated.View
      style={[
        styles.chronoShard,
        {
          left: x - size / 2,
          top: y - size / 2,
          width: size,
          height: size,
          transform: [
            { rotate: rotation },
            { scale: pulseAnim },
          ],
        }
      ]}
    >
      <View style={styles.innerShard} />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  chronoShard: {
    position: 'absolute',
    backgroundColor: '#9D4EDD',
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#C77DFF',
    shadowColor: '#9D4EDD',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 8,
    elevation: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  innerShard: {
    width: '60%',
    height: '60%',
    backgroundColor: '#E0AAFF',
    borderRadius: 2,
  },
});