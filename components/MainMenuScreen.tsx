import React, { useEffect, useRef } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Platform, Animated, ImageBackground } from 'react-native';
import { useRouter } from 'expo-router';
import { Gamepad2, Trophy, Gem, Volume2 } from 'lucide-react-native';
import { useUpgradeStore } from '@/stores/upgradeStore';
import { Audio } from 'expo-av';
import { LinearGradient } from 'expo-linear-gradient';

// Sound Manager
class SoundManager {
  private sounds: { [key: string]: Audio.Sound } = {};
  private initialized = false;

  async init() {
    if (Platform.OS === 'web' || this.initialized) return;
    
    try {
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        staysActiveInBackground: false,
        playsInSilentModeIOS: true,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
      });
      this.initialized = true;
    } catch (error) {
      console.log('Sound initialization failed:', error);
    }
  }

  async play(soundName: string) {
    if (Platform.OS === 'web' || !this.initialized) return;
    
    try {
      // For demo purposes, we'll use a simple beep sound
      // In a real app, you'd load actual sound files
      const { sound } = await Audio.Sound.createAsync(
        { uri: 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWT' },
        { shouldPlay: false }
      );
      
      await sound.playAsync();
      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded && status.didJustFinish) {
          sound.unloadAsync();
        }
      });
    } catch (error) {
      console.log('Sound play failed:', error);
    }
  }
}

const soundManager = new SoundManager();

export default function MainMenuScreen() {
  const router = useRouter();
  const { chronoShards, totalShardsEarned } = useUpgradeStore();
  
  // Animations
  const titleScale = useRef(new Animated.Value(0.8)).current;
  const titleOpacity = useRef(new Animated.Value(0)).current;
  const buttonScale = useRef(new Animated.Value(0.9)).current;
  const buttonOpacity = useRef(new Animated.Value(0)).current;
  const gemRotation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Initialize sound manager
    soundManager.init();

    // Entrance animations
    Animated.parallel([
      Animated.timing(titleOpacity, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.spring(titleScale, {
        toValue: 1,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();

    setTimeout(() => {
      Animated.parallel([
        Animated.timing(buttonOpacity, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.spring(buttonScale, {
          toValue: 1,
          tension: 60,
          friction: 8,
          useNativeDriver: true,
        }),
      ]).start();
    }, 300);

    // Continuous gem rotation
    const rotateGem = () => {
      Animated.timing(gemRotation, {
        toValue: 1,
        duration: 3000,
        useNativeDriver: true,
      }).start(() => {
        gemRotation.setValue(0);
        rotateGem();
      });
    };
    rotateGem();
  }, []);

  const handleButtonPress = async (action: () => void) => {
    await soundManager.play('button_click');
    
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

  const spin = gemRotation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <ImageBackground
      source={require('@/assets/images/background.png')}
      style={styles.container}
      resizeMode="cover"
    >
      {/* Dark overlay for better text readability */}
      <View style={styles.overlay} />
      
      {/* Animated background stars */}
      <View style={styles.starsContainer}>
        {[...Array(20)].map((_, i) => (
          <View
            key={i}
            style={[
              styles.star,
              {
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
              },
            ]}
          />
        ))}
      </View>

      <View style={styles.content}>
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
              <Gamepad2 size={64} color="#FFFFFF" />
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
            colors={['rgba(157, 78, 221, 0.3)', 'rgba(199, 125, 255, 0.2)']}
            style={styles.currencyGradient}
          >
            <View style={styles.currencyItem}>
              <Animated.View style={{ transform: [{ rotate: spin }] }}>
                <Gem size={24} color="#9D4EDD" />
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
          <TouchableOpacity 
            style={styles.primaryButton}
            onPress={() => handleButtonPress(() => router.push('/game'))}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={['#00FFFF', '#00CCCC', '#008B8B']}
              style={styles.buttonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <View style={styles.buttonContent}>
                <Gamepad2 size={24} color="#1C1C1E" />
                <Text style={styles.primaryButtonText}>Start Game</Text>
              </View>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.secondaryButton}
            onPress={() => handleButtonPress(() => router.push('/(tabs)/shop'))}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={['rgba(0, 255, 255, 0.2)', 'rgba(0, 255, 255, 0.1)']}
              style={styles.buttonGradient}
            >
              <View style={styles.buttonContent}>
                <Trophy size={20} color="#00FFFF" />
                <Text style={styles.secondaryButtonText}>Upgrades</Text>
              </View>
            </LinearGradient>
          </TouchableOpacity>

          {/* Sound Toggle Button */}
          <TouchableOpacity 
            style={styles.soundButton}
            onPress={() => handleButtonPress(() => soundManager.play('button_click'))}
            activeOpacity={0.8}
          >
            <Volume2 size={18} color="#00FFFF" />
          </TouchableOpacity>
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
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  starsContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  star: {
    position: 'absolute',
    width: 2,
    height: 2,
    backgroundColor: '#FFFFFF',
    borderRadius: 1,
    opacity: 0.8,
  },
  content: {
    alignItems: 'center',
    maxWidth: 400,
    width: '100%',
    zIndex: 1,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  iconContainer: {
    marginBottom: 24,
    borderRadius: 32,
    padding: 4,
    shadowColor: '#00FFFF',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.6,
    shadowRadius: 16,
    elevation: 12,
  },
  iconGradient: {
    padding: 20,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 52,
    fontWeight: '900',
    color: '#FFFFFF',
    marginBottom: 12,
    textAlign: 'center',
    textShadowColor: '#00FFFF',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 20,
    letterSpacing: 3,
    fontFamily: 'space_font',
  },
  subtitle: {
    fontSize: 16,
    color: '#E0E0E0',
    textAlign: 'center',
    lineHeight: 24,
    fontWeight: '500',
    letterSpacing: 1,
    maxWidth: 280,
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  currencyContainer: {
    width: '100%',
    marginBottom: 40,
  },
  currencyGradient: {
    padding: 24,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(157, 78, 221, 0.4)',
    shadowColor: '#9D4EDD',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  currencyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    marginBottom: 8,
  },
  currencyTextContainer: {
    alignItems: 'center',
  },
  currencyText: {
    fontSize: 28,
    fontWeight: '800',
    color: '#9D4EDD',
    textShadowColor: '#9D4EDD',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
  },
  currencyLabel: {
    fontSize: 14,
    color: '#C77DFF',
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  totalEarnedText: {
    fontSize: 12,
    color: 'rgba(157, 78, 221, 0.9)',
    fontWeight: '500',
    textAlign: 'center',
  },
  buttonContainer: {
    width: '100%',
    gap: 20,
  },
  primaryButton: {
    borderRadius: 20,
    shadowColor: '#00FFFF',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.6,
    shadowRadius: 16,
    elevation: 12,
  },
  secondaryButton: {
    borderRadius: 20,
    borderWidth: 2,
    borderColor: 'rgba(0, 255, 255, 0.5)',
    shadowColor: '#00FFFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
  },
  soundButton: {
    alignSelf: 'center',
    backgroundColor: 'rgba(0, 255, 255, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(0, 255, 255, 0.4)',
    borderRadius: 12,
    padding: 12,
    marginTop: 8,
  },
  buttonGradient: {
    paddingVertical: 20,
    paddingHorizontal: 32,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  primaryButtonText: {
    color: '#1C1C1E',
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: 1,
  },
  secondaryButtonText: {
    color: '#00FFFF',
    fontSize: 18,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
});