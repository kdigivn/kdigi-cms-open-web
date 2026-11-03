import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { BlogIndex, blogIndexMetadata } from "@/components/site/blog-index"
import { listPosts, paginate } from "@/lib/cms"

export const revalidate = 3600
export const dynamicParams = true

type PageProps = { params: Promise<{ page: string }> }

export async function generateStaticParams(): Promise<{ page: string }[]> {
  try {
    const { totalPages } = paginate(await listPosts(), 1)
    return Array.from({ length: Math.max(0, totalPages - 1) }, (_, index) => ({ page: String(index + 2) }))
  } catch {
    return []
  }
}

async function pageNumber(params: PageProps["params"]): Promise<number> {
  const n = Number((await params).page)
  if (!Number.isInteger(n) || n < 2) notFound()
  const { totalPages } = paginate(await listPosts(), 1)
  if (n > totalPages) notFound()
  return n
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  return blogIndexMetadata(await pageNumber(params))
}

export default async function BlogPageN({ params }: PageProps) {
  return <BlogIndex page={await pageNumber(params)} />
}
