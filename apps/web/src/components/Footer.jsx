import React from 'react';
import { Link } from 'react-router-dom';
import { Leaf, Mail, MapPin, Phone } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-secondary text-secondary-foreground border-t mt-auto">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-8">
          
          {/* Brand Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-sm">
                <Leaf className="w-6 h-6 text-primary-foreground" />
              </div>
              <span className="font-bold text-2xl tracking-tight">EcoRent</span>
            </div>
            <p className="text-base text-secondary-foreground/80 max-w-sm">
              Alugue e compartilhe itens de forma sustentável. Economize dinheiro e ajude o planeta.
            </p>
          </div>

          {/* Navigation Links */}
          <div>
            <h3 className="font-semibold text-lg mb-4 tracking-tight">Navegação</h3>
            <ul className="flex flex-col space-y-1">
              <li>
                <Link to="/" className="text-base text-secondary-foreground/80 hover:text-primary transition-colors flex items-center min-h-[44px]">
                  Início
                </Link>
              </li>
              <li>
                <Link to="/browse" className="text-base text-secondary-foreground/80 hover:text-primary transition-colors flex items-center min-h-[44px]">
                  Explorar Itens
                </Link>
              </li>
              <li>
                <Link to="/my-listings" className="text-base text-secondary-foreground/80 hover:text-primary transition-colors flex items-center min-h-[44px]">
                  Meus anúncios
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal Links */}
          <div>
            <h3 className="font-semibold text-lg mb-4 tracking-tight">Legal</h3>
            <ul className="flex flex-col space-y-1">
              <li>
                <Link to="/privacy" className="text-base text-secondary-foreground/80 hover:text-primary transition-colors flex items-center min-h-[44px]">
                  Política de Privacidade
                </Link>
              </li>
              <li>
                <Link to="/terms" className="text-base text-secondary-foreground/80 hover:text-primary transition-colors flex items-center min-h-[44px]">
                  Termos de Serviço
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Section */}
          <div>
            <h3 className="font-semibold text-lg mb-4 tracking-tight">Contato</h3>
            <ul className="flex flex-col space-y-2 text-base text-secondary-foreground/80">
              <li className="flex items-center gap-3 min-h-[44px]">
                <div className="bg-background/50 p-2 rounded-lg"><Mail className="w-5 h-5 text-primary" /></div>
                <span>contato@ecorent.com</span>
              </li>
              <li className="flex items-center gap-3 min-h-[44px]">
                <div className="bg-background/50 p-2 rounded-lg"><Phone className="w-5 h-5 text-primary" /></div>
                <span>(41) 99613-2257</span>
              </li>
              <li className="flex items-center gap-3 min-h-[44px]">
                <div className="bg-background/50 p-2 rounded-lg"><MapPin className="w-5 h-5 text-primary" /></div>
                <span>Curitiba, PR</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-secondary-foreground/10 mt-12 pt-8 text-center text-sm md:text-base text-secondary-foreground/60 flex flex-col md:flex-row justify-between items-center gap-4">
          <p>&copy; {new Date().getFullYear()} EcoRent. Todos os direitos reservados.</p>
          <p className="flex items-center justify-center gap-1">Feito com <span className="text-destructive">♥</span> para um futuro verde</p>
        </div>
      </div>
    </footer>
  );
}