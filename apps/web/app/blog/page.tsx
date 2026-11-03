import type { Metadata } from "next"

import { JsonLdScript } from "@/components/site/json-ld-script"
import { PostCard } from "@/components/site/post-card"
import { Section } from "@/components/site/section"
import { listPosts } from "@/lib/cms"
import { breadcrumbs, graph } from "@/lib/json-ld"
import { absoluteUrl } from "@/lib/site"

export const revalidate = 3600

export const metadata: Metadata = {
  title: "Blog và nhật ký phát hành",
  description: "Bản phát hành, bản vá và hướng dẫn thực hành của KDIGI CMS, soạn và đăng bằng chính KDIGI CMS.",
  alternates: { canonical: absoluteUrl("/blog") },
}

export default async function BlogIndexPage() {
  const posts = await listPosts()
  return (
    <main id="main" tabIndex={-1}>
      <Section
        eyebrow="Blog"
        title="Tin tức và nhật ký phát hành"
        lead="Các bản phát hành, bản vá và hướng dẫn thực hành của KDIGI CMS."
        className="pt-12 md:pt-16"
      >
        {posts.length === 0 ? (
          <p className="text-center text-muted-foreground">Chưa có bài viết nào.</p>
        ) : (
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        )}
      </Section>
      <JsonLdScript data={graph(breadcrumbs([{ name: "Trang chủ", path: "/" }, { name: "Blog", path: "/blog" }]))} />
    </main>
  )
}
