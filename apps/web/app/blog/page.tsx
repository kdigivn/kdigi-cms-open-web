import type { Metadata } from "next"

import { BlogIndex, blogIndexMetadata } from "@/components/site/blog-index"

export const revalidate = 3600

export const metadata: Metadata = blogIndexMetadata(1)

export default function BlogIndexPage() {
  return <BlogIndex page={1} />
}
