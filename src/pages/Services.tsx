import { useState } from 'react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  Code, 
  Smartphone, 
  Database, 
  Cloud, 
  Palette, 
  Shield,
  ArrowRight,
  CheckCircle,
  Star,
  Users,
  Clock,
  Target,
  Zap,
  Globe,
  Wrench,
  Package,
  Plug,
  Phone,
  AlertTriangle,
  Mail,
  Send
} from 'lucide-react';

export default function Services() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    service: '',
    message: ''
  });

  const handleSubmit = async (e: React.FormEvent, type: 'devis' | 'installation' | 'contact', serviceType?: string) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('send-contact-email', {
        body: {
          type,
          ...formData,
          service: serviceType || formData.service
        }
      });

      if (error) throw error;

      toast({
        title: "Message envoyé !",
        description: "Nous vous recontacterons dans les plus brefs délais.",
      });

      setFormData({
        name: '',
        email: '',
        phone: '',
        company: '',
        service: '',
        message: ''
      });
    } catch (error) {
      console.error('Error sending email:', error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue. Veuillez réessayer.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInstallationOrder = (serviceType: string) => {
    setFormData(prev => ({ ...prev, service: serviceType }));
    const formSection = document.getElementById('contact-form');
    if (formSection) {
      formSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const mainServices = [
    {
      title: "Développement Web",
      description: "Applications web modernes, responsive et performantes",
      icon: Code,
      features: [
        "Sites web responsives",
        "Applications web (SPA/PWA)",
        "E-commerce personnalisé",
        "CMS sur mesure",
        "API et services web"
      ],
      technologies: ["React", "Vue.js", "Node.js", "PHP", "Python"],
      price: "À partir de 500 000 FCFA"
    },
    {
      title: "Applications Mobile",
      description: "Apps natives et cross-platform pour iOS et Android",
      icon: Smartphone,
      features: [
        "Applications natives iOS/Android",
        "Applications cross-platform",
        "UI/UX Design mobile",
        "Intégration API",
        "Publication sur stores"
      ],
      technologies: ["React Native", "Flutter", "Swift", "Kotlin"],
      price: "À partir de 800 000 FCFA"
    },
    {
      title: "Solutions Cloud",
      description: "Infrastructure cloud sécurisée et évolutive",
      icon: Cloud,
      features: [
        "Migration vers le cloud",
        "Architecture microservices",
        "DevOps et CI/CD",
        "Hébergement managé",
        "Monitoring et support"
      ],
      technologies: ["AWS", "Google Cloud", "Azure", "Docker", "Kubernetes"],
      price: "À partir de 300 000 FCFA/mois"
    },
    {
      title: "Design UI/UX",
      description: "Interfaces utilisateur intuitives et attractives",
      icon: Palette,
      features: [
        "Recherche utilisateur",
        "Wireframing et prototypage",
        "Design d'interface",
        "Tests d'utilisabilité",
        "Système de design"
      ],
      technologies: ["Figma", "Adobe XD", "Sketch", "Principle"],
      price: "À partir de 200 000 FCFA"
    },
    {
      title: "Bases de Données",
      description: "Solutions de stockage et gestion de données",
      icon: Database,
      features: [
        "Architecture de base de données",
        "Optimisation des performances",
        "Sauvegarde et récupération",
        "Migration de données",
        "Analyse et reporting"
      ],
      technologies: ["PostgreSQL", "MySQL", "MongoDB", "Redis"],
      price: "À partir de 400 000 FCFA"
    },
    {
      title: "Cybersécurité",
      description: "Protection et sécurisation de vos systèmes",
      icon: Shield,
      features: [
        "Audit de sécurité",
        "Tests d'intrusion",
        "Chiffrement des données",
        "Authentification sécurisée",
        "Formation sécurité"
      ],
      technologies: ["SSL/TLS", "OAuth", "JWT", "Firewall"],
      price: "À partir de 600 000 FCFA"
    }
  ];

  const processSteps = [
    {
      step: "01",
      title: "Analyse & Planification",
      description: "Étude approfondie de vos besoins et définition de la stratégie"
    },
    {
      step: "02", 
      title: "Design & Prototypage",
      description: "Création des maquettes et validation du concept"
    },
    {
      step: "03",
      title: "Développement",
      description: "Implémentation avec les meilleures pratiques"
    },
    {
      step: "04",
      title: "Tests & Déploiement",
      description: "Tests rigoureux et mise en production"
    },
    {
      step: "05",
      title: "Maintenance & Support",
      description: "Suivi continu et évolutions"
    }
  ];

  const advantages = [
    {
      icon: Users,
      title: "Équipe Experte",
      description: "Développeurs seniors avec plus de 5 ans d'expérience"
    },
    {
      icon: Clock,
      title: "Livraison Rapide",
      description: "Respect des délais avec méthodologie agile"
    },
    {
      icon: Target,
      title: "Solutions Sur Mesure",
      description: "Développement adapté à vos besoins spécifiques"
    },
    {
      icon: Shield,
      title: "Sécurité Garantie",
      description: "Respect des standards de sécurité internationaux"
    },
    {
      icon: Zap,
      title: "Performance Optimale",
      description: "Applications rapides et optimisées"
    },
    {
      icon: Globe,
      title: "Support 24/7",
      description: "Assistance technique disponible en permanence"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Section */}
      <section className="pt-24 pb-16 bg-gradient-to-br from-primary/5 via-primary/10 to-secondary/5">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <Badge variant="outline" className="mb-4">Nos Services</Badge>
            <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-primary bg-clip-text text-transparent">
              Solutions Digitales Complètes
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              De la conception au déploiement, nous transformons vos idées en solutions technologiques performantes
            </p>
            <Button size="lg" className="gap-2" onClick={() => document.getElementById('installation-services')?.scrollIntoView({ behavior: 'smooth' })}>
              Voir Nos Tarifs d'Installation
              <ArrowRight className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </section>

      {/* Installation Services Pricing - MOVED TO FIRST POSITION */}
      <section id="installation-services" className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <Badge variant="outline" className="mb-4">🔥 Tarifs Spéciaux</Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">SERVICES D'INSTALLATION</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Services professionnels d'installation et de configuration de vos scripts
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Installation Standard */}
            <Card className="relative overflow-hidden hover:shadow-elegant transition-all duration-300 border-2 hover:border-primary/20">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-primary"></div>
              <CardHeader className="text-center pb-4">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-4 mx-auto">
                  <Wrench className="h-8 w-8 text-primary" />
                </div>
                <CardTitle className="text-xl mb-2">1. Installation Standard</CardTitle>
                <p className="text-muted-foreground text-sm">
                  Installation basique du script sur votre hébergeur
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-sm">Installation du script sur l'hébergeur uniquement</span>
                  </div>
                </div>
                
                <div className="pt-4 border-t">
                  <div className="flex items-center justify-center gap-2 mb-4">
                    <Package className="h-5 w-5 text-primary" />
                    <span className="text-2xl font-bold text-primary">15.000 FCFA</span>
                  </div>
                  <Button 
                    className="w-full" 
                    onClick={() => handleInstallationOrder("Installation Standard - 15.000 FCFA")}
                  >
                    Commander
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Installation Complète */}
            <Card className="relative overflow-hidden hover:shadow-elegant transition-all duration-300 border-2 border-primary shadow-lg scale-105">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-primary"></div>
              <Badge className="absolute top-4 right-4 bg-primary text-primary-foreground">
                Populaire
              </Badge>
              <CardHeader className="text-center pb-4">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-primary rounded-full mb-4 mx-auto">
                  <Package className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-xl mb-2">2. Installation Complète + Personnalisation</CardTitle>
                <p className="text-muted-foreground text-sm">
                  Installation avec personnalisation et configuration
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-sm">Installation du script sur l'hébergeur</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-sm">Personnalisation des images et textes</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-sm">Réglage des API (clés API fournies par le client)</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-sm">Configuration du service SMTP</span>
                  </div>
                </div>

                <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="h-4 w-4 text-orange-500 flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-orange-700">
                      Le client doit fournir tous les éléments nécessaires (API, images, textes).
                    </p>
                  </div>
                </div>
                
                <div className="pt-4 border-t">
                  <div className="flex items-center justify-center gap-2 mb-4">
                    <Package className="h-5 w-5 text-primary" />
                    <span className="text-2xl font-bold text-primary">25.000 FCFA</span>
                  </div>
                  <Button 
                    className="w-full"
                    onClick={() => handleInstallationOrder("Installation Complète + Personnalisation - 25.000 FCFA")}
                  >
                    Commander
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Intégration Avancée */}
            <Card className="relative overflow-hidden hover:shadow-elegant transition-all duration-300 border-2 hover:border-primary/20">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-primary"></div>
              <CardHeader className="text-center pb-4">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-4 mx-auto">
                  <Plug className="h-8 w-8 text-primary" />
                </div>
                <CardTitle className="text-xl mb-2">3. Connexion Backend & Intégration</CardTitle>
                <p className="text-muted-foreground text-sm">
                  Développement sur mesure selon vos besoins
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-sm">Connexion Backend personnalisée</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-sm">Refonte selon vos spécifications</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-sm">Intégration API tierce</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-sm">Étude spécifique du projet</span>
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <p className="text-xs text-blue-700 text-center">
                    Ce type de prestation nécessite une étude spécifique du projet.
                  </p>
                </div>
                
                <div className="pt-4 border-t">
                  <div className="flex items-center justify-center gap-2 mb-4">
                    <Phone className="h-5 w-5 text-primary" />
                    <span className="text-lg font-bold text-primary">À discuter selon la complexité</span>
                  </div>
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => handleInstallationOrder("Connexion Backend & Intégration - Devis personnalisé")}
                  >
                    Demander un Devis
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Main Services */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Nos Services Principaux</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Des solutions technologiques adaptées à tous vos besoins digitaux
            </p>
          </div>
          
          <div className="grid lg:grid-cols-2 gap-8">
            {mainServices.map((service, index) => (
              <Card key={index} className="p-6 hover:shadow-elegant transition-all duration-300 border-2 hover:border-primary/20">
                <CardHeader className="p-0 mb-6">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-12 h-12 bg-gradient-primary rounded-lg flex items-center justify-center">
                      <service.icon className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-xl mb-2">{service.title}</CardTitle>
                      <p className="text-muted-foreground">{service.description}</p>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="p-0">
                  <div className="mb-6">
                    <h4 className="font-semibold mb-3">Fonctionnalités incluses :</h4>
                    <ul className="space-y-2">
                      {service.features.map((feature, idx) => (
                        <li key={idx} className="flex items-center gap-2 text-sm">
                          <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div className="mb-6">
                    <h4 className="font-semibold mb-3">Technologies :</h4>
                    <div className="flex flex-wrap gap-2">
                      {service.technologies.map((tech, idx) => (
                        <Badge key={idx} variant="secondary" className="text-xs">
                          {tech}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="text-lg font-bold text-primary">
                      {service.price}
                    </div>
                    <Button variant="outline">
                      Devis Gratuit
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Process */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Notre Processus</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Une méthode éprouvée pour garantir le succès de vos projets
            </p>
          </div>
          
          <div className="max-w-4xl mx-auto">
            <div className="grid md:grid-cols-5 gap-8">
              {processSteps.map((step, index) => (
                <div key={index} className="text-center">
                  <div className="relative mb-6">
                    <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center text-white font-bold text-lg mx-auto">
                      {step.step}
                    </div>
                    {index < processSteps.length - 1 && (
                      <div className="hidden md:block absolute top-8 left-full w-full h-0.5 bg-gradient-primary/30 -translate-y-1/2"></div>
                    )}
                  </div>
                  <h3 className="font-semibold mb-2">{step.title}</h3>
                  <p className="text-sm text-muted-foreground">{step.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Advantages */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Pourquoi Nous Choisir ?</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Les avantages qui font la différence
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {advantages.map((advantage, index) => (
              <Card key={index} className="p-6 text-center hover:shadow-elegant transition-all duration-300">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-4">
                  <advantage.icon className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-3">{advantage.title}</h3>
                <p className="text-muted-foreground">{advantage.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Form */}
      <section id="contact-form" className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <Badge variant="outline" className="mb-4">Contact</Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Formulaire de Contact</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Remplissez le formulaire ci-dessous pour nous contacter
            </p>
          </div>

          <div className="max-w-2xl mx-auto">
            <Card className="p-8">
              <form onSubmit={(e) => handleSubmit(e, 'contact')} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Nom complet *</label>
                    <Input
                      required
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Votre nom"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Email *</label>
                    <Input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                      placeholder="votre@email.com"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Téléphone</label>
                    <Input
                      value={formData.phone}
                      onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                      placeholder="+221 XX XXX XX XX"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Entreprise</label>
                    <Input
                      value={formData.company}
                      onChange={(e) => setFormData(prev => ({ ...prev, company: e.target.value }))}
                      placeholder="Nom de votre entreprise"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Service demandé</label>
                  <Input
                    value={formData.service}
                    onChange={(e) => setFormData(prev => ({ ...prev, service: e.target.value }))}
                    placeholder="Quel service vous intéresse ?"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Message *</label>
                  <Textarea
                    required
                    rows={5}
                    value={formData.message}
                    onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                    placeholder="Décrivez votre projet ou votre besoin..."
                  />
                </div>

                <Button type="submit" disabled={loading} className="w-full gap-2">
                  {loading ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                  {loading ? 'Envoi en cours...' : 'Envoyer le message'}
                </Button>
              </form>
            </Card>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 bg-gradient-to-br from-primary/5 to-secondary/5">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Ce Que Disent Nos Clients</h2>
            <p className="text-muted-foreground text-lg">
              Témoignages de satisfaction
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {[
              {
                name: "Marie Dubois",
                company: "TechStart SARL",
                content: "Excellente collaboration ! L'équipe a livré notre application mobile dans les délais avec une qualité exceptionnelle.",
                rating: 5
              },
              {
                name: "Jean-Claude Kamga", 
                company: "Commerce Plus",
                content: "Notre site e-commerce a transformé notre business. +300% de ventes en ligne en 6 mois !",
                rating: 5
              },
              {
                name: "Fatou Ndiaye",
                company: "EduTech Africa",
                content: "Support technique réactif et solutions innovantes. Nous recommandons vivement G-STARTUP LTD.",
                rating: 5
              }
            ].map((testimonial, index) => (
              <Card key={index} className="p-6 bg-background/80 backdrop-blur">
                <CardContent className="p-0">
                  <div className="flex items-center gap-1 mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <p className="text-muted-foreground mb-4 italic">
                    "{testimonial.content}"
                  </p>
                  <div>
                    <div className="font-semibold">{testimonial.name}</div>
                    <div className="text-sm text-muted-foreground">{testimonial.company}</div>
                  </div>
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
              Prêt à Démarrer Votre Projet ?
            </h2>
            <p className="text-xl text-muted-foreground mb-8">
              Contactez-nous pour un devis gratuit et personnalisé
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="gap-2" onClick={() => document.getElementById('contact-form')?.scrollIntoView({ behavior: 'smooth' })}>
                Demander un Devis
                <ArrowRight className="h-5 w-5" />
              </Button>
              <Button variant="outline" size="lg">
                Voir le Portfolio
              </Button>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}