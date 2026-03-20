import {useState, useEffect} from 'react';
import {Platform, PermissionsAndroid, Alert} from 'react-native';
import Geolocation from '@react-native-community/geolocation';

type Location = {
  latitude: number;
  longitude: number;
} | null;

export function useLocation() {
  const [location, setLocation] = useState<Location>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    requestPermission().then(granted => {
      if (granted) {
        Geolocation.getCurrentPosition(
          position => {
            setLocation({
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
            });
            setLoading(false);
          },
          error => {
            console.error('Location error:', error);
            Alert.alert('Location Error', 'Unable to get your location');
            setLoading(false);
          },
          {enableHighAccuracy: false, timeout: 15000, maximumAge: 10000},
        );
      } else {
        setLoading(false);
      }
    });
  }, []);

  return {location, loading};
}

async function requestPermission(): Promise<boolean> {
  if (Platform.OS === 'ios') {
    return new Promise(resolve => {
      Geolocation.requestAuthorization(
        () => resolve(true),
        () => resolve(false),
      );
    });
  }

  const granted = await PermissionsAndroid.request(
    PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
  );
  return granted === PermissionsAndroid.RESULTS.GRANTED;
}
