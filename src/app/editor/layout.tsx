import type { Metadata, Viewport } from 'next';

export const dynamic = 'force-dynamic';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
  themeColor: '#2563EB',
};

export const metadata: Metadata = {
  title: 'Editor Omnifix',
  description: 'Editor visual Omnifix para crear y publicar experiencias digitales desde el navegador.',
  openGraph: {
    title: 'Editor Omnifix',
    description: 'Editor visual para tienda, landing y contenido Omnifix.',
    images: ['/omnifix-og.svg'],
    type: 'website',
  },
};

export default function EditorLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
