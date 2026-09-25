import { sql } from "drizzle-orm";
import { index, integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const serviceRequests = sqliteTable(
  "service_requests",
  {
    id: text("id").primaryKey(),
    reference: text("reference").notNull().unique(),
    name: text("name").notNull(),
    email: text("email").notNull(),
    phone: text("phone").notNull(),
    address: text("address").notNull(),
    city: text("city").notNull(),
    state: text("state").notNull(),
    postalCode: text("postal_code").notNull(),
    lotSize: integer("lot_size").notNull(),
    frequency: text("frequency").notNull(),
    grassHeight: text("grass_height").notNull(),
    gated: integer("gated", { mode: "boolean" }).notNull().default(false),
    addOns: text("add_ons").notNull().default("[]"),
    priceCents: integer("price_cents").notNull(),
    preferredDate: text("preferred_date"),
    notes: text("notes").notNull().default(""),
    status: text("status").notNull().default("new"),
    createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [index("idx_service_requests_status_created_at").on(table.status, table.createdAt)],
);
