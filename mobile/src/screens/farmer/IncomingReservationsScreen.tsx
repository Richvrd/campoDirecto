import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  FlatList,
  RefreshControl,
  StyleSheet,
  Alert,
} from 'react-native';
import client from '../../api/client';
import type { Reservation, ApiResponse, PaginatedResponse } from '../../types';
import ReservationCard from '../../components/ReservationCard';
import LoadingSpinner from '../../components/LoadingSpinner';

export default function IncomingReservationsScreen() {
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

  async function handleConfirm(id: number) {
    try {
      await client.put(`/reservations/${id}/status`, { status: 'confirmada' });
      setReservations((prev) =>
        prev.map((r) => (r.id === id ? { ...r, status: 'confirmada' } : r))
      );
    } catch (err: any) {
      Alert.alert('Error', err?.response?.data?.message || 'No se pudo confirmar la reserva');
    }
  }

  async function handleReject(id: number) {
    Alert.alert(
      'Rechazar reserva',
      '¿Estás seguro de rechazar esta reserva?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Rechazar',
          style: 'destructive',
          onPress: async () => {
            try {
              await client.put(`/reservations/${id}/status`, { status: 'rechazada' });
              setReservations((prev) =>
                prev.map((r) => (r.id === id ? { ...r, status: 'rechazada' } : r))
              );
            } catch (err: any) {
              Alert.alert('Error', err?.response?.data?.message || 'No se pudo rechazar la reserva');
            }
          },
        },
      ]
    );
  }

  const renderItem = useCallback(
    ({ item }: { item: Reservation }) => (
      <ReservationCard
        reservation={item}
        onConfirm={handleConfirm}
        onReject={handleReject}
      />
    ),
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
