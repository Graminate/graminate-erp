import i18next from "i18next";
import { initReactI18next } from "react-i18next";

i18next.use(initReactI18next).init({
  resources: {
    en: { translation: { welcome: "Welcome" } },
    hi: { translation: { welcome: "स्वागत है" } },
    as: { translation: { welcome: "স্বাগতম" } },
  },
  lng: "en", // Default language
  fallbackLng: "en",
  interpolation: { escapeValue: false },
});

export default i18next;
