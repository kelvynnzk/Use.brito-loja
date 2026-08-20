/**
 * Direção visual: Ateliê de Concreto — checkout reduz a superfície visual, preservando os
 * sinais de marca e guiando a cliente em um formulário claro de uma única coluna.
 */
import { FormEvent, useState } from "react";
import { ArrowLeft, CheckCircle2, LockKeyhole } from "lucide-react";
import { Link, useLocation } from "wouter";
import { useCart } from "@/contexts/CartContext";
import { formatBRL } from "@/data/products";

export default function Checkout() {
  const [, setLocation] = useLocation();
  const { items, subtotal, clearCart } = useCart();
  const [completed, setCompleted] = useState(false);
  const shipping = subtotal >= 299 || subtotal === 0 ? 0 : 22;

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setCompleted(true);
    clearCart();
  };

  if (completed) {
    return <div className="atelier-page bg-[#f4efe7] px-5 py-24 md:px-10 md:py-32"><div className="empty-atelier-state mx-auto max-w-xl border border-[#241c18]/15 bg-[#ede4da] px-6 py-14 text-center md:px-12"><img src="/manus-storage/use-brito-mark_b2bb36b9.png" alt="" className="mx-auto h-10 w-10" /><CheckCircle2 size={45} className="mx-auto mt-6 text-[#b84c33]" /><p className="eyebrow mt-6">Pedido recebido</p><h1 className="display-font mt-4 text-5xl tracking-[-0.04em]">A sua escolha entrou no nosso caderno.</h1><p className="mt-6 text-sm leading-6 text-[#241c18]/70">Este é um checkout demonstrativo. Em uma operação real, a confirmação de pagamento e entrega seria processada pelo meio de pagamento conectado à loja.</p><button onClick={() => setLocation("/")} className="btn-dark mt-9">Voltar para a Use.Brito</button></div></div>;
  }
  if (!items.length) {
    return <div className="bg-[#f4efe7] px-5 py-24 text-center"><p className="display-font text-4xl">Sua sacola está vazia.</p><Link href="/catalogo" className="btn-dark mt-7">Voltar para a curadoria</Link></div>;
  }

  return (
    <div className="atelier-page bg-[#f4efe7] px-5 pb-24 pt-10 md:px-10 md:pt-16">
      <div className="mx-auto max-w-[1120px]"><Link href="/carrinho" className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.15em] text-[#241c18]/65 hover:text-[#b84c33]"><ArrowLeft size={15} /> Voltar à sacola</Link><div className="mt-9 grid gap-10 lg:grid-cols-[1fr_.75fr] lg:gap-16"><form onSubmit={submit}><p className="eyebrow">Finalizar escolha</p><h1 className="display-font mt-3 text-5xl tracking-[-0.04em]">Para onde enviamos?</h1><p className="mt-4 max-w-lg text-sm leading-6 text-[#241c18]/65">Preencha os dados para registrar seu pedido demonstrativo.</p><div className="mt-9 grid gap-5 sm:grid-cols-2"><FormField label="Nome completo" name="name" required className="sm:col-span-2" /><FormField label="E-mail" name="email" type="email" required /><FormField label="WhatsApp" name="phone" required /><FormField label="CEP" name="zip" required /><FormField label="Cidade" name="city" required /><FormField label="Endereço" name="address" required className="sm:col-span-2" /><FormField label="Número" name="number" required /><FormField label="Complemento" name="complement" /></div><div className="mt-9 border-t border-[#241c18]/15 pt-7"><p className="text-xs font-bold uppercase tracking-[0.14em]">Forma de pagamento</p><label className="mt-4 flex items-center gap-3 border border-[#241c18]/20 bg-[#ede4da] p-4 text-sm"><input type="radio" checked readOnly /> Pagamento a configurar em ambiente de produção</label><p className="mt-3 flex items-center gap-2 text-xs leading-5 text-[#241c18]/60"><LockKeyhole size={14} className="text-[#b84c33]" /> Nenhum pagamento é processado neste protótipo.</p></div><button className="btn-primary mt-9 flex w-full justify-center sm:w-auto">Registrar pedido demonstrativo</button></form><aside className="self-start border border-[#241c18]/15 bg-[#ede4da] p-6 md:p-8"><p className="eyebrow">Resumo</p><div className="mt-6 divide-y divide-[#241c18]/15">{items.map((item) => <div key={`${item.product.id}-${item.size}`} className="flex gap-3 py-4 first:pt-0"><img src={item.product.image} alt="" className="h-16 w-13 object-cover" /><div className="flex-1 text-sm"><p className="font-semibold">{item.product.name}</p><p className="mt-1 text-xs text-[#241c18]/60">{item.quantity} × {formatBRL(item.product.price)}</p></div><p className="text-sm">{formatBRL(item.quantity * item.product.price)}</p></div>)}</div><div className="mt-6 space-y-3 border-t border-[#241c18]/15 pt-5 text-sm"><div className="flex justify-between"><span className="text-[#241c18]/65">Subtotal</span><span>{formatBRL(subtotal)}</span></div><div className="flex justify-between"><span className="text-[#241c18]/65">Entrega</span><span>{shipping === 0 ? "A definir" : formatBRL(shipping)}</span></div><div className="flex justify-between border-t border-[#241c18]/15 pt-4 text-lg font-semibold"><span>Total</span><span>{formatBRL(subtotal + shipping)}</span></div></div></aside></div></div>
    </div>
  );
}

function FormField({ label, name, className = "", type = "text", required = false }: { label: string; name: string; className?: string; type?: string; required?: boolean }) {
  return <label className={`block ${className}`}><span className="mb-2 block text-[10px] font-bold uppercase tracking-[0.14em] text-[#241c18]/60">{label}</span><input name={name} type={type} required={required} className="h-12 w-full border border-[#241c18]/20 bg-transparent px-3 text-sm outline-none transition-colors focus:border-[#b84c33]" /></label>;
}
