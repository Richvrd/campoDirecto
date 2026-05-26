import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  FlatList,
  RefreshControl,
  StyleSheet,
} from 'react-native';
import client from '../../api/client';
import type { Reservation, ApiResponse, PaginatedResponse } from '../../types';
import ReservationCard from '../../components/ReservationCard';
import LoadingSpinner from '../../components/LoadingSpinner';

export default function MyReservationsScreen() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchReservations();
  }, []);

  async function fetchReservations() {
    try {
      const res = await client.get<ApiResponse<PaginatedResponse<Reservation>>>('/reservations');
      setReservations(res.data.data.data);
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchReservations();
    setRefreshing(false);
  }, []);

  const renderItem = useCallback(
    ({ item }: { item: Reservation }) => <ReservationCard reservation={item} buyerView />,
    []
  );

  if (loading) return <LoadingSpinner message="Cargando reservas..." />;

  return (
    <View style={styles.container}>
      <FlatList
        data={reservations}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderItem}
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAF9',
  },
  list: {
    paddingTop: 16,
    paddingBottom: 24,
  },
});
