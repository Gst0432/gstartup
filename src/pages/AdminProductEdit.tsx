import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { RichTextEditor } from '@/components/RichTextEditor';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Plus, Upload, X, FileText, Eye, Monitor, Download } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface Category {
  id: string;
  name: string;
}

interface Vendor {
  id: string;
  business_name: string;
  user_id: string;
}

interface Product {
  id: string;
  name: string;
  description: string;
  short_description: string;
  price: number;
  compare_price: number | null;
  cost_price: number | null;
  sku: string;
  barcode: string;
  quantity: number;
  weight: number | null;
  category_id: string;
  vendor_id: string;
  tags: string[];
  digital_file_url: string;
  preview_url: string;
  demo_url: string;
  is_digital: boolean;
  is_active: boolean;
  is_featured: boolean;
  track_quantity: boolean;
  requires_shipping: boolean;
  allow_backorder: boolean;
  meta_title: string;
  meta_description: string;
  images: string[];
}

export default function AdminProductEdit() {
  const { id } = useParams<{ id: string }>();
  const { profile } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [categories, setCategories] = useState<Category[]>([]);
  const [vendors, setVendors] = useState<Vendor[]>([]);
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
    vendor_id: '',
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
    if (id) {
      fetchProduct();
      fetchCategories();
      fetchVendors();
    }
  }, [id]);

  const fetchProduct = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error('Error fetching product:', error);
        toast({
          title: "Erreur",
          description: "Impossible de charger le produit",
          variant: "destructive"
        });
        navigate('/admin/products');
        return;
      }

      setFormData({
        name: data.name || '',
        description: data.description || '',
        short_description: data.short_description || '',
        price: data.price?.toString() || '',
        compare_price: data.compare_price?.toString() || '',
        cost_price: data.cost_price?.toString() || '',
        sku: data.sku || '',
        barcode: data.barcode || '',
        quantity: data.quantity?.toString() || '999',
        weight: data.weight?.toString() || '',
        category_id: data.category_id || '',
        vendor_id: data.vendor_id || '',
        tags: data.tags ? data.tags.join(', ') : '',
        digital_file_url: data.digital_file_url || '',
        preview_url: data.preview_url || '',
        demo_url: data.demo_url || '',
        is_digital: data.is_digital ?? true,
        is_active: data.is_active ?? true,
        is_featured: data.is_featured ?? false,
        track_quantity: data.track_quantity ?? false,
        requires_shipping: data.requires_shipping ?? false,
        allow_backorder: data.allow_backorder ?? false,
        meta_title: data.meta_title || '',
        meta_description: data.meta_description || ''
      });

      setImages(data.images || []);
    } catch (error) {
      console.error('Error fetching product:', error);
    } finally {
      setInitialLoading(false);
    }
  };

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

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Vérifier le type de fichier (ZIP ou PDF)
    const allowedTypes = ['application/zip', 'application/x-zip-compressed', 'application/pdf'];
    if (!allowedTypes.includes(file.type)) {
      toast({
        title: "Erreur",
        description: "Seuls les fichiers ZIP et PDF sont acceptés",
        variant: "destructive"
      });
      return;
    }

    // Vérifier la taille du fichier (10GB max)
    const maxSize = 10 * 1024 * 1024 * 1024; // 10GB en bytes
    if (file.size > maxSize) {
      toast({
        title: "Erreur",
        description: "Le fichier ne peut pas dépasser 10GB",
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
    if (!profile || profile.role !== 'admin') {
      toast({
        title: "Erreur",
        description: "Seuls les administrateurs peuvent modifier des produits",
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
        .update(productData)
        .eq('id', id);

      if (error) {
        console.error('Error updating product:', error);
        toast({
          title: "Erreur",
          description: "Impossible de modifier le produit",
          variant: "destructive"
        });
        return;
      }

      toast({
        title: "Succès",
        description: "Produit modifié avec succès",
      });

      navigate('/admin/products');
    } catch (error) {
      console.error('Error updating product:', error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (formData.digital_file_url) {
      window.open(formData.digital_file_url, '_blank');
    }
  };

  if (initialLoading) {
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
        <header className="bg-background border-b">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold">Modifier le Produit</h1>
                <p className="text-muted-foreground">
                  Modifier les informations du produit
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
                  Les informations de base du produit numérique
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
                  <RichTextEditor
                    value={formData.description}
                    onChange={(value) => handleInputChange('description', value)}
                    placeholder="Décrivez votre produit en détail..."
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
                    Le fichier principal à télécharger (ZIP recommandé pour les gros fichiers)
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-4">
                    <div className="text-center">
                      <FileText className="mx-auto h-8 w-8 text-muted-foreground/50" />
                      <div className="mt-2">
                        <Label htmlFor="file" className="cursor-pointer">
                          <span className="text-sm font-medium text-primary hover:text-primary/80">
                            {uploadingFile ? 'Téléversement...' : 'Téléverser fichier ZIP/PDF'}
                          </span>
                          <Input
                            id="file"
                            type="file"
                            accept=".zip,.pdf"
                            className="hidden"
                            onChange={handleFileUpload}
                            disabled={uploadingFile}
                          />
                        </Label>
                        <p className="text-xs text-muted-foreground mt-1">
                          ZIP ou PDF, max 10GB
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  {formData.digital_file_url && (
                    <div className="flex items-center justify-between p-2 bg-muted rounded-lg">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-green-600" />
                        <span className="text-sm text-green-600">Fichier téléversé</span>
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleDownload}
                        className="gap-2"
                      >
                        <Download className="h-4 w-4" />
                        Télécharger
                      </Button>
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
                onClick={() => navigate('/admin/products')}
              >
                Annuler
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? 'Modification...' : 'Modifier le produit'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
}