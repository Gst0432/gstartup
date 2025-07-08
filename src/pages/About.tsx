import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Target, 
  Eye, 
  Users, 
  Globe, 
  Award, 
  TrendingUp,
  Code,
  Smartphone,
  Database,
  Shield,
  CheckCircle,
  ArrowRight
} from 'lucide-react';

export default function About() {
  const stats = [
    { label: "Projets Réalisés", value: "500+", icon: CheckCircle },
    { label: "Clients Satisfaits", value: "200+", icon: Users },
    { label: "Années d'Expérience", value: "5+", icon: Award },
    { label: "Pays Desservis", value: "10+", icon: Globe }
  ];

  const values = [
    {
      title: "Innovation",
      description: "Nous adoptons les dernières technologies pour créer des solutions avant-gardistes.",
      icon: TrendingUp
    },
    {
      title: "Excellence",
      description: "Nous visons l'excellence dans chaque projet que nous entreprenons.",
      icon: Award
    },
    {
      title: "Collaboration",
      description: "Nous travaillons en étroite collaboration avec nos clients pour atteindre leurs objectifs.",
      icon: Users
    },
    {
      title: "Intégrité",
      description: "Nous agissons avec transparence et honnêteté dans toutes nos relations.",
      icon: Shield
    }
  ];

  const services = [
    {
      title: "Développement Web",
      description: "Applications web modernes et responsive",
      icon: Code
    },
    {
      title: "Applications Mobile",
      description: "Apps iOS et Android natives et cross-platform",
      icon: Smartphone
    },
    {
      title: "Solutions Cloud",
      description: "Infrastructure cloud et services d'hébergement",
      icon: Database
    },
    {
      title: "Consulting Digital",
      description: "Stratégie et transformation digitale",
      icon: Target
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Section */}
      <section className="pt-24 pb-16 bg-gradient-to-br from-primary/5 via-primary/10 to-secondary/5">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <Badge variant="outline" className="mb-4">À Propos de Nous</Badge>
            <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-primary bg-clip-text text-transparent">
              G-STARTUP LTD
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              Votre partenaire technologique pour la transformation digitale et l'innovation
            </p>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 max-w-6xl mx-auto">
            <Card className="p-8 border-2 border-primary/20">
              <div className="flex items-center gap-3 mb-6">
                <Target className="h-8 w-8 text-primary" />
                <h2 className="text-3xl font-bold">Notre Mission</h2>
              </div>
              <p className="text-muted-foreground text-lg leading-relaxed">
                Accompagner les entreprises dans leur transformation digitale en créant des solutions 
                technologiques innovantes qui stimulent la croissance et améliorent l'efficacité opérationnelle. 
                Nous croyons que la technologie doit être accessible à tous.
              </p>
            </Card>

            <Card className="p-8 border-2 border-secondary/20">
              <div className="flex items-center gap-3 mb-6">
                <Eye className="h-8 w-8 text-secondary" />
                <h2 className="text-3xl font-bold">Notre Vision</h2>
              </div>
              <p className="text-muted-foreground text-lg leading-relaxed">
                Devenir le leader de l'innovation technologique en Afrique, en créant un écosystème 
                numérique qui connecte les entreprises, favorise l'entrepreneuriat et contribue au 
                développement économique du continent.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Nos Chiffres Clés</h2>
            <p className="text-muted-foreground text-lg">
              Des résultats qui parlent d'eux-mêmes
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-4">
                  <stat.icon className="h-8 w-8 text-primary" />
                </div>
                <div className="text-3xl font-bold text-primary mb-2">{stat.value}</div>
                <div className="text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Nos Valeurs</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Les principes qui guident nos actions et façonnent notre culture d'entreprise
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <Card key={index} className="p-6 text-center hover:shadow-elegant transition-all duration-300">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-primary rounded-full mb-4">
                  <value.icon className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-3">{value.title}</h3>
                <p className="text-muted-foreground">{value.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Services Overview */}
      <section className="py-16 bg-gradient-to-br from-primary/5 to-secondary/5">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Nos Domaines d'Expertise</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Des solutions complètes pour tous vos besoins technologiques
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {services.map((service, index) => (
              <Card key={index} className="p-6 text-center bg-background/80 backdrop-blur hover:shadow-elegant transition-all duration-300">
                <CardContent className="p-0">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-4">
                    <service.icon className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold mb-3">{service.title}</h3>
                  <p className="text-muted-foreground text-sm">{service.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Prêt à Transformer Votre Vision en Réalité ?
            </h2>
            <p className="text-xl text-muted-foreground mb-8">
              Rejoignez les centaines d'entreprises qui nous font confiance pour leurs projets digitaux
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="gap-2">
                Démarrer un Projet
                <ArrowRight className="h-5 w-5" />
              </Button>
              <Button variant="outline" size="lg">
                Nous Contacter
              </Button>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}