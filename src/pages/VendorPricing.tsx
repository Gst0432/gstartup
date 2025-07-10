import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, Star, Zap, ShoppingCart, CreditCard, Globe, TrendingUp } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface PricingPlan {
  id: string;
  name: string;
  price: number;
  duration: string;
  popular?: boolean;
  features: string[];
  description: string;
}

const pricingPlans: PricingPlan[] = [
  {
    id: 'monthly',
    name: 'Mensuel',
    price: 3000,
    duration: '1 mois',
    description: 'Parfait pour commencer',
    features: [
      'Boutique personnalisée',
      'Marketplace intégrée',
      'Ajout de vos passerelles de paiement',
      'Trafic gratuit via marketplace',
      'Publicité 365j/365',
      'Support technique',
      'Analytics de base'
    ]
  },
  {
    id: 'quarterly',
    name: 'Trimestriel',
    price: 10000,
    duration: '3 mois',
    popular: true,
    description: 'Le plus populaire - Économisez 1000 FCFA',
    features: [
      'Boutique personnalisée',
      'Marketplace intégrée',
      'Ajout de vos passerelles de paiement',
      'Trafic gratuit via marketplace',
      'Publicité 365j/365',
      'Support technique prioritaire',
      'Analytics avancées',
      'Formation vendeur incluse',
      'Économie de 1000 FCFA'
    ]
  },
  {
    id: 'yearly',
    name: 'Annuel',
    price: 30000,
    duration: '12 mois',
    description: 'Meilleur rapport qualité-prix - Économisez 6000 FCFA',
    features: [
      'Boutique personnalisée',
      'Marketplace intégrée',
      'Ajout de vos passerelles de paiement',
      'Trafic gratuit via marketplace',
      'Publicité 365j/365',
      'Support technique dédié',
      'Analytics premium',
      'Formation vendeur complète',
      'Consultation marketing mensuelle',
      'Économie de 6000 FCFA',
      'Badge vendeur premium'
    ]
  }
];

export default function VendorPricing() {
  const [loading, setLoading] = useState<string | null>(null);
  const { toast } = useToast();
  const { user, profile } = useAuth();

  const handleSubscribe = async (plan: PricingPlan) => {
    if (!user) {
      toast({
        title: "Connexion requise",
        description: "Veuillez vous connecter pour devenir vendeur",
        variant: "destructive"
      });
      return;
    }

    setLoading(plan.id);

    try {
      const { data, error } = await supabase.functions.invoke('create-vendor-subscription', {
        body: {
          plan_id: plan.id,
          amount: plan.price,
          duration: plan.duration,
          user_id: user.id
        }
      });

      if (error) {
        throw new Error(error.message);
      }

      if (data?.payment_url) {
        // Rediriger vers Moneroo pour le paiement
        window.location.href = data.payment_url;
      }

    } catch (error) {
      console.error('Subscription error:', error);
      toast({
        title: "Erreur",
        description: "Impossible de traiter la demande d'abonnement",
        variant: "destructive"
      });
    } finally {
      setLoading(null);
    }
  };

  const advantages = [
    {
      icon: ShoppingCart,
      title: "Marketplace Intégrée",
      description: "Vendez sur notre marketplace avec des milliers de visiteurs quotidiens"
    },
    {
      icon: Globe,
      title: "Boutique Personnalisée",
      description: "Votre propre boutique en ligne avec votre branding"
    },
    {
      icon: CreditCard,
      title: "Vos Passerelles",
      description: "Intégrez vos propres moyens de paiement (Orange Money, MTN, etc.)"
    },
    {
      icon: TrendingUp,
      title: "Trafic Gratuit",
      description: "Bénéficiez du trafic de notre marketplace sans frais supplémentaires"
    },
    {
      icon: Zap,
      title: "Publicité 365j/365",
      description: "Vos produits sont mis en avant toute l'année"
    },
    {
      icon: Star,
      title: "Support Dédié",
      description: "Accompagnement personnalisé pour développer vos ventes"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/50 to-primary/5">
      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <Badge variant="outline" className="mb-4">
            <Star className="h-3 w-3 mr-1" />
            Devenez Vendeur
          </Badge>
          <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
            Développez Votre Business
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
            Rejoignez notre marketplace et lancez votre boutique en ligne. 
            Bénéficiez d'un trafic gratuit et d'une visibilité maximale.
          </p>
        </div>

        {/* Advantages */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {advantages.map((advantage, index) => {
            const IconComponent = advantage.icon;
            return (
              <Card key={index} className="border-none shadow-lg hover:shadow-xl transition-all duration-300">
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <IconComponent className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-semibold mb-2">{advantage.title}</h3>
                  <p className="text-sm text-muted-foreground">{advantage.description}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Pricing Plans */}
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {pricingPlans.map((plan) => (
            <Card 
              key={plan.id} 
              className={`relative transition-all duration-300 hover:shadow-xl ${
                plan.popular 
                  ? 'border-primary shadow-lg scale-105' 
                  : 'border-border hover:border-primary/50'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-primary text-primary-foreground">
                    Plus Populaire
                  </Badge>
                </div>
              )}
              
              <CardHeader className="text-center pb-2">
                <CardTitle className="text-2xl">{plan.name}</CardTitle>
                <CardDescription className="text-sm">{plan.description}</CardDescription>
                <div className="pt-4">
                  <span className="text-4xl font-bold">{plan.price.toLocaleString()}</span>
                  <span className="text-muted-foreground ml-1">FCFA</span>
                  <p className="text-sm text-muted-foreground mt-1">{plan.duration}</p>
                </div>
              </CardHeader>
              
              <CardContent className="pt-4">
                <ul className="space-y-3 mb-6">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <Check className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <Button 
                  onClick={() => handleSubscribe(plan)}
                  disabled={loading === plan.id}
                  className={`w-full ${
                    plan.popular 
                      ? 'bg-primary hover:bg-primary/90' 
                      : 'bg-secondary hover:bg-secondary/90'
                  }`}
                  size="lg"
                >
                  {loading === plan.id ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                      Traitement...
                    </div>
                  ) : (
                    <>
                      <CreditCard className="h-4 w-4 mr-2" />
                      Devenir Vendeur
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* CTA Section */}
        <div className="text-center mt-16 p-8 bg-gradient-to-r from-primary/5 to-primary/10 rounded-2xl">
          <h2 className="text-2xl font-bold mb-4">Prêt à Commencer ?</h2>
          <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
            Rejoignez des centaines de vendeurs qui font déjà confiance à notre plateforme 
            pour développer leur business en ligne.
          </p>
          <div className="flex flex-wrap justify-center gap-4 text-sm text-muted-foreground">
            <span>✓ Activation immédiate après paiement</span>
            <span>✓ Support 7j/7</span>
            <span>✓ Formation incluse</span>
          </div>
        </div>
      </div>
    </div>
  );
}