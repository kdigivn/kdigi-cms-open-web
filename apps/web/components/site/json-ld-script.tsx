import type { JsonLd } from "@/lib/json-ld"

/** Prints one JSON-LD document. `<` is escaped so CMS text can never close the script element. */
export function JsonLdScript({ data }: { data: JsonLd }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }} />
}
