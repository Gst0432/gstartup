import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Upload, X } from 'lucide-react';

interface ProductImageUploadProps {
  images: string[];
  uploadingImages: boolean;
  onImageUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onRemoveImage: (index: number) => void;
}

export function ProductImageUpload({ 
  images, 
  uploadingImages, 
  onImageUpload, 
  onRemoveImage 
}: ProductImageUploadProps) {
  return (
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
                  onChange={onImageUpload}
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
                  onClick={() => onRemoveImage(index)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}