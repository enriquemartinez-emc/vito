import { describe, expect, it } from "vitest"
import { approveQuote, declineQuote } from "@/core/quotes/quote.rules"
import {
  customerIdSchema,
  quoteIdSchema,
  windowTypeIdSchema,
  glassTypeIdSchema,
  dimensionSchema,
  quantitySchema,
  type PendingQuote,
} from "@/core/quotes/quote.types"
import { moneySchema } from "@/core/shared/money"

const pendingQuote: PendingQuote = {
  status: "pending",
  id: quoteIdSchema.parse(1),
  customerId: customerIdSchema.parse(1),
  lineItems: [
    {
      windowTypeId: windowTypeIdSchema.parse(1),
      glassTypeId: glassTypeIdSchema.parse(1),
      widthIn: dimensionSchema.parse(36),
      heightIn: dimensionSchema.parse(48),
      quantity: quantitySchema.parse(2),
      lineTotal: moneySchema.parse(300),
    },
  ],
  total: moneySchema.parse(300),
  createdAt: "2026-09-17T00:00:00.000Z",
}

describe("approveQuote", () => {
  it("carries the quote forward as approved, with an approval timestamp", () => {
    const approved = approveQuote(pendingQuote, "2026-09-18T00:00:00.000Z")

    expect(approved).toEqual({
      status: "approved",
      id: pendingQuote.id,
      customerId: pendingQuote.customerId,
      lineItems: pendingQuote.lineItems,
      total: pendingQuote.total,
      createdAt: pendingQuote.createdAt,
      approvedAt: "2026-09-18T00:00:00.000Z",
    })
  })
})

describe("declineQuote", () => {
  it("carries the quote forward as declined, keeping it for the historic record", () => {
    const declined = declineQuote(pendingQuote, "2026-09-18T00:00:00.000Z", "Too expensive")

    expect(declined).toEqual({
      status: "declined",
      id: pendingQuote.id,
      customerId: pendingQuote.customerId,
      lineItems: pendingQuote.lineItems,
      total: pendingQuote.total,
      createdAt: pendingQuote.createdAt,
      declinedAt: "2026-09-18T00:00:00.000Z",
      declineReason: "Too expensive",
    })
  })

  it("allows declining without a reason", () => {
    const declined = declineQuote(pendingQuote, "2026-09-18T00:00:00.000Z")

    expect(declined.declineReason).toBeUndefined()
  })
})
