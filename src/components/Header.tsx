import { useState } from 'react';
import { Menu, X, User, LogOut } from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { LanguageSelector } from './LanguageSelector';
import { useLanguage } from '../hooks/useLanguage';
import { useAuth } from '../hooks/useAuth';

export const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { t } = useLanguage();
  const { isAuthenticated, profile, signOut } = useAuth();

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
    { key: 'home', href: '#home' },
    { key: 'services', href: '#services' },
    { key: 'marketplace', href: '#marketplace' },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <img 
              src="/lovable-uploads/c72d66fa-2175-4b64-b34b-5754d320f178.png" 
              alt="G-STARTUP Logo"
              className="h-8 w-auto"
            />
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-8">
            {navItems.map((item) => (
              <a
                key={item.key}
                href={item.href}
                className="text-foreground hover:text-primary transition-colors font-medium"
              >
                {t(item.key)}
              </a>
            ))}
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
                  <a href={getRoleDashboard()}>
                    <User className="h-4 w-4" />
                    Dashboard
                  </a>
                </Button>
                <Button variant="ghost" size="sm" onClick={() => signOut()}>
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <Button variant="outline" size="sm" asChild className="hidden sm:flex gap-2">
                <a href="/auth">
                  <User className="h-4 w-4" />
                  {t('login')}
                </a>
              </Button>
            )}

            {/* Mobile Menu Button - only visible on mobile */}
            <Button
              variant="ghost"
              size="sm"
              className="lg:hidden p-2"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label="Menu"
            >
              {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="lg:hidden py-4 border-t border-border">
            <nav className="flex flex-col gap-4">
              {navItems.map((item) => (
                <a
                  key={item.key}
                  href={item.href}
                  className="text-foreground hover:text-primary transition-colors font-medium py-2"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {t(item.key)}
                </a>
              ))}
              
              {/* Language Selector for mobile */}
              <div className="xs:hidden mt-2">
                <LanguageSelector />
              </div>
              
              {/* Auth buttons for mobile */}
              {isAuthenticated ? (
                <div className="sm:hidden flex flex-col gap-3 mt-4 pt-4 border-t border-border">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">{profile?.role}</Badge>
                    <span className="text-sm text-muted-foreground">{profile?.display_name}</span>
                  </div>
                  <Button variant="outline" size="sm" asChild className="w-fit gap-2">
                    <a href={getRoleDashboard()} onClick={() => setIsMenuOpen(false)}>
                      <User className="h-4 w-4" />
                      Dashboard
                    </a>
                  </Button>
                  <Button variant="ghost" size="sm" className="w-fit gap-2" onClick={() => { signOut(); setIsMenuOpen(false); }}>
                    <LogOut className="h-4 w-4" />
                    Déconnexion
                  </Button>
                </div>
              ) : (
                <Button variant="outline" size="sm" asChild className="sm:hidden w-fit gap-2 mt-4 pt-4 border-t border-border">
                  <a href="/auth" onClick={() => setIsMenuOpen(false)}>
                    <User className="h-4 w-4" />
                    {t('login')}
                  </a>
                </Button>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};