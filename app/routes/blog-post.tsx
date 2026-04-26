import { BlogPost } from "../../pages/BlogPost";
import { BLOG_POSTS } from "../../content/blog-posts";
import type { LoaderFunctionArgs } from "react-router";
import { redirect } from "react-router";

export async function loader({ params }: LoaderFunctionArgs) {
  const post = BLOG_POSTS.find(p => p.slug === params.slug);
  if (!post) {
    return redirect("/blog");
  }
  return { post };
}

export function meta({ data }: { data: any }) {
  if (!data || !data.post) return [{ title: "Blog - Nougram" }];
  
  const { post } = data;
  const postUrl = `https://nougram.co/blog/${post.slug}`;
  const postImage = post.image.startsWith('http') ? post.image : `https://nougram.co${post.image}`;

  return [
    { title: `${post.title} | Blog Nougram` },
    { name: "description", content: post.excerpt },
    { property: "og:type", content: "article" },
    { property: "og:url", content: postUrl },
    { property: "og:title", content: post.title },
    { property: "og:description", content: post.excerpt },
    { property: "og:image", content: postImage },
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:title", content: post.title },
    { name: "twitter:description", content: post.excerpt },
    { name: "twitter:image", content: postImage },
  ];
}

export default function Route() {
  return <BlogPost />;
}
