import type { Metadata } from 'next';
import TiendaClientPage from '@/tienda/page';
import HomeDynamicSections from '@/components/HomeDynamicSections';
import { getPublicTiendaSections } from '@/lib/cms';

// Match root layout: per-request render so admin-edited sections show up
// immediately after a save (revalidatePath('/tienda') triggers re-render).
export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Tienda Omnifix',
  description:
    'Tienda Omnifix: productos tecnológicos premium con compra directa o al carrito en un solo paso, despacho a tu zona y calculadora de m² para pisos y revestimientos. Seleccionados por nuestro equipo certificado en la Región del Maule, Chile.',
  alternates: { canonical: 'https://omnifix.cl/tienda' },
};

export default async function TiendaPage() {
  const sections = await getPublicTiendaSections();
  return (
    <>
      {sections.length > 0 && <HomeDynamicSections sections={sections} />}
      <TiendaClientPage />
    </>
  );
}
