import { vercelPreset } from "@vercel/react-router/vite";
import type { Config } from "@react-router/dev/config";

export default {
  // Config options...
  ssr: true,
  presets: [vercelPreset()],
} satisfies Config;
