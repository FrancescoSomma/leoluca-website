# Specifica

Perimetro completo del sito. Nulla che non sia qui dentro va implementato: se
serve qualcosa che manca, si aggiorna prima questo documento.

## Sitemap

Sei tipi di pagina, ciascuno in due lingue. Nient'altro.

| Pagina | Italiano | Inglese |
| --- | --- | --- |
| Home | `/it/` | `/en/` |
| Portfolio | `/it/portfolio/` | `/en/portfolio/` |
| Chi sono | `/it/chi-sono/` | `/en/about/` |
| FAQ | `/it/faq/` | `/en/faq/` |
| Contatti | `/it/contatti/` | `/en/contact/` |
| Conferma invio | `/it/grazie/` | `/en/thank-you/` |

Più: `/` che redirige a `/it/`, una pagina 404 per lingua, `sitemap.xml`,
`robots.txt`.

La pagina di conferma ha un URL proprio perché il percorso critico deve essere
verificabile end-to-end e l'invio riuscito deve essere uno stato indirizzabile.

## Modello dei contenuti

Cinque entità. Le prime quattro sono contenuto versionato, la quinta è un
invio e non viene conservata nel repository.

### Foto

Una sola collezione ordinata: il flusso del portfolio. Nessuna categoria,
nessun raggruppamento, nessuna appartenenza a un matrimonio.

| Campo | Tipo | Obbligatorio |
| --- | --- | --- |
| `file` | riferimento all'originale sullo storage esterno | sì |
| `ordine` | intero, definisce la sequenza del flusso | sì |
| `alt_it` | testo alternativo in italiano | sì |
| `alt_en` | testo alternativo in inglese | sì |
| `in_home` | booleano, seleziona le foto di richiamo in home | no |

I testi alternativi sono obbligatori perché le foto di un portfolio sono
contenuto, non decorazione. Non li scrive il cliente: vedi
[ADR-0002](03-adr/0002-gestione-contenuti.md).

### Pagina

| Campo | Tipo |
| --- | --- |
| `slug` | identificatore |
| `titolo_it`, `titolo_en` | testo |
| `seo_title_it`, `seo_title_en` | testo, ≤ 60 caratteri |
| `seo_description_it`, `seo_description_en` | testo, ≤ 155 caratteri |
| `corpo_it`, `corpo_en` | testo lungo |

`seo_title_*` e `seo_description_*` sono obbligatori in entrambe le lingue:
li scrive lo sviluppo, non Leo ([05-content.md](05-content.md)), come i testi
alternativi delle foto, e una pagina senza `title` viola WCAG 2.4.2. La regola
che segue vale per i testi che scrive Leo.

Un contenuto privo di versione inglese non viene pubblicato nella sezione
inglese, e il pannello lo segnala. Nessun ripiego automatico sull'italiano: il
sito deve reggere davanti a una giuria internazionale.

### FAQ

`domanda_it`, `domanda_en`, `risposta_it`, `risposta_en`, `ordine`.

### Impostazioni

Singleton: motto dell'hero (IT/EN), media dell'hero (poster e clip
facoltativa), email e telefono pubblici, area geografica, collegamenti social,
indirizzo di destinazione delle richieste.

La home compone il proprio contenuto dal motto e dal media delle Impostazioni,
più il corpo della propria Pagina. Il motto sta qui e non nella Pagina perché
appartiene all'hero, insieme al media con cui viene composto.

### Richiesta di contatto

Non è contenuto: è un invio, recapitato per email e non versionato.

| Campo | Tipo | Obbligatorio |
| --- | --- | --- |
| `nome` | testo | sì |
| `email` | email | sì |
| `telefono` | testo | no |
| `data_evento` | data | sì |
| `tipo_cerimonia` | civile \| religiosa | no |
| `momento` | diurno \| serale | no |
| `location` | testo | sì |
| `wedding_planner` | booleano | no |
| `wedding_planner_nome` | testo, visibile solo se il precedente è vero | no |
| `fascia_budget` | scelta da elenco chiuso | sì |
| `messaggio` | testo lungo | no |

I campi obbligatori sono quelli su cui Leo decide se rispondere. Gli altri
restano facoltativi per non far abbandonare il form.

## User story

### US-1 — Capire lo stile

Come visitatore voglio capire lo stile fotografico di Leo appena arrivo, per
decidere in pochi secondi se è il fotografo che cerco.

- L'elemento LCP della home è una fotografia, non del testo.
- A 390 px e a 1440 px, sopra la piega, sono visibili almeno una fotografia a
  piena larghezza e il nome di Leo.
- La home mostra da 10 a 15 foto di richiamo, con un collegamento esplicito al
  portfolio.
- Nessuna immagine è servita a una risoluzione superiore a quella che il
  viewport richiede.

### US-2 — Scorrere il portfolio

Come visitatore voglio scorrere l'intera selezione senza interruzioni, per
farmi un'idea complessiva del lavoro.

- Il portfolio è un'unica sequenza ordinata. Nessuna categoria, nessun filtro,
  nessuna paginazione visibile.
- L'ordine è quello definito nel contenuto ed è identico a ogni caricamento.
- Al primo render al massimo 3 immagini sono prioritarie (`loading="eager"`).
  Le altre usano il caricamento pigro del browser, che decide quanto
  anticipare. Il peso di ciò che parte prima dell'LCP resta vincolato dal
  budget.
- Ogni immagine dichiara `width` e `height`.
- Ogni immagine ha un testo alternativo non vuoto, nella lingua della pagina.
- La sorgente massima servita è 2400 px sul lato lungo. L'originale non è
  raggiungibile dal markup.

**Modifica rispetto alla bozza iniziale.** Il criterio era "al primo render
vengono richieste al massimo 3 immagini". Il lazy loading nativo di Chrome
anticipa di 1250-2500 px: con foto a piena larghezza, a 320, 390 e 768 px ha
richiesto 5 foto su 5, circa 21 KB in più a 390 px con le foto di prova.
Governarlo richiederebbe un `IntersectionObserver`, uno script sulla pagina
e un componente immagine senza `<Picture>`: un costo sproporzionato, perché
il peso fino all'LCP resta comunque vincolato dal budget.

### US-3 — Sapere chi è

Come visitatore voglio leggere chi è Leo e come lavora, per capire se mi trovo
bene con lui.

- La pagina contiene un ritratto e il testo di presentazione fornito dal
  cliente.
- Disponibile in italiano e in inglese.

### US-4 — Trovare le risposte pratiche

Come coppia interessata voglio trovare le risposte alle domande ricorrenti
prima di scrivere.

- Lista di coppie domanda/risposta, nell'ordine definito nel contenuto.
- Ogni domanda è apribile da tastiera e comunica il proprio stato aperto o
  chiuso alle tecnologie assistive.
- Disponibile in italiano e in inglese.

### US-5 — Richiedere un preventivo

Come coppia voglio inviare una richiesta con i dettagli del mio matrimonio, per
ricevere un preventivo. **Questa storia è il percorso critico.**

- Il form espone tutti i campi dell'entità Richiesta di contatto.
- Il campo con il nome della wedding planner compare solo dopo aver indicato
  che c'è una wedding planner.
- Ogni campo ha una label associata tramite `for` e `id`. Nessun placeholder
  usato al posto di una label.
- Un errore di validazione è associato al campo con `aria-describedby`, è
  annunciato alle tecnologie assistive, e il focus si sposta sul primo campo
  non valido.
- L'invio riuscito porta alla pagina di conferma, con il suo URL.
- La richiesta arriva per email all'indirizzo configurato nelle impostazioni,
  con tutti i campi compilati leggibili.
- Il form è protetto dagli invii automatici senza mostrare un CAPTCHA
  all'utente.
- L'intero percorso è completabile con la sola tastiera.

### US-6 — Leggere in inglese

Come visitatore non italiano voglio leggere il sito nella mia lingua.

- Ogni pagina ha una controparte nell'altra lingua, raggiungibile da un
  controllo presente su ogni pagina.
- Il cambio lingua resta sulla pagina corrente, non riporta alla home.
- L'attributo `lang` di `<html>` corrisponde alla lingua della pagina.
- Ogni pagina dichiara `hreflang` verso la propria controparte e verso se
  stessa.

### US-7 — Sostituire le foto del portfolio

Come Leo voglio sostituire le foto del portfolio da solo, senza chiedere a
nessuno.

- Accesso da un URL con autenticazione propria, senza condividere le password
  di Netlify o Register.it.
- Può caricare nuove foto, rimuovere quelle esistenti e riordinare il flusso
  per trascinamento.
- Alla pubblicazione il sito si ricostruisce senza alcun intervento manuale.
- Il caricamento di un originale da 10 MB non fa fallire la build né per peso
  né per formato.
- Ogni operazione è reversibile, perché i metadati sono versionati.

### US-8 — Correggere un testo

Come Leo voglio correggere un testo o una FAQ senza toccare le foto.

- Dallo stesso pannello, con campi italiano e inglese separati e distinguibili.
- Salvare un testo solo in italiano è possibile, ma quel contenuto non viene
  pubblicato in inglese e il pannello lo segnala.

## Budget (vincoli, non obiettivi)

| Metrica | Limite | Come si misura |
| --- | --- | --- |
| LCP (4G lenta simulata, mobile) | ≤ 2.0 s | Lighthouse CI, home e portfolio |
| CLS | < 0.1 | Lighthouse CI, tutte le pagine |
| Peso trasferito fino all'LCP — home | ≤ 1.2 MB | Lighthouse CI |
| Peso trasferito fino all'LCP — portfolio | ≤ 1.5 MB | Lighthouse CI |
| Clip hero | ≤ 6 s, ≤ 1.5 MB, senza traccia audio | controllo in build |
| JavaScript trasferito per pagina | ≤ 50 KB compresso | Lighthouse CI |
| Accessibilità | WCAG 2.2 AA su tutte le pagine | axe senza violazioni, più verifica manuale da tastiera |

I budget valgono per le pagine pubbliche elencate nella sitemap. Il pannello di
redazione ne è escluso: è uno strumento interno, usato tre volte l'anno da una
persona sola, e i suoi vincoli sono di usabilità, non di peso.

**Modifica rispetto alla bozza iniziale.** Il budget della home era "peso
trasferito ≤ 1.2 MB". È stato ridefinito come *peso trasferito fino all'LCP*
perché l'hero prevede una clip video che carica dopo l'LCP: senza questa
precisazione, escluderla dal conteggio sarebbe un trucco contabile invece che
una scelta dichiarata. Il peso della clip è vincolato a parte, nella riga
dedicata.

## Dispositivi e larghezze

Il sito funziona a **qualunque larghezza da 320 px in su**. Le larghezze qui
sotto sono quelle che fotografiamo e confrontiamo, non le uniche in cui deve
reggere: una pagina che funziona a 390 e a 768 e si rompe a 520 è rotta.

| Larghezza | Cosa rappresenta | Come si tratta |
| --- | --- | --- |
| 320 px | Il pavimento di WCAG 2.2 AA, criterio 1.4.10 | Si verifica, non si disegna |
| 390 px | Telefono di riferimento | Budget di performance e screenshot di confronto |
| 768 px | Tablet in verticale | Screenshot di confronto |
| 1440 px | Desktop di riferimento | Screenshot di confronto e resa delle fotografie |

Telefono e desktop non hanno la stessa funzione, e vale la pena dirlo perché
"mobile first" suggerirebbe il contrario.

**Il telefono è il limite.** I budget di performance si misurano su 4G lenta
mobile: una scelta che li sfora è esclusa lì, prima che altrove.

**Il desktop è dove il lavoro viene giudicato.** L'obiettivo del sito è la
candidatura ai contest, e una giuria guarda le fotografie su uno schermo
grande. Nessuno dei due è un ripensamento dell'altro.

Due criteri di WCAG 2.2 AA riguardano direttamente questa sezione. Sono già
vincolanti per via della riga sull'accessibilità nei budget, e vengono resi
espliciti qui perché una sigla non si applica da sola.

- **1.4.10 Reflow.** A 320 px il contenuto riflussa in una sola colonna.
  Nessuno scorrimento orizzontale, tranne dove è intrinseco al contenuto.
- **2.5.8 Target Size (Minimum).** Ogni bersaglio interattivo misura almeno
  24×24 px. Riguarda il cambio lingua, la navigazione e i controlli del form.

Nessuno dei due è rilevabile in modo affidabile da axe. Si verificano guardando
la pagina e navigandola: è una delle ragioni per cui gli screenshot valgono
come evidenza e le dichiarazioni no.

## Hero della home

L'hero è il punto in cui il desiderio del cliente e i budget di performance si
scontrano. La composizione è vincolata così:

1. L'elemento LCP è un **poster** in AVIF. È sempre presente e da solo
   costituisce un hero completo e sensato.
2. La clip parte **dopo** l'LCP, con `preload="none"`, muta, in `loop` e
   `playsinline`. Sostituisce il poster quando è pronta.
3. Su viewport mobile e in presenza di `prefers-reduced-motion: reduce`, la
   clip non viene né scaricata né riprodotta. Resta il poster.
4. Se la clip manca, l'hero funziona senza. Non è un requisito bloccante.

## Pipeline immagini

Nessun originale viene mai servito al browser.

- Gli originali (circa 10 MB l'uno, 1-2 GB complessivi) risiedono sullo storage
  esterno e non entrano nel repository.
- La build produce derivati in AVIF e WebP alle larghezze 400, 800, 1200, 1600
  e 2400 px. Si scarta ogni larghezza a cui il lato lungo supererebbe i
  2400 px di US-2: una foto verticale 2:3 si ferma a 1600 × 2400.
- Ogni `img` dichiara `srcset`, `sizes`, `width`, `height` e `decoding="async"`.
- `loading="lazy"` su tutte le immagini tranne le prime tre del flusso e il
  poster dell'hero.
- Il formato di ripiego è WebP, e va imposto esplicitamente: per impostazione
  predefinita il generatore ripiega su PNG per gli originali remoti, che sono
  il nostro caso, e PNG è pesante per una fotografia. Nessun JPEG servito.

## SEO

- `title` e `meta description` per pagina e per lingua, dal modello contenuti.
- `hreflang` reciproco tra le due lingue, più `x-default` verso la versione
  italiana della stessa pagina: per la home `/it/`, per le FAQ `/it/faq/`.
  Non verso la home da ogni pagina: un gruppo hreflang dev'essere
  reciproco, e la home non dichiara le altre pagine come proprie
  alternative.
- `sitemap.xml` con entrambe le lingue.
- Dati strutturati: `LocalBusiness` sulla home, `ImageObject` sulle foto del
  portfolio.
- Gli URL del sito Netlify esistente che risultano indicizzati vanno
  redirezionati con 301 verso la pagina corrispondente. L'elenco è una domanda
  ancora aperta in [01-discovery.md](01-discovery.md).

## Percorso critico

Arrivo → portfolio → richiesta di preventivo → conferma.

È l'unico percorso coperto da test end-to-end obbligatori. Un test end-to-end
che fallisce su questo percorso blocca il rilascio.

## Fuori ambito

Elenco chiuso. Serve a `spec-guardian`: ciò che compare qui sotto e nel codice
è scope creep, indipendentemente da quanto sia facile aggiungerlo.

- Gallerie dedicate al singolo matrimonio.
- Area clienti, gallerie private, link protetti, download, scadenze.
- Sezione recensioni o testimonianze.
- Sezioni per tipo di matrimonio.
- Eventi non matrimoniali: 18 anni, comunioni, altro.
- Blog, news, aggiornamenti editoriali.
- Pagamenti, acconti, e-commerce.
- Integrazione con Pic-Time in qualsiasi forma.
- Prenotazione online, calendario di disponibilità.
- Lingue oltre italiano e inglese.
- Analytics e strumenti di tracciamento: nessuno è stato richiesto e nessuno
  viene introdotto senza un ADR.

## Non deciso qui

La scelta di framework, pannello, storage e hosting è una decisione di stack e
vive in [ADR-0003](03-adr/0003-generatore-statico-e-hosting.md) e
[ADR-0004](03-adr/0004-pannello-e-storage-immagini.md). Questo documento
descrive cosa deve fare il sito, non con cosa è costruito.
