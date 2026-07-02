export type OmnifixDemoProduct = {
  id: string;
  name: string;
  price: number;
  category: string;
  description: string;
  image_url: string;
  img?: string;
  tagline?: string;
  features?: string[];
  delivery?: string;
  stock?: number;
  rating?: number;
  discount_percentage?: number;
  discountPercentage?: number;
  featured?: boolean;
  shopifyVariantId?: string;
  shopifyProductId?: string;
  shopifyHandle?: string;
};

export const OMNIFIX_EXTRA_PRODUCTS: OmnifixDemoProduct[] = [
  {
    id: 'OMX-DEMO-09',
    name: 'Audífonos Bluetooth Noise Control',
    price: 39990,
    category: 'Audio',
    tagline: 'Audio limpio para trabajo y movilidad',
    description: 'Audífonos inalámbricos con cancelación pasiva, micrófono claro y estuche compacto para uso diario.',
    features: ['Bluetooth 5.3', 'Micrófono manos libres', 'Estuche de carga'],
    delivery: 'Entrega inmediata',
    image_url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=1200&auto=format&fit=crop',
    stock: 16,
    rating: 4.8,
    discount_percentage: 10,
    featured: true,
  },
  {
    id: 'OMX-DEMO-10',
    name: 'Cargador GaN USB-C 65W',
    price: 29990,
    category: 'Carga',
    tagline: 'Carga rápida para notebook y celular',
    description: 'Cargador compacto de alta potencia para notebooks USB-C, tablets y teléfonos compatibles.',
    features: ['65W GaN', 'USB-C Power Delivery', 'Protección térmica'],
    delivery: 'Despacho 24h',
    image_url: 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?q=80&w=1200&auto=format&fit=crop',
    stock: 22,
    rating: 4.7,
  },
  {
    id: 'OMX-DEMO-11',
    name: 'Hub USB-C 7 en 1 HDMI',
    price: 34990,
    category: 'Accesorios',
    tagline: 'Conecta pantalla, USB y memoria en segundos',
    description: 'Adaptador USB-C con HDMI, USB, lector de tarjetas y carga pass-through para mejorar tu setup.',
    features: ['HDMI 4K', 'USB 3.0', 'Carga USB-C'],
    delivery: 'Entrega inmediata',
    image_url: 'https://images.unsplash.com/photo-1619953942547-233eab5a70d6?q=80&w=1200&auto=format&fit=crop',
    stock: 13,
    rating: 4.9,
    discount_percentage: 8,
  },
  {
    id: 'OMX-DEMO-12',
    name: 'Ampolleta Smart WiFi RGB',
    price: 12990,
    category: 'Smart Home',
    tagline: 'Control de luz desde el celular',
    description: 'Ampolleta inteligente RGB con escenas, horarios y control desde app móvil.',
    features: ['WiFi 2.4GHz', 'RGB + blanco cálido', 'Automatizaciones'],
    delivery: 'Entrega inmediata',
    image_url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?q=80&w=1200&auto=format&fit=crop',
    stock: 30,
    rating: 4.6,
  },
  {
    id: 'OMX-DEMO-13',
    name: 'Power Bank MagSafe 10.000 mAh',
    price: 27990,
    category: 'Carga',
    tagline: 'Energía portátil magnética',
    description: 'Batería externa compacta con carga inalámbrica magnética y puerto USB-C.',
    features: ['10.000 mAh', 'Carga inalámbrica', 'USB-C'],
    delivery: 'Despacho 24h',
    image_url: 'https://images.unsplash.com/photo-1609592806596-b43bada2f8e9?q=80&w=1200&auto=format&fit=crop',
    stock: 18,
    rating: 4.7,
    featured: true,
  },
  {
    id: 'OMX-DEMO-14',
    name: 'Mouse Inalámbrico Ergonómico',
    price: 18990,
    category: 'Setup',
    tagline: 'Control cómodo para largas jornadas',
    description: 'Mouse inalámbrico silencioso con diseño ergonómico, ideal para oficina, estudio y tienda online.',
    features: ['2.4GHz', 'Clic silencioso', 'DPI ajustable'],
    delivery: 'Entrega inmediata',
    image_url: 'https://images.unsplash.com/photo-1527814050087-3793815479db?q=80&w=1200&auto=format&fit=crop',
    stock: 25,
    rating: 4.8,
  },
  {
    id: 'OMX-DEMO-15',
    name: 'Parlante Portátil Waterproof',
    price: 42990,
    category: 'Audio',
    tagline: 'Sonido potente para interior y exterior',
    description: 'Parlante bluetooth resistente al agua, con batería de larga duración y graves reforzados.',
    features: ['Resistente al agua', 'Batería extendida', 'Bluetooth'],
    delivery: 'Despacho 48h',
    image_url: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?q=80&w=1200&auto=format&fit=crop',
    stock: 10,
    rating: 4.9,
    discount_percentage: 12,
  },
  {
    id: 'OMX-DEMO-16',
    name: 'Soporte Notebook Aluminio',
    price: 22990,
    category: 'Accesorios',
    tagline: 'Mejor postura y ventilación',
    description: 'Base de aluminio para notebook con inclinación cómoda, ventilación y diseño minimalista.',
    features: ['Aluminio', 'Plegable', 'Antideslizante'],
    delivery: 'Entrega inmediata',
    image_url: 'https://images.unsplash.com/photo-1527443154391-507e9dc6c5cc?q=80&w=1200&auto=format&fit=crop',
    stock: 19,
    rating: 4.6,
  },
];
