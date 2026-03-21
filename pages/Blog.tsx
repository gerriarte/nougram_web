import React from 'react';
import { useTranslation } from '../context/LanguageContext';
import { Link } from 'react-router-dom';
import { BLOG_POSTS } from '../content/blog-posts';
import { ArrowRight, Calendar, User, Clock, ChevronRight, Sparkles } from 'lucide-react';
import { Reveal } from '../components/Reveal';

export const Blog: React.FC = () => {
    const { t: COPY } = useTranslation();
    return (
        <div className="bg-dark-900 min-h-screen pt-32 pb-24 relative overflow-hidden">
            {/* Background Texture */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none"></div>

            {/* SEO Header - Hidden from UI but for crawlers */}
            <h1 className="sr-only">{COPY.blogExtra.seoTitle}</h1>

            <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
                <Reveal>
                    <div className="mb-16 text-center max-w-3xl mx-auto">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-900/40 border border-brand-500/30 text-brand-300 text-xs font-semibold tracking-wide backdrop-blur-md mb-6 hover:bg-brand-900/60 transition-colors cursor-default">
                            <Sparkles className="w-3.5 h-3.5 text-brand-400" />
                            <span>{COPY.blogExtra.insightsStrategy}</span>
                        </div>
                        <h2 className="text-3xl md:text-5xl font-bold text-white mb-4 tracking-tight leading-tight">
                            {COPY.blogExtra.headlinePart1}<span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-indigo-300 to-sky-400 bg-[length:200%_auto] animate-[gradient_8s_ease_infinite]">{COPY.blogExtra.headlinePart2}</span>
                        </h2>
                        <p className="text-sm md:text-base text-slate-400 max-w-2xl mx-auto font-mono leading-relaxed">
                            {COPY.blogExtra.subheadline}
                        </p>
                    </div>
                </Reveal>

                {/* Featured Post */}
                {BLOG_POSTS.length > 0 && (
                    <Reveal delay={0.2}>
                        <Link to={`/blog/${BLOG_POSTS[0].slug}`} className="group relative block mb-16 overflow-hidden rounded-3xl bg-white/[0.02] border border-white/5 backdrop-blur-md transition-all duration-500 hover:border-white/10 hover:shadow-2xl hover:shadow-black/40">
                            <div className="grid lg:grid-cols-2 gap-0 items-center">
                                <div className="aspect-[16/9] lg:aspect-auto h-full overflow-hidden relative">
                                    <img
                                        src={BLOG_POSTS[0].image}
                                        alt={BLOG_POSTS[0].title}
                                        className="w-full h-full object-cover transition-all duration-700 group-hover:scale-105 group-hover:opacity-90"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-r from-dark-900/40 to-transparent lg:hidden"></div>
                                </div>
                                <div className="p-8 lg:p-12">
                                    <div className="flex items-center gap-3 mb-6">
                                        <span className="px-3 py-1 bg-brand-500/10 border border-brand-500/20 text-brand-400 text-xs font-bold rounded-md uppercase tracking-wider">
                                            {COPY.blogExtra.featured}
                                        </span>
                                        <span className="text-slate-500 text-xs font-mono uppercase tracking-wider">{BLOG_POSTS[0].category}</span>
                                    </div>
                                    <h3 className="text-2xl md:text-3xl font-bold text-white mb-4 group-hover:text-brand-400 transition-colors leading-tight">
                                        {BLOG_POSTS[0].title}
                                    </h3>
                                    <p className="text-slate-400 mb-8 text-sm md:text-base leading-relaxed line-clamp-3">
                                        {BLOG_POSTS[0].excerpt}
                                    </p>
                                    <div className="flex items-center gap-6 text-slate-500 text-xs font-mono mb-8 border-t border-white/5 pt-6">
                                        <div className="flex items-center gap-2">
                                            <Calendar className="w-3.5 h-3.5" />
                                            <span>{new Date(BLOG_POSTS[0].date).toLocaleDateString()}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Clock className="w-3.5 h-3.5" />
                                            <span>{BLOG_POSTS[0].readTime}</span>
                                        </div>
                                    </div>
                                    <div className="inline-flex items-center gap-2 text-brand-400 text-sm font-bold group-hover:gap-4 transition-all">
                                        {COPY.blogExtra.readMore} <ArrowRight className="w-4 h-4" />
                                    </div>
                                </div>
                            </div>
                        </Link>
                    </Reveal>
                )}

                {/* Regular Posts Grid */}
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {BLOG_POSTS.slice(1).map((post, index) => (
                        <Reveal key={post.id} delay={0.1 * index}>
                            <Link to={`/blog/${post.slug}`} className="group flex flex-col h-full bg-white/[0.01] border border-white/5 rounded-2xl overflow-hidden backdrop-blur-md transition-all duration-300 hover:bg-white/[0.03] hover:border-white/10 hover:-translate-y-1 hover:shadow-2xl hover:shadow-black/40">
                                <div className="aspect-[16/10] overflow-hidden relative border-b border-white/5">
                                    <img
                                        src={post.image}
                                        alt={post.title}
                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                    />
                                </div>
                                <div className="p-6 flex flex-col flex-grow">
                                    <div className="flex items-center justify-between mb-4">
                                        <span className="text-[10px] font-bold text-brand-400 uppercase tracking-widest bg-brand-500/5 px-2 py-0.5 rounded border border-brand-500/10">{post.category}</span>
                                        <span className="text-[10px] text-slate-500 font-mono">{post.readTime}</span>
                                    </div>
                                    <h3 className="text-lg font-bold text-white mb-3 group-hover:text-brand-400 transition-colors leading-snug">
                                        {post.title}
                                    </h3>
                                    <p className="text-slate-400 text-xs leading-relaxed mb-6 line-clamp-3">
                                        {post.excerpt}
                                    </p>
                                    <div className="mt-auto flex items-center justify-between pt-4 border-t border-white/5">
                                        <div className="flex items-center gap-2">
                                            <div className="w-6 h-6 rounded-full bg-brand-500/10 flex items-center justify-center border border-brand-500/20">
                                                <User className="w-3 h-3 text-brand-400" />
                                            </div>
                                            <span className="text-xs text-slate-400 font-medium">{post.author}</span>
                                        </div>
                                        <ChevronRight className="w-4 h-4 text-slate-500 group-hover:translate-x-1 transition-transform group-hover:text-brand-400" />
                                    </div>
                                </div>
                            </Link>
                        </Reveal>
                    ))}
                </div>
            </div>
        </div>
    );
};
