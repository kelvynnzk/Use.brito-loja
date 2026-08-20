/**
 * Direção visual: Ateliê de Concreto — detalhe de produto é um provador calmo: imagem ampla,
 * controles táteis de tamanho e uma ação de compra sempre no primeiro campo de visão.
 */
import { useEffect, useState } from "react";
import { Link, useRoute } from "wouter";
import { ArrowLeft, Check, ChevronDown, Minus, Plus, Ruler, ShoppingBag } from "lucide-react";
import { toast } from "sonner";
import { formatBRL } from "@/data/products";
import { ProductCard } from "@/components/ProductCard";
import { useCart } from "@/contexts/CartContext";
import { trpc } from "@/lib/trpc";

export default function ProductDetail() {
  // O slug da rota identifica a peça que deve ser localizada dentro do catálogo persistido.
  const [, params] = useRoute("/produto/:slug");
  const catalogQuery = trpc.catalog.list.useQuery();
  const products = catalogQuery.data ?? [];
  const product = products.find((item) => item.slug === params?.slug);
  const [size, setSize] = useState(product?.sizes[0] ?? "P");
  const [quantity, setQuantity] = useState(1);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const { addItem } = useCart();

  // Quando a peça muda, o tamanho inicial também é reiniciado para a primeira opção disponível.
  useEffect(() => {
    if (product) setSize(product.sizes[0] ?? "P");
  }, [product?.id]);

  // Evita renderizar informações incompletas enquanto a consulta pública ainda está em andamento.
  if (catalogQuery.isLoading) {
    return <div className="bg-[#f4efe7] px-5 py-28 text-center"><p className="eyebrow">Carregando a peça</p><div className="mx-auto mt-5 h-10 w-48 animate-pulse bg-[#dfd2c4]" /></div>;
  }

  if (!product) {
    return <div className="bg-[#f4efe7] px-5 py-28 text-center"><p className="display-font text-4xl">Esta peça saiu da arara.</p><Link href="/catalogo" className="btn-dark mt-7">Voltar para a curadoria</Link></div>;
  }

  /** Insere a quantidade escolhida na sacola usando o tamanho atualmente selecionado. */
  const addToBag = () => {
    for (let index = 0; index < quantity; index += 1) addItem(product, size);
    toast.success(`${product.name} foi para a sua sacola.`, { description: `${quantity} unidade${quantity > 1 ? "s" : ""} no tamanho ${size}.` });
  };
  // Sugestões são retiradas do mesmo catálogo para manter a vitrine coerente com a categoria atual.
  const related = products.filter((item) => item.id !== product.id && item.category === product.category).slice(0, 3);

  return (
    <div className="atelier-page bg-[#f4efe7] px-5 pb-24 pt-7 md:px-10 md:pt-10">
      <div className="mx-auto max-w-[1440px]">
        <span className="atelier-coordinate right-5 top-8 md:right-10">03 / PROVA</span>
        <Link href="/catalogo" className="mb-7 inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.15em] text-[#241c18]/65 hover:text-[#b84c33]"><ArrowLeft size={15} /> Voltar à curadoria</Link>
        <div className="grid gap-8 lg:grid-cols-[1.22fr_.78fr] lg:gap-14">
          <div className="product-visual-spread relative grid gap-3 md:grid-cols-[1fr_110px]">
            <div className="relative bg-[#e4d6c7]"><img src={product.image} alt={product.name} className="aspect-[4/5] w-full object-cover" />{product.label && <span className="absolute left-4 top-4 bg-[#b84c33] px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.16em] text-white">{product.label}</span>}</div>
            <div className="hidden overflow-hidden bg-[#d8c9b8] md:block"><img src="/manus-storage/use-brito-boutique-rail_d21cbd49.jpg" alt="Detalhe do ateliê Use.Brito" className="h-full w-full object-cover" /></div>
            <span className="atelier-coordinate bottom-4 left-4 bg-[#f4efe7]/90 px-2 py-1">PEÇA / 0{product.id}</span>
          </div>
          <div className="max-w-xl lg:pt-4">
            <p className="eyebrow">{product.color} · {product.category}</p>
            <div className="mt-3 flex items-start justify-between gap-5">
              <h1 className="display-font text-5xl leading-[.98] tracking-[-0.04em] md:text-6xl">{product.name}</h1>
              <p className="shrink-0 pt-2 text-lg font-semibold">{formatBRL(product.price)}</p>
            </div>
            <p className="mt-6 max-w-lg text-base leading-7 text-[#241c18]/70">{product.description}</p>
            <div className="mt-9 border-t border-[#241c18]/15 pt-6">
              <div className="mb-3 flex items-center justify-between"><p className="text-xs font-bold uppercase tracking-[0.14em]">Escolha seu tamanho</p><button className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-[0.12em] text-[#b84c33]"><Ruler size={14} /> Guia de medidas</button></div>
              <div className="flex flex-wrap gap-2">
                {product.sizes.map((item) => <button key={item} onClick={() => setSize(item)} className={`size-button ${size === item ? "is-selected" : ""}`}>{item}</button>)}
              </div>
            </div>
            <div className="mt-7 flex gap-3">
              <div className="flex h-14 items-center border border-[#241c18]/20">
                <button onClick={() => setQuantity((current) => Math.max(1, current - 1))} className="grid h-full w-12 place-items-center" aria-label="Diminuir quantidade"><Minus size={15} /></button>
                <span className="grid w-9 place-items-center text-sm font-semibold">{quantity}</span>
                <button onClick={() => setQuantity((current) => current + 1)} className="grid h-full w-12 place-items-center" aria-label="Aumentar quantidade"><Plus size={15} /></button>
              </div>
              <button onClick={addToBag} className="btn-primary flex h-14 flex-1 justify-center">Adicionar à sacola <ShoppingBag size={17} /></button>
            </div>
            <p className="mt-4 flex items-center gap-2 text-xs text-[#241c18]/60"><Check size={15} className="text-[#b84c33]" /> Selecione seu tamanho e adicione a peça à sua escolha.</p>
            <div className="mt-9 divide-y divide-[#241c18]/15 border-y border-[#241c18]/15">
              <button onClick={() => setDetailsOpen((open) => !open)} className="flex w-full items-center justify-between py-5 text-left text-xs font-bold uppercase tracking-[0.14em]">Detalhes da peça <ChevronDown size={17} className={`transition-transform ${detailsOpen ? "rotate-180" : ""}`} /></button>
              {detailsOpen && <ul className="space-y-2 pb-5 text-sm leading-6 text-[#241c18]/70">{product.details.map((detail) => <li key={detail}>— {detail}</li>)}</ul>}
              <div className="py-5 text-sm text-[#241c18]/70">Uma compra com presença começa por uma escolha que faz sentido para você.</div>
            </div>
          </div>
        </div>
        {related.length > 0 && <section className="mt-24 border-t border-[#241c18]/15 pt-14"><div className="mb-9 flex items-end justify-between"><div><p className="eyebrow">Também conversa com</p><h2 className="display-font mt-2 text-4xl tracking-[-0.035em]">Outras formas de usar.</h2></div><Link href="/catalogo" className="hidden text-xs font-bold uppercase tracking-[0.13em] underline underline-offset-4 sm:block">Ver curadoria</Link></div><div className="catalog-grid grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3 md:gap-x-6">{related.map((item) => <ProductCard product={item} key={item.id} />)}</div></section>}
      </div>
    </div>
  );
}
