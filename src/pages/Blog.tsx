import React from 'react';
import { Link } from 'react-router-dom';
import { BLOG_POSTS } from '../data/blog-posts';
import { ArrowRight, User, Calendar, Tag } from 'lucide-react';
import { FooterCTA } from '../components/FooterCTA';

export const Blog: React.FC = () => {
    return (
        <>
            <title>Blog | Nougram - Rentabilidad para Freelancers</title>
            <meta name="description" content="Artículos sobre pricing, finanzas para freelancers y estrategias para vender servicios de conocimiento. Aprende a cobrar lo que vales." />
            <link rel="canonical" href="https://nougram.co/blog" />

            <section className="relative min-h-[50vh] pt-32 pb-20 bg-dark-900 overflow-hidden">
                {/* Background Elements from Hero */}
                <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none">
                    <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]"></div>
                    <div className="absolute top-0 -left-4 w-96 h-96 bg-brand-600 rounded-full mix-blend-multiply filter blur-[128px] opacity-20"></div>
                </div>

                <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h1 className="text-4xl lg:text-6xl font-bold text-white mb-6 tracking-tight">
                        Nougram <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-400 to-indigo-400">Insights</span>
                    </h1>
                    <p className="text-lg text-slate-300 max-w-2xl mx-auto mb-16">
                        Consejos prácticos, estrategias de precios y guías para profesionales que quieren dejar de sobrevivir y empezar a rentabilizar.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {BLOG_POSTS.map((post) => (
                            <article key={post.slug} className="group relative flex flex-col items-start text-left bg-white/5 border border-white/10 hover:border-brand-500/50 rounded-3xl p-6 backdrop-blur-sm transition-all hover:bg-white/10 hover:-translate-y-2 duration-300">
                                <div className="flex flex-wrap gap-2 mb-4">
                                    {post.tags.map(tag => (
                                        <span key={tag} className="px-2.5 py-1 rounded-full bg-brand-900/40 text-brand-300 text-xs font-medium border border-brand-500/20">
                                            {tag}
                                        </span>
                                    ))}
                                </div>

                                <h2 className="text-xl font-bold text-white mb-3 group-hover:text-brand-200 transition-colors">
                                    <Link to={`/blog/${post.slug}`} className="before:absolute before:inset-0">
                                        {post.title}
                                    </Link>
                                </h2>

                                <p className="text-sm text-slate-400 mb-6 line-clamp-3">
                                    {post.excerpt}
                                </p>

                                <div className="mt-auto w-full pt-4 border-t border-white/5 flex items-center justify-between text-xs text-slate-500">
                                    <div className="flex items-center gap-2">
                                        <User size={14} />
                                        {post.author}
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Calendar size={14} />
                                        {post.date}
                                    </div>
                                </div>

                                <div className="absolute bottom-6 right-6 opacity-0 translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
                                    <ArrowRight className="text-brand-400" />
                                </div>
                            </article>
                        ))}
                    </div>
                </div>
            </section>

            <FooterCTA />
        </>
    );
};
