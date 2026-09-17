import type { ApprovedQuote } from "@/core/quotes/quote.types"
import type { OrderId, ScheduledOrder, CompletedOrder } from "@/core/orders/order.types"

export function scheduleOrder(
  quote: ApprovedQuote,
  id: OrderId,
  installationDate: string,
  createdAt: string
): ScheduledOrder {
  return {
    status: "scheduled",
    id,
    quoteId: quote.id,
    installationDate,
    createdAt,
  }
}

export function completeOrder(order: ScheduledOrder, completedAt: string): CompletedOrder {
  return {
    status: "completed",
    id: order.id,
    quoteId: order.quoteId,
    installationDate: order.installationDate,
    createdAt: order.createdAt,
    completedAt,
  }
}
