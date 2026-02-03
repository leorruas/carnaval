import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import Home from './pages/Home';
import MyAgenda from './pages/MyAgenda';
import BottomNav from './components/BottomNav';
import MapPage from './pages/MapPage';
import ProfilePage from './pages/ProfilePage';
import { Agentation } from 'agentation';

function AppContent() {
  const location = useLocation();

  return (
    <div className="App">
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<Home />} />
          <Route path="/agenda" element={<MyAgenda />} />
          <Route path="/mapa" element={<MapPage />} />
          <Route path="/perfil" element={<ProfilePage />} />
        </Routes>
      </AnimatePresence>
      <BottomNav />
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppContent />
      <Agentation />
    </BrowserRouter>
  );
}

export default App;
