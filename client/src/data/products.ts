/**
 * Direção visual: Ateliê de Concreto — dados de produto sustentam uma curadoria urbana,
 * tátil e editorial, com paleta mineral e linguagem de boutique brasileira.
 */
/** Categorias técnicas aceitas no banco, nos filtros e nos links de curadoria. */
export type Category = "vestidos" | "alfaiataria" | "tricos" | "essenciais" | "acessorios";

/** Formato de exibição de uma peça na vitrine e na sacola. */
export type Product = {
  id: number;
  slug: string;
  name: string;
  category: Category;
  price: number;
  image: string;
  label?: string;
  color: string;
  description: string;
  details: string[];
  sizes: string[];
};

/** Rótulos em pt-BR usados para transformar categorias técnicas em texto visível. */
export const categoryLabels: Record<Category, string> = {
  vestidos: "Vestidos",
  alfaiataria: "Alfaiataria",
  tricos: "Tricôs",
  essenciais: "Essenciais",
  acessorios: "Acessórios",
};

/**
 * Referência visual local das peças originais do projeto.
 * A loja pública consulta o banco; esta lista mantém os tipos e o conteúdo-base da curadoria no código.
 */
export const products: Product[] = [
  {
    id: 1,
    slug: "vestido-aurora",
    name: "Vestido Aurora",
    category: "vestidos",
    price: 389,
    image: "/manus-storage/use-brito-editorial-dress_ae794978.jpg",
    label: "Novo capítulo",
    color: "Ferrugem",
    description: "Fluidez e presença para acompanhar o movimento do dia até a noite.",
    details: ["Viscose encorpada", "Mangas com volume arquitetônico", "Modelagem midi"],
    sizes: ["PP", "P", "M", "G"],
  },
  {
    id: 2,
    slug: "blazer-selva",
    name: "Blazer Selva",
    category: "alfaiataria",
    price: 529,
    image: "/manus-storage/use-brito-editorial-jacket_355d7a64.webp",
    label: "Edição limitada",
    color: "Cacau",
    description: "Alfaiataria de ombro suave e caimento decidido, feita para multiplicar combinações.",
    details: ["Tecido de alfaiataria misto", "Forro acetinado", "Botões forrados"],
    sizes: ["P", "M", "G"],
  },
  {
    id: 3,
    slug: "conjunto-brisa",
    name: "Conjunto Brisa",
    category: "tricos",
    price: 349,
    image: "/manus-storage/use-brito-editorial-knit_54d2459a.jpeg",
    label: "Textura da vez",
    color: "Tijolo",
    description: "Duas peças, muitas possibilidades: ponto canelado com conforto de presença.",
    details: ["Malha canelada macia", "Top e saia vendidos juntos", "Elasticidade confortável"],
    sizes: ["P", "M", "G"],
  },
  {
    id: 4,
    slug: "camisa-linha",
    name: "Camisa Linha",
    category: "essenciais",
    price: 269,
    image: "/manus-storage/use-brito-editorial-portrait_343cf51a.webp",
    color: "Marfim",
    description: "Um essencial de toque leve, desenhado para entrar em qualquer composição.",
    details: ["Algodão com toque macio", "Gola clássica", "Punhos alongados"],
    sizes: ["PP", "P", "M", "G"],
  },
  {
    id: 5,
    slug: "calca-ritmo",
    name: "Calça Ritmo",
    category: "alfaiataria",
    price: 319,
    image: "/manus-storage/use-brito-editorial-tailoring_132c9646.jpg",
    color: "Areia",
    description: "Cintura alta e perna ampla para dar ritmo aos dias que pedem presença.",
    details: ["Cintura alta", "Pregas frontais", "Barra ampla"],
    sizes: ["P", "M", "G", "GG"],
  },
  {
    id: 6,
    slug: "regata-orla",
    name: "Regata Orla",
    category: "essenciais",
    price: 149,
    image: "/manus-storage/use-brito-editorial-linen_0ed93893.jpg",
    label: "Favorito do ateliê",
    color: "Oliva",
    description: "Cava precisa, gola delicada e uma tonalidade que conversa com tudo.",
    details: ["Malha de algodão", "Gola alta suave", "Modelagem próxima ao corpo"],
    sizes: ["PP", "P", "M", "G"],
  },
  {
    id: 7,
    slug: "saia-vértice",
    name: "Saia Vértice",
    category: "vestidos",
    price: 289,
    image: "/manus-storage/use-brito-hero_a051fd2a.jpg",
    color: "Cobre",
    description: "Uma saia de linhas diagonais para transformar a simplicidade em ponto de vista.",
    details: ["Viscose estruturada", "Fenda lateral", "Fechamento posterior"],
    sizes: ["P", "M", "G"],
  },
  {
    id: 8,
    slug: "brinco-fagulha",
    name: "Brinco Fagulha",
    category: "acessorios",
    price: 119,
    image: "/manus-storage/use-brito-boutique-rail_d21cbd49.jpg",
    color: "Metal queimado",
    description: "Pequeno gesto de metal para iluminar rostos e composições minimalistas.",
    details: ["Metal com banho dourado", "Leve para uso diário", "Fecho de pino"],
    sizes: ["Único"],
  },
];

/** Coleções editoriais apresentadas na home e usadas como atalhos de navegação para o catálogo. */
export const categories = [
  {
    name: "Vestidos",
    slug: "vestidos",
    image: "/manus-storage/use-brito-editorial-dress_ae794978.jpg",
    copy: "Fluidez em movimento",
  },
  {
    name: "Alfaiataria",
    slug: "alfaiataria",
    image: "/manus-storage/use-brito-editorial-jacket_355d7a64.webp",
    copy: "Estrutura que acompanha",
  },
  {
    name: "Tricôs",
    slug: "tricos",
    image: "/manus-storage/use-brito-editorial-knit_54d2459a.jpeg",
    copy: "Textura para sentir",
  },
];

/** Formata valores em reais para todos os pontos de exibição da interface. */
export const formatBRL = (value: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
