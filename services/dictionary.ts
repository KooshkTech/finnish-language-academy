import { searchDictionary } from "@/data/dictionary"

export function lookupDictionary(query: string, language?: "fi" | "sv") {
  return { query, entries: searchDictionary(query, language) }
}

