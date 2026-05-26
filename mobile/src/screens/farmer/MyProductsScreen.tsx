import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  FlatList,
  RefreshControl,
  TouchableOpacity,
  Text,
  StyleSheet,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import client from '../../api/client';
import ProductCard from '../../components/ProductCard';
import LoadingSpinner from '../../components/LoadingSpinner';
import type { Product, ApiResponse, PaginatedResponse, FarmerStackParamList } from '../../types';

type NavProp = NativeStackNavigationProp<FarmerStackParamList>;

const STATUS_BADGE: Record<string, { bg: string; text: string; label: string }> = {
  disponible: { bg: '#E8F5E9', text: '#2E7D32', label: 'Disponible' },
  agotado: { bg: '#FFEBEE', text: '#C62828', label: 'Agotado' },
  pausado: { bg: '#FFF3E0', text: '#E65100', label: 'Pausado' },
};

export default function MyProductsScreen() {
  const navigation = useNavigation<NavProp>();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchMyProducts();
  }, []);

  async function fetchMyProducts() {
    try {
      const res = await client.get<ApiResponse<PaginatedResponse<Product>>>('/products', {
        params: { mine: 1 },
      });
      setProducts(res.data.data.data);
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchMyProducts();
    setRefreshing(false);
  }, []);

  function handleDelete(product: Product) {
    Alert.alert(
      'Eliminar producto',
      `¿Estás seguro de eliminar "${product.name}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              await client.delete(`/products/${product.id}`);
              setProducts((prev) => prev.filter((p) => p.id !== product.id));
            } catch {
              Alert.alert('Error', 'No se pudo eliminar el producto');
            }
          },
        },
      ]
    );
  }

  function renderProduct({ item }: { item: Product }) {
    const badge = STATUS_BADGE[item.status] || STATUS_BADGE.disponible;
    return (
      <View>
        <View style={styles.badgeRow}>
          <View style={[styles.badge, { backgroundColor: badge.bg }]}>
            <Text style={[styles.badgeText, { color: badge.text }]}>{badge.label}</Text>
          </View>
          <TouchableOpacity onPress={() => handleDelete(item)}>
            <Text style={styles.deleteText}>Eliminar</Text>
          </TouchableOpacity>
        </View>
        <ProductCard product={item} onPress={() => {}} />
      </View>
    );
  }

  if (loading) return <LoadingSpinner message="Cargando productos..." />;

  return (
    <View style={styles.container}>
      <FlatList
        data={products}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderProduct}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#2D6A4F"
            colors={['#2D6A4F']}
          />
        }
      />
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('AddProduct')}
      >
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAF9',
  },
  list: {
    paddingTop: 12,
    paddingBottom: 80,
  },
  badgeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: 16,
    marginBottom: 4,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 10,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  deleteText: {
    fontSize: 13,
    color: '#E53935',
    fontWeight: '600',
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#2D6A4F',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 6,
  },
  fabText: {
    fontSize: 28,
    color: '#fff',
    lineHeight: 30,
  },
});
