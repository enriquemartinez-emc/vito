/**
 * Seeds local Supabase with realistic demo data: customers, the product
 * catalog, and a mix of pending/approved/declined quotes and
 * scheduled/completed orders. Safe to re-run — clears existing rows first.
 *
 * Usage: npm run seed  (requires `npx supabase start` and .env.local)
 */
import { createPrivilegedClient } from "../src/lib/db/server"
import { priceQuote, approveQuote, declineQuote } from "../src/core/quotes/quote.rules"
import { scheduleOrder, completeOrder } from "../src/core/orders/order.rules"
import {
  customerIdSchema,
  quoteIdSchema,
  windowTypeIdSchema,
  glassTypeIdSchema,
  dimensionSchema,
  quantitySchema,
  type DraftQuote,
  type PendingQuote,
  type ApprovedQuote,
  type PriceSheet,
  type CustomerId,
  type WindowTypeId,
  type GlassTypeId,
} from "../src/core/quotes/quote.types"
import { orderIdSchema } from "../src/core/orders/order.types"
import { moneySchema } from "../src/core/shared/money"

const db = createPrivilegedClient()

function daysFromNow(days: number): string {
  const date = new Date()
  date.setUTCDate(date.getUTCDate() + days)
  return date.toISOString()
}

async function insertOrThrow<T>(label: string, promise: PromiseLike<{ data: T | null; error: { message: string } | null }>) {
  const { data, error } = await promise
  if (error) throw new Error(`${label}: ${error.message}`)
  return data as T
}

const WINDOW_TYPES = [
  { name: "Single-Hung", laborCost: 45 },
  { name: "Double-Hung", laborCost: 55 },
  { name: "Casement", laborCost: 65 },
  { name: "Sliding", laborCost: 50 },
  { name: "Fixed", laborCost: 35 },
  { name: "Bay", laborCost: 150 },
]

const GLASS_TYPES = [
  { name: "Single-Pane", unitCost: 6 },
  { name: "Double-Pane", unitCost: 12 },
  { name: "Low-E", unitCost: 16 },
  { name: "Tempered", unitCost: 18 },
  { name: "Laminated", unitCost: 22 },
]

const CUSTOMERS = [
  { name: "Maria Gonzalez", email: "maria.gonzalez@example.com", phone: "(555) 214-7788" },
  { name: "James Whitfield", email: "james.whitfield@example.com", phone: "(555) 330-9021" },
  { name: "Priya Natarajan", email: "priya.natarajan@example.com", phone: "(555) 442-1187" },
  { name: "Robert Kowalski", email: "robert.kowalski@example.com", phone: "(555) 675-3390" },
  { name: "Aisha Bello", email: "aisha.bello@example.com", phone: "(555) 809-2244" },
  { name: "Daniel Chen", email: "daniel.chen@example.com", phone: "(555) 118-6675" },
  { name: "Laura Fontaine", email: "laura.fontaine@example.com", phone: "(555) 993-4520" },
  { name: "Marcus Webb", email: "marcus.webb@example.com", phone: "(555) 267-8814" },
]

type LineItemDef = { windowType: string; glassType: string; widthIn: number; heightIn: number; quantity: number }
type QuoteDef = {
  customer: string
  createdDaysAgo: number
  lineItems: LineItemDef[]
  outcome:
    | { status: "pending" }
    | { status: "declined"; decidedDaysAgo: number; reason: string }
    | {
        status: "approved"
        decidedDaysAgo: number
        order: { installationDaysFromToday: number; completedDaysAfterInstallation?: number }
      }
}

const QUOTES: QuoteDef[] = [
  {
    customer: "Maria Gonzalez",
    createdDaysAgo: 2,
    lineItems: [
      { windowType: "Double-Hung", glassType: "Double-Pane", widthIn: 30, heightIn: 48, quantity: 3 },
      { windowType: "Casement", glassType: "Low-E", widthIn: 24, heightIn: 36, quantity: 2 },
    ],
    outcome: { status: "pending" },
  },
  {
    customer: "James Whitfield",
    createdDaysAgo: 20,
    lineItems: [{ windowType: "Single-Hung", glassType: "Single-Pane", widthIn: 24, heightIn: 36, quantity: 4 }],
    outcome: {
      status: "approved",
      decidedDaysAgo: 18,
      order: { installationDaysFromToday: -5, completedDaysAfterInstallation: 0 },
    },
  },
  {
    customer: "Priya Natarajan",
    createdDaysAgo: 10,
    lineItems: [{ windowType: "Bay", glassType: "Tempered", widthIn: 60, heightIn: 48, quantity: 1 }],
    outcome: { status: "declined", decidedDaysAgo: 9, reason: "Chose a different contractor" },
  },
  {
    customer: "Robert Kowalski",
    createdDaysAgo: 15,
    lineItems: [
      { windowType: "Sliding", glassType: "Double-Pane", widthIn: 48, heightIn: 36, quantity: 2 },
      { windowType: "Fixed", glassType: "Low-E", widthIn: 24, heightIn: 24, quantity: 1 },
    ],
    outcome: { status: "approved", decidedDaysAgo: 13, order: { installationDaysFromToday: 6 } },
  },
  {
    customer: "Aisha Bello",
    createdDaysAgo: 4,
    lineItems: [{ windowType: "Double-Hung", glassType: "Laminated", widthIn: 30, heightIn: 54, quantity: 2 }],
    outcome: { status: "pending" },
  },
  {
    customer: "Daniel Chen",
    createdDaysAgo: 7,
    lineItems: [{ windowType: "Casement", glassType: "Double-Pane", widthIn: 28, heightIn: 40, quantity: 3 }],
    outcome: { status: "declined", decidedDaysAgo: 6, reason: "Budget too high" },
  },
  {
    customer: "Laura Fontaine",
    createdDaysAgo: 12,
    lineItems: [{ windowType: "Single-Hung", glassType: "Low-E", widthIn: 24, heightIn: 36, quantity: 5 }],
    outcome: { status: "approved", decidedDaysAgo: 10, order: { installationDaysFromToday: 3 } },
  },
  {
    customer: "Marcus Webb",
    createdDaysAgo: 1,
    lineItems: [
      { windowType: "Fixed", glassType: "Tempered", widthIn: 36, heightIn: 36, quantity: 1 },
      { windowType: "Sliding", glassType: "Single-Pane", widthIn: 48, heightIn: 24, quantity: 2 },
    ],
    outcome: { status: "pending" },
  },
  {
    customer: "Maria Gonzalez",
    createdDaysAgo: 30,
    lineItems: [{ windowType: "Bay", glassType: "Laminated", widthIn: 72, heightIn: 48, quantity: 1 }],
    outcome: { status: "declined", decidedDaysAgo: 28, reason: "Went with vinyl siding replacement instead" },
  },
  {
    customer: "James Whitfield",
    createdDaysAgo: 3,
    lineItems: [{ windowType: "Double-Hung", glassType: "Tempered", widthIn: 30, heightIn: 40, quantity: 2 }],
    outcome: { status: "pending" },
  },
]

async function clearExistingData() {
  await db.from("orders").delete().gte("id", 0)
  await db.from("quotes").delete().gte("id", 0) // cascades to quote_line_items
  await db.from("customers").delete().gte("id", 0)
  await db.from("window_types").delete().gte("id", 0)
  await db.from("glass_types").delete().gte("id", 0)
}

async function seedCatalog() {
  const windowTypeRows = await insertOrThrow<{ id: number; name: string }[]>(
    "insert window_types",
    db
      .from("window_types")
      .insert(WINDOW_TYPES.map((w) => ({ name: w.name, labor_cost: w.laborCost })))
      .select("id, name")
  )
  const glassTypeRows = await insertOrThrow<{ id: number; name: string }[]>(
    "insert glass_types",
    db
      .from("glass_types")
      .insert(GLASS_TYPES.map((g) => ({ name: g.name, unit_cost: g.unitCost })))
      .select("id, name")
  )
  const customerRows = await insertOrThrow<{ id: number; name: string }[]>(
    "insert customers",
    db.from("customers").insert(CUSTOMERS).select("id, name")
  )

  const windowTypeIdByName = new Map(windowTypeRows.map((r) => [r.name, windowTypeIdSchema.parse(r.id)]))
  const glassTypeIdByName = new Map(glassTypeRows.map((r) => [r.name, glassTypeIdSchema.parse(r.id)]))
  const customerIdByName = new Map(customerRows.map((r) => [r.name, customerIdSchema.parse(r.id)]))

  const priceSheet: PriceSheet = {
    laborCostByWindowType: new Map(
      WINDOW_TYPES.map((w) => [windowTypeIdByName.get(w.name) as WindowTypeId, moneySchema.parse(w.laborCost)])
    ),
    glassUnitCostByGlassType: new Map(
      GLASS_TYPES.map((g) => [glassTypeIdByName.get(g.name) as GlassTypeId, moneySchema.parse(g.unitCost)])
    ),
  }

  return { windowTypeIdByName, glassTypeIdByName, customerIdByName, priceSheet }
}

async function seedQuote(
  def: QuoteDef,
  customerIdByName: Map<string, CustomerId>,
  windowTypeIdByName: Map<string, WindowTypeId>,
  glassTypeIdByName: Map<string, GlassTypeId>,
  priceSheet: PriceSheet
) {
  const draft: DraftQuote = {
    status: "draft",
    customerId: customerIdByName.get(def.customer)!,
    lineItems: def.lineItems.map((item) => ({
      windowTypeId: windowTypeIdByName.get(item.windowType)!,
      glassTypeId: glassTypeIdByName.get(item.glassType)!,
      widthIn: dimensionSchema.parse(item.widthIn),
      heightIn: dimensionSchema.parse(item.heightIn),
      quantity: quantitySchema.parse(item.quantity),
    })),
  }

  // priceQuote needs a QuoteId up front, but the real id only exists once the
  // row is inserted (identity column) — price with a placeholder, then patch
  // in the real id below. The Shell's repository will need its own answer to
  // this same ordering problem when the quotes feature is built.
  const priced = priceQuote(draft, priceSheet, quoteIdSchema.parse(1), daysFromNow(-def.createdDaysAgo))

  const insertedQuote = await insertOrThrow<{ id: number }>(
    "insert quotes",
    db
      .from("quotes")
      .insert({
        customer_id: priced.customerId,
        status: "pending",
        total: priced.total,
        created_at: priced.createdAt,
      })
      .select("id")
      .single()
  )
  const pending: PendingQuote = { ...priced, id: quoteIdSchema.parse(insertedQuote.id) }

  await insertOrThrow(
    "insert quote_line_items",
    db.from("quote_line_items").insert(
      pending.lineItems.map((item) => ({
        quote_id: pending.id,
        window_type_id: item.windowTypeId,
        glass_type_id: item.glassTypeId,
        width_in: item.widthIn,
        height_in: item.heightIn,
        quantity: item.quantity,
        line_total: item.lineTotal,
      }))
    )
  )

  if (def.outcome.status === "pending") return

  if (def.outcome.status === "declined") {
    const declined = declineQuote(pending, daysFromNow(-def.outcome.decidedDaysAgo), def.outcome.reason)
    await insertOrThrow(
      "update quote to declined",
      db
        .from("quotes")
        .update({ status: "declined", declined_at: declined.declinedAt, decline_reason: declined.declineReason })
        .eq("id", pending.id)
    )
    return
  }

  const approved: ApprovedQuote = approveQuote(pending, daysFromNow(-def.outcome.decidedDaysAgo))
  await insertOrThrow(
    "update quote to approved",
    db.from("quotes").update({ status: "approved", approved_at: approved.approvedAt }).eq("id", pending.id)
  )

  const installationDate = daysFromNow(def.outcome.order.installationDaysFromToday).slice(0, 10)
  const scheduled = scheduleOrder(approved, orderIdSchema.parse(1), installationDate, approved.approvedAt)

  if (def.outcome.order.completedDaysAfterInstallation === undefined) {
    await insertOrThrow(
      "insert scheduled order",
      db.from("orders").insert({
        quote_id: scheduled.quoteId,
        installation_date: scheduled.installationDate,
        status: "scheduled",
        created_at: scheduled.createdAt,
      })
    )
    return
  }

  const completedAt = daysFromNow(
    def.outcome.order.installationDaysFromToday + def.outcome.order.completedDaysAfterInstallation
  )
  const completed = completeOrder(scheduled, completedAt)
  await insertOrThrow(
    "insert completed order",
    db.from("orders").insert({
      quote_id: completed.quoteId,
      installation_date: completed.installationDate,
      status: "completed",
      completed_at: completed.completedAt,
      created_at: completed.createdAt,
    })
  )
}

async function main() {
  await clearExistingData()
  const { windowTypeIdByName, glassTypeIdByName, customerIdByName, priceSheet } = await seedCatalog()

  for (const def of QUOTES) {
    await seedQuote(def, customerIdByName, windowTypeIdByName, glassTypeIdByName, priceSheet)
  }

  console.log(`Seeded ${CUSTOMERS.length} customers and ${QUOTES.length} quotes.`)
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
