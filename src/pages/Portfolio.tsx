import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Globe, 
  ExternalLink, 
  TrendingUp,
  CreditCard,
  Camera,
  Send,
  DollarSign,
  GraduationCap,
  Plane,
  ArrowRight
} from 'lucide-react';

interface Project {
  name: string;
  url: string;
  description: string;
  category: string;
  icon: any;
  color: string;
}

export default function Portfolio() {
  const projects: Project[] = [
    {
      name: 'G-Finances',
      url: 'https://gfinances.pro',
      description: 'Solution complète de gestion financière et comptable pour les entreprises africaines',
      category: 'Finance',
      icon: TrendingUp,
      color: 'bg-blue-500'
    },
    {
      name: 'G-Money',
      url: 'https://gsmoney.pro',
      description: 'Plateforme de transfert d\'argent et paiements mobiles sécurisée',
      category: 'Paiement',
      icon: CreditCard,
      color: 'bg-green-500'
    },
    {
      name: 'IziWap',
      url: 'https://iziwap.com',
      description: 'Portail de services numériques et solutions web innovantes',
      category: 'Services',
      icon: Globe,
      color: 'bg-purple-500'
    },
    {
      name: 'G-Boost',
      url: 'https://gboost.click',
      description: 'Plateforme d\'accélération digitale pour entrepreneurs et startups',
      category: 'Business',
      icon: TrendingUp,
      color: 'bg-orange-500'
    },
    {
      name: 'G-Photo',
      url: 'https://gphoto.pro',
      description: 'Studio de photographie professionnelle et services visuels créatifs',
      category: 'Créatif',
      icon: Camera,
      color: 'bg-pink-500'
    },
    {
      name: 'G-Transfert',
      url: 'https://gtransfert.pro',
      description: 'Service de transfert de fichiers rapide et sécurisé',
      category: 'Technologie',
      icon: Send,
      color: 'bg-indigo-500'
    },
    {
      name: 'Money G-Startup',
      url: 'https://money.gstartup.pro',
      description: 'Solutions de financement et d\'investissement pour startups',
      category: 'Finance',
      icon: DollarSign,
      color: 'bg-emerald-500'
    },
    {
      name: 'Mastery Africa',
      url: 'https://masteryafrica.pro',
      description: 'Plateforme de formation et développement des compétences en Afrique',
      category: 'Éducation',
      icon: GraduationCap,
      color: 'bg-yellow-500'
    },
    {
      name: 'Easy ROP Visa',
      url: 'https://easyropvisa.com',
      description: 'Service simplifié pour les demandes de visa et formalités administratives',
      category: 'Services',
      icon: Plane,
      color: 'bg-red-500'
    }
  ];

  const categories = [...new Set(projects.map(p => p.category))];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/50 to-primary/5">
      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-16 animate-fade-in">
          <Badge variant="outline" className="mb-4">
            <Globe className="h-3 w-3 mr-1" />
            Portfolio Digital
          </Badge>
          <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
            Nos Réalisations
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Découvrez notre écosystème de solutions digitales innovantes 
            développées pour répondre aux besoins du marché africain.
          </p>
        </div>

        {/* Categories */}
        <div className="flex flex-wrap justify-center gap-4 mb-12">
          {categories.map((category, index) => (
            <Badge 
              key={category} 
              variant="secondary" 
              className="px-4 py-2 animate-fade-in"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {category}
            </Badge>
          ))}
        </div>

        {/* Projects Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {projects.map((project, index) => {
            const IconComponent = project.icon;
            return (
              <Card 
                key={project.name} 
                className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-2 animate-fade-in"
                style={{ animationDelay: `${index * 150}ms` }}
              >
                <CardHeader>
                  <div className="flex items-center justify-between mb-2">
                    <div className={`w-12 h-12 rounded-lg ${project.color} flex items-center justify-center transition-transform group-hover:scale-110`}>
                      <IconComponent className="h-6 w-6 text-white" />
                    </div>
                    <Badge variant="outline">{project.category}</Badge>
                  </div>
                  <CardTitle className="text-xl group-hover:text-primary transition-colors">
                    {project.name}
                  </CardTitle>
                  <CardDescription className="text-sm leading-relaxed">
                    {project.description}
                  </CardDescription>
                </CardHeader>
                
                <CardContent>
                  <Button 
                    asChild 
                    className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300"
                    variant="outline"
                  >
                    <a 
                      href={project.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2"
                    >
                      Visiter le site
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </a>
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Stats Section */}
        <div className="mt-20 grid md:grid-cols-3 gap-8 text-center">
          <div className="animate-fade-in" style={{ animationDelay: '600ms' }}>
            <div className="text-4xl font-bold text-primary mb-2">{projects.length}</div>
            <div className="text-muted-foreground">Projets Réalisés</div>
          </div>
          <div className="animate-fade-in" style={{ animationDelay: '700ms' }}>
            <div className="text-4xl font-bold text-primary mb-2">{categories.length}</div>
            <div className="text-muted-foreground">Secteurs d'Activité</div>
          </div>
          <div className="animate-fade-in" style={{ animationDelay: '800ms' }}>
            <div className="text-4xl font-bold text-primary mb-2">100%</div>
            <div className="text-muted-foreground">Solutions Innovantes</div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-20 text-center animate-fade-in" style={{ animationDelay: '900ms' }}>
          <Card className="max-w-2xl mx-auto bg-gradient-to-r from-primary/5 to-primary/10">
            <CardContent className="p-8">
              <h2 className="text-2xl font-bold mb-4">Une Idée de Projet ?</h2>
              <p className="text-muted-foreground mb-6">
                Contactez-nous pour discuter de votre prochaine solution digitale
              </p>
              <Button size="lg" asChild>
                <a href="/services">
                  Démarrer un Projet
                  <ArrowRight className="h-4 w-4 ml-2" />
                </a>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}