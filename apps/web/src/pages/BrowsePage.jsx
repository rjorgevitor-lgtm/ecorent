import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { Package, ChevronLeft, ChevronRight, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';
import SearchBar from '@/components/SearchBar.jsx';
import ItemCard from '@/components/ItemCard.jsx';
import { useItemSearch } from '@/hooks/useItemSearch.js';

const categories = [
  'Bicicletas',
  'Ferramentas',
  'Equipamentos esportivos',
  'Camping',
  'Eletrônicos',
  'Videogames',
  'Roupas',
  'Fantasias',
  'Instrumentos musicais',
  'Itens para festas',
  'Veículos',
  'Utensílios domésticos',
  'Equipamentos de fotografia'
];

export default function BrowsePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [currentState, setCurrentState] = useState(localStorage.getItem('ecorent_state') || 'PR');
  
  const {
    items,
    loading,
    error,
    searchQuery,
    selectedCategory,
    currentPage,
    totalPages,
    totalItems,
    handleSearch,
    handleCategoryChange,
    handlePageChange
  } = useItemSearch();

  useEffect(() => {
    const categoryParam = searchParams.get('category');
    if (categoryParam && categoryParam !== selectedCategory) {
      handleCategoryChange(categoryParam);
    }
  }, [searchParams, selectedCategory, handleCategoryChange]);

  // Listen for state changes from LocationSelector
  useEffect(() => {
    const handleStateChange = () => {
      setCurrentState(localStorage.getItem('ecorent_state') || 'PR');
    };
    window.addEventListener('ecorent_state_changed', handleStateChange);
    return () => window.removeEventListener('ecorent_state_changed', handleStateChange);
  }, []);

  const handleCategorySelect = (value) => {
    const actualCategory = value === 'all' ? '' : value;
    handleCategoryChange(actualCategory);
    if (actualCategory) {
      setSearchParams({ category: actualCategory });
    } else {
      setSearchParams({});
    }
  };

  // Filter items by state locally since useItemSearch might not support it directly
  // In a real app, this should be passed to the backend query
  const filteredItems = items.filter(item => {
    if (!item.address) return true; // If no address, show it
    return item.address.includes(currentState);
  });

  return (
    <>
      <Helmet>
        <title>Explorar itens - EcoRent</title>
        <meta name="description" content={`Navegue por milhares de itens disponíveis para aluguel em ${currentState}. Encontre exatamente o que você precisa na sua comunidade.`} />
      </Helmet>

      <div className="min-h-screen flex flex-col">
        <Header />

        <main className="flex-1 py-12">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="mb-8"
            >
              <div className="flex items-center gap-2 mb-4">
                <MapPin className="w-5 h-5 text-primary" />
                <span className="text-sm font-medium text-muted-foreground">Navegando em: {currentState}</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold mb-4" style={{ letterSpacing: '-0.02em', textWrap: 'balance' }}>
                Explorar itens
              </h1>
              <p className="text-lg text-muted-foreground">
                {filteredItems.length} {filteredItems.length === 1 ? 'item disponível' : 'itens disponíveis'} para aluguel em {currentState}
              </p>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
              <aside className="lg:col-span-1">
                <Card>
                  <CardContent className="p-6 space-y-6">
                    <div>
                      <h3 className="font-semibold mb-3">Buscar</h3>
                      <SearchBar onSearch={handleSearch} />
                    </div>

                    <div>
                      <h3 className="font-semibold mb-3">Categoria</h3>
                      <Select value={selectedCategory || 'all'} onValueChange={handleCategorySelect}>
                        <SelectTrigger className="text-foreground">
                          <SelectValue placeholder="Todas as categorias" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Todas as categorias</SelectItem>
                          {categories.map(category => (
                            <SelectItem key={category} value={category}>
                              {category}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {(searchQuery || selectedCategory) && (
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={() => {
                          handleSearch('');
                          handleCategorySelect('all');
                        }}
                      >
                        Limpar filtros
                      </Button>
                    )}
                  </CardContent>
                </Card>
              </aside>

              <div className="lg:col-span-3">
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
                ) : error ? (
                  <div className="text-center py-12">
                    <p className="text-destructive mb-4">Erro ao carregar itens: {error}</p>
                    <Button onClick={() => window.location.reload()}>Tentar novamente</Button>
                  </div>
                ) : filteredItems.length > 0 ? (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {filteredItems.map((item, index) => (
                        <motion.div
                          key={item.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3, delay: index * 0.05 }}
                        >
                          <ItemCard item={item} />
                        </motion.div>
                      ))}
                    </div>

                    {totalPages > 1 && (
                      <div className="flex items-center justify-center gap-2 mt-12">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handlePageChange(currentPage - 1)}
                          disabled={currentPage === 1}
                        >
                          <ChevronLeft className="w-4 h-4" />
                        </Button>
                        
                        <div className="flex items-center gap-1">
                          {[...Array(totalPages)].map((_, i) => {
                            const page = i + 1;
                            if (
                              page === 1 ||
                              page === totalPages ||
                              (page >= currentPage - 1 && page <= currentPage + 1)
                            ) {
                              return (
                                <Button
                                  key={page}
                                  variant={currentPage === page ? 'default' : 'outline'}
                                  size="icon"
                                  onClick={() => handlePageChange(page)}
                                >
                                  {page}
                                </Button>
                              );
                            } else if (page === currentPage - 2 || page === currentPage + 2) {
                              return <span key={page} className="px-2">...</span>;
                            }
                            return null;
                          })}
                        </div>

                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handlePageChange(currentPage + 1)}
                          disabled={currentPage === totalPages}
                        >
                          <ChevronRight className="w-4 h-4" />
                        </Button>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-center py-12">
                    <Package className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-xl font-semibold mb-2">Nenhum item encontrado em {currentState}</h3>
                    <p className="text-muted-foreground mb-6">
                      Tente ajustar seus filtros ou buscar por outros termos
                    </p>
                    <Button
                      variant="outline"
                      onClick={() => {
                        handleSearch('');
                        handleCategorySelect('all');
                      }}
                    >
                      Limpar filtros
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>

        <Footer />
      </div>
    </>
  );
}