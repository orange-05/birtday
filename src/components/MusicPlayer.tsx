import React, { useState, useEffect, useRef, useContext } from 'react';
import { Music, Pause, Link as LinkIcon } from 'lucide-react';
import { doc, setDoc, onSnapshot } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { AdminContext } from '../lib/context';

export default function MusicPlayer() {
  const isAdmin = useContext(AdminContext);
  const [playing, setPlaying] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const unsub = onSnapshot(doc(db, 'app_data', 'music'), (snap) => {
      if (snap.exists() && snap.data().url) {
        const url = snap.data().url;
        setAudioUrl(url);
        if (audioRef.current) { 
          audioRef.current.src = url; 
          audioRef.current.loop = true; 
        }
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'app_data/music');
    });

    const handleCelebrate = () => {
      if (audioRef.current) {
        audioRef.current.play().then(() => setPlaying(true)).catch(err => {
          console.warn("Autoplay blocked or failed:", err);
        });
      }
    };

    window.addEventListener('celebrate-start', handleCelebrate);
    return () => {
      unsub();
      window.removeEventListener('celebrate-start', handleCelebrate);
    };
  }, []);

  const toggle = () => {
    if (!audioUrl) {
      if (isAdmin) handleSetUrl();
      return;
    }
    if (playing) {
      audioRef.current?.pause();
      setPlaying(false);
    } else {
      audioRef.current?.play().catch(console.error);
      setPlaying(true);
    }
  };

  const handleSetUrl = async () => {
    if (!isAdmin) return;
    const promptUrl = prompt("Please enter or paste a direct link to your MP3 file (e.g., from Google Drive direct link or any hosting site):");
    if (!promptUrl) return;
    
    try {
      setAudioUrl(promptUrl);
      await setDoc(doc(db, 'app_data', 'music'), { url: promptUrl }, { merge: true });
      if (audioRef.current) audioRef.current.src = promptUrl;
      alert("Song updated successfully!");
    } catch (err) { 
      handleFirestoreError(err, OperationType.WRITE, 'app_data/music'); 
    }
  };

  return (
    <div className="relative group pointer-events-auto">
      <audio ref={audioRef} />
      <button 
        onClick={toggle}
        className={`w-12 h-12 rounded-full backdrop-blur-md border flex items-center justify-center transition-all shadow-lg hover:scale-110 active:scale-95 ${playing ? 'bg-rose-500 border-rose-400 animate-[spin_10s_linear_infinite]' : 'bg-white/10 border-white/20'}`}
      >
        {playing ? (
          <Pause size={20} className="text-white" />
        ) : (
          <Music size={20} className="text-white" />
        )}
      </button>

      {isAdmin && (
        <div className="absolute top-14 right-0 bg-black/80 backdrop-blur-xl border border-white/10 p-4 rounded-2xl opacity-0 group-hover:opacity-100 transition-all pointer-events-auto z-[1000]">
          <p className="text-[10px] text-white/50 uppercase tracking-widest font-bold whitespace-nowrap mb-2">Music Control</p>
          <button 
             onClick={handleSetUrl}
             className="flex items-center gap-2 text-[10px] bg-rose-500/20 hover:bg-rose-500/40 text-rose-400 hover:text-rose-200 border border-rose-500/30 px-3 py-2 rounded-lg w-full transition-all whitespace-nowrap"
          >
            <LinkIcon size={12} />
            Paste MP3 Link
          </button>
        </div>
      )}
    </div>
  );
}
