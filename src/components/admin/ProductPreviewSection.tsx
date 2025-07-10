import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Eye, Monitor } from 'lucide-react';
import { ProductFormData } from '@/hooks/useProductForm';

interface ProductPreviewSectionProps {
  formData: ProductFormData;
  onInputChange: (field: string, value: any) => void;
}

export function ProductPreviewSection({ formData, onInputChange }: ProductPreviewSectionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Eye className="h-5 w-5" />
          Prévisualisation & Démo
        </CardTitle>
        <CardDescription>
          URLs pour la prévisualisation et démo du produit
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="preview_url" className="flex items-center gap-2">
            <Eye className="h-4 w-4" />
            URL de Prévisualisation
          </Label>
          <Input
            id="preview_url"
            value={formData.preview_url}
            onChange={(e) => onInputChange('preview_url', e.target.value)}
            placeholder="https://preview.example.com"
          />
        </div>
        
        <div>
          <Label htmlFor="demo_url" className="flex items-center gap-2">
            <Monitor className="h-4 w-4" />
            URL de Démo Live
          </Label>
          <Input
            id="demo_url"
            value={formData.demo_url}
            onChange={(e) => onInputChange('demo_url', e.target.value)}
            placeholder="https://demo.example.com"
          />
        </div>
      </CardContent>
    </Card>
  );
}