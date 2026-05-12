import React, { useState, useEffect, useRef, useContext } from 'react';
import { Music, Pause, Link as LinkIcon } from 'lucide-react';
import { doc, setDoc, onSnapshot } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { AdminContext } from '../lib/context';

// Helper to parse Youtube ID
function getYoutubeID(url: string) {
  const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[7].length === 11) ? match[7] : null;
}

export default function MusicPlayer() {
  const isAdmin = useContext(AdminContext);
  const [playing, setPlaying] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  // Detect if this is a YouTube link
  const ytId = audioUrl ? getYoutubeID(audioUrl) : null;

  useEffect(() => {
    const unsub = onSnapshot(doc(db, 'app_data', 'music'), (snap) => {
      if (snap.exists() && snap.data().url) {
        const url = snap.data().url;
        setAudioUrl(url);
        const isYt = !!getYoutubeID(url);
        if (!isYt && audioRef.current) { 
          audioRef.current.src = url; 
          audioRef.current.loop = true; 
        }
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'app_data/music');
    });

    const handleCelebrate = () => {
      setPlaying(true);
    };

    window.addEventListener('celebrate-start', handleCelebrate);
    return () => {
      unsub();
      window.removeEventListener('celebrate-start', handleCelebrate);
    };
  }, []);

  // Sync standard HTML5 audio playing state when not youtube
  useEffect(() => {
    if (!ytId && audioRef.current) {
      if (playing) {
        audioRef.current.play().catch(() => {});
      } else {
        audioRef.current.pause();
      }
    }
  }, [playing, ytId]);

  const toggle = () => {
    if (!audioUrl) {
      if (isAdmin) handleSetUrl();
      return;
    }
    setPlaying(!playing);
  };

  const handleSetUrl = async () => {
    if (!isAdmin) return;
    const promptUrl = prompt("Paste direct MP3 link OR a YouTube video link:", audioUrl || "");
    if (promptUrl === null) return;
    
    try {
      setAudioUrl(promptUrl);
      setPlaying(false); // Reset state for new load
      await setDoc(doc(db, 'app_data', 'music'), { url: promptUrl }, { merge: true });
      alert("Track saved successfully!");
    } catch (err) { 
      handleFirestoreError(err, OperationType.WRITE, 'app_data/music'); 
    }
  };

  return (
    <div className="relative group pointer-events-auto">
      {/* Render standard audio for direct files */}
      {!ytId && <audio ref={audioRef} src={audioUrl || ''} loop />}
      
      {/* Render completely hidden, zero-size YouTube player when active and playing */}
      {ytId && playing && (
        <div className="fixed opacity-0 pointer-events-none -z-50 w-1 h-1 overflow-hidden">
           <iframe 
             width="100" height="100" 
             src={`https://www.youtube.com/embed/${ytId}?autoplay=1&loop=1&playlist=${ytId}&enablejsapi=1`} 
             title="Hidden Player" 
             allow="autoplay"
           />
        </div>
      )}

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
            Change YouTube / MP3
          </button>
        </div>
      )}
    </div>
  );
}
