import { Home } from "../../pages/Home";
import { es } from "../../translations/es";
import { en } from "../../translations/en";
import type { LoaderFunctionArgs } from "react-router";

const translations = { es, en };

export async function loader({ request }: LoaderFunctionArgs) {
  const acceptLanguage = request.headers.get("Accept-Language");
  const cookieHeader = request.headers.get("Cookie");
  
  let lang: 'es' | 'en' = "es";
  if (cookieHeader?.includes("language=en")) lang = "en";
  else if (cookieHeader?.includes("language=es")) lang = "es";
  else if (acceptLanguage?.toLowerCase().startsWith("en")) lang = "en";
  
  return { 
    lang,
    copy: translations[lang].site,
    hero: translations[lang].hero
  };
}

export function meta({ data }: { data: any }) {
  if (!data) return [];
  
  return [
    { title: `Nougram - Ponele Precio a tu Talento` },
    { name: "description", content: data.copy.description },
    { name: "keywords", content: data.copy.keywords },
    { property: "og:title", content: "Nougram | Deja de adivinar y empieza a rentabilizar." },
    { property: "og:description", content: data.copy.description },
    { property: "og:image", content: "https://nougram.co/og-main.png" },
    { name: "twitter:card", content: "summary_large_image" },
  ];
}

export default function Route() {
  return <Home />;
}
