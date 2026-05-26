import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
  Alert,
  ActivityIndicator,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import client from '../../api/client';
import type { Category, ApiResponse } from '../../types';

export default function AddProductScreen() {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [unit, setUnit] = useState('');
  const [stock, setStock] = useState('');
  const [categoryId, setCategoryId] = useState<number | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  async function fetchCategories() {
    try {
      const res = await client.get<ApiResponse<Category[]>>('/categories');
      setCategories(res.data.data);
    } catch {
      Alert.alert('Error', 'No se pudieron cargar las categorías');
    }
  }

  async function pickImage() {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permiso requerido', 'Necesitamos acceso a tu galería');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setImageUri(result.assets[0].uri);
    }
  }

  function validate(): string | null {
    if (!name.trim()) return 'El nombre es obligatorio';
    if (!price.trim() || isNaN(parseFloat(price)) || parseFloat(price) < 0) return 'Precio inválido';
    if (!unit.trim()) return 'La unidad es obligatoria';
    if (!stock.trim() || isNaN(parseInt(stock, 10)) || parseInt(stock, 10) < 0) return 'Stock inválido';
    if (!categoryId) return 'Selecciona una categoría';
    return null;
  }

  const handleSubmit = useCallback(async () => {
    const error = validate();
    if (error) {
      Alert.alert('Error', error);
      return;
    }

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('name', name.trim());
      if (description.trim()) formData.append('description', description.trim());
      formData.append('price', price.trim());
      formData.append('unit', unit.trim());
      formData.append('stock', stock.trim());
      formData.append('category_id', String(categoryId));

      if (imageUri) {
        const filename = imageUri.split('/').pop() || 'photo.jpg';
        const ext = filename.split('.').pop() || 'jpg';
        formData.append('image', {
          uri: imageUri,
          name: filename,
          type: `image/${ext}`,
        } as any);
      }

      await client.post('/products', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      Alert.alert('Producto creado', 'El producto se ha publicado exitosamente', [
        { text: 'OK' },
      ]);

      setName('');
      setDescription('');
      setPrice('');
      setUnit('');
      setStock('');
      setCategoryId(null);
      setImageUri(null);
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Error al crear el producto';
      const fieldErrors = err?.response?.data?.errors;
      if (fieldErrors) {
        const firstError = Object.values(fieldErrors).flat()[0];
        Alert.alert('Error', String(firstError));
      } else {
        Alert.alert('Error', msg);
      }
    } finally {
      setSubmitting(false);
    }
  }, [name, description, price, unit, stock, categoryId, imageUri]);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.label}>Nombre del producto</Text>
      <TextInput
        style={styles.input}
        placeholder="Ej: Tomates cherry"
        placeholderTextColor="#999"
        value={name}
        onChangeText={setName}
      />

      <Text style={styles.label}>Descripción (opcional)</Text>
      <TextInput
        style={[styles.input, styles.textArea]}
        placeholder="Describe tu producto..."
        placeholderTextColor="#999"
        value={description}
        onChangeText={setDescription}
        multiline
        numberOfLines={3}
      />

      <View style={styles.row}>
        <View style={styles.half}>
          <Text style={styles.label}>Precio</Text>
          <TextInput
            style={styles.input}
            placeholder="$"
            placeholderTextColor="#999"
            value={price}
            onChangeText={setPrice}
            keyboardType="decimal-pad"
          />
        </View>
        <View style={styles.half}>
          <Text style={styles.label}>Unidad</Text>
          <TextInput
            style={styles.input}
            placeholder="kg, unidad, atado"
            placeholderTextColor="#999"
            value={unit}
            onChangeText={setUnit}
          />
        </View>
      </View>

      <Text style={styles.label}>Stock</Text>
      <TextInput
        style={styles.input}
        placeholder="Cantidad disponible"
        placeholderTextColor="#999"
        value={stock}
        onChangeText={setStock}
        keyboardType="number-pad"
      />

      <Text style={styles.label}>Categoría</Text>
      <View style={styles.categoryRow}>
        {categories.map((cat) => (
          <TouchableOpacity
            key={cat.id}
            style={[
              styles.categoryChip,
              categoryId === cat.id && styles.categoryChipActive,
            ]}
            onPress={() => setCategoryId(cat.id)}
          >
            <Text
              style={[
                styles.categoryChipText,
                categoryId === cat.id && styles.categoryChipTextActive,
              ]}
            >
              {cat.name}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.label}>Imagen (opcional)</Text>
      {imageUri && (
        <Image source={{ uri: imageUri }} style={styles.preview} resizeMode="cover" />
      )}
      <TouchableOpacity style={styles.imageButton} onPress={pickImage}>
        <Text style={styles.imageButtonText}>
          {imageUri ? 'Cambiar imagen' : 'Seleccionar imagen'}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.submitButton, submitting && styles.buttonDisabled]}
        onPress={handleSubmit}
        disabled={submitting}
      >
        {submitting ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.submitButtonText}>Publicar producto</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAF9',
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 6,
    marginTop: 12,
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: '#333',
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  half: {
    flex: 1,
  },
  categoryRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  categoryChipActive: {
    backgroundColor: '#2D6A4F',
    borderColor: '#2D6A4F',
  },
  categoryChipText: {
    fontSize: 13,
    color: '#666',
  },
  categoryChipTextActive: {
    color: '#fff',
    fontWeight: '600',
  },
  preview: {
    width: '100%',
    height: 180,
    borderRadius: 10,
    marginBottom: 8,
  },
  imageButton: {
    borderWidth: 1,
    borderColor: '#2D6A4F',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  imageButtonText: {
    color: '#2D6A4F',
    fontWeight: '600',
    fontSize: 14,
  },
  submitButton: {
    backgroundColor: '#2D6A4F',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 24,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
