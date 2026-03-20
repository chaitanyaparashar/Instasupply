import React from 'react';
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';
import {Delivery} from '../hooks/useDeliveries';

type Props = {
  delivery: Delivery;
  index: number;
  onMarkDelivered: (id: string) => void;
  loading: boolean;
};

export default function StopCard({
  delivery,
  index,
  onMarkDelivered,
  loading,
}: Props) {
  return (
    <View style={styles.card}>
      <View style={styles.indexContainer}>
        <Text style={styles.indexText}>{index + 1}</Text>
      </View>
      <View style={styles.info}>
        <Text style={styles.orderId}>#{delivery.orderId}</Text>
        <Text style={styles.name}>{delivery.customerName}</Text>
        <Text style={styles.address}>{delivery.address}</Text>
      </View>
      <TouchableOpacity
        style={styles.deliverButton}
        onPress={() => onMarkDelivered(delivery.id)}
        disabled={loading}>
        <Text style={styles.deliverText}>Delivered</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 12,
    marginHorizontal: 16,
    marginVertical: 4,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  indexContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  indexText: {color: '#fff', fontSize: 14, fontWeight: '700'},
  info: {flex: 1},
  orderId: {fontSize: 14, fontWeight: '700', color: '#333'},
  name: {fontSize: 13, color: '#555', marginTop: 2},
  address: {fontSize: 12, color: '#888', marginTop: 2},
  deliverButton: {
    backgroundColor: '#34C759',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  deliverText: {color: '#fff', fontSize: 12, fontWeight: '600'},
});
