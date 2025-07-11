import { useState } from 'react';
import { Button } from './ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from './ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Badge } from './ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { 
  LogOut, 
  Settings, 
  User, 
  Globe, 
  DollarSign,
  Euro,
  Banknote
} from 'lucide-react';

interface DashboardHeaderProps {
  title: string;
  description?: string;
}

export const DashboardHeader = ({ title, description }: DashboardHeaderProps) => {
  const { profile, signOut } = useAuth();
  const { toast } = useToast();
  const [currency, setCurrency] = useState('XAF');
  const [language, setLanguage] = useState('fr');

  const handleSignOut = async () => {
    try {
      await signOut();
      toast({
        title: "Déconnexion réussie",
        description: "À bientôt !",
      });
    } catch (error) {
      toast({
        title: "Erreur de déconnexion",
        description: "Une erreur s'est produite lors de la déconnexion",
        variant: "destructive",
      });
    }
  };

  const currencies = [
    { value: 'XAF', label: 'XAF (FCFA)', icon: Banknote },
    { value: 'EUR', label: 'EUR (Euro)', icon: Euro },
    { value: 'USD', label: 'USD (Dollar)', icon: DollarSign },
  ];

  const languages = [
    { value: 'fr', label: 'Français', flag: '🇫🇷' },
    { value: 'en', label: 'English', flag: '🇺🇸' },
    { value: 'es', label: 'Español', flag: '🇪🇸' },
  ];

  const selectedCurrency = currencies.find(c => c.value === currency);
  const selectedLanguage = languages.find(l => l.value === language);

  return (
    <div className="border-b bg-card p-4">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
          {description && (
            <p className="text-sm text-muted-foreground">{description}</p>
          )}
        </div>

        <div className="flex items-center gap-4">
          {/* Currency Selector */}
          <Select value={currency} onValueChange={setCurrency}>
            <SelectTrigger className="w-32">
              <div className="flex items-center gap-2">
                {selectedCurrency && <selectedCurrency.icon className="h-4 w-4" />}
                <SelectValue />
              </div>
            </SelectTrigger>
            <SelectContent className="bg-card border shadow-lg z-50">
              {currencies.map((curr) => (
                <SelectItem key={curr.value} value={curr.value}>
                  <div className="flex items-center gap-2">
                    <curr.icon className="h-4 w-4" />
                    {curr.label}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Language Selector */}
          <Select value={language} onValueChange={setLanguage}>
            <SelectTrigger className="w-32">
              <div className="flex items-center gap-2">
                <Globe className="h-4 w-4" />
                <span>{selectedLanguage?.flag}</span>
                <SelectValue />
              </div>
            </SelectTrigger>
            <SelectContent className="bg-card border shadow-lg z-50">
              {languages.map((lang) => (
                <SelectItem key={lang.value} value={lang.value}>
                  <div className="flex items-center gap-2">
                    <span>{lang.flag}</span>
                    {lang.label}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={profile?.avatar_url || ''} alt={profile?.display_name || ''} />
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    {profile?.display_name?.charAt(0)?.toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56 bg-card border shadow-lg z-50" align="end" forceMount>
              <div className="flex items-center justify-start gap-2 p-2">
                <div className="flex flex-col space-y-1 leading-none">
                  <p className="font-medium">{profile?.display_name}</p>
                  <p className="text-xs text-muted-foreground">
                    {profile?.email}
                  </p>
                  <Badge variant="secondary" className="w-fit text-xs">
                    {profile?.role === 'admin' ? 'Administrateur' : 
                     profile?.role === 'vendor' ? 'Vendeur' : 'Client'}
                  </Badge>
                </div>
              </div>
              
              <DropdownMenuSeparator />
              
              <DropdownMenuItem>
                <User className="mr-2 h-4 w-4" />
                <span>Profil</span>
              </DropdownMenuItem>
              
              <DropdownMenuItem>
                <Settings className="mr-2 h-4 w-4" />
                <span>Paramètres</span>
              </DropdownMenuItem>
              
              <DropdownMenuSeparator />
              
              <DropdownMenuItem 
                onClick={handleSignOut}
                className="text-destructive focus:text-destructive"
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span>Se déconnecter</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Version Badge */}
          <Badge variant="outline" className="text-xs font-mono">
            v1.0.0
          </Badge>
        </div>
      </div>
    </div>
  );
};