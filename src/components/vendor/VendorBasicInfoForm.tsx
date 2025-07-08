import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { MapPin, Phone, Globe } from 'lucide-react';

interface VendorBasicInfoFormProps {
  formData: {
    business_name: string;
    description: string;
    address: string;
    phone: string;
    website_url: string;
  };
  onInputChange: (field: string, value: string) => void;
}

export function VendorBasicInfoForm({ formData, onInputChange }: VendorBasicInfoFormProps) {
  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Informations de la Boutique</CardTitle>
          <CardDescription>
            Informations publiques de votre boutique
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="business_name">Nom de la boutique *</Label>
            <Input
              id="business_name"
              value={formData.business_name}
              onChange={(e) => onInputChange('business_name', e.target.value)}
              placeholder="Ex: Ma Super Boutique"
              required
            />
          </div>
          
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => onInputChange('description', e.target.value)}
              rows={4}
              placeholder="Décrivez votre boutique, vos produits et ce qui vous rend unique..."
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Coordonnées</CardTitle>
          <CardDescription>
            Informations de contact pour vos clients
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="address" className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Adresse
            </Label>
            <Input
              id="address"
              value={formData.address}
              onChange={(e) => onInputChange('address', e.target.value)}
              placeholder="Votre adresse complète"
            />
          </div>
          
          <div>
            <Label htmlFor="phone" className="flex items-center gap-2">
              <Phone className="h-4 w-4" />
              Téléphone
            </Label>
            <Input
              id="phone"
              value={formData.phone}
              onChange={(e) => onInputChange('phone', e.target.value)}
              placeholder="+237 6XX XXX XXX"
            />
          </div>
          
          <div>
            <Label htmlFor="website_url" className="flex items-center gap-2">
              <Globe className="h-4 w-4" />
              Site web
            </Label>
            <Input
              id="website_url"
              value={formData.website_url}
              onChange={(e) => onInputChange('website_url', e.target.value)}
              placeholder="https://votre-site.com"
            />
          </div>
        </CardContent>
      </Card>
    </>
  );
}