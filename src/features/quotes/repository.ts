import { createPrivilegedClient } from "@/lib/db/server"

export type CatalogOption = { id: number; name: string }

export async function listCustomers(): Promise<CatalogOption[]> {
  const { data, error } = await createPrivilegedClient().from("customers").select("id, name").order("name")
  if (error) throw new Error(error.message)
  return data
}

export async function listWindowTypes(): Promise<CatalogOption[]> {
  const { data, error } = await createPrivilegedClient().from("window_types").select("id, name").order("name")
  if (error) throw new Error(error.message)
  return data
}

export async function listGlassTypes(): Promise<CatalogOption[]> {
  const { data, error } = await createPrivilegedClient().from("glass_types").select("id, name").order("name")
  if (error) throw new Error(error.message)
  return data
}
