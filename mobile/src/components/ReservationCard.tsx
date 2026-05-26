import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import type { Reservation } from '../types';

const STATUS_COLORS: Record<string, { bg: string; text: string; label: string }> = {
  pendiente: { bg: '#FFF3E0', text: '#E65100', label: 'Pendiente' },
  confirmada: { bg: '#E8F5E9', text: '#2E7D32', label: 'Confirmada' },
  rechazada: { bg: '#FFEBEE', text: '#C62828', label: 'Rechazada' },
  completada: { bg: '#F5F5F5', text: '#616161', label: 'Completada' },
};

interface Props {
  reservation: Reservation;
  buyerView?: boolean;
  onConfirm?: (id: number) => void;
  onReject?: (id: number) => void;
}

export default function ReservationCard({ reservation, buyerView, onConfirm, onReject }: Props) {
  const badge = STATUS_COLORS[reservation.status] || STATUS_COLORS.pendiente;

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.productName} numberOfLines={1}>
          {reservation.product.name}
        </Text>
        <View style={[styles.badge, { backgroundColor: badge.bg }]}>
          <Text style={[styles.badgeText, { color: badge.text }]}>{badge.label}</Text>
        </View>
      </View>

      <View style={styles.detailRow}>
        <Text style={styles.detailLabel}>Cantidad:</Text>
        <Text style={styles.detailValue}>
          {reservation.quantity} {reservation.product.unit}
        </Text>
      </View>

      {buyerView && reservation.product.user && (
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Agricultor:</Text>
          <Text style={styles.detailValue}>{reservation.product.user.name}</Text>
        </View>
      )}

      {!buyerView && reservation.buyer && (
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Comprador:</Text>
          <Text style={styles.detailValue}>{reservation.buyer.name}</Text>
        </View>
      )}

      {reservation.notes && (
        <View style={styles.notesRow}>
          <Text style={styles.detailLabel}>Notas:</Text>
          <Text style={styles.notesText}>{reservation.notes}</Text>
        </View>
      )}

      {!buyerView && reservation.status === 'pendiente' && onConfirm && onReject && (
        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.rejectButton}
            onPress={() => onReject(reservation.id)}
          >
            <Text style={styles.rejectText}>Rechazar</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.confirmButton}
            onPress={() => onConfirm(reservation.id)}
          >
            <Text style={styles.confirmText}>Confirmar</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginHorizontal: 16,
    marginBottom: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  productName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    flex: 1,
    marginRight: 8,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  detailRow: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  detailLabel: {
    fontSize: 13,
    color: '#888',
    width: 80,
  },
  detailValue: {
    fontSize: 13,
    color: '#333',
    flex: 1,
  },
  notesRow: {
    marginTop: 4,
  },
  notesText: {
    fontSize: 13,
    color: '#555',
    fontStyle: 'italic',
    marginTop: 2,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 14,
  },
  rejectButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#E53935',
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
  },
  rejectText: {
    color: '#E53935',
    fontWeight: '600',
    fontSize: 14,
  },
  confirmButton: {
    flex: 1,
    backgroundColor: '#2D6A4F',
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
  },
  confirmText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
});
