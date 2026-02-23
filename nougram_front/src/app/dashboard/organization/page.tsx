'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Building, Lock, Save } from 'lucide-react';
import { AdminLayout } from '@/components/admin/layout/AdminLayout';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { apiRequest } from '@/lib/api-client';
import { useAuth } from '@/hooks/useAuth';

type OrganizationResponse = {
    id: number;
    name: string;
    slug: string;
    subscription_plan: string;
    subscription_status: string;
    settings?: Record<string, unknown> | null;
    created_at: string;
    updated_at?: string | null;
    user_count?: number | null;
};

type OrganizationUpdatePayload = {
    name?: string;
    slug?: string;
    settings?: Record<string, unknown>;
};

function normalizeSlug(input: string): string {
    return input
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/[\s-]+/g, '-')
        .replace(/^-+|-+$/g, '');
}

export default function OrganizationDetailPage() {
    const { user } = useAuth();
    const isOwner = user?.role === 'owner';

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    const [organization, setOrganization] = useState<OrganizationResponse | null>(null);
    const [name, setName] = useState('');
    const [slug, setSlug] = useState('');
    const [country, setCountry] = useState('');
    const [currency, setCurrency] = useState('');

    useEffect(() => {
        const loadOrganization = async () => {
            setLoading(true);
            setError(null);
            setSuccess(null);

            const response = await apiRequest<OrganizationResponse>('/organizations/me');
            if (response.error || !response.data) {
                setError(response.error || 'No se pudo cargar la organización');
                setLoading(false);
                return;
            }

            const org = response.data;
            const settings = (org.settings || {}) as Record<string, unknown>;

            setOrganization(org);
            setName(org.name || '');
            setSlug(org.slug || '');
            setCountry(typeof settings.country === 'string' ? settings.country : '');
            setCurrency(typeof settings.primary_currency === 'string' ? settings.primary_currency : '');
            setLoading(false);
        };

        loadOrganization();
    }, []);

    const hasChanges = useMemo(() => {
        if (!organization) return false;
        const settings = (organization.settings || {}) as Record<string, unknown>;
        const originalCountry = typeof settings.country === 'string' ? settings.country : '';
        const originalCurrency = typeof settings.primary_currency === 'string' ? settings.primary_currency : '';

        return (
            name.trim() !== organization.name ||
            slug.trim() !== organization.slug ||
            country.trim() !== originalCountry ||
            currency.trim().toUpperCase() !== originalCurrency
        );
    }, [organization, name, slug, country, currency]);

    const onSave = async () => {
        if (!organization || !isOwner) return;

        const normalizedSlug = normalizeSlug(slug);
        if (!name.trim()) {
            setError('El nombre de la organización es obligatorio');
            return;
        }
        if (!normalizedSlug || normalizedSlug.length < 3) {
            setError('El slug debe tener al menos 3 caracteres válidos');
            return;
        }

        setSaving(true);
        setError(null);
        setSuccess(null);

        const payload: OrganizationUpdatePayload = {
            name: name.trim(),
            slug: normalizedSlug,
            settings: {
                ...((organization.settings || {}) as Record<string, unknown>),
                country: country.trim().toUpperCase(),
                primary_currency: currency.trim().toUpperCase(),
            },
        };

        const response = await apiRequest<OrganizationResponse>(`/organizations/${organization.id}`, {
            method: 'PUT',
            body: JSON.stringify(payload),
        });

        if (response.error || !response.data) {
            setError(response.error || 'No se pudieron guardar los cambios');
            setSaving(false);
            return;
        }

        const updated = response.data;
        const settings = (updated.settings || {}) as Record<string, unknown>;
        setOrganization(updated);
        setName(updated.name || '');
        setSlug(updated.slug || '');
        setCountry(typeof settings.country === 'string' ? settings.country : '');
        setCurrency(typeof settings.primary_currency === 'string' ? settings.primary_currency : '');
        setSuccess('Cambios guardados correctamente');
        setSaving(false);
    };

    return (
        <AdminLayout hideRightPanel>
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-[1000px] mx-auto space-y-8"
            >
                <div className="space-y-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
                            <Building size={20} strokeWidth={1.8} />
                        </div>
                        <span className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em] bg-blue-50 px-3 py-1 rounded-full border border-blue-100">
                            Tenant
                        </span>
                    </div>
                    <h1 className="text-4xl font-bold text-gray-900 tracking-tight">Detalle de Empresa</h1>
                    <p className="text-system-gray font-medium text-lg">
                        Información principal de la empresa/tenant registrada.
                    </p>
                </div>

                {loading ? (
                    <Card>
                        <div className="p-10 flex justify-center">
                            <div className="w-8 h-8 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin" />
                        </div>
                    </Card>
                ) : (
                    <Card>
                        <div className="p-8 space-y-6">
                            {!isOwner && (
                                <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-amber-900 text-sm font-medium flex items-center gap-2">
                                    <Lock size={16} />
                                    Solo el owner puede editar la información del tenant.
                                </div>
                            )}

                            {error && (
                                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-red-700 text-sm font-medium">
                                    {error}
                                </div>
                            )}
                            {success && (
                                <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-green-700 text-sm font-medium">
                                    {success}
                                </div>
                            )}

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div className="space-y-2">
                                    <label className="text-[11px] font-black text-system-gray uppercase tracking-[0.15em]">Nombre</label>
                                    <Input
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        disabled={!isOwner || saving}
                                        placeholder="Nombre de la organización"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[11px] font-black text-system-gray uppercase tracking-[0.15em]">Slug</label>
                                    <Input
                                        value={slug}
                                        onChange={(e) => setSlug(e.target.value)}
                                        disabled={!isOwner || saving}
                                        placeholder="mi-organizacion"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[11px] font-black text-system-gray uppercase tracking-[0.15em]">País (ISO)</label>
                                    <Input
                                        value={country}
                                        onChange={(e) => setCountry(e.target.value)}
                                        disabled={!isOwner || saving}
                                        placeholder="COL"
                                        maxLength={3}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[11px] font-black text-system-gray uppercase tracking-[0.15em]">Moneda principal</label>
                                    <Input
                                        value={currency}
                                        onChange={(e) => setCurrency(e.target.value)}
                                        disabled={!isOwner || saving}
                                        placeholder="COP"
                                        maxLength={3}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                                <div className="rounded-xl bg-gray-100/60 px-4 py-3">
                                    <p className="text-[10px] font-black text-system-gray uppercase tracking-[0.15em]">Plan</p>
                                    <p className="text-sm font-bold text-gray-900 mt-1">{organization?.subscription_plan || '-'}</p>
                                </div>
                                <div className="rounded-xl bg-gray-100/60 px-4 py-3">
                                    <p className="text-[10px] font-black text-system-gray uppercase tracking-[0.15em]">Estado</p>
                                    <p className="text-sm font-bold text-gray-900 mt-1">{organization?.subscription_status || '-'}</p>
                                </div>
                                <div className="rounded-xl bg-gray-100/60 px-4 py-3">
                                    <p className="text-[10px] font-black text-system-gray uppercase tracking-[0.15em]">Usuarios</p>
                                    <p className="text-sm font-bold text-gray-900 mt-1">{organization?.user_count ?? '-'}</p>
                                </div>
                            </div>

                            <div className="pt-2">
                                <Button
                                    className="h-12 px-6 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold flex items-center gap-2"
                                    onClick={onSave}
                                    disabled={!isOwner || !hasChanges || saving}
                                >
                                    <Save size={16} />
                                    {saving ? 'Guardando...' : 'Guardar cambios'}
                                </Button>
                            </div>
                        </div>
                    </Card>
                )}
            </motion.div>
        </AdminLayout>
    );
}

