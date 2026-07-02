import type { Metadata } from 'next';
import OmnifixStoreClient from '@/components/store/OmnifixStoreClient';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Tienda Omnifix',
  description: 'Tienda Omnifix: productos tecnológicos, smart home, accesorios, audio, energía, productividad y checkout seguro con Shopify.',
  alternates: { canonical: 'https://omnifix.cl/tienda' },
};

export default function TiendaPage() {
  return <OmnifixStoreClient />;
}
