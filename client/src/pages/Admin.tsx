/**
 * Direção visual: Ateliê de Concreto — o bastidor administrativo traduz a loja em uma mesa de
 * curadoria: café profundo, painéis de papel mineral, cobre para estados e dados com hierarquia editorial.
 */
import { FormEvent, useMemo, useState } from "react";
import { toast } from "sonner";
import { useLocation } from "wouter";
import {
  Archive,
  ArrowUpRight,
  BarChart3,
  Bell,
  Boxes,
  ChevronRight,
  CircleDollarSign,
  ClipboardList,
  Eye,
  LayoutDashboard,
  MessageCircle,
  MoreHorizontal,
  PackageCheck,
  Plus,
  Search,
  Settings2,
  ShoppingBag,
  Sparkles,
  Tag,
  TrendingUp,
  UsersRound,
  X,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { categoryLabels, formatBRL, type Category, type Product } from "@/data/products";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { startLogin } from "@/const";

// Visões internas disponíveis no painel; a navegação troca o conteúdo sem sair da rota administrativa.
type AdminView = "visao" | "pedidos" | "catalogo";
type AdminProduct = Product & { stock: number; state: "Publicado" | "Rascunho" };
type OrderStatus = "Em análise" | "Contato iniciado" | "Concluído";
type AdminOrder = { id: string; customer: string; items: number; total: number; time: string; status: OrderStatus };

const navItems: { id: AdminView; label: string; icon: typeof LayoutDashboard }[] = [
  { id: "visao", label: "Visão geral", icon: LayoutDashboard },
  { id: "pedidos", label: "Pedidos", icon: ClipboardList },
  { id: "catalogo", label: "Catálogo", icon: ShoppingBag },
];

// Cores semânticas aplicadas aos estados persistidos de atendimento.
const statusClasses: Record<OrderStatus, string> = {
  "Em análise": "bg-[#f2d8ce] text-[#8f3f2c]",
  "Contato iniciado": "bg-[#f2e8bc] text-[#6d5414]",
  Concluído: "bg-[#e1ddd5] text-[#5d5249]",
};

export default function Admin() {
  const [, setLocation] = useLocation();
  // A autenticação define se a pessoa pode consultar e alterar os dados operacionais.
  const { user, loading: authLoading } = useAuth();
  const canManage = user?.role === "admin";
  const utils = trpc.useUtils();
  // Consultas só são disparadas depois que a permissão administrativa é confirmada.
  const catalogQuery = trpc.admin.products.useQuery(undefined, { enabled: canManage });
  const requestsQuery = trpc.admin.requests.useQuery(undefined, { enabled: canManage });
  // Após uma mutação bem-sucedida, o cache correspondente é invalidado para atualizar a interface.
  const createProductMutation = trpc.admin.createProduct.useMutation({ onSuccess: () => utils.admin.products.invalidate() });
  const updateProductMutation = trpc.admin.updateProduct.useMutation({ onSuccess: () => utils.admin.products.invalidate() });
  const updateRequestMutation = trpc.admin.updateRequestStatus.useMutation({ onSuccess: () => utils.admin.requests.invalidate() });
  const [activeView, setActiveView] = useState<AdminView>("visao");
  const catalog: AdminProduct[] = catalogQuery.data ?? [];
  // A tabela do painel recebe rótulos legíveis em pt-BR a partir dos estados técnicos do banco.
  const orders: AdminOrder[] = (requestsQuery.data ?? []).map((request) => ({
      id: `#${request.reference}`,
      customer: "Solicitação via WhatsApp",
      items: request.itemCount,
      total: request.subtotalCents / 100,
      time: new Date(request.createdAt).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" }),
      status: request.status === "new" ? "Em análise" : request.status === "contacted" ? "Contato iniciado" : "Concluído",
    }));
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<AdminProduct | null>(null);
  const [formName, setFormName] = useState("");
  const [formPrice, setFormPrice] = useState("");
  const [formCategory, setFormCategory] = useState<Category>("vestidos");

  const published = catalog.filter((product) => product.state === "Publicado").length;
  const lowStock = catalog.filter((product) => product.stock < 6).length;
  /** Filtra apenas a lista já autorizada e carregada, sem gerar nova consulta a cada busca. */
  const filteredCatalog = useMemo(() => {
    const needle = search.trim().toLocaleLowerCase("pt-BR");
    if (!needle) return catalog;
    return catalog.filter((product) => `${product.name} ${categoryLabels[product.category]}`.toLocaleLowerCase("pt-BR").includes(needle));
  }, [catalog, search]);

  /** Preenche o formulário para criação ou edição conforme a peça selecionada. */
  const openProductDialog = (product?: AdminProduct) => {
    setEditing(product ?? null);
    setFormName(product?.name ?? "");
    setFormPrice(product ? String(product.price) : "");
    setFormCategory(product?.category ?? "vestidos");
    setDialogOpen(true);
  };

  /** Salva um rascunho novo ou uma atualização parcial no catálogo persistente. */
  const saveProduct = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!formName.trim() || !formPrice) return;
    if (!canManage) {
      startLogin();
      return;
    }
    if (editing) {
      updateProductMutation.mutate({ id: editing.id, product: { name: formName.trim(), price: Number(formPrice), category: formCategory } }, { onSuccess: () => toast.success("Peça atualizada no catálogo persistente.") });
    } else {
      const timestamp = Date.now();
      createProductMutation.mutate({
        slug: `rascunho-${timestamp}`,
        name: formName.trim(),
        category: formCategory,
        price: Number(formPrice),
        image: "/manus-storage/use-brito-mark_b2bb36b9.png",
        label: "Rascunho",
        color: "A definir",
        description: "Produto em preparação no ateliê.",
        details: ["Aguardando descrição"],
        sizes: ["P", "M", "G"],
        stock: 0,
        state: "Rascunho",
        sortOrder: 999,
      }, { onSuccess: () => toast.success("Novo rascunho salvo.", { description: "Complete imagem, estoque e descrição antes de publicar." }) });
    }
    setDialogOpen(false);
  };

  /** Alterna entre rascunho e publicação, mantendo a vitrine pública sincronizada. */
  const toggleProductState = (id: number) => {
    if (!canManage) {
      startLogin();
      return;
    }
    const product = catalog.find((item) => item.id === id);
    if (!product) return;
    updateProductMutation.mutate({ id, product: { state: product.state === "Publicado" ? "Rascunho" : "Publicado" } }, { onSuccess: () => toast.success("Status da peça atualizado no catálogo.") });
  };

  /** Avança ciclicamente a conversa: análise, contato iniciado e concluída. */
  const changeOrderStatus = (id: string) => {
    if (!canManage) {
      startLogin();
      return;
    }
    const order = orders.find((item) => item.id === id);
    if (!order) return;
    const next = order.status === "Em análise" ? "contacted" : order.status === "Contato iniciado" ? "archived" : "new";
    updateRequestMutation.mutate({ reference: id.replace(/^#/, ""), status: next }, { onSuccess: () => toast.success("Solicitação atualizada.") });
  };

  // Estados de acesso impedem que o painel exiba dados operacionais antes da autenticação.
  if (authLoading) {
    return <div className="grid min-h-screen place-items-center bg-[#ece6dc] p-6 text-center text-[#251d19]"><div><p className="admin-kicker">Ateliê admin</p><p className="display-font mt-3 text-4xl">Preparando o bastidor.</p></div></div>;
  }

  if (!user) {
    return <div className="grid min-h-screen place-items-center bg-[#ece6dc] p-6 text-center text-[#251d19]"><div className="max-w-md border border-[#251d19]/15 bg-[#f4efe7] p-8 shadow-[7px_7px_0_rgba(184,76,51,.08)]"><p className="admin-kicker">Acesso restrito</p><h1 className="display-font mt-3 text-4xl leading-none">O bastidor pede identificação.</h1><p className="mt-4 text-sm leading-6 text-[#251d19]/65">Entre com a conta proprietária para editar a curadoria, acompanhar solicitações e manter os dados do ateliê organizados.</p><button onClick={() => startLogin()} className="admin-button mt-7">Entrar no painel <ArrowUpRight size={15} /></button><button onClick={() => setLocation("/")} className="admin-button-ghost mt-3">Voltar para a loja</button></div></div>;
  }

  if (!canManage) {
    return <div className="grid min-h-screen place-items-center bg-[#ece6dc] p-6 text-center text-[#251d19]"><div className="max-w-md border border-[#251d19]/15 bg-[#f4efe7] p-8 shadow-[7px_7px_0_rgba(184,76,51,.08)]"><p className="admin-kicker">Permissão necessária</p><h1 className="display-font mt-3 text-4xl leading-none">Esta conta não gerencia o ateliê.</h1><p className="mt-4 text-sm leading-6 text-[#251d19]/65">Peça ao proprietário da Use.Brito para conceder acesso administrativo à sua conta.</p><button onClick={() => setLocation("/")} className="admin-button mt-7">Voltar para a loja <ArrowUpRight size={15} /></button></div></div>;
  }

  return (
    <div className="admin-atl min-h-screen bg-[#ece6dc] text-[#251d19]">
      <SidebarProvider defaultOpen>
        <Sidebar collapsible="icon" className="border-r border-white/10">
          <SidebarHeader className="p-5">
            <button onClick={() => setLocation("/")} className="group flex items-center gap-3 text-left">
              <img src="/manus-storage/use-brito-mark_b2bb36b9.png" alt="" className="h-9 w-9 object-contain" />
              <span className="group-data-[collapsible=icon]:hidden"><span className="display-font block text-xl leading-none">Use.Brito</span><span className="mt-1 block text-[9px] font-bold uppercase tracking-[0.18em] text-[#e5aa99]">Ateliê admin</span></span>
            </button>
          </SidebarHeader>
          <SidebarContent className="px-3 py-4">
            <SidebarGroup className="p-0">
              <SidebarGroupLabel className="px-3 text-[10px] font-bold uppercase tracking-[0.16em] text-[#e5aa99]/75">Operação</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {navItems.map((item) => {
                    const Icon = item.icon;
                    return <SidebarMenuItem key={item.id}><SidebarMenuButton isActive={activeView === item.id} tooltip={item.label} onClick={() => setActiveView(item.id)} className="h-11 px-3 text-[#f7f1e8] hover:bg-white/10 hover:text-white data-[active=true]:bg-[#b84c33] data-[active=true]:text-white"><Icon /><span>{item.label}</span></SidebarMenuButton>{item.id === "pedidos" && <SidebarMenuBadge className="bg-[#f7f1e8]/10 text-[#f7f1e8]">{orders.filter((order) => order.status !== "Concluído").length}</SidebarMenuBadge>}</SidebarMenuItem>;
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
            <SidebarGroup className="mt-7 p-0">
              <SidebarGroupLabel className="px-3 text-[10px] font-bold uppercase tracking-[0.16em] text-[#e5aa99]/75">Inteligência</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem><SidebarMenuButton tooltip="Relatórios" onClick={() => toast.info("Relatórios detalhados serão disponibilizados com a integração de dados.")} className="h-11 px-3 text-[#f7f1e8] hover:bg-white/10 hover:text-white"><BarChart3 /><span>Relatórios</span></SidebarMenuButton></SidebarMenuItem>
                  <SidebarMenuItem><SidebarMenuButton tooltip="Configurações" onClick={() => toast.info("Configurações do ateliê em preparação.")} className="h-11 px-3 text-[#f7f1e8] hover:bg-white/10 hover:text-white"><Settings2 /><span>Configurações</span></SidebarMenuButton></SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
          <SidebarFooter className="p-3">
            <div className="rounded-sm border border-white/10 bg-white/5 p-3 group-data-[collapsible=icon]:hidden"><p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#e5aa99]">Próxima ação</p><p className="mt-2 text-xs leading-5 text-[#f7f1e8]/75">{lowStock ? `${lowStock} ${lowStock === 1 ? "peça pede" : "peças pedem"} atenção de estoque.` : "Estoque em equilíbrio no momento."}</p></div>
            <button onClick={() => setLocation("/")} className="mt-2 flex w-full items-center gap-2 rounded-sm px-3 py-2 text-xs text-[#f7f1e8]/70 transition-colors hover:bg-white/10 hover:text-white"><ArrowUpRight size={14} /><span className="group-data-[collapsible=icon]:hidden">Ver loja</span></button>
          </SidebarFooter>
        </Sidebar>

        <SidebarInset className="bg-[#ece6dc]">
          <header className="admin-topbar flex h-[72px] items-center justify-between border-b border-[#251d19]/10 bg-[#f4efe7] px-4 sm:px-7">
            <div className="flex items-center gap-3"><SidebarTrigger className="border border-[#251d19]/15 bg-white hover:bg-[#ede4da]" /><div><p className="text-[9px] font-bold uppercase tracking-[0.16em] text-[#b84c33]">Painel do ateliê</p><p className="display-font text-lg leading-5">{viewTitle(activeView)}</p></div></div>
            <div className="flex items-center gap-2 sm:gap-4"><span className="hidden rounded-full border border-[#251d19]/15 bg-white px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.12em] text-[#251d19]/60 md:block">Dados persistentes</span><button onClick={() => toast.info("Você está com tudo em dia.")} className="grid h-9 w-9 place-items-center border border-[#251d19]/15 bg-white transition-colors hover:border-[#b84c33] hover:text-[#b84c33]" aria-label="Notificações"><Bell size={16} /></button><div className="grid h-9 w-9 place-items-center rounded-full bg-[#251d19] text-[10px] font-bold text-white">{user.name?.slice(0, 2).toUpperCase() || "UB"}</div></div>
          </header>

          <div className="mx-auto w-full max-w-[1500px] px-4 py-6 sm:px-7 sm:py-8 lg:px-10">
            {activeView === "visao" && <OverviewView catalog={catalog} orders={orders} setActiveView={setActiveView} openProductDialog={() => openProductDialog()} />}
            {activeView === "pedidos" && <OrdersView orders={orders} onAdvance={changeOrderStatus} />}
            {activeView === "catalogo" && <CatalogView search={search} setSearch={setSearch} catalog={filteredCatalog} totalCatalog={catalog.length} published={published} lowStock={lowStock} onOpenProduct={openProductDialog} onToggleState={toggleProductState} />}
          </div>
        </SidebarInset>
      </SidebarProvider>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="border-[#251d19]/15 bg-[#f4efe7] p-0 sm:max-w-xl">
          <DialogHeader className="border-b border-[#251d19]/10 px-6 py-5"><DialogTitle className="display-font text-3xl">{editing ? "Ajustar peça" : "Novo rascunho"}</DialogTitle><DialogDescription className="text-sm text-[#251d19]/60">{editing ? "Atualize as informações visíveis no catálogo administrativo." : "A peça ficará em rascunho até completar as informações de publicação."}</DialogDescription></DialogHeader>
          <form onSubmit={saveProduct} className="space-y-5 p-6"><label className="block"><span className="admin-field-label">Nome da peça</span><input value={formName} onChange={(event) => setFormName(event.target.value)} required placeholder="Ex.: Calça Horizonte" className="admin-input" /></label><div className="grid gap-5 sm:grid-cols-2"><label className="block"><span className="admin-field-label">Preço</span><input value={formPrice} onChange={(event) => setFormPrice(event.target.value)} required inputMode="decimal" placeholder="389" className="admin-input" /></label><label className="block"><span className="admin-field-label">Categoria</span><select value={formCategory} onChange={(event) => setFormCategory(event.target.value as Category)} className="admin-input">{Object.entries(categoryLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label></div><div className="flex flex-col-reverse gap-3 border-t border-[#251d19]/10 pt-5 sm:flex-row sm:justify-end"><button type="button" onClick={() => setDialogOpen(false)} className="admin-button-ghost">Cancelar</button><button className="admin-button">{editing ? "Salvar alterações" : "Criar rascunho"}<ChevronRight size={15} /></button></div></form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function OverviewView({ catalog, orders, setActiveView, openProductDialog }: { catalog: AdminProduct[]; orders: AdminOrder[]; setActiveView: (view: AdminView) => void; openProductDialog: () => void }) {
  const lowStockProducts = catalog.filter((product) => product.stock < 6);
  const published = catalog.filter((product) => product.state === "Publicado").length;
  const openRequests = orders.filter((order) => order.status !== "Concluído").length;
  const completedRequests = orders.filter((order) => order.status === "Concluído").length;
  const selectedValue = orders.reduce((total, order) => total + order.total, 0);
  const operationalNotes = [
    ["ESTOQUE", lowStockProducts.length ? `${lowStockProducts.length} ${lowStockProducts.length === 1 ? "peça pede" : "peças pedem"} atenção de estoque.` : "Estoque em equilíbrio."],
    ["ATENDIMENTO", openRequests ? `${openRequests} ${openRequests === 1 ? "solicitação aguarda" : "solicitações aguardam"} retorno.` : "Nenhuma solicitação pendente."],
    ["VITRINE", `${published} ${published === 1 ? "peça publicada" : "peças publicadas"} na curadoria.`],
  ];
  return <>
    <section className="admin-hero relative overflow-hidden border border-[#251d19]/15 bg-[#f4efe7] p-6 sm:p-8 lg:p-10"><div className="admin-rule absolute left-0 top-0 h-full w-1 bg-[#b84c33]" /><img src="/manus-storage/use-brito-mark_b2bb36b9.png" alt="" className="absolute -right-5 -top-5 h-32 w-32 opacity-[.08] sm:h-40 sm:w-40" /><div className="relative grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end"><div><p className="admin-kicker">Operação / dados persistentes</p><h1 className="display-font mt-3 max-w-2xl text-4xl leading-[.94] tracking-[-0.04em] sm:text-5xl lg:text-6xl">Tudo que importa para o próximo movimento.</h1><p className="mt-4 max-w-xl text-sm leading-6 text-[#251d19]/65">Uma visão central para curar produto e acompanhar as solicitações que chegaram pelo WhatsApp.</p></div><div className="flex flex-wrap gap-3"><button onClick={() => setActiveView("pedidos")} className="admin-button-ghost"><ClipboardList size={15} /> Ver solicitações</button><button onClick={openProductDialog} className="admin-button"><Plus size={15} /> Nova peça</button></div></div></section>
    <section className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-6"><MetricCard index="01" layout="lead" icon={CircleDollarSign} label="Valor selecionado" value={formatBRL(selectedValue)} detail={`${orders.length} ${orders.length === 1 ? "solicitação registrada" : "solicitações registradas"}`} tone="copper" /><MetricCard index="02" layout="small" icon={ClipboardList} label="Em atendimento" value={`${openRequests}`} detail="Solicitações que ainda pedem retorno" tone="dark" /><MetricCard index="03" layout="small" icon={PackageCheck} label="Peças publicadas" value={`${published}`} detail={`${lowStockProducts.length} com estoque reduzido`} tone="sand" /><MetricCard index="04" layout="wide" icon={UsersRound} label="Atendimentos concluídos" value={`${completedRequests}`} detail="Solicitações já tratadas no painel" tone="clay" /></section>
    <section className="mt-6 grid gap-6 xl:grid-cols-[1.35fr_.65fr]"><div className="admin-panel p-5 sm:p-6"><div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start"><div><p className="admin-kicker">Solicitações recentes</p><h2 className="display-font mt-1 text-3xl">O que chegou à curadoria.</h2></div><span className="inline-flex self-start rounded-full bg-[#f2d8ce] px-3 py-1 text-[10px] font-bold uppercase tracking-[.12em] text-[#8f3f2c]">Banco conectado</span></div><div className="mt-6 divide-y divide-[#251d19]/10 border-y border-[#251d19]/10">{orders.length ? orders.slice(0, 4).map((order) => <div className="flex items-center gap-4 py-4" key={order.id}><div className="grid h-9 w-9 place-items-center rounded-full bg-[#ede4da] text-[#b84c33]"><MessageCircle size={15} /></div><div className="min-w-0 flex-1"><p className="text-sm font-semibold">{order.id}</p><p className="mt-1 text-xs text-[#251d19]/55">{order.items} {order.items === 1 ? "peça selecionada" : "peças selecionadas"} · {order.time}</p></div><p className="text-sm font-semibold">{formatBRL(order.total)}</p></div>) : <div className="py-10 text-center text-sm text-[#251d19]/55">Quando uma pessoa solicitar atendimento pelo WhatsApp, o registro aparecerá aqui.</div>}</div></div><div className="admin-panel relative overflow-hidden bg-[#251d19] p-6 text-[#f7f1e8]"><img src="/manus-storage/use-brito-mark_b2bb36b9.png" alt="" className="absolute -right-3 -top-3 h-24 w-24 opacity-[.16]" /><p className="admin-kicker text-[#e5aa99]">Pulso do ateliê</p><h2 className="display-font relative mt-2 text-3xl leading-none">{lowStockProducts.length ? `${lowStockProducts.length} ${lowStockProducts.length === 1 ? "peça pede" : "peças pedem"} atenção.` : "Estoque em equilíbrio."}</h2><div className="relative mt-7 space-y-4">{lowStockProducts.length ? lowStockProducts.slice(0, 3).map((product) => <div key={product.id} className="flex items-center gap-3 border-b border-white/10 pb-3"><img src={product.image} alt="" className="h-10 w-9 object-cover" /><div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold">{product.name}</p><p className="mt-0.5 text-xs text-white/55">{product.stock} unidades no estoque</p></div><span className="h-2 w-2 rounded-full bg-[#e5aa99]" /></div>) : <p className="text-sm leading-6 text-white/60">Nenhuma peça publicada está abaixo do estoque de atenção.</p>}</div><button onClick={() => setActiveView("catalogo")} className="relative mt-6 inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-[.14em] text-[#e5aa99] hover:text-white">Abrir catálogo <ArrowUpRight size={14} /></button></div></section>
    <section className="mt-6 grid gap-6 xl:grid-cols-[.9fr_1.1fr]"><div className="admin-panel overflow-hidden"><div className="flex items-center justify-between border-b border-[#251d19]/10 p-5 sm:p-6"><div><p className="admin-kicker">Operação</p><h2 className="display-font mt-1 text-2xl">Próximos passos.</h2></div><button onClick={() => setActiveView("catalogo")} className="grid h-9 w-9 place-items-center border border-[#251d19]/15 hover:border-[#b84c33] hover:text-[#b84c33]" aria-label="Abrir catálogo"><ArrowUpRight size={17} /></button></div><div className="divide-y divide-[#251d19]/10">{operationalNotes.map(([label, action]) => <div className="flex gap-4 p-5" key={label}><div className="w-20 shrink-0"><p className="text-[10px] font-bold uppercase tracking-[.12em] text-[#b84c33]">{label}</p></div><p className="border-l border-[#b84c33] pl-4 text-sm leading-5">{action}</p></div>)}</div></div><RecentOrders orders={orders} onAdvance={() => setActiveView("pedidos")} /></section>
  </>;
}

function MetricCard({ index, layout, icon: Icon, label, value, detail, tone }: { index: string; layout: "lead" | "small" | "wide"; icon: typeof CircleDollarSign; label: string; value: string; detail: string; tone: "copper" | "dark" | "sand" | "clay" }) {
  return <article className={`metric-card metric-${tone} metric-${layout} relative overflow-hidden border border-[#251d19]/12 p-5`}><span className="metric-index">{index} / MÉTRICA</span><Icon size={18} className="relative text-[#b84c33]" /><p className="relative mt-6 text-[10px] font-bold uppercase tracking-[.14em] text-[#251d19]/55">{label}</p><p className="display-font relative mt-2 text-4xl tracking-[-.03em]">{value}</p><p className="relative mt-2 text-xs text-[#251d19]/60">{detail}</p></article>;
}

function RecentOrders({ orders, onAdvance }: { orders: AdminOrder[]; onAdvance: () => void }) {
  return <section className="admin-panel overflow-hidden"><div className="flex items-center justify-between border-b border-[#251d19]/10 p-5 sm:p-6"><div><p className="admin-kicker">Solicitações recentes</p><h2 className="display-font mt-1 text-2xl">Chegando pelo WhatsApp.</h2></div><button onClick={onAdvance} className="text-[10px] font-bold uppercase tracking-[.13em] text-[#b84c33] hover:underline">Ver todas</button></div><div className="divide-y divide-[#251d19]/10">{orders.length ? orders.slice(0, 3).map((order) => <div className="flex items-center gap-3 p-4 sm:p-5" key={order.id}><div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[#ede4da] text-[#b84c33]"><ShoppingBag size={15} /></div><div className="min-w-0 flex-1"><p className="text-sm font-semibold">{order.id} <span className="font-normal text-[#251d19]/45">Solicitação via WhatsApp</span></p><p className="mt-1 text-xs text-[#251d19]/55">{order.items} {order.items === 1 ? "peça" : "peças"} · {order.time}</p></div><p className="hidden text-sm font-semibold sm:block">{formatBRL(order.total)}</p><span className={`hidden rounded-full px-2 py-1 text-[9px] font-bold uppercase tracking-[.1em] md:block ${statusClasses[order.status]}`}>{order.status}</span></div>) : <div className="px-5 py-10 text-center text-sm text-[#251d19]/55">Nenhuma solicitação registrada ainda.</div>}</div></section>;
}

function OrdersView({ orders, onAdvance }: { orders: AdminOrder[]; onAdvance: (id: string) => void }) {
  const pending = orders.filter((order) => order.status === "Em análise").length;
  const contacted = orders.filter((order) => order.status === "Contato iniciado").length;
  const completed = orders.filter((order) => order.status === "Concluído").length;
  return <><section className="admin-view-header"><div><p className="admin-kicker">Fluxo de solicitações</p><h1 className="display-font mt-2 text-4xl tracking-[-.04em] sm:text-5xl">Toda escolha tem um próximo passo.</h1><p className="mt-3 max-w-2xl text-sm leading-6 text-[#251d19]/65">Acompanhe o que chegou pelo WhatsApp e registre o avanço de cada conversa no ateliê.</p></div><div className="admin-counter"><span>{orders.length}</span><p>Solicitações no painel</p></div></section><section className="mt-6 grid gap-4 sm:grid-cols-3"><ProgressCard count={String(pending)} label="Em análise" icon={Eye} /><ProgressCard count={String(contacted)} label="Contato iniciado" icon={Boxes} /><ProgressCard count={String(completed)} label="Concluídas" icon={Archive} /></section><section className="admin-panel mt-6 overflow-hidden"><div className="flex flex-col gap-4 border-b border-[#251d19]/10 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6"><div><p className="admin-kicker">Fila de atendimento</p><h2 className="display-font mt-1 text-3xl">Solicitações em curso.</h2></div></div>{orders.length ? <Table><TableHeader><TableRow className="hover:bg-transparent"><TableHead className="pl-5 text-[10px] font-bold uppercase tracking-[.13em] text-[#251d19]/50">Referência</TableHead><TableHead className="text-[10px] font-bold uppercase tracking-[.13em] text-[#251d19]/50">Origem</TableHead><TableHead className="text-[10px] font-bold uppercase tracking-[.13em] text-[#251d19]/50">Seleção</TableHead><TableHead className="text-[10px] font-bold uppercase tracking-[.13em] text-[#251d19]/50">Etapa</TableHead><TableHead className="pr-5 text-right text-[10px] font-bold uppercase tracking-[.13em] text-[#251d19]/50">Ação</TableHead></TableRow></TableHeader><TableBody>{orders.map((order) => <TableRow key={order.id} className="border-[#251d19]/10"><TableCell className="pl-5 font-semibold">{order.id}<span className="mt-1 block text-xs font-normal text-[#251d19]/50">{order.time}</span></TableCell><TableCell><span className="font-medium">WhatsApp</span><span className="mt-1 block text-xs text-[#251d19]/50">{order.items} {order.items === 1 ? "peça" : "peças"}</span></TableCell><TableCell className="font-semibold">{formatBRL(order.total)}</TableCell><TableCell><span className={`inline-flex rounded-full px-2.5 py-1 text-[9px] font-bold uppercase tracking-[.1em] ${statusClasses[order.status]}`}>{order.status}</span></TableCell><TableCell className="pr-5 text-right"><button onClick={() => onAdvance(order.id)} className="admin-table-action">Avançar <ChevronRight size={14} /></button></TableCell></TableRow>)}</TableBody></Table> : <div className="px-6 py-16 text-center text-sm text-[#251d19]/60">Ainda não há solicitações registradas. Quando alguém iniciar o atendimento pela sacola, ela aparecerá aqui.</div>}</section></>;
}

function ProgressCard({ count, label, icon: Icon }: { count: string; label: string; icon: typeof Eye }) { return <div className="progress-card border border-[#251d19]/12 bg-[#f4efe7] p-5"><Icon size={17} className="text-[#b84c33]" /><p className="display-font mt-5 text-4xl">{count}</p><p className="mt-1 text-xs font-bold uppercase tracking-[.13em] text-[#251d19]/55">{label}</p></div>; }

function CatalogView({ search, setSearch, catalog, totalCatalog, published, lowStock, onOpenProduct, onToggleState }: { search: string; setSearch: (value: string) => void; catalog: AdminProduct[]; totalCatalog: number; published: number; lowStock: number; onOpenProduct: (product?: AdminProduct) => void; onToggleState: (id: number) => void }) {
  return <><section className="admin-view-header"><div><p className="admin-kicker">Curadoria de produto</p><h1 className="display-font mt-2 text-4xl tracking-[-.04em] sm:text-5xl">A arara do ateliê, vista por dentro.</h1><p className="mt-3 max-w-2xl text-sm leading-6 text-[#251d19]/65">Edite informações essenciais, acompanhe estoque e decida o que entra no próximo capítulo.</p></div><button onClick={() => onOpenProduct()} className="admin-button"><Plus size={15} /> Nova peça</button></section><section className="mt-6 grid gap-4 sm:grid-cols-3"><ProgressCard count={String(totalCatalog)} label="Peças cadastradas" icon={ShoppingBag} /><ProgressCard count={String(published)} label="Disponíveis na loja" icon={PackageCheck} /><ProgressCard count={String(lowStock)} label="Estoque reduzido" icon={Tag} /></section><section className="admin-panel mt-6 overflow-hidden"><div className="flex flex-col gap-4 border-b border-[#251d19]/10 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6"><div><p className="admin-kicker">Catálogo atual</p><h2 className="display-font mt-1 text-3xl">Peças em curadoria.</h2></div><label className="admin-search"><Search size={15} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar peça" /></label></div><div className="divide-y divide-[#251d19]/10">{catalog.map((product) => <article className="grid gap-4 p-4 sm:grid-cols-[72px_1fr_auto] sm:items-center sm:gap-5 sm:p-5" key={product.id}><img src={product.image} alt={product.name} className="h-24 w-full object-cover sm:h-20 sm:w-[72px]" /><div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><p className="text-sm font-semibold">{product.name}</p><span className={`rounded-full px-2 py-1 text-[9px] font-bold uppercase tracking-[.1em] ${product.state === "Publicado" ? "bg-[#dce7e1] text-[#235b49]" : "bg-[#e1ddd5] text-[#5d5249]"}`}>{product.state}</span></div><div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-[#251d19]/55"><span>{categoryLabels[product.category]}</span><span>{formatBRL(product.price)}</span><span className={product.stock < 6 ? "font-bold text-[#b84c33]" : ""}>{product.stock} em estoque</span></div></div><div className="flex flex-wrap gap-2 sm:justify-end"><button onClick={() => onOpenProduct(product)} className="admin-table-action">Editar</button><button onClick={() => onToggleState(product.id)} className="admin-table-action">{product.state === "Publicado" ? "Despublicar" : "Publicar"}</button></div></article>)}</div></section></>;
}

function CampaignView() {
  const [active, setActive] = useState([true, false, true]);
  const campaigns = [
    { title: "Capítulo 01 — Texturas", window: "Vitrine principal", image: "/manus-storage/use-brito-hero_a051fd2a.jpg", detail: "Hero e e-mail de boas-vindas" },
    { title: "A arara da alfaiataria", window: "Aguarda programação", image: "/manus-storage/use-brito-editorial-jacket_355d7a64.webp", detail: "Coleção e página de categoria" },
    { title: "Tramas para ficar", window: "Vitrine secundária", image: "/manus-storage/use-brito-editorial-knit_54d2459a.jpeg", detail: "Newsletter e campanha de retorno" },
  ];
  return <><section className="admin-view-header"><div><p className="admin-kicker">Narrativas de coleção</p><h1 className="display-font mt-2 text-4xl tracking-[-.04em] sm:text-5xl">As campanhas que guiam a vitrine.</h1><p className="mt-3 max-w-2xl text-sm leading-6 text-[#251d19]/65">Organize os capítulos visuais da loja e mantenha a experiência comercial fiel à história que você quer contar.</p></div><button onClick={() => toast.info("Uma nova campanha pode ser criada quando os materiais estiverem definidos.")} className="admin-button"><Plus size={15} /> Nova campanha</button></section><section className="mt-6 grid gap-5 lg:grid-cols-3">{campaigns.map((campaign, index) => <article key={campaign.title} className="campaign-card overflow-hidden border border-[#251d19]/15 bg-[#f4efe7]"><div className="relative"><img src={campaign.image} alt="" className="aspect-[4/3] w-full object-cover" /><span className="absolute left-3 top-3 bg-[#f4efe7]/95 px-2 py-1 text-[9px] font-bold uppercase tracking-[.13em] text-[#251d19]">0{index + 1} / campanha</span></div><div className="p-5"><p className="admin-kicker">{campaign.window}</p><h2 className="display-font mt-2 text-3xl leading-[.95]">{campaign.title}</h2><p className="mt-3 text-xs leading-5 text-[#251d19]/60">{campaign.detail}</p><div className="mt-5 flex items-center justify-between border-t border-[#251d19]/10 pt-4"><span className={`rounded-full px-2.5 py-1 text-[9px] font-bold uppercase tracking-[.1em] ${active[index] ? "bg-[#dce7e1] text-[#235b49]" : "bg-[#e1ddd5] text-[#5d5249]"}`}>{active[index] ? "No ar" : "Rascunho"}</span><button onClick={() => { setActive((current) => current.map((item, itemIndex) => itemIndex === index ? !item : item)); toast.success(active[index] ? "Campanha pausada." : "Campanha ativada."); }} className="admin-table-action">{active[index] ? "Pausar" : "Ativar"}</button></div></div></article>)}</section><section className="admin-campaign-note mt-6 grid gap-5 border border-[#b84c33]/30 bg-[#f2d8ce] p-6 md:grid-cols-[auto_1fr_auto] md:items-center"><div className="grid h-11 w-11 place-items-center rounded-full bg-[#b84c33] text-white"><TrendingUp size={19} /></div><div><p className="text-sm font-semibold">Seu próximo capítulo pode começar pela curadoria.</p><p className="mt-1 text-xs leading-5 text-[#251d19]/65">Defina a imagem, o recorte de peças e a mensagem; depois conecte a campanha a uma data real de publicação.</p></div><button onClick={() => toast.info("Calendário de campanhas disponível após a integração operacional.")} className="admin-button-ghost self-start md:self-auto">Ver calendário</button></section></>;
}

function viewTitle(view: AdminView) { return ({ visao: "Visão geral", pedidos: "Pedidos", catalogo: "Catálogo", campanhas: "Campanhas" } as Record<AdminView, string>)[view]; }
