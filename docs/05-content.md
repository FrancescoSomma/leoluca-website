# Contenuti

## Tono di voce

Proposta, da confermare con il cliente.

Prima persona singolare. Frasi corte. Nessun cliché del settore matrimoni:
niente «catturare l'emozione», «momenti indimenticabili», «per sempre».

Il criterio viene dalle sue parole: «più semplice è meglio è, però comunque
abbia la sua faccia, la sua figura». Semplice non vuol dire anonimo. Se un
paragrafo potrebbe essere scritto da qualunque altro fotografo, è sbagliato.

L'inglese non è una traduzione letterale: è la stessa cosa detta da qualcuno
che l'inglese lo parla. Le frasi italiane costruite a incastro vanno rifatte,
non tradotte.

## Testi per pagina

Chi li produce, e quanto devono essere lunghi.

| Pagina | Testo | Lunghezza | Autore |
| --- | --- | --- | --- |
| Home | Motto dell'hero | 1 riga, max 60 caratteri | Leo |
| Home | Frase di raccordo verso il portfolio | 1-2 righe | Leo |
| Chi sono | Presentazione in prima persona | 200-300 parole | Leo |
| FAQ | 6-10 domande con risposta | 2-4 righe a risposta | Leo |
| Contatti | Introduzione al form | 1-2 righe | Leo |
| Conferma | Messaggio dopo l'invio, con tempi di risposta attesi | 2 righe | Leo |
| Tutte | Testi alternativi delle foto | 1 riga a foto | **non Leo** |
| Tutte | `title` e `meta description` | vedi § SEO | **non Leo** |
| Tutte | Versione inglese di tutto quanto sopra | — | **non Leo** |

Leo scrive solo in italiano. La versione inglese è a carico dello sviluppo,
come deciso in [ADR-0002](03-adr/0002-gestione-contenuti.md).

## Cosa serve da Leo

Lista da inviargli. È il blocco su tutto il resto del lavoro sui contenuti.

**Testi** — in italiano, anche grezzi. Li sistemiamo noi.

1. Motto o frase di apertura, una riga.
2. Presentazione per «Chi sono», 200-300 parole, in prima persona: come lavora,
   come si comporta durante una giornata, cosa non fa.
3. Da 6 a 10 domande ricorrenti con la sua risposta. Spunti: quanto costa e
   cosa comprende, dove si sposta e se il viaggio si paga, se lavora con un
   secondo fotografo, in quanto tempo consegna, in che forma consegna, se fa
   anche il servizio pre-matrimonio, cosa succede se piove.
4. Una riga di introduzione al form di contatto, e una per la pagina di
   conferma, con i tempi entro cui risponde.
5. Le fasce di budget che vuole vedere nel form, con le soglie che usa davvero
   per selezionare.

**Immagini**

6. La selezione per il portfolio: 100-200 file, qualità massima, così come
   escono dalla sua esportazione.
7. **L'ordine.** Il portfolio è un flusso unico: la sequenza è il prodotto. Se
   non riesce a ordinarle tutte, almeno dividerle in tre gruppi per preferenza
   e indicare quale apre il flusso.
8. Un suo ritratto, per «Chi sono».
9. La clip per l'hero, se esiste: file, durata, da dove viene. Se non esiste,
   basta che lo dica: l'hero funziona anche senza.
10. Tutti i loghi che ha, in tutti i formati che ha, anche disordinati.

**Informazioni**

11. Contatti pubblici: email, telefono, area geografica in cui lavora. Partita
    IVA se va messa in fondo alle pagine.
12. Profili social da collegare, oppure conferma che non ne vuole.
13. A quale indirizzo email devono arrivare le richieste dal form.
14. Quale dei due domini vuole come principale.
15. Tre siti di fotografi che gli piacciono e **tre che detesta**, con una riga
    di motivo per ciascuno. Ha già dato `matteolomonte.it` come positivo. I
    negativi servono più dei positivi: dicono dove non andare.

**Da chiarire**

16. **Liberatorie.** Ha il consenso scritto degli sposi per pubblicare le foto,
    e quel consenso copre anche i volti degli invitati riconoscibili? Finché
    non c'è risposta, nessuna foto va online. È l'unico rischio legale del
    progetto e non si aggira.
17. Invito come collaboratore su Netlify e su Register.it. Nessuna password
    condivisa: solo inviti nominali, revocabili da lui in qualsiasi momento.
18. Il sito attuale su Netlify: quali indirizzi sono raggiungibili oggi, e se
    qualcuno li ha mai condivisi o indicizzati.

## SEO

- Una `title` e una `meta description` per pagina e per lingua. Title ≤ 60
  caratteri, description ≤ 155.
- Parole chiave per pagina: da definire quando i testi esistono. Le pagine che
  possono posizionarsi sono «Chi sono» e la home, sul nome e sull'area
  geografica. Il portfolio non compete su testo.
- Dati strutturati: `LocalBusiness` sulla home, `ImageObject` sulle foto del
  portfolio.
- `hreflang` reciproco tra italiano e inglese, con `x-default` verso
  l'italiano.

## Immagini

**Naming.** `NNN-parola-chiave.jpg`, dove `NNN` è la posizione iniziale nel
flusso. La posizione definitiva vive nei metadati, non nel nome del file: il
nome serve solo a caricare le foto nell'ordine giusto la prima volta.

**Testi alternativi.** Obbligatori, in italiano e in inglese, uno per foto.
Descrivono cosa si vede, non cosa si prova: «sposa di spalle sulla scalinata
della chiesa», non «momento carico di emozione». Niente «foto di», niente
«immagine di». Circa 100 caratteri.

Sono a carico dello sviluppo. Con 100-200 foto in due lingue sono 200-400
stringhe, da rifare a ogni sostituzione del portfolio: vanno prezzate nel
preventivo come voce ricorrente, non regalate.

**Crediti.** Tutte le foto sono di Leo. Nessun credito per foto.

**Liberatorie.** Nessuna foto va pubblicata prima della risposta al punto 16.
