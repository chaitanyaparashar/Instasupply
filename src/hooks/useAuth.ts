import {useState, useEffect} from 'react';
import auth, {FirebaseAuthTypes} from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';

type AuthState = {
  user: FirebaseAuthTypes.User | null;
  phoneVerified: boolean;
  loading: boolean;
};

export function useAuth(): AuthState {
  const [user, setUser] = useState<FirebaseAuthTypes.User | null>(null);
  const [phoneVerified, setPhoneVerified] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = auth().onAuthStateChanged(async firebaseUser => {
      setUser(firebaseUser);
      if (firebaseUser) {
        const doc = await firestore()
          .collection('users')
          .doc(firebaseUser.uid)
          .get();
        setPhoneVerified(doc.data()?.phoneVerified === true);
      } else {
        setPhoneVerified(false);
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  return {user, phoneVerified, loading};
}
