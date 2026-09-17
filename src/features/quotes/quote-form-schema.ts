import { z } from "zod"

export const quoteFormLineItemSchema = z.object({
  windowTypeId: z.coerce.number().int().positive({ error: "Select a window type." }),
  glassTypeId: z.coerce.number().int().positive({ error: "Select a glass type." }),
  widthIn: z.coerce.number().positive({ error: "Enter a width greater than 0." }),
  heightIn: z.coerce.number().positive({ error: "Enter a height greater than 0." }),
  quantity: z.coerce.number().int().positive({ error: "Enter a quantity of at least 1." }),
})

export const quoteFormSchema = z.object({
  customerId: z.coerce.number().int().positive({ error: "Select a customer." }),
  lineItems: z.array(quoteFormLineItemSchema).min(1, "Add at least one window."),
  comments: z
    .string()
    .trim()
    .max(2000, { error: "Keep comments under 2000 characters." })
    .optional()
    .transform((value) => (value ? value : undefined)),
})

export type QuoteFormValues = z.infer<typeof quoteFormSchema>
