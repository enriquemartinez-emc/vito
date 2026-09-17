import { z } from "zod"
import type { QuoteId } from "@/core/quotes/quote.types"

export const orderIdSchema = z.number().int().positive().brand<"OrderId">()
export type OrderId = z.infer<typeof orderIdSchema>

interface OrderBase {
  readonly id: OrderId
  readonly quoteId: QuoteId
  readonly installationDate: string // ISO date, agreed with the customer
  readonly createdAt: string // ISO datetime
}

export interface ScheduledOrder extends OrderBase {
  readonly status: "scheduled"
}

/** The window has been installed. */
export interface CompletedOrder extends OrderBase {
  readonly status: "completed"
  readonly completedAt: string // ISO datetime
}

export type Order = ScheduledOrder | CompletedOrder
