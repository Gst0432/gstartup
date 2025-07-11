import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Search, Upload, FileText, Calendar, DollarSign } from "lucide-react";
import { format } from "date-fns";

interface OrderResult {
  id: string;
  order_number: string;
  reference_code: string;
  status: string;
  payment_status: string;
  total_amount: number;
  currency: string;
  created_at: string;
  user_id: string;
  profiles: {
    display_name: string;
    email: string;
  };
}

interface OrderDocument {
  id: string;
  document_name: string;
  document_url: string;
  document_type: string;
  created_at: string;
}

export default function AdminOrderDocuments() {
  const [searchEmail, setSearchEmail] = useState("");
  const [searchReference, setSearchReference] = useState("");
  const [orders, setOrders] = useState<OrderResult[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<OrderResult | null>(null);
  const [orderDocuments, setOrderDocuments] = useState<OrderDocument[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const { toast } = useToast();

  const searchOrders = async () => {
    if (!searchEmail.trim() && !searchReference.trim()) {
      toast({
        title: "Erreur",
        description: "Veuillez saisir un email ou une référence de commande",
        variant: "destructive",
      });
      return;
    }

    setIsSearching(true);
    try {
      let query = supabase
        .from("orders")
        .select(`
          *,
          profiles!orders_user_id_fkey(display_name, email)
        `)
        .order("created_at", { ascending: false });

      if (searchEmail.trim()) {
        query = query.eq("profiles.email", searchEmail.trim());
      }

      if (searchReference.trim()) {
        query = query.or(`order_number.ilike.%${searchReference.trim()}%,reference_code.ilike.%${searchReference.trim()}%`);
      }

      const { data, error } = await query;

      if (error) {
        throw error;
      }

      setOrders(data || []);
      setSelectedOrder(null);
      setOrderDocuments([]);

      if (!data || data.length === 0) {
        toast({
          title: "Aucun résultat",
          description: "Aucune commande trouvée avec ces critères",
        });
      }
    } catch (error) {
      console.error("Error searching orders:", error);
      toast({
        title: "Erreur",
        description: "Erreur lors de la recherche des commandes",
        variant: "destructive",
      });
    } finally {
      setIsSearching(false);
    }
  };

  const selectOrder = async (order: OrderResult) => {
    setSelectedOrder(order);
    await loadOrderDocuments(order.id);
  };

  const loadOrderDocuments = async (orderId: string) => {
    try {
      const { data, error } = await supabase
        .from("order_documents")
        .select("*")
        .eq("order_id", orderId)
        .order("created_at", { ascending: false });

      if (error) {
        throw error;
      }

      setOrderDocuments(data || []);
    } catch (error) {
      console.error("Error loading order documents:", error);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type !== "application/pdf") {
        toast({
          title: "Erreur",
          description: "Seuls les fichiers PDF sont acceptés",
          variant: "destructive",
        });
        return;
      }
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        toast({
          title: "Erreur",
          description: "Le fichier ne doit pas dépasser 10MB",
          variant: "destructive",
        });
        return;
      }
      setSelectedFile(file);
    }
  };

  const uploadDocument = async () => {
    if (!selectedFile || !selectedOrder) {
      toast({
        title: "Erreur",
        description: "Veuillez sélectionner un fichier et une commande",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    try {
      // Upload file to Supabase Storage
      const fileName = `order-documents/${selectedOrder.id}/${Date.now()}-${selectedFile.name}`;
      
      const { error: uploadError } = await supabase.storage
        .from("shop")
        .upload(fileName, selectedFile);

      if (uploadError) {
        throw uploadError;
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from("shop")
        .getPublicUrl(fileName);

      // Save document record to database
      const { error: dbError } = await supabase
        .from("order_documents")
        .insert({
          order_id: selectedOrder.id,
          document_name: selectedFile.name,
          document_url: urlData.publicUrl,
          document_type: "pdf",
          file_size: selectedFile.size,
        });

      if (dbError) {
        throw dbError;
      }

      toast({
        title: "Succès",
        description: "Document envoyé avec succès au client",
      });

      setSelectedFile(null);
      await loadOrderDocuments(selectedOrder.id);
      
      // Reset file input
      const fileInput = document.getElementById("file-input") as HTMLInputElement;
      if (fileInput) {
        fileInput.value = "";
      }
    } catch (error) {
      console.error("Error uploading document:", error);
      toast({
        title: "Erreur",
        description: "Erreur lors de l'envoi du document",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-8 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-foreground">Envoyer Documents aux Clients</h1>
        </div>

        {/* Recherche */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              Rechercher une commande
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email du client</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="client@example.com"
                  value={searchEmail}
                  onChange={(e) => setSearchEmail(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="reference">Référence de commande</Label>
                <Input
                  id="reference"
                  placeholder="Numéro ou code de référence"
                  value={searchReference}
                  onChange={(e) => setSearchReference(e.target.value)}
                />
              </div>
            </div>
            <Button 
              onClick={searchOrders} 
              disabled={isSearching}
              className="w-full md:w-auto"
            >
              {isSearching ? "Recherche..." : "Rechercher"}
            </Button>
          </CardContent>
        </Card>

        {/* Résultats de recherche */}
        {orders.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Commandes trouvées ({orders.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {orders.map((order) => (
                  <div
                    key={order.id}
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                      selectedOrder?.id === order.id
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50"
                    }`}
                    onClick={() => selectOrder(order)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">#{order.order_number}</span>
                          {order.reference_code && (
                            <Badge variant="outline">{order.reference_code}</Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {order.profiles.display_name} - {order.profiles.email}
                        </p>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            {format(new Date(order.created_at), "dd/MM/yyyy")}
                          </span>
                          <span className="flex items-center gap-1">
                            <DollarSign className="h-4 w-4" />
                            {order.total_amount} {order.currency}
                          </span>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <Badge 
                          variant={order.status === "confirmed" ? "default" : "secondary"}
                        >
                          {order.status}
                        </Badge>
                        <Badge
                          variant={order.payment_status === "paid" ? "default" : "destructive"}
                        >
                          {order.payment_status}
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Upload de document */}
        {selectedOrder && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5" />
                Envoyer un document à {selectedOrder.profiles.display_name}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="file-input">Sélectionner un fichier PDF</Label>
                <Input
                  id="file-input"
                  type="file"
                  accept=".pdf"
                  onChange={handleFileSelect}
                />
                <p className="text-sm text-muted-foreground">
                  Format accepté : PDF (max 10MB)
                </p>
              </div>

              {selectedFile && (
                <div className="p-3 border rounded-lg bg-muted/50">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    <span className="text-sm">{selectedFile.name}</span>
                    <span className="text-xs text-muted-foreground">
                      ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                    </span>
                  </div>
                </div>
              )}

              <Button 
                onClick={uploadDocument} 
                disabled={!selectedFile || isUploading}
                className="w-full"
              >
                {isUploading ? "Envoi en cours..." : "Envoyer le document"}
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Documents existants */}
        {selectedOrder && orderDocuments.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Documents déjà envoyés
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {orderDocuments.map((doc) => (
                  <div key={doc.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      <span className="text-sm">{doc.document_name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">
                        {format(new Date(doc.created_at), "dd/MM/yyyy à HH:mm")}
                      </span>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => window.open(doc.document_url, "_blank")}
                      >
                        Voir
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}