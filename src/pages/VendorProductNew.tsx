import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { DashboardLayout } from '@/components/DashboardLayout';
import { RichTextEditor } from '@/components/RichTextEditor';
import { Plus, Upload, X, FileText, Eye, Monitor, ChevronLeft, ChevronRight, Check } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';

interface Category {
  id: string;
  name: string;
}

const steps = [
  { id: 1, title: 'Informations de base', description: 'Nom, description et catégorie' },
  { id: 2, title: 'Prix et détails', description: 'Prix, tags et options' },
  { id: 3, title: 'Images', description: 'Photos et visuels du produit' },
  { id: 4, title: 'Fichiers et liens', description: 'Fichier principal et démos' },
  { id: 5, title: 'Publication', description: 'Options finales et validation' }
];

export default function VendorProductNew() {
  const { profile } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [images, setImages] = useState<string[]>([]);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  
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

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        return !!(formData.name && formData.description && formData.category_id);
      case 2:
        return !!(formData.price);
      case 3:
        return true; // Images are optional
      case 4:
        return true; // Files and URLs are optional
      case 5:
        return true; // Final options
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCompletedSteps(prev => [...new Set([...prev, currentStep])]);
      if (currentStep < steps.length) {
        setCurrentStep(currentStep + 1);
      }
    } else {
      toast({
        title: "Champs requis",
        description: "Veuillez remplir tous les champs obligatoires avant de continuer",
        variant: "destructive"
      });
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleStepClick = (stepNumber: number) => {
    // Allow navigation to completed steps or next step
    if (completedSteps.includes(stepNumber) || stepNumber <= Math.max(...completedSteps, 0) + 1) {
      setCurrentStep(stepNumber);
    }
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
          {/* Step Navigation */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              {steps.map((step, index) => (
                <div 
                  key={step.id}
                  className="flex items-center cursor-pointer"
                  onClick={() => handleStepClick(step.id)}
                >
                  <div className={`
                    flex items-center justify-center w-10 h-10 rounded-full border-2 text-sm font-medium transition-all
                    ${currentStep === step.id 
                      ? 'border-primary bg-primary text-primary-foreground' 
                      : completedSteps.includes(step.id)
                        ? 'border-green-500 bg-green-500 text-white'
                        : 'border-muted-foreground bg-background text-muted-foreground'
                    }
                  `}>
                    {completedSteps.includes(step.id) ? (
                      <Check className="h-5 w-5" />
                    ) : (
                      step.id
                    )}
                  </div>
                  
                  <div className="ml-3 hidden md:block">
                    <p className={`text-sm font-medium ${
                      currentStep === step.id ? 'text-primary' : 'text-muted-foreground'
                    }`}>
                      {step.title}
                    </p>
                    <p className="text-xs text-muted-foreground">{step.description}</p>
                  </div>
                  
                  {index < steps.length - 1 && (
                    <div className={`w-8 md:w-16 h-0.5 mx-4 ${
                      completedSteps.includes(step.id) ? 'bg-green-500' : 'bg-muted'
                    }`} />
                  )}
                </div>
              ))}
            </div>
            
            {/* Mobile step indicator */}
            <div className="md:hidden text-center">
              <Badge variant="outline" className="text-sm">
                Étape {currentStep} sur {steps.length}: {steps[currentStep - 1].title}
              </Badge>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Step 1: Basic Information */}
            {currentStep === 1 && (
              <Card className="animate-fade-in">
                <CardHeader>
                  <CardTitle>Informations de Base</CardTitle>
                  <CardDescription>
                    Les informations essentielles de votre produit numérique
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <Label htmlFor="name">Nom du produit *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      required
                      placeholder="Ex: Template WordPress Premium"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="short_description">Description courte</Label>
                    <Input
                      id="short_description"
                      value={formData.short_description}
                      onChange={(e) => handleInputChange('short_description', e.target.value)}
                      placeholder="Résumé en une ligne"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="description">Description détaillée *</Label>
                    <div className="mt-2">
                      <RichTextEditor
                        value={formData.description}
                        onChange={(value) => handleInputChange('description', value)}
                        placeholder="Décrivez votre produit en détail : fonctionnalités, avantages, utilisation..."
                      />
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Utilisez la barre d'outils pour formater votre texte (gras, italique, listes, etc.)
                    </p>
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
                </CardContent>
              </Card>
            )}

            {/* Step 2: Pricing and Details */}
            {currentStep === 2 && (
              <Card className="animate-fade-in">
                <CardHeader>
                  <CardTitle>Prix et Détails</CardTitle>
                  <CardDescription>
                    Définissez le prix et les détails techniques de votre produit
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="price">Prix de vente (FCFA) *</Label>
                      <Input
                        id="price"
                        type="number"
                        step="1"
                        value={formData.price}
                        onChange={(e) => handleInputChange('price', e.target.value)}
                        required
                        placeholder="10000"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="compare_price">Prix barré (FCFA)</Label>
                      <Input
                        id="compare_price"
                        type="number"
                        step="1"
                        value={formData.compare_price}
                        onChange={(e) => handleInputChange('compare_price', e.target.value)}
                        placeholder="15000"
                      />
                    </div>
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="sku">SKU / Référence</Label>
                      <Input
                        id="sku"
                        value={formData.sku}
                        onChange={(e) => handleInputChange('sku', e.target.value)}
                        placeholder="PROD-001"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="quantity">Quantité disponible</Label>
                      <Input
                        id="quantity"
                        type="number"
                        value={formData.quantity}
                        onChange={(e) => handleInputChange('quantity', e.target.value)}
                        placeholder="999"
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
            )}

            {/* Step 3: Images */}
            {currentStep === 3 && (
              <Card className="animate-fade-in">
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
                          PNG, JPG, GIF jusqu'à 10MB chacune
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
            )}

            {/* Step 4: Files and URLs */}
            {currentStep === 4 && (
              <div className="space-y-6 animate-fade-in">
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Main File */}
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
                          <span className="text-sm text-green-600">Fichier téléversé avec succès</span>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Preview URLs */}
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
              </div>
            )}

            {/* Step 5: Publication Options */}
            {currentStep === 5 && (
              <Card className="animate-fade-in">
                <CardHeader>
                  <CardTitle>Options de Publication</CardTitle>
                  <CardDescription>
                    Paramètres finaux avant la publication de votre produit
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h4 className="font-medium">Statut du produit</h4>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between p-3 border rounded-lg">
                          <div>
                            <Label htmlFor="is_active" className="font-medium">Produit actif</Label>
                            <p className="text-sm text-muted-foreground">Le produit sera visible sur votre boutique</p>
                          </div>
                          <Switch
                            id="is_active"
                            checked={formData.is_active}
                            onCheckedChange={(checked) => handleInputChange('is_active', checked)}
                          />
                        </div>
                        
                        <div className="flex items-center justify-between p-3 border rounded-lg">
                          <div>
                            <Label htmlFor="is_featured" className="font-medium">Produit mis en avant</Label>
                            <p className="text-sm text-muted-foreground">Apparaîtra dans les produits vedettes</p>
                          </div>
                          <Switch
                            id="is_featured"
                            checked={formData.is_featured}
                            onCheckedChange={(checked) => handleInputChange('is_featured', checked)}
                          />
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <h4 className="font-medium">SEO (Optionnel)</h4>
                      <div className="space-y-3">
                        <div>
                          <Label htmlFor="meta_title">Titre SEO</Label>
                          <Input
                            id="meta_title"
                            value={formData.meta_title}
                            onChange={(e) => handleInputChange('meta_title', e.target.value)}
                            placeholder="Titre pour les moteurs de recherche"
                          />
                        </div>
                        
                        <div>
                          <Label htmlFor="meta_description">Description SEO</Label>
                          <Textarea
                            id="meta_description"
                            value={formData.meta_description}
                            onChange={(e) => handleInputChange('meta_description', e.target.value)}
                            rows={3}
                            placeholder="Description pour les moteurs de recherche (texte simple uniquement)"
                          />
                          <p className="text-xs text-muted-foreground mt-1">
                            Cette description apparaîtra dans les résultats de recherche Google
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Summary */}
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <h4 className="font-medium mb-2">Résumé du produit</h4>
                    <div className="grid md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Nom:</span> {formData.name || 'Non défini'}
                      </div>
                      <div>
                        <span className="text-muted-foreground">Prix:</span> {formData.price ? `${formData.price} FCFA` : 'Non défini'}
                      </div>
                      <div>
                        <span className="text-muted-foreground">Images:</span> {images.length} image(s)
                      </div>
                      <div>
                        <span className="text-muted-foreground">Fichier:</span> {formData.digital_file_url ? 'Téléversé' : 'Aucun'}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between items-center pt-6 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={currentStep === 1 ? () => navigate('/vendor/products') : handlePrevious}
                className="flex items-center gap-2"
              >
                <ChevronLeft className="h-4 w-4" />
                {currentStep === 1 ? 'Annuler' : 'Précédent'}
              </Button>
              
              <div className="text-sm text-muted-foreground">
                Étape {currentStep} sur {steps.length}
              </div>
              
              {currentStep < steps.length ? (
                <Button
                  type="button"
                  onClick={handleNext}
                  className="flex items-center gap-2"
                  disabled={!validateStep(currentStep)}
                >
                  Suivant
                  <ChevronRight className="h-4 w-4" />
                </Button>
              ) : (
                <Button 
                  type="submit" 
                  disabled={loading}
                  className="flex items-center gap-2"
                >
                  {loading ? 'Création...' : 'Créer le produit'}
                  <Check className="h-4 w-4" />
                </Button>
              )}
            </div>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
}