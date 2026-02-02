import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';

// Configuração do Firebase
// IMPORTANTE: Substitua com suas credenciais do Firebase Console
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID",
  measurementId: "YOUR_MEASUREMENT_ID"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);

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
