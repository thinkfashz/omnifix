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
import CookieConsentBanner from '@/components/CookieConsentBanner';
import OmnifixMobileBottomNav from '@/components/OmnifixMobileBottomNav';

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

const siteUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://omnifix-pearl.vercel.app';
const ogImage = '/omnifix-og.svg';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: 'Omnifix | Tienda de productos tecnológicos en Chile', template: '%s | Omnifix' },
  description: 'Omnifix es una tienda tecnológica de productos, smart home, accesorios, carga, audio, redes y soluciones ecommerce con checkout seguro.',
  keywords: ['tienda tecnológica Chile', 'productos tecnológicos Chile', 'smart home Chile', 'accesorios tecnológicos', 'audio bluetooth', 'power bank Chile', 'checkout Shopify Chile', 'omnifix tienda', 'ecommerce tecnología Chile'],
  authors: [{ name: 'Omnifix' }],
  creator: 'Omnifix',
  publisher: 'Omnifix',
  openGraph: {
    title: 'Omnifix | Tienda tecnológica',
    description: 'Productos tecnológicos, smart home, audio, carga, accesorios y checkout seguro.',
    url: siteUrl,
    siteName: 'Omnifix',
    locale: 'es_CL',
    type: 'website',
    images: [{ url: ogImage, width: 1200, height: 630, alt: 'Omnifix tienda tecnológica' }],
  },
  twitter: { card: 'summary_large_image', title: 'Omnifix | Tienda tecnológica', description: 'Productos tecnológicos, smart home y accesorios con checkout seguro.', images: [ogImage] },
  robots: { index: true, follow: true },
  alternates: { canonical: siteUrl },
  manifest: '/manifest.webmanifest',
  appleWebApp: { capable: true, statusBarStyle: 'black-translucent', title: 'Omnifix' },
  icons: { icon: [{ url: '/favicon.svg', type: 'image/svg+xml' }, { url: '/icon-192.png', type: 'image/png', sizes: '192x192' }, { url: '/icon-512.png', type: 'image/png', sizes: '512x512' }], apple: [{ url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }], shortcut: ['/favicon.svg'] },
};

export const viewport: Viewport = { width: 'device-width', initialScale: 1, maximumScale: 1, viewportFit: 'cover', themeColor: '#2563EB' };

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const [navMenu, globalStyles] = await Promise.all([getSiteSection('nav-menu'), getSiteSection('global-styles')]);
  return (
    <html lang="es" className="scroll-smooth" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta property="og:image:type" content="image/svg+xml" />
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
                  <OmnifixMobileBottomNav />
                  <CookieConsentBanner />
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
