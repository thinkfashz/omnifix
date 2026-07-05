import 'server-only';
import { insforgeAdmin } from '@/lib/insforge';

export type AfterSaleOrder = {
  id: string;
  customerName?: string | null;
  customerEmail?: string | null;
  customerPhone?: string | null;
  total?: number | null;
  currency?: string | null;
  status?: string | null;
  source?: string | null;
  createdAt?: string | null;
};

function clean(value: unknown, max = 180) {
  return typeof value === 'string' ? value.replace(/[\u0000-\u001f\u007f]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, max) : '';
}

async function insertBestEffort(table: string, row: Record<string, unknown>) {
  try {
    await insforgeAdmin.database.from(table).insert([row]);
    return true;
  } catch {
    return false;
  }
}

export async function syncAfterSale(order: AfterSaleOrder) {
  const now = new Date().toISOString();
  const email = clean(order.customerEmail).toLowerCase();
  const name = clean(order.customerName || 'Cliente Omnifix');
  const phone = clean(order.customerPhone || '', 80) || null;
  const total = Number(order.total || 0);
  const status = clean(order.status || 'pendiente', 40);
  const source = clean(order.source || 'checkout', 40);

  const customerRow = {
    name,
    email: email || null,
    phone,
    source,
    last_order_id: order.id,
    last_order_total: total,
    updated_at: now,
    created_at: order.createdAt || now,
  };

  const leadRow = {
    name,
    email: email || null,
    phone,
    source,
    status: status === 'pagada' || status === 'confirmado' || status === 'confirmada' ? 'cliente' : 'nuevo',
    order_id: order.id,
    value: total,
    created_at: order.createdAt || now,
    updated_at: now,
  };

  const dealRow = {
    title: `Venta ${order.id}`,
    customer_name: name,
    customer_email: email || null,
    customer_phone: phone,
    order_id: order.id,
    amount: total,
    currency: order.currency || 'CLP',
    stage: status === 'pagada' || status === 'confirmado' || status === 'confirmada' ? 'pagado' : 'nuevo_pedido',
    source,
    created_at: order.createdAt || now,
    updated_at: now,
  };

  await Promise.allSettled([
    insertBestEffort('customers', customerRow),
    insertBestEffort('clients', customerRow),
    insertBestEffort('leads', leadRow),
    insertBestEffort('crm_leads', leadRow),
    insertBestEffort('sales_pipeline', dealRow),
    insertBestEffort('pipeline_deals', dealRow),
  ]);
}
