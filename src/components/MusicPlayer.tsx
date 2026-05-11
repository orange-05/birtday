import React, { useState, useEffect, useRef, useContext } from 'react';
import { Music, Pause } from 'lucide-react';
import { doc, setDoc, onSnapshot } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage, handleFirestoreError, OperationType } from '../lib/firebase';
import { AdminContext } from '../lib/context';

export default function MusicPlayer() {
  const isAdmin = useContext(AdminContext);
  const [playing, setPlaying] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

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
      if (isAdmin) fileRef.current?.click();
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

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!isAdmin) return;
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const storagePath = `music/${Date.now()}_${file.name}`;
      const storageRef = ref(storage, storagePath);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      setAudioUrl(url);
      await setDoc(doc(db, 'app_data', 'music'), { url }, { merge: true });
    } catch (err) { handleFirestoreError(err, OperationType.WRITE, 'app_data/music'); }
    setUploading(false);
  };

  return (
    <div className="relative group">
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
        <div className="absolute top-14 right-0 bg-black/80 backdrop-blur-xl border border-white/10 p-4 rounded-2xl opacity-0 group-hover:opacity-100 transition-all pointer-events-none z-[1000]">
          <p className="text-[10px] text-white/50 uppercase tracking-widest font-bold whitespace-nowrap">Control Background Music</p>
          <button 
             onClick={() => fileRef.current?.click()}
             className="text-[10px] text-rose-500 underline mt-2 pointer-events-auto block"
          >
            Change Track
          </button>
        </div>
      )}
      <input type="file" ref={fileRef} accept="audio/*" className="hidden" onChange={handleFile} />
    </div>
  );
}
