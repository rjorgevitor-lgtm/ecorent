import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Leaf, User, LogOut, LayoutDashboard, Package, Heart, MessageSquare, History, Ear, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/contexts/AuthContext.jsx';
import pb from '@/lib/pocketbaseClient';
import LocationSelector from './LocationSelector.jsx';
import AccessibilityModal from './AccessibilityModal.jsx';

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isAccessibilityModalOpen, setIsAccessibilityModalOpen] = useState(false);
  const { isAuthenticated, currentUser, logout } = useAuth();
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  // Prevent background scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [mobileMenuOpen]);

  const navLinks = [
    { path: '/', label: 'Início' },
    { path: '/browse', label: 'Explorar' },
    ...(isAuthenticated ? [
      { path: '/my-rentals', label: 'Meus aluguéis' },
      { path: '/chat', label: 'Mensagens' }
    ] : [])
  ];

  const avatarUrl = currentUser?.avatar 
    ? pb.files.getUrl(currentUser, currentUser.avatar, { thumb: '100x100' })
    : null;

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur-md supports-[backdrop-filter]:bg-background/80 shadow-sm transition-all duration-300">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 md:h-20 items-center justify-between">
            
            <div className="flex items-center gap-4 lg:gap-6">
              <Link to="/" className="flex items-center gap-2 font-bold text-xl md:text-2xl group min-h-[44px]">
                <div className="w-8 h-8 md:w-10 md:h-10 bg-primary rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
                  <Leaf className="w-5 h-5 md:w-6 md:h-6 text-primary-foreground" />
                </div>
                <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  EcoRent
                </span>
              </Link>

              <div className="hidden md:block">
                <LocationSelector />
              </div>
            </div>

            <nav className="hidden lg:flex items-center gap-6">
              {navLinks.map(link => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`text-[15px] font-medium transition-all duration-200 hover:text-primary ${
                    isActive(link.path) ? 'text-primary' : 'text-foreground/80'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            <div className="flex items-center gap-1 sm:gap-4">
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setIsAccessibilityModalOpen(true)} 
                className="relative rounded-full hover:bg-secondary touch-target"
                aria-label="Configurações de Acessibilidade"
              >
                <Ear className="w-5 h-5 text-foreground/80" />
              </Button>

              {!isAuthenticated ? (
                <div className="hidden md:flex items-center gap-3">
                  <Button variant="ghost" asChild className="font-medium hover:bg-secondary min-h-[44px]">
                    <Link to="/login">Entrar</Link>
                  </Button>
                  <Button asChild className="rounded-full shadow-eco hover:brightness-110 active:scale-95 transition-all min-h-[44px]">
                    <Link to="/signup">Cadastrar</Link>
                  </Button>
                </div>
              ) : (
                <div className="hidden md:flex items-center gap-4">
                  <Button variant="outline" asChild className="rounded-full border-primary/20 text-primary hover:bg-primary/5 transition-all min-h-[44px]">
                    <Link to="/create-listing">Anunciar item</Link>
                  </Button>
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="relative h-12 w-12 rounded-full p-0 overflow-hidden ring-2 ring-transparent hover:ring-primary/20 transition-all duration-300 touch-target">
                        <Avatar className="h-full w-full">
                          {avatarUrl && <AvatarImage src={avatarUrl} alt={currentUser?.name} className="object-cover" />}
                          <AvatarFallback className="bg-secondary text-secondary-foreground font-semibold">
                            {currentUser?.name?.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-64 p-2 rounded-2xl shadow-xl">
                      <div className="flex flex-col space-y-1 p-2 mb-2">
                        <p className="text-base font-semibold truncate">{currentUser?.name}</p>
                        <p className="text-xs text-muted-foreground truncate">{currentUser?.email}</p>
                      </div>
                      <DropdownMenuSeparator className="opacity-50" />
                      
                      <div className="grid gap-1 py-1">
                        <DropdownMenuItem asChild className="rounded-xl cursor-pointer min-h-[44px]">
                          <Link to="/dashboard">
                            <LayoutDashboard className="mr-2 h-4 w-4 text-muted-foreground" /> Dashboard
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild className="rounded-xl cursor-pointer min-h-[44px]">
                          <Link to="/my-listings">
                            <Package className="mr-2 h-4 w-4 text-muted-foreground" /> Meus anúncios
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild className="rounded-xl cursor-pointer min-h-[44px]">
                          <Link to="/my-rentals">
                            <History className="mr-2 h-4 w-4 text-muted-foreground" /> Histórico de aluguéis
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild className="rounded-xl cursor-pointer min-h-[44px]">
                          <Link to="/favorites">
                            <Heart className="mr-2 h-4 w-4 text-muted-foreground" /> Favoritos
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild className="rounded-xl cursor-pointer min-h-[44px]">
                          <Link to="/chat">
                            <MessageSquare className="mr-2 h-4 w-4 text-muted-foreground" /> Mensagens
                          </Link>
                        </DropdownMenuItem>
                      </div>

                      <DropdownMenuSeparator className="opacity-50" />
                      <DropdownMenuItem onClick={logout} className="rounded-xl cursor-pointer text-destructive focus:bg-destructive/10 focus:text-destructive mt-1 min-h-[44px]">
                        <LogOut className="mr-2 h-4 w-4" /> Sair da conta
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              )}

              {/* Mobile Menu Toggle */}
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden rounded-full touch-target"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-label={mobileMenuOpen ? "Fechar menu" : "Abrir menu"}
                aria-expanded={mobileMenuOpen}
              >
                {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Navigation Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 bg-background md:hidden pt-16 flex flex-col h-[100dvh] overflow-y-auto animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="p-4 border-b">
            <LocationSelector />
          </div>
          
          <nav className="flex-1 p-4 flex flex-col gap-2">
            {navLinks.map(link => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`text-lg font-medium transition-colors hover:bg-secondary px-4 py-4 rounded-xl flex items-center min-h-[56px] ${
                  isActive(link.path) ? 'text-primary bg-primary/5' : 'text-foreground/80'
                }`}
              >
                {link.label}
              </Link>
            ))}

            <div className="mt-auto border-t pt-4 flex flex-col gap-2 pb-8">
              {!isAuthenticated ? (
                <>
                  <Button variant="outline" asChild className="w-full justify-center min-h-[56px] text-lg rounded-xl">
                    <Link to="/login" onClick={() => setMobileMenuOpen(false)}>Entrar</Link>
                  </Button>
                  <Button asChild className="w-full justify-center min-h-[56px] text-lg rounded-xl">
                    <Link to="/signup" onClick={() => setMobileMenuOpen(false)}>Cadastrar</Link>
                  </Button>
                </>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  <Button variant="outline" asChild className="w-full justify-start min-h-[56px] rounded-xl col-span-2">
                    <Link to="/create-listing" onClick={() => setMobileMenuOpen(false)}>
                      <Plus className="mr-2 w-5 h-5" /> Anunciar item
                    </Link>
                  </Button>
                  <Link to="/dashboard" onClick={() => setMobileMenuOpen(false)} className="flex flex-col items-center justify-center p-4 rounded-xl bg-secondary/50 text-sm font-medium gap-2">
                    <LayoutDashboard className="h-6 w-6" /> Dashboard
                  </Link>
                  <Link to="/profile" onClick={() => setMobileMenuOpen(false)} className="flex flex-col items-center justify-center p-4 rounded-xl bg-secondary/50 text-sm font-medium gap-2">
                    <User className="h-6 w-6" /> Perfil
                  </Link>
                  <button onClick={() => { logout(); setMobileMenuOpen(false); }} className="flex items-center justify-center min-h-[56px] rounded-xl bg-destructive/10 text-destructive text-sm col-span-2 w-full mt-2 font-medium">
                    <LogOut className="mr-2 h-5 w-5" /> Sair da conta
                  </button>
                </div>
              )}
            </div>
          </nav>
        </div>
      )}

      <AccessibilityModal 
        isOpen={isAccessibilityModalOpen} 
        onClose={() => setIsAccessibilityModalOpen(false)} 
      />
    </>
  );
}