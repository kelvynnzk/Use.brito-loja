/**
 * Direção visual: Ateliê de Concreto — cartões são recortes de lookbook, com bordas secas,
 * gesto de hover sutil e informação comercial direta.
 */
import { ArrowUpRight, ShoppingBag } from "lucide-react";
import { Link } from "wouter";
import { toast } from "sonner";
import type { Product } from "@/data/products";
import { formatBRL } from "@/data/products";
import { useCart } from "@/contexts/CartContext";

/**
 * Apresenta uma peça em grids de vitrine e oferece dois caminhos: abrir o detalhe ou adicioná-la rapidamente.
 * A opção priority permite carregar com prioridade as imagens que aparecem antes da dobra da página.
 */
export function ProductCard({ product, priority = false }: { product: Product; priority?: boolean }) {
  const { addItem } = useCart();

  /** Usa o primeiro tamanho disponível para agilizar a seleção sem impedir ajuste posterior no detalhe. */
  const quickAdd = () => {
    addItem(product, product.sizes[0]);
    toast.success(`${product.name} foi para a sua sacola.`, { description: `Tamanho ${product.sizes[0]} selecionado.` });
  };

  return (
    <article className="product-card group">
      <Link href={`/produto/${product.slug}`} className="relative block overflow-hidden bg-[#e5d8c9]">
        <img src={product.image} alt={product.name} loading={priority ? "eager" : "lazy"} className="aspect-[4/5] w-full object-cover transition duration-500 group-hover:scale-[1.035]" />
        <span className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-[#241c18]/35 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
        {product.label && <span className="absolute left-3 top-3 bg-[#b84c33] px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.16em] text-white">{product.label}</span>}
        <span className="absolute bottom-3 right-3 grid h-9 w-9 translate-y-2 place-items-center rounded-full bg-[#f4efe7] text-[#241c18] opacity-0 transition-all duration-200 group-hover:translate-y-0 group-hover:opacity-100"><ArrowUpRight size={17} /></span>
      </Link>
      <div className="flex items-start justify-between gap-3 pt-4">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#b84c33]">{product.color}</p>
          <Link href={`/produto/${product.slug}`} className="mt-1 block text-sm font-semibold leading-5 hover:underline">{product.name}</Link>
          <p className="mt-1 text-sm text-[#241c18]/65">{formatBRL(product.price)}</p>
        </div>
        <button onClick={quickAdd} aria-label={`Adicionar ${product.name} à sacola`} className="mt-1 grid h-9 w-9 shrink-0 place-items-center border border-[#241c18]/20 transition-colors hover:border-[#b84c33] hover:bg-[#b84c33] hover:text-white"><ShoppingBag size={16} /></button>
      </div>
    </article>
  );
}
