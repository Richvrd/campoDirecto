import React from 'react';
import { ScrollView, TouchableOpacity, Text, StyleSheet } from 'react-native';
import type { Category } from '../types';

interface Props {
  categories: Category[];
  selectedId: number | null;
  onSelect: (id: number | null) => void;
}

export default function CategoryFilter({ categories, selectedId, onSelect }: Props) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
    >
      <TouchableOpacity
        style={[styles.chip, selectedId === null && styles.chipActive]}
        onPress={() => onSelect(null)}
      >
        <Text style={[styles.chipText, selectedId === null && styles.chipTextActive]}>
          Todas
        </Text>
      </TouchableOpacity>
      {categories.map((cat) => (
        <TouchableOpacity
          key={cat.id}
          style={[styles.chip, selectedId === cat.id && styles.chipActive]}
          onPress={() => onSelect(cat.id)}
        >
          <Text style={[styles.chipText, selectedId === cat.id && styles.chipTextActive]}>
            {cat.name}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    alignItems: 'center',
  },
  chip: {
    height: 36,
    paddingHorizontal: 16,
    justifyContent: 'center',
    borderRadius: 18,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    marginRight: 8,
  },
  chipActive: {
    backgroundColor: '#2D6A4F',
    borderColor: '#2D6A4F',
  },
  chipText: {
    fontSize: 14,
    color: '#666',
  },
  chipTextActive: {
    color: '#fff',
    fontWeight: '600',
  },
});
