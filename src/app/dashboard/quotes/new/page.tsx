import { QuoteForm, type QuoteFormResult } from "@/features/quotes/components/quote-form"
import { listCustomers, listGlassTypes, listWindowTypes } from "@/features/quotes/repository"
import type { QuoteFormValues } from "@/features/quotes/quote-form-schema"

// No dynamic API (cookies/headers/searchParams) is used here, so Next would
// otherwise treat this page as static and freeze the customer/catalog lists
// to whatever existed at build time. Force per-request rendering instead.
export const dynamic = "force-dynamic"

export default async function NewQuotePage() {
  const [customers, windowTypes, glassTypes] = await Promise.all([
    listCustomers(),
    listWindowTypes(),
    listGlassTypes(),
  ])

  async function submitQuote(values: QuoteFormValues): Promise<QuoteFormResult> {
    "use server"
    // Placeholder until the create-quote server action (pricing + persistence) lands.
    console.log("Quote form submitted", values)
    return { ok: true }
  }

  return (
    <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
      <div className="mx-auto w-full max-w-3xl px-4 lg:px-6">
        <h1 className="mb-6 text-2xl font-semibold">New Quote</h1>
        <QuoteForm customers={customers} windowTypes={windowTypes} glassTypes={glassTypes} onSubmit={submitQuote} />
      </div>
    </div>
  )
}
