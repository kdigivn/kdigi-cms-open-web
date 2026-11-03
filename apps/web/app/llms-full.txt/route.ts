import { buildLlmsFullTxt, TEXT_HEADERS } from "@/lib/llms"

export const revalidate = 3600

export async function GET(): Promise<Response> {
  return new Response(await buildLlmsFullTxt(), { headers: TEXT_HEADERS })
}
