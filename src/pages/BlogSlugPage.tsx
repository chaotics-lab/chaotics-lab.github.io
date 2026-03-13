import { useParams } from "react-router-dom";
import { getSeriesById } from "@/lib/blog";
import SeriesPage from "./SeriesPage";
import BlogPostPage from "./BlogPostPage";

/**
 * Handles /blog/:slug — dispatches to SeriesPage if the slug matches a
 * known series folder, otherwise falls through to the regular post page.
 */
const BlogSlugPage = () => {
  const { slug } = useParams<{ slug: string }>();
  if (slug && getSeriesById(slug)) return <SeriesPage />;
  return <BlogPostPage />;
};

export default BlogSlugPage;
