import Omnifix3DTextLogo from '@/components/Omnifix3DTextLogo';

export default function AdminLoading() {
  return (
    <main className="fixed inset-0 z-[9999] grid place-items-center bg-[#020617] text-white">
      <div className="w-[min(92vw,420px)] rounded-[2rem] border border-blue-300/15 bg-black/70 p-8 text-center shadow-[0_30px_90px_rgba(37,99,235,.18)] backdrop-blur-xl">
        <div className="flex justify-center"><Omnifix3DTextLogo text="Omnifix" showTagline /></div>
        <p className="mt-5 text-[10px] font-black uppercase tracking-[0.32em] text-blue-300">Panel Omnifix</p>
        <h1 className="mt-3 text-2xl font-black tracking-tight">Cargando admin</h1>
        <div className="mx-auto mt-5 h-1.5 w-44 overflow-hidden rounded-full bg-white/10">
          <div className="h-full w-full origin-left animate-pulse rounded-full bg-blue-400" />
        </div>
      </div>
    </main>
  );
}
