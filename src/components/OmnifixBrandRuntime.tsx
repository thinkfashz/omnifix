'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

const replacements: Array<[string, string]> = [
  ['Soluciones Fabrick', 'Omnifix'],
  ['SOLUCIONES FABRICK', 'OMNIFIX'],
  ['Fabrick Soluciones', 'Omnifix'],
  ['FABRICK SOLUCIONES', 'OMNIFIX'],
  ['CASAS FABRICK', 'OMNIFIX'],
  ['Fabrick', 'Omnifix'],
  ['FABRICK', 'OMNIFIX'],
  ['Únete a la plataforma Omnifix', 'Crea tu usuario para comprar y revisar pedidos'],
  ['Arquitecto García', 'Nombre de usuario'],
  ['Eduardo Micolta', 'Nombre de usuario'],
  ['Fabricio Micolta', 'Nombre de usuario'],
  ['Tienda operada por Omnifix. Compra, cotiza y coordina instalación con respaldo comercial.', 'Tienda tecnológica Omnifix. Compra productos, revisa pedidos y recibe soporte directo.'],
  ['Compra, cotiza y coordina instalación con respaldo comercial.', 'Compra productos, revisa pedidos y recibe soporte directo.'],
  ['Cotizar', 'Solicitar demo'],
  ['Presupuesto', 'Consulta rápida'],
  ['Servicios', 'Soluciones'],
];

function replaceValue(value: string) {
  return replacements.reduce((acc, [from, to]) => acc.split(from).join(to), value);
}

function walkText(root: Node) {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  const nodes: Text[] = [];
  while (walker.nextNode()) nodes.push(walker.currentNode as Text);
  nodes.forEach((node) => {
    const parent = node.parentElement;
    if (!parent) return;
    const tag = parent.tagName.toLowerCase();
    if (['script', 'style', 'textarea', 'input'].includes(tag)) return;
    const next = replaceValue(node.textContent || '');
    if (next !== node.textContent) node.textContent = next;
  });
}

export default function OmnifixBrandRuntime() {
  const pathname = usePathname();
  useEffect(() => {
    if (pathname.startsWith('/api')) return;
    const apply = () => {
      walkText(document.body);
      document.title = replaceValue(document.title || 'Omnifix');
      document.querySelectorAll<HTMLElement>('[aria-label],[title],[alt],[placeholder]').forEach((el) => {
        ['aria-label', 'title', 'alt', 'placeholder'].forEach((attr) => {
          const current = el.getAttribute(attr);
          if (!current) return;
          const next = replaceValue(current);
          if (next !== current) el.setAttribute(attr, next);
        });
      });
    };
    apply();
    const t1 = window.setTimeout(apply, 250);
    const t2 = window.setTimeout(apply, 900);
    const t3 = window.setTimeout(apply, 1800);
    return () => { window.clearTimeout(t1); window.clearTimeout(t2); window.clearTimeout(t3); };
  }, [pathname]);
  return null;
}
