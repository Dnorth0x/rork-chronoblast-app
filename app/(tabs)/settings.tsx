import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, Switch, TouchableOpacity, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import { Settings, Volume2, VolumeX, ArrowLeft } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { soundManager } from '@/utils/SoundManager';

export default function SettingsScreen() {
  const router = useRouter();
  const [soundEnabled, setSoundEnabled] = useState(true);

  useEffect(() => {
    // Initialize sound manager and load current mute state
    const initializeSettings = async () => {
      await soundManager.init();
      const isMuted = soundManager.isSoundMuted();
      setSoundEnabled(!isMuted);
    };
    
    initializeSettings();
  }, []);

  const handleSoundToggle = async (value: boolean) => {
    setSoundEnabled(value);
    await soundManager.toggleMute(!value);
    
    // Play a test sound if enabling
    if (value) {
      soundManager.playUISound('button_click');
    }
  };

  const handleBackPress = async () => {
    if (soundEnabled) {
      await soundManager.playUISound('menu_close');
    }
    router.back();
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#1C1C1E', '#2C2C2E', '#1C1C1E']}
        style={styles.gradient}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={handleBackPress}
            activeOpacity={0.8}
          >
            <ArrowLeft size={24} color="#00FFFF" />
          </TouchableOpacity>
          
          <View style={styles.titleContainer}>
            <Settings size={28} color="#00FFFF" />
            <Text style={styles.title}>Settings</Text>
          </View>
          
          <View style={styles.placeholder} />
        </View>

        {/* Settings Content */}
        <View style={styles.content}>
          <View style={styles.settingsSection}>
            <Text style={styles.sectionTitle}>Audio</Text>
            
            <View style={styles.settingItem}>
              <LinearGradient
                colors={['rgba(0, 255, 255, 0.1)', 'rgba(0, 255, 255, 0.05)', 'rgba(0, 255, 255, 0.02)']}
                style={styles.settingItemGradient}
              >
                <View style={styles.settingLeft}>
                  {soundEnabled ? (
                    <Volume2 size={24} color="#00FFFF" />
                  ) : (
                    <VolumeX size={24} color="#666" />
                  )}
                  <View style={styles.settingTextContainer}>
                    <Text style={styles.settingTitle}>Sound Effects</Text>
                    <Text style={styles.settingDescription}>
                      {soundEnabled ? 'All game sounds enabled' : 'All sounds muted'}
                    </Text>
                  </View>
                </View>
                
                <Switch
                  value={soundEnabled}
                  onValueChange={handleSoundToggle}
                  trackColor={{ 
                    false: 'rgba(120, 120, 128, 0.32)', 
                    true: 'rgba(0, 255, 255, 0.4)' 
                  }}
                  thumbColor={soundEnabled ? '#00FFFF' : '#f4f3f4'}
                  ios_backgroundColor="rgba(120, 120, 128, 0.32)"
                />
              </LinearGradient>
            </View>
          </View>

          {/* Game Info Section */}
          <View style={styles.settingsSection}>
            <Text style={styles.sectionTitle}>Game Info</Text>
            
            <View style={styles.infoContainer}>
              <LinearGradient
                colors={['rgba(157, 78, 221, 0.1)', 'rgba(199, 125, 255, 0.05)', 'rgba(157, 78, 221, 0.02)']}
                style={styles.infoGradient}
              >
                <Text style={styles.gameTitle}>ChronoBlast</Text>
                <Text style={styles.gameVersion}>Version 1.0.0</Text>
                <Text style={styles.gameDescription}>
                  Master time, collect energy, become legend
                </Text>
              </LinearGradient>
            </View>
          </View>
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1C1C1E',
  },
  gradient: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 255, 255, 0.2)',
  },
  backButton: {
    backgroundColor: 'rgba(0, 255, 255, 0.2)',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(0, 255, 255, 0.4)',
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 1,
  },
  placeholder: {
    width: 48,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 32,
  },
  settingsSection: {
    marginBottom: 40,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#00FFFF',
    marginBottom: 20,
    letterSpacing: 0.5,
  },
  settingItem: {
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(0, 255, 255, 0.3)',
  },
  settingItemGradient: {
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 16,
  },
  settingTextContainer: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  infoContainer: {
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(157, 78, 221, 0.3)',
  },
  infoGradient: {
    padding: 24,
    alignItems: 'center',
  },
  gameTitle: {
    fontSize: 28,
    fontWeight: '900',
    color: '#9D4EDD',
    marginBottom: 8,
    letterSpacing: 2,
  },
  gameVersion: {
    fontSize: 14,
    color: 'rgba(157, 78, 221, 0.8)',
    fontWeight: '600',
    marginBottom: 12,
  },
  gameDescription: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    fontStyle: 'italic',
    letterSpacing: 0.5,
  },
});