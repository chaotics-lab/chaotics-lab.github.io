import { Link } from "react-router-dom";
import { getAllPosts, getAllSeries } from "@/lib/blog";
import { usePageTransition } from "@/hooks/usePageTransition";
import { Header } from "@/components/portfolio/Header";
import { Footer } from "@/components/portfolio/Footer";
import { Badge } from "@/components/ui/badge";
import { BookOpenText, Calendar } from "lucide-react";

function formatDate(dateStr: string) {
  if (!dateStr) return null;
  return new Date(dateStr).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
}

const BlogPage = () => {
  const posts = getAllPosts();
  const series = getAllSeries();
  const { opacity, transitionTo, FADE_MS } = usePageTransition();

  return (
    <div className="bg-background starfield min-h-screen">
      <Header />

      <main
        className="container mx-auto px-6 pt-28 pb-20 max-w-5xl"
        style={{ opacity, transition: `opacity ${FADE_MS}ms ease` }}
      >
        <div className="mb-12">
          <h1 className="text-4xl font-display font-bold text-white mb-3">Blog</h1>
          <p className="text-space-muted font-ui text-base">Notes, write-ups, and the occasional deep-dive.</p>
          <div className="mt-4 h-px bg-white/10" />
        </div>

        {/* Standalone post list */}
        {posts.length === 0 ? (
          <p className="text-space-muted font-ui">No posts yet.</p>
        ) : (
          <ul className="flex flex-col gap-6">
            {posts.map((post) => (
              <li key={post.slug}>
                <button
                  onClick={() => transitionTo(`/blog/${post.slug}`)}
                  className="group flex flex-col sm:flex-row relative rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-0.5 w-full text-left"
                >
                  <div className="absolute inset-0 rounded-2xl bg-white/5 border border-white/10 transition-all duration-300 group-hover:bg-white/8 group-hover:border-white/20" />
                  <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10"
                    style={{ boxShadow: "0 0 30px rgba(255,255,255,0.08)" }} />

                  {post.coverImage && (
                    <div className="relative sm:w-56 sm:shrink-0 h-44 sm:h-auto overflow-hidden rounded-t-2xl sm:rounded-l-2xl sm:rounded-tr-none">
                      <img src={post.coverImage} alt={post.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent to-black/30" />
                    </div>
                  )}

                  <div className="relative flex-1 p-6">
                    {post.date && (
                      <div className="flex items-center gap-1.5 text-space-muted text-xs font-ui mb-2">
                        <Calendar className="w-3.5 h-3.5" /><span>{formatDate(post.date)}</span>
                      </div>
                    )}
                    <h2 className="text-xl font-display font-semibold text-white mb-2 group-hover:text-white/90 transition-colors duration-200">{post.title}</h2>
                    {post.description && <p className="text-space-muted font-ui text-sm leading-relaxed mb-4">{post.description}</p>}
                    {post.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {post.tags.map((tag) => (
                          <Badge key={tag} variant="outline" className="text-xs font-ui border-white/15 text-space-muted bg-white/5 px-2 py-0.5">{tag}</Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </button>
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
                <BookOpenText className="w-3.5 h-3.5" /> Series
              </span>
              <div className="h-px flex-1 bg-white/10" />
            </div>
            <ul className="flex flex-col gap-6">
              {series.map((s) => {
                const latest = s.posts[s.posts.length - 1];
                const allTags = [...new Set(s.posts.flatMap((p) => p.tags))].slice(0, 5);
                return (
                  <li key={s.id}>
                    <button
                      onClick={() => transitionTo(`/blog/${s.id}`)}
                      className="group flex flex-col sm:flex-row relative rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-0.5 w-full text-left"
                    >
                      <div className="absolute inset-0 rounded-2xl bg-white/5 border border-white/10 transition-all duration-300 group-hover:bg-white/8 group-hover:border-white/20" />
                      <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10"
                        style={{ boxShadow: "0 0 30px rgba(255,255,255,0.08)" }} />

                      {/* Cover image — same layout as posts */}
                      {s.coverImage && (
                        <div className="relative sm:w-56 sm:shrink-0 h-44 sm:h-auto overflow-hidden rounded-t-2xl sm:rounded-l-2xl sm:rounded-tr-none">
                          <img src={s.coverImage} alt={s.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent to-black/30" />
                          {/* Series badge overlaid on image */}
                          <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-black/50 backdrop-blur-sm rounded-lg px-2 py-1 border border-white/10">
                            <BookOpenText className="w-3 h-3 text-white/70" />
                            <span className="text-white/70 text-xs font-ui">Series</span>
                          </div>
                        </div>
                      )}

                      {/* Fallback icon when no cover image */}
                      {!s.coverImage && (
                        <div className="relative sm:w-56 sm:shrink-0 h-24 sm:h-auto flex items-center justify-center bg-white/3 rounded-t-2xl sm:rounded-l-2xl sm:rounded-tr-none border-b sm:border-b-0 sm:border-r border-white/10">
                          <BookOpenText className="w-8 h-8 text-white/20" />
                        </div>
                      )}

                      <div className="relative flex-1 p-6">
                        {/* Series label + post count */}
                        <div className="flex items-center gap-2 mb-2">
                          {!s.coverImage && (
                            <span className="text-space-muted text-xs font-ui uppercase tracking-widest">Series</span>
                          )}
                          <span className="text-space-muted text-xs font-ui">{s.posts.length} posts</span>
                          {latest?.date && (
                            <span className="text-space-muted text-xs font-ui">
                              · Updated {formatDate(latest.date)}
                            </span>
                          )}
                        </div>

                        <h2 className="text-xl font-display font-semibold text-white mb-2 group-hover:text-white/90 transition-colors duration-200">{s.title}</h2>

                        {s.description && (
                          <p className="text-space-muted font-ui text-sm leading-relaxed mb-4">{s.description}</p>
                        )}

                        {allTags.length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {allTags.map((tag) => (
                              <Badge key={tag} variant="outline" className="text-xs font-ui border-white/15 text-space-muted bg-white/5 px-2 py-0.5">{tag}</Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    </button>
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