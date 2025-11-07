import React, { createContext, useContext, useState, useEffect } from 'react';

type Language = 'en' | 'es';

type LanguageContextType = {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const translations = {
  en: {
    // Navigation
    'nav.welcome': 'Welcome',
    'nav.messages': 'Messages',
    'nav.signOut': 'Sign Out',
    'nav.features': 'Features',
    'nav.howItWorks': 'How It Works',
    'nav.pricing': 'Pricing',
    'nav.signIn': 'Sign In',
    'nav.getStarted': 'Get Started',
    
    // Hero
    'hero.badge': 'Professional Nutrition Platform',
    'hero.title': 'Transform Your Practice with',
    'hero.titleHighlight': 'Smart Nutrition Management',
    'hero.description': 'Empower your nutrition practice with our comprehensive platform. Manage patients, create personalized meal plans, and track progress all in one place.',
    'hero.startTrial': 'Start Free Trial',
    'hero.watchDemo': 'Watch Demo',
    'hero.nutritionists': 'Nutritionists',
    'hero.activeUsers': 'Active Users',
    'hero.successRate': 'Success Rate',
    
    // Features
    'features.title': 'Everything You Need to Succeed',
    'features.description': 'A complete suite of tools designed specifically for nutrition professionals to streamline their practice.',
    'features.customDiet': 'Custom Diet Plans',
    'features.customDietDesc': 'Create personalized meal plans tailored to each patient\'s unique needs and goals.',
    'features.progressTracking': 'Progress Tracking',
    'features.progressTrackingDesc': 'Monitor your patients\' progress with detailed analytics and visual charts.',
    'features.messaging': 'Direct Messaging',
    'features.messagingDesc': 'Communicate seamlessly with patients through our built-in messaging system.',
    'features.scheduling': 'Smart Scheduling',
    'features.schedulingDesc': 'Manage appointments efficiently with our intelligent calendar system.',
    'features.recipeLibrary': 'Recipe Library',
    'features.recipeLibraryDesc': 'Access a vast collection of healthy recipes to share with your patients.',
    'features.reminders': 'Automated Reminders',
    'features.remindersDesc': 'Keep patients on track with automatic notifications and reminders.',
    'features.analytics': 'Advanced Analytics',
    'features.analyticsDesc': 'Gain insights with comprehensive reports and data visualization tools.',
    'features.patientMgmt': 'Patient Management',
    'features.patientMgmtDesc': 'Organize and manage all your patient information in one secure place.',
    
    // How It Works
    'howItWorks.title': 'How It Works',
    'howItWorks.description': 'Get started in minutes with our simple and intuitive platform.',
    'howItWorks.step1': 'Create Your Account',
    'howItWorks.step1Desc': 'Sign up and set up your professional profile in just a few clicks.',
    'howItWorks.step2': 'Add Your Patients',
    'howItWorks.step2Desc': 'Import existing patients or invite new ones to join your practice.',
    'howItWorks.step3': 'Create Meal Plans',
    'howItWorks.step3Desc': 'Design personalized nutrition plans using our powerful tools.',
    'howItWorks.step4': 'Track & Optimize',
    'howItWorks.step4Desc': 'Monitor progress and adjust plans to maximize results.',
    
    // Footer
    'footer.tagline': 'Empowering nutritionists to deliver exceptional care.',
    'footer.product': 'Product',
    'footer.demo': 'Request Demo',
    'footer.updates': 'Updates',
    'footer.resources': 'Resources',
    'footer.blog': 'Blog',
    'footer.helpCenter': 'Help Center',
    'footer.community': 'Community',
    'footer.contact': 'Contact Us',
    'footer.legal': 'Legal',
    'footer.privacy': 'Privacy Policy',
    'footer.terms': 'Terms of Service',
    'footer.cookies': 'Cookie Policy',
    'footer.copyright': '© 2024 NutriTrack. All rights reserved.',
    
    // Auth
    'auth.welcome': 'Welcome to NutriTrack',
    'auth.subtitle': 'Sign in to your account or create a new one',
    'auth.signIn': 'Sign In',
    'auth.signUp': 'Sign Up',
    'auth.email': 'Email',
    'auth.password': 'Password',
    'auth.signingIn': 'Signing in...',
    'auth.fullName': 'Full Name',
    'auth.iAm': 'I am a',
    'auth.patient': 'Patient',
    'auth.nutritionist': 'Nutritionist',
    'auth.createAccount': 'Create Account',
    'auth.creatingAccount': 'Creating account...',
    'auth.signedIn': 'Successfully signed in!',
    'auth.accountCreated': 'Account created! Please check your email.',
    
    // Dashboard
    'dashboard.title': 'Nutritionist Dashboard',
    'dashboard.subtitle': 'Manage your patients and meal plans',
    'dashboard.addPatient': 'Add Patient',
    
    // Patient Dashboard
    'patientDashboard.title': 'My Nutrition Journey',
    'patientDashboard.subtitle': 'Track your progress and stay healthy',
    'patientDashboard.currentWeight': 'Current Weight',
    'patientDashboard.bmi': 'BMI',
    'patientDashboard.noData': 'No data yet',
    'patientDashboard.currentStreak': 'Current Streak',
    'patientDashboard.daysLogging': 'days logging',
    'patientDashboard.activePlans': 'Active Plans',
    'patientDashboard.mealPlans': 'meal plans',
    'patientDashboard.profile': 'Profile',
    'patientDashboard.viewProfile': 'View Profile',
    'patientDashboard.overview': 'Overview',
    'patientDashboard.progress': 'Progress',
    'patientDashboard.appointments': 'Appointments',
    'patientDashboard.activeMealPlans': 'Active Meal Plans',
    'patientDashboard.currentPlans': 'Your current nutrition plans',
    'patientDashboard.noPlansYet': 'No meal plans yet',
    'patientDashboard.nutritionistWillCreate': 'Your nutritionist will create a personalized plan for you',
    'patientDashboard.viewDetails': 'View Details',
    'patientDashboard.recentProgress': 'Recent Progress',
    'patientDashboard.latestUpdates': 'Your latest updates',
    'patientDashboard.noProgressYet': 'No progress logged yet',
    'patientDashboard.logTodayProgress': 'Log Today\'s Progress',
    'patientDashboard.energy': 'Energy',
    'patientDashboard.mood': 'Mood',
    
    // Stats
    'stats.totalPatients': 'Total Patients',
    'stats.active': 'active',
    'stats.appointments': 'Appointments',
    'stats.upcomingWeek': 'upcoming this week',
    'stats.messages': 'Messages',
    'stats.unread': 'Unread messages',
    
    // Tabs
    'tabs.patients': 'Patients',
    'tabs.recipes': 'Recipes',
    'tabs.templates': 'Templates',
    'tabs.appointments': 'Appointments',
    
    // Patients
    'patients.title': 'Your Patients',
    'patients.subtitle': 'View and manage your patient list',
    'patients.search': 'Search patients by name or email...',
    'patients.noResults': 'No patients found matching',
    'patients.empty': 'No patients yet. Add your first patient to get started!',
    'patients.viewDetails': 'View Details',
    
    // Templates
    'templates.title': 'Meal Templates',
    'templates.create': 'Create Template',
    'templates.viewDetails': 'View Details',
    'templates.editMeals': 'Edit Meals',
    'templates.preview': 'Template Preview',
    'templates.noMeals': 'No meals in this template yet. Click "Edit Meals" to add meals.',
    'templates.name': 'Template Name',
    'templates.description': 'Description',
    'templates.category': 'Category',
    
    // Meal Types
    'meal.breakfast': 'Breakfast',
    'meal.lunch': 'Lunch',
    'meal.dinner': 'Dinner',
    'meal.snack': 'Snack',
    
    // Common
    'common.loading': 'Loading...',
    'common.time': 'Time',
    'common.calories': 'cal',
  },
  es: {
    // Navigation
    'nav.welcome': 'Bienvenido',
    'nav.messages': 'Mensajes',
    'nav.signOut': 'Cerrar Sesión',
    'nav.features': 'Características',
    'nav.howItWorks': 'Cómo Funciona',
    'nav.pricing': 'Precios',
    'nav.signIn': 'Iniciar Sesión',
    'nav.getStarted': 'Comenzar',
    
    // Hero
    'hero.badge': 'Plataforma Profesional de Nutrición',
    'hero.title': 'Transforma Tu Práctica con',
    'hero.titleHighlight': 'Gestión Inteligente de Nutrición',
    'hero.description': 'Potencia tu práctica de nutrición con nuestra plataforma integral. Gestiona pacientes, crea planes de comidas personalizados y rastrea el progreso en un solo lugar.',
    'hero.startTrial': 'Prueba Gratuita',
    'hero.watchDemo': 'Ver Demo',
    'hero.nutritionists': 'Nutricionistas',
    'hero.activeUsers': 'Usuarios Activos',
    'hero.successRate': 'Tasa de Éxito',
    
    // Features
    'features.title': 'Todo lo que Necesitas para Tener Éxito',
    'features.description': 'Un conjunto completo de herramientas diseñadas específicamente para profesionales de la nutrición.',
    'features.customDiet': 'Planes de Dieta Personalizados',
    'features.customDietDesc': 'Crea planes de comidas personalizados adaptados a las necesidades únicas de cada paciente.',
    'features.progressTracking': 'Seguimiento de Progreso',
    'features.progressTrackingDesc': 'Monitorea el progreso de tus pacientes con análisis detallados y gráficos visuales.',
    'features.messaging': 'Mensajería Directa',
    'features.messagingDesc': 'Comunícate sin problemas con los pacientes a través de nuestro sistema de mensajería integrado.',
    'features.scheduling': 'Programación Inteligente',
    'features.schedulingDesc': 'Gestiona citas de manera eficiente con nuestro sistema de calendario inteligente.',
    'features.recipeLibrary': 'Biblioteca de Recetas',
    'features.recipeLibraryDesc': 'Accede a una amplia colección de recetas saludables para compartir con tus pacientes.',
    'features.reminders': 'Recordatorios Automáticos',
    'features.remindersDesc': 'Mantén a los pacientes en el camino con notificaciones y recordatorios automáticos.',
    'features.analytics': 'Análisis Avanzados',
    'features.analyticsDesc': 'Obtén información con informes completos y herramientas de visualización de datos.',
    'features.patientMgmt': 'Gestión de Pacientes',
    'features.patientMgmtDesc': 'Organiza y gestiona toda la información de tus pacientes en un lugar seguro.',
    
    // How It Works
    'howItWorks.title': 'Cómo Funciona',
    'howItWorks.description': 'Comienza en minutos con nuestra plataforma simple e intuitiva.',
    'howItWorks.step1': 'Crea Tu Cuenta',
    'howItWorks.step1Desc': 'Regístrate y configura tu perfil profesional en solo unos clics.',
    'howItWorks.step2': 'Agrega Tus Pacientes',
    'howItWorks.step2Desc': 'Importa pacientes existentes o invita a nuevos a unirse a tu práctica.',
    'howItWorks.step3': 'Crea Planes de Comidas',
    'howItWorks.step3Desc': 'Diseña planes de nutrición personalizados usando nuestras poderosas herramientas.',
    'howItWorks.step4': 'Rastrea y Optimiza',
    'howItWorks.step4Desc': 'Monitorea el progreso y ajusta los planes para maximizar los resultados.',
    
    // Footer
    'footer.tagline': 'Empoderando a nutricionistas para brindar atención excepcional.',
    'footer.product': 'Producto',
    'footer.demo': 'Solicitar Demo',
    'footer.updates': 'Actualizaciones',
    'footer.resources': 'Recursos',
    'footer.blog': 'Blog',
    'footer.helpCenter': 'Centro de Ayuda',
    'footer.community': 'Comunidad',
    'footer.contact': 'Contáctanos',
    'footer.legal': 'Legal',
    'footer.privacy': 'Política de Privacidad',
    'footer.terms': 'Términos de Servicio',
    'footer.cookies': 'Política de Cookies',
    'footer.copyright': '© 2024 NutriTrack. Todos los derechos reservados.',
    
    // Auth
    'auth.welcome': 'Bienvenido a NutriTrack',
    'auth.subtitle': 'Inicia sesión en tu cuenta o crea una nueva',
    'auth.signIn': 'Iniciar Sesión',
    'auth.signUp': 'Registrarse',
    'auth.email': 'Correo Electrónico',
    'auth.password': 'Contraseña',
    'auth.signingIn': 'Iniciando sesión...',
    'auth.fullName': 'Nombre Completo',
    'auth.iAm': 'Soy un',
    'auth.patient': 'Paciente',
    'auth.nutritionist': 'Nutricionista',
    'auth.createAccount': 'Crear Cuenta',
    'auth.creatingAccount': 'Creando cuenta...',
    'auth.signedIn': '¡Sesión iniciada correctamente!',
    'auth.accountCreated': '¡Cuenta creada! Por favor revisa tu correo electrónico.',
    
    // Dashboard
    'dashboard.title': 'Panel de Nutricionista',
    'dashboard.subtitle': 'Gestiona tus pacientes y planes de comidas',
    'dashboard.addPatient': 'Agregar Paciente',
    
    // Patient Dashboard
    'patientDashboard.title': 'Mi Viaje Nutricional',
    'patientDashboard.subtitle': 'Rastrea tu progreso y mantente saludable',
    'patientDashboard.currentWeight': 'Peso Actual',
    'patientDashboard.bmi': 'IMC',
    'patientDashboard.noData': 'Sin datos aún',
    'patientDashboard.currentStreak': 'Racha Actual',
    'patientDashboard.daysLogging': 'días registrando',
    'patientDashboard.activePlans': 'Planes Activos',
    'patientDashboard.mealPlans': 'planes de comidas',
    'patientDashboard.profile': 'Perfil',
    'patientDashboard.viewProfile': 'Ver Perfil',
    'patientDashboard.overview': 'Resumen',
    'patientDashboard.progress': 'Progreso',
    'patientDashboard.appointments': 'Citas',
    'patientDashboard.activeMealPlans': 'Planes de Comidas Activos',
    'patientDashboard.currentPlans': 'Tus planes de nutrición actuales',
    'patientDashboard.noPlansYet': 'Aún no hay planes de comidas',
    'patientDashboard.nutritionistWillCreate': 'Tu nutricionista creará un plan personalizado para ti',
    'patientDashboard.viewDetails': 'Ver Detalles',
    'patientDashboard.recentProgress': 'Progreso Reciente',
    'patientDashboard.latestUpdates': 'Tus últimas actualizaciones',
    'patientDashboard.noProgressYet': 'Aún no hay progreso registrado',
    'patientDashboard.logTodayProgress': 'Registrar Progreso de Hoy',
    'patientDashboard.energy': 'Energía',
    'patientDashboard.mood': 'Estado de Ánimo',
    
    // Stats
    'stats.totalPatients': 'Total de Pacientes',
    'stats.active': 'activos',
    'stats.appointments': 'Citas',
    'stats.upcomingWeek': 'próximas esta semana',
    'stats.messages': 'Mensajes',
    'stats.unread': 'Mensajes no leídos',
    
    // Tabs
    'tabs.patients': 'Pacientes',
    'tabs.recipes': 'Recetas',
    'tabs.templates': 'Plantillas',
    'tabs.appointments': 'Citas',
    
    // Patients
    'patients.title': 'Tus Pacientes',
    'patients.subtitle': 'Ver y gestionar tu lista de pacientes',
    'patients.search': 'Buscar pacientes por nombre o correo...',
    'patients.noResults': 'No se encontraron pacientes que coincidan con',
    'patients.empty': '¡Aún no hay pacientes. Agrega tu primer paciente para comenzar!',
    'patients.viewDetails': 'Ver Detalles',
    
    // Templates
    'templates.title': 'Plantillas de Comidas',
    'templates.create': 'Crear Plantilla',
    'templates.viewDetails': 'Ver Detalles',
    'templates.editMeals': 'Editar Comidas',
    'templates.preview': 'Vista Previa de Plantilla',
    'templates.noMeals': 'No hay comidas en esta plantilla aún. Haz clic en "Editar Comidas" para agregar comidas.',
    'templates.name': 'Nombre de la Plantilla',
    'templates.description': 'Descripción',
    'templates.category': 'Categoría',
    
    // Meal Types
    'meal.breakfast': 'Desayuno',
    'meal.lunch': 'Almuerzo',
    'meal.dinner': 'Cena',
    'meal.snack': 'Merienda',
    
    // Common
    'common.loading': 'Cargando...',
    'common.time': 'Hora',
    'common.calories': 'cal',
  },
};

export const LanguageProvider = ({ children }: { children: React.ReactNode }) => {
  const [language, setLanguageState] = useState<Language>('en');

  useEffect(() => {
    const savedLanguage = localStorage.getItem('language') as Language;
    if (savedLanguage && (savedLanguage === 'en' || savedLanguage === 'es')) {
      setLanguageState(savedLanguage);
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('language', lang);
  };

  const t = (key: string): string => {
    return translations[language][key as keyof typeof translations.en] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return context;
};
