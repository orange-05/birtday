import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';

const REASONS = [
  { front: '❤️', back: 'Your smile lights up the entire room and my entire world.' },
  { front: '😂', back: 'You make me laugh until my stomach hurts every single day.' },
  { front: '🌙', back: 'You\'re even more beautiful at 2am when you think no one\'s watching.' },
  { front: '💪', back: 'Your strength and resilience inspire me every single day.' },
  { front: '🍳', back: 'The way you take care of me without even realizing it.' },
  { front: '📚', back: 'Your intelligence and the way your eyes light up when you talk about things you love.' },
  { front: '🎵', back: 'Your playlist is always perfect. You just get it.' },
  { front: '🌸', back: 'You turn ordinary days into something magical just by being in them.' },
  { front: '🤝', back: 'You\'re my best friend wrapped in the most beautiful package.' },
  { front: '✨', back: 'Simply because you are you — and that\'s more than enough.' },
];

export default function ReasonsSection() {
  return (
    <section id="reasons" className="min-h-screen py-32 px-8 bg-gradient-to-b from-[#0d0508] to-[#12070c]">
      <div className="max-w-6xl mx-auto text-center mb-24">
        <p className="font-body text-xs uppercase tracking-[0.5em] text-rose-500/70 mb-4 font-bold">Flip Each Card</p>
        <h2 className="font-display text-5xl md:text-6xl font-bold text-white mb-6">
          Why I Love You 💌
        </h2>
        <p className="font-body text-xl text-white/50 italic">10 reasons — though there are infinite more</p>
      </div>

      <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-5 gap-6">
        {REASONS.map((r, i) => (
          <FlipCard key={i} index={i} reason={r} />
        ))}
      </div>
    </section>
  );
}

function FlipCard({ index, reason }: { index: number; reason: typeof REASONS[0]; key?: number }) {
  const [flipped, setFlipped] = useState(false);

  return (
    <div 
      className="h-64 [perspective:1000px] cursor-pointer"
      onClick={() => setFlipped(!flipped)}
    >
      <motion.div 
        className="relative w-full h-full text-center transition-all duration-700 [transform-style:preserve-3d]"
        animate={{ rotateY: flipped ? 180 : 0 }}
      >
        {/* Front */}
        <div className="absolute inset-0 [backface-visibility:hidden] bg-white/5 border border-rose-500/20 rounded-3xl p-6 flex flex-col items-center justify-center backdrop-blur-md hover:bg-white/10 transition-colors">
          <div className="text-5xl mb-4 filter drop-shadow-xl">{reason.front}</div>
          <p className="font-display text-xs italic text-rose-500/70 uppercase tracking-widest font-bold">Reason #{index + 1}</p>
          <p className="text-[9px] text-white/20 mt-4 uppercase tracking-[0.2em]">tap to reveal</p>
        </div>

        {/* Back */}
        <div className="absolute inset-0 [backface-visibility:hidden] bg-gradient-to-br from-rose-600 to-rose-400 rounded-3xl p-6 flex flex-col items-center justify-center [transform:rotateY(180deg)] shadow-xl shadow-rose-500/30">
          <p className="font-body text-lg italic text-white leading-relaxed">
            "{reason.back}"
          </p>
        </div>
      </motion.div>
    </div>
  );
}
