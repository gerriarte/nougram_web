import { VercelRequest, VercelResponse } from '@vercel/node';
import fs from 'fs';
import path from 'path';

// This function serves as a SEO proxy for blog posts
// It injects OG tags into index.html before serving it
export default async function handler(req: VercelRequest, res: VercelResponse) {
    const { slug } = req.query;

    if (!slug || typeof slug !== 'string') {
        return res.status(400).send('Missing slug');
    }

    try {
        // Path to the index.html file in the project
        const indexPath = path.join(process.cwd(), 'index.html');
        let html = fs.readFileSync(indexPath, 'utf8');

        // Note: In a real scenario, you'd fetch the blog post data from your content file or DB
        // For this demo, we'll use a simplified version of the data
        // Ideally, you'd export the BLOG_POSTS from content/blog-posts.ts and import it here
        // But since this is a serverless function, we'll keep it simple for now

        // Let's try to find the post data by reading the file
        const blogPostsPath = path.join(process.cwd(), 'content', 'blog-posts.ts');
        const blogPostsContent = fs.readFileSync(blogPostsPath, 'utf8');

        // Basic regex to find title and image from the file (simple but effective for this context)
        const titleRegex = new RegExp(`title:\\s*['"]([^'"]+)['"]`, 'g');
        const excerptRegex = new RegExp(`excerpt:\\s*['"]([^'"]+)['"]`, 'g');
        const imageRegex = new RegExp(`image:\\s*['"]([^'"]+)['"]`, 'g');

        // We'll search for the specific slug in the file
        const postBlockRegex = new RegExp(`slug:\\s*['"]${slug}['"]([\\s\\S]+?)}`, 'g');
        const postBlockMatch = postBlockRegex.exec(blogPostsContent);

        let title = "Nougram Blog";
        let excerpt = "Descubre cómo escalar tu negocio con IA.";
        let image = "https://nougram.co/og-image.jpg";

        if (postBlockMatch) {
            const block = postBlockMatch[1];
            const t = /title:\s*['"]([^'"]+)['"]/.exec(block);
            const e = /excerpt:\s*['"]([^'"]+)['"]/.exec(block);
            const i = /image:\s*['"]([^'"]+)['"]/.exec(block);
            if (t) title = t[1];
            if (e) excerpt = e[1];
            if (i) image = i[1];
        }

        // Replace meta tags in HTML
        html = html.replace(/<title>.*?<\/title>/, `<title>${title} | Nougram</title>`);
        html = html.replace(/<meta property="og:title" content=".*?"/, `<meta property="og:title" content="${title}"`);
        html = html.replace(/<meta property="og:description" content=".*?"/, `<meta property="og:description" content="${excerpt}"`);
        html = html.replace(/<meta property="og:image" content=".*?"/, `<meta property="og:image" content="${image}"`);
        html = html.replace(/<meta property="twitter:title" content=".*?"/, `<meta property="twitter:title" content="${title}"`);
        html = html.replace(/<meta property="twitter:description" content=".*?"/, `<meta property="twitter:description" content="${excerpt}"`);
        html = html.replace(/<meta property="twitter:image" content=".*?"/, `<meta property="twitter:image" content="${image}"`);

        res.setHeader('Content-Type', 'text/html');
        return res.status(200).send(html);
    } catch (error) {
        console.error('SEO Proxy Error:', error);
        // Fallback to serving the regular index.html if something fails
        try {
            const indexPath = path.join(process.cwd(), 'index.html');
            const html = fs.readFileSync(indexPath, 'utf8');
            res.setHeader('Content-Type', 'text/html');
            return res.status(200).send(html);
        } catch (e) {
            return res.status(500).send('Internal Server Error');
        }
    }
}
