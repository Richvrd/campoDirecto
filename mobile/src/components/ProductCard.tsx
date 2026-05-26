import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import type { Product } from '../types';

function formatCLP(price: number): string {
  return '$' + price.toLocaleString('es-CL');
}

interface Props {
  product: Product;
  onPress: (product: Product) => void;
}

export default function ProductCard({ product, onPress }: Props) {
  return (
    <TouchableOpacity style={styles.card} onPress={() => onPress(product)} activeOpacity={0.7}>
      {product.image_url ? (
        <Image source={{ uri: product.image_url }} style={styles.image} resizeMode="cover" />
      ) : (
        <View style={[styles.image, styles.imagePlaceholder]}>
          <Text style={styles.placeholderText}>Sin imagen</Text>
        </View>
      )}
      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={1}>
          {product.name}
        </Text>
        <Text style={styles.price}>{formatCLP(product.price)} / {product.unit}</Text>
        <Text style={styles.commune} numberOfLines={1}>
          {product.user?.location?.commune || 'Sin ubicación'}
        </Text>
        <View style={styles.stockRow}>
          <View style={[styles.stockDot, product.stock > 0 ? styles.inStock : styles.outStock]} />
          <Text style={styles.stockText}>
            {product.stock > 0 ? `${product.stock} ${product.unit} disponibles` : 'Agotado'}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginHorizontal: 16,
    marginBottom: 12,
    flexDirection: 'row',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  image: {
    width: 100,
    height: 100,
  },
  imagePlaceholder: {
    backgroundColor: '#E0E0E0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 12,
    color: '#999',
  },
  info: {
    flex: 1,
    padding: 12,
    justifyContent: 'center',
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  price: {
    fontSize: 15,
    fontWeight: '700',
    color: '#2D6A4F',
    marginBottom: 4,
  },
  commune: {
    fontSize: 13,
    color: '#888',
    marginBottom: 4,
  },
  stockRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  stockDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  inStock: {
    backgroundColor: '#52B788',
  },
  outStock: {
    backgroundColor: '#E53935',
  },
  stockText: {
    fontSize: 12,
    color: '#666',
  },
});
