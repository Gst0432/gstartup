import { useState, useEffect } from 'react';

export type Language = 'fr' | 'en';
export type Currency = 'FCFA' | 'XAF' | 'USD' | 'FGN';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  currency: Currency;
  setCurrency: (curr: Currency) => void;
  t: (key: string) => string;
}

const translations = {
  fr: {
    // Navigation
    home: 'Accueil',
    about: 'À propos',
    services: 'Services',
    marketplace: 'Marketplace',
    documentation: 'Documentation',
    contact: 'Contact',
    login: 'Connexion',
    
    // Hero Section
    heroTitle: 'Fournisseur #1 de Produits Digitaux et Solutions Web Innovantes en Afrique',
    heroSubtitle: 'Plus de 20 millions de produits digitaux, Plateforme, formations digital, Code, Templates, Logiciel, SaaS',
    heroDescription: 'Nous nous concentrons entièrement sur la fourniture de services Cloud et de solutions logicielles de haute qualité. Nous avons terminé des projets de développement pour des clients internationaux dans de nombreux secteurs de marché.',
    getStarted: 'Commencer',
    
    // Services
    servicesTitle: 'Nos Services',
    servicesSubtitle: 'Ce que nous servons',
    webDev: 'Développement d\'Applications Web',
    mobileDev: 'Développement d\'Applications Mobiles',
    pluginDev: 'Développement de Plugins & SDK',
    wordpressDev: 'Thèmes & Plugins WordPress',
    shopifyDev: 'Thèmes & Apps Shopify',
    uiuxDesign: 'Design UI/UX',
    
    // About
    aboutTitle: 'À propos de G-STARTUP LTD',
    aboutDescription: 'Améliorer les ventes de produits d\'entreprise numérique. Nous nous concentrons entièrement sur la fourniture de services Cloud et de solutions logicielles de haute qualité.',
    
    // Products
    productsTitle: 'Nos Produits',
    productsSubtitle: 'Chaque semaine, notre équipe sélectionne personnellement les meilleurs nouveaux thèmes de sites web de notre collection.',
    
    // Footer
    company: 'Entreprise',
    resources: 'Ressources',
    specialty: 'Notre Spécialité',
    newsletter: 'Newsletter',
    subscribe: 'S\'abonner',
    termsConditions: 'Conditions Générales',
    privacyPolicy: 'Politique de Confidentialité',
    allRightsReserved: 'Tous droits réservés',
  },
  en: {
    // Navigation
    home: 'Home',
    about: 'About',
    services: 'Services',
    marketplace: 'Marketplace',
    documentation: 'Documentation',
    contact: 'Contact',
    login: 'Login',
    
    // Hero Section
    heroTitle: 'DIGITAL BUSINESS',
    heroSubtitle: 'Provide The Optimal Solutions.',
    heroDescription: 'We are totally focused on delivering high quality Cloud Service & software solution. We have completed development projects for international clients in many market sectors.',
    getStarted: 'Get Started',
    
    // Services
    servicesTitle: 'Our Services',
    servicesSubtitle: 'What We Served',
    webDev: 'Web Application Development',
    mobileDev: 'Mobile Application Development',
    pluginDev: 'Plugin & SDK Development',
    wordpressDev: 'WordPress Themes & Plugins',
    shopifyDev: 'Shopify Themes & Apps',
    uiuxDesign: 'UI/UX Design',
    
    // About
    aboutTitle: 'About G-STARTUP LTD',
    aboutDescription: 'Improve the sales of Digital Business Products. We are totally focused on delivering high quality Cloud Service & software solution.',
    
    // Products
    productsTitle: 'Our Products',
    productsSubtitle: 'Every week, our staff personally hand-pick some of the best new website themes from our collection.',
    
    // Footer
    company: 'Company',
    resources: 'Resources',
    specialty: 'Our Speciality',
    newsletter: 'Newsletter',
    subscribe: 'Subscribe',
    termsConditions: 'Terms & Conditions',
    privacyPolicy: 'Privacy Policy',
    allRightsReserved: 'All rights reserved',
  }
};

export const useLanguage = (): LanguageContextType => {
  const [language, setLanguage] = useState<Language>('fr');
  const [currency, setCurrency] = useState<Currency>('FCFA');

  useEffect(() => {
    const savedLang = localStorage.getItem('language') as Language;
    const savedCurrency = localStorage.getItem('currency') as Currency;
    
    if (savedLang && ['fr', 'en'].includes(savedLang)) {
      setLanguage(savedLang);
    }
    
    if (savedCurrency && ['FCFA', 'XAF', 'USD', 'FGN'].includes(savedCurrency)) {
      setCurrency(savedCurrency);
    }
  }, []);

  const handleSetLanguage = (lang: Language) => {
    setLanguage(lang);
    localStorage.setItem('language', lang);
  };

  const handleSetCurrency = (curr: Currency) => {
    setCurrency(curr);
    localStorage.setItem('currency', curr);
  };

  const t = (key: string): string => {
    return translations[language][key as keyof typeof translations['fr']] || key;
  };

  return {
    language,
    setLanguage: handleSetLanguage,
    currency,
    setCurrency: handleSetCurrency,
    t,
  };
};