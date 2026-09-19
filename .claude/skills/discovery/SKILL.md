---
name: discovery
description: Conduce l'intervista di discovery con il cliente e produce docs/01-discovery.md
disable-model-invocation: true
---

# Discovery

Conduci l'intervista usando lo strumento AskUserQuestion, una domanda per volta,
finché ogni area qui sotto non è coperta. Non fare domande la cui risposta è già
in `docs/00-brief.md`. Scava sui punti difficili, non su quelli ovvi.

Al termine scrivi `docs/01-discovery.md` con le risposte, e marca esplicitamente
ciò che è rimasto indeterminato.

## Aree da coprire

**Business**
- Che tipo di eventi fotografa e quali vuole fotografare di più
- Da dove arrivano oggi i clienti e quanti contatti riceve al mese
- Cosa deve succedere perché il sito sia considerato un successo, in numeri
- Chi sono i concorrenti diretti sul territorio e cosa fanno meglio di lui

**Contenuti**
- Quante foto ha, in che formato, chi le seleziona
- Quante gallerie prevede di pubblicare all'anno
- Servono gallerie private per i clienti (link protetto, download, scadenza)
- Ha video, e in che quantità
- Ha già testi, logo, palette, o vanno prodotti
- Diritti d'uso: può pubblicare i volti degli invitati, servono liberatorie

**Operatività**
- Chi carica le gallerie dopo il lancio, lui o noi
- Quanto è disposto a imparare per farlo da solo
- Da che dispositivo lavora quando le carica

**Vincoli**
- Sito esistente, dominio, URL da mantenere o redirezionare
- Presenza su Instagram o altri canali da integrare
- Lingue richieste
- Budget e finestra temporale reale

## Gotchas

- "Voglio che sia bello" non è un requisito. Traducilo in un riferimento
  concreto: chiedi tre siti che gli piacciono e tre che detesta, e perché.
- La domanda su chi carica le gallerie determina stack, hosting e prezzo. Se la
  risposta è vaga, non chiuderla: registrala come aperta in ADR-0002.
- Un fotografo sottostima sempre il numero di foto. Chiedi il peso in GB
  dell'ultimo matrimonio consegnato.
- Non proporre soluzioni tecniche durante l'intervista.
