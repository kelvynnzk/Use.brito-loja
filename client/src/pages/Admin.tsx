/**
 * Direção visual: Ateliê de Concreto — o bastidor administrativo traduz a loja em uma mesa de
 * curadoria: café profundo, painéis de papel mineral, cobre para estados e dados com hierarquia editorial.
 */
import { FormEvent, useMemo, useState } from "react";
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";
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
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { categoryLabels, formatBRL, products, type Category, type Product } from "@/data/products";

type AdminView = "visao" | "pedidos" | "catalogo" | "campanhas";
type AdminProduct = Product & { stock: number; state: "Publicado" | "Rascunho" };
type OrderStatus = "Em análise" | "Separação" | "Enviado" | "Concluído";
type AdminOrder = { id: string; customer: string; items: number; total: number; time: string; status: OrderStatus };

const navItems: { id: AdminView; label: string; icon: typeof LayoutDashboard }[] = [
  { id: "visao", label: "Visão geral", icon: LayoutDashboard },
  { id: "pedidos", label: "Pedidos", icon: ClipboardList },
  { id: "catalogo", label: "Catálogo", icon: ShoppingBag },
  { id: "campanhas", label: "Campanhas", icon: Sparkles },
];

const initialProducts: AdminProduct[] = products.map((product, index) => ({
  ...product,
  stock: [12, 8, 4, 15, 6, 17, 3, 9][index],
  state: index === 7 ? "Rascunho" : "Publicado",
}));

const initialOrders: AdminOrder[] = [
  { id: "#UB-1048", customer: "Lívia A.", items: 2, total: 738, time: "há 12 min", status: "Em análise" },
  { id: "#UB-1047", customer: "Marina R.", items: 1, total: 529, time: "há 31 min", status: "Separação" },
  { id: "#UB-1046", customer: "Carolina M.", items: 3, total: 757, time: "há 1 h", status: "Enviado" },
  { id: "#UB-1045", customer: "Helena S.", items: 1, total: 389, time: "há 2 h", status: "Concluído" },
];

const performance = [
  { day: "Seg", value: 1680 },
  { day: "Ter", value: 2340 },
  { day: "Qua", value: 1920 },
  { day: "Qui", value: 2860 },
  { day: "Sex", value: 3140 },
  { day: "Hoje", value: 2480 },
];

const chartConfig = { value: { label: "GMV ilustrativo", color: "#b84c33" } } satisfies ChartConfig;

const statusClasses: Record<OrderStatus, string> = {
  "Em análise": "bg-[#f2d8ce] text-[#8f3f2c]",
  Separação: "bg-[#f2e8bc] text-[#6d5414]",
  Enviado: "bg-[#dce7e1] text-[#235b49]",
  Concluído: "bg-[#e1ddd5] text-[#5d5249]",
};

export default function Admin() {
  const [, setLocation] = useLocation();
  const [activeView, setActiveView] = useState<AdminView>("visao");
  const [catalog, setCatalog] = useState<AdminProduct[]>(initialProducts);
  const [orders, setOrders] = useState<AdminOrder[]>(initialOrders);
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<AdminProduct | null>(null);
  const [formName, setFormName] = useState("");
  const [formPrice, setFormPrice] = useState("");
  const [formCategory, setFormCategory] = useState<Category>("vestidos");

  const published = catalog.filter((product) => product.state === "Publicado").length;
  const lowStock = catalog.filter((product) => product.stock < 6).length;
  const filteredCatalog = useMemo(() => {
    const needle = search.trim().toLocaleLowerCase("pt-BR");
    if (!needle) return catalog;
    return catalog.filter((product) => `${product.name} ${categoryLabels[product.category]}`.toLocaleLowerCase("pt-BR").includes(needle));
  }, [catalog, search]);

  const openProductDialog = (product?: AdminProduct) => {
    setEditing(product ?? null);
    setFormName(product?.name ?? "");
    setFormPrice(product ? String(product.price) : "");
    setFormCategory(product?.category ?? "vestidos");
    setDialogOpen(true);
  };

  const saveProduct = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!formName.trim() || !formPrice) return;
    if (editing) {
      setCatalog((current) => current.map((product) => product.id === editing.id ? { ...product, name: formName.trim(), price: Number(formPrice), category: formCategory } : product));
      toast.success("Peça atualizada no catálogo administrativo.");
    } else {
      const newProduct: AdminProduct = {
        id: Date.now(),
        slug: `rascunho-${Date.now()}`,
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
      };
      setCatalog((current) => [newProduct, ...current]);
      toast.success("Novo rascunho salvo.", { description: "Complete imagem, estoque e descrição antes de publicar." });
    }
    setDialogOpen(false);
  };

  const toggleProductState = (id: number) => {
    setCatalog((current) => current.map((product) => product.id === id ? { ...product, state: product.state === "Publicado" ? "Rascunho" : "Publicado" } : product));
    toast.success("Status da peça atualizado.");
  };

  const changeOrderStatus = (id: string) => {
    const flow: OrderStatus[] = ["Em análise", "Separação", "Enviado", "Concluído"];
    setOrders((current) => current.map((order) => {
      if (order.id !== id) return order;
      const next = flow[(flow.indexOf(order.status) + 1) % flow.length];
      return { ...order, status: next };
    }));
    toast.success("Pedido movido para a próxima etapa.");
  };

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
                    return <SidebarMenuItem key={item.id}><SidebarMenuButton isActive={activeView === item.id} tooltip={item.label} onClick={() => setActiveView(item.id)} className="h-11 px-3 text-[#f7f1e8] hover:bg-white/10 hover:text-white data-[active=true]:bg-[#b84c33] data-[active=true]:text-white"><Icon /><span>{item.label}</span></SidebarMenuButton>{item.id === "pedidos" && <SidebarMenuBadge className="bg-[#f7f1e8]/10 text-[#f7f1e8]">3</SidebarMenuBadge>}</SidebarMenuItem>;
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
            <div className="rounded-sm border border-white/10 bg-white/5 p-3 group-data-[collapsible=icon]:hidden"><p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#e5aa99]">Próxima ação</p><p className="mt-2 text-xs leading-5 text-[#f7f1e8]/75">Revise as 3 peças com estoque reduzido antes do próximo capítulo.</p></div>
            <button onClick={() => setLocation("/")} className="mt-2 flex w-full items-center gap-2 rounded-sm px-3 py-2 text-xs text-[#f7f1e8]/70 transition-colors hover:bg-white/10 hover:text-white"><ArrowUpRight size={14} /><span className="group-data-[collapsible=icon]:hidden">Ver loja</span></button>
          </SidebarFooter>
        </Sidebar>

        <SidebarInset className="bg-[#ece6dc]">
          <header className="admin-topbar flex h-[72px] items-center justify-between border-b border-[#251d19]/10 bg-[#f4efe7] px-4 sm:px-7">
            <div className="flex items-center gap-3"><SidebarTrigger className="border border-[#251d19]/15 bg-white hover:bg-[#ede4da]" /><div><p className="text-[9px] font-bold uppercase tracking-[0.16em] text-[#b84c33]">Painel do ateliê</p><p className="display-font text-lg leading-5">{viewTitle(activeView)}</p></div></div>
            <div className="flex items-center gap-2 sm:gap-4"><span className="hidden rounded-full border border-[#251d19]/15 bg-white px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.12em] text-[#251d19]/60 md:block">Dados demonstrativos</span><button onClick={() => toast.info("Você está com tudo em dia.")} className="grid h-9 w-9 place-items-center border border-[#251d19]/15 bg-white transition-colors hover:border-[#b84c33] hover:text-[#b84c33]" aria-label="Notificações"><Bell size={16} /></button><div className="grid h-9 w-9 place-items-center rounded-full bg-[#251d19] text-[10px] font-bold text-white">UB</div></div>
          </header>

          <div className="mx-auto w-full max-w-[1500px] px-4 py-6 sm:px-7 sm:py-8 lg:px-10">
            {activeView === "visao" && <OverviewView catalog={catalog} orders={orders} setActiveView={setActiveView} openProductDialog={() => openProductDialog()} />}
            {activeView === "pedidos" && <OrdersView orders={orders} onAdvance={changeOrderStatus} />}
            {activeView === "catalogo" && <CatalogView search={search} setSearch={setSearch} catalog={filteredCatalog} totalCatalog={catalog.length} published={published} lowStock={lowStock} onOpenProduct={openProductDialog} onToggleState={toggleProductState} />}
            {activeView === "campanhas" && <CampaignView />}
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
  return <>
    <section className="admin-hero relative overflow-hidden border border-[#251d19]/15 bg-[#f4efe7] p-6 sm:p-8 lg:p-10"><div className="admin-rule absolute left-0 top-0 h-full w-1 bg-[#b84c33]" /><img src="/manus-storage/use-brito-mark_b2bb36b9.png" alt="" className="absolute -right-5 -top-5 h-32 w-32 opacity-[.08] sm:h-40 sm:w-40" /><div className="relative grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end"><div><p className="admin-kicker">Operação / 01</p><h1 className="display-font mt-3 max-w-2xl text-4xl leading-[.94] tracking-[-0.04em] sm:text-5xl lg:text-6xl">Tudo que importa para o próximo movimento.</h1><p className="mt-4 max-w-xl text-sm leading-6 text-[#251d19]/65">Uma visão central para curar produto, acompanhar pedidos e manter o ateliê em ritmo. Os indicadores abaixo são ilustrações do painel.</p></div><div className="flex flex-wrap gap-3"><button onClick={() => setActiveView("pedidos")} className="admin-button-ghost"><ClipboardList size={15} /> Ver pedidos</button><button onClick={openProductDialog} className="admin-button"><Plus size={15} /> Nova peça</button></div></div></section>
    <section className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-6"><MetricCard index="01" layout="lead" icon={CircleDollarSign} label="Performance ilustrativa" value="R$ 12.480" detail="+18,4% vs. período anterior" tone="copper" /><MetricCard index="02" layout="small" icon={ClipboardList} label="Pedidos em fluxo" value={`${orders.length}`} detail="2 aguardam conferência" tone="dark" /><MetricCard index="03" layout="small" icon={PackageCheck} label="Peças publicadas" value={`${catalog.filter((product) => product.state === "Publicado").length}`} detail="3 com atenção de estoque" tone="sand" /><MetricCard index="04" layout="wide" icon={UsersRound} label="Novas clientes" value="42" detail="+9 desde a última semana" tone="clay" /></section>
    <section className="mt-6 grid gap-6 xl:grid-cols-[1.35fr_.65fr]"><div className="admin-panel p-5 sm:p-6"><div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start"><div><p className="admin-kicker">Ritmo de pedidos</p><h2 className="display-font mt-1 text-3xl">Uma semana em movimento.</h2></div><span className="inline-flex self-start rounded-full bg-[#f2d8ce] px-3 py-1 text-[10px] font-bold uppercase tracking-[.12em] text-[#8f3f2c]">Prévia local</span></div><ChartContainer config={chartConfig} className="mt-5 h-[250px] w-full"><AreaChart data={performance} margin={{ left: -20, right: 0, top: 12 }}><defs><linearGradient id="gmvFill" x1="0" x2="0" y1="0" y2="1"><stop offset="5%" stopColor="#b84c33" stopOpacity={0.28} /><stop offset="95%" stopColor="#b84c33" stopOpacity={0} /></linearGradient></defs><CartesianGrid vertical={false} stroke="#251d19" strokeOpacity={0.08} /><XAxis dataKey="day" axisLine={false} tickLine={false} tickMargin={10} /><ChartTooltip cursor={{ stroke: "#b84c33", strokeWidth: 1 }} content={<ChartTooltipContent formatter={(value) => formatBRL(Number(value))} />} /><Area type="monotone" dataKey="value" stroke="#b84c33" strokeWidth={2.2} fill="url(#gmvFill)" /></AreaChart></ChartContainer></div><div className="admin-panel relative overflow-hidden bg-[#251d19] p-6 text-[#f7f1e8]"><img src="/manus-storage/use-brito-mark_b2bb36b9.png" alt="" className="absolute -right-3 -top-3 h-24 w-24 opacity-[.16]" /><p className="admin-kicker text-[#e5aa99]">Pulso do ateliê</p><h2 className="display-font relative mt-2 text-3xl leading-none">Três peças pedem atenção.</h2><div className="relative mt-7 space-y-4">{catalog.filter((product) => product.stock < 6).slice(0, 3).map((product) => <div key={product.id} className="flex items-center gap-3 border-b border-white/10 pb-3"><img src={product.image} alt="" className="h-10 w-9 object-cover" /><div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold">{product.name}</p><p className="mt-0.5 text-xs text-white/55">{product.stock} unidades no estoque</p></div><span className="h-2 w-2 rounded-full bg-[#e5aa99]" /></div>)}</div><button onClick={() => setActiveView("catalogo")} className="relative mt-6 inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-[.14em] text-[#e5aa99] hover:text-white">Abrir catálogo <ArrowUpRight size={14} /></button></div></section>
    <section className="mt-6 grid gap-6 xl:grid-cols-[.9fr_1.1fr]"><div className="admin-panel overflow-hidden"><div className="flex items-center justify-between border-b border-[#251d19]/10 p-5 sm:p-6"><div><p className="admin-kicker">Agenda</p><h2 className="display-font mt-1 text-2xl">Próximos passos.</h2></div><button onClick={() => toast.info("Agenda integrada em uma futura conexão de operações.")} className="grid h-9 w-9 place-items-center border border-[#251d19]/15 hover:border-[#b84c33] hover:text-[#b84c33]" aria-label="Ver agenda"><MoreHorizontal size={17} /></button></div><div className="divide-y divide-[#251d19]/10">{[["Hoje", "16:00", "Revisar as peças com estoque reduzido"], ["Amanhã", "10:30", "Preparar capítulo de alfaiataria"], ["Sexta", "14:00", "Conferir pedidos em separação"]].map(([day, hour, action]) => <div className="flex gap-4 p-5" key={action}><div className="w-12 shrink-0"><p className="text-[10px] font-bold uppercase tracking-[.12em] text-[#b84c33]">{day}</p><p className="mt-1 text-xs text-[#251d19]/55">{hour}</p></div><p className="border-l border-[#b84c33] pl-4 text-sm leading-5">{action}</p></div>)}</div></div><RecentOrders orders={orders} onAdvance={() => setActiveView("pedidos")} /></section>
  </>;
}

function MetricCard({ index, layout, icon: Icon, label, value, detail, tone }: { index: string; layout: "lead" | "small" | "wide"; icon: typeof CircleDollarSign; label: string; value: string; detail: string; tone: "copper" | "dark" | "sand" | "clay" }) {
  return <article className={`metric-card metric-${tone} metric-${layout} relative overflow-hidden border border-[#251d19]/12 p-5`}><span className="metric-index">{index} / MÉTRICA</span><Icon size={18} className="relative text-[#b84c33]" /><p className="relative mt-6 text-[10px] font-bold uppercase tracking-[.14em] text-[#251d19]/55">{label}</p><p className="display-font relative mt-2 text-4xl tracking-[-.03em]">{value}</p><p className="relative mt-2 text-xs text-[#251d19]/60">{detail}</p></article>;
}

function RecentOrders({ orders, onAdvance }: { orders: AdminOrder[]; onAdvance: () => void }) {
  return <section className="admin-panel overflow-hidden"><div className="flex items-center justify-between border-b border-[#251d19]/10 p-5 sm:p-6"><div><p className="admin-kicker">Pedidos recentes</p><h2 className="display-font mt-1 text-2xl">Chegando agora.</h2></div><button onClick={onAdvance} className="text-[10px] font-bold uppercase tracking-[.13em] text-[#b84c33] hover:underline">Ver todos</button></div><div className="divide-y divide-[#251d19]/10">{orders.slice(0, 3).map((order) => <div className="flex items-center gap-3 p-4 sm:p-5" key={order.id}><div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[#ede4da] text-[#b84c33]"><ShoppingBag size={15} /></div><div className="min-w-0 flex-1"><p className="text-sm font-semibold">{order.customer} <span className="font-normal text-[#251d19]/45">{order.id}</span></p><p className="mt-1 text-xs text-[#251d19]/55">{order.items} {order.items === 1 ? "peça" : "peças"} · {order.time}</p></div><p className="hidden text-sm font-semibold sm:block">{formatBRL(order.total)}</p><span className={`hidden rounded-full px-2 py-1 text-[9px] font-bold uppercase tracking-[.1em] md:block ${statusClasses[order.status]}`}>{order.status}</span></div>)}</div></section>;
}

function OrdersView({ orders, onAdvance }: { orders: AdminOrder[]; onAdvance: (id: string) => void }) {
  return <><section className="admin-view-header"><div><p className="admin-kicker">Fluxo de pedidos</p><h1 className="display-font mt-2 text-4xl tracking-[-.04em] sm:text-5xl">Toda escolha tem um próximo passo.</h1><p className="mt-3 max-w-2xl text-sm leading-6 text-[#251d19]/65">Acompanhe o que entrou no ateliê e mova cada pedido pelo seu caminho. Informações apresentadas são demonstrativas.</p></div><div className="admin-counter"><span>4</span><p>Pedidos no painel</p></div></section><section className="mt-6 grid gap-4 sm:grid-cols-3"><ProgressCard count="2" label="Em análise" icon={Eye} /><ProgressCard count="1" label="Em separação" icon={Boxes} /><ProgressCard count="1" label="Em rota" icon={Archive} /></section><section className="admin-panel mt-6 overflow-hidden"><div className="flex flex-col gap-4 border-b border-[#251d19]/10 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6"><div><p className="admin-kicker">Fila operacional</p><h2 className="display-font mt-1 text-3xl">Pedidos em curso.</h2></div><button onClick={() => toast.info("A exportação será liberada após conectar uma plataforma de pedidos.")} className="admin-button-ghost self-start"><Archive size={15} /> Exportar lista</button></div><Table><TableHeader><TableRow className="hover:bg-transparent"><TableHead className="pl-5 text-[10px] font-bold uppercase tracking-[.13em] text-[#251d19]/50">Pedido</TableHead><TableHead className="text-[10px] font-bold uppercase tracking-[.13em] text-[#251d19]/50">Cliente</TableHead><TableHead className="text-[10px] font-bold uppercase tracking-[.13em] text-[#251d19]/50">Total</TableHead><TableHead className="text-[10px] font-bold uppercase tracking-[.13em] text-[#251d19]/50">Etapa</TableHead><TableHead className="pr-5 text-right text-[10px] font-bold uppercase tracking-[.13em] text-[#251d19]/50">Ação</TableHead></TableRow></TableHeader><TableBody>{orders.map((order) => <TableRow key={order.id} className="border-[#251d19]/10"><TableCell className="pl-5 font-semibold">{order.id}<span className="mt-1 block text-xs font-normal text-[#251d19]/50">{order.time}</span></TableCell><TableCell><span className="font-medium">{order.customer}</span><span className="mt-1 block text-xs text-[#251d19]/50">{order.items} {order.items === 1 ? "peça" : "peças"}</span></TableCell><TableCell className="font-semibold">{formatBRL(order.total)}</TableCell><TableCell><span className={`inline-flex rounded-full px-2.5 py-1 text-[9px] font-bold uppercase tracking-[.1em] ${statusClasses[order.status]}`}>{order.status}</span></TableCell><TableCell className="pr-5 text-right"><button onClick={() => onAdvance(order.id)} className="admin-table-action">Avançar <ChevronRight size={14} /></button></TableCell></TableRow>)}</TableBody></Table></section></>;
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
