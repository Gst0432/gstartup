import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Vendor {
  id: string;
  business_name: string;
  description: string;
  logo_url?: string;
  cover_image_url?: string;
  address?: string;
  phone?: string;
  website_url?: string;
  store_slug?: string;
  rating?: number;
  total_sales?: number;
  is_verified: boolean;
}

export function useShops() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { toast } = useToast();
  
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const [sortBy, setSortBy] = useState(searchParams.get('sort') || 'name');
  const [filterVerified, setFilterVerified] = useState(searchParams.get('verified') === 'true');
  const [currentPage, setCurrentPage] = useState(parseInt(searchParams.get('page') || '1'));
  
  const itemsPerPage = 12;
  const [totalVendors, setTotalVendors] = useState(0);
  const totalPages = Math.ceil(totalVendors / itemsPerPage);

  useEffect(() => {
    fetchVendors();
  }, [searchTerm, sortBy, filterVerified, currentPage]);

  useEffect(() => {
    // Update URL params
    const params = new URLSearchParams();
    if (searchTerm) params.set('search', searchTerm);
    if (sortBy !== 'name') params.set('sort', sortBy);
    if (filterVerified) params.set('verified', 'true');
    if (currentPage > 1) params.set('page', currentPage.toString());
    setSearchParams(params);
  }, [searchTerm, sortBy, filterVerified, currentPage, setSearchParams]);

  const fetchVendors = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('vendors')
        .select('*', { count: 'exact' })
        .eq('is_active', true);

      // Apply search filter
      if (searchTerm) {
        query = query.or(`business_name.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%,address.ilike.%${searchTerm}%`);
      }

      // Apply verified filter
      if (filterVerified) {
        query = query.eq('is_verified', true);
      }

      // Apply sorting
      switch (sortBy) {
        case 'rating':
          query = query.order('rating', { ascending: false, nullsFirst: false });
          break;
        case 'sales':
          query = query.order('total_sales', { ascending: false, nullsFirst: false });
          break;
        case 'newest':
          query = query.order('created_at', { ascending: false });
          break;
        default:
          query = query.order('business_name', { ascending: true });
      }

      // Apply pagination
      const from = (currentPage - 1) * itemsPerPage;
      const to = from + itemsPerPage - 1;
      query = query.range(from, to);

      const { data, error, count } = await query;

      if (error) {
        console.error('Error fetching vendors:', error);
        toast({
          title: "Erreur",
          description: "Impossible de charger les boutiques",
          variant: "destructive"
        });
        return;
      }

      setVendors(data || []);
      setTotalVendors(count || 0);
    } catch (error) {
      console.error('Error fetching vendors:', error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const clearFilters = () => {
    setSearchTerm('');
    setFilterVerified(false);
    setCurrentPage(1);
  };

  return {
    vendors,
    loading,
    searchTerm,
    sortBy,
    filterVerified,
    currentPage,
    totalVendors,
    totalPages,
    itemsPerPage,
    handleSearch,
    setSortBy,
    setFilterVerified,
    handlePageChange,
    clearFilters
  };
}