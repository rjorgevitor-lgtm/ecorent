import React, { useState, useEffect } from 'react';
import { format, differenceInDays, addDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Shield, CalendarPlus as CalendarIcon, Info } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { useAuth } from '@/contexts/AuthContext.jsx';
import pb from '@/lib/pocketbaseClient';
import { toast } from 'sonner';

export default function RentalRequestModal({ item, isOpen, onClose }) {
  const { currentUser } = useAuth();
  
  const todayStr = format(new Date(), 'yyyy-MM-dd');
  const [startDate, setStartDate] = useState(todayStr);
  const [endDate, setEndDate] = useState(format(addDays(new Date(), 3), 'yyyy-MM-dd'));
  const [insurance, setInsurance] = useState(true);
  const [loading, setLoading] = useState(false);

  const days = Math.max(1, differenceInDays(new Date(endDate), new Date(startDate)));
  const basePrice = days * item.daily_price;
  const insurancePrice = insurance ? basePrice * 0.15 : 0; // 15% insurance fee
  const totalPrice = basePrice + insurancePrice;

  // Sync end date if start date moves past it
  useEffect(() => {
    if (new Date(startDate) > new Date(endDate)) {
      setEndDate(format(addDays(new Date(startDate), 1), 'yyyy-MM-dd'));
    }
  }, [startDate, endDate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (new Date(startDate) < new Date(todayStr)) {
      toast.error('Data inicial não pode ser no passado.');
      return;
    }

    setLoading(true);

    try {
      // 1. Create Rental Record
      await pb.collection('rentals').create({
        item_id: item.id,
        renter_id: currentUser.id,
        owner_id: item.owner_id,
        start_date: new Date(startDate).toISOString(),
        end_date: new Date(endDate).toISOString(),
        status: 'Pendente'
      }, { $autoCancel: false });

      // 2. Auto-create Chat Conversation
      const initialMessage = `Olá! Acabei de enviar uma solicitação de aluguel para "${item.title}" do dia ${format(new Date(startDate), 'dd/MM/yyyy')} até ${format(new Date(endDate), 'dd/MM/yyyy')}. O valor total estimado é de R$ ${totalPrice.toFixed(2)}. Aguardo sua confirmação!`;
      
      await pb.collection('messages').create({
        sender_id: currentUser.id,
        receiver_id: item.owner_id,
        content: initialMessage
      }, { $autoCancel: false });

      toast.success('Solicitação enviada com sucesso! O proprietário foi notificado.');
      onClose();
    } catch (err) {
      console.error(err);
      toast.error('Ocorreu um erro ao processar sua solicitação.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-serif">Solicitar Aluguel</DialogTitle>
          <DialogDescription>
            Escolha as datas para alugar <span className="font-semibold text-foreground">{item.title}</span>.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="start_date">Data de Retirada</Label>
              <div className="relative">
                <Input 
                  type="date" 
                  id="start_date" 
                  min={todayStr}
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  required
                  className="pl-10"
                />
                <CalendarIcon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="end_date">Data de Devolução</Label>
              <div className="relative">
                <Input 
                  type="date" 
                  id="end_date" 
                  min={startDate}
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  required
                  className="pl-10"
                />
                <CalendarIcon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              </div>
            </div>
          </div>

          <div className="bg-secondary/50 p-4 rounded-xl space-y-4">
            <div className="flex items-start space-x-3">
              <Checkbox 
                id="insurance" 
                checked={insurance} 
                onCheckedChange={setInsurance} 
                className="mt-1"
              />
              <div className="grid gap-1.5 leading-none">
                <label
                  htmlFor="insurance"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex items-center gap-1"
                >
                  Seguro EcoRent Protege <Shield className="w-3.5 h-3.5 text-primary" />
                </label>
                <p className="text-xs text-muted-foreground">
                  Cobre danos acidentais durante o período do aluguel. (15% do valor)
                </p>
              </div>
            </div>
          </div>

          <div className="border-t border-border pt-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">R$ {item.daily_price.toFixed(2)} x {days} {days === 1 ? 'dia' : 'dias'}</span>
              <span>R$ {basePrice.toFixed(2)}</span>
            </div>
            {insurance && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground flex items-center gap-1">
                  Taxa de seguro <Info className="w-3 h-3" />
                </span>
                <span>R$ {insurancePrice.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between text-lg font-bold pt-2 border-t border-border/50">
              <span>Total estimado</span>
              <span className="text-primary">R$ {totalPrice.toFixed(2)}</span>
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button type="button" variant="outline" onClick={onClose} className="rounded-full">
              Cancelar
            </Button>
            <Button type="submit" disabled={loading} className="rounded-full">
              {loading ? 'Processando...' : 'Confirmar Aluguel'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}