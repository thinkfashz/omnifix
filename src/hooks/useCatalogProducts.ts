'use client';

import { useMemo } from 'react';
import { buildProductTagline, resolveCategoryName } from '@/lib/commerce';
import { Product as RealtimeProduct, useRealtimeProducts } from '@/hooks/useRealtimeProducts';

export interface CatalogProduct {
  id: string;
  name: string;
  price: number;
  category: string;
  category_id?: string;
  category_name?: string;
  tagline: string;
  description: string;
  features: string[];
  dimensions: string;
  delivery: string;
  img: string;
  image_url?: string;
  featured?: boolean;
  rating?: number;
  stock?: number;
  discountPercentage?: number;
  discount_percentage?: number;
}

export const FALLBACK_CATALOG_PRODUCTS: CatalogProduct[] = [
  {
    id: 'OMX-01',
    name: 'Notebook Pro Ryzen AI 16GB',
    price: 729990,
    category: 'Computadores',
    tagline: 'Potencia lista para trabajo, estudio y creación',
    description: 'Notebook de alto rendimiento con SSD NVMe, pantalla Full HD y batería para jornadas largas. Preparado para productividad, diseño y ventas online.',
    features: ['Ryzen AI ready', '16GB RAM + SSD NVMe', 'Garantía y soporte Omnifix'],
    dimensions: '15.6 pulgadas',
    delivery: 'Despacho 24-48h',
    img: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?q=80&w=1200&auto=format&fit=crop',
    featured: true,
    rating: 4.9,
    stock: 9,
    discountPercentage: 8,
  },
  {
    id: 'OMX-02',
    name: 'Kit Smart Home Control',
    price: 159990,
    category: 'Smart Home',
    tagline: 'Automatiza luces, enchufes y rutinas',
    description: 'Pack de hub inteligente, sensores y enchufes WiFi para convertir cualquier espacio en un entorno conectado y eficiente.',
    features: ['Compatible con asistentes', 'Instalación guiada', 'App móvil incluida'],
    dimensions: 'Kit 5 piezas',
    delivery: 'Entrega inmediata',
    img: 'https://images.unsplash.com/photo-1558002038-1055907df827?q=80&w=1200&auto=format&fit=crop',
    featured: true,
    rating: 4.8,
    stock: 14,
  },
  {
    id: 'OMX-03',
    name: 'Router WiFi 6 Mesh AX3000',
    price: 119990,
    category: 'Redes',
    tagline: 'Cobertura estable para casa y oficina',
    description: 'Sistema mesh WiFi 6 para eliminar zonas muertas, mejorar videollamadas y conectar múltiples dispositivos sin perder velocidad.',
    features: ['WiFi 6 AX3000', 'Cobertura ampliable', 'Configuración asistida'],
    dimensions: 'Pack 2 nodos',
    delivery: 'Despacho 24h',
    img: 'https://images.unsplash.com/photo-1606904825846-647eb07f5be2?q=80&w=1200&auto=format&fit=crop',
    rating: 4.7,
    stock: 11,
    discountPercentage: 12,
  },
  {
    id: 'OMX-04',
    name: 'Monitor 27 pulgadas 2K IPS',
    price: 219990,
    category: 'Monitores',
    tagline: 'Más espacio para crear, vender y gestionar',
    description: 'Monitor QHD con panel IPS, bordes delgados y color consistente para trabajo administrativo, diseño, tiendas online y multitarea.',
    features: ['Resolución 2K QHD', 'Panel IPS', 'Soporte VESA'],
    dimensions: '27 pulgadas',
    delivery: 'Despacho 48h',
    img: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?q=80&w=1200&auto=format&fit=crop',
    featured: true,
    rating: 4.8,
    stock: 7,
  },
  {
    id: 'OMX-05',
    name: 'Cámara Seguridad 4K Exterior',
    price: 89990,
    category: 'Seguridad',
    tagline: 'Vigilancia nítida para negocios y hogares',
    description: 'Cámara IP 4K con visión nocturna, detección de movimiento y resistencia climática para monitoreo desde el celular.',
    features: ['4K + visión nocturna', 'IP66 exterior', 'Alertas al móvil'],
    dimensions: '12 x 8 cm',
    delivery: 'Entrega inmediata',
    img: 'https://images.unsplash.com/photo-1580983218765-f663bec07b37?q=80&w=1200&auto=format&fit=crop',
    rating: 4.6,
    stock: 18,
  },
  {
    id: 'OMX-06',
    name: 'UPS Respaldo Energía 1200VA',
    price: 139990,
    category: 'Energía',
    tagline: 'Protege equipos críticos ante cortes eléctricos',
    description: 'Respaldo de energía para routers, computadores, cámaras y puntos de venta. Ideal para negocios que no pueden detenerse.',
    features: ['1200VA', 'Protección contra sobretensión', 'Indicador LCD'],
    dimensions: '1200VA',
    delivery: 'Despacho 24-48h',
    img: 'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?q=80&w=1200&auto=format&fit=crop',
    rating: 4.7,
    stock: 6,
    discountPercentage: 6,
  },
  {
    id: 'OMX-07',
    name: 'Terminal Punto de Venta Android',
    price: 249990,
    category: 'POS',
    tagline: 'Ventas rápidas para tiendas modernas',
    description: 'Equipo POS Android con lector, impresora térmica y conexión WiFi/4G para operar ventas, boletas y control básico de caja.',
    features: ['Android POS', 'Impresora térmica', 'WiFi + 4G'],
    dimensions: 'Pantalla 5.5 pulgadas',
    delivery: 'Instalación coordinada',
    img: 'https://images.unsplash.com/photo-1556742502-ec7c0e9f34b1?q=80&w=1200&auto=format&fit=crop',
    rating: 4.8,
    stock: 5,
  },
  {
    id: 'OMX-08',
    name: 'Servicio Setup Ecommerce Omnifix',
    price: 349990,
    category: 'Servicios Tech',
    tagline: 'De catálogo a venta online funcional',
    description: 'Configuración inicial de tienda, productos, métodos de contacto, flujo de pedidos y capacitación básica para operar el ecommerce.',
    features: ['Carga inicial de productos', 'Checkout y contacto', 'Capacitación operativa'],
    dimensions: 'Implementación inicial',
    delivery: 'Agenda 3-5 días',
    img: 'https://images.unsplash.com/photo-1552664730-d307ca884978?q=80&w=1200&auto=format&fit=crop',
    featured: true,
    rating: 5,
    stock: 4,
  },
];

const CATEGORY_FALLBACK_IMAGES: Record<string, string> = {
  Computadores: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?q=80&w=1200&auto=format&fit=crop',
  Redes: 'https://images.unsplash.com/photo-1606904825846-647eb07f5be2?q=80&w=1200&auto=format&fit=crop',
  Monitores: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?q=80&w=1200&auto=format&fit=crop',
  Seguridad: 'https://images.unsplash.com/photo-1580983218765-f663bec07b37?q=80&w=1200&auto=format&fit=crop',
  Energia: 'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?q=80&w=1200&auto=format&fit=crop',
  Energía: 'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?q=80&w=1200&auto=format&fit=crop',
  POS: 'https://images.unsplash.com/photo-1556742502-ec7c0e9f34b1?q=80&w=1200&auto=format&fit=crop',
  'Smart Home': 'https://images.unsplash.com/photo-1558002038-1055907df827?q=80&w=1200&auto=format&fit=crop',
  'Servicios Tech': 'https://images.unsplash.com/photo-1552664730-d307ca884978?q=80&w=1200&auto=format&fit=crop',
};

const DEFAULT_FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=1200&auto=format&fit=crop';

function mapRealtimeProductToCatalogProduct(product: RealtimeProduct): CatalogProduct {
  const category = product.category_name || resolveCategoryName(product.category_id, {});
  const fallbackImage = CATEGORY_FALLBACK_IMAGES[category] ?? DEFAULT_FALLBACK_IMAGE;
  const image = product.image_url || fallbackImage;
  return {
    id: product.id,
    name: product.name,
    price: product.price,
    category,
    category_id: product.category_id,
    category_name: product.category_name,
    tagline: buildProductTagline(product.tagline, product.delivery_days),
    description: product.description || 'Producto sincronizado automáticamente desde el catálogo Omnifix.',
    features: [
      'Calidad verificada',
      product.stock != null ? `Stock disponible: ${product.stock}` : 'Stock sujeto a confirmación',
      product.featured ? 'Producto destacado' : 'Disponible para cotizar',
    ],
    dimensions: typeof product.specifications?.['medidas'] === 'string' ? String(product.specifications['medidas']) : 'Especificación en ficha técnica',
    delivery: product.delivery_days || 'Entrega a coordinar',
    img: image,
    image_url: image,
    featured: product.featured,
    rating: product.rating,
    stock: product.stock,
    discountPercentage: product.discount_percentage,
    discount_percentage: product.discount_percentage,
  };
}

export function useCatalogProducts() {
  const realtime = useRealtimeProducts();
  const products = useMemo(() => {
    if (!realtime.fetchComplete) return FALLBACK_CATALOG_PRODUCTS;
    const mapped = realtime.products.map((product) => mapRealtimeProductToCatalogProduct(product));
    return mapped.length ? mapped : FALLBACK_CATALOG_PRODUCTS;
  }, [realtime.products, realtime.fetchComplete]);
  return {
    products,
    loading: realtime.loading && !realtime.fetchComplete,
    fetchComplete: realtime.fetchComplete,
    connected: realtime.connected,
    lastEvent: realtime.lastEvent,
    updateCount: realtime.updateCount,
    hasLiveData: realtime.products.length > 0,
    reload: realtime.reload,
  };
}
