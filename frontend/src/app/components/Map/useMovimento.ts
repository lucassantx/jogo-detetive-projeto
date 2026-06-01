import { useEffect } from 'react';
import { useGameStore } from '../../store/gameStore';

export function useMovimento() {
  const mover        = useGameStore(s => s.mover);
  const dialogoAtivo = useGameStore(s => s.dialogoAtivo);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (dialogoAtivo) return;

      switch (e.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
          e.preventDefault();
          mover(0, -1);
          break;
        case 'ArrowDown':
        case 's':
        case 'S':
          e.preventDefault();
          mover(0, 1);
          break;
        case 'ArrowLeft':
        case 'a':
        case 'A':
          e.preventDefault();
          mover(-1, 0);
          break;
        case 'ArrowRight':
        case 'd':
        case 'D':
          e.preventDefault();
          mover(1, 0);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [dialogoAtivo, mover]);
}
