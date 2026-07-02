export const dynamic = 'force-dynamic';
import type { Metadata, Viewport } from 'next';
import './globals.css';
import './tenant-public-theme.css';
import './responsive-safety.css';
import './remove-obsolete-sections.css';
import InstallAppPrompt from '@/components/InstallAppPrompt';
import SmoothScrollProvider from '@/components/SmoothScrollProvider';
import OmnifixSplashScreen from '@/components/OmnifixSplashScreen';
import OmnifixBrandRuntime from '@/components/OmnifixBrandRuntime';

import { ThemeProvider } from '@/context/ThemeContext';
import { AuthProvider } from '@/context/AuthContext';
import { CartProvider } from '@/context/CartContext';
import { QuoteCartProvider } from '@/context/QuoteCartContext';
import { SiteConfigProvider } from '@/context/SiteConfigContext';
import AIAgentChat from '@/components/AIAgentChat';
import ServiceWorkerRegister from '@/components/ServiceWorkerRegister';
import Analytics from '@/components/Analytics';
import CmsRealtimeListener from '@/components/CmsRealtimeListener';
import CustomInjectionRoot from '@/components/CustomInjectionRoot';
import GlobalStylesRoot from '@/components/GlobalStylesRoot';
import CmsPreviewOverlay from '@/components/admin/cms/CmsPreviewOverlay';
import { TenantBrandingBar } from '@/components/tenant/TenantBrandingBar';
import { TenantThemeRuntime } from '@/components/tenant/TenantThemeRuntime';
import { TenantCopyRuntime } from '@/components/tenant/TenantCopyRuntime';
import { getSiteSection } from '@/lib/siteStructure';

export const metadata: Metadata = {
  metadataBase: new URL('https://omnifix.cl'),
  title: {
    default: 'Omnifix | Tienda tecnológica y soluciones ecommerce en Chile',
    template: '%s | Omnifix',
  },
  description:
    'Empresa de tecnología, smart home, redes, computadores, POS y soluciones ecommerce. Más de 5 años vendiendo, implementando e innovando para clientes y negocios.',
  keywords: [
    'tienda tecnología Chile',
    'ecommerce tecnología Chile',
    'smart home Chile',
    'computadores Chile',
    'soporte tecnológico Chile',
    'omnifix ecommerce',
    'implementación ecommerce Chile',
    'redes wifi Chile',
    'seguridad electrónica Chile',
    'terminal punto de venta Chile',
  ],
  authors: [{ name: 'Omnifix' }],
  openGraph: {
    title: 'Omnifix | Tecnología, automatización y comercio inteligente',
    description:
      'Tienda tecnológica, ecommerce, smart home, redes, POS y soporte para clientes y negocios en Chile.',
    url: 'https://omnifix.cl',
    siteName: 'Omnifix',
    locale: 'es_CL',
    type: 'website',
    images: [{ url: '/omnifix-logo.svg', width: 1200, height: 820, alt: 'Omnifix' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Omnifix',
    description: 'Tecnología, ecommerce y soporte en Chile',
    images: ['/omnifix-logo.svg'],
  },
  robots: { index: true, follow: true },
  alternates: { canonical: 'https://omnifix.cl' },
  manifest: '/manifest.webmanifest',
  appleWebApp: { capable: true, statusBarStyle: 'black-translucent', title: 'Omnifix' },
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/icon-192.png', type: 'image/png', sizes: '192x192' },
      { url: '/icon-512.png', type: 'image/png', sizes: '512x512' },
    ],
    apple: [{ url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }],
    shortcut: ['/favicon.svg'],
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  viewportFit: 'cover',
  themeColor: '#2563EB',
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const [navMenu, globalStyles] = await Promise.all([
    getSiteSection('nav-menu'),
    getSiteSection('global-styles'),
  ]);
  return (
    <html lang="es" className="scroll-smooth" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <meta name="mobile-web-app-capable" content="yes" />
        <GlobalStylesRoot />
        <CustomInjectionRoot slot="head" />
      </head>
      <body className="bg-black text-white antialiased app-shell">
        <OmnifixSplashScreen />
        <OmnifixBrandRuntime />
        <SiteConfigProvider initial={{ 'nav-menu': navMenu, 'global-styles': globalStyles }}>
          <ThemeProvider>
            <AuthProvider>
              <CartProvider>
                <QuoteCartProvider>
                  <SmoothScrollProvider />
                  <TenantThemeRuntime />
                  <TenantCopyRuntime />
                  {children}
                  <TenantBrandingBar />
                  <ServiceWorkerRegister />
                  <InstallAppPrompt />
                  <AIAgentChat hideOn={['/admin', '/auth', '/checkout', '/presupuestos', '/p/']} />
                  <Analytics />
                  <CmsRealtimeListener />
                  <CmsPreviewOverlay />
                </QuoteCartProvider>
              </CartProvider>
            </AuthProvider>
          </ThemeProvider>
        </SiteConfigProvider>
        <CustomInjectionRoot slot="bodyEnd" />
      </body>
    </html>
  );
}
