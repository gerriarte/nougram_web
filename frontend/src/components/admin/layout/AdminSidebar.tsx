'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    LayoutDashboard,
    UsersRound,
    Building2,
    PlusCircle,
    ChevronRight,
    PanelLeftClose,
    PanelLeftOpen
} from 'lucide-react';
import { cn } from '@/lib/utils';

const STORAGE_KEY = 'nougram_sidebar_collapsed';

export function AdminSidebar() {
    const pathname = usePathname();
    const [collapsed, setCollapsed] = useState(false);

    useEffect(() => {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored !== null) setCollapsed(stored === 'true');
    }, []);

    const toggleCollapsed = () => {
        setCollapsed((prev) => {
            const next = !prev;
            localStorage.setItem(STORAGE_KEY, String(next));
            return next;
        });
    };

    const MAIN_ITEMS = [
        { label: 'Nueva Cotización', href: '/projects/new', icon: PlusCircle },
    ];

    const BUSINESS_ITEMS = [
        { label: 'Dashboard & Pipeline', href: '/dashboard', icon: LayoutDashboard },
        { label: 'Nómina (Equipo)', href: '/admin/payroll', icon: UsersRound },
        { label: 'Overhead (Gastos)', href: '/admin/overhead', icon: Building2 },
    ];

    return (
        <aside
            className={cn(
                "bg-white/70 backdrop-blur-xl border-r border-white/20 min-h-screen flex flex-col z-20 hidden md:flex sticky top-0 transition-all duration-300 overflow-hidden",
                collapsed ? "w-[72px]" : "w-72"
            )}
        >
            <div className={cn("shrink-0 transition-all duration-300", collapsed ? "p-4" : "p-8 pb-10")}>
                <div className={cn("flex items-center gap-3 mb-1", collapsed && "justify-center")}>
                    <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shrink-0">
                        <div className="w-4 h-4 bg-white/20 rounded-sm rotate-45" />
                    </div>
                    {!collapsed && (
                        <>
                            <h1 className="text-2xl font-bold text-gray-900 tracking-tighter whitespace-nowrap">Nougram</h1>
                        </>
                    )}
                </div>
                {!collapsed && (
                    <p className="text-[10px] font-black text-system-gray uppercase tracking-[0.2em] ml-11">Business OS</p>
                )}
            </div>

            <nav className="flex-1 px-2 py-4 space-y-6">
                <div className="space-y-1.5">
                    {!collapsed && (
                        <p className="px-4 text-[10px] font-black text-system-gray uppercase tracking-[0.15em] mb-3">Principal</p>
                    )}
                    {MAIN_ITEMS.map((item) => {
                        const isActive = pathname.startsWith(item.href);
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                title={collapsed ? item.label : undefined}
                                className={cn(
                                    "flex items-center rounded-2xl text-[13px] font-bold transition-all group",
                                    collapsed ? "justify-center px-0 py-3" : "justify-between px-4 py-3",
                                    isActive
                                        ? "bg-blue-600 text-white shadow-lg shadow-blue-500/25"
                                        : "text-gray-600 hover:bg-white hover:shadow-sm"
                                )}
                            >
                                <div className={cn("flex items-center gap-3", collapsed && "gap-0")}>
                                    <item.icon size={20} strokeWidth={isActive ? 2.5 : 1.5} className="shrink-0" />
                                    {!collapsed && <span>{item.label}</span>}
                                </div>
                                {!collapsed && !isActive && (
                                    <ChevronRight size={14} className="opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all shrink-0" />
                                )}
                            </Link>
                        );
                    })}
                </div>

                <div className="space-y-1.5">
                    {!collapsed && (
                        <p className="px-4 text-[10px] font-black text-system-gray uppercase tracking-[0.15em] mb-3">Negocio</p>
                    )}
                    {BUSINESS_ITEMS.map((item) => {
                        const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                title={collapsed ? item.label : undefined}
                                className={cn(
                                    "flex items-center rounded-2xl text-[13px] font-bold transition-all group",
                                    collapsed ? "justify-center px-0 py-3" : "justify-between px-4 py-3",
                                    isActive
                                        ? "bg-blue-50/50 text-blue-600 ring-1 ring-blue-100/50"
                                        : "text-gray-600 hover:bg-white hover:shadow-sm"
                                )}
                            >
                                <div className={cn("flex items-center gap-3", collapsed && "gap-0")}>
                                    <item.icon size={20} strokeWidth={isActive ? 2 : 1.5} className={cn("shrink-0", isActive && "text-blue-600")} />
                                    {!collapsed && <span>{item.label}</span>}
                                </div>
                                {!collapsed && isActive && <div className="w-1.5 h-1.5 rounded-full bg-blue-600 shrink-0" />}
                                {!collapsed && !isActive && (
                                    <ChevronRight size={14} className="opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all shrink-0" />
                                )}
                            </Link>
                        );
                    })}
                </div>
            </nav>

            <div className="shrink-0 space-y-2 p-2">
                <button
                    onClick={toggleCollapsed}
                    title={collapsed ? 'Expandir menú' : 'Colapsar menú'}
                    className={cn(
                        "w-full flex items-center justify-center gap-2 py-3 rounded-2xl text-gray-600 hover:bg-white hover:text-gray-900 transition-all font-medium text-sm",
                        collapsed && "px-0"
                    )}
                >
                    {collapsed ? (
                        <PanelLeftOpen size={20} />
                    ) : (
                        <>
                            <PanelLeftClose size={18} />
                            <span>Colapsar</span>
                        </>
                    )}
                </button>
                <div className={cn("rounded-3xl bg-gray-200/30 backdrop-blur-sm border border-white/40 transition-all", collapsed ? "p-3 flex justify-center" : "p-6 m-2")}>
                    <div className={cn("flex items-center gap-4", collapsed && "gap-0 justify-center")}>
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold shadow-lg shadow-blue-500/20 shrink-0">
                            JD
                        </div>
                        {!collapsed && (
                            <div className="min-w-0">
                                <p className="text-[13px] font-bold text-gray-900 truncate tracking-tight">Usuario Demo</p>
                                <p className="text-[11px] font-medium text-system-gray truncate">Owner</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </aside>
    );
}
