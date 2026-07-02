import Link from 'next/link';

export const metadata = { title: 'Cookies | Omnifix' };

export default function CookiesPage() {
  return (
    <main className="min-h-screen bg-[#07111f] px-5 py-10 text-white">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_20%_0%,rgba(255,255,255,.16),transparent_24rem),radial-gradient(circle_at_80%_22%,rgba(96,165,250,.22),transparent_28rem),linear-gradient(180deg,#07111f,#061020)]" />
      <section className="relative mx-auto max-w-4xl rounded-[2rem] border border-white/10 bg-white/[0.075] p-6 shadow-[0_24px_80px_rgba(0,0,0,.28)] backdrop-blur-2xl md:p-10">
        <Link href="/" className="text-sm font-bold text-blue-100/75 hover:text-white">← Volver a Omnifix</Link>
        <p className="mt-8 text-[10px] font-black uppercase tracking-[0.32em] text-blue-100/75">Preferencias</p>
        <h1 className="mt-3 text-4xl font-black tracking-[-0.05em] md:text-6xl">Política de cookies</h1>
        <div className="mt-8 space-y-5 text-sm leading-7 text-white/64 md:text-base">
          <p>Usamos cookies y almacenamiento local para mantener sesión, carrito, preferencias, seguridad, medición de rendimiento y mejora de experiencia.</p>
          <p>Al continuar navegando puedes aceptar o configurar el uso de cookies desde el aviso correspondiente.</p>
          <p>Algunas cookies son necesarias para que la tienda funcione correctamente.</p>
        </div>
      </section>
    </main>
  );
}
