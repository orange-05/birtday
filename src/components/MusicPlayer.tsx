import React, { useState, useEffect, useRef, useContext } from 'react';
import { Music, Play, Pause, Loader2 } from 'lucide-react';
import { db, storage } from '../lib/firebase';
import { AdminContext } from '../lib/context';
import { doc, setDoc, onSnapshot } from 'firebase/firestore';
import { handleFirestoreError, OperationType } from '../lib/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

export default function MusicPlayer() {
  const isAdmin = useContext(AdminContext);
  const [playing, setPlaying] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const path = 'app_data/music';
    const unsub = onSnapshot(doc(db, path), (snap) => {
      if (snap.exists() && snap.data().url) {
        const url = snap.data().url;
        setAudioUrl(url);
        if (audioRef.current) {
          audioRef.current.src = url;
          audioRef.current.loop = true;
        }
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, path);
    });
    return unsub;
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
      audioRef.current?.play();
      setPlaying(true);
    }
  };

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!isAdmin) return;
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      alert("Audio file too large (>10MB).");
      return;
    }

    setUploading(true);
    try {
      const path = `music/${Date.now()}_${file.name}`;
      const storageRef = ref(storage, path);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      setAudioUrl(url);
      if (audioRef.current) {
        audioRef.current.src = url;
        audioRef.current.loop = true;
        audioRef.current.play();
        setPlaying(true);
      }
      await setDoc(doc(db, 'app_data', 'music'), { url }, { merge: true });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, 'app_data/music');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="relative group">
      <audio ref={audioRef} />
      <button 
        onClick={toggle}
        className={`w-12 h-12 rounded-full backdrop-blur-md border flex items-center justify-center transition-all shadow-lg hover:scale-110 active:scale-95 ${playing ? 'bg-rose-500 border-rose-400 animate-[spin_10s_linear_infinite]' : 'bg-white/10 border-white/20'}`}
      >
        {uploading ? (
          <Loader2 size={20} className="animate-spin" />
        ) : playing ? (
          <Pause size={20} className="text-white" />
        ) : (
          <Music size={20} className="text-white" />
        )}
      </button>

      {isAdmin && (
        <div className="absolute top-14 right-0 bg-black/80 backdrop-blur-xl border border-white/10 p-4 rounded-2xl opacity-0 group-hover:opacity-100 transition-all pointer-events-none">
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
