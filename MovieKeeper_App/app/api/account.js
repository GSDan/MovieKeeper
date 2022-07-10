import AsyncStorage from '@react-native-async-storage/async-storage';
import
{
    initializeAuth,
    getReactNativePersistence,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword
} from 'firebase/auth/react-native';

import { app } from '../config/firebase'

// https://github.com/diegocasmo/expo-firebase-authentication/blob/main/src/api/user.js

const auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage)
});

export const getUser = () => auth.currentUser

export const onAuthenticationStateChanged = (args) => auth.onAuthStateChanged(args)

export const register = async (email, password) =>
{
    await createUserWithEmailAndPassword(auth, email, password);
}

export const signIn = async (email, password) =>
{
    await signInWithEmailAndPassword(auth, email, password)
}

export const sendVerification = () => getUser().sendEmailVerification()

export const signOut = async () => await auth.signOut();

export const reload = () => getUser().reload()

export const reauthenticate = ({ email = '', password = '' }) =>
    getUser().reauthenticateWithCredential(
        firebase.auth.EmailAuthProvider.credential(email, password)
    )

export const updatePassword = ({ password = '' }) => getUser().updatePassword(password)

export const sendPasswordReset = ({ email = '' }) => sendPasswordResetEmail(email)

