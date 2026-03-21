import React, { useEffect, useState } from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import { useTranslation } from '../context/LanguageContext';
import { BLOG_POSTS } from '../content/blog-posts';
import { ArrowLeft, Calendar, Clock, Twitter, Linkedin, Copy, Sparkles } from 'lucide-react';
import { Reveal } from '../components/Reveal';
import { Helmet } from 'react-helmet-async';

export const BlogPost: React.FC = () => {
    const { t: COPY } = useTranslation();
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
        <article className="bg-dark-900 min-h-screen pt-32 pb-24 relative overflow-hidden">
            {/* Background Grid */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none"></div>

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

            <div className="max-w-4xl mx-auto px-6 lg:px-8 relative z-10">
                <Reveal>
                    <Link to="/blog" className="inline-flex items-center gap-2 text-slate-500 hover:text-brand-400 transition-colors mb-8 font-mono text-xs uppercase tracking-wider">
                        <ArrowLeft className="w-3.5 h-3.5" /> {COPY.blogExtra.backToBlog}
                    </Link>

                    <div className="mb-10">
                        <div className="flex items-center gap-3 mb-6">
                            <span className="px-3 py-1 bg-brand-500/10 border border-brand-500/20 text-brand-400 text-xs font-bold rounded-md uppercase tracking-wider">
                                {post.category}
                            </span>
                            <span className="text-slate-600 text-sm">•</span>
                            <div className="flex items-center gap-2 text-slate-500 text-xs font-mono">
                                <Calendar className="w-3.5 h-3.5" />
                                <span>{new Date(post.date).toLocaleDateString()}</span>
                            </div>
                            <span className="text-slate-600 text-sm">•</span>
                            <div className="flex items-center gap-2 text-slate-500 text-xs font-mono">
                                <Clock className="w-3.5 h-3.5" />
                                <span>{post.readTime} {COPY.blogExtra.readTimeSuffix}</span>
                            </div>
                        </div>

                        <h1 className="text-3xl lg:text-5xl font-bold text-white mb-8 tracking-tight leading-tight">
                            {post.title}
                        </h1>

                        <div className="flex items-center justify-between pb-8 border-b border-white/5">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-brand-500/10 flex items-center justify-center border border-brand-500/20 text-brand-400 font-bold text-sm">
                                    {post.author.charAt(0)}
                                </div>
                                <div>
                                    <div className="text-white font-bold text-sm">{post.author}</div>
                                    <div className="text-slate-500 text-xs font-mono">{COPY.blogExtra.contentTeam}</div>
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                <button className="p-2 hover:bg-white/5 rounded-full transition-colors text-slate-500 hover:text-brand-400">
                                    <Twitter className="w-4 h-4" />
                                </button>
                                <button className="p-2 hover:bg-white/5 rounded-full transition-colors text-slate-500 hover:text-brand-400">
                                    <Linkedin className="w-4 h-4" />
                                </button>
                                <button className="p-2 hover:bg-white/5 rounded-full transition-colors text-slate-500 hover:text-brand-400">
                                    <Copy className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </div>
                </Reveal>

                <Reveal delay={0.2}>
                    <div className="rounded-3xl overflow-hidden mb-12 aspect-[21/9] border border-white/5 shadow-2xl shadow-black/40">
                        <img
                            src={post.image}
                            alt={post.title}
                            className="w-full h-full object-cover"
                        />
                    </div>

                    <div
                        className="prose prose-lg prose-invert max-w-none 
                        prose-headings:text-white prose-headings:font-bold 
                        prose-p:text-slate-300 prose-p:leading-relaxed prose-p:text-sm md:prose-p:text-base
                        prose-strong:text-brand-400 prose-blockquote:border-brand-500
                        prose-blockquote:bg-white/[0.02] prose-blockquote:py-2 prose-blockquote:rounded-r-xl prose-blockquote:not-italic prose-blockquote:text-slate-200"
                        dangerouslySetInnerHTML={{ __html: post.content }}
                    />
                </Reveal>

                <Reveal delay={0.4}>
                    <div className="mt-20 p-8 lg:p-12 bg-white/[0.02] border border-white/5 backdrop-blur-md rounded-3xl text-center relative overflow-hidden group/box">
                        <div className="absolute inset-0 bg-gradient-to-br from-brand-500/5 to-transparent opacity-0 group-hover/box:opacity-100 transition-opacity duration-700 pointer-events-none" />
                        
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-900/40 border border-brand-500/30 text-brand-300 text-[10px] font-semibold tracking-wider backdrop-blur-md mb-6 hover:bg-brand-900/60 transition-colors cursor-default mx-auto">
                            <Sparkles className="w-3 h-3 text-brand-400" />
                            <span>{COPY.blogExtra.newsletter}</span>
                        </div>

                        <h2 className="text-2xl lg:text-3xl font-bold text-white mb-4">
                            {status === 'success' ? COPY.blogExtra.subSuccessTitle : COPY.blogExtra.subQuestion}
                        </h2>
                        <p className="text-slate-400 mb-8 max-w-md mx-auto text-sm">
                            {status === 'success'
                                ? COPY.blogExtra.subSuccessDesc
                                : COPY.blogExtra.subPrompt}
                        </p>

                        {status !== 'success' && (
                            <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="tu@email.com"
                                    required
                                    className="flex-grow px-4 py-2.5 text-sm bg-dark-800/50 border border-white/10 rounded-xl text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500/50 transition-all hover:bg-dark-800/70"
                                />
                                <button
                                    disabled={status === 'submitting'}
                                    className="px-6 py-2.5 bg-brand-500 hover:bg-brand-400 text-white font-bold rounded-xl transition-all disabled:opacity-50 text-sm shadow-lg shadow-brand-500/20"
                                >
                                    {status === 'submitting' ? COPY.feedbackModal.submitting : COPY.blogExtra.join}
                                </button>
                            </form>
                        )}
                        {status === 'error' && (
                            <p className="mt-4 text-red-400 text-xs">{COPY.heroValidation.connectionError}</p>
                        )}
                    </div>
                </Reveal>
            </div>
        </article>
    );
};
