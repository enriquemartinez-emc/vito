import { Money } from "@/core/shared/money"
import type {
  DraftQuote,
  PendingQuote,
  ApprovedQuote,
  DeclinedQuote,
  QuoteLineItemSpec,
  PricedQuoteLineItem,
  PriceSheet,
  QuoteId,
} from "@/core/quotes/quote.types"

const SQUARE_INCHES_PER_SQUARE_FOOT = 144

/** window_type_id / glass_type_id that the price sheet has no cost for — a caller contract violation, not a business outcome. */
function requiredCost(cost: Money | undefined, catalog: string, id: number): Money {
  if (cost === undefined) {
    throw new Error(`Price sheet is missing a ${catalog} cost for id ${id}`)
  }
  return cost
}

export function priceLineItem(spec: QuoteLineItemSpec, priceSheet: PriceSheet): PricedQuoteLineItem {
  const areaSqFt = (spec.widthIn * spec.heightIn) / SQUARE_INCHES_PER_SQUARE_FOOT
  const glassUnitCost = requiredCost(
    priceSheet.glassUnitCostByGlassType.get(spec.glassTypeId),
    "glass unit",
    spec.glassTypeId
  )
  const laborCost = requiredCost(
    priceSheet.laborCostByWindowType.get(spec.windowTypeId),
    "window type labor",
    spec.windowTypeId
  )
  const glassCost = Money.multiply(glassUnitCost, areaSqFt)
  const perWindowCost = Money.add(glassCost, laborCost)
  const lineTotal = Money.multiply(perWindowCost, spec.quantity)

  return {
    windowTypeId: spec.windowTypeId,
    glassTypeId: spec.glassTypeId,
    widthIn: spec.widthIn,
    heightIn: spec.heightIn,
    quantity: spec.quantity,
    lineTotal,
  }
}

export function priceQuote(
  draft: DraftQuote,
  priceSheet: PriceSheet,
  id: QuoteId,
  createdAt: string
): PendingQuote {
  const lineItems = draft.lineItems.map((spec) => priceLineItem(spec, priceSheet))
  const total = lineItems.reduce((sum, item) => Money.add(sum, item.lineTotal), Money.zero)

  return {
    status: "pending",
    id,
    customerId: draft.customerId,
    lineItems,
    total,
    createdAt,
  }
}

export function approveQuote(quote: PendingQuote, approvedAt: string): ApprovedQuote {
  return {
    status: "approved",
    id: quote.id,
    customerId: quote.customerId,
    lineItems: quote.lineItems,
    total: quote.total,
    createdAt: quote.createdAt,
    approvedAt,
  }
}

export function declineQuote(
  quote: PendingQuote,
  declinedAt: string,
  declineReason?: string
): DeclinedQuote {
  return {
    status: "declined",
    id: quote.id,
    customerId: quote.customerId,
    lineItems: quote.lineItems,
    total: quote.total,
    createdAt: quote.createdAt,
    declinedAt,
    declineReason,
  }
}
