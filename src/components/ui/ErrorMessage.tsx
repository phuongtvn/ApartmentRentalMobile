import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';

interface ErrorMessageProps {
  message: string;
  style?: ViewStyle;
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({ message, style }) => {
  return (
    <View style={[styles.container, style]}>
      <Text style={styles.icon}>⚠️</Text>
      <Text style={styles.message}>{message}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFE5E5',
    borderRadius: 8,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 8,
  },
  icon: {
    fontSize: 24,
    marginRight: 12,
  },
  message: {
    flex: 1,
    fontSize: 14,
    color: '#D32F2F',
  },
});
