import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import MyAgenda from './pages/MyAgenda';
import BottomNav from './components/BottomNav';

import MapPage from './pages/MapPage';
import ProfilePage from './pages/ProfilePage';
import { Agentation } from 'agentation';

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
      <Agentation />
    </BrowserRouter>
  );
}

export default App;
