import { useParams, Link } from "react-router-dom";
import { getSeriesById } from "@/lib/blog";
import { Header } from "@/components/portfolio/Header";
import { Footer } from "@/components/portfolio/Footer";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Calendar, BookOpen } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

function formatDate(dateStr: string) {
  if (!dateStr) return null;
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

const SeriesPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const series = slug ? getSeriesById(slug) : undefined;

  if (!series) {
    return (
      <div className="bg-background starfield min-h-screen">
        <Header />
        <main className="container mx-auto px-6 pt-28 pb-20 max-w-5xl">
          <Link
            to="/blog"
            className="inline-flex items-center gap-2 text-space-muted hover:text-white text-sm font-ui transition-colors duration-200 mb-8"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Blog
          </Link>
          <p className="text-white font-display text-2xl">Series not found.</p>
        </main>
        <Footer />
      </div>
    );
  }

  const allTags = [...new Set(series.posts.flatMap((p) => p.tags))];

  return (
    <div className="bg-background starfield min-h-screen">
      <Header />

      <main className="container mx-auto px-6 pt-28 pb-20 max-w-5xl">
        {/* Back link */}
        <Link
          to="/blog"
          className="inline-flex items-center gap-2 text-space-muted hover:text-white text-sm font-ui transition-colors duration-200 mb-10"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Blog
        </Link>

        {/* Cover image */}
        {series.coverImage && (
          <div className="relative w-full h-56 md:h-72 rounded-2xl overflow-hidden mb-10 border border-white/10">
            <img
              src={series.coverImage}
              alt={series.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
          </div>
        )}

        {/* Series header */}
        <div className="mb-10">
          <div className="flex items-center gap-2 mb-3">
            <BookOpen className="w-4 h-4 text-space-muted" />
            <span className="text-space-muted text-xs font-ui uppercase tracking-widest">
              Series
            </span>
          </div>

          <h1 className="text-4xl font-display font-bold text-white mb-3">
            {series.title}
          </h1>

          <p className="text-space-muted font-ui text-sm mb-4">
            {series.posts.length} posts
          </p>

          {/* Tags from all posts combined */}
          {allTags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-6">
              {allTags.map((tag) => (
                <Badge
                  key={tag}
                  variant="outline"
                  className="text-xs font-ui border-white/15 text-space-muted bg-white/5 px-2 py-0.5"
                >
                  {tag}
                </Badge>
              ))}
            </div>
          )}

          <div className="h-px bg-white/10" />
        </div>

        {/* Intro body from index.md — only rendered if it has content */}
        {series.intro && (
          <div className="mb-12">
            <article
              className="prose prose-invert prose-sm md:prose-base max-w-none
                prose-headings:font-display prose-headings:text-white prose-headings:font-semibold
                prose-p:font-prose prose-p:text-space-muted prose-p:leading-relaxed prose-p:text-base
                prose-a:text-white prose-a:underline prose-a:decoration-white/30 hover:prose-a:decoration-white/70
                prose-strong:text-white prose-strong:font-semibold
                prose-code:text-white/85 prose-code:bg-white/8 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-sm prose-code:font-mono prose-code:before:content-none prose-code:after:content-none
                prose-blockquote:border-white/20 prose-blockquote:text-space-muted
                prose-hr:border-white/10
                prose-li:text-space-muted prose-li:font-prose
              "
            >
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {series.intro}
              </ReactMarkdown>
            </article>
            <div className="mt-10 h-px bg-white/10" />
          </div>
        )}

        {/* Post list */}
        <div className="flex items-center gap-3 mb-6">
          <span className="text-space-muted text-xs font-ui uppercase tracking-widest">
            Posts in this series
          </span>
          <div className="h-px flex-1 bg-white/10" />
        </div>

        <ol className="flex flex-col gap-4">
          {series.posts.map((post, idx) => (
            <li key={post.slug}>
              <Link
                to={`/blog/${series.id}/${post.slug}`}
                className="group flex items-start gap-5 relative rounded-2xl p-5 transition-all duration-300 hover:-translate-y-0.5"
              >
                <div className="absolute inset-0 rounded-2xl bg-white/5 border border-white/10 transition-all duration-300 group-hover:bg-white/8 group-hover:border-white/20" />
                <div
                  className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10"
                  style={{ boxShadow: "0 0 24px rgba(255,255,255,0.07)" }}
                />

                {/* Index number */}
                <span className="relative shrink-0 w-8 h-8 flex items-center justify-center rounded-lg bg-white/8 border border-white/15 text-xs font-mono text-space-muted group-hover:text-white transition-colors duration-200">
                  {String(idx + 1).padStart(2, "0")}
                </span>

                <div className="relative flex-1 min-w-0">
                  <h2 className="text-base font-display font-semibold text-white mb-1 group-hover:text-white/90 transition-colors duration-200">
                    {post.title}
                  </h2>
                  {post.description && (
                    <p className="text-space-muted font-ui text-sm leading-relaxed line-clamp-2 mb-2">
                      {post.description}
                    </p>
                  )}
                  <div className="flex flex-wrap items-center gap-3">
                    {post.date && (
                      <span className="flex items-center gap-1 text-space-muted text-xs font-ui">
                        <Calendar className="w-3 h-3" />
                        {formatDate(post.date)}
                      </span>
                    )}
                    {post.tags.map((tag) => (
                      <Badge
                        key={tag}
                        variant="outline"
                        className="text-xs font-ui border-white/15 text-space-muted bg-white/5 px-2 py-0"
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              </Link>
            </li>
          ))}
        </ol>
      </main>

      <Footer />
    </div>
  );
};

export default SeriesPage;