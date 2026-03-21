import React from 'react';
import { Link } from 'react-router-dom';
import { BLOG_POSTS } from '../content/blog-posts';
import { ArrowRight, Calendar, User, Clock, ChevronRight } from 'lucide-react';
import { Reveal } from '../components/Reveal';

export const Blog: React.FC = () => {
    return (
        <div className="bg-white min-h-screen pt-24 pb-20">
            {/* SEO Header - Hidden from UI but for crawlers */}
            <h1 className="sr-only">Blog de Nougram - Inteligencia Artificial y Eficiencia en Ventas</h1>

            <div className="max-w-7xl mx-auto px-6 lg:px-8">
                <Reveal>
                    <div className="mb-16">
                        <h2 className="text-4xl lg:text-5xl font-bold text-slate-900 mb-4 tracking-tight">
                            Insights sobre <span className="text-brand-500">IA y Negocios</span>
                        </h2>
                        <p className="text-lg text-slate-600 max-w-2xl">
                            Explora nuestras últimas guías, investigaciones y noticias sobre cómo escalar tu negocio con tecnología de vanguardia.
                        </p>
                    </div>
                </Reveal>

                {/* Featured Post */}
                <Reveal delay={0.2}>
                    <Link to={`/blog/${BLOG_POSTS[0].slug}`} className="group relative block mb-20 overflow-hidden rounded-3xl bg-slate-100">
                        <div className="grid lg:grid-cols-2 gap-0 items-center">
                            <div className="aspect-[16/9] lg:aspect-auto h-full overflow-hidden">
                                <img
                                    src={BLOG_POSTS[0].image}
                                    alt={BLOG_POSTS[0].title}
                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                />
                            </div>
                            <div className="p-8 lg:p-12">
                                <div className="flex items-center gap-3 mb-6">
                                    <span className="px-3 py-1 bg-brand-100 text-brand-700 text-xs font-bold rounded-full uppercase tracking-wider">
                                        Destacado
                                    </span>
                                    <span className="text-slate-400 text-sm">{BLOG_POSTS[0].category}</span>
                                </div>
                                <h3 className="text-3xl font-bold text-slate-900 mb-4 group-hover:text-brand-500 transition-colors leading-tight">
                                    {BLOG_POSTS[0].title}
                                </h3>
                                <p className="text-slate-600 mb-8 text-lg">
                                    {BLOG_POSTS[0].excerpt}
                                </p>
                                <div className="flex items-center gap-6 text-slate-400 text-sm mb-8">
                                    <div className="flex items-center gap-2">
                                        <Calendar className="w-4 h-4" />
                                        <span>{new Date(BLOG_POSTS[0].date).toLocaleDateString()}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Clock className="w-4 h-4" />
                                        <span>{BLOG_POSTS[0].readTime}</span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 text-brand-600 font-bold group-hover:gap-4 transition-all">
                                    Leer artículo <ArrowRight className="w-5 h-5" />
                                </div>
                            </div>
                        </div>
                    </Link>
                </Reveal>

                {/* Regular Posts Grid */}
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {BLOG_POSTS.slice(1).map((post, index) => (
                        <Reveal key={post.id} delay={0.1 * index}>
                            <Link to={`/blog/${post.slug}`} className="group flex flex-col h-full bg-white border border-slate-100 rounded-3xl overflow-hidden hover:shadow-xl hover:shadow-slate-200/50 transition-all">
                                <div className="aspect-[16/10] overflow-hidden">
                                    <img
                                        src={post.image}
                                        alt={post.title}
                                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                    />
                                </div>
                                <div className="p-6 flex flex-col flex-grow">
                                    <div className="flex items-center justify-between mb-4">
                                        <span className="text-xs font-bold text-brand-600 uppercase tracking-widest">{post.category}</span>
                                        <span className="text-xs text-slate-400">{post.readTime}</span>
                                    </div>
                                    <h3 className="text-xl font-bold text-slate-900 mb-3 group-hover:text-brand-600 transition-colors">
                                        {post.title}
                                    </h3>
                                    <p className="text-slate-500 text-sm mb-6 line-clamp-3">
                                        {post.excerpt}
                                    </p>
                                    <div className="mt-auto flex items-center justify-between pt-4 border-t border-slate-50">
                                        <div className="flex items-center gap-2">
                                            <div className="w-6 h-6 rounded-full bg-brand-100 flex items-center justify-center">
                                                <User className="w-3 h-3 text-brand-600" />
                                            </div>
                                            <span className="text-xs text-slate-600 font-medium">{post.author}</span>
                                        </div>
                                        <ChevronRight className="w-4 h-4 text-slate-300 group-hover:translate-x-1 transition-transform" />
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
