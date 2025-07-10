import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export interface Category {
  id: string;
  name: string;
}

export interface Vendor {
  id: string;
  business_name: string;
  user_id: string;
}

export interface ProductFormData {
  name: string;
  description: string;
  short_description: string;
  price: string;
  compare_price: string;
  cost_price: string;
  sku: string;
  barcode: string;
  quantity: string;
  weight: string;
  category_id: string;
  vendor_id: string;
  tags: string;
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
}

export const useProductForm = () => {
  const { toast } = useToast();
  const [categories, setCategories] = useState<Category[]>([]);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [images, setImages] = useState<string[]>([]);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);
  
  const [formData, setFormData] = useState<ProductFormData>({
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
    fetchCategories();
    fetchVendors();
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

  const createProduct = async () => {
    try {
      // Validation des champs obligatoires
      if (!formData.category_id || formData.category_id.trim() === '') {
        toast({
          title: "Erreur",
          description: "Veuillez sélectionner une catégorie",
          variant: "destructive"
        });
        return false;
      }

      if (!formData.vendor_id || formData.vendor_id.trim() === '') {
        toast({
          title: "Erreur",
          description: "Veuillez sélectionner un vendeur",
          variant: "destructive"
        });
        return false;
      }

      const productData = {
        ...formData,
        price: parseFloat(formData.price),
        compare_price: formData.compare_price && formData.compare_price.trim() !== '' ? parseFloat(formData.compare_price) : null,
        cost_price: formData.cost_price && formData.cost_price.trim() !== '' ? parseFloat(formData.cost_price) : null,
        quantity: formData.quantity && formData.quantity.trim() !== '' ? parseInt(formData.quantity) : 0,
        weight: formData.weight && formData.weight.trim() !== '' ? parseFloat(formData.weight) : null,
        images: images,
        tags: formData.tags ? formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag !== '') : []
      };

      const { error } = await supabase
        .from('products')
        .insert(productData);

      if (error) {
        console.error('Error creating product:', error);
        throw error;
      }

      toast({
        title: "Succès",
        description: "Produit créé avec succès",
      });
      
      return true;
    } catch (error) {
      console.error('Error creating product:', error);
      toast({
        title: "Erreur",
        description: "Impossible de créer le produit",
        variant: "destructive"
      });
      return false;
    }
  };

  // Nouvelle fonction pour l'édition d'un produit
  const updateProduct = async (productId: string) => {
    try {
      // Validation des champs obligatoires
      if (!formData.category_id || formData.category_id.trim() === '') {
        toast({
          title: "Erreur",
          description: "Veuillez sélectionner une catégorie",
          variant: "destructive"
        });
        return false;
      }

      if (!formData.vendor_id || formData.vendor_id.trim() === '') {
        toast({
          title: "Erreur",
          description: "Veuillez sélectionner un vendeur",
          variant: "destructive"
        });
        return false;
      }

      const productData = {
        ...formData,
        price: parseFloat(formData.price),
        compare_price: formData.compare_price && formData.compare_price.trim() !== '' ? parseFloat(formData.compare_price) : null,
        cost_price: formData.cost_price && formData.cost_price.trim() !== '' ? parseFloat(formData.cost_price) : null,
        quantity: formData.quantity && formData.quantity.trim() !== '' ? parseInt(formData.quantity) : 0,
        weight: formData.weight && formData.weight.trim() !== '' ? parseFloat(formData.weight) : null,
        images: images,
        tags: formData.tags ? formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag !== '') : []
      };

      const { error } = await supabase
        .from('products')
        .update(productData)
        .eq('id', productId);

      if (error) {
        console.error('Error updating product:', error);
        throw error;
      }

      toast({
        title: "Succès",
        description: "Produit mis à jour avec succès",
      });
      
      return true;
    } catch (error) {
      console.error('Error updating product:', error);
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour le produit",
        variant: "destructive"
      });
      return false;
    }
  };

  // Nouvelle fonction pour charger un produit existant
  const loadProduct = async (productId: string) => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', productId)
        .single();

      if (error) {
        console.error('Error loading product:', error);
        throw error;
      }

      if (data) {
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
          tags: data.tags?.join(', ') || '',
          digital_file_url: data.digital_file_url || '',
          preview_url: data.preview_url || '',
          demo_url: data.demo_url || '',
          is_digital: data.is_digital || true,
          is_active: data.is_active || true,
          is_featured: data.is_featured || false,
          track_quantity: data.track_quantity || false,
          requires_shipping: data.requires_shipping || false,
          allow_backorder: data.allow_backorder || false,
          meta_title: data.meta_title || '',
          meta_description: data.meta_description || ''
        });
        
        setImages(data.images || []);
      }
      
      return true;
    } catch (error) {
      console.error('Error loading product:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger le produit",
        variant: "destructive"
      });
      return false;
    }
  };

  return {
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
    createProduct,
    updateProduct,
    loadProduct
  };
};