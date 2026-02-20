'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { apiPost, setToken, getToken } from '@/lib/api-client';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';

export default function RegisterPage() {
  const router = useRouter();

  useEffect(() => {
    if (typeof window !== 'undefined' && getToken()) {
      router.replace('/');
    }
  }, [router]);

  const [form, setForm] = useState({
    organization_name: '',
    organization_slug: '',
    admin_email: '',
    admin_full_name: '',
    admin_password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (name === 'organization_name' && !form.organization_slug) {
      const slug = value.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '').slice(0, 50);
      setForm((prev) => ({ ...prev, organization_slug: slug }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await apiPost<{ access_token?: string }>('/organizations/register', form, { skipAuth: true });
      if (res?.access_token) {
        setToken(res.access_token);
        router.replace('/');
      } else {
        setError('Registro completado pero no se recibió token');
      }
    } catch (err: unknown) {
      const msg = err && typeof err === 'object' && 'message' in err ? String((err as { message: string }).message) : 'Error al registrar';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">Nougram</h1>
          <p className="text-sm text-gray-500 mt-1">Crea tu organización</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nombre de la organización</label>
              <Input name="organization_name" value={form.organization_name} onChange={handleChange} placeholder="Mi Agencia" required className="w-full" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Slug (URL)</label>
              <Input name="organization_slug" value={form.organization_slug} onChange={handleChange} placeholder="mi-agencia" className="w-full" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tu nombre</label>
              <Input name="admin_full_name" value={form.admin_full_name} onChange={handleChange} placeholder="Juan Pérez" required className="w-full" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <Input type="email" name="admin_email" value={form.admin_email} onChange={handleChange} placeholder="admin@miagencia.com" required className="w-full" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña (mín. 8 caracteres)</label>
              <Input type="password" name="admin_password" value={form.admin_password} onChange={handleChange} placeholder="••••••••" required minLength={8} className="w-full" />
            </div>
            {error && <p className="text-sm text-red-600">{error}</p>}
            <Button type="submit" disabled={loading} className="w-full">
              {loading ? 'Registrando...' : 'Crear cuenta'}
            </Button>
          </form>
          <p className="mt-4 text-center text-sm text-gray-500">
            ¿Ya tienes cuenta?{' '}
            <button type="button" onClick={() => router.push('/login')} className="text-blue-600 hover:underline font-medium">
              Iniciar sesión
            </button>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
