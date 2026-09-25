// Impaginazione a tavole: la disposizione dipende dall'orientamento della foto
// e dalla sua posizione nella sequenza, come in un fotolibro. Il numero è la
// posizione nel flusso del portfolio, anche in home.
(function () {
  var contenitore = document.getElementById('tavole');
  var soloHome = contenitore.dataset.insieme === 'home';
  var PRIORITARIE = soloHome ? 0 : 3;

  var voci = window.FOTO.map(function (foto, i) {
    return { foto: foto, numero: i + 1 };
  }).filter(function (voce) {
    return !soloHome || voce.foto.in_home;
  });

  var SIZES = {
    piena: '100vw',
    grande: '(min-width: 768px) 80vw, calc(100vw - 2rem)',
    media: '(min-width: 768px) 64vw, 86vw',
    verticale: '(min-width: 768px) 38vw, 72vw',
    dittico: '(min-width: 768px) 38vw, 46vw',
  };

  var html = [];
  var orizzontali = 0;
  var verticali = 0;
  var i = 0;

  function immagine(voce, variante) {
    return window.pictureFoto(voce.foto, {
      sizes: SIZES[variante],
      priorita: voce.numero <= PRIORITARIE,
    });
  }

  function tavola(classi, contenuto, numero) {
    return (
      '<figure class="tavola ' + classi + '">' + contenuto +
      '<span class="numero" aria-hidden="true">' + numero + '</span></figure>'
    );
  }

  while (i < voci.length) {
    var voce = voci[i];
    var seguente = voci[i + 1];

    if (window.orientamento(voce.foto) === 'verticale') {
      if (seguente && window.orientamento(seguente.foto) === 'verticale') {
        html.push(tavola('tavola--dittico', immagine(voce, 'dittico') + immagine(seguente, 'dittico'),
          voce.numero + '–' + seguente.numero));
        i += 2;
        continue;
      }
      var lato = verticali % 2 === 0 ? '' : ' a-destra';
      html.push(tavola('tavola--verticale' + lato, immagine(voce, 'verticale'), voce.numero));
      verticali += 1;
      i += 1;
      continue;
    }

    var variante = orizzontali % 4 === 2 ? 'piena' : orizzontali % 2 === 0 ? 'grande' : 'media';
    var destra = variante === 'media' && orizzontali % 4 === 3 ? ' a-destra' : '';
    html.push(tavola('tavola--' + variante + destra, immagine(voce, variante), voce.numero));
    orizzontali += 1;
    i += 1;
  }

  contenitore.innerHTML = html.join('');
})();
