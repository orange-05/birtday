import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Heart, Sparkles, ChevronDown, Mail } from 'lucide-react';

const RelationshipCounter = () => {
    const targetDate = new Date('2026-05-12T00:00:00');
    const [elapsed, setElapsed] = useState({ days: 0, hours: 0, mins: 0, secs: 0 });

    useEffect(() => {
        const calc = () => {
            const now = new Date();
            let diff = targetDate.getTime() - now.getTime();
            if (diff < 0) diff = 0;

            const days = Math.floor(diff / (1000 * 60 * 60 * 24));
            const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            const secs = Math.floor((diff % (1000 * 60)) / 1000);

            setElapsed({ days, hours, mins, secs });
        };
        calc();
        const t = setInterval(calc, 1000);
        return () => clearInterval(t);
    }, []);

    return (
        <div className="mt-16 flex flex-wrap gap-6 justify-center">
            {[
                { val: elapsed.days, label: 'Days' },
                { val: elapsed.hours, label: 'Hours' },
                { val: elapsed.mins, label: 'Minutes' },
                { val: elapsed.secs, label: 'Seconds' },
            ].map(({ val, label }) => (
                <div key={label} className="bg-white/5 backdrop-blur-md border border-white/10 p-5 rounded-3xl min-w-[100px] text-center shadow-xl">
                    <div className="font-display text-4xl font-bold text-rose-500 mb-1">{val}</div>
                    <div className="font-ui text-[10px] uppercase tracking-[0.2em] text-white/40">{label}</div>
                </div>
            ))}
        </div>
    );
};

export default function HeroSection() {
    return (
        <section id="hero" className="min-h-screen relative flex flex-col items-center justify-center p-8 overflow-hidden">
            {/* Background Orbs */}
            <div className="absolute top-[-10%] left-[-10%] w-[60vw] h-[60vw] bg-rose-500/10 blur-[120px] rounded-full animate-pulse" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] bg-amber-500/5 blur-[120px] rounded-full animate-pulse delay-1000" />
            
            <motion.div 
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1.2, ease: "easeOut" }}
                className="relative z-10 text-center max-w-4xl"
            >
                {/* Pulsing Heart */}
                <div className="relative inline-block mb-12">
                    <motion.div 
                        animate={{ scale: [1, 2.5], opacity: [0.8, 0] }}
                        transition={{ repeat: Infinity, duration: 2, ease: "easeOut" }}
                        className="absolute inset-0 border-2 border-rose-500/40 rounded-full"
                    />
                    <motion.div 
                        animate={{ scale: [1, 2.5], opacity: [0.6, 0] }}
                        transition={{ repeat: Infinity, duration: 2, ease: "easeOut", delay: 0.5 }}
                        className="absolute inset-0 border-2 border-rose-500/30 rounded-full"
                    />
                    <motion.div 
                        animate={{ scale: [1, 1.15, 1] }}
                        transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
                        className="text-8xl drop-shadow-[0_0_30px_rgba(244,63,94,0.5)]"
                    >
                        💖
                    </motion.div>
                </div>

                <p className="font-body text-rose-500/80 uppercase tracking-[0.6em] mb-4 text-xs font-bold">
                    A Special Message For
                </p>

                <h1 className="font-display font-bold leading-[1.1] mb-6 text-6xl md:text-8xl bg-gradient-to-br from-white via-rose-200 to-amber-200 bg-clip-text text-transparent drop-shadow-[0_0_50px_rgba(244,63,94,0.3)]">
                    Happy Birthday,<br />
                    <span className="italic">Gunduuu💋💝 🎂</span>
                </h1>

                <p className="font-body text-xl md:text-2xl text-white/70 italic max-w-xl mx-auto leading-relaxed mb-12">
                    Every day with you is a gift. Today, I celebrate the most beautiful soul I know. ❤️
                </p>

                <button 
                    onClick={() => document.getElementById('timeline')?.scrollIntoView({ behavior: 'smooth' })}
                    className="group bg-gradient-to-r from-rose-600 to-rose-400 px-12 py-5 rounded-full text-white font-bold text-lg shadow-[0_20px_50px_rgba(244,63,94,0.4)] hover:shadow-[0_20px_60px_rgba(244,63,94,0.6)] hover:scale-105 active:scale-95 transition-all flex items-center gap-3 mx-auto"
                >
                    <Mail className="w-5 h-5" />
                    Open Our Love Story
                    <Sparkles className="w-4 h-4" />
                </button>

                <RelationshipCounter />
            </motion.div>

            {/* Scroll Indicator */}
            <motion.div 
                animate={{ y: [0, 10, 0] }}
                transition={{ repeat: Infinity, duration: 2 }}
                className="absolute bottom-10 left-1/2 -translate-x-1/2 opacity-30 flex flex-col items-center gap-2"
            >
                <div className="w-6 h-10 border-2 border-white rounded-full flex justify-center p-1.5">
                    <div className="w-1.5 h-1.5 bg-white rounded-full" />
                </div>
                <ChevronDown size={20} />
            </motion.div>
        </section>
    );
}
