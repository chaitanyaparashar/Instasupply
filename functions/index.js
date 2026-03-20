const {onDocumentCreated} = require('firebase-functions/v2/firestore');
const {initializeApp} = require('firebase-admin/app');
const {getFirestore} = require('firebase-admin/firestore');
const {getMessaging} = require('firebase-admin/messaging');

initializeApp();

exports.onNewDelivery = onDocumentCreated(
  'Deliveries/{docId}',
  async event => {
    const delivery = event.data.data();
    const driverId = delivery.driverId;

    if (!driverId) {
      console.log('No driverId found on delivery document');
      return;
    }

    const db = getFirestore();
    const userDoc = await db.collection('users').doc(driverId).get();

    if (!userDoc.exists) {
      console.log(`User document not found for driver: ${driverId}`);
      return;
    }

    const fcmToken = userDoc.data().fcmToken;
    if (!fcmToken) {
      console.log(`No FCM token for driver: ${driverId}`);
      return;
    }

    const message = {
      token: fcmToken,
      notification: {
        title: 'New Delivery Assigned',
        body: `Order #${delivery.orderId} for ${delivery.customerName}`,
      },
      data: {
        screen: 'Deliveries',
        deliveryId: event.params.docId,
      },
    };

    try {
      await getMessaging().send(message);
      console.log(`Push sent to driver ${driverId}`);
    } catch (error) {
      console.error('Error sending push:', error);
    }
  },
);
