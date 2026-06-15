import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import { Heart, Search } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';
import ItemCard from '@/components/ItemCard.jsx';
import { useAuth } from '@/contexts/AuthContext.jsx';
import pb from '@/lib/pocketbaseClient';
import { Link } from 'react-router-dom';

export default function FavoritesPage() {
  const { currentUser } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFavorites = async () => {
      if (!currentUser) return;
      setLoading(true);
      try {
        // Fetch favorites, we only have item_id as text, so we fetch those items manually
        const favs = await pb.collection('favorites').getFullList({
          filter: `user_id="${currentUser.id}"`,
          $autoCancel: false
        });

        if (favs.length === 0) {
          setItems([]);
          return;
        }

        const itemIds = favs.map(f => `id="${f.item_id}"`).join(' || ');
        const favoriteItems = await pb.collection('items').getFullList({
          filter: itemIds,
          $autoCancel: false
        });

        setItems(favoriteItems);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchFavorites();
  }, [currentUser]);

  return (
    <>
      <Helmet>
        <title>Meus Favoritos - EcoRent</title>
      </Helmet>
      
      <div className="min-h-screen flex flex-col bg-background">
        <Header />

        <main className="flex-1 py-12">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-12 h-12 rounded-2xl bg-destructive/10 text-destructive flex items-center justify-center">
                <Heart className="w-6 h-6 fill-current" />
              </div>
              <h1 className="text-3xl md:text-4xl font-serif font-bold">Meus Favoritos</h1>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-80 bg-muted animate-pulse rounded-2xl"></div>
                ))}
              </div>
            ) : items.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {items.map((item, i) => (
                  <motion.div key={item.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                    <ItemCard item={item} />
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-24 bg-card border border-dashed rounded-3xl max-w-2xl mx-auto">
                <Search className="w-16 h-16 text-muted-foreground/30 mx-auto mb-6" />
                <h3 className="text-2xl font-serif font-bold mb-2">Nada por aqui ainda</h3>
                <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                  Guarde os itens que você mais gostou clicando no coração. Eles ficarão salvos aqui para quando você precisar.
                </p>
                <Button asChild size="lg" className="rounded-full shadow-eco">
                  <Link to="/browse">Explorar itens</Link>
                </Button>
              </div>
            )}
          </div>
        </main>

        <Footer />
      </div>
    </>
  );
}