import { useEffect, useState } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import NotFound from './NotFound';

export default function StorePage() {
  const { storeSlug } = useParams();
  const [vendorId, setVendorId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const fetchVendorBySlug = async () => {
      if (!storeSlug) {
        setNotFound(true);
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('vendors')
          .select('id')
          .eq('store_slug', storeSlug)
          .eq('is_active', true)
          .maybeSingle();

        if (error) {
          console.error('Error fetching vendor by slug:', error);
          setNotFound(true);
        } else if (data) {
          setVendorId(data.id);
        } else {
          setNotFound(true);
        }
      } catch (error) {
        console.error('Error fetching vendor by slug:', error);
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    };

    fetchVendorBySlug();
  }, [storeSlug]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (notFound || !vendorId) {
    return <NotFound />;
  }

  // Rediriger vers la route /store/:vendorId
  return <Navigate to={`/store/${vendorId}`} replace />;
}