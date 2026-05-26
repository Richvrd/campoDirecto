import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import client from '../../api/client';
import type { Product, ApiResponse } from '../../types';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { BuyerStackParamList } from '../../types';
import LoadingSpinner from '../../components/LoadingSpinner';

type Props = NativeStackScreenProps<BuyerStackParamList, 'ProductDetail'>;

function formatCLP(price: number): string {
  return '$' + price.toLocaleString('es-CL');
}

export default function ProductDetailScreen({ route }: Props) {
  const { productId } = route.params;
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState('1');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchProduct();
  }, [productId]);

  async function fetchProduct() {
    try {
      const res = await client.get<ApiResponse<Product>>(`/products/${productId}`);
      setProduct(res.data.data);
    } catch {
      Alert.alert('Error', 'No se pudo cargar el producto');
    } finally {
      setLoading(false);
    }
  }

  function isValidQuantity(): boolean {
    const q = parseInt(quantity, 10);
    return !isNaN(q) && q > 0 && product !== null && q <= product.stock;
  }

  function getQuantityError(): string | null {
    const q = parseInt(quantity, 10);
    if (isNaN(q) || q < 1) return 'La cantidad debe ser al menos 1';
    if (product && q > product.stock) return `Stock disponible: ${product.stock} ${product.unit}`;
    return null;
  }

  const handleReserve = useCallback(async () => {
    if (!isValidQuantity()) {
      Alert.alert('Error', getQuantityError() || 'Cantidad inválida');
      return;
    }

    setSubmitting(true);
    try {
      await client.post<ApiResponse<any>>('/reservations', {
        product_id: productId,
        quantity: parseInt(quantity, 10),
      });
      Alert.alert(
        'Reserva creada',
        'Tu reserva ha sido enviada. El agricultor la revisará pronto.',
        [{ text: 'OK' }]
      );
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Error al crear la reserva';
      Alert.alert('Error', msg);
    } finally {
      setSubmitting(false);
    }
  }, [productId, quantity]);

  if (loading) return <LoadingSpinner message="Cargando producto..." />;
  if (!product) return <LoadingSpinner message="Producto no encontrado" />;

  const qError = getQuantityError();

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {product.image_url ? (
        <Image source={{ uri: product.image_url }} style={styles.image} resizeMode="cover" />
      ) : (
        <View style={[styles.image, styles.imagePlaceholder]}>
          <Text style={styles.placeholderText}>Sin imagen</Text>
        </View>
      )}

      <View style={styles.section}>
        <Text style={styles.name}>{product.name}</Text>
        <Text style={styles.price}>{formatCLP(product.price)} / {product.unit}</Text>

        {product.description ? (
          <Text style={styles.description}>{product.description}</Text>
        ) : null}

        <View style={styles.metaRow}>
          <Text style={styles.metaLabel}>Stock:</Text>
          <Text style={styles.metaValue}>
            {product.stock > 0 ? `${product.stock} ${product.unit}` : 'Agotado'}
          </Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Agricultor</Text>
        <Text style={styles.farmerName}>{product.user.name}</Text>
        <Text style={styles.farmerDetail}>
          {product.user.location?.commune || 'Sin ubicación'}
        </Text>
        {product.user.phone && (
          <Text style={styles.farmerDetail}>Tel: {product.user.phone}</Text>
        )}
      </View>

      {product.stock > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Reservar</Text>
          <TextInput
            style={styles.quantityInput}
            placeholder="Cantidad"
            placeholderTextColor="#999"
            value={quantity}
            onChangeText={setQuantity}
            keyboardType="number-pad"
          />
          {qError && <Text style={styles.errorText}>{qError}</Text>}
          <TouchableOpacity
            style={[styles.reserveButton, submitting && styles.buttonDisabled]}
            onPress={handleReserve}
            disabled={submitting || !isValidQuantity()}
          >
            {submitting ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.reserveButtonText}>Reservar</Text>
            )}
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAF9',
  },
  content: {
    paddingBottom: 40,
  },
  image: {
    width: '100%',
    height: 240,
  },
  imagePlaceholder: {
    backgroundColor: '#E0E0E0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 16,
    color: '#999',
  },
  section: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  name: {
    fontSize: 22,
    fontWeight: '700',
    color: '#333',
    marginBottom: 6,
  },
  price: {
    fontSize: 20,
    fontWeight: '700',
    color: '#2D6A4F',
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: '#555',
    lineHeight: 20,
    marginBottom: 12,
  },
  metaRow: {
    flexDirection: 'row',
    marginTop: 4,
  },
  metaLabel: {
    fontSize: 14,
    color: '#888',
    width: 60,
  },
  metaValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  farmerName: {
    fontSize: 15,
    color: '#333',
    fontWeight: '500',
    marginBottom: 2,
  },
  farmerDetail: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  quantityInput: {
    backgroundColor: '#F8FAF9',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    color: '#333',
    marginBottom: 4,
  },
  errorText: {
    fontSize: 12,
    color: '#E53935',
    marginBottom: 8,
  },
  reserveButton: {
    backgroundColor: '#2D6A4F',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  reserveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
