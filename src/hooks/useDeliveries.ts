import {useState, useEffect} from 'react';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';

export type Delivery = {
  id: string;
  orderId: string;
  customerName: string;
  address: string;
  status: 'pending' | 'delivered';
  driverId: string;
  location: {latitude: number; longitude: number};
  createdAt: any;
};

export function useDeliveries() {
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userId = auth().currentUser?.uid;
    console.log('[Deliveries] Current user UID:', userId);
    if (!userId) {
      setLoading(false);
      return;
    }

    const unsubscribe = firestore()
      .collection('Deliveries')
      .where('driverId', '==', userId)
      .onSnapshot(
        snapshot => {
          const items: Delivery[] = snapshot.docs.map(doc => {
            const data = doc.data();
            return {
              id: doc.id,
              orderId: data.orderId,
              customerName: data.customerName,
              address: data.address,
              status: data.status,
              driverId: data.driverId,
              location: {
                latitude: data.location.latitude,
                longitude: data.location.longitude,
              },
              createdAt: data.createdAt,
            };
          });
          setDeliveries(items);
          setLoading(false);
        },
        error => {
          console.error('Deliveries listener error:', error);
          setLoading(false);
        },
      );

    return unsubscribe;
  }, []);

  return {deliveries, loading};
}
