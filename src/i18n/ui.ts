import type { Locale } from "./routes";

const UI = {
  it: {
    "nav.label": "Principale",
    "nav.portfolio": "Portfolio",
    "nav.about": "Chi sono",
    "nav.faq": "FAQ",
    "nav.contact": "Contatti",
    "lang.switch": "English",
    "skip.content": "Vai al contenuto",
    "form.send": "Invia richiesta",
    "form.error.required": "Questo campo è obbligatorio",
    "form.error.email": "Inserisci un indirizzo email valido",
  },
  en: {
    "nav.label": "Main",
    "nav.portfolio": "Portfolio",
    "nav.about": "About",
    "nav.faq": "FAQ",
    "nav.contact": "Contact",
    "lang.switch": "Italiano",
    "skip.content": "Skip to content",
    "form.send": "Send request",
    "form.error.required": "This field is required",
    "form.error.email": "Enter a valid email address",
  },
} as const;

export type UiKey = keyof (typeof UI)["it"];

export function t(locale: Locale, key: UiKey): string {
  return UI[locale][key];
}
