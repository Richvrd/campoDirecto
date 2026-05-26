import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  FlatList,
  TextInput,
  RefreshControl,
  StyleSheet,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import client from '../../api/client';
import type { Product, Category, ApiResponse, PaginatedResponse, BuyerStackParamList } from '../../types';
import ProductCard from '../../components/ProductCard';
import CategoryFilter from '../../components/CategoryFilter';
import LoadingSpinner from '../../components/LoadingSpinner';

type NavProp = NativeStackNavigationProp<BuyerStackParamList>;

export default function HomeScreen() {
  const navigation = useNavigation<NavProp>();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const fetchCategories = useCallback(async () => {
    try {
      const res = await client.get<ApiResponse<Category[]>>('/categories');
      setCategories(res.data.data);
    } catch {
      // silently fail
    }
  }, []);

  const fetchProducts = useCallback(
    async (pageNum: number, append: boolean) => {
      try {
        const params: Record<string, string | number> = { page: pageNum };
        if (selectedCategory) params.category_id = selectedCategory;
        if (search.trim()) params.search = search.trim();

        const res = await client.get<ApiResponse<PaginatedResponse<Product>>>('/products', {
          params,
        });
        const paginated = res.data.data;
        const newProducts = paginated.data;

        if (append) {
          setProducts((prev) => [...prev, ...newProducts]);
        } else {
          setProducts(newProducts);
        }
        setHasMore(paginated.current_page < paginated.last_page);
      } catch {
        // silently fail
      }
    },
    [selectedCategory, search]
  );

  const loadInitial = useCallback(async () => {
    setLoading(true);
    setPage(1);
    await fetchProducts(1, false);
    setLoading(false);
  }, [fetchProducts]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  useEffect(() => {
    loadInitial();
  }, [loadInitial]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    setPage(1);
    await fetchProducts(1, false);
    setRefreshing(false);
  }, [fetchProducts]);

  const onEndReached = useCallback(async () => {
    if (!hasMore || loadingMore || loading) return;
    setLoadingMore(true);
    const nextPage = page + 1;
    setPage(nextPage);
    await fetchProducts(nextPage, true);
    setLoadingMore(false);
  }, [hasMore, loadingMore, loading, page, fetchProducts]);

  const onProductPress = useCallback(
    (product: Product) => {
      navigation.navigate('ProductDetail', { productId: product.id });
    },
    [navigation]
  );

  const onCategorySelect = useCallback(
    (id: number | null) => {
      setSelectedCategory(id);
    },
    []
  );

  const onChangeSearch = useCallback((text: string) => {
    setSearch(text);
  }, []);

  const renderProduct = useCallback(
    ({ item }: { item: Product }) => <ProductCard product={item} onPress={onProductPress} />,
    [onProductPress]
  );

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.searchBar}
        placeholder="Buscar productos..."
        placeholderTextColor="#999"
        value={search}
        onChangeText={onChangeSearch}
        onSubmitEditing={loadInitial}
        returnKeyType="search"
        autoCapitalize="none"
        autoCorrect={false}
      />
      <CategoryFilter
        categories={categories}
        selectedId={selectedCategory}
        onSelect={onCategorySelect}
      />
      {loading ? (
        <LoadingSpinner message="Cargando productos..." />
      ) : (
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
          onEndReached={onEndReached}
          onEndReachedThreshold={0.3}
          ListFooterComponent={
            loadingMore ? <LoadingSpinner size="small" /> : null
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAF9',
  },
  searchBar: {
    margin: 16,
    marginBottom: 0,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    color: '#333',
  },
  list: {
    paddingTop: 4,
    paddingBottom: 24,
  },
});
