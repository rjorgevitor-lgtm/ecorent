import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { ArrowRight, Recycle, Users, TrendingUp, Package, Shield, CheckCircle2, Phone, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button.jsx';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';
import ItemCard from '@/components/ItemCard.jsx';
import HeroCarousel from '@/components/HeroCarousel.jsx';
import pb from '@/lib/pocketbaseClient.js';

export default function HomePage() {
  const [featuredItems, setFeaturedItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeaturedItems = async () => {
      try {
        const result = await pb.collection('items').getList(1, 6, {
          filter: 'status = "Disponível"',
          sort: '-created',
          $autoCancel: false
        });
        setFeaturedItems(result.items);
      } catch (error) {
        console.error('Error fetching items:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedItems();
  }, []);

  const categories = [
    { name: 'Bicicletas', icon: '🚴', gradient: 'from-emerald-500/20 to-emerald-500/5' },
    { name: 'Ferramentas', icon: '🔧', gradient: 'from-amber-500/20 to-amber-500/5' },
    { name: 'Camping', icon: '⛺', gradient: 'from-green-500/20 to-green-500/5' },
    { name: 'Eletrônicos', icon: '💻', gradient: 'from-blue-500/20 to-blue-500/5' },
    { name: 'Equipamentos esportivos', icon: '⚽', gradient: 'from-orange-500/20 to-orange-500/5' },
    { name: 'Instrumentos musicais', icon: '🎸', gradient: 'from-indigo-500/20 to-indigo-500/5' }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

  return (
    <>
      <Helmet>
        <title>EcoRent - O futuro é compartilhar</title>
        <meta name="description" content="Plataforma sustentável de aluguel peer-to-peer em Curitiba. Economize dinheiro, reduza desperdício e ajude o planeta alugando itens da sua comunidade." />
      </Helmet>

      <div className="min-h-screen flex flex-col font-sans relative">
        <Header />

        <main className="flex-1">
          {/* Hero Section */}
          <HeroCarousel />

          {/* Categories Grid */}
          <section className="py-24">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
                <div className="max-w-2xl">
                  <h2 className="text-3xl md:text-4xl font-serif font-bold mb-4">
                    Tudo o que você precisa, perto de você
                  </h2>
                  <p className="text-lg text-muted-foreground">
                    De furadeiras a barracas de camping. Alugue por uma fração do preço de compra em Curitiba.
                  </p>
                </div>
                <Button variant="ghost" asChild className="hidden md:flex mt-4">
                  <Link to="/browse">
                    Ver todas categorias <ArrowRight className="ml-2 w-4 h-4" />
                  </Link>
                </Button>
              </div>

              <motion.div 
                variants={containerVariants}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, margin: "-100px" }}
                className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 lg:gap-6"
              >
                {categories.map((category) => (
                  <motion.div key={category.name} variants={itemVariants}>
                    <Link to={`/browse?category=${encodeURIComponent(category.name)}`} className="block group">
                      <div className={`h-full p-6 rounded-3xl bg-gradient-to-br ${category.gradient} border border-border/50 hover:border-primary/30 transition-all duration-300 hover:shadow-eco text-center`}>
                        <div className="text-4xl mb-4 transform group-hover:scale-110 transition-transform duration-300">
                          {category.icon}
                        </div>
                        <h3 className="font-semibold text-foreground/90 group-hover:text-primary transition-colors text-sm md:text-base">
                          {category.name}
                        </h3>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </motion.div>
            </div>
          </section>

          {/* Featured Items Grid */}
          <section className="py-24 bg-secondary/30 rounded-t-[3rem]">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center max-w-3xl mx-auto mb-16">
                <span className="text-primary font-semibold tracking-wider uppercase text-sm mb-2 block">Destaques</span>
                <h2 className="text-3xl md:text-5xl font-serif font-bold mb-6">
                  Itens recomendados
                </h2>
                <p className="text-lg text-muted-foreground">
                  Os itens mais populares e bem avaliados disponíveis para aluguel imediato em Curitiba.
                </p>
              </div>

              {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="rounded-2xl bg-card border overflow-hidden">
                      <div className="aspect-[4/3] bg-muted animate-pulse"></div>
                      <div className="p-5 space-y-3">
                        <div className="h-6 bg-muted animate-pulse rounded w-3/4"></div>
                        <div className="h-4 bg-muted animate-pulse rounded w-1/2"></div>
                        <div className="h-8 bg-muted animate-pulse rounded w-1/3 mt-6"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : featuredItems.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                  {featuredItems.map((item, index) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                    >
                      <ItemCard item={item} />
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-16 bg-card rounded-3xl border border-border border-dashed">
                  <Package className="w-16 h-16 text-muted-foreground/50 mx-auto mb-4" />
                  <p className="text-lg text-muted-foreground">Nenhum item disponível no momento.</p>
                </div>
              )}

              <div className="text-center mt-16">
                <Button size="lg" asChild className="rounded-full px-8 shadow-eco hover:-translate-y-1 transition-transform">
                  <Link to="/browse">
                    Explorar todos os itens
                  </Link>
                </Button>
              </div>
            </div>
          </section>

          {/* Value Propositions Bento Grid */}
          <section className="py-24">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 auto-rows-min">
                
                {/* Main USP */}
                <div className="lg:col-span-8 bg-primary text-primary-foreground rounded-[2.5rem] p-8 md:p-12 relative overflow-hidden flex flex-col justify-center">
                  <div className="absolute right-0 top-0 opacity-10 pointer-events-none transform translate-x-1/4 -translate-y-1/4">
                    <Recycle className="w-96 h-96" />
                  </div>
                  <div className="relative z-10 max-w-xl">
                    <span className="inline-block px-3 py-1 bg-white/20 rounded-full text-sm font-semibold mb-6">Sustentável</span>
                    <h2 className="text-3xl md:text-5xl font-serif font-bold mb-6">
                      Menos consumo, mais experiências
                    </h2>
                    <p className="text-lg text-primary-foreground/90 mb-8 leading-relaxed">
                      Cada item alugado é um item a menos fabricado. Ajude a reduzir emissões de carbono e desperdício enquanto desfruta exatamente do que precisa.
                    </p>
                    <ul className="space-y-3 mb-8">
                      <li className="flex items-center gap-3"><CheckCircle2 className="w-5 h-5 text-emerald-300"/> Reduza o consumo exagerado</li>
                      <li className="flex items-center gap-3"><CheckCircle2 className="w-5 h-5 text-emerald-300"/> Apoie a economia circular</li>
                    </ul>
                  </div>
                </div>

                {/* Secondary 1 */}
                <div className="lg:col-span-4 bg-accent text-accent-foreground rounded-[2.5rem] p-8 md:p-10 flex flex-col justify-between group">
                  <div>
                    <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                      <TrendingUp className="w-7 h-7" />
                    </div>
                    <h3 className="text-2xl font-serif font-bold mb-4">Economize e lucre</h3>
                    <p className="text-accent-foreground/90">
                      Alugue itens caros por pouco, ou anuncie suas ferramentas paradas e gere uma renda extra no fim do mês.
                    </p>
                  </div>
                </div>

                {/* Secondary 2 */}
                <div className="lg:col-span-5 bg-secondary text-secondary-foreground rounded-[2.5rem] p-8 md:p-10">
                  <div className="w-14 h-14 bg-white shadow-sm rounded-2xl flex items-center justify-center mb-6">
                    <Users className="w-7 h-7 text-primary" />
                  </div>
                  <h3 className="text-2xl font-serif font-bold mb-4">Conecte-se localmente</h3>
                  <p className="text-secondary-foreground/80 mb-6">
                    Conheça seus vizinhos em Curitiba e crie uma rede de confiança na sua comunidade. 
                  </p>
                  <Button variant="outline" asChild className="rounded-full bg-white/50 hover:bg-white border-transparent text-primary">
                    <Link to="/browse">Buscar na minha área</Link>
                  </Button>
                </div>

                {/* Secondary 3 - Contact */}
                <div className="lg:col-span-7 border border-border bg-card rounded-[2.5rem] p-8 md:p-10 relative overflow-hidden">
                  <div className="relative z-10 flex flex-col justify-center h-full">
                    <div className="w-14 h-14 bg-primary/10 text-primary rounded-2xl flex items-center justify-center mb-6">
                      <Shield className="w-7 h-7" />
                    </div>
                    <h3 className="text-3xl font-serif font-bold mb-4">Transações seguras</h3>
                    <p className="text-muted-foreground text-lg max-w-md mb-6">
                      Verificação de identidade, sistema robusto de avaliações e seguro opcional contra danos para sua total tranquilidade.
                    </p>
                    <div className="flex flex-col gap-3 text-sm">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Phone className="w-4 h-4 text-primary" />
                        <span>(41) 99613-2257</span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <MapPin className="w-4 h-4 text-primary" />
                        <span>Curitiba, PR</span>
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </section>

        </main>

        <Footer />
      </div>
    </>
  );
}