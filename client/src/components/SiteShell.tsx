/**
 * Direção visual: Ateliê de Concreto — navegação editorial de boutique, com areia, café e
 * Cobre de Barro como sinais de ritmo e conversão.
 */
import { Link, useLocation } from "wouter";
import { Menu, Search, ShoppingBag, X } from "lucide-react";
import { FormEvent, useState } from "react";
import { useCart } from "@/contexts/CartContext";

const navItems = [
  { label: "Novidades", href: "/catalogo" },
  { label: "Vestidos", href: "/catalogo?categoria=vestidos" },
  { label: "Alfaiataria", href: "/catalogo?categoria=alfaiataria" },
  { label: "Tricôs", href: "/catalogo?categoria=tricos" },
  { label: "Contato", href: "/contato" },
];

export function SiteShell({ children }: { children: React.ReactNode }) {
  const [location, setLocation] = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const { count } = useCart();

  const submitSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const value = query.trim();
    setLocation(value ? `/catalogo?busca=${encodeURIComponent(value)}` : "/catalogo");
    setSearchOpen(false);
    setMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-[#f4efe7] text-[#241c18]">
      <div className="bg-[#241c18] px-4 py-2 text-center text-[10px] font-bold uppercase tracking-[0.20em] text-[#f4efe7] sm:text-xs">
        Peças escolhidas para acompanhar o seu ritmo
      </div>
      <header className="sticky top-0 z-40 border-b border-[#241c18]/10 bg-[#f4efe7]/95 backdrop-blur-md">
        <div className="mx-auto flex h-[76px] max-w-[1440px] items-center justify-between gap-4 px-5 md:px-10">
          <button
            aria-label="Abrir menu"
            className="inline-flex h-10 w-10 items-center justify-center border border-[#241c18]/15 md:hidden"
            onClick={() => setMenuOpen((open) => !open)}
          >
            {menuOpen ? <X size={19} /> : <Menu size={20} />}
          </button>
          <nav className="hidden items-center gap-6 lg:flex" aria-label="Navegação principal">
            {navItems.slice(0, 3).map((item) => (
              <Link key={item.label} href={item.href} className="nav-link">
                {item.label}
              </Link>
            ))}
          </nav>
          <Link href="/" className="group flex items-center gap-2.5 text-xl font-semibold tracking-tight sm:text-2xl">
            <img src="/manus-storage/use-brito-mark_b2bb36b9.png" alt="" className="h-8 w-8 object-contain transition-transform duration-200 group-hover:rotate-6" />
            <span className="display-font">Use.Brito</span>
          </Link>
          <nav className="hidden items-center gap-6 lg:flex" aria-label="Navegação complementar">
            {navItems.slice(3).map((item) => (
              <Link key={item.label} href={item.href} className="nav-link">
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="flex items-center gap-1.5 sm:gap-2">
            <button aria-label="Buscar" onClick={() => setSearchOpen(true)} className="icon-button">
              <Search size={19} strokeWidth={1.8} />
            </button>
            <Link href="/carrinho" className="icon-button relative" aria-label={`Carrinho com ${count} itens`}>
              <ShoppingBag size={19} strokeWidth={1.8} />
              {count > 0 && <span className="absolute right-1 top-1 grid h-4 min-w-4 place-items-center rounded-full bg-[#b84c33] px-1 text-[9px] font-bold text-white">{count}</span>}
            </Link>
          </div>
        </div>
        {menuOpen && (
          <div className="border-t border-[#241c18]/10 bg-[#f4efe7] px-5 py-5 md:hidden">
            <nav className="flex flex-col divide-y divide-[#241c18]/10" aria-label="Menu mobile">
              {navItems.map((item) => (
                <Link key={item.label} href={item.href} onClick={() => setMenuOpen(false)} className="py-3 text-sm font-semibold">
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
        )}
      </header>

      {searchOpen && (
        <div className="fixed inset-0 z-50 bg-[#241c18]/45 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-label="Buscar produtos">
          <div className="mx-auto mt-[11vh] max-w-2xl border border-[#241c18]/15 bg-[#f4efe7] p-6 shadow-2xl sm:p-9">
            <div className="mb-9 flex items-center justify-between">
              <p className="eyebrow">Busca do ateliê</p>
              <button aria-label="Fechar busca" onClick={() => setSearchOpen(false)} className="icon-button"><X size={20} /></button>
            </div>
            <form onSubmit={submitSearch} className="flex border-b-2 border-[#241c18] pb-3">
              <input
                autoFocus
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Vestidos, conjuntos, calças..."
                className="w-full bg-transparent text-xl outline-none placeholder:text-[#241c18]/45 sm:text-2xl"
              />
              <button className="ml-3 text-xs font-bold uppercase tracking-[0.16em] text-[#b84c33]">Buscar</button>
            </form>
            <div className="mt-7 flex flex-wrap gap-2">
              {["Vestidos", "Alfaiataria", "Tricôs", "Essenciais"].map((term) => (
                <button key={term} onClick={() => { setQuery(term); setLocation(`/catalogo?busca=${term}`); setSearchOpen(false); }} className="border border-[#241c18]/15 px-3 py-2 text-[11px] font-bold uppercase tracking-[0.13em] transition-colors hover:bg-[#241c18] hover:text-white">
                  {term}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
      <main>{children}</main>
      <footer className="bg-[#241c18] px-5 pb-7 pt-14 text-[#f4efe7] md:px-10 md:pt-16">
        <div className="mx-auto grid max-w-[1440px] gap-12 md:grid-cols-[1.2fr_.75fr_.75fr]">
          <div>
            <div className="mb-5 flex items-center gap-2.5 text-2xl font-semibold">
              <img src="/manus-storage/use-brito-mark_b2bb36b9.png" alt="" className="h-9 w-9 object-contain brightness-0 invert" />
              <span className="display-font">Use.Brito</span>
            </div>
            <p className="max-w-sm text-sm leading-6 text-[#f4efe7]/70">Moda feminina em capítulos curtos, texturas marcantes e escolhas que acompanham seu próprio compasso.</p>
          </div>
          <div>
            <p className="eyebrow text-[#c97763]">Explorar</p>
            <div className="mt-4 flex flex-col gap-2 text-sm text-[#f4efe7]/75">
              <Link href="/catalogo">Novidades</Link>
              <Link href="/catalogo?categoria=vestidos">Vestidos</Link>
              <Link href="/catalogo?categoria=alfaiataria">Alfaiataria</Link>
            </div>
          </div>
          <div>
            <p className="eyebrow text-[#c97763]">Contato</p>
            <div className="mt-4 flex flex-col gap-2 text-sm text-[#f4efe7]/75">
              <Link href="/contato">Fale com o ateliê</Link>
              <span>Instagram e WhatsApp</span>
              <span>Segunda a sexta, 10h–18h</span>
            </div>
          </div>
        </div>
        <div className="mx-auto mt-14 flex max-w-[1440px] flex-col gap-3 border-t border-white/15 pt-5 text-[10px] font-bold uppercase tracking-[0.16em] text-[#f4efe7]/45 sm:flex-row sm:justify-between">
          <span>© 2026 Use.Brito</span>
          <span>Feito para vestir presença</span>
        </div>
      </footer>
    </div>
  );
}
