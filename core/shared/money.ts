import { z } from "zod"

export const moneySchema = z.number().nonnegative().brand<"Money">()
export type Money = z.infer<typeof moneySchema>

export const Money = {
  zero: moneySchema.parse(0),
  add: (a: Money, b: Money): Money => moneySchema.parse(a + b),
  multiply: (a: Money, factor: number): Money => moneySchema.parse(a * factor),
}
