import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("blog", "routes/blog.tsx"),
  route("blog/:slug", "routes/blog-post.tsx"),
  route("docs", "routes/docs.tsx"),
  route("terminos", "routes/terms.tsx"),
  route("test-salud-financiera", "routes/test-salud.tsx", { id: "test-salud-es" }),
  route("financial-health-test", "routes/test-salud.tsx", { id: "test-salud-en" }),
] satisfies RouteConfig;
