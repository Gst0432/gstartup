import { useState, useRef } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent } from './ui/card';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ImageUploaderProps {
  label: string;
  value: string;
  onChange: (url: string) => void;
  aspectRatio?: 'square' | 'cover';
  description?: string;
}

export const ImageUploader = ({ 
  label, 
  value, 
  onChange, 
  aspectRatio = 'square',
  description 
}: ImageUploaderProps) => {
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Erreur",
        description: "Veuillez sélectionner un fichier image",
        variant: "destructive"
      });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "Erreur",
        description: "L'image ne doit pas dépasser 5MB",
        variant: "destructive"
      });
      return;
    }

    setUploading(true);

    try {
      // Create unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `vendors/${fileName}`;

      // Upload to Supabase Storage
      const { data, error } = await supabase.storage
        .from('shop')
        .upload(filePath, file);

      if (error) {
        throw error;
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('shop')
        .getPublicUrl(filePath);

      onChange(publicUrl);
      
      toast({
        title: "Succès",
        description: "Image uploadée avec succès"
      });
    } catch (error) {
      console.error('Error uploading image:', error);
      toast({
        title: "Erreur",
        description: "Erreur lors de l'upload de l'image",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = () => {
    onChange('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const aspectRatioClass = aspectRatio === 'square' ? 'aspect-square' : 'aspect-[3/1]';
  const previewClass = aspectRatio === 'square' ? 'w-32 h-32 rounded-full' : 'w-full h-24 rounded';

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label htmlFor={`upload-${label}`} className="text-sm font-medium">
          {label}
        </Label>
        {value && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleRemove}
            className="text-destructive hover:text-destructive"
          >
            <X className="h-4 w-4" />
            Supprimer
          </Button>
        )}
      </div>

      {/* Preview */}
      {value ? (
        <div className="space-y-3">
          <img 
            src={value} 
            alt={`Aperçu ${label}`}
            className={`${previewClass} object-cover border`}
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="w-full"
          >
            <Upload className="h-4 w-4 mr-2" />
            Changer l'image
          </Button>
        </div>
      ) : (
        <Card className="border-dashed border-2 hover:border-primary/50 transition-colors cursor-pointer" onClick={() => fileInputRef.current?.click()}>
          <CardContent className={`${aspectRatioClass} flex flex-col items-center justify-center p-6`}>
            <ImageIcon className="h-12 w-12 text-muted-foreground mb-3" />
            <p className="text-sm text-muted-foreground text-center mb-2">
              Cliquez pour uploader une image
            </p>
            <p className="text-xs text-muted-foreground text-center">
              JPG, PNG jusqu'à 5MB
            </p>
            {uploading && (
              <div className="mt-3 flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                <span className="text-xs text-muted-foreground">Upload en cours...</span>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* URL Input fallback */}
      <div>
        <Label htmlFor={`url-${label}`} className="text-xs text-muted-foreground">
          Ou entrez une URL d'image
        </Label>
        <Input
          id={`url-${label}`}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="https://..."
          className="mt-1"
        />
      </div>

      {description && (
        <p className="text-xs text-muted-foreground">{description}</p>
      )}

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
        disabled={uploading}
      />
    </div>
  );
};