import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Heart, MapPin } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext.jsx';
import pb from '@/lib/pocketbaseClient';
import { toast } from 'sonner';

export default function ItemCard({ item }) {
  const { currentUser, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [isFavorite, setIsFavorite] = useState(false);
  const [favoriteId, setFavoriteId] = useState(null);
  const [loadingFav, setLoadingFav] = useState(false);

  useEffect(() => {
    if (isAuthenticated && currentUser) {
      checkFavorite();
    }
  }, [isAuthenticated, currentUser, item.id]);

  const checkFavorite = async () => {
    try {
      const records = await pb.collection('favorites').getList(1, 1, {
        filter: `user_id="${currentUser.id}" && item_id="${item.id}"`,
        $autoCancel: false
      });
      if (records.items.length > 0) {
        setIsFavorite(true);
        setFavoriteId(records.items[0].id);
      }
    } catch (err) {
      // Ignore errors silently for checks
    }
  };

  const toggleFavorite = async (e) => {
    e.preventDefault(); // Prevent link click
    e.stopPropagation();

    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    if (loadingFav) return;
    setLoadingFav(true);

    try {
      if (isFavorite && favoriteId) {
        await pb.collection('favorites').delete(favoriteId, { $autoCancel: false });
        setIsFavorite(false);
        setFavoriteId(null);
        toast.success('Removido dos favoritos');
      } else {
        const record = await pb.collection('favorites').create({
          user_id: currentUser.id,
          item_id: item.id
        }, { $autoCancel: false });
        setIsFavorite(true);
        setFavoriteId(record.id);
        toast.success('Adicionado aos favoritos');
      }
    } catch (err) {
      toast.error('Erro ao atualizar favoritos');
    } finally {
      setLoadingFav(false);
    }
  };

  const imageUrl = item.photos && item.photos.length > 0 
    ? pb.files.getUrl(item, item.photos[0], { thumb: '400x400' })
    : 'https://images.unsplash.com/photo-1633882595256-a12866d2d8e5?w=400&h=400&fit=crop';

  return (
    <Link to={`/items/${item.id}`} className="block h-full group">
      <Card className="overflow-hidden border-border/50 bg-card hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 rounded-2xl h-full flex flex-col">
        <div className="relative aspect-[4/3] overflow-hidden bg-secondary/50">
          <img 
            src={imageUrl} 
            alt={item.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute top-3 left-3 flex flex-col gap-2">
            <span className="bg-background/90 backdrop-blur-sm text-xs font-semibold px-2.5 py-1 rounded-lg text-foreground shadow-sm">
              {item.category}
            </span>
          </div>
          <button 
            onClick={toggleFavorite}
            disabled={loadingFav}
            className="absolute top-3 right-3 w-8 h-8 rounded-full bg-background/90 backdrop-blur-sm flex items-center justify-center hover:bg-background transition-colors shadow-sm disabled:opacity-50"
            aria-label="Favoritar"
          >
            <Heart className={`w-4 h-4 transition-colors ${isFavorite ? 'fill-destructive text-destructive' : 'text-muted-foreground'}`} />
          </button>
        </div>
        
        <CardContent className="p-5 flex-1 flex flex-col">
          <div className="flex justify-between items-start gap-2 mb-2">
            <h3 className="font-semibold text-lg leading-tight line-clamp-2 text-foreground group-hover:text-primary transition-colors">
              {item.title}
            </h3>
          </div>
          
          <div className="mt-auto pt-4 flex items-center justify-between border-t border-border/50">
            <div>
              <p className="text-xl font-bold text-foreground">
                R$ {item.daily_price.toFixed(2)}
                <span className="text-sm font-normal text-muted-foreground ml-1">/dia</span>
              </p>
            </div>
            <div className="flex items-center text-xs text-muted-foreground bg-secondary px-2 py-1 rounded-md gap-1">
              <MapPin className="w-3 h-3" />
              <span>Curitiba</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}