import { z } from "astro/zod";

export const FotoSchema = z.object({
  file: z.string().url().startsWith("https://"),
  ordine: z.number().int().nonnegative(),
  alt_it: z.string().min(1),
  alt_en: z.string().min(1),
  in_home: z.boolean().default(false),
});
export type Foto = z.infer<typeof FotoSchema>;

export const PaginaSchema = z.object({
  slug: z.string().min(1),
  titolo_it: z.string().min(1),
  titolo_en: z.string().min(1),
  seo_title_it: z.string().min(1).max(60),
  seo_title_en: z.string().min(1).max(60),
  seo_description_it: z.string().min(1).max(155),
  seo_description_en: z.string().min(1).max(155),
  corpo_it: z.string().default(""),
  corpo_en: z.string().default(""),
});
export type Pagina = z.infer<typeof PaginaSchema>;

export const FaqSchema = z.object({
  ordine: z.number().int().nonnegative(),
  domanda_it: z.string().min(1),
  domanda_en: z.string().min(1),
  risposta_it: z.string().min(1),
  risposta_en: z.string().min(1),
});
export type Faq = z.infer<typeof FaqSchema>;

export const ImpostazioniSchema = z.object({
  motto_it: z.string().min(1),
  motto_en: z.string().min(1),
  hero_poster: z.string().url(),
  hero_clip: z.string().url().optional(),
  email: z.string().email(),
  telefono: z.string().optional(),
  area: z.string().min(1),
  social: z
    .array(z.object({ nome: z.string(), url: z.string().url() }))
    .default([]),
});
export type Impostazioni = z.infer<typeof ImpostazioniSchema>;
