import { useState } from 'react';
import gstartupLogo from '@/assets/gstartup-logo.png';
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
    { key: 'about', href: '#about' },
    { key: 'services', href: '#services' },
    { key: 'marketplace', href: '#marketplace' },
    { key: 'documentation', href: '#documentation' },
    { key: 'contact', href: '#contact' },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">G</span>
            </div>
            <div className="hidden sm:block">
              <span className="font-bold text-lg bg-gradient-primary bg-clip-text text-transparent">
                G-STARTUP LTD
              </span>
            </div>
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
          <div className="flex items-center gap-4">
            <LanguageSelector />
            
            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                <Badge variant="secondary">{profile?.role}</Badge>
                <Button variant="outline" size="sm" asChild className="hidden sm:flex gap-2">
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

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="sm"
              className="lg:hidden"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
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
              <Button variant="outline" size="sm" className="sm:hidden w-fit gap-2 mt-2">
                <User className="h-4 w-4" />
                {t('login')}
              </Button>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};