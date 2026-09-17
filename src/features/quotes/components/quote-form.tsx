"use client"

import { useState, type FormEvent } from "react"
import { PlusIcon, Trash2Icon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { quoteFormSchema, type QuoteFormValues } from "@/features/quotes/quote-form-schema"

type CatalogOption = { id: number; name: string }

type LineItemFormState = {
  windowTypeId: string
  glassTypeId: string
  widthIn: string
  heightIn: string
  quantity: string
}

const emptyLineItem: LineItemFormState = {
  windowTypeId: "",
  glassTypeId: "",
  widthIn: "",
  heightIn: "",
  quantity: "1",
}

export type QuoteFormResult = { ok: true } | { ok: false; error: string }

interface QuoteFormProps {
  customers: CatalogOption[]
  windowTypes: CatalogOption[]
  glassTypes: CatalogOption[]
  onSubmit: (values: QuoteFormValues) => Promise<QuoteFormResult>
}

export function QuoteForm({ customers, windowTypes, glassTypes, onSubmit }: QuoteFormProps) {
  const [customerId, setCustomerId] = useState("")
  const [lineItems, setLineItems] = useState<LineItemFormState[]>([{ ...emptyLineItem }])
  const [comments, setComments] = useState("")
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [formError, setFormError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const customerItems = customers.map((c) => ({ label: c.name, value: String(c.id) }))
  const windowTypeItems = windowTypes.map((w) => ({ label: w.name, value: String(w.id) }))
  const glassTypeItems = glassTypes.map((g) => ({ label: g.name, value: String(g.id) }))

  function fieldError(path: string) {
    return fieldErrors[path] ? [{ message: fieldErrors[path] }] : undefined
  }

  function updateLineItem(index: number, field: keyof LineItemFormState, value: string) {
    setLineItems((items) => items.map((item, i) => (i === index ? { ...item, [field]: value } : item)))
  }

  function addLineItem() {
    setLineItems((items) => [...items, { ...emptyLineItem }])
  }

  function removeLineItem(index: number) {
    setLineItems((items) => items.filter((_, i) => i !== index))
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setFormError(null)

    const parsed = quoteFormSchema.safeParse({ customerId, lineItems, comments })
    if (!parsed.success) {
      const errors: Record<string, string> = {}
      for (const issue of parsed.error.issues) {
        errors[issue.path.join(".")] = issue.message
      }
      setFieldErrors(errors)
      return
    }
    setFieldErrors({})
    setIsSubmitting(true)
    try {
      const result = await onSubmit(parsed.data)
      if (!result.ok) {
        setFormError(result.error)
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <FieldGroup>
        <Field data-invalid={!!fieldErrors.customerId}>
          <FieldLabel htmlFor="quote-customer">Customer</FieldLabel>
          <Select
            items={customerItems}
            value={customerId || null}
            onValueChange={(value) => setCustomerId(value as string)}
          >
            <SelectTrigger id="quote-customer" aria-invalid={!!fieldErrors.customerId}>
              <SelectValue placeholder="Select a customer" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {customerItems.map((item) => (
                  <SelectItem key={item.value} value={item.value}>
                    {item.label}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
          <FieldError errors={fieldError("customerId")} />
        </Field>
      </FieldGroup>

      <div className="flex flex-col gap-4">
        {lineItems.map((item, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base">Window {index + 1}</CardTitle>
              {lineItems.length > 1 && (
                <Button type="button" variant="ghost" size="sm" onClick={() => removeLineItem(index)}>
                  <Trash2Icon data-icon="inline-start" />
                  Remove
                </Button>
              )}
            </CardHeader>
            <CardContent>
              <FieldGroup>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <Field data-invalid={!!fieldErrors[`lineItems.${index}.windowTypeId`]}>
                    <FieldLabel htmlFor={`window-type-${index}`}>Window Type</FieldLabel>
                    <Select
                      items={windowTypeItems}
                      value={item.windowTypeId || null}
                      onValueChange={(value) => updateLineItem(index, "windowTypeId", value as string)}
                    >
                      <SelectTrigger
                        id={`window-type-${index}`}
                        className="w-full"
                        aria-invalid={!!fieldErrors[`lineItems.${index}.windowTypeId`]}
                      >
                        <SelectValue placeholder="Select a window type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          {windowTypeItems.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                    <FieldError errors={fieldError(`lineItems.${index}.windowTypeId`)} />
                  </Field>

                  <Field data-invalid={!!fieldErrors[`lineItems.${index}.glassTypeId`]}>
                    <FieldLabel htmlFor={`glass-type-${index}`}>Glass Type</FieldLabel>
                    <Select
                      items={glassTypeItems}
                      value={item.glassTypeId || null}
                      onValueChange={(value) => updateLineItem(index, "glassTypeId", value as string)}
                    >
                      <SelectTrigger
                        id={`glass-type-${index}`}
                        className="w-full"
                        aria-invalid={!!fieldErrors[`lineItems.${index}.glassTypeId`]}
                      >
                        <SelectValue placeholder="Select a glass type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          {glassTypeItems.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                    <FieldError errors={fieldError(`lineItems.${index}.glassTypeId`)} />
                  </Field>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <Field data-invalid={!!fieldErrors[`lineItems.${index}.widthIn`]}>
                    <FieldLabel htmlFor={`width-${index}`}>Width (in)</FieldLabel>
                    <Input
                      id={`width-${index}`}
                      type="number"
                      min="0"
                      step="0.25"
                      value={item.widthIn}
                      aria-invalid={!!fieldErrors[`lineItems.${index}.widthIn`]}
                      onChange={(e) => updateLineItem(index, "widthIn", e.target.value)}
                    />
                    <FieldError errors={fieldError(`lineItems.${index}.widthIn`)} />
                  </Field>
                  <Field data-invalid={!!fieldErrors[`lineItems.${index}.heightIn`]}>
                    <FieldLabel htmlFor={`height-${index}`}>Height (in)</FieldLabel>
                    <Input
                      id={`height-${index}`}
                      type="number"
                      min="0"
                      step="0.25"
                      value={item.heightIn}
                      aria-invalid={!!fieldErrors[`lineItems.${index}.heightIn`]}
                      onChange={(e) => updateLineItem(index, "heightIn", e.target.value)}
                    />
                    <FieldError errors={fieldError(`lineItems.${index}.heightIn`)} />
                  </Field>
                  <Field data-invalid={!!fieldErrors[`lineItems.${index}.quantity`]}>
                    <FieldLabel htmlFor={`quantity-${index}`}>Quantity</FieldLabel>
                    <Input
                      id={`quantity-${index}`}
                      type="number"
                      min="1"
                      step="1"
                      value={item.quantity}
                      aria-invalid={!!fieldErrors[`lineItems.${index}.quantity`]}
                      onChange={(e) => updateLineItem(index, "quantity", e.target.value)}
                    />
                    <FieldError errors={fieldError(`lineItems.${index}.quantity`)} />
                  </Field>
                </div>
              </FieldGroup>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex flex-col gap-2">
        <Button type="button" variant="outline" onClick={addLineItem} className="self-start">
          <PlusIcon data-icon="inline-start" />
          Add Window
        </Button>
        <FieldError errors={fieldError("lineItems")} />
      </div>

      <FieldGroup>
        <Field data-invalid={!!fieldErrors.comments}>
          <FieldLabel htmlFor="quote-comments">Comments</FieldLabel>
          <Textarea
            id="quote-comments"
            placeholder="Special instructions, install constraints, anything else worth noting..."
            value={comments}
            aria-invalid={!!fieldErrors.comments}
            onChange={(e) => setComments(e.target.value)}
          />
          <FieldError errors={fieldError("comments")} />
        </Field>
      </FieldGroup>

      <FieldError errors={formError ? [{ message: formError }] : undefined} />

      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Submitting..." : "Create Quote"}
      </Button>
    </form>
  )
}
