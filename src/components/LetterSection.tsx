import { useState, useEffect, useRef } from 'react';
import { motion, useInView } from 'motion/react';
import confetti from 'canvas-confetti';

const LETTER_TEXT = `My dearest love,

On this beautiful day that the universe decided to bring you into existence, I want you to know how profoundly grateful I am that you exist.

You have changed my life in ways I never thought possible. You make ordinary Tuesday mornings feel like something worth celebrating. You make difficult days feel survivable. You make every single good moment even better just by being in it.

I love the way your eyes crinkle when you laugh. I love how you care so deeply about everything and everyone. I love that you're still a little messy and perfectly imperfect in the most beautiful ways.

Today isn't just your birthday. It's the anniversary of the day the world became a better place. A day I will forever be thankful for.

Happy Birthday, my love. You deserve every beautiful thing this world has to offer.

And you deserve me, loving you — endlessly.

Forever yours,
With all my heart ❤️`;

export default function LetterSection() {
  const [displayed, setDisplayed] = useState('');
  const [started, setStarted] = useState(false);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.5 });
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isInView && !started) {
      setStarted(true);
      let i = 0;
      timerRef.current = setInterval(() => {
        i++;
        setDisplayed(LETTER_TEXT.slice(0, i));
        if (i >= LETTER_TEXT.length) {
          if (timerRef.current) clearInterval(timerRef.current);
          setTimeout(() => {
            confetti({ particleCount: 150, spread: 80, origin: { y: 0.5 } });
          }, 500);
        }
      }, 30);
    }
  }, [isInView, started]);

  return (
    <section id="letter" className="min-h-screen py-32 px-8 flex flex-col items-center justify-center bg-gradient-to-b from-[#0d0508] to-black">
      <div className="text-center mb-20">
        <p className="font-body text-xs uppercase tracking-[0.5em] text-rose-500/70 mb-4 font-bold">From My Heart</p>
        <h2 className="font-display text-5xl md:text-6xl font-bold text-white mb-6">
          A Letter For You 💌
        </h2>
      </div>

      <div 
        ref={ref}
        className="max-w-3xl w-full bg-white/5 backdrop-blur-2xl border-t-2 border-rose-500/30 rounded-[3rem] p-12 md:p-20 relative overflow-hidden shadow-[0_50px_100px_rgba(0,0,0,0.5)]"
      >
        {/* Decorative elements */}
        <div className="absolute top-10 left-10 text-white/10 text-4xl">❧</div>
        <div className="absolute bottom-10 right-10 text-white/10 text-4xl -rotate-180">❧</div>
        
        <pre className="font-display text-lg md:text-xl text-white/90 leading-[2] whitespace-pre-wrap italic font-light relative z-10 min-h-[400px]">
          {displayed}
          {displayed.length < LETTER_TEXT.length && (
            <motion.span 
              animate={{ opacity: [0, 1, 0] }}
              transition={{ repeat: Infinity, duration: 0.8 }}
              className="inline-block w-1 h-6 bg-rose-500 align-text-bottom ml-1"
            />
          )}
        </pre>

        {displayed.length >= LETTER_TEXT.length && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-16 text-center border-t border-white/5 pt-16"
          >
            <h3 className="font-display text-4xl md:text-5xl font-bold bg-gradient-to-r from-rose-500 to-amber-500 bg-clip-text text-transparent">
              Happy Birthday Gunduuu🌍
            </h3>
            <div className="mt-8 text-4xl flex justify-center gap-4">
               <span>❤️</span>
               <span>🌹</span>
               <span>✨</span>
            </div>
          </motion.div>
        )}
      </div>
    </section>
  );
}
