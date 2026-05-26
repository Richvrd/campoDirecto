import React from 'react';
import { View, ActivityIndicator, StyleSheet, Text } from 'react-native';

interface Props {
  message?: string;
  size?: 'small' | 'large';
}

export default function LoadingSpinner({ message, size = 'large' }: Props) {
  return (
    <View style={styles.container}>
      <ActivityIndicator size={size} color="#2D6A4F" />
      {message && <Text style={styles.message}>{message}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FAF9',
  },
  message: {
    marginTop: 12,
    fontSize: 14,
    color: '#666',
  },
});
