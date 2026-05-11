import { createContext, useContext, useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import { signInWithPopup, GoogleAuthProvider, onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from './lib/firebase';
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

// --- Context ---
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
const ADMIN_PASSWORD = '07122019';

// --- Sub-components ---

// Admin Login Component - Simple Password Only
const AdminLogin = ({ onLogin, show, setShow }: { onLogin: (isAdmin: boolean) => void; show: boolean; setShow: (v: boolean) => void }) => {
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const tryLogin = async () => {
    setAuthError(null);
    if (!password) {
      setAuthError("Please enter the administrator password.");
      return;
    }

    if (password === ADMIN_PASSWORD) {
      setLoading(true);
      try {
        const provider = new GoogleAuthProvider();
        provider.setCustomParameters({ prompt: 'select_account' });
        const result = await signInWithPopup(auth, provider);
        
        if (result.user.email === 'karthikeyankkarthik7@gmail.com') {
          sessionStorage.setItem('isAdmin', 'true');
          onLogin(true);
          setShow(false);
          setPassword('');
          confetti({
            particleCount: 150,
            spread: 90,
            origin: { y: 0.6 },
            colors: ['#e8305a', '#ffb548', '#ffffff']
          });
        } else {
          setAuthError("Unauthorized: Only the project owner can access admin features.");
          await signOut(auth);
        }
      } catch (err: any) {
        console.error("Login error:", err);
        switch (err.code) {
          case 'auth/configuration-not-found':
            setAuthError("Configuration Error: Google Sign-In is not enabled in Firebase Console.");
            break;
          case 'auth/unauthorized-domain':
            setAuthError(`Domain not authorized: Please add ${window.location.hostname} to authorized domains in Firebase.`);
            break;
          case 'auth/popup-closed-by-user':
            setAuthError("Login cancelled. Popup was closed before completion.");
            break;
          case 'auth/popup-blocked':
            setAuthError("Popup blocked: Please allow popups for this site to sign in.");
            break;
          case 'auth/network-request-failed':
            setAuthError("Network error: Please check your internet connection.");
            break;
          case 'auth/internal-error':
            setAuthError("Firebase internal error. Please try again later.");
            break;
          default:
            setAuthError(err.message || "An unexpected error occurred during sign-in.");
        }
      } finally {
        setLoading(false);
      }
    } else {
      setAuthError("Incorrect administrator password.");
      setPassword('');
    }
  };

  if (!show) return null;
  return (
    <div className="fixed inset-0 z-[100000] bg-black/90 flex items-center justify-center p-4 backdrop-blur-md">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        className="bg-[#1a1416] border border-white/10 rounded-[2.5rem] p-10 max-w-sm w-full text-center shadow-[0_20px_50px_rgba(0,0,0,0.5)]"
      >
        <div className="w-20 h-20 bg-gradient-to-br from-rose-500/20 to-amber-500/20 rounded-full flex items-center justify-center mx-auto mb-6 border border-white/5">
          <Lock className="text-rose-500 w-8 h-8" />
        </div>
        <h3 className="text-3xl font-bold text-white mb-2 font-display tracking-tight">Admin Portal</h3>
        <p className="text-white/40 italic mb-8 text-sm">Step into the controls, Commander.</p>
        
        <div className="space-y-4">
          <div className="relative">
            <input 
              type="password" 
              placeholder="Admin Password" 
              value={password} 
              onChange={e => {
                setPassword(e.target.value);
                if (authError) setAuthError(null);
              }}
              onKeyDown={e => e.key === 'Enter' && !loading && tryLogin()}
              className={`w-full bg-white/5 border rounded-2xl py-4 px-6 text-white text-center outline-none transition-all ${authError ? 'border-rose-500 bg-rose-500/5' : 'border-white/10 focus:border-rose-500/50 focus:bg-white/10'}`}
              autoFocus
              disabled={loading}
            />
          </div>

          <AnimatePresence mode="wait">
            {authError && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-rose-500/10 border border-rose-500/20 rounded-xl p-3"
              >
                <p className="text-rose-400 text-xs font-medium leading-relaxed">{authError}</p>
              </motion.div>
            )}
          </AnimatePresence>

          <button 
            onClick={tryLogin}
            disabled={loading}
            className="w-full bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-400 hover:to-rose-500 py-4 rounded-2xl text-white font-bold shadow-xl shadow-rose-500/20 active:scale-95 transition-all text-sm uppercase tracking-widest disabled:opacity-50 disabled:cursor-wait flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <motion.div 
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                />
                Verifying...
              </>
            ) : (
              'Initialize Login'
            )}
          </button>
          
          <button 
            onClick={() => {
              if (!loading) setShow(false);
            }} 
            className="text-white/20 text-[10px] uppercase tracking-[0.3em] font-black hover:text-white/40 transition-colors py-2"
          >
            Abort Mission
          </button>
        </div>
      </motion.div>
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
  const [isAdmin, setIsAdmin] = useState(() => {
    try {
      return sessionStorage.getItem('isAdmin') === 'true';
    } catch (e) {
      return false;
    }
  });
  const [activeSection, setActiveSection] = useState(0);
  const [isLight, setIsLight] = useState(false);
  const [showAdminLogin, setShowAdminLogin] = useState(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      if (user && user.email === 'karthikeyankkarthik7@gmail.com' && sessionStorage.getItem('isAdmin') === 'true') {
        setIsAdmin(true);
      } else {
        setIsAdmin(false);
      }
    });

    const handler = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && (e.key === 'A' || e.key === 'a')) {
        e.preventDefault();
        setShowAdminLogin(true);
      }
    };
    window.addEventListener('keydown', handler);
    return () => {
      unsub();
      window.removeEventListener('keydown', handler);
    };
  }, []);

  const handleLogout = async () => {
    if (confirm("Exit Admin Mode?")) {
      await signOut(auth);
      sessionStorage.removeItem('isAdmin');
      setIsAdmin(false);
    }
  };

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
              className="bg-zinc-900 border border-rose-500/50 rounded-[2rem] p-12 max-w-lg w-full text-center relative overflow-hidden shadow-2xl"
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
                onClick={() => {
                  setShowAlarm(false);
                  window.dispatchEvent(new CustomEvent('celebrate-start'));
                }}
                className="w-full bg-white text-black font-black py-5 rounded-2xl text-xl uppercase tracking-widest hover:scale-[1.02] active:scale-95 transition-all shadow-2xl shadow-rose-500/20 shadow-white/10"
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
        <AdminLogin onLogin={setIsAdmin} show={showAdminLogin} setShow={setShowAdminLogin} />
        
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

        {/* Admin Toggle */}
        <button 
          id="admin-toggle-button"
          onClick={() => isAdmin ? handleLogout() : setShowAdminLogin(true)}
          className={`fixed bottom-6 right-6 z-[9999] p-4 rounded-2xl backdrop-blur-xl border flex items-center gap-3 transition-all active:scale-90 shadow-2xl ${isAdmin ? 'bg-rose-500 border-rose-400 text-white shadow-rose-500/20' : 'bg-white/5 border-white/10 text-white/30 hover:text-white/60 hover:bg-white/10'}`}
        >
          {isAdmin ? <Unlock size={20} /> : <Lock size={20} />}
          <span className="font-bold uppercase tracking-widest text-[10px] hidden md:block">
            {isAdmin ? 'Admin on' : 'Admin off'}
          </span>
        </button>

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
