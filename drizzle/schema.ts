import { int, json, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

/**
 * Contas autenticadas pelo Manus OAuth.
 * O proprietário do projeto recebe o papel de administrador durante o upsert realizado pelo servidor.
 */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

/**
 * Catálogo público exibido na vitrine.
 * Os valores monetários ficam em centavos para evitar imprecisões de ponto flutuante em cálculos e snapshots.
 */
export const catalogProducts = mysqlTable("catalog_products", {
  id: int("id").autoincrement().primaryKey(),
  slug: varchar("slug", { length: 180 }).notNull().unique(),
  name: varchar("name", { length: 180 }).notNull(),
  category: mysqlEnum("category", ["vestidos", "alfaiataria", "tricos", "essenciais", "acessorios"]).notNull(),
  priceCents: int("priceCents").notNull(),
  imageUrl: text("imageUrl").notNull(),
  label: varchar("label", { length: 80 }),
  color: varchar("color", { length: 80 }).notNull(),
  description: text("description").notNull(),
  details: json("details").$type<string[]>().notNull(),
  sizes: json("sizes").$type<string[]>().notNull(),
  stock: int("stock").notNull().default(0),
  status: mysqlEnum("status", ["published", "draft"]).notNull().default("draft"),
  sortOrder: int("sortOrder").notNull().default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

/**
 * Registro de uma seleção enviada para atendimento via WhatsApp.
 * O pedido comercial é conduzido fora do site, mas a intenção e a mensagem são preservadas no banco.
 */
export const catalogRequests = mysqlTable("catalog_requests", {
  id: int("id").autoincrement().primaryKey(),
  reference: varchar("reference", { length: 32 }).notNull().unique(),
  whatsappPhone: varchar("whatsappPhone", { length: 20 }).notNull(),
  itemCount: int("itemCount").notNull(),
  subtotalCents: int("subtotalCents").notNull(),
  messageText: text("messageText").notNull(),
  status: mysqlEnum("status", ["new", "contacted", "archived"]).notNull().default("new"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

/**
 * Snapshot das peças de cada solicitação.
 * Nome, imagem e preço unitário são copiados para manter o histórico mesmo se o catálogo mudar depois.
 */
export const catalogRequestItems = mysqlTable("catalog_request_items", {
  id: int("id").autoincrement().primaryKey(),
  requestReference: varchar("requestReference", { length: 32 }).notNull(),
  productId: int("productId").notNull(),
  productName: varchar("productName", { length: 180 }).notNull(),
  imageUrl: text("imageUrl").notNull(),
  size: varchar("size", { length: 16 }).notNull(),
  quantity: int("quantity").notNull(),
  unitPriceCents: int("unitPriceCents").notNull(),
});

/** Configurações operacionais persistidas, como o número de atendimento do WhatsApp. */
export const storeSettings = mysqlTable("store_settings", {
  settingKey: varchar("settingKey", { length: 80 }).primaryKey(),
  settingValue: text("settingValue").notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type CatalogProduct = typeof catalogProducts.$inferSelect;
export type InsertCatalogProduct = typeof catalogProducts.$inferInsert;
