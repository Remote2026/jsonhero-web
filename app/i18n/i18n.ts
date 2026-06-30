import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

import { resources } from "./translations";

// Initialize i18next. In Remix SSR this runs on both server and client.
// LanguageDetector is a no-op on the server (no navigator/localStorage),
// so it falls back to 'en'. On the client it detects from browser settings.
try {
  i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
      resources,
      fallbackLng: "en",
      defaultNS: "common",
      detection: {
        order: ["navigator", "localStorage", "htmlTag"],
        caches: ["localStorage"],
      },
      interpolation: {
        escapeValue: false,
      },
    });
} catch (e) {
  console.error("i18n initialization failed:", e);
}

export default i18n;
