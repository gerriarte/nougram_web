import type { VercelRequest, VercelResponse } from '@vercel/node';
import fs from 'fs';
import path from 'path';

function escapeHtmlAttr(value: string): string {
    return value.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
}

/**
 * Lee metadata del post desde el .ts sin importar el módulo (evita fallos de bundle / MODULE_NOT_FOUND en Vercel).
 */
function parsePostMetaFromBlogSource(raw: string, slug: string): { title: string; excerpt: string; image: string } | null {
    let idx = raw.indexOf(`slug: '${slug}'`);
    if (idx === -1) idx = raw.indexOf(`slug: "${slug}"`);
    if (idx === -1) return null;

    const fromSlug = raw.slice(idx);
    const contentMark = fromSlug.indexOf('content: `');
    const header = contentMark === -1 ? fromSlug : fromSlug.slice(0, contentMark);

    const titleM = /title:\s*['"]([^'"]+)['"]/.exec(header);
    const excerptM = /excerpt:\s*(?:\n\s*)?['"]([^'"]+)['"]/m.exec(header);
    const imageM = /image:\s*(?:\n\s*)?['"]([^'"]+)['"]/m.exec(header);

    if (!titleM || !excerptM || !imageM) return null;
    return { title: titleM[1], excerpt: excerptM[1], image: imageM[1] };
}

function loadBlogSource(): string {
    const p = path.join(process.cwd(), 'content', 'blog-posts.ts');
    if (!fs.existsSync(p)) {
        console.error('blog-seo: content/blog-posts.ts not found at', p);
        return '';
    }
    return fs.readFileSync(p, 'utf8');
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
    let image = 'https://nougram.co/og-image.jpg';
    let ogType = 'website';

    const rawSource = loadBlogSource();
    const meta = rawSource ? parsePostMetaFromBlogSource(rawSource, slug) : null;
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
