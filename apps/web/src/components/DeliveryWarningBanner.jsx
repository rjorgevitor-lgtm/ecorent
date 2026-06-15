import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function DeliveryWarningBanner({ className }) {
  return (
    <div className={cn("bg-[hsl(var(--warning)/0.15)] border border-[hsl(var(--warning)/0.3)] rounded-xl p-4 flex items-start gap-3", className)}>
      <AlertTriangle className="w-5 h-5 text-[hsl(var(--warning))] shrink-0 mt-0.5" />
      <div className="text-sm text-[hsl(var(--warning-foreground))]">
        <strong className="font-semibold block mb-1">⚠️ AVISO IMPORTANTE:</strong>
        O locador é responsável pela entrega segura do item. Danos, furtos ou extravios durante a entrega são de responsabilidade do locador. Recomendamos combinar os detalhes de entrega pelo chat antes de confirmar a reserva.
      </div>
    </div>
  );
}