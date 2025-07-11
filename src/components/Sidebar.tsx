import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  Home,
  Package, 
  ShoppingCart, 
  Heart, 
  Settings,
  Store,
  Users,
  TrendingUp,
  Plus,
  BarChart3,
  Shield,
  LogOut,
  Menu,
  X,
  Star,
  CreditCard,
  Languages,
  DollarSign,
  Images
} from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { LanguageSelector } from './LanguageSelector';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';

interface SidebarProps {
  role: 'customer' | 'vendor' | 'admin';
  onClose?: () => void;
  isMobile?: boolean;
}

export const Sidebar = ({ role, onClose, isMobile = false }: SidebarProps) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const location = useLocation();
  const { profile, signOut } = useAuth();

  const customerItems = [
    { title: 'Tableau de Bord', url: '/dashboard', icon: Home },
    { title: 'Marketplace', url: '/#marketplace', icon: Store },
    { title: 'Mon Panier', url: '/cart', icon: ShoppingCart },
    { title: 'Mes Favoris', url: '/wishlist', icon: Heart },
    { title: 'Mes Commandes', url: '/orders', icon: Package },
    { title: 'Profil', url: '/profile', icon: Settings },
  ];

  const vendorItems = [
    { title: 'Tableau de Bord', url: '/vendor', icon: Home },
    { title: 'Mes Produits', url: '/vendor/products', icon: Package },
    { title: 'Ajouter Produit', url: '/vendor/products/new', icon: Plus },
    { title: 'Commandes', url: '/vendor/orders', icon: ShoppingCart },
    { title: 'Statistiques', url: '/vendor/analytics', icon: BarChart3 },
    { title: 'Avis', url: '/vendor/reviews', icon: Star },
    { title: 'Retraits', url: '/vendor/withdrawals', icon: CreditCard },
    { title: 'Profil Vendeur', url: '/vendor/profile', icon: Settings },
  ];

  const adminItems = [
    { title: 'Tableau de Bord', url: '/admin', icon: Home },
    { title: 'Utilisateurs', url: '/admin/users', icon: Users },
    { title: 'Vendeurs', url: '/admin/vendors', icon: Shield },
    { title: 'Produits', url: '/admin/products', icon: Package },
    { title: 'Commandes', url: '/admin/orders', icon: ShoppingCart },
    { title: 'Catégories', url: '/admin/categories', icon: Settings },
    { title: 'Images Pub', url: '/admin/advertisements', icon: Images },
    { title: 'Retraits', url: '/admin/withdrawals', icon: CreditCard },
    { title: 'Paramètres', url: '/admin/settings', icon: Settings },
    { title: 'Analytics', url: '/admin/analytics', icon: TrendingUp },
  ];

  const getItems = () => {
    switch (role) {
      case 'vendor': return vendorItems;
      case 'admin': return adminItems;
      default: return customerItems;
    }
  };

  const getRoleLabel = () => {
    switch (role) {
      case 'vendor': return 'Vendeur';
      case 'admin': return 'Administrateur';
      default: return 'Client';
    }
  };

  const getRoleBadgeVariant = () => {
    switch (role) {
      case 'admin': return 'destructive';
      case 'vendor': return 'default';
      default: return 'secondary';
    }
  };

  const isActive = (path: string) => {
    if (path.startsWith('/#')) {
      return false; // External links
    }
    return location.pathname === path;
  };

  const items = getItems();

  return (
    <div className={cn(
      "h-screen bg-background border-r border-border flex flex-col transition-all duration-300",
      isMobile ? "w-64" : (isCollapsed ? "w-16" : "w-64")
    )}>
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between">
          {(!isCollapsed || isMobile) && (
            <div className="flex items-center justify-center">
              <img 
                src="/lovable-uploads/c72d66fa-2175-4b64-b34b-5754d320f178.png" 
                alt="G-STARTUP Logo"
                className="h-8 w-auto"
              />
            </div>
          )}
          {isMobile ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="p-2"
            >
              <X className="h-4 w-4" />
            </Button>
          ) : (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="p-2"
            >
              {isCollapsed ? <Menu className="h-4 w-4" /> : <X className="h-4 w-4" />}
            </Button>
          )}
        </div>
      </div>

      {/* User Info */}
      {(!isCollapsed || isMobile) && (
        <div className="p-4 border-b border-border">
          <div className="space-y-2">
            <p className="text-sm font-medium truncate">{profile?.display_name}</p>
            <Badge variant={getRoleBadgeVariant()} className="text-xs">
              {getRoleLabel()}
            </Badge>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 p-2">
        <div className="space-y-1">
          {items.map((item) => {
            const isItemActive = isActive(item.url);
            
            if (item.url.startsWith('/#')) {
              return (
                <a
                  key={item.title}
                  href={item.url}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors",
                    "hover:bg-muted",
                    (isCollapsed && !isMobile) && "justify-center"
                  )}
                  title={(isCollapsed && !isMobile) ? item.title : undefined}
                  onClick={isMobile ? onClose : undefined}
                >
                  <item.icon className="h-4 w-4 flex-shrink-0" />
                  {(!isCollapsed || isMobile) && <span>{item.title}</span>}
                </a>
              );
            }

            return (
              <NavLink
                key={item.title}
                to={item.url}
                className={({ isActive }) => cn(
                  "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors",
                  isActive 
                    ? "bg-primary text-primary-foreground" 
                    : "hover:bg-muted",
                  (isCollapsed && !isMobile) && "justify-center"
                )}
                title={(isCollapsed && !isMobile) ? item.title : undefined}
                onClick={isMobile ? onClose : undefined}
              >
                <item.icon className="h-4 w-4 flex-shrink-0" />
                {(!isCollapsed || isMobile) && <span>{item.title}</span>}
              </NavLink>
            );
          })}
        </div>
      </nav>

      {/* Language and Currency Selector */}
      {(!isCollapsed || isMobile) && (
        <div className="p-2 border-t border-border">
          <div className="mb-2">
            <LanguageSelector />
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="p-2 border-t border-border">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => signOut()}
          className={cn(
            "w-full justify-start gap-3",
            (isCollapsed && !isMobile) && "justify-center px-2"
          )}
          title={(isCollapsed && !isMobile) ? "Déconnexion" : undefined}
        >
          <LogOut className="h-4 w-4 flex-shrink-0" />
          {(!isCollapsed || isMobile) && <span>Déconnexion</span>}
        </Button>
      </div>
    </div>
  );
};