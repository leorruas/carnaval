import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import MyAgenda from './pages/MyAgenda';
import BottomNav from './components/BottomNav';

// Páginas placeholder (você pode implementar depois)
const MapPage = () => (
  <div className="min-h-screen flex items-center justify-center p-6">
    <div className="text-center">
      <div className="text-6xl mb-4">🗺️</div>
      <h2 className="text-2xl font-bold text-carnival-purple mb-2">Mapa</h2>
      <p className="text-gray-600">
        Em breve: visualize todos os blocos no mapa interativo!
      </p>
    </div>
  </div>
);

const ProfilePage = () => (
  <div className="min-h-screen flex items-center justify-center p-6">
    <div className="text-center">
      <div className="text-6xl mb-4">👤</div>
      <h2 className="text-2xl font-bold text-carnival-purple mb-2">Perfil</h2>
      <p className="text-gray-600">
        Em breve: configure suas preferências, adicione amigos e muito mais!
      </p>
    </div>
  </div>
);

function App() {
  return (
    <BrowserRouter>
      <div className="App">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/agenda" element={<MyAgenda />} />
          <Route path="/mapa" element={<MapPage />} />
          <Route path="/perfil" element={<ProfilePage />} />
        </Routes>
        <BottomNav />
      </div>
    </BrowserRouter>
  );
}

export default App;
