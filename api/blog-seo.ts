import type { VercelRequest, VercelResponse } from '@vercel/node';
import fs from 'fs';
import path from 'path';

function escapeHtmlAttr(value: string): string {
    return value.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
}

function loadPostMeta(slug: string): { title: string; excerpt: string; image: string } | null {
    try {
        const p = path.join(process.cwd(), 'content', 'posts', `${slug}.json`);
        if (!fs.existsSync(p)) {
            // Intento alternativo por si la ruta cambia en Vercel
            const altPath = path.join(process.cwd(), '..', 'content', 'posts', `${slug}.json`);
            if (fs.existsSync(altPath)) {
                const post = JSON.parse(fs.readFileSync(altPath, 'utf8'));
                return { title: post.title, excerpt: post.excerpt, image: post.image };
            }
            return null;
        }
        const post = JSON.parse(fs.readFileSync(p, 'utf8'));
        return { title: post.title, excerpt: post.excerpt, image: post.image };
    } catch (e) {
        console.error('blog-seo: error loading post meta', e);
        return null;
    }
}

/** En Vercel el HTML estático vive en el CDN; el fetch evita depender de rutas dentro del bundle de la función. */
async function loadIndexHtml(): Promise<string> {
    const vercelUrl = process.env.VERCEL_URL;
    if (vercelUrl) {
        try {
            const res = await fetch(`https://${vercelUrl}/index.html`, {
                headers: { Accept: 'text/html' },
                cache: 'no-store',
            });
            if (res.ok) {
                const text = await res.text();
                if (text.includes('id="root"')) {
                    return text;
                }
            }
        } catch (e) {
            console.error('blog-seo: fetch index.html failed', e);
        }
    }

    const cwd = process.cwd();
    for (const p of [path.join(cwd, 'dist', 'index.html'), path.join(cwd, 'index.html')]) {
        if (fs.existsSync(p)) {
            return fs.readFileSync(p, 'utf8');
        }
    }
    throw new Error(`blog-seo: index.html not found (cwd=${cwd})`);
}

function injectMeta(
    html: string,
    opts: { title: string; excerpt: string; image: string; postUrl: string; ogType: string }
): string {
    const { title, excerpt, image, postUrl, ogType } = opts;
    const eTitle = escapeHtmlAttr(title);
    const eExcerpt = escapeHtmlAttr(excerpt);
    const eImage = escapeHtmlAttr(image);
    const eUrl = escapeHtmlAttr(postUrl);

    let out = html.replace(/<title>.*?<\/title>/, `<title>${eTitle} | Nougram</title>`);
    out = out.replace(
        /<meta name="description" content="[^"]*"\s*\/?>/,
        `<meta name="description" content="${eExcerpt}" />`
    );
    out = out.replace(/<meta property="og:type" content="[^"]*">/, `<meta property="og:type" content="${ogType}">`);
    out = out.replace(/<meta property="og:url" content="[^"]*">/, `<meta property="og:url" content="${eUrl}">`);
    out = out.replace(/<meta property="og:title" content="[^"]*">/, `<meta property="og:title" content="${eTitle}">`);
    out = out.replace(
        /<meta property="og:description"\s+content="[^"]*">/,
        `<meta property="og:description" content="${eExcerpt}">`
    );
    out = out.replace(/<meta property="og:image" content="[^"]*">/, `<meta property="og:image" content="${eImage}">`);
    out = out.replace(/<meta property="twitter:url" content="[^"]*">/, `<meta property="twitter:url" content="${eUrl}">`);
    out = out.replace(/<meta property="twitter:title" content="[^"]*">/, `<meta property="twitter:title" content="${eTitle}">`);
    out = out.replace(
        /<meta property="twitter:description" content="[^"]*">/,
        `<meta property="twitter:description" content="${eExcerpt}">`
    );
    out = out.replace(/<meta property="twitter:image" content="[^"]*">/, `<meta property="twitter:image" content="${eImage}">`);
    return out;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
    const { slug } = req.query;

    if (!slug || typeof slug !== 'string') {
        return res.status(400).send('Missing slug');
    }

    const postUrl = `https://nougram.co/blog/${slug}`;
    let title = 'Nougram Blog';
    let excerpt = 'Descubre cómo escalar tu negocio con IA.';
    let image = 'https://nougram.co/og-main.png';
    let ogType = 'website';

    const meta = loadPostMeta(slug);
    if (meta) {
        title = meta.title;
        excerpt = meta.excerpt;
        image = meta.image.startsWith('http') ? meta.image : `https://nougram.co${meta.image}`;
        ogType = 'article';
    }

    try {
        const html = injectMeta(await loadIndexHtml(), { title, excerpt, image, postUrl, ogType });
        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        return res.status(200).send(html);
    } catch (error) {
        console.error('blog-seo error:', error);
        try {
            const raw = await loadIndexHtml();
            res.setHeader('Content-Type', 'text/html; charset=utf-8');
            return res.status(200).send(raw);
        } catch {
            return res.status(500).send('Internal Server Error');
        }
    }
}
