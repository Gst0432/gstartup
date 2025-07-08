import { useState } from 'react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  MapPin, 
  Phone, 
  Mail, 
  Clock,
  Send,
  MessageSquare,
  Users,
  Globe
} from 'lucide-react';

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission
    console.log('Form submitted:', formData);
  };

  const contactInfo = [
    {
      icon: MapPin,
      title: "Adresse",
      details: ["Douala, Cameroun", "Yaoundé, Cameroun"]
    },
    {
      icon: Phone,
      title: "Téléphone",
      details: ["+237 6XX XXX XXX", "+237 6YY YYY YYY"]
    },
    {
      icon: Mail,
      title: "Email",
      details: ["contact@gstartup.pro", "support@gstartup.pro"]
    },
    {
      icon: Clock,
      title: "Horaires",
      details: ["Lun-Ven: 8h-18h", "Sam: 9h-13h"]
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Section */}
      <section className="pt-24 pb-16 bg-gradient-to-br from-primary/5 via-primary/10 to-secondary/5">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <Badge variant="outline" className="mb-4">Contact</Badge>
            <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-primary bg-clip-text text-transparent">
              Parlons de Votre Projet
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              Notre équipe est prête à transformer vos idées en réalité digitale
            </p>
          </div>
        </div>
      </section>

      {/* Contact Info */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 mb-16">
            {contactInfo.map((info, index) => (
              <Card key={index} className="p-6 text-center hover:shadow-elegant transition-all duration-300">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-4">
                  <info.icon className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-3">{info.title}</h3>
                {info.details.map((detail, idx) => (
                  <p key={idx} className="text-muted-foreground text-sm">
                    {detail}
                  </p>
                ))}
              </Card>
            ))}
          </div>

          {/* Contact Form */}
          <div className="grid lg:grid-cols-2 gap-12">
            <Card className="p-8">
              <h2 className="text-2xl font-bold mb-6">Envoyez-nous un Message</h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Input
                      placeholder="Votre nom"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      required
                    />
                  </div>
                  <div>
                    <Input
                      type="email"
                      placeholder="Votre email"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      required
                    />
                  </div>
                </div>
                <Input
                  placeholder="Sujet"
                  value={formData.subject}
                  onChange={(e) => setFormData({...formData, subject: e.target.value})}
                  required
                />
                <Textarea
                  placeholder="Votre message..."
                  rows={6}
                  value={formData.message}
                  onChange={(e) => setFormData({...formData, message: e.target.value})}
                  required
                />
                <Button type="submit" size="lg" className="w-full gap-2">
                  <Send className="h-5 w-5" />
                  Envoyer le Message
                </Button>
              </form>
            </Card>

            <div className="space-y-8">
              <Card className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <MessageSquare className="h-6 w-6 text-primary" />
                  <h3 className="text-xl font-semibold">Discutons de Votre Projet</h3>
                </div>
                <p className="text-muted-foreground mb-4">
                  Nous offrons des consultations gratuites pour analyser vos besoins et proposer la meilleure solution.
                </p>
                <Button variant="outline">Planifier un Appel</Button>
              </Card>

              <Card className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Users className="h-6 w-6 text-primary" />
                  <h3 className="text-xl font-semibold">Support Client</h3>
                </div>
                <p className="text-muted-foreground mb-4">
                  Notre équipe support est disponible pour vous aider avec vos questions techniques.
                </p>
                <Button variant="outline">Centre d'Aide</Button>
              </Card>

              <Card className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Globe className="h-6 w-6 text-primary" />
                  <h3 className="text-xl font-semibold">Réseaux Sociaux</h3>
                </div>
                <p className="text-muted-foreground mb-4">
                  Suivez-nous pour les dernières actualités et conseils tech.
                </p>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">LinkedIn</Button>
                  <Button variant="outline" size="sm">Twitter</Button>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}