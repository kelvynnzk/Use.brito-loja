import { describe, expect, it } from "vitest";
import { buildCatalogWhatsAppMessage, buildWhatsAppUrl } from "../shared/catalogMessage";
import { eq } from "drizzle-orm";
import { catalogProducts } from "../drizzle/schema";
import { getDb } from "./db";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

/** Garante que a mensagem recebida pelo ateliê carregue referência, itens, tamanhos e subtotal. */
describe("buildCatalogWhatsAppMessage", () => {
  it("includes the reference, each selected item and the correct subtotal", () => {
    const message = buildCatalogWhatsAppMessage({
      reference: "UB-AB12CD",
      items: [
        { name: "Vestido Aurora", size: "M", quantity: 2, unitPriceCents: 38900 },
        { name: "Blazer Selva", size: "P", quantity: 1, unitPriceCents: 52900 },
      ],
      subtotalCents: 130700,
    });

    expect(message).toContain("Referência: UB-AB12CD");
    expect(message).toContain("2× Vestido Aurora — Tam. M — R$ 778,00");
    expect(message).toContain("1× Blazer Selva — Tam. P — R$ 529,00");
    expect(message).toContain("Subtotal da seleção: R$ 1.307,00");
  });
});

/** Verifica a sanitização do telefone e a codificação segura do texto na URL wa.me. */
describe("buildWhatsAppUrl", () => {
  it("normalizes the destination number and URL-encodes the generated message", () => {
    expect(buildWhatsAppUrl("55 (21) 96591-7831", "Olá, Use.Brito!\nVestido Aurora")).toBe(
      "https://wa.me/5521965917831?text=Ol%C3%A1%2C%20Use.Brito!%0AVestido%20Aurora",
    );
  });
});

/**
 * Teste de integração do painel protegido.
 * O registro temporário é removido no finally para não permanecer no catálogo real após a validação.
 */
describe("admin catalog persistence", () => {
  it("persists an authorized product update and cleans up the controlled record", async () => {
    const db = await getDb();
    if (!db) throw new Error("Banco de dados indisponível para o teste de integração.");

    const slug = `teste-integracao-${Date.now()}`;
    // Contexto controlado com papel admin para executar a mesma mutação usada pela interface.
    const ctx: TrpcContext = {
      user: {
        id: 1,
        openId: "admin-test",
        email: "admin-test@example.com",
        name: "Admin Test",
        loginMethod: "manus",
        role: "admin",
        createdAt: new Date(),
        updatedAt: new Date(),
        lastSignedIn: new Date(),
      },
      req: { protocol: "https", headers: {} } as TrpcContext["req"],
      res: {} as TrpcContext["res"],
    };
    const caller = appRouter.createCaller(ctx);

    try {
      const created = await caller.admin.createProduct({
        slug,
        name: "Registro de validação",
        category: "essenciais",
        price: 1,
        image: "/manus-storage/use-brito-mark_b2bb36b9.png",
        color: "Teste",
        description: "Registro temporário para validar persistência administrativa.",
        details: ["Controle de integração"],
        sizes: ["Único"],
        stock: 1,
        state: "Rascunho",
        sortOrder: 9999,
      });

      await caller.admin.updateProduct({ id: created.id, product: { stock: 2, state: "Publicado" } });
      const stored = await db.select().from(catalogProducts).where(eq(catalogProducts.id, created.id)).limit(1);

      expect(stored[0]?.stock).toBe(2);
      expect(stored[0]?.status).toBe("published");
    } finally {
      await db.delete(catalogProducts).where(eq(catalogProducts.slug, slug));
    }
  });
});
