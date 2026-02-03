import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { useState, useEffect, lazy, Suspense, useRef } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, warmupFirestore } from './services/firebase';
import { getUserData } from './services/syncService';
import { mergeUserData } from './utils/migration';
import useStore from './store/useStore';
import { useFirestoreReady } from './hooks/useFirestoreReady';

// Lazy load pages for better performance
const Home = lazy(() => import('./pages/Home'));
const MyAgenda = lazy(() => import('./pages/MyAgenda'));
const MapPage = lazy(() => import('./pages/MapPage'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));

import BottomNav from './components/BottomNav';
import Loader from './components/Loader';
import { Agentation } from 'agentation';

function AppContent() {
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const { user, setUser, setFavorites, favoriteBlocks, setFriends, friends } = useStore();
  const { isReady: firestoreReady, isOnline } = useFirestoreReady();
  const syncedUsersRef = useRef(new Set()); // Track which users have been synced

  // Effect 0: Warmup Firestore connection ASAP
  useEffect(() => {
    warmupFirestore(); // Fire and forget - não bloquear o app
  }, []);

  // Effect 1: Authentication state listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      // Só para de carregar quando auth E firestore estiverem prontos (ou não houver usuário)
      if (firestoreReady || !user) {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [setUser, firestoreReady]);

  // Effect 2: Initial favorites sync (runs when user changes)
  // IMPORTANTE: Aguarda Firestore estar pronto antes de tentar sincronizar
  useEffect(() => {
    const syncInitialData = async () => {
      if (!user?.uid) return;

      // CRITICAL FIX: Evitar sync duplicado para o mesmo usuário
      if (syncedUsersRef.current.has(user.uid)) {
        console.log('[App] User already synced, skipping duplicate sync:', user.uid);
        return;
      }

      // Aguardar Firestore estar pronto
      if (!firestoreReady) {
        console.log('[App] Waiting for Firestore to be ready before syncing data...');
        return;
      }

      // Verificar conexão de internet
      if (!isOnline) {
        console.warn('[App] User is offline, skipping initial sync');
        return;
      }

      try {
        console.log('[App] Starting initial data sync for user:', user.uid);
        const cloudData = await getUserData(user.uid);

        // Prepare local data
        const localFavorites = useStore.getState().favoriteBlocks;
        const localFriends = useStore.getState().friends;
        const localData = { favorites: localFavorites, friends: localFriends };

        // Perform Merge
        const merged = await mergeUserData(
          user.uid,
          localData,
          cloudData || {}, // Cloud data might be null if new user
          user.displayName || 'Folião'
        );

        // Update Store
        setFavorites(merged.favorites);
        setFriends(merged.friends);

        // Marcar como sincronizado
        syncedUsersRef.current.add(user.uid);
        console.log('[App] Initial sync completed successfully');
      } catch (error) {
        console.error('Erro ao sincronizar dados:', error);
      }
    };

    syncInitialData();
  }, [user?.uid, firestoreReady, isOnline, setFavorites, setFriends]);

  // Effect 3: Prefetch other pages for instant navigation
  useEffect(() => {
    if (!loading) {
      // Wait 2 seconds after initial load, then prefetch likely pages
      const prefetchTimer = setTimeout(() => {
        import('./pages/MyAgenda');
        import('./pages/ProfilePage');
      }, 2000);
      return () => clearTimeout(prefetchTimer);
    }
  }, [loading]);

  return (
    <div className="App">
      <AnimatePresence mode="wait">
        {loading ? (
          <Loader key="loader" />
        ) : (
          <>
            <Suspense fallback={<Loader />}>
              <Routes location={location} key={location.pathname}>
                <Route path="/" element={<Home />} />
                <Route path="/agenda" element={<MyAgenda />} />
                <Route path="/mapa" element={<MapPage />} />
                <Route path="/perfil" element={<ProfilePage />} />
              </Routes>
            </Suspense>
            <BottomNav />
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppContent />
      {import.meta.env.DEV && <Agentation />}
    </BrowserRouter>
  );
}

export default App;
