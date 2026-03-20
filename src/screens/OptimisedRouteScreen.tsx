import React, {useState, useEffect} from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  Text,
  Alert,
} from 'react-native';
import MapView, {Marker, Polyline} from 'react-native-maps';
import firestore from '@react-native-firebase/firestore';
import {useDeliveries, Delivery} from '../hooks/useDeliveries';
import {useLocation} from '../hooks/useLocation';
import {optimizeRoute, OptimizationResult} from '../services/openRouteService';
import StopCard from '../components/StopCard';

export default function OptimisedRouteScreen() {
  const {deliveries} = useDeliveries();
  const {location, loading: locationLoading} = useLocation();
  const [optimizedStops, setOptimizedStops] = useState<Delivery[]>([]);
  const [routeCoords, setRouteCoords] = useState<
    Array<{latitude: number; longitude: number}>
  >([]);
  const [optimizing, setOptimizing] = useState(false);
  const [markingDelivered, setMarkingDelivered] = useState(false);

  const pendingDeliveries = deliveries.filter(d => d.status === 'pending');
  const pendingIds = pendingDeliveries.map(d => d.id).join(',');

  useEffect(() => {
    if (!location || pendingDeliveries.length === 0) {
      setOptimizedStops([]);
      setRouteCoords([]);
      return;
    }

    let cancelled = false;

    const runOptimization = async () => {
      setOptimizing(true);
      try {
        const stops = pendingDeliveries.map(d => d.location);
        const result: OptimizationResult = await optimizeRoute(location, stops);
        if (cancelled) return;
        const ordered = result.orderedIndices.map(i => pendingDeliveries[i]);
        setOptimizedStops(ordered);
        setRouteCoords(
          result.geometry.map(([lng, lat]) => ({
            latitude: lat,
            longitude: lng,
          })),
        );
      } catch (error: any) {
        if (cancelled) return;
        console.error('Optimization error:', error);
        Alert.alert(
          'Route Error',
          'Could not optimize route. Showing original order.',
        );
        setOptimizedStops(pendingDeliveries);
      } finally {
        if (!cancelled) setOptimizing(false);
      }
    };

    runOptimization();
    return () => {
      cancelled = true;
    };
  }, [location, pendingIds]);

  const handleMarkDelivered = async (deliveryId: string) => {
    setMarkingDelivered(true);
    try {
      await firestore()
        .collection('Deliveries')
        .doc(deliveryId)
        .update({status: 'delivered'});
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setMarkingDelivered(false);
    }
  };

  if (locationLoading || optimizing) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>
          {locationLoading
            ? 'Getting your location...'
            : 'Optimizing route...'}
        </Text>
      </View>
    );
  }

  if (!location) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>Location unavailable</Text>
        <Text style={styles.loadingText}>
          Please enable location services and try again
        </Text>
      </View>
    );
  }

  const mapRegion = {
    latitude: location.latitude,
    longitude: location.longitude,
    latitudeDelta: 0.1,
    longitudeDelta: 0.1,
  };

  if (pendingDeliveries.length === 0) {
    return (
      <View style={styles.centered}>
        <Text style={styles.emptyText}>All deliveries completed!</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        initialRegion={mapRegion}>
        <Marker coordinate={location} title="You" pinColor="blue" />
        {optimizedStops.map((stop, index) => (
          <Marker
            key={stop.id}
            coordinate={stop.location}
            title={`${index + 1}. ${stop.customerName}`}
            description={stop.address}
            pinColor="red"
          />
        ))}
        {routeCoords.length > 0 && (
          <Polyline
            coordinates={routeCoords}
            strokeColor="#007AFF"
            strokeWidth={4}
          />
        )}
      </MapView>
      <View style={styles.listContainer}>
        <Text style={styles.listTitle}>
          Delivery Order ({optimizedStops.length} stops)
        </Text>
        <FlatList
          data={optimizedStops}
          keyExtractor={item => item.id}
          renderItem={({item, index}) => (
            <StopCard
              delivery={item}
              index={index}
              onMarkDelivered={handleMarkDelivered}
              loading={markingDelivered}
            />
          )}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1},
  map: {flex: 1},
  centered: {flex: 1, justifyContent: 'center', alignItems: 'center'},
  loadingText: {marginTop: 12, fontSize: 14, color: '#666'},
  errorText: {fontSize: 16, color: '#FF3B30'},
  emptyText: {fontSize: 16, color: '#34C759', fontWeight: '600'},
  listContainer: {flex: 1, backgroundColor: '#f5f5f5'},
  listTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
    padding: 16,
    paddingBottom: 8,
  },
});
