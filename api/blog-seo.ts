import type { VercelRequest, VercelResponse } from '@vercel/node';
import fs from 'fs';
import path from 'path';
import { BLOG_POSTS } from '../content/blog-posts';

function escapeHtmlAttr(value: string): string {
    return value.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
}

/** Production build output (Vercel) vs repo root template (local / vercel dev). */
function resolveIndexHtmlPath(): string {
    const cwd = process.cwd();
    const distIndex = path.join(cwd, 'dist', 'index.html');
    const rootIndex = path.join(cwd, 'index.html');
    if (fs.existsSync(distIndex)) return distIndex;
    if (fs.existsSync(rootIndex)) return rootIndex;
    throw new Error(`index.html not found under ${cwd} (dist/index.html or index.html)`);
}

// Serves index.html with Open Graph / Twitter meta injected for link previews (crawlers do not run the SPA).
export default async function handler(req: VercelRequest, res: VercelResponse) {
    const { slug } = req.query;

    if (!slug || typeof slug !== 'string') {
        return res.status(400).send('Missing slug');
    }

    try {
        let html = fs.readFileSync(resolveIndexHtmlPath(), 'utf8');

        const post = BLOG_POSTS.find((p) => p.slug === slug);

        const postUrl = `https://nougram.co/blog/${slug}`;
        let title = 'Nougram Blog';
        let excerpt = 'Descubre cómo escalar tu negocio con IA.';
        let image = 'https://nougram.co/og-image.jpg';
        let ogType = 'website';

        if (post) {
            title = post.title;
            excerpt = post.excerpt;
            image = post.image.startsWith('http') ? post.image : `https://nougram.co${post.image}`;
            ogType = 'article';
        }

        const eTitle = escapeHtmlAttr(title);
        const eExcerpt = escapeHtmlAttr(excerpt);
        const eImage = escapeHtmlAttr(image);
        const eUrl = escapeHtmlAttr(postUrl);

        html = html.replace(/<title>.*?<\/title>/, `<title>${eTitle} | Nougram</title>`);
        html = html.replace(
            /<meta name="description" content="[^"]*"\s*\/?>/,
            `<meta name="description" content="${eExcerpt}" />`
        );

        html = html.replace(
            /<meta property="og:type" content="[^"]*">/,
            `<meta property="og:type" content="${ogType}">`
        );
        html = html.replace(
            /<meta property="og:url" content="[^"]*">/,
            `<meta property="og:url" content="${eUrl}">`
        );
        html = html.replace(
            /<meta property="og:title" content="[^"]*">/,
            `<meta property="og:title" content="${eTitle}">`
        );
        // Matches single-line or split-line og:description in index.html
        html = html.replace(
            /<meta property="og:description"\s+content="[^"]*">/,
            `<meta property="og:description" content="${eExcerpt}">`
        );
        html = html.replace(
            /<meta property="og:image" content="[^"]*">/,
            `<meta property="og:image" content="${eImage}">`
        );

        html = html.replace(
            /<meta property="twitter:url" content="[^"]*">/,
            `<meta property="twitter:url" content="${eUrl}">`
        );
        html = html.replace(
            /<meta property="twitter:title" content="[^"]*">/,
            `<meta property="twitter:title" content="${eTitle}">`
        );
        html = html.replace(
            /<meta property="twitter:description" content="[^"]*">/,
            `<meta property="twitter:description" content="${eExcerpt}">`
        );
        html = html.replace(
            /<meta property="twitter:image" content="[^"]*">/,
            `<meta property="twitter:image" content="${eImage}">`
        );

        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        return res.status(200).send(html);
    } catch (error) {
        console.error('SEO Proxy Error:', error);
        try {
            const fallbackPath = resolveIndexHtmlPath();
            const fallback = fs.readFileSync(fallbackPath, 'utf8');
            res.setHeader('Content-Type', 'text/html; charset=utf-8');
            return res.status(200).send(fallback);
        } catch {
            return res.status(500).send('Internal Server Error');
        }
    }
}
