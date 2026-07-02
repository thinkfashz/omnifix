'use client';

import { useEffect, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { usePathname } from 'next/navigation';
import Omnifix3DTextLogo from './Omnifix3DTextLogo';

const SESSION_KEY = 'omnifix.blue.splash.v1';

export default function OmnifixSplashScreen() {
  const pathname = usePathname();
  const reduced = useReducedMotion();
  const isAdmin = pathname?.startsWith('/admin') ?? false;
  const [show, setShow] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (isAdmin) return;
    try { if (sessionStorage.getItem(SESSION_KEY) !== '1') setShow(true); } catch {}
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!show) return;
    try { sessionStorage.setItem(SESSION_KEY, '1'); } catch {}
    const started = Date.now();
    const duration = reduced ? 550 : 2100;
    let raf = 0;
    const tick = () => {
      const t = Math.min((Date.now() - started) / duration, 1);
      setProgress((1 - Math.pow(1 - t, 3)) * 100);
      if (t < 1) raf = requestAnimationFrame(tick);
      else setTimeout(() => setShow(false), 160);
    };
    raf = requestAnimationFrame(tick);
    const safety = setTimeout(() => setShow(false), reduced ? 900 : 2900);
    return () => { cancelAnimationFrame(raf); clearTimeout(safety); };
  }, [show, reduced]);

  if (isAdmin) return null;

  return (
    <AnimatePresence>
      {show && (
        <motion.div className="fixed inset-0 z-[9999] grid place-items-center overflow-hidden bg-[#020617] text-white" initial={{ opacity: 1 }} exit={{ opacity: 0, scale: reduced ? 1 : 1.035, filter: reduced ? 'none' : 'blur(12px)' }} transition={{ duration: reduced ? 0.2 : 0.45 }} aria-hidden>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(37,99,235,.28),transparent_32rem),radial-gradient(circle_at_80%_70%,rgba(34,211,238,.14),transparent_26rem),linear-gradient(180deg,#020617,#050816)]" />
          <div className="absolute left-1/2 top-1/2 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-500/10 blur-3xl" />
          <div className="relative flex flex-col items-center px-6 text-center">
            <p className="mb-5 text-[10px] font-black uppercase tracking-[0.42em] text-cyan-200/70">Ecosistema digital</p>
            <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}>
              <Omnifix3DTextLogo text="Omnifix" showTagline />
            </motion.div>
            <motion.p className="mt-5 max-w-xl text-[10px] font-semibold uppercase leading-6 tracking-[0.30em] text-sky-200/75 sm:text-xs" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35, duration: 0.55 }}>
              Tecnología, automatización y comercio inteligente
            </motion.p>
            <div className="mt-10 h-px w-36 overflow-hidden rounded-full bg-slate-800">
              <div className="h-full rounded-full bg-gradient-to-r from-blue-600 via-cyan-300 to-blue-400 shadow-[0_0_16px_rgba(59,130,246,.85)]" style={{ width: `${progress}%`, transition: 'width 80ms linear' }} />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
