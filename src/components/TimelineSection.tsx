import React, { useState, useEffect, useRef, useContext } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Camera, Plus, Video as VideoIcon, FileText, ChevronRight, ChevronLeft, Trash2 } from 'lucide-react';
import { db, storage } from '../lib/firebase';
import { AdminContext } from '../lib/context';
import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';
import { handleFirestoreError, OperationType } from '../lib/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

const MEMORIES = [
  { date: 'september 20, 2024 (fresh date)', emoji: '💘', title: 'The Day We Met', desc: 'The moment the universe decided to be kind to me. You walked in and everything changed.', color: '#e8305a' },
  { date: 'september 20, 2024', emoji: '☕', title: 'Our First Date', desc: 'Coffee, laughter, and a conversation that went on forever. I never wanted it to end.', color: '#c9956c' },
  { date: 'dec 29, 2024', emoji: '🗻', title: 'Mounntain Day', desc: 'Sand, sunsets, and your hand in mine. One of the best days of my life.', color: '#ff6b8a' },
  { date: 'few nights in 2025', emoji: '🎭', title: 'Your brahmminsm', desc: 'Getting lost together at evening and not caring one bit. That\'s when I knew.', color: '#e8305a' },
  { date: 'Feb 14, 2025', emoji: '💍', title: 'Classism', desc: 'A full year of choosing you every single day. Best decision I ever made.', color: '#ff6b8a' },
  { date: 'Dec 25, 2025', emoji: '🎄', title: 'lovism', desc: 'You wearing my oversized sweater, hot chocolate, and  lights. Pure magic.', color: '#c9956c' },
];

export default function TimelineSection() {
  const isAdmin = useContext(AdminContext);
  const [chapters, setChapters] = useState<any[]>([]);
  const [timelineMedia, setTimelineMedia] = useState<Record<string, any[]>>({});
  const [uploading, setUploading] = useState<Record<string, boolean>>({});
  const [editingChapter, setEditingChapter] = useState<number | null>(null);
  const fileRefs = useRef<Record<string, HTMLInputElement | null>>({});

  useEffect(() => {
    const path = 'app_data/timeline';
    const unsub = onSnapshot(doc(db, path), (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        setTimelineMedia(data.media || {});
        setChapters(data.chapters || MEMORIES);
      } else if (isAdmin) {
        // Seed initial data ONLY if admin
        setChapters(MEMORIES);
        setDoc(doc(db, path), { chapters: MEMORIES, media: {} })
          .catch(err => handleFirestoreError(err, OperationType.CREATE, path));
      } else {
        setChapters(MEMORIES);
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, path);
    });
    return unsub;
  }, [isAdmin]);

  const saveChapters = async (newChapters: any[]) => {
    const path = 'app_data/timeline';
    setChapters(newChapters);
    try {
      await setDoc(doc(db, path), { chapters: newChapters }, { merge: true });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, path);
    }
  };

  const addChapter = () => {
    const newChapter = {
      id: crypto.randomUUID(),
      date: new Date().toLocaleDateString(),
      emoji: '✨',
      title: 'New Chapter',
      desc: 'Tell the story of this moment...',
      color: '#e8305a'
    };
    saveChapters([...chapters, newChapter]);
  };

  const updateChapter = (index: number, updates: any) => {
    const newChapters = [...chapters];
    newChapters[index] = { ...newChapters[index], ...updates };
    saveChapters(newChapters);
  };

  const deleteChapter = async (index: number) => {
    if (!confirm("Are you sure? This will remove the chapter from the timeline.")) return;
    const chapterId = chapters[index].id;
    const newChapters = [...chapters];
    newChapters.splice(index, 1);
    
    const newMedia = { ...timelineMedia };
    if (chapterId) delete newMedia[chapterId];
    
    setChapters(newChapters);
    setTimelineMedia(newMedia);
    await setDoc(doc(db, 'app_data', 'timeline'), { chapters: newChapters, media: newMedia });
  };

  const handleMediaUpload = async (chapterIndex: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const chapter = chapters[chapterIndex];
    if (!chapter) return;
    const chapterId = chapter.id || String(chapterIndex);

    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    const validFiles = files.filter(f => (f as File).size <= 10 * 1024 * 1024) as File[]; // Increased to 10MB
    if (validFiles.length < files.length) {
      alert("Some files exceed the 10 MB limit.");
    }

    if (validFiles.length === 0) return;

    const currentList = timelineMedia[chapterId] || [];
    if (currentList.length + validFiles.length > 20) {
      alert("Max 20 files per chapter.");
      return;
    }

    setUploading(prev => ({ ...prev, [chapterIndex]: true }));
    try {
      const results = [];
      for (const file of validFiles) {
        const path = `timeline/${chapterId}/${Date.now()}_${file.name}`;
        const storageRef = ref(storage, path);
        await uploadBytes(storageRef, file);
        const url = await getDownloadURL(storageRef);
        results.push({ url, type: file.type || 'application/octet-stream', name: file.name });
      }
      const newList = [...currentList, ...results];
      const newMedia = { ...timelineMedia, [chapterId]: newList };
      
      const path = 'app_data/timeline';
      await setDoc(doc(db, path), { media: newMedia }, { merge: true });
      // State is updated by onSnapshot
    } catch (err) {
      console.error("Upload error:", err);
      handleFirestoreError(err, OperationType.UPDATE, 'app_data/timeline');
    } finally {
      setUploading(prev => ({ ...prev, [chapterIndex]: false }));
      if (e.target) e.target.value = '';
    }
  };

  const syncChapters = async () => {
    if (!confirm("This will reset the timeline structure to the current version in the code. Media will be preserved. Proceed?")) return;
    try {
      await setDoc(doc(db, 'app_data', 'timeline'), { chapters: MEMORIES }, { merge: true });
      alert("Sync complete!");
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, 'app_data/timeline');
    }
  };

  const deleteMedia = async (chapterIndex: number, mediaIndex: number) => {
    if (!confirm("Are you sure you want to delete this memory?")) return;
    const chapter = chapters[chapterIndex];
    if (!chapter) return;
    const chapterId = chapter.id || String(chapterIndex);
    
    const currentList = [...(timelineMedia[chapterId] || [])];
    currentList.splice(mediaIndex, 1);
    
    const newMedia = { ...timelineMedia, [chapterId]: currentList };
    setTimelineMedia(newMedia);
    await setDoc(doc(db, 'app_data', 'timeline'), { media: newMedia }, { merge: true });
  };

  return (
    <section id="timeline" className="min-h-screen py-32 px-8 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-rose-500/5 to-transparent pointer-events-none" />
      
      <div className="text-center mb-24 relative z-10">
        <p className="font-body text-xs uppercase tracking-[0.5em] text-rose-500/70 mb-4 font-bold">Chapters of Us</p>
        <h2 className="font-display text-5xl md:text-6xl font-bold bg-gradient-to-r from-white to-rose-200 bg-clip-text text-transparent mb-6">
          Our Love Story 📖
        </h2>
        <p className="font-body text-xl text-white/50 italic">Every moment worth remembering...</p>
      </div>

      <div className="max-w-4xl mx-auto relative">
        {/* Connection Line */}
        <div className="absolute left-[24px] md:left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-transparent via-rose-500/50 to-transparent md:-translate-x-1/2" />

        {chapters.map((mem, i) => {
          const isLeft = i % 2 === 0;
          const chapterId = mem.id || String(i);
          const mediaList = timelineMedia[chapterId] || [];
          const isEditing = editingChapter === i;
          
          return (
            <motion.div 
              key={i}
              initial={{ opacity: 0, x: isLeft ? -50 : 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              className={`flex flex-col md:flex-row items-center mb-24 relative ${isLeft ? 'md:flex-row-reverse' : ''}`}
            >
              {/* Center Dot */}
              <div 
                className="absolute left-[24px] md:left-1/2 top-0 w-4 h-4 rounded-full border-2 border-rose-500 bg-zinc-900 md:-translate-x-1/2 translate-y-7 z-10 shadow-[0_0_15px_rgba(244,63,94,0.5)]"
                style={{ borderColor: mem.color }}
              />

              {/* Spacer for MD screens */}
              <div className="hidden md:block w-1/2" />

              {/* Card Container */}
              <div className="w-full md:w-1/2 pl-16 md:pl-0 md:px-12">
                <div 
                  className={`bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-3xl relative hover:bg-white/10 transition-all duration-500 group`}
                  style={{ borderLeft: `4px solid ${mem.color}` }}
                >
                  {isAdmin && (
                    <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => setEditingChapter(isEditing ? null : i)}
                        className="p-2 bg-white/10 hover:bg-white/20 rounded-full text-white/50 hover:text-white transition-all"
                      >
                         {isEditing ? 'Close' : 'Edit Info'}
                      </button>
                      <button 
                        onClick={() => deleteChapter(i)}
                        className="p-2 bg-rose-500/20 hover:bg-rose-500 rounded-full text-rose-500 hover:text-white transition-all"
                      >
                         <Trash2 size={14} />
                      </button>
                    </div>
                  )}

                  {isEditing ? (
                    <div className="space-y-4 mb-6">
                      <input 
                        type="text" 
                        value={mem.emoji} 
                        onChange={(e) => updateChapter(i, { emoji: e.target.value })}
                        className="bg-zinc-800 border border-white/10 rounded-lg p-2 text-white w-full"
                        placeholder="Emoji"
                      />
                      <input 
                        type="text" 
                        value={mem.date} 
                        onChange={(e) => updateChapter(i, { date: e.target.value })}
                        className="bg-zinc-800 border border-white/10 rounded-lg p-2 text-white w-full"
                        placeholder="Date"
                      />
                      <input 
                        type="text" 
                        value={mem.title} 
                        onChange={(e) => updateChapter(i, { title: e.target.value })}
                        className="bg-zinc-800 border border-white/10 rounded-lg p-2 text-white w-full"
                        placeholder="Title"
                      />
                      <textarea 
                        value={mem.desc} 
                        onChange={(e) => updateChapter(i, { desc: e.target.value })}
                        className="bg-zinc-800 border border-white/10 rounded-lg p-2 text-white w-full h-24"
                        placeholder="Description"
                      />
                      <input 
                        type="color" 
                        value={mem.color} 
                        onChange={(e) => updateChapter(i, { color: e.target.value })}
                        className="bg-zinc-800 border border-white/10 rounded-lg p-1 text-white w-full h-10"
                      />
                    </div>
                  ) : (
                    <div className="flex items-center gap-4 mb-6">
                      <span className="text-4xl filter drop-shadow-lg">{mem.emoji}</span>
                      <div>
                        <p className="text-[10px] uppercase tracking-widest text-white/40 font-bold mb-1">{mem.date}</p>
                        <h3 className="font-display text-2xl font-bold text-white group-hover:text-rose-400 transition-colors">{mem.title}</h3>
                      </div>
                    </div>
                  )}

                  {/* Media Gallery */}
                  <div className="w-full aspect-video bg-black/40 rounded-2xl mb-6 overflow-hidden relative group/media border border-white/5">
                    {uploading[i] ? (
                      <div className="absolute inset-0 flex flex-col items-center justify-center bg-zinc-950/80 z-20">
                        <div className="w-8 h-8 border-2 border-rose-500 border-t-transparent rounded-full animate-spin mb-4" />
                        <p className="text-[10px] uppercase tracking-widest text-white/50">Uploading...</p>
                      </div>
                    ) : null}

                    {mediaList.length > 0 ? (
                      <MediaCarousel 
                        media={mediaList} 
                        isAdmin={isAdmin} 
                        onDelete={(mediaIndex) => deleteMedia(i, mediaIndex)} 
                      />
                    ) : isAdmin ? (
                      <div 
                        onClick={() => fileRefs.current[i]?.click()}
                        className="h-full flex flex-col items-center justify-center text-white/20 cursor-pointer hover:bg-white/5 transition-all"
                      >
                        <Camera size={40} className="mb-3" />
                        <p className="text-xs font-bold uppercase tracking-widest">Add Media</p>
                      </div>
                    ) : (
                      <div className="h-full flex items-center justify-center text-white/10">
                        <Camera size={40} />
                      </div>
                    )}
                    
                    {isAdmin && (
                      <button 
                        onClick={() => fileRefs.current[i]?.click()}
                        className="absolute bottom-4 right-4 w-10 h-10 bg-rose-600 rounded-full flex items-center justify-center shadow-lg hover:bg-rose-500 transition-all active:scale-90 z-30"
                      >
                        <Plus size={24} />
                      </button>
                    )}
                    <input 
                      type="file" 
                      multiple 
                      accept="image/*,video/*,.pdf,.txt,.doc,.docx"
                      ref={el => fileRefs.current[i] = el}
                      className="hidden"
                      onChange={(e) => handleMediaUpload(i, e)}
                    />
                  </div>

                  {!isEditing && (
                    <p className="font-body text-white/60 italic leading-relaxed">
                      "{mem.desc}"
                    </p>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}

        {isAdmin && (
          <motion.div 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            className="flex flex-col items-center gap-4 pt-12 pb-24"
          >
            <button 
              onClick={addChapter}
              className="px-8 py-4 bg-white/5 border border-dashed border-white/20 rounded-2xl flex items-center gap-3 text-white/40 hover:text-white hover:border-white/40 hover:bg-white/10 transition-all font-bold uppercase tracking-widest text-xs"
            >
              <Plus size={20} />
              Add New Chapter
            </button>
            <button 
              onClick={syncChapters}
              className="text-[10px] text-white/20 hover:text-white/40 uppercase tracking-[0.2em] font-bold"
            >
              Sync Chapters with Code
            </button>
          </motion.div>
        )}
      </div>
    </section>
  );
}

function MediaCarousel({ 
  media, 
  isAdmin, 
  onDelete 
}: { 
  media: any[]; 
  isAdmin: boolean; 
  onDelete: (index: number) => void;
}) {
  const [index, setIndex] = useState(0);

  const next = () => setIndex((prev) => (prev + 1) % media.length);
  const prev = () => setIndex((prev) => (prev - 1 + media.length) % media.length);

  const renderContent = (item: any) => {
    if (item.type?.startsWith('video')) {
      return (
        <video 
          src={item.url} 
          autoPlay 
          muted 
          loop 
          className="w-full h-full object-cover" 
        />
      );
    } else if (item.type?.startsWith('image')) {
      return (
        <img 
          src={item.url} 
          alt="" 
          className="w-full h-full object-cover" 
        />
      );
    } else {
      // For PDF, Text files etc.
      return (
        <div className="w-full h-full flex flex-col items-center justify-center bg-zinc-900/50 p-6">
          <FileText size={64} className="text-amber-500 mb-4" />
          <p className="text-white font-bold text-center truncate w-full mb-4 px-4">{item.name || 'Document'}</p>
          <a 
            href={item.url} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-xs font-bold uppercase tracking-widest transition-all"
            onClick={(e) => e.stopPropagation()}
          >
            View File
          </a>
        </div>
      );
    }
  };

  return (
    <div className="w-full h-full relative group/carousel">
      <AnimatePresence mode="wait">
        <motion.div
          key={index}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="w-full h-full"
        >
          {renderContent(media[index])}
        </motion.div>
      </AnimatePresence>

      {isAdmin && (
        <button 
          onClick={(e) => {
            e.stopPropagation();
            onDelete(index);
          }}
          className="absolute top-4 left-4 w-8 h-8 bg-black/50 backdrop-blur-md rounded-full flex items-center justify-center text-rose-500 opacity-0 group-hover/carousel:opacity-100 transition-all hover:bg-rose-500 hover:text-white"
          title="Delete this item"
        >
          <Trash2 size={16} />
        </button>
      )}

      {media.length > 1 && (
        <>
          <button 
            onClick={prev}
            className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-black/50 backdrop-blur-md rounded-full flex items-center justify-center opacity-0 group-hover/carousel:opacity-100 transition-all"
          >
            <ChevronLeft size={16} />
          </button>
          <button 
            onClick={next}
            className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-black/50 backdrop-blur-md rounded-full flex items-center justify-center opacity-0 group-hover/carousel:opacity-100 transition-all"
          >
            <ChevronRight size={16} />
          </button>
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
             {media.map((_, i) => (
               <div key={i} className={`w-1 h-1 rounded-full ${i === index ? 'bg-white' : 'bg-white/30'}`} />
             ))}
          </div>
        </>
      )}
    </div>
  );
}
