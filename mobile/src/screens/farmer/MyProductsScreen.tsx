import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function MyProductsScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Mis productos</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F8FAF9' },
  text: { fontSize: 18, color: '#333' },
});
