import { useState, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import {
  getPostBySlug,
  getSeriesPost,
  getSeriesById,
} from "@/lib/blog";
import { usePageTransition } from "@/hooks/usePageTransition";
import { Header } from "@/components/portfolio/Header";
import { Footer } from "@/components/portfolio/Footer";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  ArrowRight,
  Calendar,
  Clipboard,
  Check,
} from "lucide-react";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";

import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import type { Components } from "react-markdown";

// ----------------- CodeBlock -----------------
function CodeBlock({
  language,
  codeString,
}: {
  language: string;
  codeString: string;
}) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(codeString);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };
  return (
    <div
      className="my-6 rounded-xl overflow-hidden"
      style={{
        border: "1px solid rgba(255,255,255,0.1)",
        background: "rgba(255,255,255,0.04)",
      }}
    >
      <div
        className="flex items-center justify-between px-4 py-2"
        style={{ borderBottom: "1px solid rgba(255,255,255,0.1)" }}
      >
        <span className="italic text-xs text-space-muted">{language}</span>
        <button
          className="group flex items-center gap-1 px-2 py-1 rounded hover:bg-white/10 transition"
          onClick={handleCopy}
          aria-label="Copy code block"
        >
          {copied ? (
            <Check className="w-4 h-4 text-green-400" />
          ) : (
            <Clipboard className="w-4 h-4 text-space-muted group-hover:text-white transition" />
          )}
        </button>
      </div>
      <SyntaxHighlighter
        style={oneDark}
        language={language}
        PreTag="pre"
        customStyle={{
          borderRadius: 0,
          border: "none",
          fontSize: "0.875rem",
          margin: 0,
          background: "transparent",
          padding: "1rem",
        }}
        codeTagProps={{
          style: {
            fontFamily: "'Fira Code', 'JetBrains Mono', monospace",
            padding: 0,
            background: "none",
          },
        }}
      >
        {codeString}
      </SyntaxHighlighter>
    </div>
  );
}

// ----------------- BlogPostPage -----------------
const BlogPostPage = () => {
  const { slug, seriesId, postSlug } = useParams<{
    slug?: string;
    seriesId?: string;
    postSlug?: string;
  }>();
  const { opacity, transitionTo, FADE_MS } =
    usePageTransition([postSlug, slug]);

  const post =
    seriesId && postSlug
      ? getSeriesPost(seriesId, postSlug)
      : slug
      ? getPostBySlug(slug)
      : undefined;

  const backLink = seriesId ? `/blog/${seriesId}` : "/blog";
  const backLabel = seriesId ? "Back to Series" : "Back to Blog";

  const series = seriesId ? getSeriesById(seriesId) : undefined;
  const postIndex = series?.posts.findIndex((p) => p.slug === postSlug) ?? -1;
  const prevPost = series && postIndex > 0 ? series.posts[postIndex - 1] : null;
  const nextPost =
    series && postIndex < series.posts.length - 1
      ? series.posts[postIndex + 1]
      : null;

  // ----------------- Figure counter -----------------
  const figureCounter = useRef(0);

  // ----------------- Markdown components -----------------
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
      const hasOnlyImage =
        arr.length === 1 &&
        typeof arr[0] === "object" &&
        (arr[0] as React.ReactElement)?.type === "img";
      if (hasOnlyImage) return <>{children}</>;
      return <p>{children}</p>;
    },
    img({ src, alt }) {
      if (!src) return null;
      const hasCaption = alt && alt.trim().length > 0;
      if (hasCaption) {
        figureCounter.current += 1;
        return (
          <figure
            style={{ margin: "2rem 0", width: "100%" }}
            className="not-prose"
          >
            <div
              style={{
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: "0.75rem",
                overflow: "hidden",
              }}
            >
              <img
                src={src}
                alt={alt}
                style={{ width: "100%", display: "block" }}
              />
            </div>
            <figcaption
              className="font-ui font-medium italic"
              style={{
                textAlign: "left",
                fontSize: "1.5em",
                marginTop: "0.5rem",
                color: "var(--color-space-muted)",
              }}
            >
              Figure {figureCounter.current}: {alt}
            </figcaption>
          </figure>
        );
      }
      return (
        <img
          src={src}
          alt=""
          style={{ width: "100%", display: "block", margin: "2rem 0" }}
        />
      );
    },
  };

  function formatDate(dateStr: string) {
    if (!dateStr) return null;
    return new Date(dateStr).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }

  if (!post) {
    return (
      <div className="bg-background starfield min-h-screen">
        <Header />
        <main className="container mx-auto px-6 pt-28 pb-20 max-w-5xl">
          <Link
            to={backLink}
            className="inline-flex items-center gap-2 text-space-muted hover:text-white text-sm font-ui transition-colors duration-200 mb-8"
          >
            <ArrowLeft className="w-4 h-4" />
            {backLabel}
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
        style={{
          opacity,
          transition: `opacity ${FADE_MS}ms ease`,
        }}
      >
        <Link
          to={backLink}
          className="inline-flex items-center gap-2 text-space-muted hover:text-white text-sm font-ui transition-colors duration-200 mb-10"
        >
          <ArrowLeft className="w-4 h-4" />
          {backLabel}
        </Link>

        <header className="mb-10">
          {post.coverImage && (
            <div className="relative w-full h-64 md:h-80 rounded-2xl overflow-hidden mb-8 border border-white/10">
              <img
                src={post.coverImage}
                alt={post.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            </div>
          )}
          {post.date && (
            <div className="flex items-center gap-1.5 text-space-muted text-xs font-ui mb-3">
              <Calendar className="w-3.5 h-3.5" />
              <span>{formatDate(post.date)}</span>
            </div>
          )}
          {series && postIndex !== -1 && (
            <p className="text-space-muted font-ui text-xs mb-3">
              Part {postIndex + 1} of {series.posts.length} in{" "}
              <Link
                to={backLink}
                className="text-white/70 hover:text-white underline decoration-white/20 hover:decoration-white/60 transition-colors"
              >
                {series.title}
              </Link>
            </p>
          )}
          <h1 className="text-3xl md:text-4xl font-display font-bold text-white leading-tight mb-4">
            {post.title}
          </h1>
          {post.description && (
            <p className="text-space-muted font-ui text-base leading-relaxed mb-5">
              {post.description}
            </p>
          )}
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
          <div className="mt-8 h-px bg-white/10" />
        </header>

        <article className="prose prose-invert prose-sm md:prose-base max-w-none">
          {(() => {
            figureCounter.current = 0; // reset counter per post
            return (
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeRaw]}
                components={markdownComponents}
              >
                {post.content}
              </ReactMarkdown>
            );
          })()}
        </article>

        {/* ------------- Post navigation ------------- */}
        {series && (prevPost || nextPost) && (
          <div className="mt-16 pt-8 border-t border-white/10 flex justify-between">
            {prevPost ? (
              <Link
                to={`/blog/${series.id}/${prevPost.slug}`}
                className="flex items-center gap-2 text-space-muted hover:text-white text-sm font-ui transition-colors duration-200"
              >
                <ArrowLeft className="w-4 h-4" />
                {prevPost.title}
              </Link>
            ) : <div />}

            {nextPost ? (
              <Link
                to={`/blog/${series.id}/${nextPost.slug}`}
                className="flex items-center gap-2 text-space-muted hover:text-white text-sm font-ui transition-colors duration-200 ml-auto"
              >
                {nextPost.title}
                <ArrowRight className="w-4 h-4" />
              </Link>
            ) : <div />}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default BlogPostPage;