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
import { Plus, Upload, X, FileText, Eye, Monitor } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';

interface Category {
  id: string;
  name: string;
}

export default function VendorProductNew() {
  const { profile } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [images, setImages] = useState<string[]>([]);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    short_description: '',
    price: '',
    compare_price: '',
    cost_price: '',
    sku: '',
    barcode: '',
    quantity: '999',
    weight: '',
    category_id: '',
    tags: '',
    digital_file_url: '',
    preview_url: '',
    demo_url: '',
    is_digital: true,
    is_active: true,
    is_featured: false,
    track_quantity: false,
    requires_shipping: false,
    allow_backorder: false,
    meta_title: '',
    meta_description: ''
  });

  useEffect(() => {
    fetchCategories();
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

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      toast({
        title: "Erreur",
        description: "Seuls les fichiers PDF sont acceptés",
        variant: "destructive"
      });
      return;
    }

    setUploadingFile(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      
      const { data, error } = await supabase.storage
        .from('shop')
        .upload(`products/files/${fileName}`, file);

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from('shop')
        .getPublicUrl(data.path);

      handleInputChange('digital_file_url', publicUrl);
      
      toast({
        title: "Succès",
        description: "Fichier téléversé avec succès",
      });
    } catch (error) {
      console.error('Error uploading file:', error);
      toast({
        title: "Erreur",
        description: "Erreur lors du téléversement",
        variant: "destructive"
      });
    } finally {
      setUploadingFile(false);
    }
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setUploadingImages(true);
    try {
      const uploadPromises = Array.from(files).map(async (file) => {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        
        const { data, error } = await supabase.storage
          .from('shop')
          .upload(`products/images/${fileName}`, file);

        if (error) throw error;

        const { data: { publicUrl } } = supabase.storage
          .from('shop')
          .getPublicUrl(data.path);

        return publicUrl;
      });

      const uploadedUrls = await Promise.all(uploadPromises);
      setImages(prev => [...prev, ...uploadedUrls]);
      
      toast({
        title: "Succès",
        description: `${uploadedUrls.length} image(s) téléversée(s) avec succès`,
      });
    } catch (error) {
      console.error('Error uploading images:', error);
      toast({
        title: "Erreur",
        description: "Erreur lors du téléversement des images",
        variant: "destructive"
      });
    } finally {
      setUploadingImages(false);
    }
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;

    setLoading(true);

    try {
      // Get vendor info
      const { data: vendor } = await supabase
        .from('vendors')
        .select('id')
        .eq('user_id', profile.user_id)
        .single();

      if (!vendor) {
        toast({
          title: "Erreur",
          description: "Profil vendeur non trouvé",
          variant: "destructive"
        });
        return;
      }

      const productData = {
        ...formData,
        vendor_id: vendor.id,
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

      navigate('/vendor/products');
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
                  Créer un nouveau produit pour votre catalogue
                </p>
              </div>
            </div>
          </div>
        </header>

        <div className="container mx-auto px-4 py-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Informations générales */}
            <Card>
              <CardHeader>
                <CardTitle>Informations Générales</CardTitle>
                <CardDescription>
                  Les informations de base de votre produit numérique
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
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
                
                <div className="grid md:grid-cols-2 gap-4">
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
                    <Label htmlFor="price">Prix (FCFA) *</Label>
                    <Input
                      id="price"
                      type="number"
                      step="1"
                      value={formData.price}
                      onChange={(e) => handleInputChange('price', e.target.value)}
                      required
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="tags">Tags (séparés par des virgules)</Label>
                  <Input
                    id="tags"
                    value={formData.tags}
                    onChange={(e) => handleInputChange('tags', e.target.value)}
                    placeholder="web, design, template, php, script"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Images du produit */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="h-5 w-5" />
                  Images du Produit
                </CardTitle>
                <CardDescription>
                  Téléversez les images de votre produit (captures d'écran, exemples, etc.)
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6">
                  <div className="text-center">
                    <Upload className="mx-auto h-12 w-12 text-muted-foreground/50" />
                    <div className="mt-4">
                      <Label htmlFor="images" className="cursor-pointer">
                        <span className="text-sm font-medium text-primary hover:text-primary/80">
                          Cliquez pour téléverser des images
                        </span>
                        <Input
                          id="images"
                          type="file"
                          multiple
                          accept="image/*"
                          className="hidden"
                          onChange={handleImageUpload}
                          disabled={uploadingImages}
                        />
                      </Label>
                      <p className="text-xs text-muted-foreground mt-1">
                        PNG, JPG, GIF jusqu'à 10MB
                      </p>
                    </div>
                  </div>
                </div>

                {images.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {images.map((image, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={image}
                          alt={`Product ${index + 1}`}
                          className="w-full h-24 object-cover rounded-lg border"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          className="absolute top-1 right-1 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => removeImage(index)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Fichiers et URLs */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* Fichier principal */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Fichier Principal
                  </CardTitle>
                  <CardDescription>
                    Le fichier ZIP/PDF principal à télécharger
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-4">
                    <div className="text-center">
                      <FileText className="mx-auto h-8 w-8 text-muted-foreground/50" />
                      <div className="mt-2">
                        <Label htmlFor="file" className="cursor-pointer">
                          <span className="text-sm font-medium text-primary hover:text-primary/80">
                            {uploadingFile ? 'Téléversement...' : 'Téléverser fichier PDF'}
                          </span>
                          <Input
                            id="file"
                            type="file"
                            accept=".pdf"
                            className="hidden"
                            onChange={handleFileUpload}
                            disabled={uploadingFile}
                          />
                        </Label>
                        <p className="text-xs text-muted-foreground mt-1">
                          PDF uniquement, max 50MB
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  {formData.digital_file_url && (
                    <div className="flex items-center gap-2 p-2 bg-muted rounded-lg">
                      <FileText className="h-4 w-4 text-green-600" />
                      <span className="text-sm text-green-600">Fichier téléversé</span>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* URLs de prévisualisation */}
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
                      onChange={(e) => handleInputChange('preview_url', e.target.value)}
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
                      onChange={(e) => handleInputChange('demo_url', e.target.value)}
                      placeholder="https://demo.example.com"
                    />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Options finales */}
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
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <div className="flex justify-end gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/vendor/products')}
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