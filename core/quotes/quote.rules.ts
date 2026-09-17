import type { PendingQuote, ApprovedQuote, DeclinedQuote } from "@/core/quotes/quote.types"

// Turning a DraftQuote into a PendingQuote requires pricing the line items —
// see the pricing function, which owns that transition.

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
