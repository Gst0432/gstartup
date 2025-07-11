import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Edit, Eye, MoreHorizontal, Trash } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Product } from '@/types/vendor';

interface VendorProductActionsDropdownProps {
  product: Product;
  onToggleStatus: (productId: string, isActive: boolean) => void;
  onDelete: (productId: string) => void;
}

export function VendorProductActionsDropdown({ 
  product, 
  onToggleStatus, 
  onDelete 
}: VendorProductActionsDropdownProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem asChild>
          <Link to={`/products/${product.id}`} className="flex items-center">
            <Eye className="h-4 w-4 mr-2" />
            Voir
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link to={`/vendor/products/${product.id}/edit`} className="flex items-center">
            <Edit className="h-4 w-4 mr-2" />
            Modifier
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onToggleStatus(product.id, product.is_active)}>
          {product.is_active ? 'Désactiver' : 'Activer'}
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => onDelete(product.id)}
          className="text-destructive"
        >
          <Trash className="h-4 w-4 mr-2" />
          Supprimer
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}