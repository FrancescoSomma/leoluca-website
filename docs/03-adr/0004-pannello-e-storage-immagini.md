# ADR-0004 — Pannello di redazione e storage degli originali

Stato: accettato
Data: 2026-09-21

## Contesto

[ADR-0002](0002-gestione-contenuti.md) ha deciso il modello operativo: Leo
aggiorna da sé, i metadati sono versionati in git, gli originali stanno fuori.
Questo ADR sceglie i componenti che lo realizzano.

Vincoli:

- Leo carica, rimuove e riordina le foto per trascinamento, da un URL con
  autenticazione propria. Non condivide le password di Netlify o Register.it.
- Ordine del flusso, testi alternativi in due lingue, testi delle pagine e FAQ
  vivono in git.
- Gli originali pesano circa 10 MB l'uno, 1-2 GB in totale, e crescono a ogni
  sostituzione. In git non ci stanno: git conserva la storia, quindi il peso
  non si recupera mai più rimuovendo i file.
- Il sito cambia tre volte l'anno. Ogni componente ha un costo di manutenzione
  annuo contro un beneficio trimestrale.
- Nessun canone ricorrente a carico di Leo, come stabilito in ADR-0002.

## Decisione

**Un CMS git-based per il pannello, uno storage a oggetti per gli originali.**

Il CMS git-based scrive i metadati come file nel repository e attiva la
ricostruzione del sito a ogni pubblicazione: è il modo diretto di ottenere il
"contenuti versionati" di ADR-0002 senza costruire un pannello da zero. I
candidati sono Decap CMS, Sveltia CMS e Pages CMS, tutti con lo stesso modello
di funzionamento e differenze che stanno nell'autenticazione e nella qualità
dell'interfaccia di riordino.

Gli originali vanno su uno storage a oggetti, e la build ne ricava i derivati.
Lo storage a oggetti, e non una cartella nel repository, perché la storia di
git è permanente: tre sostituzioni l'anno su un flusso di 150 foto
significherebbero centinaia di megabyte l'anno di peso che nessuna cancellazione
recupera.

## Da verificare prima di scegliere il prodotto

La direzione è accettata. Il prodotto concreto che implementa il pannello non è
ancora scelto, e due punti vanno accertati prima di sceglierlo. Nessuna
dipendenza entra nel progetto finché non sono chiusi.

1. **Il percorso di autenticazione del pannello.** La strada storica dei CMS
   git-based su Netlify era il servizio di identità della piattaforma, che
   Netlify ha deprecato. Le alternative sono un'autenticazione OAuth verso il
   provider del repository, che richiede un piccolo servizio dedicato, oppure un
   servizio ospitato con un piano gratuito, che però reintroduce la dipendenza
   da terzi che ADR-0002 voleva evitare. Va accertato quale sia oggi il
   percorso valido, e a che costo, prima di scegliere il candidato.
2. **Dove finiscono gli originali caricati dal pannello.** Un CMS git-based per
   impostazione predefinita scrive i file caricati dentro il repository: è
   esattamente ciò che questo ADR esclude. Va verificato che il candidato scelto
   sappia scrivere i binari su uno storage esterno, o che accetti un passaggio
   intermedio che lo faccia. **Metà di questo punto è già chiusa:** Astro sa
   ottimizzare in build immagini prese da URL remoto tramite
   `image.remotePatterns`, e la documentazione ufficiale porta come esempio
   proprio un bucket S3. Il lato consumo è quindi una strada supportata, non
   un'acrobazia. Resta da verificare solo il lato scrittura, cioè se il pannello
   sappia caricare lì invece che nel repository.

La verifica va fatta come prova usa e getta fuori dal repository di progetto,
per non introdurre dipendenze prima che il prodotto sia scelto.

## Alternative scartate

| Alternativa | Perché scartata |
| --- | --- |
| Pannello su misura | Controllo totale su un'interfaccia che deve fare poco: una lista riordinabile e un caricamento. Scartato perché autenticazione, caricamento dei file e gestione degli errori sono il grosso del lavoro, e sarebbero codice nostro da mantenere per anni a fronte di tre usi l'anno. |
| CMS ospitato con canone | Risolve pannello, autenticazione e storage in un colpo solo, con un'interfaccia migliore di qualunque cosa costruiremmo. Già scartato in ADR-0002 per il canone a carico del cliente e il vincolo di fornitore. |
| Originali nel repository | Nessuno storage in più da gestire, tutto in un posto solo. Scartato per la crescita permanente della storia di git descritta sopra. |
| Originali solo sull'archivio di Leo | È un fotografo, gli originali li ha già e li conserva comunque. Scartato perché la build deve poter rigenerare i derivati senza dipendere dal suo disco: se cambiano le larghezze o i formati, servono gli originali raggiungibili da una macchina. |
| Media CDN con trasformazione al volo | Elimina i derivati dalla build e serve le immagini già ottimizzate. Da riconsiderare se la verifica sul punto 2 si complica, ma introduce un fornitore in più e sposta fuori dal nostro controllo il rispetto dei budget di peso. |

## Conseguenze

Positive: Leo ottiene un pannello vero senza che lo si scriva, i metadati
restano versionati e ogni errore è reversibile, il repository resta leggero
indefinitamente.

Negative: due componenti in più rispetto a un sito puramente statico, ciascuno
con i propri aggiornamenti di sicurezza da seguire su un progetto che si tocca
tre volte l'anno. L'autenticazione del pannello è la parte più fragile
dell'intera architettura e, se si rompe, si rompe quando Leo ne ha bisogno,
cioè durante la stagione. Lo storage a oggetti è un costo ricorrente, piccolo
ma reale: va deciso se lo paga il cliente o se rientra nella manutenzione.
