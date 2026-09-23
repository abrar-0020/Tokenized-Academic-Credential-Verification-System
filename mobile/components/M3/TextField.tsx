import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Animated,
  TextInputProps,
  ViewStyle,
} from 'react-native';
import { Colors, Typography, Radius, Spacing } from '@/config/theme';

type Props = TextInputProps & {
  label: string;
  error?: string;
  containerStyle?: ViewStyle;
};

export default function TextField({ label, error, containerStyle, onFocus, onBlur, value, ...rest }: Props) {
  const [focused, setFocused] = useState(false);
  const labelAnim = useRef(new Animated.Value(value ? 1 : 0)).current;

  const animate = (toValue: number) => {
    Animated.timing(labelAnim, {
      toValue,
      duration: 150,
      useNativeDriver: false,
    }).start();
  };

  const handleFocus = (e: any) => {
    setFocused(true);
    animate(1);
    onFocus?.(e);
  };

  const handleBlur = (e: any) => {
    setFocused(false);
    if (!value) animate(0);
    onBlur?.(e);
  };

  const labelTop = labelAnim.interpolate({ inputRange: [0, 1], outputRange: [16, -8] });
  const labelFontSize = labelAnim.interpolate({ inputRange: [0, 1], outputRange: [16, 12] });
  const labelColor = labelAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [Colors.onSurfaceVariant, focused ? Colors.primaryContainer : Colors.onSurfaceVariant],
  });

  return (
    <View style={[styles.container, containerStyle]}>
      <View
        style={[
          styles.fieldWrapper,
          focused && styles.fieldWrapperFocused,
          !!error && styles.fieldWrapperError,
        ]}
      >
        <Animated.Text
          style={[
            styles.label,
            { top: labelTop, fontSize: labelFontSize, color: labelColor },
          ]}
        >
          {label}
        </Animated.Text>
        <TextInput
          style={styles.input}
          onFocus={handleFocus}
          onBlur={handleBlur}
          value={value}
          placeholderTextColor={Colors.outline}
          {...rest}
        />
      </View>
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.lg,
  },
  fieldWrapper: {
    position: 'relative',
    borderWidth: 1,
    borderColor: Colors.outline,
    borderRadius: Radius.sm,
    backgroundColor: Colors.surfaceContainerLowest,
    height: 56,
    justifyContent: 'flex-end',
  },
  fieldWrapperFocused: {
    borderWidth: 2,
    borderColor: Colors.primaryContainer,
  },
  fieldWrapperError: {
    borderColor: Colors.error,
  },
  label: {
    position: 'absolute',
    left: 12,
    backgroundColor: Colors.surfaceContainerLowest,
    paddingHorizontal: 4,
    fontFamily: 'Inter_400Regular',
    zIndex: 1,
  },
  input: {
    paddingHorizontal: 16,
    paddingBottom: 8,
    paddingTop: 4,
    ...Typography.bodyLg,
    color: Colors.onSurface,
  },
  error: {
    ...Typography.labelMd,
    color: Colors.error,
    marginTop: 4,
    marginLeft: 16,
  },
});
