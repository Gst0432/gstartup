import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { DashboardLayout } from '@/components/DashboardLayout';
import { ImageUploader } from '@/components/ImageUploader';
import { Images, Plus, Edit2, Trash2, Save, X, Eye, EyeOff, GripVertical } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface AdvertisementImage {
  id: string;
  title: string;
  description?: string;
  image_url: string;
  link_url?: string;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

interface FormData {
  title: string;
  description: string;
  image_url: string;
  link_url: string;
  is_active: boolean;
  sort_order: number;
}

export default function AdminAdvertisements() {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [advertisements, setAdvertisements] = useState<AdvertisementImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);

  const [formData, setFormData] = useState<FormData>({
    title: '',
    description: '',
    image_url: '',
    link_url: '',
    is_active: true,
    sort_order: 0
  });

  useEffect(() => {
    fetchAdvertisements();
  }, []);

  const fetchAdvertisements = async () => {
    try {
      const { data, error } = await supabase
        .from('advertisement_images')
        .select('*')
        .order('sort_order');

      if (error) {
        console.error('Error fetching advertisements:', error);
        return;
      }

      setAdvertisements(data || []);
    } catch (error) {
      console.error('Error fetching advertisements:', error);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      image_url: '',
      link_url: '',
      is_active: true,
      sort_order: advertisements.length
    });
    setEditingId(null);
    setShowAddForm(false);
  };

  const handleEdit = (ad: AdvertisementImage) => {
    setFormData({
      title: ad.title,
      description: ad.description || '',
      image_url: ad.image_url,
      link_url: ad.link_url || '',
      is_active: ad.is_active,
      sort_order: ad.sort_order
    });
    setEditingId(ad.id);
    setShowAddForm(false);
  };

  const handleSave = async () => {
    if (!formData.title || !formData.image_url) {
      toast({
        title: "Erreur",
        description: "Le titre et l'image sont requis",
        variant: "destructive"
      });
      return;
    }

    setSaving(true);
    try {
      if (editingId) {
        // Update existing
        const { error } = await supabase
          .from('advertisement_images')
          .update(formData)
          .eq('id', editingId);

        if (error) throw error;

        toast({
          title: "Succès",
          description: "Image publicitaire mise à jour"
        });
      } else {
        // Create new
        const { error } = await supabase
          .from('advertisement_images')
          .insert([formData]);

        if (error) throw error;

        toast({
          title: "Succès",
          description: "Image publicitaire créée"
        });
      }

      resetForm();
      fetchAdvertisements();
    } catch (error) {
      console.error('Error saving advertisement:', error);
      toast({
        title: "Erreur",
        description: "Impossible de sauvegarder l'image",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette image publicitaire ?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('advertisement_images')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Succès",
        description: "Image publicitaire supprimée"
      });

      fetchAdvertisements();
    } catch (error) {
      console.error('Error deleting advertisement:', error);
      toast({
        title: "Erreur",
        description: "Impossible de supprimer l'image",
        variant: "destructive"
      });
    }
  };

  const toggleActive = async (id: string, isActive: boolean) => {
    try {
      const { error } = await supabase
        .from('advertisement_images')
        .update({ is_active: isActive })
        .eq('id', id);

      if (error) throw error;

      fetchAdvertisements();
      toast({
        title: "Succès",
        description: `Image ${isActive ? 'activée' : 'désactivée'}`
      });
    } catch (error) {
      console.error('Error toggling advertisement:', error);
      toast({
        title: "Erreur",
        description: "Impossible de changer le statut",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-muted/30">
        {/* Header */}
        <header className="bg-background border-b">
          <div className="container mx-auto px-4 py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent flex items-center gap-3">
                  <Images className="h-8 w-8 text-primary" />
                  Images Publicitaires
                </h1>
                <p className="text-muted-foreground mt-1">
                  Gérez les images promotionnelles affichées sur le site
                </p>
              </div>
              <Button 
                onClick={() => setShowAddForm(true)} 
                className="gap-2"
                disabled={!!(showAddForm || editingId)}
              >
                <Plus className="h-4 w-4" />
                Ajouter une image
              </Button>
            </div>
          </div>
        </header>

        <div className="container mx-auto px-4 py-8">
          <div className="max-w-6xl mx-auto space-y-6">
            {/* Add/Edit Form */}
            {(showAddForm || editingId) && (
              <Card>
                <CardHeader>
                  <CardTitle>
                    {editingId ? 'Modifier l\'image publicitaire' : 'Ajouter une nouvelle image'}
                  </CardTitle>
                  <CardDescription>
                    {editingId ? 'Modifiez les informations de l\'image publicitaire' : 'Ajoutez une nouvelle image promotionnelle'}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="title">Titre *</Label>
                      <Input
                        id="title"
                        value={formData.title}
                        onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                        placeholder="Titre de l'image publicitaire"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="link_url">URL de redirection</Label>
                      <Input
                        id="link_url"
                        value={formData.link_url}
                        onChange={(e) => setFormData(prev => ({ ...prev, link_url: e.target.value }))}
                        placeholder="https://example.com ou #section"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Description de l'image publicitaire"
                      rows={3}
                    />
                  </div>

                  <div>
                    <Label>Image *</Label>
                    <ImageUploader
                      label="Image de l'annonce"
                      value={formData.image_url}
                      onChange={(url) => setFormData(prev => ({ ...prev, image_url: url }))}
                      aspectRatio="cover"
                    />
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="is_active"
                        checked={formData.is_active}
                        onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_active: checked }))}
                      />
                      <Label htmlFor="is_active">Image active</Label>
                    </div>

                    <div className="flex items-center gap-2">
                      <Label htmlFor="sort_order">Ordre:</Label>
                      <Input
                        id="sort_order"
                        type="number"
                        value={formData.sort_order}
                        onChange={(e) => setFormData(prev => ({ ...prev, sort_order: parseInt(e.target.value) || 0 }))}
                        className="w-20"
                      />
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button onClick={handleSave} disabled={saving} className="gap-2">
                      <Save className="h-4 w-4" />
                      {saving ? 'Sauvegarde...' : 'Sauvegarder'}
                    </Button>
                    <Button variant="outline" onClick={resetForm} className="gap-2">
                      <X className="h-4 w-4" />
                      Annuler
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Images Grid */}
            <div className="grid lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {advertisements.map((ad) => (
                <Card key={ad.id} className="overflow-hidden">
                  <div className="relative h-48">
                    <img
                      src={ad.image_url}
                      alt={ad.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-2 right-2 flex gap-1">
                      <Button
                        size="sm"
                        variant={ad.is_active ? "default" : "secondary"}
                        onClick={() => toggleActive(ad.id, !ad.is_active)}
                        className="h-8 w-8"
                      >
                        {ad.is_active ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
                      </Button>
                    </div>
                    <div className="absolute top-2 left-2">
                      <span className="bg-background/80 px-2 py-1 rounded text-xs font-medium">
                        #{ad.sort_order}
                      </span>
                    </div>
                  </div>
                  
                  <CardContent className="p-4">
                    <h3 className="font-semibold text-lg mb-2">{ad.title}</h3>
                    {ad.description && (
                      <p className="text-muted-foreground text-sm mb-3 line-clamp-2">
                        {ad.description}
                      </p>
                    )}
                    {ad.link_url && (
                      <p className="text-xs text-primary mb-3 truncate">
                        🔗 {ad.link_url}
                      </p>
                    )}
                    
                    <div className="flex justify-between items-center">
                      <span className={`text-xs px-2 py-1 rounded ${
                        ad.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {ad.is_active ? 'Actif' : 'Inactif'}
                      </span>
                      
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEdit(ad)}
                          disabled={editingId === ad.id}
                        >
                          <Edit2 className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDelete(ad.id)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {advertisements.length === 0 && (
              <Card>
                <CardContent className="text-center py-12">
                  <Images className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Aucune image publicitaire</h3>
                  <p className="text-muted-foreground mb-4">
                    Commencez par ajouter votre première image publicitaire
                  </p>
                  <Button onClick={() => setShowAddForm(true)} className="gap-2">
                    <Plus className="h-4 w-4" />
                    Ajouter une image
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}