"use client";

import { useState } from 'react';
import { useGetSubscription, useGetPlans, useUpdateSubscription, useCancelSubscription, useCreateCheckoutSession, useGetCurrentUser } from '@/lib/queries';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, CreditCard, Calendar, AlertCircle, Check, X } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useRouter } from 'next/navigation';
import { canManageSubscription } from '@/lib/permissions';

export default function BillingPage() {
  const router = useRouter();
  const { data: currentUser } = useGetCurrentUser();
  const { data: subscription, isLoading: subscriptionLoading } = useGetSubscription();
  const { data: plansData, isLoading: plansLoading } = useGetPlans();
  const updateSubscription = useUpdateSubscription();
  const cancelSubscription = useCancelSubscription();
  const createCheckoutSession = useCreateCheckoutSession();
  const canManage = canManageSubscription(currentUser);
  
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [cancelImmediately, setCancelImmediately] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleUpgrade = async (planName: string, interval: 'month' | 'year' = 'month') => {
    setLoading(true);
    try {
      const response = await createCheckoutSession.mutateAsync({
        plan: planName,
        interval,
        success_url: `${window.location.origin}/settings/billing?success=true`,
        cancel_url: `${window.location.origin}/settings/billing?canceled=true`,
      });
      
      // Redirect to Stripe Checkout
      window.location.href = response.url;
    } catch (error) {
      console.error('Error creating checkout session:', error);
      alert('Error al crear la sesión de pago. Por favor, intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelSubscription = async () => {
    if (!subscription) return;
    
    try {
      await cancelSubscription.mutateAsync({
        cancel_immediately: cancelImmediately,
      });
      setCancelDialogOpen(false);
    } catch (error) {
      console.error('Error cancelling subscription:', error);
      alert('Error al cancelar la suscripción. Por favor, intenta nuevamente.');
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { variant: 'default' | 'secondary' | 'destructive'; label: string }> = {
      active: { variant: 'default', label: 'Activa' },
      trialing: { variant: 'default', label: 'En Prueba' },
      past_due: { variant: 'destructive', label: 'Pago Pendiente' },
      cancelled: { variant: 'secondary', label: 'Cancelada' },
      incomplete: { variant: 'secondary', label: 'Incompleta' },
    };
    
    const config = statusConfig[status] || { variant: 'secondary' as const, label: status };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  if (subscriptionLoading || plansLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
      </div>
    );
  }

  const plans = plansData?.plans || [];
  const currentPlan = plans.find(p => p.name === subscription?.plan);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-grey-900">Facturación y Suscripción</h1>
        <p className="text-grey-600 mt-1">Gestiona tu plan de suscripción y métodos de pago</p>
      </div>

      {/* Current Subscription */}
      {subscription && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Suscripción Actual
            </CardTitle>
            <CardDescription>
              Información sobre tu plan actual y estado de facturación
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-grey-600">Plan</p>
                <p className="text-lg font-semibold">
                  {currentPlan?.display_name || subscription.plan}
                </p>
              </div>
              <div>{getStatusBadge(subscription.status)}</div>
            </div>

            {subscription.current_period_start && subscription.current_period_end && (
              <div className="flex items-center gap-2 text-sm text-grey-600">
                <Calendar className="h-4 w-4" />
                <span>
                  Período actual: {new Date(subscription.current_period_start).toLocaleDateString()} - {new Date(subscription.current_period_end).toLocaleDateString()}
                </span>
              </div>
            )}

            {subscription.trial_end && (
              <div className="flex items-center gap-2 text-sm text-amber-600">
                <AlertCircle className="h-4 w-4" />
                <span>
                  Período de prueba hasta: {new Date(subscription.trial_end).toLocaleDateString()}
                </span>
              </div>
            )}

            {subscription.cancel_at_period_end && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Suscripción programada para cancelación</AlertTitle>
                <AlertDescription>
                  Tu suscripción se cancelará al final del período actual.
                </AlertDescription>
              </Alert>
            )}

            {subscription.status === 'active' && !subscription.cancel_at_period_end && canManage && (
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setCancelDialogOpen(true)}
                >
                  Cancelar Suscripción
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Available Plans */}
      <Card>
        <CardHeader>
          <CardTitle>Planes Disponibles</CardTitle>
          <CardDescription>
            Elige el plan que mejor se adapte a tus necesidades
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {plans.map((plan) => {
              const isCurrentPlan = subscription?.plan === plan.name;
              const isFree = plan.name === 'free';
              
              return (
                <Card key={plan.name} className={isCurrentPlan ? 'border-primary-500 border-2' : ''}>
                  <CardHeader>
                    <CardTitle className="text-xl">{plan.display_name}</CardTitle>
                    <CardDescription>{plan.description}</CardDescription>
                    <div className="mt-4">
                      {plan.monthly_price !== null ? (
                        <div>
                          <span className="text-3xl font-bold">
                            ${plan.monthly_price.toFixed(2)}
                          </span>
                          <span className="text-grey-600">/mes</span>
                        </div>
                      ) : (
                        <span className="text-lg font-semibold">Contactar para precio</span>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <ul className="space-y-2 text-sm">
                      {plan.features.map((feature, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <Check className="h-4 w-4 text-primary-500 mt-0.5 flex-shrink-0" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                    {canManage ? (
                      <Button
                        className="w-full"
                        variant={isCurrentPlan ? 'outline' : 'default'}
                        disabled={isCurrentPlan || loading}
                        onClick={() => handleUpgrade(plan.name, 'month')}
                      >
                        {isCurrentPlan ? 'Plan Actual' : isFree ? 'Seleccionar Plan' : 'Actualizar Plan'}
                      </Button>
                    ) : (
                      <Button
                        className="w-full"
                        variant="outline"
                        disabled
                      >
                        Plan Actual (sin permisos para modificar)
                      </Button>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Cancel Subscription Dialog */}
      <Dialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancelar Suscripción</DialogTitle>
            <DialogDescription>
              ¿Estás seguro de que deseas cancelar tu suscripción?
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <input
                type="radio"
                id="cancel-period-end"
                name="cancel-type"
                checked={!cancelImmediately}
                onChange={() => setCancelImmediately(false)}
              />
              <label htmlFor="cancel-period-end" className="text-sm">
                Cancelar al final del período actual (recomendado)
              </label>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="radio"
                id="cancel-immediately"
                name="cancel-type"
                checked={cancelImmediately}
                onChange={() => setCancelImmediately(true)}
              />
              <label htmlFor="cancel-immediately" className="text-sm">
                Cancelar inmediatamente
              </label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCancelDialogOpen(false)}>
              Cerrar
            </Button>
            <Button variant="destructive" onClick={handleCancelSubscription}>
              Confirmar Cancelación
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

