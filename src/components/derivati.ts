import { inferRemoteSize } from "astro:assets";

// Larghezze e lato lungo massimo sono vincoli di spec (US-2), non
// preferenze: non parametrizzarli. I formati (avif/webp) non vivono qui:
// sono letterali nei `<Picture>` di Foto.astro e Hero.astro.
const LARGHEZZE = [400, 800, 1200, 1600, 2400];
const LATO_LUNGO_MASSIMO = 2400;

// `getSrcSet` (node_modules/astro/dist/assets/services/service.js) ricava
// l'altezza di ogni derivato dal rapporto tra width e height passati a
// `<Picture>` (larghezza/altezza restituiti da questa funzione, già
// arrotondati), non da quello dell'originale: sulle larghezze intermedie il
// risultato può differire di ±1 px da questo calcolo, mai sulla più grande,
// dove i due rapporti coincidono per costruzione. Qui si usa il rapporto
// dell'originale, per scartare le larghezze il cui lato lungo supererebbe
// il limite.
function altezzaPer(
  larghezza: number,
  larghezzaOriginale: number,
  altezzaOriginale: number,
): number {
  return Math.round((larghezza * altezzaOriginale) / larghezzaOriginale);
}
function latoLungo(
  larghezza: number,
  larghezzaOriginale: number,
  altezzaOriginale: number,
): number {
  return Math.max(
    larghezza,
    altezzaPer(larghezza, larghezzaOriginale, altezzaOriginale),
  );
}

// Calcolo puro, senza rete: separato da misuraDerivati per essere testabile
// a valori fissi (tests/unit/derivati.test.ts), senza dover mockare
// inferRemoteSize.
export function dimensioniDerivati(
  larghezzaOriginale: number,
  altezzaOriginale: number,
): { larghezze: number[]; larghezza: number; altezza: number } {
  const larghezze = LARGHEZZE.filter(
    (larghezza) =>
      latoLungo(larghezza, larghezzaOriginale, altezzaOriginale) <=
      LATO_LUNGO_MASSIMO,
  );
  // Se anche la più piccola larghezza superasse il limite (rapporto oltre
  // 1:6, estraneo alla fotografia di matrimonio), `larghezze` resta vuoto:
  // <Picture> riceve `widths={[]}`, il `<source>` per ogni formato viene
  // emesso con `srcset` vuoto e l'`<img>` dichiara LARGHEZZE[0] di larghezza
  // con un'altezza che supera i 2400 px. Si accetta piuttosto che far
  // fallire la build: bloccarla contraddirebbe US-7 ("un originale da 10 MB
  // non fa fallire la build né per peso né per formato"), e un rapporto
  // così estremo è comunque estraneo al soggetto di questo sito.
  const larghezza = larghezze.at(-1) ?? LARGHEZZE[0];
  const altezza = altezzaPer(larghezza, larghezzaOriginale, altezzaOriginale);
  return { larghezze, larghezza, altezza };
}

// Niente `inferSize`: su un'immagine remota mette nell'`<img>` un derivato
// grande quanto l'originale (node_modules/astro/components/Picture.astro,
// blocco inferSize), e `getSrcSet` non taglia le larghezze per le immagini
// remote (node_modules/astro/dist/assets/services/service.js): un ritratto
// stretto supererebbe i 2400 px di lato lungo anche nel derivato "2400w". Si
// legge la dimensione a mano con `inferRemoteSize` da `astro:assets` (non da
// `astro/assets/utils`): quella versione è già legata a
// `image.remotePatterns` e rifiuta un URL fuori pattern, l'altra no.
export async function misuraDerivati(
  src: string,
): Promise<{ larghezze: number[]; larghezza: number; altezza: number }> {
  const { width, height } = await inferRemoteSize(src);
  return dimensioniDerivati(width, height);
}
