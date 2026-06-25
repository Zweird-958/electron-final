import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import fr from "./locales/fr.json";
import en from "./locales/en.json";
import { DEFAULT_LANGUAGE } from "@/constants/settings.constants";
import LanguageDetector from "i18next-browser-languagedetector";

i18n
	.use(initReactI18next)
	.use(LanguageDetector)
	.init({
		resources: {
			fr: { translation: fr },
			en: { translation: en },
		},
		lng: DEFAULT_LANGUAGE,
		fallbackLng: DEFAULT_LANGUAGE,
		interpolation: {
			escapeValue: false,
		},
	});

export default i18n;
