# Omnifix - despliegue en Cloudflare

Este proyecto quedó preparado para Cloudflare usando Next.js + OpenNext para Cloudflare.

Repositorio:
https://github.com/thinkfashz/omnifix

## Opción recomendada: Cloudflare Pages conectado a GitHub

1. Entra a Cloudflare:
   https://dash.cloudflare.com
2. Ve a Workers & Pages.
3. Selecciona Create application.
4. Selecciona Pages.
5. Selecciona Connect to Git.
6. Autoriza GitHub si Cloudflare lo pide.
7. Elige el repo:
   `thinkfashz/omnifix`
8. Configura:

```text
Project name: omnifix
Production branch: main
Framework preset: None
Build command: npm run cf:build
Build output directory: .open-next/assets
Root directory: /
Node version: 22
```

9. En Environment variables agrega:

```text
NODE_VERSION=22.16.0
OPENNEXT_CLOUDFLARE=1
NEXT_PUBLIC_APP_URL=https://TU-DOMINIO.pages.dev
NEXT_PUBLIC_WHATSAPP_NUMBER=56930121625
```

10. En Settings > Functions o Compatibility agrega:

```text
Compatibility flag: nodejs_compat
Compatibility date: 2025-04-01 o más reciente
```

El archivo `wrangler.toml` ya incluye `nodejs_compat` y la fecha de compatibilidad.

## Variables obligatorias para producción

Configúralas como variables de Cloudflare, no las subas a GitHub.

```text
NEXT_PUBLIC_APP_URL=https://TU-DOMINIO.pages.dev
NEXT_PUBLIC_WHATSAPP_NUMBER=56930121625
NEXT_PUBLIC_INSFORGE_URL=TU_URL_PUBLICA_DE_INSFORGE
NEXT_PUBLIC_INSFORGE_ANON_KEY=TU_CLAVE_ANONIMA_PUBLICA_DE_INSFORGE
INSFORGE_API_KEY=TU_CLAVE_PRIVADA_SERVER_DE_INSFORGE
ADMIN_SESSION_SECRET=GENERA_UN_SECRETO_LARGO
ADMIN_PASSWORD_PEPPER=GENERA_OTRO_SECRETO_LARGO
ADMIN_INITIAL_PASSWORD=DEFINE_UN_PASSWORD_INICIAL_FUERTE
ADMIN_INIT_SECRET=GENERA_UN_SECRETO_DE_INICIALIZACION
ADMIN_EMAIL=tu_correo_admin@dominio.com
```

## Variables opcionales

Pagos Mercado Pago:

```text
MERCADO_PAGO_ACCESS_TOKEN=TU_ACCESS_TOKEN_PRIVADO
MERCADOPAGO_ACCESS_TOKEN=TU_ACCESS_TOKEN_PRIVADO
MP_ACCESS_TOKEN=TU_ACCESS_TOKEN_PRIVADO
MERCADO_PAGO_WEBHOOK_SECRET=TU_WEBHOOK_SECRET
MERCADOPAGO_WEBHOOK_SECRET=TU_WEBHOOK_SECRET
NEXT_PUBLIC_MP_PUBLIC_KEY=TU_PUBLIC_KEY_DE_MERCADO_PAGO
NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY=TU_PUBLIC_KEY_DE_MERCADO_PAGO
```

Mercado Libre:

```text
MERCADOLIBRE_ACCESS_TOKEN=
ML_CLIENT_ID=
ML_CLIENT_SECRET=
ML_AUTH_DOMAIN=auth.mercadolibre.cl
ML_REDIRECT_URI=https://TU-DOMINIO.pages.dev/api/admin/ml/oauth/callback
```

Importadores y marketing:

```text
GOOGLE_CSE_CX=
GOOGLE_CSE_KEY=
JINA_API_KEY=
META_ACCESS_TOKEN=
META_API_VERSION=v25.0
META_AD_ACCOUNT_ID=
META_ACCOUNT_ID=
```

Sentry:

```text
NEXT_PUBLIC_SENTRY_DSN=
NEXT_PUBLIC_SENTRY_ENV=production
SENTRY_ORG=
SENTRY_PROJECT=
SENTRY_AUTH_TOKEN=
```

## Cómo generar secretos

En una terminal:

```bash
openssl rand -base64 48
```

Genera valores distintos para:

```text
ADMIN_SESSION_SECRET
ADMIN_PASSWORD_PEPPER
ADMIN_INIT_SECRET
```

Después de inicializar el primer admin, elimina `ADMIN_INITIAL_PASSWORD` y `ADMIN_INIT_SECRET` de Cloudflare.

## Opción avanzada: deploy directo con Wrangler

Desde una máquina con navegador para login de Cloudflare:

```bash
npm install
npx wrangler login
npm run cf:build
npm run cf:deploy
```

## Estado del admin Omnifix

Sí, el admin fue adaptado a Omnifix en la ruta:

```text
/admin/omnifix
```

Incluye módulos de productos, pedidos, clientes, despacho, KPIs, seguridad y flujo ecommerce, con estética oscura, blanco/negro y azul eléctrico.

El dashboard admin grande original sigue existiendo en `/admin`; no lo eliminé para conservar los módulos existentes del ecommerce.
