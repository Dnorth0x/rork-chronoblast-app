import React from 'react';
import { Pressable, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { Colors, Fonts, FontSizes, BorderRadius, Shadows } from '@/constants/theme';

interface AnimatedButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

const AnimatedButton: React.FC<AnimatedButtonProps> = ({ 
  title, 
  onPress, 
  variant = 'primary',
  size = 'medium',
  disabled = false,
  style,
  textStyle
}) => {
  const getButtonStyle = () => {
    const baseStyle = [styles.button, styles[size]];
    
    switch (variant) {
      case 'secondary':
        return [...baseStyle, styles.secondary];
      case 'outline':
        return [...baseStyle, styles.outline];
      default:
        return [...baseStyle, styles.primary];
    }
  };

  const getTextStyle = () => {
    const baseTextStyle = [styles.text, styles[`${size}Text`]];
    
    switch (variant) {
      case 'outline':
        return [...baseTextStyle, styles.outlineText];
      default:
        return baseTextStyle;
    }
  };

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        ...getButtonStyle(),
        pressed && styles.buttonPressed,
        disabled && styles.buttonDisabled,
        style,
      ]}
    >
      <Text style={[...getTextStyle(), textStyle]}>{title}</Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: BorderRadius.full,
    ...Shadows.glow,
  },
  
  // Variants
  primary: {
    backgroundColor: Colors.accent,
  },
  secondary: {
    backgroundColor: Colors.secondary,
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: Colors.accent,
  },
  
  // Sizes
  small: {
    paddingVertical: 8,
    paddingHorizontal: 20,
  },
  medium: {
    paddingVertical: 15,
    paddingHorizontal: 40,
  },
  large: {
    paddingVertical: 20,
    paddingHorizontal: 50,
  },
  
  // States
  buttonPressed: {
    transform: [{ scale: 0.95 }],
    opacity: 0.8,
  },
  buttonDisabled: {
    opacity: 0.5,
    ...Shadows.soft,
  },
  
  // Text styles
  text: {
    color: Colors.text,
    fontFamily: Fonts.bold,
    textAlign: 'center',
  },
  smallText: {
    fontSize: FontSizes.small,
  },
  mediumText: {
    fontSize: FontSizes.button,
  },
  largeText: {
    fontSize: FontSizes.subtitle,
  },
  outlineText: {
    color: Colors.accent,
  },
});

export default AnimatedButton;