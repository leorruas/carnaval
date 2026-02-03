import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import {
  getFirestore,
  doc,
  getDoc
} from 'firebase/firestore';
import { getAnalytics } from "firebase/analytics";
import { getMessaging, getToken, onMessage } from 'firebase/messaging';

// Configuração do Firebase
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

// SINGLETON: Inicializar Firebase apenas uma vez
// Isso previne o erro "INTERNAL ASSERTION: Unexpected state"
let app;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
  console.log('[Firebase] App initialized (first time)');
} else {
  app = getApps()[0];
  console.log('[Firebase] Reusing existing app instance');
}

export const analytics = getAnalytics(app);

// Serviços do Firebase
export const auth = getAuth(app);

// SINGLETON: Firestore gerencia instância única automaticamente
// Compatible with Vite HMR - SDK handles singleton internally
export const db = getFirestore(app);
console.log('[Firebase] Firestore initialized (singleton)');

/**
 * "Aquece" a conexão do Firestore fazendo uma query dummy.
 */
export const warmupFirestore = async () => {
  try {
    console.log('[Firebase] Warming up Firestore connection...');
    const dummyRef = doc(db, '_connection_test', 'warmup');
    await getDoc(dummyRef, { source: 'server' });
    console.log('[Firebase] ✅ Firestore connection warmed up');
  } catch (error) {
    console.log('[Firebase] Warmup attempt completed (errors ignored)');
  }
};

// Messaging (notificações push)
let messaging = null;
try {
  if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
    messaging = getMessaging(app);
  }
} catch (error) {
  console.log('Firebase Messaging não suportado neste navegador:', error);
}

export { messaging };

// Função para solicitar permissão de notificação
export const requestNotificationPermission = async () => {
  try {
    if (!messaging) {
      console.log('Messaging não disponível');
      return null;
    }

    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      console.log('Permissão de notificação concedida');

      // Obter token FCM
      const token = await getToken(messaging, {
        vapidKey: 'YOUR_VAPID_KEY' // Obter do Firebase Console
      });

      console.log('Token FCM:', token);
      return token;
    } else {
      console.log('Permissão de notificação negada');
      return null;
    }
  } catch (error) {
    console.error('Erro ao solicitar permissão de notificação:', error);
    return null;
  }
};

// Listener para mensagens em primeiro plano
export const onMessageListener = () =>
  new Promise((resolve) => {
    if (!messaging) {
      console.log('Messaging não disponível');
      return;
    }

    onMessage(messaging, (payload) => {
      console.log('Mensagem recebida:', payload);
      resolve(payload);
    });
  });

export default app;
