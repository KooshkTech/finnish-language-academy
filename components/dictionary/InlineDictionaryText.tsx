"use client"

import { useState } from "react"
import { searchDictionary } from "@/data/dictionary"

export function InlineDictionaryText({ text, language = "fi" }: { text: string; language?: "fi" | "sv" }) {
  const [selected, setSelected] = useState<string>()
  const words = text.split(/(\s+)/)
  const entry = selected ? searchDictionary(selected.replace(/[.,!?;:]/g, ""), language)[0] : undefined
  const openDictionaryLabel = language === "sv" ? "Öppna i ordboken →" : "Avaa sanakirjassa →"
  const missingEntryLabel = language === "sv" ? "Finns inte ännu i OpiOpes ordbok." : "Ei vielä OpiOpen sanakirjassa."

  return (
    <span className="inline-dictionary">
      <span className="inline-dictionary-text">
        {words.map((word, index) =>
          /^\s+$/.test(word) ? (
            word
          ) : (
            <button
              type="button"
              key={`${word}-${index}`}
              onClick={() => setSelected(word)}
            >
              {word}
            </button>
          ),
        )}
      </span>

      {selected && (
        <span className="dictionary-tooltip" role="status" aria-live="polite">
          {entry ? (
            <>
              <strong>{entry.headword}</strong>
              <span>{entry.ipaPhonetic}</span>
              <span>{entry.definitions[0]?.definitionNative}</span>
              <a href={`/dictionary?q=${encodeURIComponent(entry.headword)}`}>{openDictionaryLabel}</a>
            </>
          ) : (
            <>
              <strong>{selected}</strong>
              <span>{missingEntryLabel}</span>
            </>
          )}
        </span>
      )}
    </span>
  )
}

