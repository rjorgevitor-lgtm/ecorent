import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import pb from '@/lib/pocketbaseClient';

export default function HeroCarousel() {
  const [items, setItems] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const result = await pb.collection('items').getList(1, 5, {
          filter: 'status = "Disponível" && photos ~ ".jpg" || photos ~ ".png"',
          sort: '-created',
          $autoCancel: false
        });
        
        if (result.items.length > 0) {
          setItems(result.items);
        }
      } catch (error) {
        console.error('Error fetching carousel items:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFeatured();
  }, []);

  useEffect(() => {
    if (items.length <= 1) return;
    
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % items.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [items.length]);

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + items.length) % items.length);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % items.length);
  };

  if (loading) {
    return (
      <div className="w-full h-[70vh] md:h-[80vh] min-h-[500px] bg-secondary animate-pulse rounded-3xl mx-auto container mt-6"></div>
    );
  }

  // Fallback if no items with photos exist
  const displayItems = items.length > 0 ? items : [{
    id: 'fallback',
    title: 'Compartilhe o que você tem',
    description: 'Encontre milhares de itens na sua região.',
    photos: [],
    fallbackImage: 'https://images.unsplash.com/photo-1633882595256-a12866d2d8e5?q=80&w=2070&auto=format&fit=crop'
  }];

  return (
    <div className="relative w-full h-[70vh] md:h-[80vh] min-h-[500px] max-h-[800px] overflow-hidden container mx-auto px-4 sm:px-6 lg:px-8 mt-6">
      <div className="relative w-full h-full rounded-3xl overflow-hidden group shadow-eco">
        <AnimatePresence initial={false} mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
            className="absolute inset-0"
          >
            <img
              src={
                displayItems[currentIndex].photos?.length > 0 
                  ? pb.files.getUrl(displayItems[currentIndex], displayItems[currentIndex].photos[0]) 
                  : displayItems[currentIndex].fallbackImage
              }
              alt={displayItems[currentIndex].title}
              className="w-full h-full object-cover"
            />
            {/* Deep overlay for typography contrast */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/20" />
            
            <div className="absolute inset-0 flex flex-col justify-end p-8 md:p-16 lg:p-24">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.5 }}
                className="max-w-3xl"
              >
                <div className="inline-block bg-primary/20 backdrop-blur-md border border-primary/30 text-primary-foreground px-4 py-1.5 rounded-full text-sm font-semibold tracking-wide mb-6">
                  Destaque da comunidade
                </div>
                <h2 className="text-4xl md:text-5xl lg:text-7xl font-bold text-white mb-4 leading-tight font-serif tracking-tight">
                  O futuro não é possuir,<br/>é <span className="text-primary">compartilhar</span>.
                </h2>
                <p className="text-lg md:text-xl text-white/80 mb-8 max-w-2xl line-clamp-2">
                  {displayItems[currentIndex].title} • R$ {displayItems[currentIndex].daily_price?.toFixed(2) || '0.00'}/dia
                </p>
                <Button size="lg" asChild className="rounded-full text-base px-8 py-6 shadow-lg shadow-primary/20 hover:scale-105 transition-transform">
                  <Link to={displayItems[currentIndex].id !== 'fallback' ? `/items/${displayItems[currentIndex].id}` : '/browse'}>
                    Alugar este item <ArrowRight className="ml-2 w-5 h-5" />
                  </Link>
                </Button>
              </motion.div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Controls */}
        {displayItems.length > 1 && (
          <>
            <button
              onClick={handlePrevious}
              className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-black/20 hover:bg-black/40 backdrop-blur-md border border-white/10 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300"
              aria-label="Anterior"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button
              onClick={handleNext}
              className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-black/20 hover:bg-black/40 backdrop-blur-md border border-white/10 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300"
              aria-label="Próximo"
            >
              <ChevronRight className="w-6 h-6" />
            </button>

            {/* Indicators */}
            <div className="absolute bottom-8 right-8 md:right-16 flex gap-2">
              {displayItems.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentIndex(idx)}
                  className={`transition-all duration-500 rounded-full h-2.5 ${
                    idx === currentIndex ? 'w-8 bg-primary' : 'w-2.5 bg-white/40 hover:bg-white/60'
                  }`}
                  aria-label={`Ir para o slide ${idx + 1}`}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}