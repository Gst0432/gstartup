import { Button } from './ui/button';
import { ArrowRight, Monitor, Smartphone, Puzzle, Package, ShoppingBag, Palette } from 'lucide-react';
import { useLanguage } from '../hooks/useLanguage';

export const ServicesSection = () => {
  const { t } = useLanguage();

  const services = [
    {
      icon: Monitor,
      titleKey: 'webDev',
      description: 'Experience the magic of digital transformation with G-STARTUP LTD, your trusted partner for Affordable Web Application Development.',
      color: 'text-blue-500',
      bgColor: 'bg-blue-50'
    },
    {
      icon: Smartphone,
      titleKey: 'mobileDev',
      description: 'Bring your ideas to life with G-STARTUP LTD. We expertly craft Swift iOS and Android Mobile Application Development.',
      color: 'text-green-500',
      bgColor: 'bg-green-50'
    },
    {
      icon: Puzzle,
      titleKey: 'pluginDev',
      description: 'G-STARTUP LTD specializes in custom plugin and SDK development, providing tailored solutions to enhance functionality.',
      color: 'text-purple-500',
      bgColor: 'bg-purple-50'
    },
    {
      icon: Package,
      titleKey: 'wordpressDev',
      description: 'G-STARTUP LTD specializes in SEO-optimized WordPress theme and plugin development for enhanced performance.',
      color: 'text-orange-500',
      bgColor: 'bg-orange-50'
    },
    {
      icon: ShoppingBag,
      titleKey: 'shopifyDev',
      description: 'G-STARTUP LTD excels in developing custom Shopify themes and apps, crafted to boost functionality and appeal.',
      color: 'text-pink-500',
      bgColor: 'bg-pink-50'
    },
    {
      icon: Palette,
      titleKey: 'uiuxDesign',
      description: 'G-STARTUP LTD specializes in UI/UX design development, creating intuitive and visually stunning user experiences.',
      color: 'text-red-500',
      bgColor: 'bg-red-50'
    },
  ];

  return (
    <section id="services" className="py-20">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl lg:text-5xl font-bold mb-4">
            {t('servicesTitle')}
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            {t('servicesSubtitle')}. We are totally focused on delivering high quality Cloud Service & software solution.
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service, index) => {
            const Icon = service.icon;
            return (
              <div
                key={index}
                className="group p-8 bg-card rounded-xl border border-border hover:shadow-elegant transition-all duration-300 hover:-translate-y-2"
              >
                {/* Icon */}
                <div className={`w-16 h-16 ${service.bgColor} rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  <Icon className={`h-8 w-8 ${service.color}`} />
                </div>

                {/* Content */}
                <div className="space-y-4">
                  <h3 className="text-xl font-semibold">
                    {t(service.titleKey)}
                  </h3>
                  
                  <p className="text-muted-foreground leading-relaxed">
                    {service.description}
                  </p>

                  <Button variant="ghost" className="gap-2 p-0 h-auto font-medium group-hover:text-primary">
                    More Details
                    <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};