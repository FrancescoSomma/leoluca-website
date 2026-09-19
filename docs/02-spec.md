# Specifica

> Da completare in F2. Deve essere autoconsistente: chi la legge deve poter
> implementare senza tornare alla chat.

## Sitemap

## Modello dei contenuti

## User story

Formato: come <ruolo> voglio <azione> per <beneficio>, con criteri di
accettazione verificabili.

## Budget (vincoli, non obiettivi)

| Metrica | Limite | Come si misura |
| --- | --- | --- |
| LCP (4G, mobile) | ≤ 2.0 s | Lighthouse CI, pagina galleria più pesante |
| CLS | < 0.1 | Lighthouse CI |
| Peso trasferito homepage | ≤ 1.2 MB | Lighthouse CI |
| Accessibilità | WCAG 2.2 AA sui percorsi principali | axe, verifica manuale tastiera |

I valori sopra sono una proposta di partenza: vanno confermati o corretti in F2
sui contenuti reali.

## Percorso critico

Arrivo → galleria → richiesta preventivo → conferma. È l'unico percorso coperto
da test end-to-end obbligatori.

## Fuori ambito

Elenco esplicito di ciò che non facciamo in questa versione. Serve al
`spec-guardian`.
