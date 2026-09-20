# ADR-0002 — Gestione dei contenuti dopo il lancio

Stato: accettato
Data: 2026-09-20

## Contesto

Chi carica le foto dopo il lancio determina stack, hosting, costo ricorrente e
contratto di manutenzione. La decisione è rimasta deliberatamente aperta finché
la discovery non ha prodotto la risposta del cliente.

La call l'ha prodotta. Dalla discovery:

- Leo carica e aggiorna le foto da solo.
- Circa 3 aggiornamenti l'anno, concentrati durante la stagione.
- Logica di sostituzione, non di accumulo: «quando metto qualcosa, tolgo
  altro».
- Tolleranza tecnica bassa: ha provato a costruirsi il sito da solo con l'AI e
  non ci è riuscito.
- Il portfolio è un flusso unico ordinato, senza categorie.
- Gli originali pesano circa 10 MB l'uno, 1-2 GB in totale.

## Decisione

Leo aggiorna il portfolio da sé, attraverso un **pannello web con i contenuti
versionati nel repository**.

1. Leo apre un URL, autentica, carica e riordina le foto con trascinamento. Il
   sito si ricostruisce da solo.
2. In git finiscono i **metadati**: ordine del flusso, testi alternativi, testi
   delle pagine, FAQ, impostazioni. Sono contenuto versionato come il resto
   delle decisioni di progetto, coerentemente con ADR-0001.
3. Gli **originali non stanno in git**. Vivono su uno storage esterno e non
   vengono mai serviti al browser: ogni immagine pubblicata è un derivato
   prodotto dalla pipeline.
4. Nessun canone ricorrente a carico di Leo per la gestione dei contenuti.
5. I testi alternativi delle foto **non li scrive Leo**. Sono a carico dello
   sviluppo e vanno prezzati: 100-200 foto in due lingue significano 200-400
   stringhe, da rifare a ogni sostituzione.

La scelta del prodotto concreto che implementa il pannello è una decisione di
stack e appartiene ad ADR-0003.

## Alternative scartate

| Alternativa | Perché scartata |
| --- | --- |
| CMS ospitato da terzi | Risolve da sé storage e interfaccia, ma introduce un canone a carico di Leo e vincola il progetto a un fornitore per anni. Su un sito aggiornato 3 volte l'anno il rapporto tra costo ricorrente e uso è sfavorevole. |
| Cartella cloud condivisa più build automatica | Attrito minimo per Leo, che userebbe uno strumento già suo. Ma l'ordine del flusso e i testi alternativi diventano incontrollabili, e su un portfolio dove la sequenza è curata l'ordine è il prodotto. |
| Pubblicazione a carico nostro, a contratto | 3 aggiornamenti l'anno non giustificano un pannello da costruire, e terrebbe la pipeline sotto controllo totale. Scartata perché contraddice quanto Leo ha dichiarato in call: vuole farlo da sé. |
| Portfolio delegato a Pic-Time | Zero lavoro e Leo lo sa già usare. Scartata perché l'obiettivo primario è l'ammissione ai contest, che richiedono un sito proprio: il lavoro vivrebbe su un dominio di terzi, fuori dal nostro controllo di performance e accessibilità. |

## Conseguenze

Positive: nessun costo ricorrente per il cliente, contenuti versionati e
ricostruibili, autonomia reale di Leo sul flusso del portfolio, controllo
completo sulla pipeline immagini.

Negative: il pannello è un componente in più da costruire e mantenere, con
un'autenticazione da gestire. Serve uno storage esterno per gli originali, che
è una dipendenza aggiuntiva. I testi alternativi restano un costo ricorrente a
nostro carico a ogni aggiornamento, e vanno messi nel preventivo: se non lo
sono, il progetto perde soldi tre volte l'anno.
