import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import confetti from 'canvas-confetti';
import { doc, setDoc, onSnapshot } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';

const COUPONS = [
  { emoji: '💆', title: '1 Free Massage', desc: 'Redeemable anytime, anywhere. No expiry.', color: '#e8305a' },
  { emoji: '🌙', title: 'Date Night', desc: 'One perfect evening, curated just for you.', color: '#c9956c' },
  { emoji: '💋', title: 'One Kiss Anytime', desc: 'No questions asked. Just walk up and claim it.', color: '#ff6b8a' },
  { emoji: '🤗', title: 'Unlimited Hugs', desc: 'This one never runs out. Ever.', color: '#e8305a' },
  { emoji: '🎬', title: 'Movie Night', desc: 'Your pick. Snacks included. Zero complaints.', color: '#c9956c' },
];

export default function CouponsSection() {
  const [redeemed, setRedeemed] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const unsub = onSnapshot(doc(db, 'app_data', 'coupons'), (snap) => {
      if (snap.exists()) {
        setRedeemed(snap.data().redeemed || {});
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'app_data/coupons');
    });
    return unsub;
  }, []);

  const redeem = async (i: number) => {
    if (redeemed[i]) return;
    const newRedeemed = { ...redeemed, [i]: true };
    setRedeemed(newRedeemed);
    try {
      await setDoc(doc(db, 'app_data', 'coupons'), { redeemed: newRedeemed }, { merge: true });
      confetti({ particleCount: 100, spread: 80, colors: ['#e8305a', '#c9956c'] });
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, 'app_data/coupons');
    }
  };

  return (
    <section id="coupons" className="min-h-screen py-32 px-8 flex flex-col items-center justify-center bg-gradient-to-t from-rose-500/5 to-transparent">
      <div className="text-center mb-20">
        <p className="font-body text-xs uppercase tracking-[0.5em] text-rose-500/70 mb-4 font-bold">Claim Yours</p>
        <h2 className="font-display text-5xl md:text-6xl font-bold text-white mb-6">
          Love Coupons 🎟️
        </h2>
        <p className="font-body text-xl text-white/50 italic">Each one is a promise. Tap to redeem.</p>
      </div>

      <div className="max-w-5xl w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {COUPONS.map((c, i) => (
          <motion.div 
            key={i}
            whileHover={!redeemed[i] ? { y: -10, rotate: -1 } : {}}
            onClick={() => redeem(i)}
            className={`relative overflow-hidden glass rounded-[2rem] border border-white/10 p-8 cursor-pointer group transition-all duration-500 ${redeemed[i] ? 'opacity-40 grayscale pointer-events-none' : ''}`}
          >
            {/* Coupon Border */}
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-rose-600 to-amber-500" />
            
            {/* Stamp */}
            {redeemed[i] && (
               <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 border-4 border-rose-600 text-rose-600 font-bold px-6 py-2 rounded-xl text-4xl -rotate-12 z-20 font-ui uppercase tracking-widest shadow-2xl bg-black/10 backdrop-blur-sm">
                 Redeemed
               </div>
            )}

            {/* Content */}
            <div className={`relative z-10 flex flex-col h-full items-center text-center`}>
              <div className="text-5xl mb-6 group-hover:scale-125 transition-transform duration-500">{c.emoji}</div>
              <h3 className="font-display text-2xl font-bold text-white mb-3">{c.title}</h3>
              <p className="font-body text-sm text-white/50 italic mb-8 flex-1">{c.desc}</p>
              
              {!redeemed[i] && (
                <div className="px-6 py-2 bg-gradient-to-r from-rose-600 to-amber-600 rounded-full text-[10px] font-bold uppercase tracking-widest shadow-lg shadow-rose-500/20">
                   Claim Now
                </div>
              )}
            </div>

            {/* Decorative holes */}
            <div className="absolute top-1/2 -left-3 w-6 h-6 rounded-full bg-[#0d0508] -translate-y-1/2" />
            <div className="absolute top-1/2 -right-3 w-6 h-6 rounded-full bg-[#0d0508] -translate-y-1/2" />
          </motion.div>
        ))}
      </div>
    </section>
  );
}
