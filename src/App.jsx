import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
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

  useEffect(() => {
    // Simulate initial load
    const timer = setTimeout(() => {
      setLoading(false);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

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
