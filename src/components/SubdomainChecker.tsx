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
      console.log('Checking hostname:', hostname);
      
      // Check if we're on a subdomain (*.gstartup.pro)
      if (hostname.endsWith('.gstartup.pro') && hostname !== 'gstartup.pro') {
        const subdomain = hostname.replace('.gstartup.pro', '');
        console.log('Detected subdomain:', subdomain);
        
        try {
          // Find vendor by subdomain
          const { data: vendor, error } = await supabase
            .from('vendors')
            .select('id')
            .eq('subdomain', subdomain)
            .eq('is_active', true)
            .single();
          
          console.log('Vendor found:', vendor, 'Error:', error);
          
          if (!error && vendor) {
            console.log('Redirecting to store:', `/store/${vendor.id}`);
            // Only redirect if we're not already on the store page
            if (!window.location.pathname.startsWith(`/store/${vendor.id}`)) {
              navigate(`/store/${vendor.id}`, { replace: true });
            }
          } else {
            console.log('No vendor found for subdomain:', subdomain);
          }
        } catch (error) {
          console.error('Error checking subdomain:', error);
        }
      } else {
        console.log('Not a gstartup.pro subdomain');
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