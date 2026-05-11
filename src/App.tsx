import { createContext, useContext, useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import { 
  Heart, 
  Lock, 
  Unlock, 
  Music, 
  Mail, 
  Camera, 
  Layout, 
  Sparkles, 
  ChevronDown, 
  X, 
  Plus, 
  Upload,
  Calendar,
  Moon,
  Sun
} from 'lucide-react';
import { db, storage, auth } from './lib/firebase';
import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { signInWithPopup, GoogleAuthProvider, onAuthStateChanged } from 'firebase/auth';

// Types
interface Media {
  url: string;
  type: string;
  name: string;
}

interface TimelineData {
  media: Record<string, Media[]>;
}

interface VaultData {
  media: Media[];
  notes: string;
}

interface CouponData {
  redeemed: Record<string, boolean>;
}

// Context
import { AdminContext } from './lib/context';
import { SECTIONS } from './components/Constants';
import CustomCursor from './components/CustomCursor';
import NavDots from './components/NavDots';
import LoadingScreen from './components/LoadingScreen';
import HeroSection from './components/HeroSection';
import TimelineSection from './components/TimelineSection';
import LoveMeterSection from './components/LoveMeterSection';
import ReasonsSection from './components/ReasonsSection';
import VaultSection from './components/VaultSection';
import CouponsSection from './components/CouponsSection';
import LetterSection from './components/LetterSection';
import MusicPlayer from './components/MusicPlayer';

// Constants
const ADMIN_PASSWORD = 'kavro2026';

// --- Sub-components ---

// Admin Login Component
const AdminLogin = ({ onLogin }: { onLogin: (isAdmin: boolean) => void }) => {
  const [show, setShow] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && (e.key === 'A' || e.key === 'a')) {
        e.preventDefault();
        setShow(true);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  const tryLogin = async () => {
    if (password === ADMIN_PASSWORD) {
      try {
        const provider = new GoogleAuthProvider();
        const result = await signInWithPopup(auth, provider);
        const user = result.user;
        
        if (user.email === 'karthikeyankkarthik7@gmail.com') {
          sessionStorage.setItem('isAdmin', 'true');
          onLogin(true);
          setShow(false);
          setPassword('');
        } else {
          alert("Unauthorized access. Only the owner can enter admin mode.");
          await auth.signOut();
        }
      } catch (err) {
        console.error("Auth error:", err);
      }
    } else {
      setError(true);
      setTimeout(() => setError(false), 800);
      setPassword('');
    }
  };

  if (!show) return null;
  return (
    <div className="fixed inset-0 z-[100000] bg-black/85 flex items-center justify-center p-4">
      <div className="bg-zinc-900 border border-white/10 rounded-3xl p-10 max-w-sm w-full text-center backdrop-blur-xl">
        <div className="text-6xl mb-6">🔑</div>
        <h3 className="text-2xl font-bold text-white mb-2 font-display">Admin Access</h3>
        <p className="text-white/50 italic mb-8 text-sm">Sign in with Google + Password</p>
        <input 
          type="password" 
          placeholder="Admin password..." 
          value={password} 
          onChange={e => setPassword(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && tryLogin()}
          className={`w-full bg-white/5 border rounded-xl py-3 px-4 text-white text-center outline-none transition-all mb-4 ${error ? 'border-rose-500 shadow-[0_0_20px_rgba(244,63,94,0.2)]' : 'border-white/10 focus:border-rose-500/50'}`}
        />
        {error && <p className="text-rose-500 text-xs italic mb-4">Incorrect password</p>}
        <button 
          onClick={tryLogin}
          className="w-full bg-gradient-to-r from-rose-500 to-amber-500 py-3 rounded-xl text-white font-bold shadow-lg shadow-rose-500/20 active:scale-95 transition-all"
        >
          🔓 Enter Admin Mode
        </button>
        <button onClick={() => setShow(false)} className="mt-4 text-white/30 text-xs hover:text-white/50 transition-colors">Cancel</button>
      </div>
    </div>
  );
};

// Floating Hearts
const FloatingHearts = () => {
  const [hearts, setHearts] = useState<{ id: number; x: number; duration: number; size: number; emoji: string }[]>([]);
  
  useEffect(() => {
    const interval = setInterval(() => {
      const id = Date.now();
      const heart = {
        id,
        x: Math.random() * 100,
        duration: 6 + Math.random() * 6,
        size: 10 + Math.random() * 20,
        emoji: ['❤️', '💕', '💗', '💖', '🌸', '✨', '🌹'][Math.floor(Math.random() * 7)]
      };
      setHearts(h => [...h.slice(-20), heart]);
      setTimeout(() => setHearts(h => h.filter(x => x.id !== id)), (heart.duration + 1) * 1000);
    }, 1500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-1 overflow-hidden">
      <AnimatePresence>
        {hearts.map(h => (
          <motion.div
            key={h.id}
            initial={{ y: '100vh', x: `${h.x}vw`, opacity: 0, rotate: 0 }}
            animate={{ y: '-10vh', rotate: 360, opacity: [0, 0.8, 0] }}
            exit={{ opacity: 0 }}
            transition={{ duration: h.duration, ease: "linear" }}
            className="absolute"
            style={{ fontSize: h.size }}
          >
            {h.emoji}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

// Main App Component
export default function App() {
  const [loaded, setLoaded] = useState(false);
  const [isAdmin, setIsAdmin] = useState(() => sessionStorage.getItem('isAdmin') === 'true');
  const [activeSection, setActiveSection] = useState(0);
  const [isLight, setIsLight] = useState(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      if (user && user.email === 'karthikeyankkarthik7@gmail.com' && sessionStorage.getItem('isAdmin') === 'true') {
         setIsAdmin(true);
      } else {
         setIsAdmin(false);
      }
    });
    return unsub;
  }, []);

  // Section observer
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const index = SECTIONS.indexOf(entry.target.id);
          if (index !== -1) setActiveSection(index);
        }
      });
    }, { threshold: 0.5 });

    SECTIONS.forEach(id => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [loaded]);

  const [showAlarm, setShowAlarm] = useState(false);

  useEffect(() => {
    if (loaded) {
      setTimeout(() => setShowAlarm(true), 1500);
    }
  }, [loaded]);

  if (!loaded) return <LoadingScreen onDone={() => setLoaded(true)} />;

  return (
    <AdminContext.Provider value={isAdmin}>
      <AnimatePresence>
        {showAlarm && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200000] flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ scale: 0.8, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              className="bg-zinc-900 border border-rose-500/50 rounded-[2rem] p-12 max-w-lg w-full text-center relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-rose-500/10 to-transparent pointer-events-none" />
              <div className="text-8xl mb-8 animate-bounce">🎈</div>
              <h2 className="font-display text-5xl font-black text-white mb-6 tracking-tight leading-tight">
                IT'S YOUR <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-400 to-amber-400">BIRTHDAY!</span>
              </h2>
              <p className="text-rose-200/60 font-body text-xl italic mb-10">
                Wishing you a day as incredible as you are.
              </p>
              <button 
                onClick={() => setShowAlarm(false)}
                className="w-full bg-white text-black font-black py-5 rounded-2xl text-xl uppercase tracking-widest hover:scale-[1.02] active:scale-95 transition-all shadow-2xl shadow-rose-500/20"
              >
                Let's Celebrate! 🎊
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      <div className={`min-h-screen transition-colors duration-700 ${isLight ? 'bg-rose-50 text-zinc-900' : 'bg-[#0d0508] text-white'} selection:bg-rose-500/30 cursor-none`}>
        <CustomCursor />
        <FloatingHearts />
        <AdminLogin onLogin={setIsAdmin} />
        
        {/* Navigation */}
        <NavDots active={activeSection} />
        
        {/* Controls */}
        <div className="fixed top-6 right-6 z-50 flex gap-3">
          <button 
            onClick={() => setIsLight(!isLight)}
            className="p-3 rounded-full bg-white/10 backdrop-blur-md border border-white/10 hover:bg-white/20 transition-all active:scale-90"
          >
            {isLight ? <Moon size={20} className="text-zinc-900" /> : <Sun size={20} className="text-zinc-100" />}
          </button>
          <MusicPlayer />
        </div>

        {/* Content */}
        <div className="flex flex-col">
          <HeroSection />
          <TimelineSection />
          <LoveMeterSection />
          <ReasonsSection />
          <VaultSection />
          <CouponsSection />
          <LetterSection />
        </div>

        <footer className="py-20 text-center border-t border-white/5 bg-black/20">
          <div className="text-4xl mb-4 animate-bounce">❤️</div>
          <p className="font-display text-lg opacity-50 italic">Made with all the love in the universe</p>
          <p className="font-ui text-[10px] uppercase tracking-[0.2em] opacity-20 mt-6">{new Date().getFullYear()} • Just For You • Always</p>
        </footer>
      </div>
    </AdminContext.Provider>
  );
}

// --- Import/Declare Sub Components (In separate files if needed, but for now here or imported) ---
// I'll create small files for these components to keep App.tsx clean.
