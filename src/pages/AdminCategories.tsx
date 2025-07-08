import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { DashboardLayout } from '@/components/DashboardLayout';
import { 
  Settings,
  Plus,
  Edit,
  Trash,
  Eye,
  EyeOff,
  Folder,
  FolderOpen
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface Category {
  id: string;
  name: string;
  description: string;
  image_url: string;
  is_active: boolean;
  parent_id: string;
  created_at: string;
  children?: Category[];
  product_count?: number;
}

export default function AdminCategories() {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    image_url: '',
    is_active: true,
    parent_id: ''
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name');

      if (error) {
        console.error('Error fetching categories:', error);
        return;
      }

      // Organiser en hiérarchie parent-enfant
      const categoriesMap = new Map();
      data?.forEach(cat => categoriesMap.set(cat.id, { ...cat, children: [] }));

      const rootCategories: Category[] = [];
      categoriesMap.forEach(category => {
        if (category.parent_id) {
          const parent = categoriesMap.get(category.parent_id);
          if (parent) {
            parent.children.push(category);
          }
        } else {
          rootCategories.push(category);
        }
      });

      setCategories(rootCategories);
    } catch (error) {
      console.error('Error fetching categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingCategory) {
        // Mise à jour
        const { error } = await supabase
          .from('categories')
          .update(formData)
          .eq('id', editingCategory.id);

        if (error) throw error;

        toast({
          title: "Succès",
          description: "Catégorie mise à jour avec succès",
        });
      } else {
        // Création
        const { error } = await supabase
          .from('categories')
          .insert(formData);

        if (error) throw error;

        toast({
          title: "Succès",
          description: "Catégorie créée avec succès",
        });
      }

      setIsDialogOpen(false);
      setEditingCategory(null);
      setFormData({
        name: '',
        description: '',
        image_url: '',
        is_active: true,
        parent_id: ''
      });
      fetchCategories();
    } catch (error) {
      console.error('Error saving category:', error);
      toast({
        title: "Erreur",
        description: "Impossible de sauvegarder la catégorie",
        variant: "destructive"
      });
    }
  };

  const toggleCategoryStatus = async (categoryId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('categories')
        .update({ is_active: !currentStatus })
        .eq('id', categoryId);

      if (error) throw error;

      toast({
        title: "Succès",
        description: `Catégorie ${!currentStatus ? 'activée' : 'désactivée'}`,
      });

      fetchCategories();
    } catch (error) {
      console.error('Error updating category status:', error);
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour le statut",
        variant: "destructive"
      });
    }
  };

  const deleteCategory = async (categoryId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette catégorie ?')) return;

    try {
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', categoryId);

      if (error) throw error;

      toast({
        title: "Succès",
        description: "Catégorie supprimée avec succès",
      });

      fetchCategories();
    } catch (error) {
      console.error('Error deleting category:', error);
      toast({
        title: "Erreur",
        description: "Impossible de supprimer la catégorie",
        variant: "destructive"
      });
    }
  };

  const openEditDialog = (category: Category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      description: category.description || '',
      image_url: category.image_url || '',
      is_active: category.is_active,
      parent_id: category.parent_id || ''
    });
    setIsDialogOpen(true);
  };

  const renderCategory = (category: Category, depth = 0) => (
    <div key={category.id} className={`ml-${depth * 4}`}>
      <div className="flex items-center justify-between p-4 border rounded-lg mb-2">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            {category.children && category.children.length > 0 ? (
              <FolderOpen className="h-5 w-5 text-blue-600" />
            ) : (
              <Folder className="h-5 w-5 text-muted-foreground" />
            )}
            <div>
              <p className="font-medium">{category.name}</p>
              {category.description && (
                <p className="text-sm text-muted-foreground">{category.description}</p>
              )}
            </div>
          </div>
          <Badge variant={category.is_active ? "default" : "secondary"}>
            {category.is_active ? 'Active' : 'Inactive'}
          </Badge>
          {category.children && category.children.length > 0 && (
            <Badge variant="outline">
              {category.children.length} sous-catégories
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => toggleCategoryStatus(category.id, category.is_active)}
          >
            {category.is_active ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => openEditDialog(category)}
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => deleteCategory(category.id)}
          >
            <Trash className="h-4 w-4" />
          </Button>
        </div>
      </div>
      {category.children?.map(child => renderCategory(child, depth + 1))}
    </div>
  );

  const getAllCategories = (cats: Category[]): Category[] => {
    const result: Category[] = [];
    cats.forEach(cat => {
      result.push(cat);
      if (cat.children) {
        result.push(...getAllCategories(cat.children));
      }
    });
    return result;
  };

  const allCategories = getAllCategories(categories);

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-muted/30">
        <header className="bg-background border-b">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold">Gestion des Catégories</h1>
                <p className="text-muted-foreground">
                  Organiser les catégories de produits
                </p>
              </div>
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="gap-2">
                    <Plus className="h-4 w-4" />
                    Nouvelle Catégorie
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>
                      {editingCategory ? 'Modifier la catégorie' : 'Nouvelle catégorie'}
                    </DialogTitle>
                    <DialogDescription>
                      {editingCategory ? 'Modifiez' : 'Créez'} une catégorie pour organiser les produits
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleSubmit}>
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium">Nom *</label>
                        <Input
                          value={formData.name}
                          onChange={(e) => setFormData({...formData, name: e.target.value})}
                          placeholder="Nom de la catégorie"
                          required
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium">Description</label>
                        <Textarea
                          value={formData.description}
                          onChange={(e) => setFormData({...formData, description: e.target.value})}
                          placeholder="Description de la catégorie"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium">URL de l'image</label>
                        <Input
                          value={formData.image_url}
                          onChange={(e) => setFormData({...formData, image_url: e.target.value})}
                          placeholder="https://..."
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium">Catégorie parente</label>
                        <select
                          value={formData.parent_id}
                          onChange={(e) => setFormData({...formData, parent_id: e.target.value})}
                          className="w-full px-3 py-2 border rounded-md"
                        >
                          <option value="">Aucune (catégorie racine)</option>
                          {allCategories.map(cat => (
                            <option key={cat.id} value={cat.id}>
                              {cat.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <DialogFooter className="mt-6">
                      <Button type="submit">
                        {editingCategory ? 'Mettre à jour' : 'Créer'}
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </header>

        <div className="container mx-auto px-4 py-8">
          {/* Statistiques */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total</p>
                    <p className="text-2xl font-bold">{allCategories.length}</p>
                  </div>
                  <Folder className="h-8 w-8 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Actives</p>
                    <p className="text-2xl font-bold text-green-600">
                      {allCategories.filter(c => c.is_active).length}
                    </p>
                  </div>
                  <Eye className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Racines</p>
                    <p className="text-2xl font-bold text-blue-600">{categories.length}</p>
                  </div>
                  <FolderOpen className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Liste des catégories */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Hiérarchie des Catégories
              </CardTitle>
              <CardDescription>
                Gérez l'organisation des catégories de produits
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : (
                <div className="space-y-2">
                  {categories.map(category => renderCategory(category))}
                  {categories.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      Aucune catégorie trouvée. Créez la première !
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}