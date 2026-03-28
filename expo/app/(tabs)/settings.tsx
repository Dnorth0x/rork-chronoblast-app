import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, Switch, TouchableOpacity } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { ArrowLeft, Volume2, VolumeX } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { soundManager } from '@/utils/SoundManager';

export default function SettingsScreen() {
  const router = useRouter();
  const [soundEnabled, setSoundEnabled] = useState(true);

  useEffect(() => {
    // Load initial sound state from sound manager
    const loadSoundState = async () => {
      await soundManager.init();
      const isMuted = soundManager.isSoundMuted();
      setSoundEnabled(!isMuted);
    };
    
    loadSoundState();
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
    <View style={styles.container}>
      <Stack.Screen 
        options={{ 
          title: 'Settings',
          headerShown: false,
        }} 
      />
      
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
          <Text style={styles.title}>Settings</Text>
          <View style={styles.placeholder} />
        </View>

        {/* Settings Content */}
        <View style={styles.content}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Audio</Text>
            
            <View style={styles.settingItem}>
              <View style={styles.settingLeft}>
                <View style={styles.iconContainer}>
                  {soundEnabled ? (
                    <Volume2 size={24} color="#00FFFF" />
                  ) : (
                    <VolumeX size={24} color="#666" />
                  )}
                </View>
                <View style={styles.settingTextContainer}>
                  <Text style={styles.settingTitle}>Sound Effects</Text>
                  <Text style={styles.settingDescription}>
                    Enable or disable all game sounds
                  </Text>
                </View>
              </View>
              
              <Switch
                value={soundEnabled}
                onValueChange={handleSoundToggle}
                trackColor={{ 
                  false: 'rgba(255, 255, 255, 0.2)', 
                  true: 'rgba(0, 255, 255, 0.3)' 
                }}
                thumbColor={soundEnabled ? '#00FFFF' : '#666'}
                ios_backgroundColor="rgba(255, 255, 255, 0.2)"
              />
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Game Info</Text>
            
            <View style={styles.infoItem}>
              <Text style={styles.infoTitle}>ChronoBlast</Text>
              <Text style={styles.infoDescription}>
                Master time, collect energy, become legend
              </Text>
              <Text style={styles.versionText}>Version 1.0.0</Text>
            </View>
          </View>
        </View>
      </LinearGradient>
    </View>
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
    paddingTop: 60,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 255, 255, 0.2)',
  },
  backButton: {
    padding: 8,
    borderRadius: 12,
    backgroundColor: 'rgba(0, 255, 255, 0.1)',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 32,
  },
  section: {
    marginBottom: 40,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#00FFFF',
    marginBottom: 20,
    letterSpacing: 0.5,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(0, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(0, 255, 255, 0.2)',
    borderRadius: 16,
    padding: 20,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: 'rgba(0, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
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
    lineHeight: 20,
  },
  infoItem: {
    backgroundColor: 'rgba(0, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(0, 255, 255, 0.2)',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
  },
  infoTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#00FFFF',
    marginBottom: 8,
    textAlign: 'center',
  },
  infoDescription: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 12,
  },
  versionText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.5)',
    fontWeight: '500',
  },
});