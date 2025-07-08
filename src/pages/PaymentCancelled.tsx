import { useSearchParams, Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { XCircle, ArrowLeft, ShoppingCart } from 'lucide-react';

export default function PaymentCancelled() {
  const [searchParams] = useSearchParams();
  const orderReference = searchParams.get('order');

  return (
    <div className="min-h-screen bg-muted/30 flex items-center justify-center">
      <Card className="w-full max-w-md">
        <CardContent className="text-center py-8">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <XCircle className="h-8 w-8 text-red-600" />
          </div>
          <h1 className="text-2xl font-bold mb-2">Paiement annulé</h1>
          <p className="text-muted-foreground mb-6">
            Votre paiement a été annulé. Vous pouvez reprendre votre commande à tout moment.
          </p>
          
          {orderReference && (
            <div className="mb-6">
              <p className="text-sm text-muted-foreground mb-2">
                Référence de commande:
              </p>
              <code className="bg-muted px-3 py-1 rounded text-sm font-mono">
                {orderReference}
              </code>
            </div>
          )}

          <div className="space-y-3">
            <Link to="/cart" className="block">
              <Button className="w-full">
                <ShoppingCart className="h-4 w-4 mr-2" />
                Retourner au panier
              </Button>
            </Link>
            <Link to="/" className="block">
              <Button variant="outline" className="w-full">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Continuer mes achats
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}