import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {Delivery} from '../hooks/useDeliveries';

type Props = {
  delivery: Delivery;
};

export default function DeliveryCard({delivery}: Props) {
  const isPending = delivery.status === 'pending';

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.orderId}>#{delivery.orderId}</Text>
        <View
          style={[
            styles.badge,
            isPending ? styles.badgePending : styles.badgeDelivered,
          ]}>
          <Text
            style={[
              styles.badgeText,
              isPending ? styles.badgeTextPending : styles.badgeTextDelivered,
            ]}>
            {delivery.status.toUpperCase()}
          </Text>
        </View>
      </View>
      <Text style={styles.name}>{delivery.customerName}</Text>
      <Text style={styles.address}>{delivery.address}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 6,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  orderId: {fontSize: 16, fontWeight: '700', color: '#333'},
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgePending: {backgroundColor: '#FFF3CD'},
  badgeDelivered: {backgroundColor: '#D4EDDA'},
  badgeText: {fontSize: 11, fontWeight: '700'},
  badgeTextPending: {color: '#856404'},
  badgeTextDelivered: {color: '#155724'},
  name: {fontSize: 15, fontWeight: '500', color: '#444', marginBottom: 4},
  address: {fontSize: 13, color: '#888'},
});
