import { initializeApp, FirebaseApp } from 'firebase/app';
import { Auth, getAuth, initializeAuth } from 'firebase/auth';
// @ts-ignore - getReactNativePersistence existe em runtime mas nao tem tipo publicado
import { getReactNativePersistence } from 'firebase/auth';
import { Firestore, getFirestore } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Configuracao do Firebase para o app Flashcards Medicina.
// Estas chaves sao de cliente (web config) e ficam embutidas no bundle
// do aplicativo - a seguranca dos dados e garantida pelas regras do
// Firestore, e nao pelo segredo dessas credenciais.
const firebaseConfig = {
  apiKey: 'AIzaSyASngmZMwuWsa1sXtMX1xP2D40LFH308U0',
  authDomain: 'flashcards-medicina.firebaseapp.com',
  projectId: 'flashcards-medicina',
  storageBucket: 'flashcards-medicina.firebasestorage.app',
  messagingSenderId: '870385687523',
  appId: '1:870385687523:web:56a3dad9cdd3cd3cb5ded6',
};

export const app: FirebaseApp = initializeApp(firebaseConfig);

function criarAuth(): Auth {
  try {
    return initializeAuth(app, {
      persistence: getReactNativePersistence(AsyncStorage),
    });
  } catch {
    // Se ja foi inicializado (HMR), retorna a instancia existente.
    return getAuth(app);
  }
}

export const auth: Auth = criarAuth();
export const db: Firestore = getFirestore(app);
