import React from 'react';
import { Ear, Keyboard, Eye, MonitorSpeaker } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';

export default function AccessibilityModal({ isOpen, onClose }) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[460px] rounded-3xl">
        <DialogHeader>
          <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-2">
            <Ear className="w-8 h-8 text-primary" />
          </div>
          <DialogTitle className="text-center text-2xl font-serif">
            Acessibilidade
          </DialogTitle>
          <DialogDescription className="text-center mt-3 text-base">
            Nossa plataforma foi projetada para ser acessível a todos, suportando recursos nativos do seu dispositivo de forma inteligente e integrada.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="flex items-start gap-4 p-4 bg-secondary/50 rounded-2xl">
            <div className="p-2 bg-background rounded-xl shadow-sm mt-1">
              <MonitorSpeaker className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h4 className="font-semibold text-foreground">Leitores de Tela</h4>
              <p className="text-sm text-muted-foreground mt-1">Totalmente compatível com VoiceOver, NVDA e outros leitores de tela populares através de atributos estruturais nativos.</p>
            </div>
          </div>

          <div className="flex items-start gap-4 p-4 bg-secondary/50 rounded-2xl">
            <div className="p-2 bg-background rounded-xl shadow-sm mt-1">
              <Keyboard className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h4 className="font-semibold text-foreground">Navegação por Teclado</h4>
              <p className="text-sm text-muted-foreground mt-1">Navegue por toda a plataforma usando apenas o teclado. Utilize a tecla Tab para focar em elementos interativos com segurança.</p>
            </div>
          </div>
          
          <div className="flex items-start gap-4 p-4 bg-secondary/50 rounded-2xl">
            <div className="p-2 bg-background rounded-xl shadow-sm mt-1">
              <Eye className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h4 className="font-semibold text-foreground">Contraste e Zoom</h4>
              <p className="text-sm text-muted-foreground mt-1">A interface se adapta às configurações de zoom do seu navegador e suporta modos de alto contraste do seu sistema operacional.</p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}