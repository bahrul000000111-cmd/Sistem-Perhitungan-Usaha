/**
 * Header.jsx
 * Application top header with branding and live clock.
 * Optimized for compact height.
 */
import { useState, useEffect } from 'react';
import { BarChart3 } from 'lucide-react';

function LiveClock() {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const date = now.toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  const time = now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

  return (
    <div className="text-right hidden sm:block leading-none">
      <p className="text-[10px] text-slate-400">{date}</p>
      <p className="text-sm font-mono font-bold text-primary-300 tabular-nums mt-0.5">{time}</p>
    </div>
  );
}

export default function Header() {
  return (
    <header className="sticky top-0 z-50 glass border-b border-white/8">
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 h-12 flex items-center justify-between gap-4">
        {/* Brand */}
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-primary-500/20 text-primary-400 glow-blue">
            <BarChart3 size={16} />
          </div>
          <div>
            <h1 className="text-xs font-bold text-white leading-tight">
              Dashboard Monitoring
            </h1>
            <p className="text-[10px] text-slate-400 leading-tight">Produktivitas &amp; Capaian Progres</p>
          </div>
        </div>

        {/* Live clock */}
        <LiveClock />
      </div>
    </header>
  );
}
