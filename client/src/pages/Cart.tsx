/**
 * Direção visual: Ateliê de Concreto — carrinho é uma mesa de escolha clara, com hierarquia
 * calma para ajustar itens e seguir para a próxima etapa sem distrações.
 */
import { ArrowLeft, ArrowRight, Minus, Plus, Trash2 } from "lucide-react";
import { Link } from "wouter";
import { useCart } from "@/contexts/CartContext";
import { formatBRL } from "@/data/products";

export default function Cart() {
  const { items, subtotal, removeItem, updateQuantity } = useCart();
  const shipping = subtotal >= 299 || subtotal === 0 ? 0 : 22;
  const total = subtotal + shipping;

  if (!items.length) {
    return <div className="atelier-page bg-[#f4efe7] px-5 py-24 md:px-10 md:py-32"><span className="atelier-coordinate right-5 top-8 md:right-10">04 / SACOLA</span><div className="empty-atelier-state mx-auto max-w-3xl overflow-hidden border border-[#241c18]/15 bg-[#ede4da] md:grid md:grid-cols-[.6fr_1fr]"><div className="relative min-h-48 bg-[#241c18] p-7 text-[#f4efe7]"><img src="/manus-storage/use-brito-mark_b2bb36b9.png" alt="" className="h-12 w-12 brightness-0 invert" /><span className="atelier-coordinate bottom-6 left-7 text-white/55">SACOLA / VAZIA</span></div><div className="p-7 md:p-10"><p className="eyebrow">Sua sacola</p><h1 className="display-font mt-4 text-5xl tracking-[-0.04em] md:text-6xl">Ela está pronta para ganhar forma.</h1><p className="mt-5 max-w-sm text-sm leading-6 text-[#241c18]/65">Encontre uma peça que acompanhe o seu ritmo e volte aqui para concluir a escolha.</p><Link href="/catalogo" className="btn-dark mt-9">Explorar a curadoria <ArrowRight size={16} /></Link></div></div></div>;
  }

  return (
    <div className="atelier-page bg-[#f4efe7] px-5 pb-24 pt-10 md:px-10 md:pt-16">
      <div className="mx-auto max-w-[1240px]">
        <span className="atelier-coordinate right-5 top-8 md:right-10">04 / SACOLA</span>
        <Link href="/catalogo" className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.15em] text-[#241c18]/65 hover:text-[#b84c33]"><ArrowLeft size={15} /> Continuar explorando</Link>
        <div className="mt-9 grid gap-10 lg:grid-cols-[1.18fr_.82fr] lg:gap-16">
          <section>
            <div className="mb-7 flex items-end justify-between border-b border-[#241c18]/15 pb-6"><div><p className="eyebrow">Sua sacola</p><h1 className="display-font mt-3 text-5xl tracking-[-0.04em]">Escolhas em curso.</h1></div><span className="text-xs font-bold uppercase tracking-[0.13em] text-[#241c18]/55">{items.length} {items.length === 1 ? "item" : "itens"}</span></div>
            <div className="divide-y divide-[#241c18]/15">
              {items.map((item) => <article key={`${item.product.id}-${item.size}`} className="grid grid-cols-[90px_1fr] gap-4 py-5 sm:grid-cols-[125px_1fr_auto] sm:gap-6"><img src={item.product.image} alt={item.product.name} className="aspect-[4/5] w-full object-cover" /><div className="min-w-0 pt-1"><div className="flex justify-between gap-3 sm:block"><div><p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#b84c33]">{item.product.color}</p><h2 className="mt-1 text-sm font-semibold">{item.product.name}</h2><p className="mt-1 text-xs text-[#241c18]/60">Tamanho {item.size}</p></div><p className="text-sm font-semibold sm:hidden">{formatBRL(item.product.price * item.quantity)}</p></div><div className="mt-5 flex items-center gap-4"><div className="flex h-9 items-center border border-[#241c18]/20"><button onClick={() => updateQuantity(item.product.id, item.size, item.quantity - 1)} className="grid h-full w-8 place-items-center" aria-label="Diminuir quantidade"><Minus size={13} /></button><span className="grid w-7 place-items-center text-xs">{item.quantity}</span><button onClick={() => updateQuantity(item.product.id, item.size, item.quantity + 1)} className="grid h-full w-8 place-items-center" aria-label="Aumentar quantidade"><Plus size={13} /></button></div><button onClick={() => removeItem(item.product.id, item.size)} className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-[0.12em] text-[#241c18]/55 hover:text-[#b84c33]"><Trash2 size={13} /> Remover</button></div></div><p className="hidden pt-2 text-sm font-semibold sm:block">{formatBRL(item.product.price * item.quantity)}</p></article>)}
            </div>
          </section>
          <aside className="self-start border border-[#241c18]/15 bg-[#ede4da] p-6 md:p-8"><p className="eyebrow">Resumo da escolha</p><div className="mt-7 space-y-4 text-sm"><div className="flex justify-between"><span className="text-[#241c18]/65">Subtotal</span><span>{formatBRL(subtotal)}</span></div><div className="flex justify-between"><span className="text-[#241c18]/65">Entrega</span><span>{shipping === 0 ? "A definir" : formatBRL(shipping)}</span></div><div className="border-t border-[#241c18]/15 pt-4"><div className="flex justify-between text-lg font-semibold"><span>Total</span><span>{formatBRL(total)}</span></div><p className="mt-2 text-xs leading-5 text-[#241c18]/55">A entrega é confirmada na próxima etapa conforme o CEP informado.</p></div></div><Link href="/checkout" className="btn-primary mt-8 flex w-full justify-center">Ir para checkout <ArrowRight size={16} /></Link><p className="mt-5 text-center text-[10px] font-bold uppercase tracking-[0.13em] text-[#241c18]/50">Confira suas informações antes de finalizar</p></aside>
        </div>
      </div>
    </div>
  );
}
