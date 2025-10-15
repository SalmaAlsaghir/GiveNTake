"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

type Language = "en" | "ar";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Translation dictionary
const translations: Record<Language, Record<string, string>> = {
  en: {
    // Navigation
    "nav.browse": "Browse",
    "nav.collections": "Collections",
    "nav.stats": "Statistics",
    "nav.post": "Post a Listing",
    "nav.myListings": "My Listings",
    "nav.safety": "How to Transact",
    "nav.settings": "Settings",
    "nav.profile": "My Profile",
    "nav.logout": "Log out",
    "nav.login": "Login",
    "nav.categories": "Categories",
    
    // Categories
    "cat.textbooks": "Textbooks",
    "cat.electronics": "Electronics",
    "cat.dorm": "Dorm Essentials",
    "cat.accessories": "Accessories",
    
    // Homepage
    "home.title": "Welcome to GiveNTake!",
    "home.subtitle": "The campus marketplace for students. Buy, sell, and swap textbooks, electronics, and more with your uni community!",
    "home.search": "Search for items...",
    
    // Settings
    "settings.title": "Settings",
    "settings.subtitle": "Manage your profile, preferences, and account settings.",
    "settings.profile": "Profile Information",
    "settings.language": "Language",
    "settings.notifications": "Notifications",
    "settings.privacy": "Privacy & Security",
    
    // Common
    "common.loading": "Loading...",
    "common.save": "Save",
    "common.cancel": "Cancel",
    "common.delete": "Delete",
    "common.edit": "Edit",
    "common.submit": "Submit",
  },
  ar: {
    // Navigation
    "nav.browse": "تصفح",
    "nav.collections": "المجموعات",
    "nav.stats": "الإحصائيات",
    "nav.post": "نشر إعلان",
    "nav.myListings": "إعلاناتي",
    "nav.safety": "كيفية التعامل",
    "nav.settings": "الإعدادات",
    "nav.profile": "ملفي الشخصي",
    "nav.logout": "تسجيل الخروج",
    "nav.login": "تسجيل الدخول",
    "nav.categories": "الفئات",
    
    // Categories
    "cat.textbooks": "الكتب الدراسية",
    "cat.electronics": "الإلكترونيات",
    "cat.dorm": "أساسيات السكن",
    "cat.accessories": "الإكسسوارات",
    
    // Homepage
    "home.title": "مرحباً بكم في GiveNTake!",
    "home.subtitle": "السوق الجامعي للطلاب. اشترِ وبع وتبادل الكتب والإلكترونيات وغيرها مع مجتمع الجامعة!",
    "home.search": "ابحث عن العناصر...",
    
    // Settings
    "settings.title": "الإعدادات",
    "settings.subtitle": "إدارة ملفك الشخصي وتفضيلاتك وإعدادات الحساب.",
    "settings.profile": "معلومات الملف الشخصي",
    "settings.language": "اللغة",
    "settings.notifications": "الإشعارات",
    "settings.privacy": "الخصوصية والأمان",
    
    // Common
    "common.loading": "جارٍ التحميل...",
    "common.save": "حفظ",
    "common.cancel": "إلغاء",
    "common.delete": "حذف",
    "common.edit": "تعديل",
    "common.submit": "إرسال",
  },
};

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>("en");

  useEffect(() => {
    // Load saved language preference
    const savedLang = localStorage.getItem("language") as Language;
    if (savedLang && (savedLang === "en" || savedLang === "ar")) {
      setLanguageState(savedLang);
      // Apply RTL for Arabic
      if (savedLang === "ar") {
        document.documentElement.dir = "rtl";
        document.documentElement.lang = "ar";
      } else {
        document.documentElement.dir = "ltr";
        document.documentElement.lang = "en";
      }
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem("language", lang);
    
    // Apply RTL for Arabic
    if (lang === "ar") {
      document.documentElement.dir = "rtl";
      document.documentElement.lang = "ar";
    } else {
      document.documentElement.dir = "ltr";
      document.documentElement.lang = "en";
    }
  };

  const t = (key: string): string => {
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
