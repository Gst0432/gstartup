import { Button } from './ui/button';
import { Input } from './ui/input';
import { Store, Mail, Phone, MapPin, Heart } from 'lucide-react';
import { useLanguage } from '../hooks/useLanguage';

export const Footer = () => {
  const { t } = useLanguage();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-muted py-12">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-3 gap-8 mb-8">
          {/* À propos */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <img 
                src="/lovable-uploads/c72d66fa-2175-4b64-b34b-5754d320f178.png" 
                alt="Logo"
                className="h-8 w-auto"
              />
            </div>
            
            <p className="text-muted-foreground text-sm leading-relaxed">
              La marketplace de référence au Sénégal. Découvrez et achetez des produits et services de qualité auprès de vendeurs locaux vérifiés.
            </p>

            <div className="space-y-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                <span>Dakar, Sénégal</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                <a href="mailto:contact@gstartup.pro" className="hover:text-primary transition-colors">
                  contact@gstartup.pro
                </a>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                <span>+22770138031</span>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <div className="space-y-4">
            <h4 className="font-semibold">Navigation</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="/" className="hover:text-primary transition-colors">Accueil</a></li>
              <li><a href="/marketplace" className="hover:text-primary transition-colors">Marketplace</a></li>
              <li><a href="/shops" className="hover:text-primary transition-colors">Boutiques</a></li>
              <li><a href="/about" className="hover:text-primary transition-colors">À propos</a></li>
              <li><a href="/contact" className="hover:text-primary transition-colors">Contact</a></li>
            </ul>
          </div>

          {/* Vendeurs */}
          <div className="space-y-4">
            <h4 className="font-semibold flex items-center gap-2">
              <Store className="h-4 w-4" />
              Vendeurs
            </h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="/auth" className="hover:text-primary transition-colors">Devenir vendeur</a></li>
              <li><a href="/vendor/dashboard" className="hover:text-primary transition-colors">Espace vendeur</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Guide du vendeur</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Support vendeurs</a></li>
            </ul>
          </div>
        </div>

        {/* Section légale et copyright */}
        <div className="border-t border-border pt-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-center md:text-left">
              <p className="text-sm text-muted-foreground">
                © {currentYear} 227makemoney. Tous droits réservés.
              </p>
              <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                <a href="#" className="hover:text-primary transition-colors">Conditions d'utilisation</a>
                <span>•</span>
                <a href="#" className="hover:text-primary transition-colors">Politique de confidentialité</a>
                <span>•</span>
                <a href="#" className="hover:text-primary transition-colors">Mentions légales</a>
              </div>
            </div>
            
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>Fait avec</span>
              <Heart className="h-4 w-4 text-red-500 fill-current" />
              <span>par</span>
              <a href="https://gstartup.pro" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline font-medium">
                G-STARTUP
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};