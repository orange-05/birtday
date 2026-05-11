import { useState, useEffect } from 'react';
import { motion, useInView } from 'motion/react';
import { useRef } from 'react';

export default function LoveMeterSection() {
  const [fill, setFill] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.5 });

  useEffect(() => {
    if (isInView) {
      let n = 0;
      const t = setInterval(() => {
        n += 1;
        if (n >= 100) {
          clearInterval(t);
          n = 100;
        }
        setFill(n);
      }, 30);
    }
  }, [isInView]);

  return (
    <section id="lovemeter" className="min-h-screen py-32 flex flex-col items-center justify-center p-8 bg-gradient-to-b from-rose-950/20 to-transparent">
      <div className="text-center max-w-2xl w-full" ref={ref}>
        <p className="font-body text-xs uppercase tracking-[0.5em] text-rose-500/70 mb-4 font-bold">Measured in Infinity</p>
        <h2 className="font-display text-5xl md:text-6xl font-bold bg-gradient-to-r from-white to-rose-200 bg-clip-text text-transparent mb-16">
          The Love Meter 💗
        </h2>

        {/* Big Heart */}
        <div className="relative inline-block mb-24">
          {[...Array(5)].map((_, i) => (
             <motion.div
               key={i}
               initial={{ scale: 1, opacity: 0.8 }}
               animate={{ scale: [1, 2.5], opacity: [0.8, 0] }}
               transition={{ repeat: Infinity, duration: 2.5, delay: i * 0.5, ease: "easeOut" }}
               className="absolute inset-0 border border-rose-500/30 rounded-full"
             />
          ))}
          
          <motion.div 
            animate={{ scale: [1, 1.1, 1] }} 
            transition={{ repeat: Infinity, duration: 1.5 }}
            className="w-56 h-56 rounded-full bg-gradient-to-br from-rose-600/30 to-amber-600/10 border-2 border-rose-500/40 backdrop-blur-xl shadow-[0_0_100px_rgba(244,63,94,0.3)] flex flex-col items-center justify-center relative z-10"
          >
            <div className="font-display text-7xl font-bold text-rose-500 drop-shadow-lg">∞</div>
            <div className="font-ui text-xs uppercase tracking-widest text-white/50 mt-2 font-bold">Percent</div>
          </motion.div>
        </div>

        {/* Progress Bar */}
        <div className="w-full mb-20 text-left">
          <div className="flex justify-between items-end mb-4">
            <p className="font-body text-xl italic text-white/60">My love for you</p>
            <p className="font-display text-3xl font-bold text-rose-500">∞%</p>
          </div>
          <div className="h-4 bg-white/5 rounded-full p-0.5 border border-white/10 overflow-hidden shadow-inner">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${fill}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="h-full bg-gradient-to-r from-rose-600 via-rose-400 to-amber-500 rounded-full shadow-[0_0_20px_rgba(244,63,94,0.6)] relative"
            >
               <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.4),transparent)] animate-[shimmer_2s_infinite]" />
            </motion.div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
          {[
            { emoji: '💋', label: 'Kisses Given', val: '∞' },
            { emoji: '🤗', label: 'Hugs Shared', val: '∞' },
            { emoji: '⭐', label: 'Love Level', val: 'MAX' },
          ].map((s, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              viewport={{ once: true }}
              className="bg-white/5 backdrop-blur-md p-8 rounded-3xl border border-white/10 hover:bg-white/10 transition-all group"
            >
              <div className="text-4xl mb-4 group-hover:scale-125 transition-transform">{s.emoji}</div>
              <div className="font-display text-2xl font-bold text-rose-500 mb-1">{s.val}</div>
              <div className="font-ui text-[10px] uppercase tracking-widest text-white/40 font-bold">{s.label}</div>
            </motion.div>
          ))}
        </div>
      </div>

      <style>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
      `}</style>
    </section>
  );
}
