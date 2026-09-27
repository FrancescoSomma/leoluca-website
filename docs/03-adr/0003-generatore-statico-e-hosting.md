# ADR-0003 — Generatore statico e hosting

Stato: accettato
Data: 2026-09-21

## Contesto

[02-spec.md](../02-spec.md) è completo e [ADR-0002](0002-gestione-contenuti.md)
è accettato. I vincoli che la scelta deve soddisfare:

- Sei tipi di pagina in due lingue. Contenuto quasi interamente statico.
- 100-200 immagini pesanti. La pipeline immagini è obbligatoria e nessun
  originale viene servito.
- LCP ≤ 2.0 s su mobile, CLS < 0.1, JavaScript ≤ 50 KB compressi per pagina.
- WCAG 2.2 AA su tutte le pagine.
- Un form di contatto con dieci campi, recapitato via email, senza CAPTCHA
  visibile e senza un backend da mantenere.
- Il cliente possiede già un account Netlify, con un sito parziale e problemi
  di certificato, e due domini su Register.it.
- Il sito cambia tre volte l'anno. Ogni componente in più è un costo di
  manutenzione che si paga per anni contro un beneficio che si incassa tre
  volte l'anno.

## Decisione

**Astro come generatore statico, Netlify come hosting.**

Astro perché non spedisce JavaScript se non glielo si chiede, il che rende il
budget di 50 KB per pagina un punto di partenza invece che un traguardo. Ha una
pipeline immagini nativa basata su sharp, che copre AVIF, WebP, `srcset` e le
dimensioni intrinseche richieste per tenere il CLS. Il routing multilingua è
parte del framework, non un innesto.

Versione al momento della decisione: **Astro 7.3.3**, pubblicata il 16
settembre 2026. Il progetto parte da lì.

Netlify perché è già in mano al cliente: l'account esiste, i domini sono
puntabili, e i problemi di certificato attuali si risolvono sul suo account
senza migrare nulla. Il suo servizio di gestione form copre i dieci campi del
percorso critico con recapito via email e filtro anti-spam non visibile
all'utente, che è esattamente il requisito di US-5: nessun backend da scrivere
né da mantenere.

Corollario: [`.gitignore`](../../.gitignore) ignora già `.astro/`. Era una
pre-decisione non documentata, presa prima di questo ADR. Con l'accettazione
diventa legittima. Se l'ADR viene respinto, quella riga va rimossa.

## Alternative scartate

| Alternativa | Perché scartata |
| --- | --- |
| Eleventy | Più nudo e più semplice di Astro, nessun runtime da capire. Scartato perché pipeline immagini e routing multilingua andrebbero montati a mano: su un progetto dove entrambi sono requisiti di spec, si finirebbe per riscrivere ciò che Astro dà di serie, con meno garanzie. |
| Next.js o SvelteKit | Maturi e conosciuti. Scartati perché portano un runtime JavaScript e un modello di rendering che un sito di sei pagine aggiornato tre volte l'anno non ripaga: complessità operativa senza un requisito che la richieda. |
| HTML scritto a mano | Zero dipendenze, zero build, imbattibile come costo di manutenzione. Scartato perché duecento immagini per cinque larghezze per due formati sono diecimila derivati: senza una build si fanno a mano o non si fanno. |
| Vercel o Cloudflare Pages al posto di Netlify | Tecnicamente equivalenti o superiori. Scartati perché richiederebbero al cliente un account nuovo su un servizio in più, contro un beneficio nullo: il collo di bottiglia non è l'hosting. |

## Conseguenze

Positive: i budget di performance sono raggiungibili senza combattere il
framework. La pipeline immagini e il multilingua non sono codice nostro da
mantenere. Il form non richiede backend. Il cliente non apre account nuovi e
conserva la proprietà dell'infrastruttura.

Negative: Astro rilascia versioni maggiori in fretta: la 6.0 è del 10 marzo
2026, la 7.0 del 22 giugno 2026, tre mesi dopo. Un sito che si tocca tre volte
l'anno accumula distacco tra un intervento e l'altro. L'attenuante è che la
guida di migrazione alla 7 dichiara che la maggior parte dei progetti passa
senza modifiche al proprio codice, perché le rotture riguardano soprattutto
integrazioni e plugin che dipendono dagli interni di Vite: il rischio esiste ma
finora è contenuto. Va messo in conto nel contratto di manutenzione, non
scoperto dopo. Il form ci lega a Netlify: cambiare hosting significa riscrivere
il percorso critico. Sui piani Netlify attuali, a crediti, gli invii dei form
sono illimitati; sui vecchi piani Free e Starter il tetto è di 100 invii al
mese, non superabile, e l'account di Leo preesiste quindi va verificato su quale
piano sia. Per il volume atteso di un fotografo di matrimoni anche 100 al mese
sono abbondanti, ma il tetto è rigido e va conosciuto.

**Aggiornamento (2026-09-27, dal Task 10a).** Sui piani a crediti il limite
che conta non è il form, ma il credito. Il Free ha 300 crediti al mese, con
un tetto rigido: non se ne comprano altri. Li consumano la banda (20 crediti
per GB), ogni deploy di produzione (15) e le richieste (2 ogni 10.000). A
crediti esauriti tutti i progetti del team si sospendono fino al ciclo
successivo, e il form smette di ricevere. Un sito di fotografie consuma
soprattutto banda, e un pannello che pubblica a ogni salvataggio
([ADR-0004](0004-pannello-e-storage-immagini.md)) fa di ogni salvataggio un
deploy di produzione. Francesco consiglierà a Leo il piano Personal, 9 $ al
mese per 1.000 crediti, con la ricarica automatica accesa (500 crediti per
5 $): un sito spento mentre una giuria lo guarda costa più di qualunque
ricarica. Resta da confermare con Leo, insieme al piano su cui è oggi il suo
account ([01-discovery.md](../01-discovery.md), § Rimasto aperto). La
checklist della messa online è in [06-runbook.md](../06-runbook.md) §
Manutenzione.
