// Dati condivisi dalle tre direzioni: stesse foto, stesso ordine, stessi testi
// alternativi, così cambia solo l'impaginazione. Sono segnaposto Unsplash
// servite dal loro CDN: nessuna foto di Leo finché le liberatorie non ci sono.
// `fonte` è lo slug su unsplash.com/photos/, tenuto per la provenienza.
window.FOTO = [
  { id: '1532454781337-fc3edff34f91', w: 4480, h: 6720, in_home: false,
    alt: "Sposa di spalle davanti alla finestra, lo strascico del velo steso sul pavimento della stanza",
    fonte: 'zeXp39YYR-s' },
  { id: '1632920665156-c84f643fcb37', w: 6720, h: 4480, in_home: true,
    alt: "Un'amica allaccia i bottoni sulla schiena della sposa, i capelli ricci raccolti sotto il velo",
    fonte: '2CpMzlIBuN4' },
  { id: '1722805740076-7c51a8669afc', w: 3648, h: 4560, in_home: true,
    alt: "Sposa di profilo a occhi chiusi, il velo sulle spalle, in controluce accanto alla finestra",
    fonte: 'Q4otPDG3NTQ' },
  { id: '1679599441191-aa411b7ac27d', w: 5762, h: 3926, in_home: false,
    alt: "Sposa in vestaglia bianca sorride tra le damigelle voltate di spalle, davanti a una vetrata",
    fonte: 'dRS2zN52-ik' },
  { id: '1708743978241-a447efb1ee02', w: 2857, h: 4000, in_home: false,
    alt: "Una donna inginocchiata allaccia la scarpa alla sposa seduta in un salotto luminoso",
    fonte: '97gqsFUfF7w' },
  { id: '1624137924753-2bf0d5f9c469', w: 4480, h: 6720, in_home: false,
    alt: "Mani che appuntano un rametto di eucalipto sulla giacca grigia dello sposo",
    fonte: 'pHV5xMJNxuU' },
  { id: '1682226335318-f1911fdef7c1', w: 4592, h: 3648, in_home: false,
    alt: "Mani che chiudono l'abito di pizzo ricamato sulla schiena della sposa",
    fonte: '-BPwR5_GSe0' },
  { id: '1643697706170-d2a1892155d1', w: 4245, h: 4699, in_home: true,
    alt: "Sposa di spalle accompagnata all'altare lungo il tappeto rosso della navata",
    fonte: 'YAiNTtB8EjQ' },
  { id: '1524650448000-02d0a2aeb6cb', w: 5472, h: 3648, in_home: false,
    alt: "Navata vuota tra le panche, in fondo gli sposi in piedi davanti all'altare",
    fonte: 'YyvpmN6PB3I' },
  { id: '1708134128589-0dfd38b2203a', w: 7000, h: 3428, in_home: false,
    alt: "Invitati seduti sotto una tettoia di legno durante una cerimonia all'aperto",
    fonte: 'NdIRuO-ak_Q' },
  { id: '1523369579000-4ec0fe04db44', w: 5472, h: 3648, in_home: false,
    alt: "Lo sposo infila l'anello alla sposa, che indossa un abito di pizzo a maniche lunghe",
    fonte: 'cpa3-3UPfC8' },
  { id: '1643224467857-8871ba13bb25', w: 4000, h: 6000, in_home: false,
    alt: "Gli sposi si stringono le mani durante la cerimonia, davanti a un vaso di fiori bianchi",
    fonte: 'Z0fgBwYbG2I' },
  { id: '1525773975200-e725c61ca833', w: 5472, h: 3648, in_home: false,
    alt: "Mani intrecciate di un invitato seduto in abito scuro durante la cerimonia",
    fonte: 'aV67wo36_oI' },
  { id: '1573676048035-9c2a72b6a12a', w: 5039, h: 3359, in_home: true,
    alt: "Gli sposi escono sotto una pioggia di riso lanciata dagli amici ai due lati",
    fonte: 'eg-72fI9wK4' },
  { id: '1736310978137-dc7103e14c87', w: 4160, h: 6240, in_home: false,
    alt: "Gli sposi camminano sorridenti tra le sedie dopo la cerimonia, lei con il bouquet",
    fonte: 'dmxZYmvuqTU' },
  { id: '1583939411023-14783179e581', w: 5515, h: 3677, in_home: false,
    alt: "Sposi di spalle attraversano il giardino tra le damigelle in blu che lanciano petali",
    fonte: 'riHGdvluDk8' },
  { id: '1639330907580-1be70acbc1e1', w: 6000, h: 4000, in_home: true,
    alt: "Sposi di spalle sulla soglia di un portone di legno aperto su un cortile pieno di invitati",
    fonte: '9kmpdURAeqs' },
  { id: '1633352988130-87c1545a4ab4', w: 4000, h: 5988, in_home: false,
    alt: "Sposi di spalle camminano tra la folla in una via del centro storico, di sera",
    fonte: '6P3CbA3aNCA' },
  { id: '1739823701475-1f74ccb53745', w: 6927, h: 4618, in_home: true,
    alt: "Sposi abbracciati su una gondola davanti a Palazzo Ducale e al campanile di San Marco",
    fonte: 'JyRpY7VZD_Q' },
  { id: '1535118194709-8f09f0050330', w: 2730, h: 4096, in_home: false,
    alt: "Sposa sale una scalinata di pietra coperta d'edera, il velo lungo sui gradini",
    fonte: 'Mhb0KT7iVjU' },
  { id: '1460978812857-470ed1c77af0', w: 6256, h: 3648, in_home: true,
    alt: "Sposi si baciano sotto il velo sollevato dal vento, in riva al mare",
    fonte: 'FTW8ADj5igs' },
  { id: '1549416878-b9ca95e26903', w: 2000, h: 3000, in_home: true,
    alt: "Sposa sulla scalinata di una villa sul lago, lo strascico di tulle aperto sui gradini",
    fonte: 'BruuboWUC_U' },
  { id: '1718703358688-046752ef11f7', w: 5464, h: 8192, in_home: false,
    alt: "Sposi piccolissimi sulla banchina di una caletta, tra pareti di roccia a picco sul mare",
    fonte: 'N8dUvfSRjnA' },
  { id: '1617725145063-56958eadf557', w: 8094, h: 5952, in_home: false,
    alt: "Sposi camminano mano nella mano su una spiaggia di sabbia nera, il mare accanto",
    fonte: 'ArzsLIN--M8' },
  { id: '1519741196428-6a2175fa2557', w: 4480, h: 6720, in_home: false,
    alt: "Sposi fronte contro fronte, avvolti nel velo che li nasconde a metà",
    fonte: 'BOhDR9n4u2s' },
  { id: '1537274385128-70bd700a529c', w: 3648, h: 5472, in_home: false,
    alt: "Sposi di spalle sotto una loggia con le colonne, affacciati sul giardino",
    fonte: 'MYGWB1KpwBQ' },
  { id: '1612599542650-3b98fd99f96a', w: 3500, h: 2333, in_home: true,
    alt: "Cortile di una villa con lucine e tavoli apparecchiati, gli sposi entrano tra gli invitati",
    fonte: 'gNg1CWnz6dM' },
  { id: '1527529482837-4698179dc6ce', w: 6000, h: 4000, in_home: true,
    alt: "Brindisi a tavola sotto le luci appese, una mano alza il calice verso gli altri",
    fonte: 'ULHxWq8reao' },
  { id: '1523521803700-b3bcaeab0150', w: 5472, h: 3648, in_home: false,
    alt: "Invitati brindano ai tavoli, un uomo tende il bicchiere verso il centro della tavola",
    fonte: 'K8V2NDNJDYo' },
  { id: '1515563562861-4d2514edb3e3', w: 5400, h: 3604, in_home: false,
    alt: "Bambina con un vestito bianco guarda il mazzolino di fiori di campo che tiene in mano",
    fonte: 'vJb5uO6GrFs' },
  { id: '1693736428800-3d9de3cfa094', w: 4160, h: 6240, in_home: false,
    alt: "Corteo di invitati in festa su un lungomare, una palma alta sullo sfondo",
    fonte: 'AX2h2OQyUXk' },
  { id: '1639330693395-0944b5bef0c7', w: 6000, h: 4000, in_home: true,
    alt: "Primo ballo degli sposi sulla pista vuota, illuminati da fasci di luce di scena",
    fonte: 'yrwZZjer070' },
  { id: '1648154164366-d067faecdc51', w: 4160, h: 6240, in_home: false,
    alt: "Sposa di spalle con le braccia alzate balla tra gli invitati sotto le lucine",
    fonte: 'q5FNF6EEE30' },
  { id: '1714972383523-7c636d2f0e9b', w: 5472, h: 3648, in_home: false,
    alt: "Amici scatenati in pista abbracciano la sposa, un ragazzo urla con il braccio alzato",
    fonte: '9INtcavGkko' },
  { id: '1563775957372-b1d36ac1e9ae', w: 6720, h: 4480, in_home: false,
    alt: "Invitati che ballano, mossi e sfocati dalle luci viola della pista",
    fonte: 'uRASl4mm9B4' },
  { id: '1588849538263-fbc2b7b8965f', w: 6000, h: 4000, in_home: true,
    alt: "Sposi si baciano tra due file di amici che alzano le stelline accese nella notte",
    fonte: 'R0B0AnOw0Kg' },
];

(function () {
  // Vincoli di spec § Pipeline immagini, riprodotti con i parametri del CDN.
  // Sono costanti, non opzioni: renderli configurabili permetterebbe di violarli.
  var LARGHEZZE = [400, 800, 1200, 1600, 2400];
  var LATO_LUNGO_MAX = 2400;

  function url(id, larghezza, formato) {
    return 'https://images.unsplash.com/photo-' + id + '?w=' + larghezza + '&fm=' + formato + '&q=72';
  }

  // Una verticale larga 2400 px supererebbe i 2400 sul lato lungo: la larghezza
  // massima si ricava dal lato lungo, e mai oltre l'originale.
  function larghezzePer(foto) {
    var max = foto.w >= foto.h ? LATO_LUNGO_MAX : Math.floor((LATO_LUNGO_MAX * foto.w) / foto.h);
    max = Math.min(max, foto.w);
    return LARGHEZZE.filter(function (l) { return l < max; }).concat(max);
  }

  function srcset(foto, larghezze, formato) {
    return larghezze.map(function (l) { return url(foto.id, l, formato) + ' ' + l + 'w'; }).join(', ');
  }

  // Ripiego WebP imposto: nessun JPEG servito, come richiede lo spec.
  window.pictureFoto = function (foto, opzioni) {
    var larghezze = larghezzePer(foto);
    var max = larghezze[larghezze.length - 1];
    var altezza = Math.round((max * foto.h) / foto.w);
    var medio = larghezze[Math.min(2, larghezze.length - 1)];
    return (
      '<picture>' +
      '<source type="image/avif" srcset="' + srcset(foto, larghezze, 'avif') + '" sizes="' + opzioni.sizes + '">' +
      '<img src="' + url(foto.id, medio, 'webp') + '" srcset="' + srcset(foto, larghezze, 'webp') + '"' +
      ' sizes="' + opzioni.sizes + '" width="' + max + '" height="' + altezza + '"' +
      ' alt="' + foto.alt + '" loading="' + (opzioni.priorita ? 'eager' : 'lazy') + '" decoding="async"' +
      (opzioni.classe ? ' class="' + opzioni.classe + '"' : '') + '>' +
      '</picture>'
    );
  };

  window.orientamento = function (foto) {
    return foto.w >= foto.h ? 'orizzontale' : 'verticale';
  };
})();
