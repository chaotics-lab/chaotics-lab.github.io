import { Link } from "react-router-dom";
import { getAllPosts, getAllSeries } from "@/lib/blog";
import { Header } from "@/components/portfolio/Header";
import { Footer } from "@/components/portfolio/Footer";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Calendar } from "lucide-react";

function formatDate(dateStr: string) {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
}

const BlogPage = () => {
  const posts = getAllPosts();
  const series = getAllSeries();

  return (
    <div className="bg-background starfield min-h-screen">
      <Header />

      <main className="container mx-auto px-6 pt-28 pb-20 max-w-5xl">
        {/* Page heading */}
        <div className="mb-12">
          <h1 className="text-4xl font-display font-bold text-white mb-3">Blog</h1>
          <p className="text-space-muted font-ui text-base">
            Notes, write-ups, and the occasional deep-dive.
          </p>
          <div className="mt-4 h-px bg-white/10" />
        </div>

        {/* Post list */}
        {posts.length === 0 ? (
          <p className="text-space-muted font-ui">No posts yet.</p>
        ) : (
          <ul className="flex flex-col gap-6">
            {posts.map((post) => (
              <li key={post.slug}>
                <Link
                  to={`/blog/${post.slug}`}
                  className="group flex flex-col sm:flex-row relative rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-0.5"
                >
                  {/* Card background */}
                  <div className="absolute inset-0 rounded-2xl bg-white/5 border border-white/10 transition-all duration-300 group-hover:bg-white/8 group-hover:border-white/20" />
                  <div
                    className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10"
                    style={{ boxShadow: "0 0 30px rgba(255,255,255,0.08)" }}
                  />

                  {/* Cover image */}
                  {post.coverImage && (
                    <div className="relative sm:w-56 sm:shrink-0 h-44 sm:h-auto overflow-hidden rounded-t-2xl sm:rounded-l-2xl sm:rounded-tr-none">
                      <img
                        src={post.coverImage}
                        alt={post.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent to-black/30" />
                    </div>
                  )}

                  <div className="relative flex-1 p-6">
                    {/* Date */}
                    {post.date && (
                      <div className="flex items-center gap-1.5 text-space-muted text-xs font-ui mb-2">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>{formatDate(post.date)}</span>
                      </div>
                    )}

                    {/* Title */}
                    <h2 className="text-xl font-display font-semibold text-white mb-2 group-hover:text-white/90 transition-colors duration-200">
                      {post.title}
                    </h2>

                    {/* Description */}
                    {post.description && (
                      <p className="text-space-muted font-ui text-sm leading-relaxed mb-4">
                        {post.description}
                      </p>
                    )}

                    {/* Tags */}
                    {post.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {post.tags.map((tag) => (
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
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
        {/* Series section */}
        {series.length > 0 && (
          <div className="mt-16">
            <div className="flex items-center gap-3 mb-6">
              <div className="h-px flex-1 bg-white/10" />
              <span className="text-space-muted text-xs font-ui uppercase tracking-widest flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5" /> Series
              </span>
              <div className="h-px flex-1 bg-white/10" />
            </div>
            <ul className="flex flex-col gap-4">
              {series.map((s) => {
                const latest = s.posts[s.posts.length - 1];
                const allTags = [...new Set(s.posts.flatMap((p) => p.tags))].slice(0, 5);
                return (
                  <li key={s.id}>
                    <Link
                      to={`/blog/${s.id}`}
                      className="group flex items-center gap-5 relative rounded-2xl p-5 transition-all duration-300 hover:-translate-y-0.5"
                    >
                      <div className="absolute inset-0 rounded-2xl bg-white/5 border border-white/10 transition-all duration-300 group-hover:bg-white/8 group-hover:border-white/20" />
                      <div
                        className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10"
                        style={{ boxShadow: "0 0 24px rgba(255,255,255,0.07)" }}
                      />
                      {/* Icon */}
                      <div className="relative shrink-0 w-12 h-12 flex items-center justify-center rounded-xl bg-white/8 border border-white/15 group-hover:bg-white/12 transition-colors duration-200">
                        <BookOpen className="w-5 h-5 text-space-muted group-hover:text-white transition-colors duration-200" />
                      </div>
                      <div className="relative flex-1 min-w-0">
                        <div className="flex items-baseline gap-2 mb-0.5">
                          <h2 className="text-base font-display font-semibold text-white group-hover:text-white/90 transition-colors duration-200">
                            {s.title}
                          </h2>
                          <span className="text-xs font-ui text-space-muted">{s.posts.length} posts</span>
                        </div>
                        {latest?.date && (
                          <p className="text-space-muted text-xs font-ui mb-2">
                            Last updated {formatDate(latest.date)}
                          </p>
                        )}
                        {allTags.length > 0 && (
                          <div className="flex flex-wrap gap-1.5">
                            {allTags.map((tag) => (
                              <Badge key={tag} variant="outline" className="text-xs font-ui border-white/15 text-space-muted bg-white/5 px-2 py-0">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default BlogPage;
