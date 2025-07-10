import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { DashboardLayout } from '@/components/DashboardLayout';
import { useNavigate } from 'react-router-dom';
import { useProductForm } from '@/hooks/useProductForm';
import { ProductBasicInfo } from '@/components/admin/ProductBasicInfo';
import { ProductImageUpload } from '@/components/admin/ProductImageUpload';
import { ProductFileUpload } from '@/components/admin/ProductFileUpload';
import { ProductPreviewSection } from '@/components/admin/ProductPreviewSection';
import { ProductPublicationOptions } from '@/components/admin/ProductPublicationOptions';

export default function AdminProductNew() {
  const { profile } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  
  const {
    formData,
    categories,
    vendors,
    images,
    uploadingFile,
    uploadingImages,
    handleInputChange,
    handleFileUpload,
    handleImageUpload,
    removeImage,
    createProduct
  } = useProductForm();

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

    // Les validations sont maintenant gérées dans useProductForm
    setLoading(true);
    const success = await createProduct();
    setLoading(false);

    if (success) {
      navigate('/admin/products');
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
            {/* Informations générales */}
            <ProductBasicInfo
              formData={formData}
              categories={categories}
              vendors={vendors}
              onInputChange={handleInputChange}
            />

            {/* Images du produit */}
            <ProductImageUpload
              images={images}
              uploadingImages={uploadingImages}
              onImageUpload={handleImageUpload}
              onRemoveImage={removeImage}
            />

            {/* Fichiers et URLs */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* Fichier principal */}
              <ProductFileUpload
                digitalFileUrl={formData.digital_file_url}
                uploadingFile={uploadingFile}
                onFileUpload={handleFileUpload}
              />

              {/* URLs de prévisualisation */}
              <ProductPreviewSection
                formData={formData}
                onInputChange={handleInputChange}
              />
            </div>

            {/* Options finales */}
            <ProductPublicationOptions
              formData={formData}
              onInputChange={handleInputChange}
            />

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