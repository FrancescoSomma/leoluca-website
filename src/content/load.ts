import type { Locale } from "../i18n/routes";
import {
  FotoSchema,
  FaqSchema,
  PaginaSchema,
  ImpostazioniSchema,
  type Foto,
  type Faq,
  type Pagina,
  type Impostazioni,
} from "./schema";
// Import statici, non letture da disco: nel bundle di build di Vite un
// percorso relativo a import.meta.url non punta più ai file sorgente.
import datiFoto from "./foto.json";
import datiFaq from "./faq.json";
import datiPagine from "./pagine.json";
import datiImpostazioni from "./impostazioni.json";

export function caricaFoto(): Foto[] {
  const foto = FotoSchema.array().parse(datiFoto);
  const ordini = foto.map((f) => f.ordine);
  if (new Set(ordini).size !== ordini.length) {
    throw new Error("foto.json: due foto hanno lo stesso ordine");
  }
  return foto.sort((a, b) => a.ordine - b.ordine);
}

export function caricaFaq(): Faq[] {
  return FaqSchema.array()
    .parse(datiFaq)
    .sort((a, b) => a.ordine - b.ordine);
}

export function caricaPagine(): Pagina[] {
  return PaginaSchema.array().parse(datiPagine);
}

export function seoPer(slug: string, locale: Locale) {
  const pagina = caricaPagine().find((p) => p.slug === slug);
  if (!pagina) throw new Error(`pagine.json: manca la pagina "${slug}"`);
  return locale === "it"
    ? { title: pagina.seo_title_it, description: pagina.seo_description_it }
    : { title: pagina.seo_title_en, description: pagina.seo_description_en };
}

export function caricaImpostazioni(): Impostazioni {
  return ImpostazioniSchema.parse(datiImpostazioni);
}

export function altPer(foto: Foto, locale: Locale): string {
  return locale === "it" ? foto.alt_it : foto.alt_en;
}

// Stringa vuota se la traduzione manca: nessun ripiego sull'italiano (US-8).
// La pagina chiamante decide se non rendere il paragrafo.
export function corpoPer(slug: string, locale: Locale): string {
  const pagina = caricaPagine().find((p) => p.slug === slug);
  if (!pagina) throw new Error(`pagine.json: manca la pagina "${slug}"`);
  return locale === "it" ? pagina.corpo_it : pagina.corpo_en;
}
