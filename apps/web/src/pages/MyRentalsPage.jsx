import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Package, Calendar, Clock, CheckCircle, XCircle, MessageSquare, Star, History } from 'lucide-react';
import { motion } from 'framer-motion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';
import ReviewModal from '@/components/ReviewModal.jsx';
import { useAuth } from '@/contexts/AuthContext.jsx';
import pb from '@/lib/pocketbaseClient';
import { toast } from 'sonner';

export default function MyRentalsPage() {
  const { currentUser } = useAuth();
  const [rentals, setRentals] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [selectedRental, setSelectedRental] = useState(null);

  const fetchRentals = async () => {
    setLoading(true);
    try {
      const records = await pb.collection('rentals').getFullList({
        filter: `renter_id = "${currentUser.id}"`,
        expand: 'item_id, owner_id',
        sort: '-created',
        $autoCancel: false
      });
      setRentals(records);
    } catch (err) {
      toast.error('Erro ao carregar seus aluguéis');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRentals();
  }, [currentUser]);

  const activeStatuses = ['Pendente', 'Confirmado', 'Ativo'];
  const historicalStatuses = ['Concluído', 'Cancelado', 'Avaliado'];

  const activeRentals = rentals.filter(r => activeStatuses.includes(r.status));
  const historicalRentals = rentals.filter(r => historicalStatuses.includes(r.status));

  const handleCancel = async (id) => {
    try {
      await pb.collection('rentals').update(id, { status: 'Cancelado' }, { $autoCancel: false });
      toast.success('Solicitação cancelada.');
      fetchRentals();
    } catch (err) {
      toast.error('Erro ao cancelar.');
    }
  };

  const getStatusBadge = (status) => {
    switch(status) {
      case 'Pendente': return <Badge variant="outline" className="bg-amber-100 text-amber-800">Pendente</Badge>;
      case 'Confirmado': return <Badge variant="outline" className="bg-blue-100 text-blue-800">Confirmado</Badge>;
      case 'Ativo': return <Badge variant="outline" className="bg-emerald-100 text-emerald-800">Ativo</Badge>;
      case 'Concluído': return <Badge variant="outline" className="bg-gray-100 text-gray-800">Concluído</Badge>;
      case 'Cancelado': return <Badge variant="outline" className="bg-red-100 text-red-800">Cancelado</Badge>;
      case 'Avaliado': return <Badge variant="outline" className="bg-purple-100 text-purple-800">Avaliado</Badge>;
      default: return <Badge>{status}</Badge>;
    }
  };

  const renderRentalCard = (rental, isHistory = false) => {
    const item = rental.expand?.item_id;
    if (!item) return null;

    const imageUrl = item.photos && item.photos.length > 0 
      ? pb.files.getUrl(item, item.photos[0], { thumb: '200x200' })
      : 'https://images.unsplash.com/photo-1633882595256-a12866d2d8e5?w=200&h=200&fit=crop';

    return (
      <Card key={rental.id} className="overflow-hidden rounded-2xl mb-4 border-border/50 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex flex-col sm:flex-row">
          <div className="w-full sm:w-48 h-48 sm:h-auto bg-muted">
            <img src={imageUrl} alt={item.title} className="w-full h-full object-cover" />
          </div>
          <CardContent className="flex-1 p-6 flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-semibold text-lg">{item.title}</h3>
                {getStatusBadge(rental.status)}
              </div>
              <div className="flex items-center text-sm text-muted-foreground mb-4">
                <Calendar className="w-4 h-4 mr-2" />
                {format(new Date(rental.start_date), 'dd MMM', { locale: ptBR })} - {format(new Date(rental.end_date), 'dd MMM yyyy', { locale: ptBR })}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 mt-4">
              {!isHistory && rental.status === 'Pendente' && (
                <Button variant="outline" className="text-destructive border-destructive/30 hover:bg-destructive/10" onClick={() => handleCancel(rental.id)}>
                  <XCircle className="w-4 h-4 mr-2" /> Cancelar
                </Button>
              )}
              
              {!isHistory && (
                <Button variant="secondary" className="bg-secondary/50">
                  <MessageSquare className="w-4 h-4 mr-2" /> Mensagem
                </Button>
              )}

              {isHistory && rental.status === 'Concluído' && (
                <Button 
                  className="rounded-full shadow-eco" 
                  onClick={() => {
                    setSelectedRental(rental);
                    setReviewModalOpen(true);
                  }}
                >
                  <Star className="w-4 h-4 mr-2" /> Avaliar experiência
                </Button>
              )}
            </div>
          </CardContent>
        </div>
      </Card>
    );
  };

  return (
    <>
      <Helmet>
        <title>Meus Aluguéis - EcoRent</title>
      </Helmet>
      
      <div className="min-h-screen flex flex-col">
        <Header />

        <main className="flex-1 py-12 bg-background">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
            <h1 className="text-3xl md:text-4xl font-serif font-bold mb-8">Meus Aluguéis</h1>

            <Tabs defaultValue="active" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-8 h-14 rounded-full bg-secondary/50 p-1">
                <TabsTrigger value="active" className="rounded-full text-base data-[state=active]:bg-background data-[state=active]:shadow-sm">Em andamento</TabsTrigger>
                <TabsTrigger value="history" className="rounded-full text-base data-[state=active]:bg-background data-[state=active]:shadow-sm">Histórico</TabsTrigger>
              </TabsList>

              <TabsContent value="active" className="mt-0">
                {loading ? (
                  <div className="space-y-4">
                    {[1, 2].map(i => (
                      <div key={i} className="h-48 bg-muted animate-pulse rounded-2xl"></div>
                    ))}
                  </div>
                ) : activeRentals.length > 0 ? (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    {activeRentals.map(r => renderRentalCard(r, false))}
                  </motion.div>
                ) : (
                  <div className="text-center py-20 bg-card border border-dashed rounded-3xl">
                    <Clock className="w-12 h-12 text-muted-foreground/50 mx-auto mb-4" />
                    <h3 className="text-lg font-medium">Nenhum aluguel ativo</h3>
                    <p className="text-muted-foreground mt-2">Você não tem solicitações pendentes ou aluguéis em andamento.</p>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="history" className="mt-0">
                {loading ? (
                  <div className="space-y-4">
                    {[1, 2].map(i => (
                      <div key={i} className="h-48 bg-muted animate-pulse rounded-2xl"></div>
                    ))}
                  </div>
                ) : historicalRentals.length > 0 ? (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    {historicalRentals.map(r => renderRentalCard(r, true))}
                  </motion.div>
                ) : (
                  <div className="text-center py-20 bg-card border border-dashed rounded-3xl">
                    <History className="w-12 h-12 text-muted-foreground/50 mx-auto mb-4" />
                    <h3 className="text-lg font-medium">Histórico vazio</h3>
                    <p className="text-muted-foreground mt-2">Seus aluguéis passados aparecerão aqui.</p>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </main>
        <Footer />
      </div>

      {selectedRental && (
        <ReviewModal 
          isOpen={reviewModalOpen} 
          onClose={() => setReviewModalOpen(false)} 
          rental={selectedRental}
          onSuccess={fetchRentals}
        />
      )}
    </>
  );
}