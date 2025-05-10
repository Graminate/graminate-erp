import englishGeneralSettings from "./english/general";
import englishAccountSettings from "./english/account";
import hindiGeneralSettings from "./hindi/general";
import hindiAccountSettings from "./hindi/account";
import assameseGeneralSettings from "./assamese/general";
import assameseAccountSettings from "./assamese/account";
import englishSidebar from "./english/sidebar";
import hindiSidebar from "./hindi/sidebar";
import assameseSidebar from "./assamese/sidebar";

const englishTranslations = {
  ...englishGeneralSettings,
  ...englishAccountSettings,
  ...englishSidebar,
};

const hindiTranslations = {
  ...hindiGeneralSettings,
  ...hindiAccountSettings,
  ...hindiSidebar,
};

const assameseTranslations = {
  ...assameseGeneralSettings,
  ...assameseAccountSettings,
  ...assameseSidebar,
};

export const translations = {
  English: englishTranslations,
  Hindi: hindiTranslations,
  Assamese: assameseTranslations,
};

export type SupportedLanguage = keyof typeof translations;
export type TranslationKey = keyof typeof englishTranslations;

export const getTranslator = (language: SupportedLanguage) => {
  const langTranslations = translations[language] || translations.English;
  const fallbackTranslations = translations.English;

  return (key: TranslationKey): string => {
    const typedKey = key as keyof typeof langTranslations;
    return (
      langTranslations[typedKey] || fallbackTranslations[key] || String(key)
    );
  };
};
