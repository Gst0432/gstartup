import { Header } from '../components/Header';
import { HeroSection } from '../components/HeroSection';
import { AboutSection } from '../components/AboutSection';
import { ProductsSection } from '../components/ProductsSection';
import { AdvertisementSection } from '../components/AdvertisementSection';
import { Footer } from '../components/Footer';
import { OrderTracker } from '../components/OrderTracker';

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <HeroSection />
        <ProductsSection />
        <AdvertisementSection />
        
        {/* Section de suivi des commandes */}
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="max-w-2xl mx-auto">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold mb-4">Suivre votre commande</h2>
                <p className="text-muted-foreground">
                  Entrez votre code de référence pour suivre l'état de votre commande en temps réel
                </p>
              </div>
              <OrderTracker />
            </div>
          </div>
        </section>
        
        <AboutSection />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
