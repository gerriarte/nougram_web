export interface Post {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  date: string;
  author: string;
  image: string;
  category: string;
  readTime: string;
}

// Carga dinámica de posts desde archivos JSON (para el CMS)
const dynamicPosts = import.meta.glob('./posts/*.json', { eager: true });
const JSON_POSTS = Object.values(dynamicPosts).map((module: any) => module.default);

export const BLOG_POSTS: Post[] = [
  ...JSON_POSTS
];
