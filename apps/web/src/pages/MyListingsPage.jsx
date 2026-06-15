import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { Plus, Edit, Trash2, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';
import CategoryBadge from '@/components/CategoryBadge.jsx';
import ConditionBadge from '@/components/ConditionBadge.jsx';
import { useAuth } from '@/contexts/AuthContext.jsx';
import pb from '@/lib/pocketbaseClient';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function MyListingsPage() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);

  useEffect(() => {
    fetchItems();
  }, [currentUser]);

  const fetchItems = async () => {
    if (!currentUser) return;

    try {
      const result = await pb.collection('items').getFullList({
        filter: `owner_id = "${currentUser.id}"`,
        sort: '-created',
        $autoCancel: false
      });
      setItems(result);
    } catch (error) {
      console.error('Error fetching items:', error);
      toast.error('Erro ao carregar anúncios');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!itemToDelete) return;

    try {
      await pb.collection('items').delete(itemToDelete.id, { $autoCancel: false });
      setItems(items.filter(item => item.id !== itemToDelete.id));
      toast.success('Anúncio excluído com sucesso');
    } catch (error) {
      console.error('Error deleting item:', error);
      toast.error('Erro ao excluir anúncio');
    } finally {
      setDeleteDialogOpen(false);
      setItemToDelete(null);
    }
  };

  const openDeleteDialog = (item) => {
    setItemToDelete(item);
    setDeleteDialogOpen(true);
  };

  return (
    <>
      <Helmet>
        <title>Meus anúncios - EcoRent</title>
        <meta name="description" content="Gerencie todos os seus anúncios de itens para aluguel." />
      </Helmet>

      <div className="min-h-screen flex flex-col">
        <Header />

        <main className="flex-1 py-12">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h1 className="text-4xl md:text-5xl font-bold mb-2" style={{ letterSpacing: '-0.02em' }}>
                    Meus anúncios
                  </h1>
                  <p className="text-lg text-muted-foreground">
                    {items.length} {items.length === 1 ? 'anúncio' : 'anúncios'}
                  </p>
                </div>
                <Button asChild size="lg">
                  <Link to="/create-listing">
                    <Plus className="w-5 h-5 mr-2" />
                    Novo anúncio
                  </Link>
                </Button>
              </div>

              {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[...Array(6)].map((_, i) => (
                    <Card key={i} className="overflow-hidden">
                      <div className="aspect-square bg-muted animate-pulse"></div>
                      <CardContent className="p-4 space-y-3">
                        <div className="h-6 bg-muted animate-pulse rounded"></div>
                        <div className="h-4 bg-muted animate-pulse rounded w-3/4"></div>
                        <div className="h-8 bg-muted animate-pulse rounded w-1/2"></div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : items.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {items.map((item, index) => {
                    const imageUrl = item.photos && item.photos.length > 0
                      ? pb.files.getUrl(item, item.photos[0], { thumb: '300x300' })
                      : 'https://images.unsplash.com/photo-1633882595256-a12866d2d8e5?w=300&h=300&fit=crop';

                    return (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.05 }}
                      >
                        <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-300 h-full flex flex-col">
                          <div className="aspect-square overflow-hidden bg-muted">
                            <img 
                              src={imageUrl} 
                              alt={item.title}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <CardContent className="p-4 flex-1 flex flex-col">
                            <div className="flex-1">
                              <h3 className="font-semibold text-lg mb-2 line-clamp-2">{item.title}</h3>
                              <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{item.description}</p>
                              <div className="flex flex-wrap gap-2 mb-3">
                                <CategoryBadge category={item.category} />
                                <ConditionBadge condition={item.condition} />
                              </div>
                              <div className="flex items-center justify-between mb-3">
                                <div>
                                  <p className="text-2xl font-bold text-primary">R$ {item.daily_price.toFixed(2)}</p>
                                  <p className="text-xs text-muted-foreground">por dia</p>
                                </div>
                                <div className="text-right">
                                  <p className="text-sm font-medium">{item.status}</p>
                                  <p className="text-xs text-muted-foreground">
                                    {format(new Date(item.created), 'dd/MM/yyyy', { locale: ptBR })}
                                  </p>
                                </div>
                              </div>
                            </div>
                            <div className="flex gap-2 mt-auto">
                              <Button 
                                variant="outline" 
                                className="flex-1"
                                onClick={() => navigate(`/edit-listing/${item.id}`)}
                              >
                                <Edit className="w-4 h-4 mr-2" />
                                Editar
                              </Button>
                              <Button 
                                variant="outline" 
                                className="flex-1 text-destructive hover:bg-destructive hover:text-destructive-foreground"
                                onClick={() => openDeleteDialog(item)}
                              >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Excluir
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Package className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">Nenhum anúncio ainda</h3>
                  <p className="text-muted-foreground mb-6">
                    Comece criando seu primeiro anúncio
                  </p>
                  <Button asChild>
                    <Link to="/create-listing">
                      <Plus className="w-4 h-4 mr-2" />
                      Criar anúncio
                    </Link>
                  </Button>
                </div>
              )}
            </motion.div>
          </div>
        </main>

        <Footer />
      </div>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o anúncio "{itemToDelete?.title}"? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}