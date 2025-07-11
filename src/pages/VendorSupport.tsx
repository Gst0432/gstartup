import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { 
  HelpCircle, 
  MessageSquare, 
  Phone, 
  Mail, 
  Clock, 
  CheckCircle,
  AlertCircle,
  BookOpen,
  Video,
  Download,
  FileText,
  Loader2
} from 'lucide-react';

interface SupportTicket {
  subject: string;
  category: string;
  priority: string;
  message: string;
}

export default function VendorSupport() {
  const [ticket, setTicket] = useState<SupportTicket>({
    subject: '',
    category: '',
    priority: 'medium',
    message: ''
  });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { user, profile } = useAuth();

  const handleSubmitTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: "Connexion requise",
        description: "Veuillez vous connecter pour créer un ticket de support",
        variant: "destructive"
      });
      return;
    }

    if (!ticket.subject || !ticket.category || !ticket.message) {
      toast({
        title: "Informations manquantes",
        description: "Veuillez remplir tous les champs obligatoires",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('send-contact-email', {
        body: {
          type: 'support',
          name: profile?.display_name || user.email,
          email: user.email,
          phone: profile?.phone || '',
          subject: ticket.subject,
          message: ticket.message,
          metadata: {
            category: ticket.category,
            priority: ticket.priority,
            user_role: profile?.role || 'customer',
            support_type: 'vendor_support'
          }
        }
      });

      if (error) {
        throw new Error(error.message);
      }

      toast({
        title: "Ticket créé avec succès",
        description: "Nous vous répondrons dans les plus brefs délais",
      });

      // Reset form
      setTicket({
        subject: '',
        category: '',
        priority: 'medium',
        message: ''
      });

    } catch (error) {
      console.error('Support ticket error:', error);
      toast({
        title: "Erreur",
        description: "Impossible d'envoyer votre demande. Réessayez plus tard.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const supportCategories = [
    { value: 'technical', label: 'Problème technique' },
    { value: 'account', label: 'Gestion de compte' },
    { value: 'payments', label: 'Paiements et facturation' },
    { value: 'products', label: 'Gestion des produits' },
    { value: 'orders', label: 'Commandes et livraisons' },
    { value: 'marketing', label: 'Marketing et promotion' },
    { value: 'other', label: 'Autre' }
  ];

  const resources = [
    {
      title: "Guide du vendeur",
      description: "Guide complet pour démarrer votre activité",
      icon: BookOpen,
      link: "/vendor-guide",
      type: "Guide"
    },
    {
      title: "Tutoriels vidéo",
      description: "Apprenez en regardant nos tutoriels",
      icon: Video,
      link: "#",
      type: "Vidéo"
    },
    {
      title: "FAQ Vendeurs",
      description: "Réponses aux questions les plus fréquentes",
      icon: HelpCircle,
      link: "#",
      type: "FAQ"
    },
    {
      title: "Documentation API",
      description: "Intégrez vos propres outils",
      icon: FileText,
      link: "#",
      type: "API"
    }
  ];

  const contactMethods = [
    {
      icon: Mail,
      title: "Email",
      description: "contact@gstartup.pro",
      response: "Réponse sous 24h",
      available: true
    },
    {
      icon: Phone,
      title: "Téléphone",
      description: "+22770138031",
      response: "Lun-Ven 9h-17h",
      available: true
    },
    {
      icon: MessageSquare,
      title: "Chat en direct",
      description: "Support instantané",
      response: "Bientôt disponible",
      available: false
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/50 to-primary/5">
      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <Badge variant="outline" className="mb-4">
            <HelpCircle className="h-3 w-3 mr-1" />
            Support Vendeurs
          </Badge>
          <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
            Centre de Support
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Nous sommes là pour vous aider à réussir. Trouvez des réponses ou contactez notre équipe.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Formulaire de support */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  Créer un Ticket de Support
                </CardTitle>
                <CardDescription>
                  Décrivez votre problème et nous vous aiderons rapidement
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmitTicket} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="subject">Sujet *</Label>
                      <Input
                        id="subject"
                        value={ticket.subject}
                        onChange={(e) => setTicket({...ticket, subject: e.target.value})}
                        placeholder="Résumé de votre problème"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="category">Catégorie *</Label>
                      <Select 
                        value={ticket.category} 
                        onValueChange={(value) => setTicket({...ticket, category: value})}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner une catégorie" />
                        </SelectTrigger>
                        <SelectContent>
                          {supportCategories.map((cat) => (
                            <SelectItem key={cat.value} value={cat.value}>
                              {cat.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="priority">Priorité</Label>
                    <Select 
                      value={ticket.priority} 
                      onValueChange={(value) => setTicket({...ticket, priority: value})}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Faible</SelectItem>
                        <SelectItem value="medium">Moyenne</SelectItem>
                        <SelectItem value="high">Élevée</SelectItem>
                        <SelectItem value="urgent">Urgente</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="message">Description détaillée *</Label>
                    <Textarea
                      id="message"
                      value={ticket.message}
                      onChange={(e) => setTicket({...ticket, message: e.target.value})}
                      placeholder="Décrivez votre problème en détail..."
                      rows={6}
                      required
                    />
                  </div>

                  <Button type="submit" disabled={loading} className="w-full" size="lg">
                    {loading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Envoi en cours...
                      </>
                    ) : (
                      <>
                        <MessageSquare className="h-4 w-4 mr-2" />
                        Créer le Ticket
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Méthodes de contact */}
            <Card>
              <CardHeader>
                <CardTitle>Nous Contacter</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {contactMethods.map((method, index) => {
                  const IconComponent = method.icon;
                  return (
                    <div key={index} className="flex items-start gap-3 p-3 rounded-lg border">
                      <IconComponent className={`h-5 w-5 mt-0.5 ${
                        method.available ? 'text-primary' : 'text-muted-foreground'
                      }`} />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium">{method.title}</h4>
                          {!method.available && (
                            <Badge variant="secondary" className="text-xs">
                              Bientôt
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">{method.description}</p>
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {method.response}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>

            {/* Temps de réponse */}
            <Card>
              <CardHeader>
                <CardTitle>Temps de Réponse</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm">Urgente: &lt; 2h</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-blue-500" />
                  <span className="text-sm">Élevée: &lt; 8h</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-yellow-500" />
                  <span className="text-sm">Moyenne: &lt; 24h</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-gray-500" />
                  <span className="text-sm">Faible: &lt; 48h</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Ressources d'aide */}
        <div className="mt-16">
          <h2 className="text-3xl font-bold text-center mb-12">Ressources d'Aide</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {resources.map((resource, index) => {
              const IconComponent = resource.icon;
              return (
                <Card key={index} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6 text-center">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                      <IconComponent className="h-6 w-6 text-primary" />
                    </div>
                    <Badge variant="secondary" className="mb-2">
                      {resource.type}
                    </Badge>
                    <h3 className="font-semibold mb-2">{resource.title}</h3>
                    <p className="text-sm text-muted-foreground mb-4">{resource.description}</p>
                    <Button variant="outline" size="sm" asChild className="w-full">
                      <a href={resource.link}>
                        Consulter
                      </a>
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Statut système */}
        <div className="mt-16 text-center">
          <Card className="max-w-md mx-auto">
            <CardContent className="p-6">
              <div className="flex items-center justify-center gap-2 mb-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="font-medium">Tous les systèmes opérationnels</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Dernière mise à jour: {new Date().toLocaleString('fr-FR')}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}