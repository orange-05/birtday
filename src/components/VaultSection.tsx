import React, { useState, useEffect, useRef, useContext } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Camera, Trash2, FileText, Search, Upload, X } from 'lucide-react';
import confetti from 'canvas-confetti';
import { AdminContext } from '../lib/context';

import { doc, setDoc, onSnapshot } from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { db, storage, handleFirestoreError, OperationType } from '../lib/firebase';

const SECRET_PASSWORD = '07122019';

export default function VaultSection() {
  const isAdmin = useContext(AdminContext);
  const [input, setInput] = useState('');
  const [unlocked, setUnlocked] = useState(false);
  const [error, setError] = useState(false);
  const [notes, setNotes] = useState('');
  const [vaultMedia, setVaultMedia] = useState<any[]>([]);
  const [uploadProgress, setUploadProgress] = useState<{ total: number, current: number, percent: number, fileName: string } | null>(null);
  const [lightbox, setLightbox] = useState<any | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!unlocked) return;
    const unsub = onSnapshot(doc(db, 'app_data', 'vault'), (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        setNotes(data.notes || '');
        setVaultMedia(data.media || []);
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'app_data/vault');
    });
    return unsub;
  }, [unlocked]);

  useEffect(() => {
    if (!isAdmin || !unlocked) return;
    const timer = setTimeout(() => {
      saveNotes(notes);
    }, 1000);
    return () => clearTimeout(timer);
  }, [notes, isAdmin, unlocked]);

  const saveNotes = async (val: string) => {
    try {
      await setDoc(doc(db, 'app_data', 'vault'), { notes: val }, { merge: true });
    } catch (err) { handleFirestoreError(err, OperationType.WRITE, 'app_data/vault'); }
  };

  const tryUnlock = () => {
    if (input === SECRET_PASSWORD) {
      setUnlocked(true);
      setError(false);
      confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
    } else {
      setError(true);
      setTimeout(() => setError(false), 800);
      setInput('');
    }
  };

  const handleMediaUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!isAdmin) return;
    const files = Array.from(e.target.files || []) as File[];
    if (!files.length) return;

    const validFiles = files.filter(f => f.size <= 20 * 1024 * 1024);
    
    if (validFiles.length === 0 && files.length > 0) {
      alert("All selected files are too large. Maximum size is 20MB per file.");
      return;
    }

    try {
      const results = [];
      let count = 0;
      for (const file of validFiles) {
        count++;
        const storagePath = `vault/${Date.now()}_${file.name}`;
        const storageRef = ref(storage, storagePath);
        const uploadTask = uploadBytesResumable(storageRef, file);

        await new Promise((resolve, reject) => {
          uploadTask.on('state_changed', 
            (snapshot) => {
              const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
              setUploadProgress({ current: count, total: validFiles.length, percent: Math.round(progress), fileName: file.name });
            }, 
            reject, 
            () => resolve(true)
          );
        });

        const url = await getDownloadURL(storageRef);
        results.push({ url, type: file.type, name: file.name });
      }

      const newMedia = [...vaultMedia, ...results];
      await setDoc(doc(db, 'app_data', 'vault'), { media: newMedia }, { merge: true });
    } catch (err: any) {
      console.error("Vault Upload error:", err);
      alert("Failed to upload to vault. Please check your connection and admin status.");
      handleFirestoreError(err, OperationType.WRITE, 'app_data/vault');
    } finally {
      setUploadProgress(null);
      if (e.target) e.target.value = '';
    }
  };

  const deleteVaultMedia = async (index: number) => {
    if (!confirm("Are you sure?")) return;
    const newList = [...vaultMedia];
    newList.splice(index, 1);
    setVaultMedia(newList);
    try {
      await setDoc(doc(db, 'app_data', 'vault'), { media: newList }, { merge: true });
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, 'app_data/vault');
    }
  };

  if (!unlocked) {
    return (
      <section id="vault" className="min-h-screen flex items-center justify-center p-8 bg-[#0d0508]">
        <div className="max-w-md w-full text-center">
          <motion.div 
            animate={{ rotate: [0, -10, 10, -10, 10, 0] }}
            transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
            className="text-7xl mb-12"
          >
            🔒
          </motion.div>
          <h2 className="font-display text-5xl font-bold text-white mb-4">The Secret Vault</h2>
          <p className="font-body text-white/50 italic text-xl mb-12">Only we know the password...</p>
          
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-10 rounded-[2.5rem] shadow-2xl">
            <input 
              type="password" 
              placeholder="Enter password..." 
              value={input} 
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && tryUnlock()}
              className={`w-full bg-white/5 border rounded-2xl py-4 px-6 text-white text-center text-lg tracking-[0.5em] outline-none transition-all mb-6 ${error ? 'border-rose-500 bg-rose-500/10' : 'border-white/10 focus:border-rose-500/50'}`}
              autoFocus
            />
            {error && <p className="text-rose-500 text-sm italic mb-6">Wrong password, love 🙈</p>}
            <button 
              onClick={tryUnlock}
              className="w-full bg-gradient-to-r from-rose-600 to-rose-400 py-4 rounded-2xl text-white font-bold text-lg shadow-xl shadow-rose-500/20 active:scale-95 transition-all uppercase tracking-widest"
            >
              Unlock Vault
            </button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="vault" className="min-h-screen py-32 px-8 flex flex-col items-center">
      <div className="max-w-4xl w-full">
        <div className="text-center mb-16">
          <motion.div 
             initial={{ scale: 0 }}
             animate={{ scale: 1 }}
             className="text-7xl mb-8"
          >
            💝
          </motion.div>
          <h2 className="font-display text-5xl font-bold text-white mb-4">You're In, Love 🌹</h2>
          <p className="font-body text-white/50 italic text-xl">Our private little universe</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white/5 backdrop-blur-md rounded-[2.5rem] p-8 border border-white/10">
            <h3 className="font-display text-2xl text-white mb-6 flex items-center gap-2">
              <Camera size={24} className="text-rose-500" /> Our Private Moments
            </h3>
            
            {isAdmin && (
               <div 
                  onClick={() => fileRef.current?.click()}
                  className="w-full aspect-video bg-white/5 border-2 border-dashed border-white/10 rounded-3xl flex flex-col items-center justify-center cursor-pointer hover:bg-white/10 transition-all mb-8 group relative"
               >
                  <Upload size={40} className="text-white/20 group-hover:text-rose-500 transition-colors mb-4" />
                  <p className="text-xs uppercase tracking-widest text-white/30 font-bold text-center px-6">Upload private media</p>
                  <p className="text-[8px] uppercase text-white/20 mt-1">Saved to Firebase</p>
                  <input type="file" ref={fileRef} multiple className="hidden" onChange={handleMediaUpload} />
               </div>
            )}

            <div className="grid grid-cols-3 gap-3">
              {vaultMedia.map((m, i) => (
                <div 
                  key={i} 
                  onClick={() => setLightbox(m)}
                  className="aspect-square bg-black/40 rounded-xl overflow-hidden cursor-pointer hover:scale-105 transition-all border border-white/5 relative group"
                >
                  {m.type?.startsWith('video') ? (
                    <video src={m.url} className="w-full h-full object-cover" />
                  ) : (
                    <img src={m.url} className="w-full h-full object-cover" />
                  )}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100 gap-4">
                    <Search size={20} className="text-white" />
                    {isAdmin && (
                      <button 
                        onClick={(e) => { e.stopPropagation(); deleteVaultMedia(i); }}
                        className="p-2 bg-rose-500/80 hover:bg-rose-500 rounded-lg transition-colors"
                      >
                        <Trash2 size={16} className="text-white" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white/5 backdrop-blur-md rounded-[2.5rem] p-8 border border-white/10 flex flex-col">
            <h3 className="font-display text-2xl text-white mb-6 flex items-center gap-2">
              <FileText size={24} className="text-amber-500" /> Secret Notes
            </h3>
            <textarea 
               value={notes}
               onChange={(e) => setNotes(e.target.value)}
               readOnly={!isAdmin}
               placeholder="Write our secret notes here... only we can see this 🌹"
               className="flex-1 w-full bg-white/5 border border-white/10 rounded-3xl p-6 text-white text-sm leading-relaxed outline-none focus:border-rose-500/50 transition-all resize-none font-body italic min-h-[300px]"
            />
            {isAdmin && <p className="text-[10px] uppercase tracking-widest text-white/20 mt-4 font-bold">✓ Firebase Auto-save</p>}
          </div>
        </div>
      </div>

      <AnimatePresence>
        {lightbox && (
          <motion.div 
             initial={{ opacity: 0 }}
             animate={{ opacity: 1 }}
             exit={{ opacity: 0 }}
             onClick={() => setLightbox(null)}
             className="fixed inset-0 z-[200000] bg-black/95 flex items-center justify-center p-8 backdrop-blur-md"
          >
            <button className="absolute top-10 right-10 text-white/50 hover:text-white transition-colors">
              <X size={32} />
            </button>
            <div onClick={e => e.stopPropagation()} className="max-w-5xl max-h-[80vh] w-full h-full flex items-center justify-center">
              {lightbox.type?.startsWith('video') ? (
                <video src={lightbox.url} controls autoPlay className="max-w-full max-h-full rounded-2xl" />
              ) : (
                <img src={lightbox.url} className="max-w-full max-h-full object-contain rounded-2xl" />
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
