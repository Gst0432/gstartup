/**
 * Utilities for handling vendor subdomains
 */

/**
 * Extract subdomain from hostname
 * Returns null if no subdomain or if it's a known non-vendor subdomain
 */
export function extractSubdomain(hostname: string): string | null {
  // Remove port if present
  const cleanHostname = hostname.split(':')[0];
  
  // Split by dots
  const parts = cleanHostname.split('.');
  
  // Need at least 3 parts for a subdomain (sub.domain.com)
  if (parts.length < 3) {
    return null;
  }
  
  // The subdomain is the first part
  const subdomain = parts[0];
  
  // Exclude known system subdomains
  const systemSubdomains = ['www', 'api', 'admin', 'app', 'dashboard', 'cdn', 'static'];
  if (systemSubdomains.includes(subdomain)) {
    return null;
  }
  
  // Check if it's a valid vendor subdomain format
  if (!/^[a-z0-9-]+$/.test(subdomain) || subdomain.length < 3 || subdomain.length > 50) {
    return null;
  }
  
  return subdomain;
}

/**
 * Check if current request is from a vendor subdomain
 */
export function isVendorSubdomain(): string | null {
  if (typeof window === 'undefined') {
    return null;
  }
  
  return extractSubdomain(window.location.hostname);
}

/**
 * Generate vendor store URL from subdomain
 */
export function getVendorStoreUrl(subdomain: string, isProduction = false): string {
  const baseUrl = isProduction ? 'gstartup.pro' : window.location.host.replace(/^[^.]+\./, '');
  return `https://${subdomain}.${baseUrl}`;
}

/**
 * Redirect to main domain (removes subdomain)
 */
export function redirectToMainDomain(path = '/') {
  if (typeof window === 'undefined') {
    return;
  }
  
  const hostname = window.location.hostname;
  const parts = hostname.split('.');
  
  if (parts.length >= 3) {
    // Remove subdomain and redirect
    const mainDomain = parts.slice(1).join('.');
    const protocol = window.location.protocol;
    const port = window.location.port ? `:${window.location.port}` : '';
    
    window.location.href = `${protocol}//${mainDomain}${port}${path}`;
  }
}