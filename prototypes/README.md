# Prototipi di direzione visiva

Tre direzioni per home e portfolio, da confrontare prima di fissare il design
system. Spike di esplorazione: questo branch non si fonde in `main`. Della
direzione scelta restano i token in `docs/04-design-system.md` e gli
screenshot in `design/ref/`.

## Aprire

Doppio clic su `index.html`, oppure:

```bash
python3 -m http.server -d prototypes 8000
```

HTML, CSS e JavaScript senza build e senza dipendenze. Non c'è un
`package.json`, perché `scripts/verify.sh` si attiverebbe appena ne esiste uno.

## Struttura

- `comune/foto.js`: le 36 foto, uguali per le tre direzioni, con
  `pictureFoto()`, che applica i vincoli della pipeline dello spec.
- `comune/hero.js`: avvio della clip.
- `comune/media/`: clip e poster.
- `tavole/`, `proiezione/`, `manifesto/`: una direzione ciascuna, con
  `index.html`, `portfolio.html`, `stile.css` e `pagina.js` per
  l'impaginazione.
- `anteprime/`: le immagini della pagina di ingresso.

## Media

- **Foto:** Unsplash, [licenza Unsplash](https://unsplash.com/license), servite
  dal loro CDN. Lo slug di provenienza è nel campo `fonte` di `foto.js`
  (`unsplash.com/photos/<fonte>`). Nessuna foto di Leo: le liberatorie non
  sono confermate.
- **Clip:** [Mixkit 5217](https://mixkit.co/free-stock-video/wedding-ceremony-5217/),
  [licenza Mixkit](https://mixkit.co/license/).
  - Tagliata a 5,9 s, senza traccia audio, H.264, 1,42 MB.
  - Il poster è il primo fotogramma, in AVIF e WebP da 400 a 1920 px.
