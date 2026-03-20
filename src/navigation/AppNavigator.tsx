import React, {useEffect} from 'react';
import {ActivityIndicator, View, StyleSheet} from 'react-native';
import {
  NavigationContainer,
  createNavigationContainerRef,
} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {useAuth} from '../hooks/useAuth';
import LoginScreen from '../screens/LoginScreen';
import OTPVerificationScreen from '../screens/OTPVerificationScreen';
import DeliveriesScreen from '../screens/DeliveriesScreen';
import OptimisedRouteScreen from '../screens/OptimisedRouteScreen';
import {
  requestNotificationPermission,
  saveFCMToken,
  onTokenRefresh,
  setupForegroundHandler,
  checkInitialNotification,
} from '../services/notifications';

export type RootStackParamList = {
  Login: undefined;
  OTPVerification: undefined;
  Deliveries: undefined;
  OptimisedRoute: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export const navigationRef = createNavigationContainerRef<RootStackParamList>();

export default function AppNavigator() {
  const {user, phoneVerified, loading} = useAuth();

  useEffect(() => {
    if (user && phoneVerified) {
      requestNotificationPermission().then(() => saveFCMToken());

      const unsubForeground = setupForegroundHandler(screen => {
        if (navigationRef.isReady() && screen === 'Deliveries') {
          navigationRef.navigate('Deliveries');
        }
      });

      const unsubTokenRefresh = onTokenRefresh();

      checkInitialNotification(screen => {
        if (navigationRef.isReady() && screen === 'Deliveries') {
          navigationRef.navigate('Deliveries');
        }
      });

      return () => {
        unsubForeground();
        unsubTokenRefresh();
      };
    }
  }, [user, phoneVerified]);

  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <NavigationContainer ref={navigationRef}>
      <Stack.Navigator screenOptions={{headerShown: false}}>
        {!user ? (
          <Stack.Screen name="Login" component={LoginScreen} />
        ) : !phoneVerified ? (
          <Stack.Screen
            name="OTPVerification"
            component={OTPVerificationScreen}
          />
        ) : (
          <>
            <Stack.Screen name="Deliveries" component={DeliveriesScreen} />
            <Stack.Screen
              name="OptimisedRoute"
              component={OptimisedRouteScreen}
              options={{
                headerShown: true,
                title: 'Optimised Route',
                headerBackTitle: 'Back',
              }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  loading: {flex: 1, justifyContent: 'center', alignItems: 'center'},
});
