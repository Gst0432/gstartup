import { Button } from './ui/button';
import { ArrowRight } from 'lucide-react';
import { useLanguage } from '../hooks/useLanguage';
import heroIllustration from '../assets/hero-illustration.png';

export const HeroSection = () => {
  const { t } = useLanguage();

  return (
    <section id="home" className="relative min-h-screen flex items-center overflow-hidden">
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-hero opacity-10"></div>
      
      {/* Decorative Elements */}
      <div className="absolute top-20 left-10 w-20 h-20 bg-primary/10 rounded-full blur-xl"></div>
      <div className="absolute bottom-20 right-10 w-32 h-32 bg-primary-glow/10 rounded-full blur-2xl"></div>
      
      <div className="container mx-auto px-4 py-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-8">
            {/* Business Marketing Badge */}
            <div className="flex gap-4 text-sm font-medium">
              <span className="px-3 py-1 bg-primary/10 text-primary rounded-full">
                BUSINESS
              </span>
              <span className="px-3 py-1 bg-primary/10 text-primary rounded-full">
                MARKETING
              </span>
            </div>

            {/* Main Title */}
            <div className="space-y-4">
              <h1 className="text-5xl lg:text-7xl font-bold leading-tight">
                <span className="bg-gradient-primary bg-clip-text text-transparent">
                  {t('heroTitle')}
                </span>
              </h1>
              <h2 className="text-2xl lg:text-3xl font-semibold text-primary">
                {t('heroSubtitle')}
              </h2>
            </div>

            {/* Description */}
            <p className="text-lg text-muted-foreground leading-relaxed max-w-xl">
              {t('heroDescription')}
            </p>

            {/* CTA Button */}
            <div className="pt-4">
              <Button size="lg" variant="hero" className="gap-2 text-lg px-8 py-6">
                {t('getStarted')}
                <ArrowRight className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Right Illustration */}
          <div className="relative">
            <div className="relative z-10">
              <img 
                src={heroIllustration} 
                alt="Business Team Collaboration"
                className="w-full h-auto max-w-2xl mx-auto"
              />
            </div>
            
            {/* Floating Elements */}
            <div className="absolute -top-4 -right-4 w-16 h-16 bg-primary/20 rounded-lg rotate-12 animate-pulse"></div>
            <div className="absolute -bottom-4 -left-4 w-12 h-12 bg-primary-glow/20 rounded-full animate-bounce"></div>
            
            {/* Glow Effect */}
            <div className="absolute inset-0 bg-gradient-primary opacity-10 blur-3xl scale-110"></div>
          </div>
        </div>
      </div>
    </section>
  );
};