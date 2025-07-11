import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { 
  BookOpen, 
  Star, 
  ShoppingCart, 
  CreditCard, 
  TrendingUp, 
  Users, 
  Settings, 
  Camera,
  FileText,
  Globe,
  Smartphone,
  CheckCircle,
  Play,
  ArrowRight
} from 'lucide-react';

export default function VendorGuide() {
  const steps = [
    {
      id: 1,
      title: "Configuration de votre boutique",
      description: "Personnalisez votre profil vendeur et configurez votre boutique",
      icon: Settings,
      tasks: [
        "Complétez votre profil vendeur",
        "Ajoutez votre logo et bannière",
        "Configurez vos informations de contact",
        "Définissez vos conditions de vente"
      ]
    },
    {
      id: 2,
      title: "Ajout de vos produits",
      description: "Créez votre catalogue de produits attractif",
      icon: ShoppingCart,
      tasks: [
        "Prenez des photos de qualité",
        "Rédigez des descriptions détaillées",
        "Fixez vos prix compétitifs",
        "Organisez vos catégories"
      ]
    },
    {
      id: 3,
      title: "Configuration des paiements",
      description: "Intégrez vos moyens de paiement préférés",
      icon: CreditCard,
      tasks: [
        "Configurez Orange Money",
        "Ajoutez MTN Money",
        "Intégrez vos comptes bancaires",
        "Testez vos paiements"
      ]
    },
    {
      id: 4,
      title: "Promotion et vente",
      description: "Maximisez votre visibilité et vos ventes",
      icon: TrendingUp,
      tasks: [
        "Optimisez vos mots-clés",
        "Utilisez les promotions",
        "Engagez avec vos clients",
        "Analysez vos performances"
      ]
    }
  ];

  const tips = [
    {
      title: "Photos de qualité",
      description: "Utilisez un bon éclairage et plusieurs angles pour vos produits",
      icon: Camera
    },
    {
      title: "Descriptions détaillées",
      description: "Incluez taille, couleur, matériaux et instructions d'utilisation",
      icon: FileText
    },
    {
      title: "Prix compétitifs",
      description: "Recherchez les prix du marché et proposez de la valeur ajoutée",
      icon: TrendingUp
    },
    {
      title: "Service client",
      description: "Répondez rapidement aux questions et gérez les retours",
      icon: Users
    }
  ];

  const features = [
    {
      title: "Boutique personnalisée",
      description: "Votre propre boutique en ligne avec votre branding",
      icon: Globe
    },
    {
      title: "Marketplace intégrée",
      description: "Vendez aussi sur notre marketplace avec des milliers de visiteurs",
      icon: ShoppingCart
    },
    {
      title: "Application mobile",
      description: "Gérez votre boutique depuis votre smartphone",
      icon: Smartphone
    },
    {
      title: "Analytics détaillées",
      description: "Suivez vos ventes, visiteurs et performances",
      icon: TrendingUp
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/50 to-primary/5">
      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <Badge variant="outline" className="mb-4">
            <BookOpen className="h-3 w-3 mr-1" />
            Guide du Vendeur
          </Badge>
          <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
            Guide Complet du Vendeur
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
            Apprenez à maximiser vos ventes et développer votre business en ligne 
            avec notre guide étape par étape.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button asChild size="lg">
              <a href="/vendor-pricing">
                <Star className="h-4 w-4 mr-2" />
                Devenir Vendeur
              </a>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <a href="/vendor-support">
                Obtenir de l'aide
              </a>
            </Button>
          </div>
        </div>

        {/* Guide étapes */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-12">Démarrer en 4 étapes</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((step, index) => {
              const IconComponent = step.icon;
              return (
                <Card key={step.id} className="relative">
                  <CardHeader>
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">
                        {step.id}
                      </div>
                      <IconComponent className="h-5 w-5 text-primary" />
                    </div>
                    <CardTitle className="text-lg">{step.title}</CardTitle>
                    <CardDescription>{step.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {step.tasks.map((task, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm">
                          <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                          {task}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                  {index < steps.length - 1 && (
                    <ArrowRight className="hidden lg:block absolute -right-3 top-1/2 transform -translate-y-1/2 h-6 w-6 text-muted-foreground" />
                  )}
                </Card>
              );
            })}
          </div>
        </div>

        {/* Conseils pour réussir */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-12">Conseils pour Réussir</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {tips.map((tip, index) => {
              const IconComponent = tip.icon;
              return (
                <Card key={index} className="text-center">
                  <CardContent className="p-6">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                      <IconComponent className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="font-semibold mb-2">{tip.title}</h3>
                    <p className="text-sm text-muted-foreground">{tip.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Fonctionnalités disponibles */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-12">Fonctionnalités Disponibles</h2>
          <div className="grid md:grid-cols-2 gap-8">
            {features.map((feature, index) => {
              const IconComponent = feature.icon;
              return (
                <Card key={index}>
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                        <IconComponent className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold mb-2">{feature.title}</h3>
                        <p className="text-muted-foreground">{feature.description}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-12">Questions Fréquentes</h2>
          <div className="max-w-4xl mx-auto space-y-6">
            {[
              {
                question: "Combien coûte l'abonnement vendeur ?",
                answer: "Nous proposons 3 formules : 3000 FCFA/mois, 10000 FCFA pour 3 mois (économie de 1000 FCFA) et 30000 FCFA pour 12 mois (économie de 6000 FCFA)."
              },
              {
                question: "Quand mon compte vendeur sera-t-il activé ?",
                answer: "Votre compte vendeur est activé automatiquement dès confirmation du paiement via Moneroo, généralement dans les minutes qui suivent."
              },
              {
                question: "Puis-je utiliser mes propres moyens de paiement ?",
                answer: "Oui ! Vous pouvez intégrer Orange Money, MTN Money et d'autres passerelles de paiement directement dans votre boutique."
              },
              {
                question: "Comment optimiser ma visibilité ?",
                answer: "Utilisez des mots-clés pertinents, des photos de qualité, et engagez avec vos clients. Notre marketplace vous donne une visibilité gratuite 24h/24."
              }
            ].map((faq, index) => (
              <Card key={index}>
                <CardContent className="p-6">
                  <h3 className="font-semibold mb-3">{faq.question}</h3>
                  <p className="text-muted-foreground">{faq.answer}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* CTA Final */}
        <div className="text-center p-8 bg-gradient-to-r from-primary/5 to-primary/10 rounded-2xl">
          <h2 className="text-2xl font-bold mb-4">Prêt à Commencer ?</h2>
          <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
            Rejoignez notre communauté de vendeurs et commencez à vendre dès aujourd'hui.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button size="lg" asChild>
              <a href="/vendor-pricing">
                <Play className="h-4 w-4 mr-2" />
                Commencer Maintenant
              </a>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <a href="/vendor-support">
                Contacter le Support
              </a>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}