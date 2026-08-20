/**
 * Direção visual: Ateliê de Concreto — catálogo como parede de curadoria: filtros enxutos,
 * tipografia editorial e produto em destaque sem a aparência de marketplace.
 */
import { useMemo, useState } from "react";
import { Link } from "wouter";
import { SlidersHorizontal, X } from "lucide-react";
import { ProductCard } from "@/components/ProductCard";
import { categories, categoryLabels, type Category } from "@/data/products";
import { trpc } from "@/lib/trpc";

export default function Catalog() {
  // Os parâmetros da URL permitem chegar ao catálogo já filtrado a partir de links e da busca global.
  const params = new URLSearchParams(window.location.search);
  const initialCategory = params.get("categoria") as Category | null;
  const initialSearch = params.get("busca") || "";
  const [category, setCategory] = useState<Category | "todas">(initialCategory && categoryLabels[initialCategory] ? initialCategory : "todas");
  const [search, setSearch] = useState(initialSearch);
  const [sort, setSort] = useState("destaque");
  // Consulta pública que traz somente as peças publicadas e persistidas no banco.
  const catalogQuery = trpc.catalog.list.useQuery();
  const products = catalogQuery.data ?? [];

  /** Aplica categoria, termo de busca e ordenação no catálogo recebido, sem duplicar chamadas ao servidor. */
  const filtered = useMemo(() => {
    const needle = search.trim().toLocaleLowerCase("pt-BR");
    const selection = products.filter((product) => {
      const categoryMatch = category === "todas" || product.category === category;
      const searchMatch = !needle || `${product.name} ${product.description} ${categoryLabels[product.category]}`.toLocaleLowerCase("pt-BR").includes(needle);
      return categoryMatch && searchMatch;
    });
    if (sort === "menor") return [...selection].sort((a, b) => a.price - b.price);
    if (sort === "maior") return [...selection].sort((a, b) => b.price - a.price);
    return selection;
  }, [category, products, search, sort]);

  /** Restaura a navegação à curadoria completa depois de uma busca ou filtro. */
  const reset = () => { setCategory("todas"); setSearch(""); setSort("destaque"); };

  return (
    <div className="atelier-page bg-[#f4efe7] px-5 pb-24 pt-12 md:px-10 md:pt-16">
      <div className="mx-auto max-w-[1440px]">
        <span className="atelier-coordinate right-5 top-8 md:right-10">01 / CURADORIA</span>
        <div className="grid gap-8 border-b border-[#241c18]/15 pb-10 md:grid-cols-[1fr_.75fr] md:items-end">
          <div>
            <p className="eyebrow">Curadoria Use.Brito</p>
            <h1 className="display-font mt-3 text-5xl tracking-[-0.04em] md:text-7xl">{category === "todas" ? "Todas as peças" : categoryLabels[category]}</h1>
          </div>
          <p className="max-w-md text-sm leading-6 text-[#241c18]/65">Cada peça foi pensada para encontrar outras no seu armário — e criar novas possibilidades, sem esforço.</p>
        </div>

        <div className="my-7 flex flex-col gap-4 border-b border-[#241c18]/10 pb-7 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-wrap gap-x-5 gap-y-3">
            <button className={`filter-link ${category === "todas" ? "is-active" : ""}`} onClick={() => setCategory("todas")}>Tudo</button>
            {categories.map((item) => <button key={item.slug} className={`filter-link ${category === item.slug ? "is-active" : ""}`} onClick={() => setCategory(item.slug as Category)}>{item.name}</button>)}
            <button className={`filter-link ${category === "essenciais" ? "is-active" : ""}`} onClick={() => setCategory("essenciais")}>Essenciais</button>
            <button className={`filter-link ${category === "acessorios" ? "is-active" : ""}`} onClick={() => setCategory("acessorios")}>Acessórios</button>
          </div>
          <div className="flex items-center gap-3">
            <label className="sr-only" htmlFor="sort">Ordenar produtos</label>
            <SlidersHorizontal size={15} className="text-[#b84c33]" />
            <select id="sort" value={sort} onChange={(event) => setSort(event.target.value)} className="bg-transparent text-xs font-bold uppercase tracking-[0.12em] outline-none">
              <option value="destaque">Por destaque</option>
              <option value="menor">Menor preço</option>
              <option value="maior">Maior preço</option>
            </select>
          </div>
        </div>

        <div className="mb-10 flex items-center gap-3 border border-[#241c18]/15 bg-white/30 px-4 py-3">
          <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Busque por nome, estilo ou categoria" className="w-full bg-transparent text-sm outline-none placeholder:text-[#241c18]/45" />
          {(search || category !== "todas" || sort !== "destaque") && <button onClick={reset} className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-[0.13em] text-[#b84c33]"><X size={14} /> Limpar</button>}
        </div>

        {category === "todas" && !search && sort === "destaque" && (
          <section className="catalog-spread mb-14 grid overflow-hidden border border-[#241c18]/15 bg-[#ede4da] md:grid-cols-[.9fr_1.1fr]">
            <div className="relative min-h-[340px] overflow-hidden"><img src="/manus-storage/use-brito-boutique-gallery_713d4109.jpg" alt="Galeria de peças em uma boutique minimalista" className="absolute inset-0 h-full w-full object-cover" /><div className="absolute inset-0 bg-[#241c18]/25" /><span className="atelier-coordinate bottom-5 left-5 text-white/75">CADERNO 01</span></div>
            <div className="relative flex min-h-[340px] flex-col justify-between p-7 md:p-10"><img src="/manus-storage/use-brito-mark_b2bb36b9.png" alt="" className="absolute right-7 top-7 h-11 w-11 opacity-25" /><p className="eyebrow">Peça em foco</p><div><p className="text-sm text-[#241c18]/60">Uma ideia de combinação para começar a sua própria sequência.</p><h2 className="display-font mt-3 text-4xl leading-[.96] tracking-[-0.04em] md:text-5xl">Formas que pedem uma segunda olhada.</h2><Link href="/produto/blazer-selva" className="btn-dark mt-7">Ver Blazer Selva</Link></div></div>
          </section>
        )}
        <p className="mb-7 text-[10px] font-bold uppercase tracking-[0.16em] text-[#241c18]/55">{catalogQuery.isLoading ? "Carregando curadoria" : `${filtered.length} ${filtered.length === 1 ? "peça encontrada" : "peças encontradas"}`}</p>
        {/* Esqueleto visual mantém a grade estável enquanto os registros persistentes são carregados. */}
        {catalogQuery.isLoading && <div className="catalog-grid grid grid-cols-2 gap-x-4 gap-y-11 md:grid-cols-4 md:gap-x-6 md:gap-y-14">{Array.from({ length: 8 }).map((_, index) => <div key={index} className="aspect-[4/5] animate-pulse bg-[#dfd2c4]" />)}</div>}
        {!catalogQuery.isLoading && filtered.length > 0 ? (
          <div className="catalog-grid grid grid-cols-2 gap-x-4 gap-y-11 md:grid-cols-4 md:gap-x-6 md:gap-y-14">
            {filtered.map((product, index) => <ProductCard key={product.id} product={product} priority={index < 2} />)}
          </div>
        ) : !catalogQuery.isLoading ? (
          <div className="border border-dashed border-[#241c18]/25 px-5 py-20 text-center">
            <p className="display-font text-3xl">Ainda não encontramos esse recorte.</p>
            <p className="mx-auto mt-3 max-w-sm text-sm text-[#241c18]/65">Tente uma busca mais ampla ou volte para todas as peças da curadoria.</p>
            <button onClick={reset} className="btn-dark mt-7">Ver tudo</button>
          </div>
        ) : null}
        <div className="mt-16 border-t border-[#241c18]/15 pt-8 text-center">
          <p className="text-sm text-[#241c18]/65">Não encontrou o que imaginou?</p>
          <Link href="/contato" className="mt-2 inline-block text-xs font-bold uppercase tracking-[0.14em] underline underline-offset-4">Fale com o ateliê</Link>
        </div>
      </div>
    </div>
  );
}
