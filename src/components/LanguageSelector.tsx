import { Globe, ChevronDown } from 'lucide-react';
import { Button } from './ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { useLanguage, Language, Currency } from '../hooks/useLanguage';

export const LanguageSelector = () => {
  const { language, setLanguage, currency, setCurrency, t } = useLanguage();

  const languages: { code: Language; name: string; flag: string }[] = [
    { code: 'fr', name: 'Français', flag: '🇫🇷' },
    { code: 'en', name: 'English', flag: '🇺🇸' },
  ];

  const currencies: { code: Currency; name: string; symbol: string }[] = [
    { code: 'FCFA', name: 'CFA Franc', symbol: 'FCFA' },
    { code: 'XAF', name: 'Central African CFA', symbol: 'XAF' },
    { code: 'USD', name: 'US Dollar', symbol: '$' },
    { code: 'FGN', name: 'Nigerian Naira', symbol: '₦' },
  ];

  const currentLang = languages.find(l => l.code === language);
  const currentCurrency = currencies.find(c => c.code === currency);

  return (
    <div className="flex items-center gap-2">
      {/* Language Selector */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className="gap-1">
            <Globe className="h-4 w-4" />
            <span className="hidden sm:inline">{currentLang?.flag} {currentLang?.name}</span>
            <span className="sm:hidden">{currentLang?.flag}</span>
            <ChevronDown className="h-3 w-3" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {languages.map((lang) => (
            <DropdownMenuItem
              key={lang.code}
              onClick={() => setLanguage(lang.code)}
              className={language === lang.code ? 'bg-accent' : ''}
            >
              <span className="mr-2">{lang.flag}</span>
              {lang.name}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Currency Selector */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className="gap-1">
            <span className="hidden sm:inline">{currentCurrency?.symbol}</span>
            <span className="sm:hidden">{currentCurrency?.symbol}</span>
            <ChevronDown className="h-3 w-3" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {currencies.map((curr) => (
            <DropdownMenuItem
              key={curr.code}
              onClick={() => setCurrency(curr.code)}
              className={currency === curr.code ? 'bg-accent' : ''}
            >
              <span className="mr-2">{curr.symbol}</span>
              {curr.name}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};