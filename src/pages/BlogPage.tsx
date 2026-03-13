import { useState } from "react";
import { getAllPosts, getAllSeries } from "@/lib/blog";
import { usePageTransition } from "@/hooks/usePageTransition";
import { Header } from "@/components/portfolio/Header";
import { Footer } from "@/components/portfolio/Footer";
import { BookOpenText, Calendar, ChevronDown } from "lucide-react";

function formatDate(dateStr: string) {
  if (!dateStr) return null;
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function FeaturedCard({
  title, description, coverImage, date, tag, isSeries, postCount, onClick,
}: {
  title: string; description?: string; coverImage?: string; date?: string;
  tag?: string; isSeries?: boolean; postCount?: number; onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="group relative rounded-2xl overflow-hidden text-left flex flex-col justify-end w-full"
      style={{ aspectRatio: "16/9" }}
    >
      {coverImage
        ? <img src={coverImage} alt={title} className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
        : <div className="absolute inset-0 bg-white/5 border border-white/10" />
      }
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
      <div className="relative p-5">
        <div className="flex items-center gap-2 mb-2">
          {isSeries && (
            <span className="inline-flex items-center gap-1 text-xs font-ui bg-white/15 backdrop-blur-sm border border-white/20 rounded-full px-2.5 py-0.5 text-white/80">
              <BookOpenText className="w-3 h-3" /> Series · {postCount} posts
            </span>
          )}
          {tag && !isSeries && (
            <span className="inline-block text-xs font-ui bg-white/15 backdrop-blur-sm border border-white/20 rounded-full px-2.5 py-0.5 text-white/80">
              {tag}
            </span>
          )}
        </div>
        <h3 className="text-white font-display font-bold text-xl leading-snug mb-1 group-hover:text-white/85 transition-colors duration-200">
          {title}
        </h3>
        {description && (
          <p className="text-white/55 font-ui text-sm leading-relaxed line-clamp-2">{description}</p>
        )}
        {date && <p className="text-white/40 font-ui text-xs mt-2">{formatDate(date)}</p>}
      </div>
    </button>
  );
}

function PostCard({
  title, description, coverImage, tag, isSeries, onClick,
}: {
  title: string; description?: string; coverImage?: string;
  tag?: string; isSeries?: boolean; onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="group relative rounded-2xl overflow-hidden text-left flex flex-col justify-end w-full"
      style={{ aspectRatio: "3/4" }}
    >
      {coverImage
        ? <img src={coverImage} alt={title} className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
        : <div className="absolute inset-0 bg-white/5 border border-white/10" />
      }
      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />
      <div className="relative p-4">
        {isSeries && (
          <span className="inline-flex items-center gap-1 text-xs font-ui bg-white/15 backdrop-blur-sm border border-white/20 rounded-full px-2.5 py-0.5 text-white/80 mb-2">
            <BookOpenText className="w-3 h-3" /> Series
          </span>
        )}
        {tag && !isSeries && (
          <span className="inline-block text-xs font-ui bg-white/15 backdrop-blur-sm border border-white/20 rounded-full px-2.5 py-0.5 text-white/80 mb-2">
            {tag}
          </span>
        )}
        <h3 className="text-white font-display font-semibold text-sm leading-snug mb-1 group-hover:text-white/85 transition-colors duration-200">
          {title}
        </h3>
        {description && (
          <p className="text-white/50 font-ui text-xs leading-relaxed line-clamp-2">{description}</p>
        )}
      </div>
    </button>
  );
}

function SidebarRow({
  title, date, coverImage, meta, icon, onClick,
}: {
  title: string; date?: string; coverImage?: string;
  meta?: string; icon?: React.ReactNode; onClick: () => void;
}) {
  return (
    <button onClick={onClick} className="group flex gap-3 items-start text-left w-full">
      <div className="w-16 h-16 shrink-0 rounded-xl overflow-hidden bg-white/5 border border-white/10 flex items-center justify-center">
        {coverImage
          ? <img src={coverImage} alt={title} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
          : (icon ?? <div className="w-full h-full bg-white/5" />)
        }
      </div>
      <div className="flex-1 min-w-0">
        {date && (
          <div className="flex items-center gap-1 text-space-muted font-ui text-xs mb-0.5">
            <Calendar className="w-3 h-3" /><span>{formatDate(date)}</span>
          </div>
        )}
        <p className="text-white font-ui text-sm font-medium leading-snug group-hover:text-white/70 transition-colors duration-200 line-clamp-2">
          {title}
        </p>
        {meta && <p className="text-space-muted font-ui text-xs mt-0.5">{meta}</p>}
      </div>
    </button>
  );
}

function SidebarSection({
  label, children, total, visible, onShowMore,
}: {
  label: string; children: React.ReactNode;
  total: number; visible: number; onShowMore: () => void;
}) {
  return (
    <div>
      <div className="flex items-center gap-3 mb-5">
        <h2 className="text-white font-display font-semibold text-base shrink-0">{label}</h2>
        <div className="h-px flex-1 bg-white/10" />
      </div>
      <div className="flex flex-col gap-4">{children}</div>
      {total > visible && (
        <button
          onClick={onShowMore}
          className="mt-4 flex items-center gap-1.5 text-space-muted font-ui text-xs hover:text-white transition-colors duration-200 group"
        >
          <ChevronDown className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-y-0.5" />
          Show {Math.min(4, total - visible)} more
        </button>
      )}
    </div>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────

const SIDEBAR_STEP = 4;

const BlogPage = () => {
  const allPosts  = getAllPosts();
  const allSeries = getAllSeries();
  const { opacity, transitionTo, FADE_MS } = usePageTransition();

  const [visibleSeries, setVisibleSeries] = useState(SIDEBAR_STEP);
  const [visibleLatest, setVisibleLatest] = useState(SIDEBAR_STEP);

  type AnyItem = (typeof allPosts)[number] | (typeof allSeries)[number];
  const isSeries = (item: AnyItem): item is (typeof allSeries)[number] => "posts" in item;

  // featured: true  → big hero card(s) at the top of the left column
  // pinned: true    → sidebar "Pinned" section (item still shows in recent too)
  const featuredItems: AnyItem[] = [
    ...allSeries.filter((s) => s.featured),
    ...allPosts.filter((p) => p.featured),
  ];

  const pinnedItems: AnyItem[] = [
    ...allSeries.filter((s) => s.pinned),
    ...allPosts.filter((p) => p.pinned),
  ];

  // Recent = everything not featured, sorted newest first
  // Includes pinned items and series
  const recentItems: AnyItem[] = [
    ...allSeries.filter((s) => !s.featured),
    ...allPosts.filter((p) => !p.featured),
  ].sort((a, b) => {
    const dateA = isSeries(a) ? (a.posts.at(-1)?.date ?? "") : a.date;
    const dateB = isSeries(b) ? (b.posts.at(-1)?.date ?? "") : b.date;
    if (!dateA && !dateB) return 0;
    if (!dateA) return 1;
    if (!dateB) return -1;
    return new Date(dateB).getTime() - new Date(dateA).getTime();
  });

  return (
    <div className="bg-background starfield min-h-screen">
      <Header />

      <main
        className="container mx-auto px-4 sm:px-6 pt-28 pb-20 max-w-6xl"
        style={{ opacity, transition: `opacity ${FADE_MS}ms ease` }}
      >
        {/* Page header */}
        <div className="mb-12 text-center">
          <p className="text-space-muted font-ui text-xs uppercase tracking-widest mb-3">Blog</p>
          <h1 className="text-4xl sm:text-5xl font-display font-bold text-white mb-4">
            Notes & deep-dives
          </h1>
          <p className="text-space-muted font-ui text-base max-w-xl mx-auto">
            Write-ups on things I build, learn, and occasionally break.
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-10">

          {/* ── Left: featured + recent ── */}
          <div className="flex-1 min-w-0 flex flex-col gap-10">

            {/* Featured (big hero) */}
            {featuredItems.length > 0 && (
              <section>
                <div className="flex items-center gap-3 mb-5">
                  <h2 className="text-white font-display font-semibold text-base shrink-0">Featured</h2>
                  <div className="h-px flex-1 bg-white/10" />
                </div>
                <div className="flex flex-col gap-4">
                  {(() => {
                    const item = featuredItems[0];
                    const series = isSeries(item);
                    return (
                      <FeaturedCard
                        title={item.title}
                        description={item.description}
                        coverImage={item.coverImage}
                        date={series ? item.posts.at(-1)?.date : item.date}
                        tag={!series ? item.tags?.[0] : undefined}
                        isSeries={series}
                        postCount={series ? item.posts.length : undefined}
                        onClick={() => transitionTo(series ? `/blog/${item.id}` : `/blog/${item.slug}`)}
                      />
                    );
                  })()}
                  {featuredItems.length > 1 && (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                      {featuredItems.slice(1).map((item) => {
                        const series = isSeries(item);
                        return (
                          <PostCard
                            key={series ? item.id : item.slug}
                            title={item.title}
                            description={item.description}
                            coverImage={item.coverImage}
                            tag={!series ? item.tags?.[0] : undefined}
                            isSeries={series}
                            onClick={() => transitionTo(series ? `/blog/${item.id}` : `/blog/${item.slug}`)}
                          />
                        );
                      })}
                    </div>
                  )}
                </div>
              </section>
            )}

            {/* Recent — posts + series, pinned included */}
            {recentItems.length > 0 && (
              <section>
                <div className="flex items-center gap-3 mb-5">
                  <h2 className="text-white font-display font-semibold text-base shrink-0">Recent</h2>
                  <div className="h-px flex-1 bg-white/10" />
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {recentItems.map((item) => {
                    const series = isSeries(item);
                    return (
                      <PostCard
                        key={series ? item.id : item.slug}
                        title={item.title}
                        description={item.description}
                        coverImage={item.coverImage}
                        tag={!series ? item.tags?.[0] : undefined}
                        isSeries={series}
                        onClick={() => transitionTo(series ? `/blog/${item.id}` : `/blog/${item.slug}`)}
                      />
                    );
                  })}
                </div>
              </section>
            )}

            {allPosts.length === 0 && allSeries.length === 0 && (
              <p className="text-space-muted font-ui">No posts yet.</p>
            )}
          </div>

          {/* ── Right: sidebar ── */}
          <aside className="w-full lg:w-64 shrink-0 flex flex-col gap-10">

            {pinnedItems.length > 0 && (
              <SidebarSection
                label="Pinned"
                total={pinnedItems.length}
                visible={pinnedItems.length}
                onShowMore={() => {}}
              >
                {pinnedItems.map((item) => {
                  const series = isSeries(item);
                  return (
                    <SidebarRow
                      key={series ? item.id : item.slug}
                      title={item.title}
                      date={series ? item.posts.at(-1)?.date : item.date}
                      coverImage={item.coverImage}
                      meta={series ? `${item.posts.length} ${item.posts.length === 1 ? "post" : "posts"}` : item.tags?.[0]}
                      icon={series ? <BookOpenText className="w-5 h-5 text-white/20" /> : undefined}
                      onClick={() => transitionTo(series ? `/blog/${item.id}` : `/blog/${item.slug}`)}
                    />
                  );
                })}
              </SidebarSection>
            )}

            {allSeries.length > 0 && (
              <SidebarSection
                label="Series"
                total={allSeries.length}
                visible={visibleSeries}
                onShowMore={() => setVisibleSeries((v) => v + SIDEBAR_STEP)}
              >
                {allSeries.slice(0, visibleSeries).map((s) => (
                  <SidebarRow
                    key={s.id}
                    title={s.title}
                    date={s.posts.at(-1)?.date}
                    coverImage={s.coverImage}
                    meta={`${s.posts.length} ${s.posts.length === 1 ? "post" : "posts"}`}
                    icon={<BookOpenText className="w-5 h-5 text-white/20" />}
                    onClick={() => transitionTo(`/blog/${s.id}`)}
                  />
                ))}
              </SidebarSection>
            )}

            {allPosts.length > 0 && (
              <SidebarSection
                label="Latest"
                total={allPosts.length}
                visible={visibleLatest}
                onShowMore={() => setVisibleLatest((v) => v + SIDEBAR_STEP)}
              >
                {allPosts.slice(0, visibleLatest).map((post) => (
                  <SidebarRow
                    key={post.slug}
                    title={post.title}
                    date={post.date}
                    coverImage={post.coverImage}
                    onClick={() => transitionTo(`/blog/${post.slug}`)}
                  />
                ))}
              </SidebarSection>
            )}
          </aside>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default BlogPage;