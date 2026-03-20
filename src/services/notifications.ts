import messaging from '@react-native-firebase/messaging';
import notifee, {AndroidImportance} from '@notifee/react-native';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import {Platform, PermissionsAndroid} from 'react-native';

export async function requestNotificationPermission(): Promise<boolean> {
  // Android 13+ (API 33+) requires runtime permission
  if (Platform.OS === 'android' && Platform.Version >= 33) {
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
    );
    if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
      return false;
    }
  }

  const authStatus = await messaging().requestPermission();
  return (
    authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
    authStatus === messaging.AuthorizationStatus.PROVISIONAL
  );
}

export async function saveFCMToken(): Promise<void> {
  const userId = auth().currentUser?.uid;
  if (!userId) return;

  const token = await messaging().getToken();
  await firestore().collection('users').doc(userId).set(
    {fcmToken: token},
    {merge: true},
  );
}

export function onTokenRefresh(): () => void {
  return messaging().onTokenRefresh(async newToken => {
    const currentUserId = auth().currentUser?.uid;
    if (currentUserId) {
      await firestore().collection('users').doc(currentUserId).set(
        {fcmToken: newToken},
        {merge: true},
      );
    }
  });
}

export async function displayLocalNotification(
  title: string,
  body: string,
): Promise<void> {
  const channelId = await notifee.createChannel({
    id: 'deliveries',
    name: 'Deliveries',
    importance: AndroidImportance.HIGH,
  });

  await notifee.displayNotification({
    title,
    body,
    android: {channelId},
  });
}

export function setupForegroundHandler(
  _onNotificationNav: (screen: string) => void,
): () => void {
  return messaging().onMessage(async remoteMessage => {
    const {title, body} = remoteMessage.notification || {};
    if (title && body) {
      await displayLocalNotification(title, body);
    }
  });
}

export async function checkInitialNotification(
  onNotificationNav: (screen: string) => void,
): Promise<void> {
  const initialNotification = await messaging().getInitialNotification();
  if (initialNotification?.data?.screen) {
    onNotificationNav(initialNotification.data.screen as string);
  }
}
