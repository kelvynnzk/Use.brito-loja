/** Dados mínimos de cada peça necessários para compor uma mensagem de atendimento legível. */
export type WhatsAppCatalogItem = {
  name: string;
  size: string;
  quantity: number;
  unitPriceCents: number;
};

/** Formata centavos em reais no padrão que a cliente verá na conversa. */
const formatCurrency = (valueInCents: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(valueInCents / 100);

/** Monta o texto padrão enviado ao ateliê com referência, itens, tamanhos e subtotal. */
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

/** Normaliza o telefone e codifica a mensagem para formar uma URL segura do WhatsApp. */
export function buildWhatsAppUrl(phone: string, message: string) {
  const normalizedPhone = phone.replace(/\D/g, "");
  if (!normalizedPhone) throw new Error("Número de WhatsApp inválido.");
  return `https://wa.me/${normalizedPhone}?text=${encodeURIComponent(message)}`;
}
