
import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/hooks/useLanguage';
import { usePendingPurchase } from '@/hooks/usePendingPurchase';
import { Loader2, Eye, EyeOff, ShoppingCart, ArrowLeft } from 'lucide-react';
import logoTransparent from '@/assets/g-startup-logo-transparent.png';

export default function Auth() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    displayName: ''
  });

  const { signIn, signUp, isAuthenticated, profile } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { pendingPurchase } = usePendingPurchase();

  useEffect(() => {
    if (isAuthenticated && profile) {
      // Si il y a un achat en attente, rediriger vers la page produit
      if (pendingPurchase) {
        navigate(`/product/${pendingPurchase.productId}`);
        return;
      }

      // Sinon, rediriger vers la landing page par défaut
      navigate('/');
    }
  }, [isAuthenticated, profile, navigate, pendingPurchase]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
    setError(null);
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const { error } = await signIn(formData.email, formData.password);
    
    if (error) {
      setError(error.message);
    }
    
    setIsLoading(false);
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    if (!formData.displayName.trim()) {
      setError('Le nom d\'affichage est requis');
      setIsLoading(false);
      return;
    }

    const { error } = await signUp(formData.email, formData.password, formData.displayName);
    
    if (error) {
      setError(error.message);
    } else {
      setError(null);
      alert('Compte créé avec succès ! Vous pouvez maintenant vous connecter.');
    }
    
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-primary flex items-center justify-center p-4 relative">
      {/* Retour à l'accueil - Position fixe en haut */}
      <Link 
        to="/"
        className="absolute top-6 left-6 z-10 text-white hover:text-white/80 transition-colors flex items-center gap-2 touch-target"
      >
        <ArrowLeft className="h-5 w-5" />
        <span className="hidden sm:inline">Retour à l'accueil</span>
      </Link>

      <div className="w-full max-w-md">
        {/* Logo et titre avec le PNG transparent */}
        <div className="text-center mb-8 animate-fade-in">
          <div className="flex justify-center mb-4">
            <img 
              src={logoTransparent} 
              alt="G-STARTUP Logo"
              className="h-16 w-16 object-contain drop-shadow-lg"
            />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">G-STARTUP LTD</h1>
          <p className="text-white/80">Accédez à votre marketplace numérique</p>
        </div>

        {/* Alerte achat en attente */}
        {pendingPurchase && (
          <Alert className="mb-4 bg-white/10 border-white/20 text-white">
            <ShoppingCart className="h-4 w-4" />
            <AlertDescription>
              Un achat est en attente. Connectez-vous pour finaliser votre commande.
            </AlertDescription>
          </Alert>
        )}

        <Card className="backdrop-blur-sm bg-white/95 shadow-elegant animate-fade-in"
              style={{ animationDelay: '0.2s' }}>
          <Tabs defaultValue="signin" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="signin">Connexion</TabsTrigger>
              <TabsTrigger value="signup">Inscription</TabsTrigger>
            </TabsList>

            <TabsContent value="signin">
              <form onSubmit={handleSignIn}>
                <CardHeader className="text-center pb-4">
                  <CardTitle className="text-xl">Se connecter</CardTitle>
                  <CardDescription>
                    Connectez-vous à votre compte G-STARTUP
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {error && (
                    <Alert variant="destructive">
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}
                  
                  <div className="space-y-2">
                    <Label htmlFor="signin-email">Email</Label>
                    <Input
                      id="signin-email"
                      name="email"
                      type="email"
                      placeholder="votre@email.com"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      disabled={isLoading}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="signin-password">Mot de passe</Label>
                    <div className="relative">
                      <Input
                        id="signin-password"
                        name="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        value={formData.password}
                        onChange={handleInputChange}
                        required
                        disabled={isLoading}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowPassword(!showPassword)}
                        disabled={isLoading}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex flex-col gap-4">
                  <Button type="submit" className="w-full touch-target" disabled={isLoading}>
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Se connecter
                  </Button>
                  <p className="text-sm text-muted-foreground text-center">
                    Pas encore de compte ?{' '}
                    <Button 
                      type="button" 
                      variant="link" 
                      className="p-0 h-auto font-semibold text-primary"
                      onClick={() => {
                        const signupTab = document.querySelector('[value="signup"]') as HTMLElement;
                        signupTab?.click();
                      }}
                    >
                      Créer un compte
                    </Button>
                  </p>
                </CardFooter>
              </form>
            </TabsContent>

            <TabsContent value="signup">
              <form onSubmit={handleSignUp}>
                <CardHeader className="text-center pb-4">
                  <CardTitle className="text-xl">Créer un compte</CardTitle>
                  <CardDescription>
                    Rejoignez G-STARTUP et accédez au marketplace
                    {pendingPurchase && " pour finaliser votre achat"}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {error && (
                    <Alert variant="destructive">
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}
                  
                  <div className="space-y-2">
                    <Label htmlFor="signup-name">Nom d'affichage</Label>
                    <Input
                      id="signup-name"
                      name="displayName"
                      type="text"
                      placeholder="Votre nom"
                      value={formData.displayName}
                      onChange={handleInputChange}
                      required
                      disabled={isLoading}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="signup-email">Email</Label>
                    <Input
                      id="signup-email"
                      name="email"
                      type="email"
                      placeholder="votre@email.com"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      disabled={isLoading}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Mot de passe</Label>
                    <div className="relative">
                      <Input
                        id="signup-password"
                        name="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        value={formData.password}
                        onChange={handleInputChange}
                        required
                        disabled={isLoading}
                        minLength={6}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowPassword(!showPassword)}
                        disabled={isLoading}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Minimum 6 caractères
                    </p>
                  </div>
                </CardContent>
                <CardFooter className="flex flex-col gap-4">
                  <Button type="submit" className="w-full touch-target" disabled={isLoading}>
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Créer le compte
                  </Button>
                  <p className="text-sm text-muted-foreground text-center">
                    Déjà un compte ?{' '}
                    <Button 
                      type="button" 
                      variant="link" 
                      className="p-0 h-auto font-semibold text-primary"
                      onClick={() => {
                        const signinTab = document.querySelector('[value="signin"]') as HTMLElement;
                        signinTab?.click();
                      }}
                    >
                      Se connecter
                    </Button>
                  </p>
                </CardFooter>
              </form>
            </TabsContent>
          </Tabs>
        </Card>

        {/* Footer avec informations supplémentaires */}
        <div className="text-center mt-6 animate-fade-in" style={{ animationDelay: '0.4s' }}>
          <p className="text-white/60 text-sm">
            En vous connectant, vous acceptez nos conditions d'utilisation et notre politique de confidentialité
          </p>
        </div>
      </div>
    </div>
  );
}
