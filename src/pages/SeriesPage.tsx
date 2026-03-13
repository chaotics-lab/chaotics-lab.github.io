import { useState, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { getSeriesById } from "@/lib/blog";
import { Header } from "@/components/portfolio/Header";
import { Footer } from "@/components/portfolio/Footer";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Calendar, BookOpenText, Check, Clipboard } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import type { Components } from "react-markdown";

// ----------------- CodeBlock -----------------
function CodeBlock({ language, codeString }: { language: string; codeString: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(codeString);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };
  return (
    <div className="my-6 rounded-xl overflow-hidden" style={{ border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.04)" }}>
      <div className="flex items-center justify-between px-4 py-2" style={{ borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
        <span className="italic text-xs text-space-muted">{language}</span>
        <button className="group flex items-center gap-1 px-2 py-1 rounded hover:bg-white/10 transition" onClick={handleCopy} aria-label="Copy code block">
          {copied ? <Check className="w-4 h-4 text-green-400" /> : <Clipboard className="w-4 h-4 text-space-muted group-hover:text-white transition" />}
        </button>
      </div>
      <SyntaxHighlighter
        style={oneDark}
        language={language}
        PreTag="pre"
        customStyle={{ borderRadius: 0, border: "none", fontSize: "0.875rem", margin: 0, background: "transparent", padding: "1rem" }}
        codeTagProps={{ style: { fontFamily: "'Fira Code', 'JetBrains Mono', monospace", padding: 0, background: "none" } }}
      >
        {codeString}
      </SyntaxHighlighter>
    </div>
  );
}

// ----------------- SeriesPage -----------------
const SeriesPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const series = slug ? getSeriesById(slug) : undefined;

  const figureCounter = useRef(0); // compteur global pour ce post

  if (!series) {
    return (
      <div className="bg-background starfield min-h-screen">
        <Header />
        <main className="container mx-auto px-6 pt-28 pb-20 max-w-5xl">
          <Link to="/blog" className="inline-flex items-center gap-2 text-space-muted hover:text-white text-sm font-ui transition-colors duration-200 mb-8">
            <ArrowLeft className="w-4 h-4" /> Back to Blog
          </Link>
          <p className="text-white font-display text-2xl">Series not found.</p>
        </main>
        <Footer />
      </div>
    );
  }

  const allTags = [...new Set(series.posts.flatMap((p) => p.tags))];

  function formatDate(dateStr: string) {
    if (!dateStr) return null;
    return new Date(dateStr).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
  }

  // ----------------- Markdown Components -----------------
  const markdownComponents: Components = {
    pre({ children }) {
      return <>{children}</>;
    },
    code({ className, children, ...props }) {
      const match = /language-(\w+)/.exec(className ?? "");
      const codeString = String(children).replace(/\n$/, "");
      if (match) return <CodeBlock language={match[1]} codeString={codeString} />;
      return <code className={className} {...props}>{children}</code>;
    },
    p({ children }) {
      const arr = Array.isArray(children) ? children : [children];
      const hasOnlyImage = arr.length === 1 && typeof arr[0] === "object" && (arr[0] as React.ReactElement)?.type === "img";
      if (hasOnlyImage) return <>{children}</>;
      return <p>{children}</p>;
    },
    img({ src, alt }) {
      if (!src) return null;

      const hasCaption = alt && alt.trim().length > 0;
      if (hasCaption) {
        figureCounter.current += 1;
        return (
          <figure style={{ margin: "2rem 0", width: "100%" }} className="not-prose">
            <div style={{ border: "1px solid rgba(255,255,255,0.1)", borderRadius: "0.75rem", overflow: "hidden" }}>
              <img src={src} alt={alt} style={{ width: "100%", display: "block" }} />
            </div>
            <figcaption className="font-ui font-medium italic" style={{ textAlign: "left", fontSize: "1.5em", marginTop: "0.5rem", color: "var(--color-space-muted)" }}>
              Figure {figureCounter.current}: {alt}
            </figcaption>
          </figure>
        );
      }

      return <img src={src} alt="" style={{ width: "100%", display: "block", margin: "2rem 0" }} />;
    },
  };

  // reset du compteur pour chaque post rendu
  figureCounter.current = 0;

  return (
    <div className="bg-background starfield min-h-screen">
      <Header />

      <main className="container mx-auto px-6 pt-28 pb-20 max-w-5xl">
        <Link to="/blog" className="inline-flex items-center gap-2 text-space-muted hover:text-white text-sm font-ui transition-colors duration-200 mb-10">
          <ArrowLeft className="w-4 h-4" /> Back to Blog
        </Link>

        {series.coverImage && (
          <div className="relative w-full h-56 md:h-72 rounded-2xl overflow-hidden mb-10 border border-white/10">
            <img src={series.coverImage} alt={series.title} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
          </div>
        )}

        <div className="mb-10">
          <div className="flex items-center gap-2 mb-3">
            <BookOpenText className="w-4 h-4 text-space-muted" />
            <span className="text-space-muted text-xs font-ui uppercase tracking-widest">Series</span>
          </div>

          <h1 className="text-4xl font-display font-bold text-white mb-3">{series.title}</h1>
          <p className="text-space-muted font-ui text-sm mb-4">{series.posts.length} posts</p>

          {allTags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-6">
              {allTags.map(tag => (
                <Badge key={tag} variant="outline" className="text-xs font-ui border-white/15 text-space-muted bg-white/5 px-2 py-0.5">{tag}</Badge>
              ))}
            </div>
          )}
          <div className="h-px bg-white/10" />
        </div>

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
              prose-li:text-space-muted prose-li:font-prose"
          >
            {(() => {
              figureCounter.current = 0; // reset counter for this series intro
              return (
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  rehypePlugins={[rehypeRaw]}
                  components={markdownComponents}
                >
                  {series.intro}
                </ReactMarkdown>
              );
            })()}
          </article>

            <div className="mt-10 h-px bg-white/10" />
          </div>
        )}

        {/* Post list */}
        <div className="flex items-center gap-3 mb-6">
          <span className="text-space-muted text-xs font-ui uppercase tracking-widest">Posts in this series</span>
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
                <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10" style={{ boxShadow: "0 0 24px rgba(255,255,255,0.07)" }} />

                <span className="relative shrink-0 w-8 h-8 flex items-center justify-center rounded-lg bg-white/8 border border-white/15 text-xs font-mono text-space-muted group-hover:text-white transition-colors duration-200">
                  {String(idx + 1).padStart(2, "0")}
                </span>

                <div className="relative flex-1 min-w-0">
                  <h2 className="text-base font-display font-semibold text-white mb-1 group-hover:text-white/90 transition-colors duration-200">{post.title}</h2>
                  {post.description && <p className="text-space-muted font-ui text-sm leading-relaxed line-clamp-2 mb-2">{post.description}</p>}
                  <div className="flex flex-wrap items-center gap-3">
                    {post.date && (
                      <span className="flex items-center gap-1 text-space-muted text-xs font-ui">
                        <Calendar className="w-3 h-3" />
                        {formatDate(post.date)}
                      </span>
                    )}
                    {post.tags.map(tag => (
                      <Badge key={tag} variant="outline" className="text-xs font-ui border-white/15 text-space-muted bg-white/5 px-2 py-0">{tag}</Badge>
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