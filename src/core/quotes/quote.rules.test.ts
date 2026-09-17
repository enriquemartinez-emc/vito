import { describe, expect, it } from "vitest"
import { approveQuote, declineQuote, priceQuote, priceLineItem } from "@/core/quotes/quote.rules"
import {
  customerIdSchema,
  quoteIdSchema,
  windowTypeIdSchema,
  glassTypeIdSchema,
  dimensionSchema,
  quantitySchema,
  type PendingQuote,
  type DraftQuote,
  type PriceSheet,
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

const windowTypeId = windowTypeIdSchema.parse(1)
const glassTypeId = glassTypeIdSchema.parse(1)

const priceSheet: PriceSheet = {
  laborCostByWindowType: new Map([[windowTypeId, moneySchema.parse(50)]]),
  glassUnitCostByGlassType: new Map([[glassTypeId, moneySchema.parse(12)]]),
}

describe("priceLineItem", () => {
  it("computes area in square feet, then glass cost + labor cost, times quantity", () => {
    // 36in x 48in = 1728 sq in = 12 sq ft. Glass: 12 * $12 = $144. Labor: $50 flat.
    // Per-window: $194. Quantity 2 -> $388.
    const priced = priceLineItem(
      {
        windowTypeId,
        glassTypeId,
        widthIn: dimensionSchema.parse(36),
        heightIn: dimensionSchema.parse(48),
        quantity: quantitySchema.parse(2),
      },
      priceSheet
    )

    expect(priced.lineTotal).toBe(388)
  })

  it("throws when the price sheet has no labor cost for the window type", () => {
    expect(() =>
      priceLineItem(
        {
          windowTypeId: windowTypeIdSchema.parse(999),
          glassTypeId,
          widthIn: dimensionSchema.parse(36),
          heightIn: dimensionSchema.parse(48),
          quantity: quantitySchema.parse(1),
        },
        priceSheet
      )
    ).toThrow(/labor cost/)
  })

  it("throws when the price sheet has no unit cost for the glass type", () => {
    expect(() =>
      priceLineItem(
        {
          windowTypeId,
          glassTypeId: glassTypeIdSchema.parse(999),
          widthIn: dimensionSchema.parse(36),
          heightIn: dimensionSchema.parse(48),
          quantity: quantitySchema.parse(1),
        },
        priceSheet
      )
    ).toThrow(/glass unit/)
  })
})

describe("priceQuote", () => {
  it("prices every line item and sums them into the quote total", () => {
    const draft: DraftQuote = {
      status: "draft",
      customerId: customerIdSchema.parse(1),
      lineItems: [
        {
          windowTypeId,
          glassTypeId,
          widthIn: dimensionSchema.parse(36),
          heightIn: dimensionSchema.parse(48),
          quantity: quantitySchema.parse(2),
        },
        {
          windowTypeId,
          glassTypeId,
          widthIn: dimensionSchema.parse(24),
          heightIn: dimensionSchema.parse(24),
          quantity: quantitySchema.parse(1),
        },
      ],
    }

    const priced = priceQuote(draft, priceSheet, quoteIdSchema.parse(1), "2026-09-18T00:00:00.000Z")

    // Second line: 24x24 = 576 sq in = 4 sq ft. Glass: 4 * $12 = $48. + $50 labor = $98. Qty 1 -> $98.
    expect(priced.lineItems[1].lineTotal).toBe(98)
    expect(priced.total).toBe(388 + 98)
    expect(priced.status).toBe("pending")
    expect(priced.customerId).toBe(draft.customerId)
  })

  it("prices a quote with no line items to a zero total", () => {
    const draft: DraftQuote = {
      status: "draft",
      customerId: customerIdSchema.parse(1),
      lineItems: [],
    }

    const priced = priceQuote(draft, priceSheet, quoteIdSchema.parse(1), "2026-09-18T00:00:00.000Z")

    expect(priced.total).toBe(0)
    expect(priced.lineItems).toEqual([])
  })
})

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
