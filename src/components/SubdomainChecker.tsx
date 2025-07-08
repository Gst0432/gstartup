import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

interface SubdomainCheckerProps {
  children: React.ReactNode;
}

export function SubdomainChecker({ children }: SubdomainCheckerProps) {
  const [isChecking, setIsChecking] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const checkSubdomain = async () => {
      const hostname = window.location.hostname;
      
      // Check if we're on a subdomain (*.gstartup.pro)
      if (hostname.endsWith('.gstartup.pro') && hostname !== 'gstartup.pro') {
        const subdomain = hostname.replace('.gstartup.pro', '');
        
        try {
          // Find vendor by subdomain
          const { data: vendor, error } = await supabase
            .from('vendors')
            .select('id')
            .eq('subdomain', subdomain)
            .eq('is_active', true)
            .single();
          
          if (!error && vendor) {
            // Redirect to vendor store page
            navigate(`/store/${vendor.id}`, { replace: true });
          }
        } catch (error) {
          console.error('Error checking subdomain:', error);
        }
      }
      
      setIsChecking(false);
    };

    checkSubdomain();
  }, [navigate]);

  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return <>{children}</>;
}