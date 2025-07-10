import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { DashboardLayout } from '@/components/DashboardLayout';
import { useProductForm } from '@/hooks/useProductForm';
import { ProductBasicInfo } from '@/components/admin/ProductBasicInfo';
import { ProductImageUpload } from '@/components/admin/ProductImageUpload';
import { ProductFileUpload } from '@/components/admin/ProductFileUpload';
import { ProductPreviewSection } from '@/components/admin/ProductPreviewSection';
import { ProductPublicationOptions } from '@/components/admin/ProductPublicationOptions';

export default function AdminProductEdit() {
  const { id } = useParams<{ id: string }>();
  const { profile } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [loadingProduct, setLoadingProduct] = useState(true);
  
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
    updateProduct,
    loadProduct
  } = useProductForm();

  useEffect(() => {
    if (id) {
      const loadProductData = async () => {
        setLoadingProduct(true);
        await loadProduct(id);
        setLoadingProduct(false);
      };
      loadProductData();
    }
  }, [id, loadProduct]);

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

    if (!id) {
      toast({
        title: "Erreur",
        description: "ID du produit manquant",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    const success = await updateProduct(id);
    setLoading(false);

    if (success) {
      navigate('/admin/products');
    }
  };

  if (loadingProduct) {
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
                  Mettre à jour les informations du produit
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
                {loading ? 'Mise à jour...' : 'Mettre à jour le produit'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
}