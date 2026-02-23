import React, { useEffect, useState } from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import { BLOG_POSTS } from '../content/blog-posts';
import { ArrowLeft, Calendar, Clock, Twitter, Linkedin, Copy } from 'lucide-react';
import { Reveal } from '../components/Reveal';
import { Helmet } from 'react-helmet-async';

export const BlogPost: React.FC = () => {
    const { slug } = useParams<{ slug: string }>();
    const post = BLOG_POSTS.find(p => p.slug === slug);
    const [email, setEmail] = useState('');
    const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');

    useEffect(() => {
        if (post) {
            // Scroll to top on mount
            window.scrollTo(0, 0);
        }
    }, [post]);

    if (!post) {
        return <Navigate to="/blog" replace />;
    }

    const handleSubscribe = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email || !email.includes('@')) return;

        setStatus('submitting');

        try {
            // Simulated API call
            await new Promise(resolve => setTimeout(resolve, 1500));
            setStatus('success');
            setEmail('');
        } catch (error) {
            setStatus('error');
        }
    };

    const postUrl = `https://nougram.co/blog/${post.slug}`;
    const postImage = post.image.startsWith('http') ? post.image : `https://nougram.co${post.image}`;

    return (
        <article className="bg-white min-h-screen pt-24 pb-20">
            <Helmet>
                <title>{post.title} | Blog Nougram</title>
                <meta name="description" content={post.excerpt} />

                {/* Open Graph / Facebook */}
                <meta property="og:type" content="article" />
                <meta property="og:url" content={postUrl} />
                <meta property="og:title" content={post.title} />
                <meta property="og:description" content={post.excerpt} />
                <meta property="og:image" content={postImage} />

                {/* Twitter */}
                <meta name="twitter:card" content="summary_large_image" />
                <meta name="twitter:url" content={postUrl} />
                <meta name="twitter:title" content={post.title} />
                <meta name="twitter:description" content={post.excerpt} />
                <meta name="twitter:image" content={postImage} />

                <link rel="canonical" href={postUrl} />
            </Helmet>

            {/* SEO Article Data */}
            <script type="application/ld+json">
                {JSON.stringify({
                    "@context": "https://schema.org",
                    "@type": "BlogPosting",
                    "headline": post.title,
                    "image": postImage,
                    "author": {
                        "@type": "Organization",
                        "name": post.author
                    },
                    "publisher": {
                        "@type": "Organization",
                        "name": "Nougram",
                        "logo": {
                            "@type": "ImageObject",
                            "url": "https://nougram.co/logo.png"
                        }
                    },
                    "datePublished": post.date,
                    "description": post.excerpt
                })}
            </script>

            <div className="max-w-4xl mx-auto px-6 lg:px-8">
                <Reveal>
                    <Link to="/blog" className="inline-flex items-center gap-2 text-slate-500 hover:text-brand-600 transition-colors mb-8 font-medium">
                        <ArrowLeft className="w-4 h-4" /> Volver al blog
                    </Link>

                    <div className="mb-10">
                        <div className="flex items-center gap-3 mb-6">
                            <span className="px-3 py-1 bg-brand-50 text-brand-700 text-xs font-bold rounded-full uppercase tracking-wider">
                                {post.category}
                            </span>
                            <span className="text-slate-400 text-sm">•</span>
                            <div className="flex items-center gap-2 text-slate-400 text-sm">
                                <Calendar className="w-4 h-4" />
                                <span>{new Date(post.date).toLocaleDateString()}</span>
                            </div>
                            <span className="text-slate-400 text-sm">•</span>
                            <div className="flex items-center gap-2 text-slate-400 text-sm">
                                <Clock className="w-4 h-4" />
                                <span>{post.readTime} de lectura</span>
                            </div>
                        </div>

                        <h1 className="text-4xl lg:text-6xl font-bold text-slate-900 mb-8 tracking-tight leading-tight">
                            {post.title}
                        </h1>

                        <div className="flex items-center justify-between pb-10 border-b border-slate-100">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-brand-600 flex items-center justify-center text-white font-bold">
                                    N
                                </div>
                                <div>
                                    <div className="text-slate-900 font-bold text-sm">{post.author}</div>
                                    <div className="text-slate-500 text-xs">Equipo de Contenido</div>
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                <button className="p-2 hover:bg-slate-50 rounded-full transition-colors text-slate-400 hover:text-brand-600">
                                    <Twitter className="w-5 h-5" />
                                </button>
                                <button className="p-2 hover:bg-slate-50 rounded-full transition-colors text-slate-400 hover:text-brand-600">
                                    <Linkedin className="w-5 h-5" />
                                </button>
                                <button className="p-2 hover:bg-slate-50 rounded-full transition-colors text-slate-400 hover:text-brand-600">
                                    <Copy className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    </div>
                </Reveal>

                <Reveal delay={0.2}>
                    <div className="rounded-3xl overflow-hidden mb-12 aspect-[21/9]">
                        <img
                            src={post.image}
                            alt={post.title}
                            className="w-full h-full object-cover"
                        />
                    </div>

                    <div
                        className="prose prose-lg prose-slate max-w-none 
                        prose-headings:text-slate-900 prose-headings:font-bold 
                        prose-p:text-slate-600 prose-p:leading-relaxed
                        prose-strong:text-brand-600 prose-blockquote:border-brand-500
                        prose-blockquote:bg-brand-50/50 prose-blockquote:py-1 prose-blockquote:rounded-r-xl"
                        dangerouslySetInnerHTML={{ __html: post.content }}
                    />
                </Reveal>

                <Reveal delay={0.4}>
                    <div className="mt-20 p-8 lg:p-12 bg-slate-900 rounded-[2rem] text-center">
                        <h2 className="text-2xl lg:text-3xl font-bold text-white mb-4">
                            {status === 'success' ? '¡Ya casi estás dentro! 🚀' : '¿Te gustó este artículo?'}
                        </h2>
                        <p className="text-slate-400 mb-8 max-w-md mx-auto">
                            {status === 'success'
                                ? 'Gracias por suscribirte. Pronto recibirás nuestras mejores estrategias en tu inbox.'
                                : 'Suscríbete para recibir más insights sobre cómo escalar tu negocio con Inteligencia Artificial.'}
                        </p>

                        {status !== 'success' && (
                            <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="tu@email.com"
                                    required
                                    className="flex-grow px-6 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-brand-500"
                                />
                                <button
                                    disabled={status === 'submitting'}
                                    className="px-8 py-3 bg-brand-500 hover:bg-brand-400 text-white font-bold rounded-xl transition-all disabled:opacity-50"
                                >
                                    {status === 'submitting' ? 'Enviando...' : 'Unirme'}
                                </button>
                            </form>
                        )}
                        {status === 'error' && (
                            <p className="mt-4 text-red-400 text-sm">Hubo un error. Por favor, intenta de nuevo.</p>
                        )}
                    </div>
                </Reveal>
            </div>
        </article>
    );
};
