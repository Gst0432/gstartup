import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FileText } from 'lucide-react';

interface ProductFileUploadProps {
  digitalFileUrl: string;
  uploadingFile: boolean;
  onFileUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

export function ProductFileUpload({ 
  digitalFileUrl, 
  uploadingFile, 
  onFileUpload 
}: ProductFileUploadProps) {
  return (
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
                  onChange={onFileUpload}
                  disabled={uploadingFile}
                />
              </Label>
              <p className="text-xs text-muted-foreground mt-1">
                ZIP ou PDF, max 10GB
              </p>
            </div>
          </div>
        </div>
        
        {digitalFileUrl && (
          <div className="flex items-center gap-2 p-2 bg-muted rounded-lg">
            <FileText className="h-4 w-4 text-green-600" />
            <span className="text-sm text-green-600">Fichier téléversé</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}