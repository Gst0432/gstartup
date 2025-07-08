import { useState } from 'react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Book, 
  FileText, 
  Code, 
  Download,
  Search,
  ExternalLink,
  ChevronRight,
  Star,
  Eye,
  Calendar,
  Tag,
  Zap,
  Shield,
  Database,
  Smartphone,
  Globe
} from 'lucide-react';

export default function Documentation() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = [
    { id: 'all', name: 'Tout', icon: Book },
    { id: 'web', name: 'Développement Web', icon: Globe },
    { id: 'mobile', name: 'Applications Mobile', icon: Smartphone },
    { id: 'database', name: 'Bases de Données', icon: Database },
    { id: 'security', name: 'Sécurité', icon: Shield },
    { id: 'api', name: 'API & Services', icon: Zap }
  ];

  const documentations = [
    {
      title: "Guide de Développement React",
      description: "Guide complet pour développer des applications React modernes avec TypeScript",
      category: "web",
      tags: ["React", "TypeScript", "Hooks"],
      lastUpdated: "2024-01-15",
      views: 1250,
      rating: 4.8,
      type: "guide",
      downloadUrl: "#",
      previewUrl: "#"
    },
    {
      title: "API Documentation G-STARTUP",
      description: "Documentation complète de nos APIs REST et GraphQL",
      category: "api",
      tags: ["REST", "GraphQL", "Authentication"],
      lastUpdated: "2024-01-10",
      views: 890,
      rating: 4.9,
      type: "api",
      downloadUrl: "#",
      previewUrl: "#"
    },
    {
      title: "Sécurité des Applications Web",
      description: "Best practices pour sécuriser vos applications web",
      category: "security",
      tags: ["HTTPS", "Authentication", "CSRF"],
      lastUpdated: "2024-01-08",
      views: 650,
      rating: 4.7,
      type: "tutorial",
      downloadUrl: "#",
      previewUrl: "#"
    },
    {
      title: "Développement Mobile avec React Native",
      description: "Créer des applications mobiles cross-platform performantes",
      category: "mobile",
      tags: ["React Native", "iOS", "Android"],
      lastUpdated: "2024-01-05",
      views: 980,
      rating: 4.6,
      type: "guide",
      downloadUrl: "#",
      previewUrl: "#"
    },
    {
      title: "Base de Données PostgreSQL",
      description: "Configuration et optimisation de PostgreSQL pour applications web",
      category: "database",
      tags: ["PostgreSQL", "Performance", "Backup"],
      lastUpdated: "2024-01-03",
      views: 420,
      rating: 4.5,
      type: "tutorial",
      downloadUrl: "#",
      previewUrl: "#"
    },
    {
      title: "Déploiement avec Docker",
      description: "Containerisation et déploiement d'applications avec Docker",
      category: "web",
      tags: ["Docker", "DevOps", "CI/CD"],
      lastUpdated: "2024-01-01",
      views: 750,
      rating: 4.8,
      type: "guide",
      downloadUrl: "#",
      previewUrl: "#"
    }
  ];

  const tools = [
    {
      name: "G-Starter Kit",
      description: "Template de démarrage pour projets React/Node.js",
      downloads: 2500,
      stars: 125,
      downloadUrl: "#"
    },
    {
      name: "API Boilerplate",
      description: "Boilerplate pour APIs REST avec authentification",
      downloads: 1800,
      stars: 89,
      downloadUrl: "#"
    },
    {
      name: "Mobile Components",
      description: "Bibliothèque de composants React Native",
      downloads: 950,
      stars: 67,
      downloadUrl: "#"
    }
  ];

  const filteredDocs = documentations.filter(doc => {
    const matchesSearch = doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory === 'all' || doc.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'guide': return Book;
      case 'tutorial': return FileText;
      case 'api': return Code;
      default: return FileText;
    }
  };

  const getTypeBadgeColor = (type: string) => {
    switch (type) {
      case 'guide': return 'bg-blue-100 text-blue-800';
      case 'tutorial': return 'bg-green-100 text-green-800';
      case 'api': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Section */}
      <section className="pt-24 pb-16 bg-gradient-to-br from-primary/5 via-primary/10 to-secondary/5">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <Badge variant="outline" className="mb-4">Documentation</Badge>
            <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-primary bg-clip-text text-transparent">
              Centre de Documentation
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              Guides, tutoriels et ressources pour développer avec nos technologies
            </p>
            
            {/* Search */}
            <div className="max-w-2xl mx-auto">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  placeholder="Rechercher dans la documentation..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-12 h-12 text-lg"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-8 border-b">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap gap-4 justify-center">
            {categories.map((category) => (
              <Button
                key={category.id}
                variant={selectedCategory === category.id ? "default" : "outline"}
                onClick={() => setSelectedCategory(category.id)}
                className="gap-2"
              >
                <category.icon className="h-4 w-4" />
                {category.name}
              </Button>
            ))}
          </div>
        </div>
      </section>

      {/* Quick Stats */}
      <section className="py-8 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{documentations.length}</div>
              <div className="text-sm text-muted-foreground">Documents</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{tools.length}</div>
              <div className="text-sm text-muted-foreground">Outils</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">15k+</div>
              <div className="text-sm text-muted-foreground">Téléchargements</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">500+</div>
              <div className="text-sm text-muted-foreground">Développeurs</div>
            </div>
          </div>
        </div>
      </section>

      {/* Documentation Grid */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold">Documentation</h2>
            <Badge variant="outline">{filteredDocs.length} documents</Badge>
          </div>
          
          <div className="grid lg:grid-cols-2 gap-8">
            {filteredDocs.map((doc, index) => {
              const TypeIcon = getTypeIcon(doc.type);
              return (
                <Card key={index} className="hover:shadow-elegant transition-all duration-300 border-2 hover:border-primary/20">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                          <TypeIcon className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <CardTitle className="text-lg mb-2">{doc.title}</CardTitle>
                          <p className="text-muted-foreground text-sm">{doc.description}</p>
                        </div>
                      </div>
                      <Badge className={getTypeBadgeColor(doc.type)}>
                        {doc.type}
                      </Badge>
                    </div>
                  </CardHeader>
                  
                  <CardContent>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {doc.tags.map((tag, idx) => (
                        <Badge key={idx} variant="outline" className="text-xs">
                          <Tag className="h-3 w-3 mr-1" />
                          {tag}
                        </Badge>
                      ))}
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {new Date(doc.lastUpdated).toLocaleDateString('fr-FR')}
                      </div>
                      <div className="flex items-center gap-1">
                        <Eye className="h-4 w-4" />
                        {doc.views.toLocaleString()}
                      </div>
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        {doc.rating}
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="flex-1">
                        <Eye className="h-4 w-4 mr-2" />
                        Aperçu
                      </Button>
                      <Button size="sm" className="flex-1">
                        <Download className="h-4 w-4 mr-2" />
                        Télécharger
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Tools & Resources */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Outils et Ressources</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Accélérez votre développement avec nos outils open source
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {tools.map((tool, index) => (
              <Card key={index} className="p-6 hover:shadow-elegant transition-all duration-300">
                <CardContent className="p-0">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold mb-2">{tool.name}</h3>
                      <p className="text-muted-foreground text-sm">{tool.description}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                    <div className="flex items-center gap-1">
                      <Download className="h-4 w-4" />
                      {tool.downloads.toLocaleString()}
                    </div>
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4" />
                      {tool.stars}
                    </div>
                  </div>
                  
                  <Button className="w-full gap-2">
                    <Download className="h-4 w-4" />
                    Télécharger
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Getting Started */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Commencer Rapidement</h2>
              <p className="text-muted-foreground text-lg">
                Suivez ces étapes pour démarrer votre premier projet
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  step: "01",
                  title: "Choisir une Technologie",
                  description: "Sélectionnez la stack technique adaptée à votre projet"
                },
                {
                  step: "02",
                  title: "Lire la Documentation",
                  description: "Consultez nos guides détaillés et exemples de code"
                },
                {
                  step: "03",
                  title: "Démarrer le Développement",
                  description: "Utilisez nos templates et outils pour accélérer"
                }
              ].map((step, index) => (
                <Card key={index} className="p-6 text-center">
                  <div className="w-12 h-12 bg-gradient-primary rounded-full flex items-center justify-center text-white font-bold text-lg mx-auto mb-4">
                    {step.step}
                  </div>
                  <h3 className="text-lg font-semibold mb-3">{step.title}</h3>
                  <p className="text-muted-foreground text-sm">{step.description}</p>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Support */}
      <section className="py-16 bg-gradient-to-br from-primary/5 to-secondary/5">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Besoin d'Aide ?
            </h2>
            <p className="text-xl text-muted-foreground mb-8">
              Notre équipe est là pour vous accompagner dans vos projets
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="gap-2">
                Contacter le Support
                <ExternalLink className="h-5 w-5" />
              </Button>
              <Button variant="outline" size="lg" className="gap-2">
                Rejoindre la Communauté
                <ChevronRight className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}