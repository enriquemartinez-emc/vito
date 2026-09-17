/** Forces a switch/if-chain over a closed union to be exhaustive at compile time. */
export function assertNever(x: never): never {
  throw new Error(`Unhandled case: ${JSON.stringify(x)}`)
}
