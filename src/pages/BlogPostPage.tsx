import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { getPostBySlug, getSeriesPost, getSeriesById } from "@/lib/blog";
import { usePageTransition } from "@/hooks/usePageTransition";
import { Header } from "@/components/portfolio/Header";
import { Footer } from "@/components/portfolio/Footer";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, ArrowRight, Calendar, Clipboard, Check } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import type { Components } from "react-markdown";

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
      <SyntaxHighlighter style={oneDark} language={language} PreTag="pre"
        customStyle={{ borderRadius: 0, border: "none", fontSize: "0.875rem", margin: 0, background: "transparent", padding: "1rem" }}
        codeTagProps={{ style: { fontFamily: "'Fira Code', 'JetBrains Mono', monospace", padding: 0, background: "none" } }}
      >{codeString}</SyntaxHighlighter>
    </div>
  );
}

const markdownComponents: Components = {
  pre({ children }) { return <>{children}</>; },
  code({ className, children, ...props }) {
    const match = /language-(\w+)/.exec(className ?? "");
    const codeString = String(children).replace(/\n$/, "");
    if (match) return <CodeBlock language={match[1]} codeString={codeString} />;
    return <code className={className} {...props}>{children}</code>;
  },
};

function formatDate(dateStr: string) {
  if (!dateStr) return null;
  return new Date(dateStr).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
}

const BlogPostPage = () => {
  const { slug, seriesId, postSlug } = useParams<{ slug?: string; seriesId?: string; postSlug?: string }>();

  // watchKeys: re-trigger fade-in whenever the post changes (same component, different slug)
  const { opacity, transitionTo, FADE_MS } = usePageTransition([postSlug, slug]);

  const post = seriesId && postSlug ? getSeriesPost(seriesId, postSlug) : slug ? getPostBySlug(slug) : undefined;
  const backLink = seriesId ? `/blog/${seriesId}` : "/blog";
  const backLabel = seriesId ? "Back to Series" : "Back to Blog";
  const series = seriesId ? getSeriesById(seriesId) : undefined;
  const postIndex = series?.posts.findIndex((p) => p.slug === postSlug) ?? -1;
  const prevPost = series && postIndex > 0 ? series.posts[postIndex - 1] : null;
  const nextPost = series && postIndex < series.posts.length - 1 ? series.posts[postIndex + 1] : null;

  if (!post) {
    return (
      <div className="bg-background starfield min-h-screen">
        <Header />
        <main className="container mx-auto px-6 pt-28 pb-20 max-w-5xl">
          <Link to={backLink} className="inline-flex items-center gap-2 text-space-muted hover:text-white text-sm font-ui transition-colors duration-200 mb-8">
            <ArrowLeft className="w-4 h-4" />{backLabel}
          </Link>
          <p className="text-white font-display text-2xl">Post not found.</p>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="bg-background starfield min-h-screen">
      <Header />
      <main
        className="container mx-auto px-6 pt-28 pb-20 max-w-5xl"
        style={{ opacity, transition: `opacity ${FADE_MS}ms ease` }}
      >
        <Link to={backLink} className="inline-flex items-center gap-2 text-space-muted hover:text-white text-sm font-ui transition-colors duration-200 mb-10">
          <ArrowLeft className="w-4 h-4" />{backLabel}
        </Link>

        <header className="mb-10">
          {post.coverImage && (
            <div className="relative w-full h-64 md:h-80 rounded-2xl overflow-hidden mb-8 border border-white/10">
              <img src={post.coverImage} alt={post.title} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            </div>
          )}
          {post.date && (
            <div className="flex items-center gap-1.5 text-space-muted text-xs font-ui mb-3">
              <Calendar className="w-3.5 h-3.5" /><span>{formatDate(post.date)}</span>
            </div>
          )}
          {series && postIndex !== -1 && (
            <p className="text-space-muted font-ui text-xs mb-3">
              Part {postIndex + 1} of {series.posts.length} in{" "}
              <Link to={backLink} className="text-white/70 hover:text-white underline decoration-white/20 hover:decoration-white/60 transition-colors">
                {series.title}
              </Link>
            </p>
          )}
          <h1 className="text-3xl md:text-4xl font-display font-bold text-white leading-tight mb-4">{post.title}</h1>
          {post.description && <p className="text-space-muted font-ui text-base leading-relaxed mb-5">{post.description}</p>}
          {post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {post.tags.map((tag) => (
                <Badge key={tag} variant="outline" className="text-xs font-ui border-white/15 text-space-muted bg-white/5 px-2 py-0.5">{tag}</Badge>
              ))}
            </div>
          )}
          <div className="mt-8 h-px bg-white/10" />
        </header>

        <article className="prose prose-invert prose-sm md:prose-base max-w-none
          prose-headings:font-display prose-headings:text-white prose-headings:font-semibold
          prose-p:font-prose prose-p:text-space-muted prose-p:leading-relaxed prose-p:text-base
          prose-a:text-white prose-a:underline prose-a:decoration-white/30 hover:prose-a:decoration-white/70
          prose-strong:text-white prose-strong:font-semibold
          prose-code:text-white/85 prose-code:bg-white/8 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-sm prose-code:font-mono prose-code:before:content-none prose-code:after:content-none
          prose-blockquote:border-white/20 prose-blockquote:text-space-muted
          prose-hr:border-white/10
          prose-li:text-space-muted prose-li:font-prose
          prose-th:text-white prose-td:text-space-muted
          prose-img:rounded-xl prose-img:border prose-img:border-white/10">
          <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>{post.content}</ReactMarkdown>
        </article>

        <div className="mt-16 pt-8 border-t border-white/10">
          <div className="grid grid-cols-2 gap-4">
            <div>
              {prevPost && (
                <button onClick={() => transitionTo(`/blog/${seriesId}/${prevPost.slug}`)}
                  className="group flex flex-col gap-1 relative rounded-xl p-4 w-full text-left transition-all duration-200 hover:-translate-y-0.5">
                  <div className="absolute inset-0 rounded-xl bg-white/5 border border-white/10 group-hover:bg-white/8 group-hover:border-white/20 transition-all duration-200" />
                  <span className="relative flex items-center gap-1.5 text-space-muted text-xs font-ui"><ArrowLeft className="w-3 h-3" /> Previous</span>
                  <span className="relative text-white text-sm font-display font-semibold line-clamp-2 group-hover:text-white/90">{prevPost.title}</span>
                </button>
              )}
            </div>
            <div className="flex justify-end">
              {nextPost && (
                <button onClick={() => transitionTo(`/blog/${seriesId}/${nextPost.slug}`)}
                  className="group flex flex-col gap-1 items-end relative rounded-xl p-4 w-full text-right transition-all duration-200 hover:-translate-y-0.5">
                  <div className="absolute inset-0 rounded-xl bg-white/5 border border-white/10 group-hover:bg-white/8 group-hover:border-white/20 transition-all duration-200" />
                  <span className="relative flex items-center gap-1.5 text-space-muted text-xs font-ui justify-end">Next <ArrowRight className="w-3 h-3" /></span>
                  <span className="relative text-white text-sm font-display font-semibold line-clamp-2 group-hover:text-white/90">{nextPost.title}</span>
                </button>
              )}
            </div>
          </div>
          {seriesId && (
            <div className="mt-6 flex justify-center">
              <Link to={backLink} className="inline-flex items-center gap-2 text-space-muted hover:text-white text-sm font-ui transition-colors duration-200">
                <ArrowLeft className="w-4 h-4" />{backLabel}
              </Link>
            </div>
          )}
          {!seriesId && (
            <Link to="/blog" className="inline-flex items-center gap-2 text-space-muted hover:text-white text-sm font-ui transition-colors duration-200">
              <ArrowLeft className="w-4 h-4" />Back to Blog
            </Link>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default BlogPostPage;