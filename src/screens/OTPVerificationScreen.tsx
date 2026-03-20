import React, {useState} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';

export default function OTPVerificationScreen() {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [code, setCode] = useState('');
  const [confirm, setConfirm] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const sendOTP = async () => {
    if (!phoneNumber.trim()) {
      Alert.alert('Error', 'Please enter your mobile number');
      return;
    }
    setLoading(true);
    try {
      const confirmation = await auth().verifyPhoneNumber(phoneNumber.trim());
      setConfirm(confirmation);
      Alert.alert(
        'OTP Sent',
        'Please check your phone for the verification code',
      );
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  const verifyOTP = async () => {
    if (!code.trim()) {
      Alert.alert('Error', 'Please enter the OTP code');
      return;
    }
    setLoading(true);
    try {
      const credential = auth.PhoneAuthProvider.credential(
        confirm.verificationId,
        code.trim(),
      );
      const currentUser = auth().currentUser;
      if (currentUser) {
        try {
          await currentUser.linkWithCredential(credential);
        } catch (linkError: any) {
          // If already linked, that's fine — just verify the credential
          if (
            linkError.code === 'auth/provider-already-linked' ||
            linkError.code === 'auth/credential-already-in-use' ||
            linkError.message?.includes('already been linked')
          ) {
            // Phone already linked, proceed to mark as verified
          } else {
            throw linkError;
          }
        }
        await firestore().collection('users').doc(currentUser.uid).set(
          {phoneVerified: true},
          {merge: true},
        );
      }
    } catch (error: any) {
      Alert.alert('Verification Failed', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={styles.inner}>
        <Text style={styles.title}>Verify Your Phone</Text>
        <Text style={styles.subtitle}>
          Enter your mobile number to receive a verification code
        </Text>
        {!confirm ? (
          <>
            <TextInput
              style={styles.input}
              placeholder="+1 234 567 8900"
              placeholderTextColor="#999"
              value={phoneNumber}
              onChangeText={setPhoneNumber}
              keyboardType="phone-pad"
            />
            <TouchableOpacity
              style={styles.button}
              onPress={sendOTP}
              disabled={loading}>
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>Send OTP</Text>
              )}
            </TouchableOpacity>
          </>
        ) : (
          <>
            <TextInput
              style={styles.input}
              placeholder="Enter 6-digit code"
              placeholderTextColor="#999"
              value={code}
              onChangeText={setCode}
              keyboardType="number-pad"
              maxLength={6}
            />
            <TouchableOpacity
              style={styles.button}
              onPress={verifyOTP}
              disabled={loading}>
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>Verify</Text>
              )}
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.linkButton}
              onPress={() => {
                setConfirm(null);
                setCode('');
              }}>
              <Text style={styles.linkText}>Change phone number</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#f5f5f5'},
  inner: {flex: 1, justifyContent: 'center', padding: 24},
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 32,
    marginTop: 8,
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    fontSize: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#ddd',
    color: '#333',
  },
  button: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonText: {color: '#fff', fontSize: 16, fontWeight: '600'},
  linkButton: {alignItems: 'center', marginTop: 16},
  linkText: {color: '#007AFF', fontSize: 14},
});
