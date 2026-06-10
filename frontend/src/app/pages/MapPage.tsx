// Página principal do jogo: MapScreen (Dev 3) + HUD (Dev 4) + DialogueScreen (Dev 3)
// Dev 4: adicionar <HUD /> e <Inventario /> quando prontos

import React from 'react';
import MapScreen      from '../components/Map/MapScreen';
import DialogueScreen from '../components/Dialog/DialogueScreen';

const MapPage: React.FC = () => (
  <main style={{ position: 'relative' }}>
    <MapScreen />
    <DialogueScreen />
    {/* TODO Dev 4: <HUD /> */}
  </main>
);

export default MapPage;
