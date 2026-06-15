import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { ArrowLeft, MapPin, Calendar, ShieldCheck, Box, MessageSquare, Star, Truck, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';
import CategoryBadge from '@/components/CategoryBadge.jsx';
import ConditionBadge from '@/components/ConditionBadge.jsx';
import ItemCard from '@/components/ItemCard.jsx';
import RentalRequestModal from '@/components/RentalRequestModal.jsx';
import DeliveryWarningBanner from '@/components/DeliveryWarningBanner.jsx';
import pb from '@/lib/pocketbaseClient';
import { useAuth } from '@/contexts/AuthContext.jsx';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { toast } from 'sonner';

export default function ItemDetailPage() {
  const { id } = useParams();
  const { currentUser, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  
  const [item, setItem] = useState(null);
  const [owner, setOwner] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [relatedItems, setRelatedItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentSlide, setCurrentSlide] = useState(1);
  const [api, setApi] = useState(null);
  
  // Modals state
  const [isRentalModalOpen, setIsRentalModalOpen] = useState(false);

  useEffect(() => {
    const fetchAllData = async () => {
      setLoading(true);
      setError(null);
      try {
        // Fetch Item
        const itemData = await pb.collection('items').getOne(id, { $autoCancel: false });
        setItem(itemData);

        // Fetch Owner and Reviews and Related concurrently
        const [ownerData, reviewsData, relatedData] = await Promise.all([
          pb.collection('users').getOne(itemData.owner_id, { $autoCancel: false }),
          pb.collection('reviews').getList(1, 10, {
            filter: `rated_user_id = "${itemData.owner_id}"`, // Fetching reviews for owner/item ecosystem
            expand: 'rater_id',
            sort: '-created',
            $autoCancel: false
          }),
          pb.collection('items').getList(1, 3, {
            filter: `category = "${itemData.category}" && id != "${itemData.id}" && status = "Disponível"`,
            sort: '-created',
            $autoCancel: false
          })
        ]);

        setOwner(ownerData);
        setReviews(reviewsData.items);
        setRelatedItems(relatedData.items);

      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, [id]);

  useEffect(() => {
    if (!api) return;
    setCurrentSlide(api.selectedScrollSnap() + 1);
    api.on("select", () => {
      setCurrentSlide(api.selectedScrollSnap() + 1);
    });
  }, [api]);

  const handleStartChat = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    
    navigate('/chat');
    toast.info('Redirecionando para as mensagens...');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-12 flex justify-center items-center">
          <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
        </main>
      </div>
    );
  }

  if (error || !item) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-24 text-center">
          <h2 className="text-3xl font-serif font-bold mb-4">Item não encontrado</h2>
          <p className="text-muted-foreground mb-8">O item que você procura pode ter sido removido ou o link é inválido.</p>
          <Button asChild className="rounded-full"><Link to="/browse">Voltar para explorar</Link></Button>
        </main>
        <Footer />
      </div>
    );
  }

  const images = item.photos && item.photos.length > 0
    ? item.photos.map(photo => pb.files.getUrl(item, photo))
    : ['https://images.unsplash.com/photo-1633882595256-a12866d2d8e5?w=800&h=800&fit=crop'];

  const ownerAvatar = owner?.avatar ? pb.files.getUrl(owner, owner.avatar, { thumb: '100x100' }) : null;
  const avgRating = reviews.length > 0 
    ? (reviews.reduce((acc, curr) => acc + curr.rating, 0) / reviews.length).toFixed(1) 
    : 'Novo';

  return (
    <>
      <Helmet>
        <title>{`${item.title} - EcoRent`}</title>
        <meta name="description" content={item.description} />
      </Helmet>

      <div className="min-h-screen flex flex-col bg-background">
        <Header />

        <main className="flex-1 py-8 md:py-12">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <Button variant="ghost" asChild className="mb-6 -ml-4 hover:bg-transparent hover:text-primary">
              <Link to="/browse">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Explorar
              </Link>
            </Button>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
              
              {/* Left Column - Gallery & Description */}
              <div className="lg:col-span-7 space-y-8">
                <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.4 }}>
                  <div className="relative group rounded-3xl overflow-hidden bg-card border shadow-sm">
                    <Carousel setApi={setApi} className="w-full">
                      <CarouselContent>
                        {images.map((image, index) => (
                          <CarouselItem key={index}>
                            <div className="aspect-[4/3] sm:aspect-[16/10] bg-secondary/30 flex items-center justify-center overflow-hidden">
                              <img src={image} alt={`${item.title} - ${index + 1}`} className="w-full h-full object-cover" />
                            </div>
                          </CarouselItem>
                        ))}
                      </CarouselContent>
                      {images.length > 1 && (
                        <>
                          <div className="absolute top-4 right-4 bg-black/50 backdrop-blur-md text-white text-xs font-medium px-3 py-1.5 rounded-full z-10">
                            {currentSlide} / {images.length}
                          </div>
                          <CarouselPrevious className="left-4 opacity-0 group-hover:opacity-100 transition-opacity bg-background/80 hover:bg-background border-none" />
                          <CarouselNext className="right-4 opacity-0 group-hover:opacity-100 transition-opacity bg-background/80 hover:bg-background border-none" />
                        </>
                      )}
                    </Carousel>
                  </div>
                </motion.div>

                <div className="space-y-6">
                  <div>
                    <div className="flex flex-wrap gap-2 mb-4">
                      <CategoryBadge category={item.category} />
                      <ConditionBadge condition={item.condition} />
                    </div>
                    <h1 className="text-3xl md:text-4xl font-serif font-bold leading-tight mb-2">
                      {item.title}
                    </h1>
                    {item.address && (
                      <div className="flex items-center text-muted-foreground text-sm">
                        <MapPin className="w-4 h-4 mr-1 text-primary" />
                        {item.address}
                      </div>
                    )}
                  </div>

                  {/* Value Badges */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 py-6 border-y border-border/60">
                    <div className="flex flex-col items-center text-center p-3 rounded-2xl bg-secondary/40">
                      <Box className="w-6 h-6 text-primary mb-2" />
                      <span className="text-xs font-medium">Retirada Local</span>
                    </div>
                    <div className="flex flex-col items-center text-center p-3 rounded-2xl bg-secondary/40">
                      <ShieldCheck className="w-6 h-6 text-primary mb-2" />
                      <span className="text-xs font-medium">Seguro Disponível</span>
                    </div>
                    <div className="flex flex-col items-center text-center p-3 rounded-2xl bg-secondary/40">
                      <Truck className="w-6 h-6 text-primary mb-2" />
                      <span className="text-xs font-medium">Entrega a combinar</span>
                    </div>
                    <div className="flex flex-col items-center text-center p-3 rounded-2xl bg-secondary/40">
                      <CheckCircle2 className="w-6 h-6 text-primary mb-2" />
                      <span className="text-xs font-medium">Usuário Verificado</span>
                    </div>
                  </div>

                  <div>
                    <h2 className="text-xl font-semibold mb-3">Sobre o item</h2>
                    <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                      {item.description}
                    </p>
                  </div>
                </div>
              </div>

              {/* Right Column - Action Card & Owner */}
              <div className="lg:col-span-5 space-y-6">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.1 }} className="sticky top-24">
                  <Card className="rounded-[2rem] border-primary/10 shadow-eco overflow-hidden">
                    <CardContent className="p-8">
                      <div className="flex items-end justify-between mb-8">
                        <div>
                          <p className="text-sm font-medium text-muted-foreground mb-1 uppercase tracking-wider">Diária</p>
                          <p className="text-4xl font-bold text-foreground">R$ {item.daily_price.toFixed(2)}</p>
                        </div>
                        <div className={`px-3 py-1 rounded-full text-xs font-medium ${item.status === 'Disponível' ? 'bg-emerald-100 text-emerald-800' : 'bg-muted text-muted-foreground'}`}>
                          {item.status}
                        </div>
                      </div>

                      <div className="space-y-4 mb-8">
                        <DeliveryWarningBanner />
                        
                        <Button 
                          className="w-full h-14 rounded-full text-lg shadow-lg hover:shadow-primary/20 hover:-translate-y-0.5 transition-all" 
                          disabled={item.status !== 'Disponível'}
                          onClick={() => {
                            if (!isAuthenticated) navigate('/login');
                            else setIsRentalModalOpen(true);
                          }}
                        >
                          {item.status === 'Disponível' ? 'Alugar agora' : 'Indisponível no momento'}
                        </Button>
                        <Button variant="outline" className="w-full h-14 rounded-full border-border hover:bg-secondary transition-colors" onClick={handleStartChat}>
                          <MessageSquare className="w-5 h-5 mr-2" />
                          Conversar com anunciante
                        </Button>
                      </div>

                      <div className="pt-6 border-t border-border">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="font-semibold">Anunciante</h3>
                          <div className="flex items-center text-sm font-medium">
                            <Star className="w-4 h-4 fill-amber-400 text-amber-400 mr-1" />
                            {avgRating} <span className="text-muted-foreground ml-1 font-normal">({reviews.length})</span>
                          </div>
                        </div>
                        
                        {owner && (
                          <div className="flex items-center gap-4">
                            <Avatar className="w-14 h-14 border border-border">
                              {ownerAvatar && <AvatarImage src={ownerAvatar} alt={owner.name} className="object-cover" />}
                              <AvatarFallback className="bg-secondary text-secondary-foreground">
                                {owner.name?.charAt(0).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-semibold text-base">{owner.name}</p>
                              <p className="text-sm text-muted-foreground flex items-center">
                                <Calendar className="w-3 h-3 mr-1" />
                                No EcoRent desde {format(new Date(owner.created), 'MMM/yy', { locale: ptBR })}
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              </div>

            </div>

            {/* Reviews Section */}
            {reviews.length > 0 && (
              <section className="py-16 mt-12 border-t border-border">
                <h2 className="text-2xl font-serif font-bold mb-8 flex items-center">
                  <Star className="w-6 h-6 fill-amber-400 text-amber-400 mr-3" />
                  Avaliações do Anunciante
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {reviews.map(review => (
                    <div key={review.id} className="bg-card p-6 rounded-3xl border border-border/50">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <Avatar className="w-10 h-10">
                            <AvatarFallback>{review.expand?.rater_id?.name?.charAt(0) || 'U'}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium text-sm">{review.expand?.rater_id?.name || 'Usuário'}</p>
                            <p className="text-xs text-muted-foreground">
                              {format(new Date(review.created), 'dd \'de\' MMM, yyyy', { locale: ptBR })}
                            </p>
                          </div>
                        </div>
                        <div className="flex text-amber-400">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className={`w-4 h-4 ${i < review.rating ? 'fill-current' : 'text-muted/30'}`} />
                          ))}
                        </div>
                      </div>
                      {review.comment && (
                        <p className="text-foreground/80 text-sm leading-relaxed">{review.comment}</p>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Related Items */}
            {relatedItems.length > 0 && (
              <section className="py-16 border-t border-border">
                <h2 className="text-2xl font-serif font-bold mb-8">Itens similares</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {relatedItems.map(relItem => (
                    <ItemCard key={relItem.id} item={relItem} />
                  ))}
                </div>
              </section>
            )}

          </div>
        </main>

        <Footer />
      </div>

      {isRentalModalOpen && (
        <RentalRequestModal 
          item={item} 
          isOpen={isRentalModalOpen} 
          onClose={() => setIsRentalModalOpen(false)} 
        />
      )}
    </>
  );
}