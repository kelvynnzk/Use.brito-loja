import { and, asc, count, desc, eq, inArray } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  catalogProducts,
  catalogRequestItems,
  catalogRequests,
  type CatalogProduct,
  type InsertCatalogProduct,
  type InsertUser,
  storeSettings,
  users,
} from "../drizzle/schema";
import { initialCatalogSeed } from "./catalogSeed";
import { buildCatalogWhatsAppMessage, type WhatsAppCatalogItem } from "../shared/catalogMessage";
import { ENV } from "./_core/env";

// A conexão é criada sob demanda para que scripts de análise não precisem abrir o banco.
let _db: ReturnType<typeof drizzle> | null = null;
// Chave estável usada para salvar e recuperar o destino do atendimento no banco.
const WHATSAPP_SETTING_KEY = "whatsappPhone";
// Valor inicial utilizado somente no primeiro bootstrap da loja.
const DEFAULT_WHATSAPP_PHONE = "5521965917831";

/** Retorna a instância Drizzle já conectada, quando DATABASE_URL está disponível. */
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

/**
 * Cria ou atualiza a conta autenticada sem perder campos de perfil já existentes.
 * O dono do projeto é promovido automaticamente para o papel de administrador.
 */
export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) throw new Error("User openId is required for upsert");
  const db = await getDb();
  if (!db) return;
  const values: InsertUser = { openId: user.openId, lastSignedIn: user.lastSignedIn ?? new Date() };
  const updateSet: Record<string, unknown> = { lastSignedIn: values.lastSignedIn };
  (["name", "email", "loginMethod"] as const).forEach((field) => {
    if (user[field] !== undefined) {
      values[field] = user[field] ?? null;
      updateSet[field] = user[field] ?? null;
    }
  });
  values.role = user.role ?? (user.openId === ENV.ownerOpenId ? "admin" : "user");
  updateSet.role = values.role;
  await db.insert(users).values(values).onDuplicateKeyUpdate({ set: updateSet });
}

/** Localiza uma pessoa autenticada a partir do identificador retornado pelo OAuth. */
export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result[0];
}

/**
 * Garante que a primeira abertura da loja tenha catálogo e configuração de atendimento.
 * O insert é idempotente para suportar mais de um acesso inicial simultâneo sem duplicar registros.
 */
async function ensureStoreBootstrap() {
  const db = await getDb();
  if (!db) throw new Error("Banco de dados indisponível.");
  const productCount = await db.select({ total: count() }).from(catalogProducts);
  if ((productCount[0]?.total ?? 0) === 0) {
    await Promise.all(initialCatalogSeed.map((product) =>
      db.insert(catalogProducts).values(product).onDuplicateKeyUpdate({ set: { name: product.name } }),
    ));
  }
  await db.insert(storeSettings).values({ settingKey: WHATSAPP_SETTING_KEY, settingValue: DEFAULT_WHATSAPP_PHONE }).onDuplicateKeyUpdate({ set: { settingKey: WHATSAPP_SETTING_KEY } });
  return db;
}

/**
 * Converte o formato interno do banco para o formato usado pela interface.
 * Preços voltam de centavos para reais e estados técnicos recebem rótulos em pt-BR.
 */
export function mapCatalogProduct(product: CatalogProduct) {
  return {
    id: product.id,
    slug: product.slug,
    name: product.name,
    category: product.category,
    price: product.priceCents / 100,
    image: product.imageUrl,
    label: product.label ?? undefined,
    color: product.color,
    description: product.description,
    details: product.details,
    sizes: product.sizes,
    stock: product.stock,
    state: (product.status === "published" ? "Publicado" : "Rascunho") as "Publicado" | "Rascunho",
    createdAt: product.createdAt,
  };
}

/** Lista apenas peças publicadas, ordenadas para a vitrine pública. */
export async function listPublicCatalog() {
  const db = await ensureStoreBootstrap();
  const rows = await db.select().from(catalogProducts).where(eq(catalogProducts.status, "published")).orderBy(asc(catalogProducts.sortOrder), desc(catalogProducts.createdAt));
  return rows.map(mapCatalogProduct);
}

/** Lista todas as peças, incluindo rascunhos, para uso exclusivo do painel administrativo. */
export async function listAdminCatalog() {
  const db = await ensureStoreBootstrap();
  const rows = await db.select().from(catalogProducts).orderBy(asc(catalogProducts.sortOrder), desc(catalogProducts.createdAt));
  return rows.map(mapCatalogProduct);
}

/** Cria uma nova peça no catálogo e devolve seu formato preparado para a interface. */
export async function createCatalogProduct(input: Omit<InsertCatalogProduct, "id" | "createdAt" | "updatedAt">) {
  const db = await ensureStoreBootstrap();
  await db.insert(catalogProducts).values(input);
  const product = await db.select().from(catalogProducts).where(eq(catalogProducts.slug, input.slug)).limit(1);
  if (!product[0]) throw new Error("Produto não encontrado após criação.");
  return mapCatalogProduct(product[0]);
}

/** Atualiza apenas os campos informados de uma peça existente. */
export async function updateCatalogProduct(id: number, input: Partial<Omit<InsertCatalogProduct, "id" | "createdAt" | "updatedAt">>) {
  const db = await ensureStoreBootstrap();
  await db.update(catalogProducts).set(input).where(eq(catalogProducts.id, id));
  const product = await db.select().from(catalogProducts).where(eq(catalogProducts.id, id)).limit(1);
  if (!product[0]) throw new Error("Produto não encontrado.");
  return mapCatalogProduct(product[0]);
}

/** Obtém o número persistido que receberá as mensagens iniciadas pela sacola. */
export async function getWhatsAppPhone() {
  const db = await ensureStoreBootstrap();
  const setting = await db.select().from(storeSettings).where(eq(storeSettings.settingKey, WHATSAPP_SETTING_KEY)).limit(1);
  return setting[0]?.settingValue ?? DEFAULT_WHATSAPP_PHONE;
}

/**
 * Valida a seleção da sacola, registra o interesse e cria um snapshot de cada peça.
 * A transação impede que a solicitação fique parcialmente salva caso algum insert falhe.
 */
export async function createCatalogRequest(input: { items: { productId: number; size: string; quantity: number }[] }) {
  const db = await ensureStoreBootstrap();
  const productIds = Array.from(new Set(input.items.map((item) => item.productId)));
  const selectedProducts = await db.select().from(catalogProducts).where(and(inArray(catalogProducts.id, productIds), eq(catalogProducts.status, "published")));
  if (selectedProducts.length !== productIds.length) throw new Error("Uma ou mais peças não estão disponíveis no catálogo.");

  const productsById = new Map(selectedProducts.map((product) => [product.id, product]));
  // A seleção é reconciliada com o catálogo atual antes de montar a mensagem de atendimento.
  const snapshots = input.items.map((item) => {
    const product = productsById.get(item.productId);
    if (!product || !product.sizes.includes(item.size)) throw new Error("Tamanho indisponível para uma das peças.");
    if (item.quantity > product.stock) throw new Error(`${product.name} não possui estoque suficiente.`);
    return { product, size: item.size, quantity: item.quantity };
  });

  const reference = `UB-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
  const subtotalCents = snapshots.reduce((total, item) => total + item.product.priceCents * item.quantity, 0);
  const messageItems: WhatsAppCatalogItem[] = snapshots.map((item) => ({ name: item.product.name, size: item.size, quantity: item.quantity, unitPriceCents: item.product.priceCents }));
  const messageText = buildCatalogWhatsAppMessage({ reference, items: messageItems, subtotalCents });
  const whatsappPhone = await getWhatsAppPhone();

  await db.transaction(async (tx) => {
    await tx.insert(catalogRequests).values({ reference, whatsappPhone, itemCount: snapshots.reduce((total, item) => total + item.quantity, 0), subtotalCents, messageText });
    await tx.insert(catalogRequestItems).values(snapshots.map((item) => ({ requestReference: reference, productId: item.product.id, productName: item.product.name, imageUrl: item.product.imageUrl, size: item.size, quantity: item.quantity, unitPriceCents: item.product.priceCents })));
  });
  return { reference, whatsappPhone, messageText };
}

/** Lista as solicitações mais novas primeiro para facilitar o retorno do ateliê. */
export async function listCatalogRequests() {
  const db = await ensureStoreBootstrap();
  return db.select().from(catalogRequests).orderBy(desc(catalogRequests.createdAt));
}

/** Atualiza a etapa operacional de uma solicitação registrada no painel administrativo. */
export async function updateCatalogRequestStatus(reference: string, status: "new" | "contacted" | "archived") {
  const db = await ensureStoreBootstrap();
  await db.update(catalogRequests).set({ status }).where(eq(catalogRequests.reference, reference));
  const request = await db.select().from(catalogRequests).where(eq(catalogRequests.reference, reference)).limit(1);
  if (!request[0]) throw new Error("Solicitação não encontrada.");
  return request[0];
}
