import { z } from "zod";
import { COOKIE_NAME } from "../shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { adminProcedure, publicProcedure, router } from "./_core/trpc";
import { systemRouter } from "./_core/systemRouter";
import {
  createCatalogProduct,
  createCatalogRequest,
  getWhatsAppPhone,
  listAdminCatalog,
  listCatalogRequests,
  listPublicCatalog,
  updateCatalogRequestStatus,
  updateCatalogProduct,
} from "./db";

const categorySchema = z.enum(["vestidos", "alfaiataria", "tricos", "essenciais", "acessorios"]);
const productInput = z.object({
  slug: z.string().min(3).max(180),
  name: z.string().min(2).max(180),
  category: categorySchema,
  price: z.number().positive(),
  image: z.string().min(1),
  label: z.string().max(80).optional().nullable(),
  color: z.string().min(2).max(80),
  description: z.string().min(5),
  details: z.array(z.string().min(2)).min(1),
  sizes: z.array(z.string().min(1)).min(1),
  stock: z.number().int().min(0),
  state: z.enum(["Publicado", "Rascunho"]),
  sortOrder: z.number().int().min(0).default(0),
});

const toDbProduct = (input: z.infer<typeof productInput>) => ({
  slug: input.slug,
  name: input.name,
  category: input.category,
  priceCents: Math.round(input.price * 100),
  imageUrl: input.image,
  label: input.label ?? null,
  color: input.color,
  description: input.description,
  details: input.details,
  sizes: input.sizes,
  stock: input.stock,
  status: input.state === "Publicado" ? "published" as const : "draft" as const,
  sortOrder: input.sortOrder,
});

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),
  catalog: router({
    list: publicProcedure.query(() => listPublicCatalog()),
    whatsapp: publicProcedure.query(async () => ({ phone: await getWhatsAppPhone() })),
    request: publicProcedure.input(z.object({ items: z.array(z.object({ productId: z.number().int().positive(), size: z.string().min(1).max(16), quantity: z.number().int().min(1).max(20) })).min(1).max(20) })).mutation(({ input }) => createCatalogRequest(input)),
  }),
  admin: router({
    products: adminProcedure.query(() => listAdminCatalog()),
    requests: adminProcedure.query(() => listCatalogRequests()),
    updateRequestStatus: adminProcedure.input(z.object({ reference: z.string().min(3), status: z.enum(["new", "contacted", "archived"]) })).mutation(({ input }) => updateCatalogRequestStatus(input.reference, input.status)),
    createProduct: adminProcedure.input(productInput).mutation(({ input }) => createCatalogProduct(toDbProduct(input))),
    updateProduct: adminProcedure.input(z.object({ id: z.number().int().positive(), product: productInput.partial() })).mutation(async ({ input }) => {
      const updates = input.product;
      const dbUpdates = {
        ...(updates.slug !== undefined ? { slug: updates.slug } : {}),
        ...(updates.name !== undefined ? { name: updates.name } : {}),
        ...(updates.category !== undefined ? { category: updates.category } : {}),
        ...(updates.price !== undefined ? { priceCents: Math.round(updates.price * 100) } : {}),
        ...(updates.image !== undefined ? { imageUrl: updates.image } : {}),
        ...(updates.label !== undefined ? { label: updates.label } : {}),
        ...(updates.color !== undefined ? { color: updates.color } : {}),
        ...(updates.description !== undefined ? { description: updates.description } : {}),
        ...(updates.details !== undefined ? { details: updates.details } : {}),
        ...(updates.sizes !== undefined ? { sizes: updates.sizes } : {}),
        ...(updates.stock !== undefined ? { stock: updates.stock } : {}),
        ...(updates.state !== undefined ? { status: updates.state === "Publicado" ? "published" as const : "draft" as const } : {}),
        ...(updates.sortOrder !== undefined ? { sortOrder: updates.sortOrder } : {}),
      };
      return updateCatalogProduct(input.id, dbUpdates);
    }),
  }),
});

export type AppRouter = typeof appRouter;
