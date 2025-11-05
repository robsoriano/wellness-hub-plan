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
    
    // Dashboard
    'dashboard.title': 'Nutritionist Dashboard',
    'dashboard.subtitle': 'Manage your patients and meal plans',
    'dashboard.addPatient': 'Add Patient',
    
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
    
    // Dashboard
    'dashboard.title': 'Panel de Nutricionista',
    'dashboard.subtitle': 'Gestiona tus pacientes y planes de comidas',
    'dashboard.addPatient': 'Agregar Paciente',
    
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
