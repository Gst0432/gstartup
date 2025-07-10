import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { RichTextEditor } from '@/components/RichTextEditor';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ProductFormData, Category, Vendor } from '@/hooks/useProductForm';

interface ProductBasicInfoProps {
  formData: ProductFormData;
  categories: Category[];
  vendors: Vendor[];
  onInputChange: (field: string, value: any) => void;
}

export function ProductBasicInfo({ 
  formData, 
  categories, 
  vendors, 
  onInputChange 
}: ProductBasicInfoProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Informations Générales</CardTitle>
        <CardDescription>
          Les informations de base du produit numérique
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="vendor">Vendeur *</Label>
          <Select value={formData.vendor_id} onValueChange={(value) => onInputChange('vendor_id', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Sélectionner un vendeur" />
            </SelectTrigger>
            <SelectContent>
              {vendors.map((vendor) => (
                <SelectItem key={vendor.id} value={vendor.id}>
                  {vendor.business_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="name">Nom du produit *</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => onInputChange('name', e.target.value)}
            required
          />
        </div>
        
        <div>
          <Label htmlFor="short_description">Description courte</Label>
          <Input
            id="short_description"
            value={formData.short_description}
            onChange={(e) => onInputChange('short_description', e.target.value)}
          />
        </div>
        
        <div>
          <Label htmlFor="description">Description *</Label>
          <RichTextEditor
            value={formData.description}
            onChange={(value) => onInputChange('description', value)}
            placeholder="Décrivez votre produit en détail..."
          />
        </div>
        
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="category">Catégorie *</Label>
            <Select value={formData.category_id} onValueChange={(value) => onInputChange('category_id', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner une catégorie" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label htmlFor="price">Prix (FCFA) *</Label>
            <Input
              id="price"
              type="number"
              step="1"
              value={formData.price}
              onChange={(e) => onInputChange('price', e.target.value)}
              required
            />
          </div>
        </div>
        
        <div>
          <Label htmlFor="tags">Tags (séparés par des virgules)</Label>
          <Input
            id="tags"
            value={formData.tags}
            onChange={(e) => onInputChange('tags', e.target.value)}
            placeholder="web, design, template, php, script"
          />
        </div>
      </CardContent>
    </Card>
  );
}