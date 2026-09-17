import { describe, expect, it } from "vitest"
import { scheduleOrder, completeOrder } from "@/core/orders/order.rules"
import { orderIdSchema, type ScheduledOrder } from "@/core/orders/order.types"
import {
  customerIdSchema,
  quoteIdSchema,
  type ApprovedQuote,
} from "@/core/quotes/quote.types"
import { moneySchema } from "@/core/shared/money"

const approvedQuote: ApprovedQuote = {
  status: "approved",
  id: quoteIdSchema.parse(1),
  customerId: customerIdSchema.parse(1),
  lineItems: [],
  total: moneySchema.parse(300),
  createdAt: "2026-09-17T00:00:00.000Z",
  approvedAt: "2026-09-18T00:00:00.000Z",
}

describe("scheduleOrder", () => {
  it("creates a scheduled order referencing the approved quote", () => {
    const order = scheduleOrder(
      approvedQuote,
      orderIdSchema.parse(1),
      "2026-10-01",
      "2026-09-18T00:00:00.000Z"
    )

    expect(order).toEqual({
      status: "scheduled",
      id: orderIdSchema.parse(1),
      quoteId: approvedQuote.id,
      installationDate: "2026-10-01",
      createdAt: "2026-09-18T00:00:00.000Z",
    })
  })
})

describe("completeOrder", () => {
  it("carries the order forward as completed, with a completion timestamp", () => {
    const scheduled: ScheduledOrder = {
      status: "scheduled",
      id: orderIdSchema.parse(1),
      quoteId: approvedQuote.id,
      installationDate: "2026-10-01",
      createdAt: "2026-09-18T00:00:00.000Z",
    }

    const completed = completeOrder(scheduled, "2026-10-01T15:00:00.000Z")

    expect(completed).toEqual({
      status: "completed",
      id: scheduled.id,
      quoteId: scheduled.quoteId,
      installationDate: scheduled.installationDate,
      createdAt: scheduled.createdAt,
      completedAt: "2026-10-01T15:00:00.000Z",
    })
  })
})
