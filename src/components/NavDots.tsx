import { SECTIONS } from './Constants';

export default function NavDots({ active }: { active: number }) {
  return (
    <div className="fixed right-8 top-1/2 -translate-y-1/2 z-50 flex flex-col gap-4 hidden md:flex">
      {SECTIONS.map((s, i) => (
        <button
          key={s}
          onClick={() => document.getElementById(s)?.scrollIntoView({ behavior: 'smooth' })}
          className={`w-2.5 h-2.5 rounded-full transition-all duration-300 border ${
            active === i 
              ? 'bg-rose-500 border-rose-500 scale-150 shadow-[0_0_10px_rgba(244,63,94,0.8)]' 
              : 'bg-white/20 border-white/10 hover:bg-white/40'
          }`}
          title={s}
        />
      ))}
    </div>
  );
}
