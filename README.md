# Omnifix

Tienda electrónica moderna basada en el código de `thinkfashz/solucionfabrick2.5`, rebrandeada como Omnifix.

Lema: Todo tiene una solución.

## Qué incluye

- Landing principal Omnifix con estética blanco/negro y azul eléctrico oscuro.
- Tienda tecnológica con productos en CLP.
- Catálogo con categorías como Computadores, Redes, Smart Home, Seguridad, POS y Servicios Tech.
- Carrito, checkout y módulos existentes de ecommerce.
- Panel admin con ruta destacada `/admin/omnifix` para módulos operativos.
- PWA, manifest y favicon actualizados.
- Guía de variables para Vercel en `OMNIFIX_ENV_VERCEL.md`.

## Desarrollo local

```bash
npm install --legacy-peer-deps
npm run dev
```

Luego abre:

```text
http://localhost:3000
```

## Despliegue en Cloudflare

Revisa `CLOUDFLARE_DEPLOY.md` para conectar el repo a Cloudflare Pages con OpenNext.

## Variables de entorno

Revisa `CLOUDFLARE_DEPLOY.md` y `.env.example` antes de producción. No subas secretos reales a GitHub.

## Rutas principales

- `/` landing principal
- `/tienda` tienda electrónica
- `/admin` dashboard admin existente
- `/admin/omnifix` módulos recomendados para ecommerce Omnifix
- `/contacto` contacto y cotización

## Notas

No se incluyen `.env` reales ni secretos en el repositorio.
