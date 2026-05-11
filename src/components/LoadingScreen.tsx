import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';

export default function LoadingScreen({ onDone }: { onDone: () => void }) {
  const [progress, setProgress] = useState(0);
  const [hide, setHide] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(p => {
        if (p >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            setHide(true);
            setTimeout(onDone, 800);
          }, 400);
          return 100;
        }
        return p + 2;
      });
    }, 40);
    return () => clearInterval(interval);
  }, [onDone]);

  return (
    <AnimatePresence>
      {!hide && (
        <motion.div 
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[9999] bg-[#0d0508] flex flex-col items-center justify-center overflow-hidden"
        >
          {/* Animated background orbs */}
          <div className="absolute top-[10%] left-[10%] w-[400px] h-[400px] bg-rose-500/10 blur-[100px] animate-pulse" />
          <div className="absolute bottom-[10%] right-[10%] w-[300px] h-[300px] bg-amber-500/5 blur-[100px] animate-pulse transition-all duration-1000" />
          
          <div className="relative z-10 text-center">
            <motion.div 
              animate={{ scale: [1, 1.2, 1] }} 
              transition={{ repeat: Infinity, duration: 1.5 }}
              className="text-8xl mb-8 filter drop-shadow-[0_0_20px_rgba(244,63,94,0.4)]"
            >
              💕
            </motion.div>
            <h2 className="font-display text-3xl italic text-rose-500 mb-2 drop-shadow-[0_0_30px_rgba(244,63,94,0.3)]">
              A love letter is loading...
            </h2>
            <p className="font-body text-white/50 italic mb-12">
              Something magical awaits you ✨
            </p>
            
            {/* Progress Bar */}
            <div className="w-64 h-1.5 bg-white/5 rounded-full overflow-hidden mb-4 border border-white/5">
              <motion.div 
                className="h-full bg-gradient-to-r from-rose-500 to-amber-500 shadow-[0_0_15px_rgba(244,63,94,0.6)]"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="font-ui text-[10px] text-white/30 uppercase tracking-[0.3em] font-bold">
              {progress}%
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
