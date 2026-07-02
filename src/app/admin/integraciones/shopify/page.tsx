'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, CheckCircle2, ExternalLink, Loader2, RefreshCw, Save, ShoppingBag, Trash2, XCircle } from 'lucide-react';

type Check = { name: string; ok: boolean; detail?: string };
type StatusResponse = {
  ok?: boolean;
  source?: 'env' | 'db' | 'mixed' | 'none';
  configured?: boolean;
  encrypted?: boolean;
  credentials?: Record<string, string>;
  env?: Record<string, string>;
  db?: Record<string, string>;
  error?: string;
};

type TestResponse = {
  ok?: boolean;
  error?: string;
  checks?: Check[];
  credentials?: Record<string, string>;
};

const EMPTY_FORM = {
  shop_domain: '',
  storefront_access_token: '',
  admin_api_token: '',
  api_version: '2026-07',
  webhook_secret: '',
};

function Field({
  label,
  value,
  onChange,
  placeholder,
  type = 'text',
  hint,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: 'text' | 'password';
  hint?: string;
}) {
  return (
    <label className="grid gap-2">
      <span className="text-[11px] font-black uppercase tracking-[0.18em] text-zinc-500">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="h-12 rounded-2xl border border-white/10 bg-black/40 px-4 text-sm text-white outline-none transition focus:border-emerald-400/60 focus:ring-2 focus:ring-emerald-400/10"
      />
      {hint ? <span className="text-xs leading-5 text-zinc-500">{hint}</span> : null}
    </label>
  );
}

function CheckRow({ check }: { check: Check }) {
  return (
    <div className="flex items-start gap-3 rounded-2xl border border-white/10 bg-black/35 p-3">
      {check.ok ? <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-300" /> : <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-300" />}
      <div>
        <p className="text-sm font-bold text-white">{check.name}</p>
        {check.detail ? <p className="mt-1 text-xs leading-5 text-zinc-400">{check.detail}</p> : null}
      </div>
    </div>
  );
}

export default function ShopifyIntegrationPage() {
  const [form, setForm] = useState(EMPTY_FORM);
  const [status, setStatus] = useState<StatusResponse | null>(null);
  const [test, setTest] = useState<TestResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [message, setMessage] = useState<{ type: 'ok' | 'error'; text: string } | null>(null);

  const configured = Boolean(status?.configured);
  const sourceLabel = useMemo(() => {
    if (!status?.source || status.source === 'none') return 'No conectado';
    if (status.source === 'env') return 'Variables de entorno';
    if (status.source === 'db') return 'Base de datos';
    return 'Env + Base de datos';
  }, [status?.source]);

  function update(key: keyof typeof EMPTY_FORM, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function loadStatus() {
    setLoading(true);
    setMessage(null);
    try {
      const res = await fetch('/api/admin/integrations/shopify', { cache: 'no-store' });
      const json = (await res.json().catch(() => ({}))) as StatusResponse;
      if (!res.ok) throw new Error(json.error || 'No se pudo leer Shopify.');
      setStatus(json);
      setForm((prev) => ({
        ...prev,
        shop_domain: json.credentials?.shop_domain || prev.shop_domain,
        api_version: json.credentials?.api_version || prev.api_version || '2026-07',
      }));
    } catch (err) {
      setMessage({ type: 'error', text: err instanceof Error ? err.message : 'Error cargando Shopify.' });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { void loadStatus(); }, []);

  async function save() {
    setSaving(true);
    setMessage(null);
    setTest(null);
    try {
      const res = await fetch('/api/admin/integrations/shopify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ credentials: form }),
      });
      const json = (await res.json().catch(() => ({}))) as TestResponse;
      if (!res.ok) throw new Error(json.error || 'No se pudo guardar Shopify.');
      setTest(json);
      setMessage({ type: 'ok', text: 'Shopify guardado en la base de datos y validado.' });
      setForm((prev) => ({ ...prev, storefront_access_token: '', admin_api_token: '', webhook_secret: '' }));
      await loadStatus();
    } catch (err) {
      setMessage({ type: 'error', text: err instanceof Error ? err.message : 'Error guardando Shopify.' });
    } finally {
      setSaving(false);
    }
  }

  async function testConnection() {
    setTesting(true);
    setMessage(null);
    try {
      const res = await fetch('/api/admin/integrations/shopify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'test', credentials: form }),
      });
      const json = (await res.json().catch(() => ({}))) as TestResponse;
      if (!res.ok) throw new Error(json.error || 'No se pudo probar Shopify.');
      setTest(json);
      setMessage({ type: json.ok ? 'ok' : 'error', text: json.ok ? 'Shopify conectado correctamente.' : 'Shopify respondió con advertencias o errores.' });
    } catch (err) {
      setMessage({ type: 'error', text: err instanceof Error ? err.message : 'Error probando Shopify.' });
    } finally {
      setTesting(false);
    }
  }

  async function disconnect() {
    if (!window.confirm('¿Desconectar Shopify y borrar credenciales guardadas en la base de datos?')) return;
    setDeleting(true);
    setMessage(null);
    try {
      const res = await fetch('/api/admin/integrations/shopify', { method: 'DELETE' });
      const json = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) throw new Error(json.error || 'No se pudo desconectar Shopify.');
      setForm(EMPTY_FORM);
      setTest(null);
      setMessage({ type: 'ok', text: 'Shopify desconectado de la base de datos.' });
      await loadStatus();
    } catch (err) {
      setMessage({ type: 'error', text: err instanceof Error ? err.message : 'Error desconectando Shopify.' });
    } finally {
      setDeleting(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#050816] px-4 py-6 text-white md:px-8">
      <div className="mx-auto max-w-6xl space-y-6">
        <Link href="/admin/integraciones" className="inline-flex items-center gap-2 text-sm font-bold text-zinc-400 transition hover:text-emerald-300">
          <ArrowLeft className="h-4 w-4" /> Volver a integraciones
        </Link>

        <section className="overflow-hidden rounded-[2rem] border border-emerald-400/20 bg-slate-950 shadow-[0_24px_90px_rgba(0,0,0,.45)]">
          <div className="relative p-6 md:p-8">
            <div className="absolute -right-20 -top-24 h-72 w-72 rounded-full bg-emerald-400/15 blur-3xl" />
            <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-start gap-4">
                <div className="grid h-16 w-16 shrink-0 place-items-center rounded-3xl bg-[#95BF47] text-black shadow-[0_0_40px_rgba(149,191,71,.34)]">
                  <ShoppingBag className="h-8 w-8" />
                </div>
                <div>
                  <p className="text-[11px] font-black uppercase tracking-[0.24em] text-emerald-300">Integración oficial</p>
                  <h1 className="mt-2 text-3xl font-black tracking-tight md:text-5xl">Shopify para Omnifix</h1>
                  <p className="mt-3 max-w-2xl text-sm leading-7 text-zinc-400">
                    Guarda credenciales cifradas en la base de datos, conecta catálogo, checkout, stock, órdenes y webhooks de Shopify desde el admin.
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap gap-3">
                <a href="https://admin.shopify.com" target="_blank" rel="noopener noreferrer" className="inline-flex h-11 items-center gap-2 rounded-full border border-emerald-400/30 px-4 text-xs font-black uppercase tracking-[0.18em] text-emerald-200 transition hover:bg-emerald-400/10">
                  Abrir Shopify <ExternalLink className="h-4 w-4" />
                </a>
                <button onClick={() => void loadStatus()} disabled={loading} className="inline-flex h-11 items-center gap-2 rounded-full border border-white/10 px-4 text-xs font-black uppercase tracking-[0.18em] text-zinc-200 transition hover:bg-white/5 disabled:opacity-50">
                  <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} /> Estado
                </button>
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
          <div className="space-y-4 rounded-[2rem] border border-white/10 bg-slate-950/80 p-6">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-[11px] font-black uppercase tracking-[0.2em] text-zinc-500">Estado</p>
                <h2 className="mt-1 text-xl font-black">{configured ? 'Conectado' : 'Pendiente'}</h2>
              </div>
              <span className={`rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-[0.16em] ${configured ? 'bg-emerald-500/15 text-emerald-300' : 'bg-red-500/10 text-red-300'}`}>
                {sourceLabel}
              </span>
            </div>
            <div className="grid gap-3 text-sm text-zinc-400">
              <p><b className="text-zinc-200">Tienda:</b> {status?.credentials?.shop_domain || 'No configurada'}</p>
              <p><b className="text-zinc-200">Storefront:</b> {status?.credentials?.storefront_access_token || 'No configurado'}</p>
              <p><b className="text-zinc-200">Admin API:</b> {status?.credentials?.admin_api_token || 'No configurado'}</p>
              <p><b className="text-zinc-200">Webhook:</b> {status?.credentials?.webhook_secret || 'No configurado'}</p>
              <p><b className="text-zinc-200">Cifrado:</b> {status?.encrypted ? 'Activo' : 'No configurado. Agrega INTEGRATIONS_ENC_KEY.'}</p>
            </div>
            <div className="rounded-2xl border border-amber-400/20 bg-amber-400/5 p-4 text-xs leading-6 text-amber-100/85">
              Los tokens no se muestran completos. Si dejas un campo secreto vacío al guardar, se conserva el valor anterior de la base de datos.
            </div>
          </div>

          <div className="rounded-[2rem] border border-white/10 bg-slate-950/80 p-6">
            <div className="grid gap-5 md:grid-cols-2">
              <Field label="Dominio Shopify" value={form.shop_domain} onChange={(v) => update('shop_domain', v)} placeholder="tu-tienda.myshopify.com" hint="Usa preferiblemente el dominio myshopify.com, sin https." />
              <Field label="API version" value={form.api_version} onChange={(v) => update('api_version', v)} placeholder="2026-07" />
              <Field label="Storefront access token" type="password" value={form.storefront_access_token} onChange={(v) => update('storefront_access_token', v)} placeholder="shpca_..." hint="Necesario para catálogo y checkout público." />
              <Field label="Admin API token" type="password" value={form.admin_api_token} onChange={(v) => update('admin_api_token', v)} placeholder="shpat_..." hint="Necesario para sincronización, órdenes y webhooks." />
              <div className="md:col-span-2"><Field label="Webhook secret" type="password" value={form.webhook_secret} onChange={(v) => update('webhook_secret', v)} placeholder="Secret de webhooks Shopify" hint="Recomendado para validar orders/create, orders/paid, products/update e inventory_levels/update." /></div>
            </div>
            {message ? <div className={`mt-5 rounded-2xl border p-4 text-sm ${message.type === 'ok' ? 'border-emerald-400/20 bg-emerald-400/10 text-emerald-200' : 'border-red-400/20 bg-red-400/10 text-red-200'}`}>{message.text}</div> : null}
            <div className="mt-6 flex flex-wrap gap-3">
              <button onClick={() => void save()} disabled={saving || testing || deleting} className="inline-flex h-12 items-center gap-2 rounded-full bg-emerald-400 px-5 text-xs font-black uppercase tracking-[0.18em] text-black transition hover:bg-white disabled:opacity-50">
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Guardar
              </button>
              <button onClick={() => void testConnection()} disabled={saving || testing || deleting} className="inline-flex h-12 items-center gap-2 rounded-full border border-white/10 px-5 text-xs font-black uppercase tracking-[0.18em] text-white transition hover:bg-white/5 disabled:opacity-50">
                {testing ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />} Probar conexión
              </button>
              <button onClick={() => void disconnect()} disabled={saving || testing || deleting} className="inline-flex h-12 items-center gap-2 rounded-full border border-red-400/25 px-5 text-xs font-black uppercase tracking-[0.18em] text-red-300 transition hover:bg-red-400/10 disabled:opacity-50">
                {deleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />} Desconectar
              </button>
            </div>
          </div>
        </section>

        {test?.checks?.length ? <section className="rounded-[2rem] border border-white/10 bg-slate-950/80 p-6"><h2 className="text-xl font-black">Resultado de conexión</h2><div className="mt-4 grid gap-3 md:grid-cols-2">{test.checks.map((check) => <CheckRow key={check.name} check={check} />)}</div></section> : null}
      </div>
    </main>
  );
}
