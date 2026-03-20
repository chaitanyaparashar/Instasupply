import React from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import {RootStackParamList} from '../navigation/AppNavigator';
import {useDeliveries} from '../hooks/useDeliveries';
import DeliveryCard from '../components/DeliveryCard';

type NavProp = NativeStackNavigationProp<RootStackParamList, 'Deliveries'>;

export default function DeliveriesScreen() {
  const navigation = useNavigation<NavProp>();
  const {deliveries, loading} = useDeliveries();
  const insets = useSafeAreaInsets();

  const pendingCount = deliveries.filter(d => d.status === 'pending').length;

  const handleLogout = async () => {
    try {
      const userId = auth().currentUser?.uid;
      if (userId) {
        await firestore()
          .collection('users')
          .doc(userId)
          .update({fcmToken: firestore.FieldValue.delete()});
      }
      await auth().signOut();
    } catch (error: any) {
      Alert.alert('Error', error.message);
    }
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={[styles.header, {paddingTop: insets.top + 12}]}>
        <Text style={styles.title}>My Deliveries</Text>
        <TouchableOpacity onPress={handleLogout}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>
      {deliveries.length === 0 ? (
        <View style={styles.centered}>
          <Text style={styles.emptyText}>No deliveries assigned</Text>
        </View>
      ) : (
        <FlatList
          data={deliveries}
          keyExtractor={item => item.id}
          renderItem={({item}) => <DeliveryCard delivery={item} />}
          contentContainerStyle={styles.list}
        />
      )}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[
            styles.routeButton,
            pendingCount === 0 && styles.routeButtonDisabled,
          ]}
          onPress={() => navigation.navigate('OptimisedRoute')}
          disabled={pendingCount === 0}>
          <Text style={styles.routeButtonText}>
            View Optimised Route ({pendingCount} pending)
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#f5f5f5'},
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  title: {fontSize: 22, fontWeight: 'bold', color: '#333'},
  logoutText: {fontSize: 14, color: '#FF3B30', fontWeight: '600'},
  centered: {flex: 1, justifyContent: 'center', alignItems: 'center'},
  emptyText: {fontSize: 16, color: '#999'},
  list: {paddingVertical: 8},
  footer: {
    padding: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  routeButton: {
    backgroundColor: '#34C759',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
  },
  routeButtonDisabled: {backgroundColor: '#ccc'},
  routeButtonText: {color: '#fff', fontSize: 16, fontWeight: '600'},
});
