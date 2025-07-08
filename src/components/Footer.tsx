import { Button } from './ui/button';
import { Input } from './ui/input';
import { Monitor, Smartphone, Puzzle, Package, ShoppingBag, Palette } from 'lucide-react';
import { useLanguage } from '../hooks/useLanguage';

export const Footer = () => {
  const { t } = useLanguage();

  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-muted py-16">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {/* Company Info */}
          <div className="space-y-6">
            <div className="flex items-center gap-2">
              <img 
                src="/lovable-uploads/c72d66fa-2175-4b64-b34b-5754d320f178.png" 
                alt="G-STARTUP Logo"
                className="h-10 w-auto"
              />
            </div>
            
            <p className="text-muted-foreground leading-relaxed">
              We are totally focused on delivering high quality Cloud Service & software solution. 
              We have completed development projects for international clients in many market sectors.
            </p>

            <div className="space-y-2">
              <h4 className="font-semibold">{t('company')}</h4>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-primary transition-colors">Our Timeline</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Career With us</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Quote</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">FAQ</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Blog</a></li>
              </ul>
            </div>
          </div>

          {/* Our Speciality */}
          <div className="space-y-6">
            <h4 className="font-semibold">{t('specialty')}</h4>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li className="flex items-center gap-2">
                <Monitor className="h-4 w-4 text-primary" />
                {t('webDev')}
              </li>
              <li className="flex items-center gap-2">
                <Smartphone className="h-4 w-4 text-primary" />
                {t('mobileDev')}
              </li>
              <li className="flex items-center gap-2">
                <Puzzle className="h-4 w-4 text-primary" />
                {t('pluginDev')}
              </li>
              <li className="flex items-center gap-2">
                <Package className="h-4 w-4 text-primary" />
                {t('wordpressDev')}
              </li>
              <li className="flex items-center gap-2">
                <ShoppingBag className="h-4 w-4 text-primary" />
                {t('shopifyDev')}
              </li>
              <li className="flex items-center gap-2">
                <Palette className="h-4 w-4 text-primary" />
                {t('uiuxDesign')}
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div className="space-y-6">
            <h4 className="font-semibold">{t('resources')}</h4>
            <ul className="space-y-1 text-sm text-muted-foreground">
              <li><a href="#" className="hover:text-primary transition-colors">{t('termsConditions')}</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">{t('privacyPolicy')}</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Clients Satisfactions</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Financial Tips</a></li>
            </ul>
          </div>

          {/* Newsletter */}
          <div className="space-y-6">
            <h4 className="font-semibold">{t('newsletter')}</h4>
            <p className="text-sm text-muted-foreground">
              Subscribe to our newsletter for updates and offers
            </p>
            
            <div className="space-y-3">
              <Input 
                placeholder="Enter your email"
                className="bg-background"
              />
              <Button className="w-full">
                {t('subscribe')}
              </Button>
            </div>

            <div className="text-xs text-muted-foreground">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="rounded" />
                I agree to all terms and policies
              </label>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-border pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-muted-foreground">
              {t('allRightsReserved')} © {currentYear} by G-STARTUP LTD
            </p>
            
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span>In Collaboration With</span>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-primary/20 rounded"></div>
                <div className="w-6 h-6 bg-primary/30 rounded"></div>
                <div className="w-6 h-6 bg-primary/40 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};