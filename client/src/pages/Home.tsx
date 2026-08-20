/**
 * Direção visual: Ateliê de Concreto — home como uma página de revista aberta, alternando
 * hero assimétrico, recortes de coleção e vitrine de produto de leitura imediata.
 */
import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { Link } from "wouter";
import { ProductCard } from "@/components/ProductCard";
import { categories, products } from "@/data/products";

export default function Home() {
  return (
    <div className="atelier-page overflow-hidden">
      <section className="relative min-h-[650px] bg-[#d8c9b8] md:min-h-[720px]">
        <img src="/manus-storage/use-brito-hero_a051fd2a.jpg" alt="Modelo vestindo alfaiataria Use.Brito em um ateliê contemporâneo" className="absolute inset-0 h-full w-full object-cover object-[62%_center]" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#f4efe7]/95 via-[#f4efe7]/70 to-transparent" />
        <div className="hero-grain absolute inset-0" />
        <div className="relative mx-auto flex min-h-[650px] max-w-[1440px] items-end px-5 pb-14 pt-20 md:min-h-[720px] md:px-10 md:pb-20">
          <div className="max-w-xl">
            <p className="eyebrow mb-5">Coleção 01 / 26</p>
            <h1 className="display-font max-w-lg text-5xl leading-[0.94] tracking-[-0.045em] sm:text-6xl md:text-7xl">Texturas que ficam na memória.</h1>
            <p className="mt-6 max-w-md text-base leading-7 text-[#241c18]/75">Uma seleção de formas leves, cor mineral e detalhes que você reconhece de longe.</p>
            <Link href="/catalogo" className="btn-primary mt-9 inline-flex">Conheça o capítulo <ArrowUpRight size={17} /></Link>
          </div>
        </div>
        <div className="absolute bottom-0 right-0 hidden border-l border-t border-[#241c18]/15 bg-[#f4efe7]/90 p-5 text-xs font-semibold leading-5 md:block md:w-60">
          <span className="block text-[#b84c33]">#01</span>
          Feito para vestir presença — sem ruído.
        </div>
      </section>

      <section className="bg-[#f4efe7] px-5 py-20 md:px-10 md:py-28">
        <div className="mx-auto max-w-[1440px]">
          <div className="mb-10 flex flex-col justify-between gap-5 md:mb-14 md:flex-row md:items-end">
            <div className="max-w-md">
              <p className="eyebrow">Recortes de coleção</p>
              <h2 className="display-font mt-3 text-4xl leading-none tracking-[-0.035em] md:text-5xl">Por onde o seu armário começa hoje?</h2>
            </div>
            <Link href="/catalogo" className="inline-flex items-center gap-2 self-start border-b border-[#241c18] pb-1 text-xs font-bold uppercase tracking-[0.14em] transition-colors hover:border-[#b84c33] hover:text-[#b84c33] md:self-auto">Ver toda a curadoria <ArrowUpRight size={15} /></Link>
          </div>
          <div className="grid gap-5 md:grid-cols-3 md:gap-7">
            {categories.map((category, index) => (
              <Link key={category.slug} href={`/catalogo?categoria=${category.slug}`} className={`group relative overflow-hidden ${index === 1 ? "md:mt-16" : ""}`}>
                <img src={category.image} alt={category.name} className="aspect-[4/5] w-full object-cover transition duration-500 group-hover:scale-[1.04]" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#241c18]/70 via-[#241c18]/5 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 flex items-end justify-between p-5 text-white md:p-6">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#f1d4c7]">0{index + 1}</p>
                    <h3 className="display-font mt-1 text-3xl">{category.name}</h3>
                    <p className="mt-1 text-sm text-white/80">{category.copy}</p>
                  </div>
                  <ArrowUpRight className="mb-1" size={20} />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="relative bg-[#241c18] px-5 py-20 text-[#f4efe7] md:px-10 md:py-28">
        <div className="absolute left-[8%] top-0 h-full w-px bg-white/10" />
        <span className="atelier-coordinate right-5 top-5 text-white/35 md:right-10">02 / FORMA</span>
        <div className="relative mx-auto grid max-w-[1440px] gap-10 md:grid-cols-[1.05fr_1fr] md:items-end">
          <div className="max-w-lg">
            <p className="eyebrow text-[#c97763]">O gesto de vestir</p>
            <h2 className="display-font mt-3 text-5xl leading-[0.95] tracking-[-0.045em] md:text-6xl">A roupa não precisa falar alto para ser notada.</h2>
          </div>
          <div className="md:pb-1">
            <p className="max-w-md text-base leading-7 text-[#f4efe7]/70">A Use.Brito constrói uma seleção de peças que encontram o seu tempo: formas que respiram, texturas que aproximam e cor em doses bem escolhidas.</p>
            <Link href="/contato" className="mt-8 inline-flex items-center gap-2 border-b border-[#f4efe7] pb-1 text-xs font-bold uppercase tracking-[0.14em] hover:text-[#c97763]">Conheça o ateliê <ArrowDownRight size={15} /></Link>
          </div>
        </div>
      </section>

      <section className="bg-[#ede4da] px-5 py-20 md:px-10 md:py-28">
        <div className="mx-auto max-w-[1440px]">
          <div className="mb-10 flex items-end justify-between gap-5 md:mb-14">
            <div>
              <p className="eyebrow">Agora no ateliê</p>
              <h2 className="display-font mt-3 text-4xl tracking-[-0.035em] md:text-5xl">Peças para começar.</h2>
            </div>
            <Link href="/catalogo" className="hidden text-xs font-bold uppercase tracking-[0.14em] underline underline-offset-4 md:block">Ver todas</Link>
          </div>
          <div className="catalog-grid grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-4 md:gap-x-6 md:gap-y-12">
            {products.slice(0, 4).map((product, index) => <ProductCard product={product} key={product.id} priority={index < 2} />)}
          </div>
        </div>
      </section>

      <section className="grid bg-[#b84c33] text-white md:grid-cols-2">
        <div className="flex min-h-[360px] flex-col justify-between px-5 py-12 md:min-h-[480px] md:px-10 md:py-16">
          <p className="eyebrow text-[#f6cec0]">Carta de novidades</p>
          <div>
            <h2 className="display-font max-w-md text-5xl leading-[0.95] tracking-[-0.04em] md:text-6xl">O próximo capítulo chega perto.</h2>
            <p className="mt-5 max-w-md text-sm leading-6 text-white/80">Cadastre seu e-mail e receba primeiro os novos recortes, cores e histórias da coleção.</p>
            <form className="mt-8 flex max-w-md border-b border-white/70 pb-3" onSubmit={(event) => event.preventDefault()}>
              <input type="email" required placeholder="seuemail@exemplo.com" className="w-full bg-transparent text-sm outline-none placeholder:text-white/55" />
              <button className="text-[10px] font-bold uppercase tracking-[0.16em]">Entrar</button>
            </form>
          </div>
        </div>
        <div className="relative min-h-[320px] overflow-hidden md:min-h-[480px]">
          <img src="/manus-storage/use-brito-boutique-space_2c021d4a.jpg" alt="Espaço de boutique minimalista em tons claros" className="absolute inset-0 h-full w-full object-cover" />
          <div className="absolute inset-0 bg-[#241c18]/10" />
        </div>
      </section>
    </div>
  );
}
