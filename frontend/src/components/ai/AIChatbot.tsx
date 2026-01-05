"use client";

import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Send, Bot, User, AlertCircle, CheckCircle2, Sparkles } from 'lucide-react';
import { useProcessCommand, NaturalLanguageCommandResponse } from '@/lib/queries/ai';
import { useToast } from '@/hooks/use-toast';
import { ScrollArea } from '@/components/ui/scroll-area';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  actionData?: NaturalLanguageCommandResponse;
}

interface AIChatbotProps {
  onActionConfirm?: (action: NaturalLanguageCommandResponse) => void;
}

export function AIChatbot({ onActionConfirm }: AIChatbotProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: '¡Hola! Soy tu asistente de configuración. Puedes pedirme cosas como:\n\n• "Añade un Senior Designer que gana 45k anuales"\n• "Crea un servicio de Desarrollo Web con margen del 40%"\n• "Agrega un costo fijo de Adobe Creative Cloud por $50 mensuales"',
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const { toast } = useToast();
  const processCommandMutation = useProcessCommand();
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Auto-scroll to bottom when new messages arrive
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || processCommandMutation.isPending) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');

    try {
      const result = await processCommandMutation.mutateAsync({
        command: input.trim(),
      });

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: result.reasoning || `He interpretado tu comando como: ${result.action_type}`,
        timestamp: new Date(),
        actionData: result,
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `Error: ${error instanceof Error ? error.message : 'No pude procesar tu comando. Intenta reformularlo.'}`,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, errorMessage]);
    }
  };

  const handleConfirmAction = (action: NaturalLanguageCommandResponse) => {
    if (onActionConfirm) {
      onActionConfirm(action);
      toast({
        title: 'Acción confirmada',
        description: 'La acción se ejecutará. Revisa los cambios antes de guardar.',
      });
    }
  };

  const getActionTypeLabel = (actionType: string) => {
    const labels: Record<string, string> = {
      add_team_member: 'Agregar Miembro del Equipo',
      add_service: 'Agregar Servicio',
      add_fixed_cost: 'Agregar Costo Fijo',
      update_team_member: 'Actualizar Miembro del Equipo',
      delete_team_member: 'Eliminar Miembro del Equipo',
      unknown: 'Acción Desconocida',
    };
    return labels[actionType] || actionType;
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'bg-green-100 text-green-800';
    if (confidence >= 0.6) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          Asistente de Configuración
        </CardTitle>
        <CardDescription>
          Di lo que necesitas en lenguaje natural y yo lo configuraré por ti
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col space-y-4">
        <ScrollArea className="flex-1 pr-4" ref={scrollAreaRef}>
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {message.role === 'assistant' && (
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center">
                    <Bot className="h-4 w-4 text-primary-600" />
                  </div>
                )}
                <div
                  className={`max-w-[80%] rounded-lg p-3 ${
                    message.role === 'user'
                      ? 'bg-primary-600 text-white'
                      : 'bg-grey-100 text-grey-900'
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  {message.actionData && (
                    <div className="mt-3 pt-3 border-t border-grey-300 space-y-2">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{getActionTypeLabel(message.actionData.action_type)}</Badge>
                        <Badge className={getConfidenceColor(message.actionData.confidence)}>
                          Confianza: {(message.actionData.confidence * 100).toFixed(0)}%
                        </Badge>
                      </div>
                      {message.actionData.action_type !== 'unknown' && (
                        <div className="text-xs space-y-1">
                          {Object.entries(message.actionData.action_data)
                            .filter(([_, value]) => value !== undefined && value !== null && value !== '')
                            .map(([key, value]) => (
                              <div key={key} className="flex justify-between gap-2">
                                <span className="font-medium">{key.replace(/_/g, ' ')}:</span>
                                <span>{String(value)}</span>
                              </div>
                            ))}
                        </div>
                      )}
                      {message.actionData.requires_confirmation && onActionConfirm && (
                        <Button
                          size="sm"
                          onClick={() => handleConfirmAction(message.actionData!)}
                          className="w-full mt-2"
                        >
                          <CheckCircle2 className="mr-2 h-4 w-4" />
                          Confirmar y Ejecutar
                        </Button>
                      )}
                    </div>
                  )}
                  <p className="text-xs opacity-70 mt-2">
                    {message.timestamp.toLocaleTimeString()}
                  </p>
                </div>
                {message.role === 'user' && (
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-grey-200 flex items-center justify-center">
                    <User className="h-4 w-4 text-grey-600" />
                  </div>
                )}
              </div>
            ))}
            {processCommandMutation.isPending && (
              <div className="flex gap-3 justify-start">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center">
                  <Bot className="h-4 w-4 text-primary-600" />
                </div>
                <div className="bg-grey-100 rounded-lg p-3">
                  <Loader2 className="h-4 w-4 animate-spin text-primary" />
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder="Escribe tu comando aquí... (ej: 'Añade un Senior Designer que gana 45k anuales')"
            disabled={processCommandMutation.isPending}
            className="flex-1"
          />
          <Button
            onClick={handleSend}
            disabled={!input.trim() || processCommandMutation.isPending}
          >
            {processCommandMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>

        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="text-xs">
            Todas las acciones requieren confirmación antes de ejecutarse. Revisa los datos antes de guardar.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
}
