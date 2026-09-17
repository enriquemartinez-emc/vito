import { z } from "zod"
import { moneySchema, type Money } from "@/core/shared/money"

export const customerIdSchema = z.number().int().positive().brand<"CustomerId">()
export type CustomerId = z.infer<typeof customerIdSchema>

export const quoteIdSchema = z.number().int().positive().brand<"QuoteId">()
export type QuoteId = z.infer<typeof quoteIdSchema>

export const windowTypeIdSchema = z.number().int().positive().brand<"WindowTypeId">()
export type WindowTypeId = z.infer<typeof windowTypeIdSchema>

export const glassTypeIdSchema = z.number().int().positive().brand<"GlassTypeId">()
export type GlassTypeId = z.infer<typeof glassTypeIdSchema>

/** Inches. */
export const dimensionSchema = z.number().positive().brand<"Dimension">()
export type Dimension = z.infer<typeof dimensionSchema>

export const quantitySchema = z.number().int().positive().brand<"Quantity">()
export type Quantity = z.infer<typeof quantitySchema>

/** A single window being quoted, before pricing. */
export const quoteLineItemSpecSchema = z.object({
  windowTypeId: windowTypeIdSchema,
  glassTypeId: glassTypeIdSchema,
  widthIn: dimensionSchema,
  heightIn: dimensionSchema,
  quantity: quantitySchema,
})
export type QuoteLineItemSpec = z.infer<typeof quoteLineItemSpecSchema>

/** A priced line item — same spec, plus its computed total. */
export const pricedQuoteLineItemSchema = quoteLineItemSpecSchema.extend({
  lineTotal: moneySchema,
})
export type PricedQuoteLineItem = z.infer<typeof pricedQuoteLineItemSchema>

/**
 * Reference costs needed to price a quote: window_types.labor_cost and
 * glass_types.unit_cost (per square foot), keyed by id. Built by the Shell
 * from the catalog tables — the pricing function trusts it's complete for
 * every id referenced by the line items being priced.
 */
export interface PriceSheet {
  readonly laborCostByWindowType: ReadonlyMap<WindowTypeId, Money>
  readonly glassUnitCostByGlassType: ReadonlyMap<GlassTypeId, Money>
}

interface QuoteBase {
  readonly id: QuoteId
  readonly customerId: CustomerId
  readonly lineItems: readonly PricedQuoteLineItem[]
  readonly total: Money
  readonly createdAt: string // ISO datetime
}

/** Not yet saved or priced — no id, no totals. Priced into a PendingQuote by the pricing function. */
export interface DraftQuote {
  readonly status: "draft"
  readonly customerId: CustomerId
  readonly lineItems: readonly QuoteLineItemSpec[]
}

/** Priced and saved, awaiting the customer's decision. */
export interface PendingQuote extends QuoteBase {
  readonly status: "pending"
}

export interface ApprovedQuote extends QuoteBase {
  readonly status: "approved"
  readonly approvedAt: string // ISO datetime
}

/** Declined quotes are kept, never deleted — historic record. */
export interface DeclinedQuote extends QuoteBase {
  readonly status: "declined"
  readonly declinedAt: string // ISO datetime
  readonly declineReason?: string
}

export type Quote = DraftQuote | PendingQuote | ApprovedQuote | DeclinedQuote
