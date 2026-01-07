import React, { useEffect } from 'react';
import { useParams, Navigate, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { BLOG_POSTS } from '../data/blog-posts';
import { FooterCTA } from '../components/FooterCTA';
import { ArrowLeft, Calendar, User, Tag, Share2 } from 'lucide-react';

export const BlogPost: React.FC = () => {
    const { slug } = useParams<{ slug: string }>();
    // Use find with a type guard or fallback to handle potentially undefined slug
    const post = BLOG_POSTS.find(p => p.slug === slug);

    useEffect(() => {
        window.scrollTo(0, 0);
    }, [slug]);

    if (!post) {
        return <Navigate to="/blog" replace />;
    }

    // Schema for BlogPosting
    const schema = {
        "@context": "https://schema.org",
        "@type": "BlogPosting",
        "headline": post.title,
        "image": "https://nougram.co/og-image.jpg", // Placeholder or dynamic if added later
        "author": {
            "@type": "Organization",
            "name": post.author
        },
        "publisher": {
            "@type": "Organization",
            "name": "Nougram",
            "logo": {
                "@type": "ImageObject",
                "url": "https://nougram.co/logo-nougram.webp"
            }
        },
        "datePublished": post.date,
        "description": post.excerpt
    };

    return (
        <>
            <Helmet>
                <title>{post.title} | Blog Nougram</title>
                <meta name="description" content={post.excerpt} />
                <link rel="canonical" href={`https://nougram.co/blog/${post.slug}`} />

                {/* Open Graph specific for articles */}
                <meta property="og:type" content="article" />
                <meta property="og:title" content={post.title} />
                <meta property="og:description" content={post.excerpt} />
                <meta property="article:published_time" content={post.date} />

                {/* Inject Schema */}
                <script type="application/ld+json">
                    {JSON.stringify(schema)}
                </script>
            </Helmet>

            <div className="bg-slate-50 min-h-screen">
                {/* Header Spacer - simplified since main header is fixed */}
                <div className="h-20 bg-dark-900"></div>

                <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20">
                    <Link to="/blog" className="inline-flex items-center text-sm font-medium text-brand-600 hover:text-brand-800 transition-colors mb-8 group">
                        <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                        Volver al Blog
                    </Link>

                    <header className="mb-10 text-center">
                        <div className="flex flex-wrap justify-center gap-2 mb-6">
                            {post.tags.map(tag => (
                                <span key={tag} className="px-3 py-1 rounded-full bg-brand-100 text-brand-700 text-xs font-semibold uppercase tracking-wide">
                                    {tag}
                                </span>
                            ))}
                        </div>

                        <h1 className="text-3xl lg:text-5xl font-extrabold text-slate-900 mb-6 leading-tight">
                            {post.title}
                        </h1>

                        <div className="flex items-center justify-center gap-6 text-sm text-slate-500 border-t border-b border-slate-200 py-4 max-w-lg mx-auto">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-full bg-brand-500 flex items-center justify-center text-white font-bold text-xs ring-2 ring-white">
                                    N
                                </div>
                                <span className="font-medium text-slate-700">{post.author}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Calendar size={16} />
                                <time dateTime={post.date}>{post.date}</time>
                            </div>
                        </div>
                    </header>

                    <div
                        className="prose prose-lg prose-slate mx-auto prose-headings:font-bold prose-headings:text-slate-900 prose-a:text-brand-600 prose-a:no-underline hover:prose-a:underline prose-img:rounded-2xl"
                        dangerouslySetInnerHTML={{ __html: post.content }}
                    />

                    <div className="mt-16 pt-8 border-t border-slate-200">
                        <div className="bg-brand-50 rounded-2xl p-8 text-center">
                            <h3 className="text-xl font-bold text-slate-900 mb-2">¿Te gustó este artículo?</h3>
                            <p className="text-slate-600 mb-6">No te quedes solo con la teoría. Calcula tus números reales ahora.</p>
                            <Link to="/" className="inline-block bg-brand-600 text-white px-8 py-3 rounded-xl font-semibold hover:bg-brand-700 transition-colors shadow-lg shadow-brand-500/20">
                                Usar Calculadora Nougram
                            </Link>
                        </div>
                    </div>
                </article>
            </div>

            <FooterCTA />
        </>
    );
};
