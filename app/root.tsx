import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
} from "react-router";
import type { LoaderFunctionArgs } from "react-router";
import { LanguageProvider } from "../context/LanguageContext";
import { Header } from "../components/Header";
import { FooterCTA } from "../components/FooterCTA";

export async function loader({ request }: LoaderFunctionArgs) {
  const acceptLanguage = request.headers.get("Accept-Language");
  const cookieHeader = request.headers.get("Cookie");
  
  let lang: 'es' | 'en' = "es";
  
  // Check cookie first
  if (cookieHeader?.includes("language=en")) {
    lang = "en";
  } else if (cookieHeader?.includes("language=es")) {
    lang = "es";
  } else if (acceptLanguage?.toLowerCase().startsWith("en")) {
    // Then check header
    lang = "en";
  }
  
  return { lang };
}

export function Layout({ children }: { children: React.ReactNode }) {
  // We can't use useLoaderData here because Layout is outside the route context in some versions,
  // but in RR7 framework mode, Layout is used by the root route.
  // Actually, we'll pass the lang from the App component.
  return (
    <html lang="es">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        
        {/* Google Tag Manager */}
        <script dangerouslySetInnerHTML={{
          __html: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
          new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
          j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
          'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
          })(window,document,'script','dataLayer','GTM-K94FF8ZT');`
        }} />
        {/* End Google Tag Manager */}

        <Meta />
        <Links />

        <script src="https://cdn.tailwindcss.com?plugins=typography"></script>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;700;800&display=swap" rel="stylesheet" />
        
        <script dangerouslySetInnerHTML={{
          __html: `
            tailwind.config = {
              theme: {
                extend: {
                  fontFamily: {
                    sans: ['Inter', 'sans-serif'],
                    mono: ['JetBrains Mono', 'monospace'],
                  },
                  colors: {
                    brand: {
                      50: '#fff3ed', 100: '#ffe4d4', 200: '#ffc5a8', 300: '#ff9d70', 400: '#ff6b33',
                      500: '#F35D0A', 600: '#e54d00', 700: '#bf3b00', 800: '#993000', 900: '#7a2804',
                    },
                    secondary: {
                      50: '#fff9f2', 100: '#ffefe0', 200: '#ffd9b3', 300: '#FCC68C', 400: '#f8a855',
                      500: '#f08924', 600: '#e06c13', 700: '#ba5011', 800: '#943f14', 900: '#753513',
                    },
                    nougram: {
                      background: '#262537', primary: '#F35D0A', secondary: '#FCC68C',
                      data: '#D5D3FB', textBase: '#F0F0E8',
                    }
                  }
                }
              }
            }
          `
        }} />
        <style dangerouslySetInnerHTML={{
          __html: `
            body {
              font-family: 'Inter', sans-serif;
              scroll-behavior: smooth;
              background-color: #262537;
              color: #F0F0E8;
            }
          `
        }} />
      </head>
      <body>
        <noscript>
          <iframe src="https://www.googletagmanager.com/ns.html?id=GTM-K94FF8ZT"
            height="0" width="0" style={{ display: 'none', visibility: 'hidden' }}></iframe>
        </noscript>

        {children}

        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  const { lang } = useLoaderData<typeof loader>();
  
  return (
    <LanguageProvider initialLanguage={lang}>
      <div className="min-h-screen bg-nougram-background text-nougram-textBase font-sans selection:bg-nougram-primary selection:text-white">
        <Header />
        <Outlet />
        <FooterCTA />
      </div>
    </LanguageProvider>
  );
}
