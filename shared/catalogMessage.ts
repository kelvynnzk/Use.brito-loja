export type WhatsAppCatalogItem = {
  name: string;
  size: string;
  quantity: number;
  unitPriceCents: number;
};

const formatCurrency = (valueInCents: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(valueInCents / 100);

export function buildCatalogWhatsAppMessage({ reference, items, subtotalCents }: { reference: string; items: WhatsAppCatalogItem[]; subtotalCents: number }) {
  const lines = items.map((item) => `• ${item.quantity}× ${item.name} — Tam. ${item.size} — ${formatCurrency(item.unitPriceCents * item.quantity)}`);
  return [
    "Olá, Use.Brito! Gostaria de solicitar atendimento sobre as peças abaixo:",
    "",
    ...lines,
    "",
    `Subtotal da seleção: ${formatCurrency(subtotalCents)}`,
    `Referência: ${reference}`,
    "",
    "Fico no aguardo para confirmar disponibilidade e entrega.",
  ].join("\n");
}

export function buildWhatsAppUrl(phone: string, message: string) {
  const normalizedPhone = phone.replace(/\D/g, "");
  if (!normalizedPhone) throw new Error("Número de WhatsApp inválido.");
  return `https://wa.me/${normalizedPhone}?text=${encodeURIComponent(message)}`;
}
