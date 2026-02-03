import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './services/firebase';
import { getUserFavorites, saveUserFavorites } from './services/syncService';
import useStore from './store/useStore';

import Home from './pages/Home';
import MyAgenda from './pages/MyAgenda';
import BottomNav from './components/BottomNav';
import MapPage from './pages/MapPage';
import ProfilePage from './pages/ProfilePage';
import Loader from './components/Loader';
import { Agentation } from 'agentation';

function AppContent() {
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const { setUser, setFavorites, favoriteBlocks } = useStore();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUser(user);

        try {
          const cloudFavorites = await getUserFavorites(user.uid);

          if (cloudFavorites && cloudFavorites.length > 0) {
            // Se existem favoritos na nuvem, usamos eles
            // Opcional: Mesclar com locais se quiser evitar perda de dados
            // Por simplicidade agora: Nuvem vence se tiver dados
            setFavorites(cloudFavorites);
          } else if (favoriteBlocks.length > 0) {
            // Se não tem na nuvem mas tem local, sobe os locais
            await saveUserFavorites(user.uid, favoriteBlocks);
          }
        } catch (error) {
          console.error('Erro ao sincronizar favoritos:', error);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []); // Só roda no mount

  return (
    <div className="App">
      <AnimatePresence mode="wait">
        {loading ? (
          <Loader key="loader" />
        ) : (
          <>
            <Routes location={location} key={location.pathname}>
              <Route path="/" element={<Home />} />
              <Route path="/agenda" element={<MyAgenda />} />
              <Route path="/mapa" element={<MapPage />} />
              <Route path="/perfil" element={<ProfilePage />} />
            </Routes>
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
