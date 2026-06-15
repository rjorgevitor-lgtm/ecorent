import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { CreditCard, Plus, Trash2, CheckCircle2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';

// Mock data for demonstration
const initialMethods = [
  { id: '1', type: 'Visa', last4: '4242', expiry: '12/25', name: 'João Silva', isDefault: true },
  { id: '2', type: 'Mastercard', last4: '5555', expiry: '08/26', name: 'João Silva', isDefault: false }
];

export default function PaymentMethodsPage() {
  const [methods, setMethods] = useState(initialMethods);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [newCard, setNewCard] = useState({
    number: '',
    name: '',
    expiry: '',
    cvv: ''
  });

  const handleSetDefault = (id) => {
    setMethods(methods.map(m => ({
      ...m,
      isDefault: m.id === id
    })));
    toast.success('Método de pagamento padrão atualizado.');
  };

  const handleDelete = (id) => {
    const methodToDelete = methods.find(m => m.id === id);
    if (methodToDelete.isDefault && methods.length > 1) {
      toast.error('Não é possível excluir o método padrão. Defina outro como padrão primeiro.');
      return;
    }
    setMethods(methods.filter(m => m.id !== id));
    toast.success('Cartão removido com sucesso.');
  };

  const handleAddCard = (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      const newMethod = {
        id: Date.now().toString(),
        type: newCard.number.startsWith('4') ? 'Visa' : 'Mastercard',
        last4: newCard.number.slice(-4) || '0000',
        expiry: newCard.expiry,
        name: newCard.name,
        isDefault: methods.length === 0
      };
      
      setMethods([...methods, newMethod]);
      setIsSubmitting(false);
      setIsAddModalOpen(false);
      setNewCard({ number: '', name: '', expiry: '', cvv: '' });
      toast.success('Novo cartão adicionado com sucesso!');
    }, 1000);
  };

  return (
    <>
      <Helmet>
        <title>Métodos de Pagamento - EcoRent</title>
      </Helmet>

      <div className="min-h-screen flex flex-col bg-muted/30">
        <Header />

        <main className="flex-1 py-12">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
              <div>
                <h1 className="text-3xl font-bold font-serif">Métodos de Pagamento</h1>
                <p className="text-muted-foreground mt-1">Gerencie seus cartões para aluguéis rápidos e seguros.</p>
              </div>
              <Button onClick={() => setIsAddModalOpen(true)} className="rounded-xl shadow-sm">
                <Plus className="w-4 h-4 mr-2" />
                Adicionar Cartão
              </Button>
            </div>

            <div className="grid grid-cols-1 gap-6">
              {methods.length === 0 ? (
                <Card className="border-dashed border-2 bg-transparent">
                  <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                    <CreditCard className="w-12 h-12 text-muted-foreground mb-4 opacity-50" />
                    <h3 className="text-lg font-semibold mb-2">Nenhum cartão salvo</h3>
                    <p className="text-muted-foreground mb-6 max-w-sm">
                      Adicione um método de pagamento para facilitar suas futuras locações na plataforma.
                    </p>
                    <Button variant="outline" onClick={() => setIsAddModalOpen(true)} className="rounded-xl">
                      Adicionar agora
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                methods.map((method) => (
                  <Card key={method.id} className={`rounded-2xl overflow-hidden transition-all ${method.isDefault ? 'border-primary/50 shadow-md ring-1 ring-primary/20' : 'border-border/50 shadow-sm'}`}>
                    <CardContent className="p-6">
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                        <div className="flex items-center gap-4">
                          <div className={`w-16 h-12 rounded-lg flex items-center justify-center ${method.type === 'Visa' ? 'bg-blue-50 text-blue-600' : 'bg-orange-50 text-orange-600'}`}>
                            <CreditCard className="w-6 h-6" />
                          </div>
                          <div>
                            <div className="flex items-center gap-3 mb-1">
                              <h3 className="font-semibold text-lg">{method.type} final {method.last4}</h3>
                              {method.isDefault && (
                                <Badge variant="secondary" className="bg-primary/10 text-primary hover:bg-primary/20 border-none">
                                  Padrão
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground">
                              Vence em {method.expiry} • {method.name}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 w-full sm:w-auto">
                          {!method.isDefault && (
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="rounded-xl flex-1 sm:flex-none"
                              onClick={() => handleSetDefault(method.id)}
                            >
                              <CheckCircle2 className="w-4 h-4 mr-2 text-muted-foreground" />
                              Tornar padrão
                            </Button>
                          )}
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="text-destructive hover:bg-destructive/10 hover:text-destructive rounded-xl"
                            onClick={() => handleDelete(method.id)}
                            aria-label="Excluir cartão"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>

            <div className="mt-8 p-4 bg-secondary/50 rounded-2xl flex items-start gap-3 text-sm text-secondary-foreground/80">
              <AlertCircle className="w-5 h-5 text-primary shrink-0 mt-0.5" />
              <p>
                Seus dados de pagamento são processados de forma segura por nossos parceiros financeiros. 
                A EcoRent não armazena o número completo do seu cartão de crédito em nossos servidores.
              </p>
            </div>
          </div>
        </main>

        <Footer />
      </div>

      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent className="sm:max-w-[425px] rounded-2xl">
          <DialogHeader>
            <DialogTitle>Adicionar Cartão</DialogTitle>
            <DialogDescription>
              Insira os dados do seu cartão de crédito.
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleAddCard} className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="cardNumber">Número do Cartão</Label>
              <Input 
                id="cardNumber" 
                placeholder="0000 0000 0000 0000" 
                value={newCard.number}
                onChange={(e) => setNewCard({...newCard, number: e.target.value})}
                required
                maxLength={19}
                className="rounded-xl"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="cardName">Nome no Cartão</Label>
              <Input 
                id="cardName" 
                placeholder="Como impresso no cartão" 
                value={newCard.name}
                onChange={(e) => setNewCard({...newCard, name: e.target.value})}
                required
                className="rounded-xl"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="expiry">Validade</Label>
                <Input 
                  id="expiry" 
                  placeholder="MM/AA" 
                  value={newCard.expiry}
                  onChange={(e) => setNewCard({...newCard, expiry: e.target.value})}
                  required
                  maxLength={5}
                  className="rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cvv">CVV</Label>
                <Input 
                  id="cvv" 
                  placeholder="123" 
                  type="password"
                  value={newCard.cvv}
                  onChange={(e) => setNewCard({...newCard, cvv: e.target.value})}
                  required
                  maxLength={4}
                  className="rounded-xl"
                />
              </div>
            </div>

            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={() => setIsAddModalOpen(false)} className="rounded-xl">
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting} className="rounded-xl">
                {isSubmitting ? 'Salvando...' : 'Salvar Cartão'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}