import { Search, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface ShopsHeaderProps {
  searchTerm: string;
  sortBy: string;
  filterVerified: boolean;
  onSearch: (value: string) => void;
  onSortChange: (value: string) => void;
  onFilterChange: (verified: boolean) => void;
}

export function ShopsHeader({
  searchTerm,
  sortBy,
  filterVerified,
  onSearch,
  onSortChange,
  onFilterChange
}: ShopsHeaderProps) {
  return (
    <header className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b sticky top-0 z-40">
      <div className="container mx-auto px-4 py-6">
        <div className="text-center mb-6">
          <h1 className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent mb-2">
            Découvrez nos Boutiques
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Explorez une sélection de boutiques en ligne proposant des produits et services de qualité
          </p>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col md:flex-row gap-4 max-w-4xl mx-auto">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4 z-10" />
            <Input
              placeholder="Rechercher une boutique..."
              value={searchTerm}
              onChange={(e) => onSearch(e.target.value)}
              className="pl-10 bg-background"
            />
          </div>

          <div className="flex gap-2">
            <Select value={sortBy} onValueChange={onSortChange}>
              <SelectTrigger className="w-48 bg-background">
                <SelectValue placeholder="Trier par" />
              </SelectTrigger>
              <SelectContent className="bg-background border shadow-lg z-50">
                <SelectItem value="name">Nom A-Z</SelectItem>
                <SelectItem value="rating">Meilleures notes</SelectItem>
                <SelectItem value="sales">Plus vendues</SelectItem>
                <SelectItem value="newest">Plus récentes</SelectItem>
              </SelectContent>
            </Select>

            <Button
              variant={filterVerified ? "default" : "outline"}
              onClick={() => onFilterChange(!filterVerified)}
              className="gap-2 bg-background hover:bg-accent"
            >
              <Filter className="h-4 w-4" />
              Vérifiées
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}