import { describe, expect, it } from "vitest"
import { Money, moneySchema } from "@/core/shared/money"

describe("Money", () => {
  it("adds two amounts", () => {
    const a = moneySchema.parse(10)
    const b = moneySchema.parse(2.5)
    expect(Money.add(a, b)).toBe(12.5)
  })

  it("multiplies by a factor", () => {
    const a = moneySchema.parse(10)
    expect(Money.multiply(a, 3)).toBe(30)
  })

  it("rejects negative amounts", () => {
    expect(() => moneySchema.parse(-1)).toThrow()
  })
})
