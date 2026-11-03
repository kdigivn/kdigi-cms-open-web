import { ArrowRight } from "lucide-react"

import { ButtonLink } from "@/components/ui/button"
import type { Post } from "@/lib/cms"

import { PostCard } from "../post-card"
import { Section } from "../section"

/** Latest posts of the `opencms` site, read from the CMS. */
export function LatestPosts({ posts }: { posts: Post[] }) {
  if (posts.length === 0) return null
  return (
    <Section
      id="tin-tuc"
      eyebrow="Tin tức và nhật ký phát hành"
      title="Mới nhất từ KDIGI CMS"
      lead="Các bản phát hành, bản vá và hướng dẫn thực hành. Bài viết được soạn và đăng bằng chính KDIGI CMS."
    >
      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {posts.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}
      </div>
      <div className="mt-8 flex justify-center">
        <ButtonLink href="/blog" variant="outline" size="lg">
          Xem tất cả bài viết
          <ArrowRight aria-hidden="true" />
        </ButtonLink>
      </div>
    </Section>
  )
}
