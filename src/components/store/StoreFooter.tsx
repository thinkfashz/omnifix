import type { ReactNode } from 'react';
import Link from 'next/link';

function FacebookIcon() {
  return <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden="true"><path d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047V9.41c0-3.025 1.792-4.698 4.533-4.698 1.312 0 2.686.236 2.686.236v2.971H15.83c-1.491 0-1.956.93-1.956 1.884v2.27h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073Z" /></svg>;
}
function InstagramIcon() {
  return <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden="true"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069ZM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12s.014 3.668.072 4.948c.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24s3.668-.014 4.948-.072c4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948s-.014-3.667-.072-4.947c-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0Zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324ZM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8Zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881Z" /></svg>;
}
function TikTokIcon() {
  return <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden="true"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1.04-.1Z" /></svg>;
}

function SocialLink({ href, label, children }: { href: string; label: string; children: ReactNode }) {
  return <a href={href} target="_blank" rel="noopener noreferrer" aria-label={label} className="grid h-9 w-9 place-items-center rounded-full border border-white/12 bg-white/10 text-white shadow-[inset_0_1px_0_rgba(255,255,255,.16)] transition hover:-translate-y-0.5 hover:border-blue-200/50 hover:bg-white/18">{children}</a>;
}

export default function StoreFooter() {
  return (
    <footer className="relative z-10 mx-4 mb-28 mt-10 overflow-hidden rounded-[1.6rem] border border-white/10 bg-[#050d19] px-5 py-6 text-white shadow-[0_18px_54px_rgba(2,6,23,.28)] md:mx-8 md:mb-10 md:px-7 md:py-7">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_85%_0%,rgba(37,99,235,.22),transparent_18rem)]" />
      <div className="relative mx-auto max-w-7xl">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
          <div className="max-w-md">
            <p className="text-base font-black uppercase tracking-[0.28em] text-white">OMNIFIX</p>
            <p className="mt-2 text-xs leading-5 text-slate-300">Tienda tecnológica premium con carrito rápido, detalles claros y checkout seguro.</p>
          </div>
          <div className="flex gap-2.5">
            <SocialLink href="https://facebook.com" label="Facebook"><FacebookIcon /></SocialLink>
            <SocialLink href="https://instagram.com" label="Instagram"><InstagramIcon /></SocialLink>
            <SocialLink href="https://tiktok.com" label="TikTok"><TikTokIcon /></SocialLink>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-5 border-t border-white/10 pt-5 sm:grid-cols-3">
          <FooterColumn title="Legal" items={[["Términos", "/legal/terminos"], ["Privacidad", "/legal/privacidad"], ["Cookies", "/legal/cookies"], ["Devoluciones", "/legal/devoluciones"]]} />
          <FooterColumn title="Tienda" items={[["Catálogo", "/"], ["Mi cuenta", "/auth"], ["Contacto", "/contacto"], ["Checkout", "/checkout"]]} />
          <div className="col-span-2 sm:col-span-1">
            <h3 className="text-[10px] font-black uppercase tracking-[0.24em] text-blue-200">Soporte</h3>
            <p className="mt-3 text-xs leading-5 text-slate-300">Compra segura, soporte y disponibilidad sujeta a stock.</p>
          </div>
        </div>

        <div className="mt-5 border-t border-white/10 pt-4 text-[11px] leading-5 text-slate-400">© {new Date().getFullYear()} Omnifix. Todos los derechos reservados.</div>
      </div>
    </footer>
  );
}

function FooterColumn({ title, items }: { title: string; items: [string, string][] }) {
  return <div><h3 className="text-[10px] font-black uppercase tracking-[0.24em] text-blue-200">{title}</h3><div className="mt-3 flex flex-col gap-2">{items.map(([label, href]) => <Link key={`${label}-${href}`} href={href} className="text-xs font-semibold text-slate-200 transition hover:text-white">{label}</Link>)}</div></div>;
}
