import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Product } from '@/types/vendor';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { ArrowLeft, Save } from 'lucide-react';

function VendorProductEdit() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { profile } = useAuth();
  const { toast } = useToast();
  
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);

  useEffect(() => {
    if (profile && id) {
      fetchProduct();
      fetchCategories();
    }
  }, [profile, id]);

  const fetchProduct = async () => {
    try {
      // First get vendor info
      const { data: vendor } = await supabase
        .from('vendors')
        .select('id')
        .eq('user_id', profile?.user_id)
        .single();

      if (!vendor) {
        toast({
          title: "Erreur",
          description: "Profil vendeur non trouvé",
          variant: "destructive"
        });
        navigate('/vendor/products');
        return;
      }

      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          categories!inner(id, name)
        `)
        .eq('id', id)
        .eq('vendor_id', vendor.id)
        .single();

      if (error) {
        console.error('Error fetching product:', error);
        toast({
          title: "Erreur",
          description: "Produit non trouvé",
          variant: "destructive"
        });
        navigate('/vendor/products');
        return;
      }

      setProduct({
        ...data,
        category: data.categories
      });
    } catch (error) {
      console.error('Error fetching product:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger le produit",
        variant: "destructive"
      });
      navigate('/vendor/products');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    const { data } = await supabase
      .from('categories')
      .select('*')
      .eq('is_active', true)
      .order('name');
    
    setCategories(data || []);
  };

  const handleSave = async () => {
    if (!product) return;
    
    setSaving(true);
    try {
      const { error } = await supabase
        .from('products')
        .update({
          name: product.name,
          description: product.description,
          short_description: product.short_description,
          price: product.price,
          category_id: product.category_id,
          quantity: product.quantity,
          is_active: product.is_active,
          is_featured: product.is_featured,
          tags: product.tags
        })
        .eq('id', product.id);

      if (error) throw error;

      toast({
        title: "Succès",
        description: "Produit mis à jour avec succès",
      });

      navigate('/vendor/products');
    } catch (error) {
      console.error('Error updating product:', error);
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour le produit",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const updateProduct = (field: string, value: any) => {
    setProduct(prev => prev ? { ...prev, [field]: value } : null);
  };

  if (loading || !product) {
    return (
      <DashboardLayout>
        <div className="min-h-screen bg-muted/30 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-muted/30">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center gap-4 mb-6">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => navigate('/vendor/products')}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour aux produits
            </Button>
            <h1 className="text-2xl font-bold">Modifier le produit</h1>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Informations générales</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="name">Nom du produit *</Label>
                    <Input
                      id="name"
                      value={product.name}
                      onChange={(e) => updateProduct('name', e.target.value)}
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="short_description">Description courte</Label>
                    <Input
                      id="short_description"
                      value={product.short_description || ''}
                      onChange={(e) => updateProduct('short_description', e.target.value)}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="description">Description *</Label>
                    <Textarea
                      id="description"
                      value={product.description}
                      onChange={(e) => updateProduct('description', e.target.value)}
                      rows={5}
                    />
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="category">Catégorie *</Label>
                      <Select 
                        value={product.category_id} 
                        onValueChange={(value) => updateProduct('category_id', value)}
                      >
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
                        value={product.price}
                        onChange={(e) => updateProduct('price', Number(e.target.value))}
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="quantity">Quantité</Label>
                    <Input
                      id="quantity"
                      type="number"
                      value={product.quantity}
                      onChange={(e) => updateProduct('quantity', Number(e.target.value))}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Options de publication</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="is_active">Produit actif</Label>
                    <Switch
                      id="is_active"
                      checked={product.is_active}
                      onCheckedChange={(checked) => updateProduct('is_active', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="is_featured">Produit mis en avant</Label>
                    <Switch
                      id="is_featured"
                      checked={product.is_featured}
                      onCheckedChange={(checked) => updateProduct('is_featured', checked)}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Actions</CardTitle>
                </CardHeader>
                <CardContent>
                  <Button 
                    onClick={handleSave}
                    disabled={saving}
                    className="w-full"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {saving ? 'Enregistrement...' : 'Enregistrer'}
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

export default VendorProductEdit;