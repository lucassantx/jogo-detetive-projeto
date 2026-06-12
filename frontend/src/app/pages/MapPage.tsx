import React from 'react';
import MapScreen      from '../components/Map/MapScreen';
import DialogueScreen from '../components/Dialog/DialogueScreen';
import HUD            from '../components/HUD/HUD';

const MapPage: React.FC = () => (
  <main style={{ position: 'relative' }}>
    <MapScreen />
    <DialogueScreen />
    <HUD />
  </main>
);

export default MapPage;