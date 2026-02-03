import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { useState, useEffect, lazy, Suspense } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './services/firebase';
import { getUserFavorites, saveUserFavorites } from './services/syncService';
import useStore from './store/useStore';

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
  const { user, setUser, setFavorites, favoriteBlocks } = useStore();

  // Effect 1: Authentication state listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [setUser]);

  // Effect 2: Initial favorites sync (runs when user changes)
  useEffect(() => {
    const syncInitialFavorites = async () => {
      if (!user?.uid) return;

      try {
        const cloudFavorites = await getUserFavorites(user.uid);

        if (cloudFavorites && cloudFavorites.length > 0) {
          // Cloud has data - use it
          setFavorites(cloudFavorites);
        } else {
          // No cloud data - check if we have local favorites to upload
          const currentFavorites = useStore.getState().favoriteBlocks;
          if (currentFavorites.length > 0) {
            await saveUserFavorites(user.uid, currentFavorites);
          }
        }
      } catch (error) {
        console.error('Erro ao sincronizar favoritos:', error);
      }
    };

    syncInitialFavorites();
  }, [user?.uid, setFavorites]); // Only depends on user.uid

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
