import { useState } from 'react';
import { Menu, X, User, LogOut } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { LanguageSelector } from './LanguageSelector';
import { useLanguage } from '../hooks/useLanguage';
import { useAuth } from '../hooks/useAuth';

export const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { t } = useLanguage();
  const { isAuthenticated, profile, signOut } = useAuth();
  const location = useLocation();

  const getRoleDashboard = () => {
    if (!profile) return '/auth';
    switch (profile.role) {
      case 'admin': return '/admin';
      case 'vendor': return '/vendor';
      case 'customer': return '/dashboard';
      default: return '/dashboard';
    }
  };

  const navItems = [
    { key: 'home', href: '/' },
    { key: 'marketplace', href: '/marketplace' },
    { key: 'about', href: '/#about' },
    { key: 'services', href: '/#services' },
    { key: 'documentation', href: '/#documentation' },
    { key: 'contact', href: '/#contact' },
  ];

  const handleMenuItemClick = () => {
    setIsMenuOpen(false);
  };

  const isActiveRoute = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname === path;
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 touch-target">
            <img 
              src="/lovable-uploads/c72d66fa-2175-4b64-b34b-5754d320f178.png" 
              alt="G-STARTUP Logo"
              className="h-8 w-auto transition-smooth will-change-transform hover:scale-105"
            />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-8">
            {navItems.map((item) => {
              const isActive = isActiveRoute(item.href);
              if (item.href.startsWith('/#')) {
                return (
                  <a
                    key={item.key}
                    href={item.href}
                    className={`text-foreground hover:text-primary transition-colors font-medium ${
                      isActive ? 'text-primary' : ''
                    }`}
                  >
                    {t(item.key)}
                  </a>
                );
              }
              return (
                <Link
                  key={item.key}
                  to={item.href}
                  className={`text-foreground hover:text-primary transition-smooth font-medium touch-target ${
                    isActive ? 'text-primary border-b-2 border-primary' : ''
                  }`}
                >
                  {t(item.key)}
                </Link>
              );
            })}
          </nav>

          {/* Right Side */}
          <div className="flex items-center gap-2 sm:gap-4">
            {/* Language Selector - hidden on small mobile */}
            <div className="hidden xs:block">
              <LanguageSelector />
            </div>
            
            {/* Auth buttons - hidden on mobile, shown on tablet+ */}
            {isAuthenticated ? (
              <div className="hidden sm:flex items-center gap-3">
                <Badge variant="secondary">{profile?.role}</Badge>
                <Button variant="outline" size="sm" asChild className="gap-2">
                  <Link to={getRoleDashboard()}>
                    <User className="h-4 w-4" />
                    Dashboard
                  </Link>
                </Button>
                <Button variant="ghost" size="sm" onClick={() => signOut()}>
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <Button variant="outline" size="sm" asChild className="hidden sm:flex gap-2">
                <Link to="/auth">
                  <User className="h-4 w-4" />
                  {t('login')}
                </Link>
              </Button>
            )}

            {/* Mobile Menu Button - only visible on mobile */}
            <Button
              variant="ghost"
              size="sm"
              className="lg:hidden p-2 touch-target transition-smooth"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label="Menu"
            >
              {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="lg:hidden py-4 border-t border-border bg-background/95 backdrop-blur-sm mobile-menu-enter">
            <nav className="flex flex-col gap-2">
              {navItems.map((item) => {
                const isActive = isActiveRoute(item.href);
                if (item.href.startsWith('/#')) {
                  return (
                    <a
                      key={item.key}
                      href={item.href}
                    className={`text-foreground hover:text-primary transition-smooth font-medium py-3 px-2 rounded-md touch-target ${
                      isActive ? 'bg-primary/10 text-primary' : 'hover:bg-muted'
                    }`}
                      onClick={handleMenuItemClick}
                    >
                      {t(item.key)}
                    </a>
                  );
                }
                return (
                  <Link
                    key={item.key}
                    to={item.href}
                    className={`text-foreground hover:text-primary transition-smooth font-medium py-3 px-2 rounded-md touch-target ${
                      isActive ? 'bg-primary/10 text-primary' : 'hover:bg-muted'
                    }`}
                    onClick={handleMenuItemClick}
                  >
                    {t(item.key)}
                  </Link>
                );
              })}
              
              {/* Mobile Auth Buttons */}
              {isAuthenticated ? (
                <div className="flex flex-col gap-2 mt-4 pt-4 border-t border-border">
                  <div className="flex items-center justify-between px-2">
                    <Badge variant="secondary">{profile?.role}</Badge>
                  </div>
                  <Button variant="outline" size="sm" asChild className="w-full gap-2">
                    <Link to={getRoleDashboard()} onClick={handleMenuItemClick}>
                      <User className="h-4 w-4" />
                      Dashboard
                    </Link>
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => {
                      signOut();
                      handleMenuItemClick();
                    }}
                    className="w-full gap-2"
                  >
                    <LogOut className="h-4 w-4" />
                    {t('logout')}
                  </Button>
                </div>
              ) : (
                <Button variant="outline" size="sm" asChild className="w-full gap-2 mt-4">
                  <Link to="/auth" onClick={handleMenuItemClick}>
                    <User className="h-4 w-4" />
                    {t('login')}
                  </Link>
                </Button>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};