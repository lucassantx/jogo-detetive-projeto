import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';
import { useGameStore } from './store/gameStore';
import TitlePage      from './pages/TitlePage';
import MapPage        from './pages/MapPage';
import AccusationPage from './pages/AccusationPage';

// redireciona conforme statusJogo do store
const Roteador = () => {
  const statusJogo = useGameStore(s => s.statusJogo);
  const navigate   = useNavigate();

  useEffect(() => {
    if (statusJogo === 'titulo')   navigate('/', { replace: true });
    if (statusJogo === 'jogando')  navigate('/mapa', { replace: true });
    if (statusJogo === 'acusando') navigate('/acusacao', { replace: true });
  }, [statusJogo, navigate]);

  return null;
};

function App() {
  return (
    <BrowserRouter>
      <Roteador />
      <Routes>
        <Route path="/"         element={<TitlePage />} />
        <Route path="/mapa"     element={<MapPage />} />
        <Route path="/acusacao" element={<AccusationPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;