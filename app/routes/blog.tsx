import { Blog } from "../../pages/Blog";
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
  
  return { copy: translations[lang].blogExtra };
}

export function meta({ data }: { data: any }) {
  if (!data) return [{ title: "Blog - Nougram" }];
  
  return [
    { title: data.copy.seoTitle },
    { name: "description", content: data.copy.subheadline },
    { property: "og:title", content: data.copy.seoTitle },
    { property: "og:description", content: data.copy.subheadline },
  ];
}

export default function Route() {
  return <Blog />;
}
