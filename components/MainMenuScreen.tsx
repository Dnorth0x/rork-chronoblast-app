import React, { useEffect, useRef } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Platform, Animated, ImageBackground } from 'react-native';
import { useRouter } from 'expo-router';
import { Gamepad2, Trophy, Gem, Volume2, VolumeX, Settings } from 'lucide-react-native';
import { useUpgradeStore } from '@/stores/upgradeStore';
import { LinearGradient } from 'expo-linear-gradient';
import { soundManager } from '@/utils/SoundManager';

export default function MainMenuScreen() {
  const router = useRouter();
  const { chronoShards, totalShardsEarned } = useUpgradeStore();
  
  // Sound state
  const [soundEnabled, setSoundEnabled] = React.useState(true);
  
  // Animations
  const titleScale = useRef(new Animated.Value(0.8)).current;
  const titleOpacity = useRef(new Animated.Value(0)).current;
  const buttonScale = useRef(new Animated.Value(0.9)).current;
  const buttonOpacity = useRef(new Animated.Value(0)).current;
  const gemRotation = useRef(new Animated.Value(0)).current;
  const pulseAnimation = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Initialize sound manager and load mute state
    const initializeSound = async () => {
      await soundManager.init();
      const isMuted = soundManager.isSoundMuted();
      setSoundEnabled(!isMuted);
    };
    
    initializeSound();

    // Entrance animations
    Animated.parallel([
      Animated.timing(titleOpacity, {
        toValue: 1,
        duration: 1200,
        useNativeDriver: true,
      }),
      Animated.spring(titleScale, {
        toValue: 1,
        tension: 40,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();

    setTimeout(() => {
      Animated.parallel([
        Animated.timing(buttonOpacity, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.spring(buttonScale, {
          toValue: 1,
          tension: 50,
          friction: 8,
          useNativeDriver: true,
        }),
      ]).start();
    }, 400);

    // Continuous gem rotation
    const rotateGem = () => {
      Animated.timing(gemRotation, {
        toValue: 1,
        duration: 4000,
        useNativeDriver: true,
      }).start(() => {
        gemRotation.setValue(0);
        rotateGem();
      });
    };
    rotateGem();

    // Pulse animation for start button
    const pulse = () => {
      Animated.sequence([
        Animated.timing(pulseAnimation, {
          toValue: 1.05,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnimation, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
      ]).start(() => pulse());
    };
    pulse();
  }, []);

  const handleButtonPress = async (action: () => void, soundType: 'button_click' | 'menu_open' = 'button_click') => {
    if (soundEnabled) {
      await soundManager.playUISound(soundType);
    }
    
    // Button press animation
    Animated.sequence([
      Animated.timing(buttonScale, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(buttonScale, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
    
    action();
  };

  const toggleSound = async () => {
    const newSoundState = !soundEnabled;
    setSoundEnabled(newSoundState);
    await soundManager.toggleMute(!newSoundState);
    
    if (newSoundState) {
      soundManager.playUISound('button_click');
    }
  };

  const spin = gemRotation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <ImageBackground
      source={{ uri: 'https://raw.githubusercontent.com/Dnorth0x/rork-chronoblast-app/main/assets/images/background.png' }}
      style={styles.container}
      resizeMode="cover"
    >
      {/* Dark overlay for better text readability */}
      <View style={styles.overlay} />
      
      {/* Animated background particles */}
      <View style={styles.particlesContainer}>
        {[...Array(15)].map((_, i) => (
          <Animated.View
            key={i}
            style={[
              styles.particle,
              {
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                opacity: 0.3 + Math.random() * 0.4,
                transform: [
                  {
                    scale: pulseAnimation.interpolate({
                      inputRange: [1, 1.05],
                      outputRange: [0.5 + Math.random() * 0.5, 0.7 + Math.random() * 0.5],
                    })
                  }
                ]
              },
            ]}
          />
        ))}
      </View>

      <View style={styles.content}>
        {/* Top Controls */}
        <View style={styles.topControls}>
          {/* Sound Toggle Button */}
          <TouchableOpacity 
            style={styles.controlButton}
            onPress={toggleSound}
            activeOpacity={0.8}
          >
            {soundEnabled ? (
              <Volume2 size={24} color="#00FFFF" />
            ) : (
              <VolumeX size={24} color="#666" />
            )}
          </TouchableOpacity>

          {/* Settings Button */}
          <TouchableOpacity 
            style={styles.controlButton}
            onPress={() => handleButtonPress(() => router.push('/(tabs)/settings'), 'menu_open')}
            activeOpacity={0.8}
          >
            <Settings size={24} color="#00FFFF" />
          </TouchableOpacity>
        </View>

        {/* Animated Header */}
        <Animated.View 
          style={[
            styles.header,
            {
              opacity: titleOpacity,
              transform: [{ scale: titleScale }],
            },
          ]}
        >
          <View style={styles.iconContainer}>
            <LinearGradient
              colors={['#00FFFF', '#0080FF', '#0040FF']}
              style={styles.iconGradient}
            >
              <Gamepad2 size={72} color="#FFFFFF" />
            </LinearGradient>
          </View>
          <Text style={styles.title}>ChronoBlast</Text>
          <Text style={styles.subtitle}>Master time, collect energy, become legend</Text>
        </Animated.View>

        {/* Enhanced Currency Display */}
        <Animated.View 
          style={[
            styles.currencyContainer,
            {
              opacity: buttonOpacity,
              transform: [{ scale: buttonScale }],
            },
          ]}
        >
          <LinearGradient
            colors={['rgba(157, 78, 221, 0.4)', 'rgba(199, 125, 255, 0.2)', 'rgba(157, 78, 221, 0.1)']}
            style={styles.currencyGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={styles.currencyItem}>
              <Animated.View style={{ transform: [{ rotate: spin }] }}>
                <Gem size={28} color="#9D4EDD" />
              </Animated.View>
              <View style={styles.currencyTextContainer}>
                <Text style={styles.currencyText}>{chronoShards.toLocaleString()}</Text>
                <Text style={styles.currencyLabel}>ChronoShards</Text>
              </View>
            </View>
            {totalShardsEarned > 0 && (
              <Text style={styles.totalEarnedText}>
                Total Earned: {totalShardsEarned.toLocaleString()}
              </Text>
            )}
          </LinearGradient>
        </Animated.View>

        {/* Enhanced Button Container */}
        <Animated.View 
          style={[
            styles.buttonContainer,
            {
              opacity: buttonOpacity,
              transform: [{ scale: buttonScale }],
            },
          ]}
        >
          <Animated.View style={{ transform: [{ scale: pulseAnimation }] }}>
            <TouchableOpacity 
              style={styles.primaryButton}
              onPress={() => handleButtonPress(() => router.push('/game'), 'button_click')}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={['#00FFFF', '#00DDDD', '#00BBBB', '#008B8B']}
                style={styles.buttonGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <View style={styles.buttonContent}>
                  <Gamepad2 size={28} color="#1C1C1E" />
                  <Text style={styles.primaryButtonText}>Start Game</Text>
                </View>
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>

          <TouchableOpacity 
            style={styles.secondaryButton}
            onPress={() => handleButtonPress(() => router.push('/(tabs)/shop'), 'menu_open')}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={['rgba(0, 255, 255, 0.25)', 'rgba(0, 255, 255, 0.15)', 'rgba(0, 255, 255, 0.05)']}
              style={styles.buttonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <View style={styles.buttonContent}>
                <Trophy size={24} color="#00FFFF" />
                <Text style={styles.secondaryButtonText}>Upgrades</Text>
              </View>
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>

        {/* Game Stats */}
        <Animated.View 
          style={[
            styles.statsContainer,
            {
              opacity: buttonOpacity,
            },
          ]}
        >
          <Text style={styles.statsText}>Ready to dominate the cosmos?</Text>
        </Animated.View>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  particlesContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  particle: {
    position: 'absolute',
    width: 4,
    height: 4,
    backgroundColor: '#00FFFF',
    borderRadius: 2,
  },
  content: {
    alignItems: 'center',
    maxWidth: 420,
    width: '100%',
    zIndex: 1,
  },
  topControls: {
    position: 'absolute',
    top: -40,
    right: 0,
    flexDirection: 'row',
    gap: 12,
    zIndex: 10,
  },
  controlButton: {
    backgroundColor: 'rgba(0, 255, 255, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(0, 255, 255, 0.4)',
    borderRadius: 12,
    padding: 12,
  },
  header: {
    alignItems: 'center',
    marginBottom: 50,
  },
  iconContainer: {
    marginBottom: 28,
    borderRadius: 36,
    padding: 6,
    shadowColor: '#00FFFF',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.8,
    shadowRadius: 20,
    elevation: 15,
  },
  iconGradient: {
    padding: 24,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 58,
    fontWeight: '900',
    color: '#FFFFFF',
    marginBottom: 16,
    textAlign: 'center',
    textShadowColor: '#00FFFF',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 25,
    letterSpacing: 4,
    fontFamily: 'space_font',
  },
  subtitle: {
    fontSize: 17,
    color: '#E8E8E8',
    textAlign: 'center',
    lineHeight: 26,
    fontWeight: '500',
    letterSpacing: 1.2,
    maxWidth: 300,
    textShadowColor: 'rgba(0, 0, 0, 0.9)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  currencyContainer: {
    width: '100%',
    marginBottom: 50,
  },
  currencyGradient: {
    padding: 28,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: 'rgba(157, 78, 221, 0.5)',
    shadowColor: '#9D4EDD',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.6,
    shadowRadius: 20,
    elevation: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  currencyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 20,
    marginBottom: 10,
  },
  currencyTextContainer: {
    alignItems: 'center',
  },
  currencyText: {
    fontSize: 32,
    fontWeight: '800',
    color: '#9D4EDD',
    textShadowColor: '#9D4EDD',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 12,
  },
  currencyLabel: {
    fontSize: 15,
    color: '#C77DFF',
    fontWeight: '600',
    letterSpacing: 0.8,
  },
  totalEarnedText: {
    fontSize: 13,
    color: 'rgba(157, 78, 221, 0.9)',
    fontWeight: '500',
    textAlign: 'center',
  },
  buttonContainer: {
    width: '100%',
    gap: 24,
    marginBottom: 30,
  },
  primaryButton: {
    borderRadius: 24,
    shadowColor: '#00FFFF',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.8,
    shadowRadius: 20,
    elevation: 15,
  },
  secondaryButton: {
    borderRadius: 24,
    borderWidth: 2,
    borderColor: 'rgba(0, 255, 255, 0.6)',
    shadowColor: '#00FFFF',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  buttonGradient: {
    paddingVertical: 22,
    paddingHorizontal: 36,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  primaryButtonText: {
    color: '#1C1C1E',
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: 1.5,
  },
  secondaryButtonText: {
    color: '#00FFFF',
    fontSize: 19,
    fontWeight: '700',
    letterSpacing: 0.8,
  },
  statsContainer: {
    alignItems: 'center',
  },
  statsText: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    fontStyle: 'italic',
    textAlign: 'center',
    letterSpacing: 0.5,
  },
});