import { useState, useEffect } from 'react';

export default function CustomCursor() {
  const [pos, setPos] = useState({ x: -100, y: -100 });
  const [clicked, setClicked] = useState(false);

  useEffect(() => {
    const move = (e: MouseEvent) => setPos({ x: e.clientX, y: e.clientY });
    const mouseDown = () => setClicked(true);
    const mouseUp = () => setClicked(false);
    
    document.addEventListener('mousemove', move);
    document.addEventListener('mousedown', mouseDown);
    document.addEventListener('mouseup', mouseUp);
    
    return () => {
      document.removeEventListener('mousemove', move);
      document.removeEventListener('mousedown', mouseDown);
      document.removeEventListener('mouseup', mouseUp);
    };
  }, []);

  return (
    <div 
      className="fixed z-[100000] pointer-events-none transition-transform duration-75 ease-out"
      style={{ left: pos.x, top: pos.y, transform: `translate(-50%, -50%) scale(${clicked ? 0.8 : 1})` }}
    >
      <div className="text-2xl filter drop-shadow-[0_0_8px_rgba(244,63,94,0.8)] animate-pulse">
        💗
      </div>
    </div>
  );
}
