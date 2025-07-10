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
    boutiques: 'Boutiques',
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
    moreDetails: 'Plus de détails',
    
    // About
    aboutTitle: 'À propos de G-STARTUP LTD',
    aboutDescription: 'Améliorer les ventes de produits d\'entreprise numérique. Nous nous concentrons entièrement sur la fourniture de services Cloud et de solutions logicielles de haute qualité.',
    aboutExtended: 'G-STARTUP LTD est l\'un des pionniers de la fourniture d\'infrastructures et de solutions informatiques. Nous nous concentrons entièrement sur la fourniture de services Cloud et de solutions logicielles de haute qualité.',
    readMore: 'Lire plus',
    completedWork: 'Travaux Terminés',
    yearsExperience: 'Années d\'Expérience',
    completedProjects: 'Projets Terminés',
    happyCustomers: 'Clients Satisfaits',
    
    // Products
    productsTitle: 'Nos Produits',
    productsSubtitle: 'Chaque semaine, notre équipe sélectionne personnellement les meilleurs nouveaux thèmes de sites web de notre collection.',
    productsExtended: 'G-STARTUP LTD est l\'un des pionniers de la fourniture d\'infrastructures et de solutions informatiques sur diverses plateformes.',
    viewDetails: 'Voir détails',
    buy: 'Acheter',
    addToCart: 'Ajouter au panier',
    by: 'Par',
    noProducts: 'Aucun produit en vedette pour le moment',
    viewMoreProducts: 'Voir plus de produits',
    
    // Product Detail
    back: 'Retour',
    share: 'Partager',
    featured: 'En vedette',
    preview: 'Aperçu',
    buyNow: 'Acheter maintenant',
    buyRequireAuth: 'Acheter (inscription requise)',
    productDescription: 'Description du produit',
    digitalProduct: 'Produit numérique - Téléchargement immédiat après achat',
    authRequired: 'Pour finaliser votre achat, vous devez créer un compte ou vous connecter. Votre sélection sera sauvegardée.',
    signupLogin: 'S\'inscrire / Se connecter',
    cancel: 'Annuler',
    welcomeMessage: 'Bienvenue ! Votre achat va être finalisé automatiquement...',
    productNotFound: 'Produit non trouvé',
    returnHome: 'Retour à l\'accueil',
    reviewAdded: 'Avis ajouté',
    thankYouReview: 'Merci pour votre avis !',
    
    // Footer
    company: 'Entreprise',
    resources: 'Ressources',
    specialty: 'Notre Spécialité',
    newsletter: 'Newsletter',
    subscribe: 'S\'abonner',
    termsConditions: 'Conditions Générales',
    privacyPolicy: 'Politique de Confidentialité',
    allRightsReserved: 'Tous droits réservés',
    
    // Common
    dashboard: 'Tableau de bord',
    logout: 'Déconnexion',
  },
  en: {
    // Navigation
    home: 'Home',
    about: 'About',
    services: 'Services',
    marketplace: 'Marketplace',
    boutiques: 'Shops',
    documentation: 'Documentation',
    contact: 'Contact',
    login: 'Login',
    
    // Hero Section
    heroTitle: '#1 Provider of Digital Products & Innovative Web Solutions in Africa',
    heroSubtitle: 'Over 20 million digital products, Platform, digital training, Code, Templates, Software, SaaS',
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
    moreDetails: 'More Details',
    
    // About
    aboutTitle: 'About G-STARTUP LTD',
    aboutDescription: 'Improve the sales of Digital Business Products. We are totally focused on delivering high quality Cloud Service & software solution.',
    aboutExtended: 'G-STARTUP LTD is one of the pioneers in providing I.T. infrastructure and solutions. We are totally focused on delivering high quality Cloud Service & software solution.',
    readMore: 'Read More',
    completedWork: 'Completed Work',
    yearsExperience: 'Years Experience',
    completedProjects: 'Completed Projects',
    happyCustomers: 'Happy Customers',
    
    // Products
    productsTitle: 'Our Products',
    productsSubtitle: 'Every week, our staff personally hand-pick some of the best new website themes from our collection.',
    productsExtended: 'G-STARTUP LTD is one of the pioneers in providing I.T. infrastructure and solutions on various platforms.',
    viewDetails: 'View Details',
    buy: 'Buy',
    addToCart: 'Add to Cart',
    by: 'By',
    noProducts: 'No featured products at the moment',
    viewMoreProducts: 'View More Products',
    
    // Product Detail
    back: 'Back',
    share: 'Share',
    featured: 'Featured',
    preview: 'Preview',
    buyNow: 'Buy Now',
    buyRequireAuth: 'Buy (registration required)',
    productDescription: 'Product Description',
    digitalProduct: 'Digital product - Instant download after purchase',
    authRequired: 'To complete your purchase, you must create an account or log in. Your selection will be saved.',
    signupLogin: 'Sign up / Log in',
    cancel: 'Cancel',
    welcomeMessage: 'Welcome! Your purchase will be finalized automatically...',
    productNotFound: 'Product not found',
    returnHome: 'Return to home',
    reviewAdded: 'Review added',
    thankYouReview: 'Thank you for your review!',
    
    // Footer
    company: 'Company',
    resources: 'Resources',
    specialty: 'Our Speciality',
    newsletter: 'Newsletter',
    subscribe: 'Subscribe',
    termsConditions: 'Terms & Conditions',
    privacyPolicy: 'Privacy Policy',
    allRightsReserved: 'All rights reserved',
    
    // Common
    dashboard: 'Dashboard',
    logout: 'Logout',
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