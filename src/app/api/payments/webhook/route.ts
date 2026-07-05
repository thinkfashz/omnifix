import { NextResponse } from 'next/server';
import { createHmac } from 'node:crypto';
import { INSFORGE_BASE_URL, insforgeAdmin } from '@/lib/insforge';
import { getMercadoPagoPayment, mapMercadoPagoStatus, verifyMercadoPagoSignature, type MercadoPagoPaymentResponse } from '@/lib/mercadopago';
import { confirmPaidOrderAndSendReceiptAsync } from '@/lib/orders/paidConfirmation';
import { syncAfterSale } from '@/lib/orders/afterSaleSync';
import { dispatchHookAsync } from '@/lib/extensionsBus';

const MAX_WEBHOOK_BODY_BYTES = 64 * 1024;

type GenericPaymentWebhookBody = {
  eventType: string;
  orderId: string;
  paymentId?: string;
  status: 'succeeded' | 'failed' | 'refunded' | 'pending';
  amount?: number;
  currency?: string;
};

type MercadoPagoWebhookBody = {
  action?: string;
  type?: string;
  topic?: string;
  id?: string | number;
  data?: {
    id?: string | number;
    external_reference?: string;
    status?: string;
    payments?: Array<{ id?: string | number; status?: string }>;
  };
};

type OrderItem = {
  productoId?: string | number;
  productId?: string | number;
  id?: string | number;
  cantidad?: number;
  quantity?: number;
};

type MercadoPagoPaymentWithPayer = MercadoPagoPaymentResponse & {
  payer?: { email?: string; first_name?: string; last_name?: string; phone?: { number?: string } };
  metadata?: Record<string, unknown>;
  date_created?: string;
};

async function readLimitedBody(request: Request): Promise<string | null> {
  const declaredLength = Number(request.headers.get('content-length') ?? 0);
  if (Number.isFinite(declaredLength) && declaredLength > MAX_WEBHOOK_BODY_BYTES) return null;
  const rawBody = await request.text();
  if (Buffer.byteLength(rawBody, 'utf8') > MAX_WEBHOOK_BODY_BYTES) return null;
  return rawBody;
}

function verifyLegacySignature(rawBody: string, signature: string | null) {
  const secret = process.env.PAYMENTS_WEBHOOK_SECRET;
  if (!secret || !signature) return true;
  const expected = createHmac('sha256', secret).update(rawBody).digest('hex');
  return expected === signature;
}

async function persistWebhookLog(idempotencyKey: string, payload: unknown, orderId: string, paymentId: string | null, status: string, eventType: string) {
  const { data: existingLog } = await insforgeAdmin.database.from('payment_webhooks').select('id').eq('idempotency_key', idempotencyKey).limit(1);
  if ((existingLog ?? []).length > 0) return { duplicated: true };
  await insforgeAdmin.database.from('payment_webhooks').insert([{ idempotency_key: idempotencyKey, event_type: eventType, order_id: orderId, payment_id: paymentId, payment_status: status, payload, created_at: new Date().toISOString() }]);
  return { duplicated: false };
}

function mappedOrderStatus(status: string) {
  return status === 'succeeded' ? 'pagada' : status === 'failed' ? 'fallida' : status === 'refunded' ? 'reembolsada' : mapMercadoPagoStatus(status);
}

function customerFromPayment(payment?: MercadoPagoPaymentWithPayer) {
  const first = payment?.payer?.first_name || '';
  const last = payment?.payer?.last_name || '';
  const name = [first, last].filter(Boolean).join(' ').trim() || 'Cliente Mercado Pago';
  return {
    name,
    email: payment?.payer?.email || (typeof payment?.metadata?.email === 'string' ? payment.metadata.email : null),
    phone: payment?.payer?.phone?.number || (typeof payment?.metadata?.phone === 'string' ? payment.metadata.phone : null),
  };
}

async function recoverMissingOrder(orderId: string, paymentId: string | null, status: string, payment?: MercadoPagoPaymentWithPayer) {
  const now = new Date().toISOString();
  const customer = customerFromPayment(payment);
  const orderStatus = mappedOrderStatus(status);
  const row = {
    id: orderId,
    customer_name: customer.name,
    customer_email: customer.email,
    customer_phone: customer.phone,
    region: typeof payment?.metadata?.region === 'string' ? payment.metadata.region : null,
    shipping_address: typeof payment?.metadata?.shipping_address === 'string' ? payment.metadata.shipping_address : null,
    items: [],
    subtotal: Number(payment?.transaction_amount || 0),
    tax: 0,
    shipping_fee: 0,
    total: Number(payment?.transaction_amount || 0),
    currency: payment?.currency_id || 'CLP',
    status: orderStatus,
    payment_id: paymentId,
    payment_status: status,
    created_at: payment?.date_created || now,
    updated_at: now,
  };
  const { error } = await insforgeAdmin.database.from('orders').insert([row]);
  if (!error) {
    await syncAfterSale({ id: orderId, customerName: row.customer_name, customerEmail: row.customer_email, customerPhone: row.customer_phone, total: row.total, currency: row.currency, status: row.status, source: 'mercadopago_recovery', createdAt: row.created_at });
  }
  return { ok: !error, warning: error ? `No se pudo recuperar order faltante: ${error.message}` : 'Orden recuperada desde Mercado Pago porque no existía en Omnifix.' };
}

async function updateOrderStatus(orderId: string, paymentId: string | null, status: string, payment?: MercadoPagoPaymentWithPayer) {
  const orderStatus = mappedOrderStatus(status);
  const { data: existing } = await insforgeAdmin.database.from('orders').select('id, customer_name, customer_email, customer_phone, total, currency, created_at').eq('id', orderId).limit(1);
  const row = Array.isArray(existing) ? existing[0] as Record<string, unknown> | undefined : undefined;

  if (!row) {
    const recovered = await recoverMissingOrder(orderId, paymentId, status, payment);
    return { ok: recovered.ok, orderUpdated: recovered.ok, orderStatus, warning: recovered.warning };
  }

  const { error: updateError } = await insforgeAdmin.database.from('orders').update({ status: orderStatus, payment_id: paymentId, payment_status: status, updated_at: new Date().toISOString() }).eq('id', orderId);

  if (!updateError) {
    await syncAfterSale({ id: orderId, customerName: row.customer_name as string, customerEmail: row.customer_email as string, customerPhone: row.customer_phone as string, total: Number(row.total || 0), currency: String(row.currency || 'CLP'), status: orderStatus, source: 'payment_webhook', createdAt: row.created_at as string });
  }

  return { ok: !updateError, orderUpdated: !updateError, orderStatus, warning: updateError ? `No se actualizó orders: ${updateError.message}` : null };
}

function getLineItemProductId(item: OrderItem) { return String(item.productoId ?? item.productId ?? item.id ?? '').trim(); }
function getLineItemQuantity(item: OrderItem) { const quantity = Math.floor(Number(item.cantidad ?? item.quantity ?? 0)); return Number.isFinite(quantity) && quantity > 0 ? quantity : 0; }
function sqlLiteral(value: string) { return value.replace(/'/g, "''").slice(0, 140); }

async function decrementStockForPaidOrderViaSql(orderId: string) {
  const apiKey = process.env.INSFORGE_API_KEY;
  if (!apiKey) return { ok: false, warning: 'INSFORGE_API_KEY no configurada para stock SQL atómico.' };
  try {
    const url = `${INSFORGE_BASE_URL.replace(/\/+$/, '')}/api/database/advance/rawsql/unrestricted`;
    const query = `SELECT public.decrement_stock_for_paid_order('${sqlLiteral(orderId)}') AS result;`;
    const res = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey }, body: JSON.stringify({ query }), cache: 'no-store' });
    if (!res.ok) return { ok: false, warning: `Stock SQL atómico no disponible: HTTP ${res.status}.` };
    return { ok: true, strategy: 'sql_function' };
  } catch (error) { return { ok: false, warning: error instanceof Error ? error.message : 'Stock SQL atómico falló.' }; }
}

async function decrementStockForPaidOrderBestEffort(orderId: string) {
  try {
    const { data } = await insforgeAdmin.database.from('orders').select('items').eq('id', orderId).limit(1);
    const order = Array.isArray(data) ? data[0] as { items?: unknown } | undefined : undefined;
    const items = Array.isArray(order?.items) ? order.items as OrderItem[] : [];
    const quantities = new Map<string, number>();
    for (const item of items) {
      const productId = getLineItemProductId(item);
      const quantity = getLineItemQuantity(item);
      if (!productId || quantity <= 0) continue;
      quantities.set(productId, (quantities.get(productId) ?? 0) + quantity);
    }
    for (const [productId, quantity] of quantities) {
      const { data: productRows } = await insforgeAdmin.database.from('products').select('id, stock').eq('id', productId).limit(1);
      const product = Array.isArray(productRows) ? productRows[0] as { stock?: number | null } | undefined : undefined;
      if (!product || typeof product.stock !== 'number') continue;
      const nextStock = Math.max(0, product.stock - quantity);
      await insforgeAdmin.database.from('products').update({ stock: nextStock, updated_at: new Date().toISOString() }).eq('id', productId);
    }
    return { ok: true, strategy: 'best_effort' };
  } catch (error) { return { ok: false, warning: error instanceof Error ? error.message : 'No se pudo descontar stock.' }; }
}

async function decrementStockForPaidOrder(orderId: string) {
  const atomic = await decrementStockForPaidOrderViaSql(orderId);
  if (atomic.ok) return atomic;
  const fallback = await decrementStockForPaidOrderBestEffort(orderId);
  if (!fallback.ok) return fallback;
  return { ...fallback, warning: atomic.warning };
}

function safeJsonParse(rawBody: string): MercadoPagoWebhookBody | null { try { return rawBody ? JSON.parse(rawBody) as MercadoPagoWebhookBody : null; } catch { return null; } }
function isMercadoPagoSimulation(body: MercadoPagoWebhookBody | null) { const action = body?.action || ''; const eventType = body?.type || body?.topic || ''; return action.startsWith('order.') || eventType === 'order' || eventType === 'merchant_order'; }

async function handleMercadoPagoWebhook(request: Request) {
  const url = new URL(request.url);
  const rawBody = await readLimitedBody(request);
  if (rawBody === null) return NextResponse.json({ error: 'Webhook demasiado grande.' }, { status: 413 });
  const body = safeJsonParse(rawBody);
  const topic = url.searchParams.get('topic') || url.searchParams.get('type') || body?.type || body?.topic || '';
  const dataId = url.searchParams.get('data.id') || url.searchParams.get('id') || (body?.data?.id != null ? String(body.data.id) : '') || (body?.id != null ? String(body.id) : '');
  const signatureHeader = request.headers.get('x-signature');
  const requestIdHeader = request.headers.get('x-request-id');

  if (isMercadoPagoSimulation(body) && topic !== 'payment') return NextResponse.json({ ok: true, provider: 'mercado_pago', simulated: true, ignored: true, action: body?.action || topic, message: 'URL recibida correctamente. Evento de simulación/order ignorado; el pago real se procesa con evento payment.' }, { status: 200 });

  if (!(await verifyMercadoPagoSignature({ signatureHeader, requestIdHeader, dataId }))) return NextResponse.json({ error: 'Firma de Mercado Pago inválida.' }, { status: 401 });
  if (topic && topic !== 'payment') return NextResponse.json({ ok: true, ignored: true, topic }, { status: 200 });
  if (!dataId) return NextResponse.json({ ok: true, ignored: true, message: 'Webhook recibido sin data.id de pago.' }, { status: 200 });

  const payment = await getMercadoPagoPayment(dataId) as MercadoPagoPaymentWithPayer;
  const orderId = payment.external_reference;
  if (!orderId) return NextResponse.json({ error: 'El pago no contiene external_reference.' }, { status: 400 });

  const paymentId = String(payment.id);
  const paymentStatus = payment.status || 'pending';
  const idempotencyKey = `mp:${paymentId}:${paymentStatus}`;
  const logResult = await persistWebhookLog(idempotencyKey, payment, orderId, paymentId, paymentStatus, 'mercadopago.payment');
  if (logResult.duplicated) return NextResponse.json({ ok: true, duplicated: true }, { status: 200 });

  const updated = await updateOrderStatus(orderId, paymentId, paymentStatus, payment);
  const stock = updated.orderStatus === 'pagada' ? await decrementStockForPaidOrder(orderId) : { ok: true as const };
  if (updated.orderStatus === 'pagada') {
    confirmPaidOrderAndSendReceiptAsync(orderId);
    dispatchHookAsync('order.paid', { orderId, paymentId, paymentStatus, provider: 'mercadopago' });
  }

  return NextResponse.json({ ok: updated.ok, provider: 'mercado_pago', paymentId, orderId, paymentStatus, orderStatus: updated.orderStatus, stock, notification: updated.orderStatus === 'pagada' ? 'Correo con boleta PDF en proceso de envío.' : 'Pendiente de pago aprobado.', warning: updated.warning || ('warning' in stock ? stock.warning : null) });
}

async function handleLegacyWebhook(request: Request) {
  const rawBody = await readLimitedBody(request);
  if (rawBody === null) return NextResponse.json({ error: 'Webhook demasiado grande.' }, { status: 413 });
  const signature = request.headers.get('x-insforge-signature');
  const idempotencyKeyHeader = request.headers.get('x-idempotency-key') ?? null;
  if (!verifyLegacySignature(rawBody, signature)) return NextResponse.json({ error: 'Firma inválida.' }, { status: 401 });
  const body = JSON.parse(rawBody) as GenericPaymentWebhookBody;
  if (!body.orderId || !body.eventType || !body.status) return NextResponse.json({ error: 'Payload incompleto.' }, { status: 400 });
  const effectiveIdempotency = idempotencyKeyHeader ?? `${body.orderId}:${body.paymentId ?? 'nopay'}:${body.status}`;
  const logResult = await persistWebhookLog(effectiveIdempotency, body, body.orderId, body.paymentId ?? null, body.status, body.eventType);
  if (logResult.duplicated) return NextResponse.json({ ok: true, duplicated: true }, { status: 200 });
  const updated = await updateOrderStatus(body.orderId, body.paymentId ?? null, body.status);
  const stock = updated.orderStatus === 'pagada' ? await decrementStockForPaidOrder(body.orderId) : { ok: true as const };
  if (updated.orderStatus === 'pagada') {
    confirmPaidOrderAndSendReceiptAsync(body.orderId);
    dispatchHookAsync('order.paid', { orderId: body.orderId, paymentId: body.paymentId ?? null, paymentStatus: body.status, provider: 'legacy' });
  }
  return NextResponse.json({ ...updated, stock, notification: updated.orderStatus === 'pagada' ? 'Correo con boleta PDF en proceso de envío.' : undefined }, { status: 200 });
}

export async function POST(request: Request) {
  try {
    const url = new URL(request.url);
    const source = url.searchParams.get('source');
    if (source === 'mercadopago' || request.headers.has('x-signature') || url.pathname.includes('/api/webhooks/mercadopago')) return await handleMercadoPagoWebhook(request);
    return await handleLegacyWebhook(request);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error procesando webhook de pago.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
