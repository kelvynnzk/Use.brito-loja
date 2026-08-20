/**
 * Direção visual: Ateliê de Concreto — a aplicação organiza um fluxo de compra editorial,
 * com páginas abertas, acentos minerais e rotas sem becos de navegação.
 */
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Route, Switch, useRoute } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { CartProvider } from "./contexts/CartContext";
import { SiteShell } from "./components/SiteShell";
import Cart from "./pages/Cart";
import Catalog from "./pages/Catalog";
import Contact from "./pages/Contact";
import Home from "./pages/Home";
import NotFound from "./pages/NotFound";
import ProductDetail from "./pages/ProductDetail";
import Admin from "./pages/Admin";
function Router() {
  const [isAdmin] = useRoute("/admin");
  if (isAdmin) return <Admin />;

  return (
    <SiteShell>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/catalogo" component={Catalog} />
        <Route path="/produto/:slug" component={ProductDetail} />
        <Route path="/carrinho" component={Cart} />
        <Route path="/checkout" component={Cart} />
        <Route path="/contato" component={Contact} />
        <Route path="/404" component={NotFound} />
        <Route component={NotFound} />
      </Switch>
    </SiteShell>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <TooltipProvider>
        <CartProvider>
          <Toaster position="bottom-right" richColors />
          <Router />
        </CartProvider>
      </TooltipProvider>
    </ErrorBoundary>
  );
}

export default App;
