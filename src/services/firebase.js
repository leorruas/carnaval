import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getAnalytics } from "firebase/analytics";
import { getMessaging, getToken, onMessage } from 'firebase/messaging';

// Configuração do Firebase
// IMPORTANTE: Substitua com suas credenciais do Firebase Console
const firebaseConfig = {
  apiKey: "AIzaSyBElTVuiMpEzJ8nCNyGKQvTshVDfeb1NfE",
  authDomain: "tateno-app.firebaseapp.com",
  projectId: "tateno-app",
  storageBucket: "tateno-app.firebasestorage.app",
  messagingSenderId: "790111485975",
  appId: "1:790111485975:web:dd9941f3ff0f06eef3dc52",
  measurementId: "G-MDX7R03H3Q"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
export const analytics = getAnalytics(app);

// Serviços do Firebase
export const auth = getAuth(app);
export const db = getFirestore(app);

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
