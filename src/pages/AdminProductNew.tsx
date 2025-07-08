import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Plus, Upload, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';

interface Category {
  id: string;
  name: string;
}

interface Vendor {
  id: string;
  business_name: string;
  user_id: string;
}

export default function AdminProductNew() {
  const { profile } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [images, setImages] = useState<string[]>([]);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    short_description: '',
    price: '',
    compare_price: '',
    cost_price: '',
    sku: '',
    barcode: '',
    quantity: '',
    weight: '',
    category_id: '',
    vendor_id: '',
    tags: '',
    digital_file_url: '',
    is_digital: false,
    is_active: true,
    is_featured: false,
    track_quantity: true,
    requires_shipping: true,
    allow_backorder: false,
    meta_title: '',
    meta_description: ''
  });

  useEffect(() => {
    fetchCategories();
    fetchVendors();
  }, []);

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('id, name')
        .eq('is_active', true)
        .order('name');

      if (error) {
        console.error('Error fetching categories:', error);
        return;
      }

      setCategories(data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchVendors = async () => {
    try {
      const { data, error } = await supabase
        .from('vendors')
        .select('id, business_name, user_id')
        .eq('is_active', true)
        .order('business_name');

      if (error) {
        console.error('Error fetching vendors:', error);
        return;
      }

      setVendors(data || []);
    } catch (error) {
      console.error('Error fetching vendors:', error);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile || profile.role !== 'admin') {
      toast({
        title: "Erreur",
        description: "Seuls les administrateurs peuvent créer des produits",
        variant: "destructive"
      });
      return;
    }

    if (!formData.vendor_id) {
      toast({
        title: "Erreur",
        description: "Veuillez sélectionner un vendeur",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);

    try {
      const productData = {
        ...formData,
        price: parseFloat(formData.price),
        compare_price: formData.compare_price ? parseFloat(formData.compare_price) : null,
        cost_price: formData.cost_price ? parseFloat(formData.cost_price) : null,
        quantity: formData.quantity ? parseInt(formData.quantity) : 0,
        weight: formData.weight ? parseFloat(formData.weight) : null,
        images: images,
        tags: formData.tags ? formData.tags.split(',').map(tag => tag.trim()) : []
      };

      const { error } = await supabase
        .from('products')
        .insert(productData);

      if (error) {
        console.error('Error creating product:', error);
        toast({
          title: "Erreur",
          description: "Impossible de créer le produit",
          variant: "destructive"
        });
        return;
      }

      toast({
        title: "Succès",
        description: "Produit créé avec succès",
      });

      navigate('/admin/products');
    } catch (error) {
      console.error('Error creating product:', error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-muted/30">
        <header className="bg-background border-b">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold">Ajouter un Produit</h1>
                <p className="text-muted-foreground">
                  Créer un nouveau produit (Administration)
                </p>
              </div>
            </div>
          </div>
        </header>

        <div className="container mx-auto px-4 py-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Informations générales */}
              <Card>
                <CardHeader>
                  <CardTitle>Informations Générales</CardTitle>
                  <CardDescription>
                    Les informations de base du produit
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="vendor">Vendeur *</Label>
                    <Select value={formData.vendor_id} onValueChange={(value) => handleInputChange('vendor_id', value)}>
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
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="short_description">Description courte</Label>
                    <Input
                      id="short_description"
                      value={formData.short_description}
                      onChange={(e) => handleInputChange('short_description', e.target.value)}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="description">Description *</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      rows={4}
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="category">Catégorie *</Label>
                    <Select value={formData.category_id} onValueChange={(value) => handleInputChange('category_id', value)}>
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
                    <Label htmlFor="tags">Tags (séparés par des virgules)</Label>
                    <Input
                      id="tags"
                      value={formData.tags}
                      onChange={(e) => handleInputChange('tags', e.target.value)}
                      placeholder="web, design, template"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Prix et inventaire */}
              <Card>
                <CardHeader>
                  <CardTitle>Prix et Inventaire</CardTitle>
                  <CardDescription>
                    Configuration des prix et du stock
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="price">Prix de vente *</Label>
                    <Input
                      id="price"
                      type="number"
                      step="0.01"
                      value={formData.price}
                      onChange={(e) => handleInputChange('price', e.target.value)}
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="compare_price">Prix de comparaison</Label>
                    <Input
                      id="compare_price"
                      type="number"
                      step="0.01"
                      value={formData.compare_price}
                      onChange={(e) => handleInputChange('compare_price', e.target.value)}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="cost_price">Prix de revient</Label>
                    <Input
                      id="cost_price"
                      type="number"
                      step="0.01"
                      value={formData.cost_price}
                      onChange={(e) => handleInputChange('cost_price', e.target.value)}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="quantity">Quantité en stock</Label>
                    <Input
                      id="quantity"
                      type="number"
                      value={formData.quantity}
                      onChange={(e) => handleInputChange('quantity', e.target.value)}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="sku">SKU</Label>
                    <Input
                      id="sku"
                      value={formData.sku}
                      onChange={(e) => handleInputChange('sku', e.target.value)}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="weight">Poids (kg)</Label>
                    <Input
                      id="weight"
                      type="number"
                      step="0.01"
                      value={formData.weight}
                      onChange={(e) => handleInputChange('weight', e.target.value)}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Options */}
            <Card>
              <CardHeader>
                <CardTitle>Options du Produit</CardTitle>
                <CardDescription>
                  Configuration avancée du produit
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="is_active"
                      checked={formData.is_active}
                      onCheckedChange={(checked) => handleInputChange('is_active', checked)}
                    />
                    <Label htmlFor="is_active">Produit actif</Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="is_featured"
                      checked={formData.is_featured}
                      onCheckedChange={(checked) => handleInputChange('is_featured', checked)}
                    />
                    <Label htmlFor="is_featured">Produit mis en avant</Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="is_digital"
                      checked={formData.is_digital}
                      onCheckedChange={(checked) => handleInputChange('is_digital', checked)}
                    />
                    <Label htmlFor="is_digital">Produit numérique</Label>
                  </div>
                </div>
                
                {formData.is_digital && (
                  <div>
                    <Label htmlFor="digital_file_url">URL du fichier numérique</Label>
                    <Input
                      id="digital_file_url"
                      value={formData.digital_file_url}
                      onChange={(e) => handleInputChange('digital_file_url', e.target.value)}
                      placeholder="https://..."
                    />
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Actions */}
            <div className="flex justify-end gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/admin/products')}
              >
                Annuler
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? 'Création...' : 'Créer le produit'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
}