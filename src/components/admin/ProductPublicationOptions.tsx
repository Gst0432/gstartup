import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { ProductFormData } from '@/hooks/useProductForm';

interface ProductPublicationOptionsProps {
  formData: ProductFormData;
  onInputChange: (field: string, value: any) => void;
}

export function ProductPublicationOptions({ formData, onInputChange }: ProductPublicationOptionsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Options de Publication</CardTitle>
        <CardDescription>
          Paramètres de visibilité et statut du produit
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid md:grid-cols-2 gap-4">
          <div className="flex items-center space-x-2">
            <Switch
              id="is_active"
              checked={formData.is_active}
              onCheckedChange={(checked) => onInputChange('is_active', checked)}
            />
            <Label htmlFor="is_active">Produit actif</Label>
          </div>
          
          <div className="flex items-center space-x-2">
            <Switch
              id="is_featured"
              checked={formData.is_featured}
              onCheckedChange={(checked) => onInputChange('is_featured', checked)}
            />
            <Label htmlFor="is_featured">Produit mis en avant</Label>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}