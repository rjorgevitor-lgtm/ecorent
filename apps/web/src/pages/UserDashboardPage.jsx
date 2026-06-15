import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { Package, Plus, User, TrendingUp, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';
import { useAuth } from '@/contexts/AuthContext.jsx';
import pb from '@/lib/pocketbaseClient';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function UserDashboardPage() {
  const { currentUser } = useAuth();
  const [stats, setStats] = useState({
    totalListings: 0,
    availableListings: 0,
    rentedListings: 0
  });
  const [recentItems, setRecentItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!currentUser) return;

      try {
        const allItems = await pb.collection('items').getFullList({
          filter: `owner_id = "${currentUser.id}"`,
          sort: '-created',
          $autoCancel: false
        });

        setStats({
          totalListings: allItems.length,
          availableListings: allItems.filter(item => item.status === 'Disponível').length,
          rentedListings: allItems.filter(item => item.status === 'Alugado').length
        });

        setRecentItems(allItems.slice(0, 5));
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [currentUser]);

  const avatarUrl = currentUser?.avatar 
    ? pb.files.getUrl(currentUser, currentUser.avatar, { thumb: '100x100' })
    : null;

  return (
    <>
      <Helmet>
        <title>Dashboard - EcoRent</title>
        <meta name="description" content="Gerencie seus anúncios e acompanhe suas atividades no EcoRent." />
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
                    Dashboard
                  </h1>
                  <p className="text-lg text-muted-foreground">
                    Bem-vindo de volta, {currentUser?.name}
                  </p>
                </div>
                <Button asChild size="lg">
                  <Link to="/create-listing">
                    <Plus className="w-5 h-5 mr-2" />
                    Novo anúncio
                  </Link>
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Total de anúncios
                    </CardTitle>
                    <Package className="w-4 h-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">{stats.totalListings}</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Disponíveis
                    </CardTitle>
                    <TrendingUp className="w-4 h-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-primary">{stats.availableListings}</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Alugados
                    </CardTitle>
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-emerald-600">{stats.rentedListings}</div>
                  </CardContent>
                </Card>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle>Anúncios recentes</CardTitle>
                        <Button variant="ghost" asChild>
                          <Link to="/my-listings">Ver todos</Link>
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {loading ? (
                        <div className="space-y-4">
                          {[...Array(3)].map((_, i) => (
                            <div key={i} className="flex items-center gap-4 p-4 border rounded-lg">
                              <div className="w-20 h-20 bg-muted animate-pulse rounded-lg"></div>
                              <div className="flex-1 space-y-2">
                                <div className="h-5 bg-muted animate-pulse rounded w-3/4"></div>
                                <div className="h-4 bg-muted animate-pulse rounded w-1/2"></div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : recentItems.length > 0 ? (
                        <div className="space-y-4">
                          {recentItems.map(item => {
                            const imageUrl = item.photos && item.photos.length > 0
                              ? pb.files.getUrl(item, item.photos[0], { thumb: '100x100' })
                              : 'https://images.unsplash.com/photo-1633882595256-a12866d2d8e5?w=100&h=100&fit=crop';

                            return (
                              <Link
                                key={item.id}
                                to={`/items/${item.id}`}
                                className="flex items-center gap-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                              >
                                <img 
                                  src={imageUrl} 
                                  alt={item.title}
                                  className="w-20 h-20 object-cover rounded-lg"
                                />
                                <div className="flex-1">
                                  <h3 className="font-semibold mb-1">{item.title}</h3>
                                  <p className="text-sm text-muted-foreground">
                                    R$ {item.daily_price.toFixed(2)}/dia • {item.status}
                                  </p>
                                </div>
                                <div className="text-sm text-muted-foreground">
                                  {format(new Date(item.created), 'dd/MM/yyyy', { locale: ptBR })}
                                </div>
                              </Link>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="text-center py-12">
                          <Package className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                          <p className="text-muted-foreground mb-4">Você ainda não tem anúncios</p>
                          <Button asChild>
                            <Link to="/create-listing">Criar primeiro anúncio</Link>
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>

                <div className="lg:col-span-1">
                  <Card>
                    <CardHeader>
                      <CardTitle>Perfil</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center gap-4">
                        <Avatar className="w-16 h-16">
                          {avatarUrl && <AvatarImage src={avatarUrl} alt={currentUser?.name} />}
                          <AvatarFallback className="bg-primary text-primary-foreground text-xl">
                            {currentUser?.name?.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-semibold">{currentUser?.name}</p>
                          <p className="text-sm text-muted-foreground">{currentUser?.email}</p>
                        </div>
                      </div>
                      {currentUser?.bio && (
                        <p className="text-sm text-muted-foreground">{currentUser.bio}</p>
                      )}
                      <Button variant="outline" className="w-full" asChild>
                        <Link to="/profile">
                          <User className="w-4 h-4 mr-2" />
                          Editar perfil
                        </Link>
                      </Button>
                    </CardContent>
                  </Card>

                  <Card className="mt-6">
                    <CardHeader>
                      <CardTitle>Links rápidos</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <Button variant="ghost" className="w-full justify-start" asChild>
                        <Link to="/my-listings">
                          <Package className="w-4 h-4 mr-2" />
                          Meus anúncios
                        </Link>
                      </Button>
                      <Button variant="ghost" className="w-full justify-start" asChild>
                        <Link to="/create-listing">
                          <Plus className="w-4 h-4 mr-2" />
                          Novo anúncio
                        </Link>
                      </Button>
                      <Button variant="ghost" className="w-full justify-start" asChild>
                        <Link to="/browse">
                          <Package className="w-4 h-4 mr-2" />
                          Explorar itens
                        </Link>
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </motion.div>
          </div>
        </main>

        <Footer />
      </div>
    </>
  );
}