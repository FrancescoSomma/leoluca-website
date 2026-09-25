// Manifesto: in home un impaginato da rivista, grande e piccolo a contrasto;
// nel portfolio un mosaico a righe giustificate, tutte della stessa altezza.
(function () {
  var impaginato = document.getElementById('impaginato');
  if (impaginato) {
    var home = window.FOTO.filter(function (foto) {
      return foto.in_home;
    });
    var SIZES = {
      apertura: '100vw',
      grande: '(min-width: 768px) 62vw, calc(100vw - 2rem)',
      piccolo: '(min-width: 768px) 30vw, 62vw',
    };
    var pezzo = function (foto, ruolo) {
      return '<figure class="pezzo pezzo--' + ruolo + ' ' + window.orientamento(foto) + '">' +
        window.pictureFoto(foto, { sizes: SIZES[ruolo], priorita: false }) + '</figure>';
    };

    // Ogni terza riga, se tocca a un'orizzontale, è un'apertura a tutta
    // pagina; le altre sono coppie, specchiate a righe alterne.
    var righe = [];
    var coppie = 0;
    for (var i = 0; i < home.length; ) {
      var foto = home[i];
      if (righe.length % 3 === 2 && window.orientamento(foto) === 'orizzontale') {
        righe.push('<div class="riga">' + pezzo(foto, 'apertura') + '</div>');
        i += 1;
      } else if (home[i + 1]) {
        var specchio = coppie % 2 === 1 ? ' specchio' : '';
        righe.push('<div class="riga' + specchio + '">' + pezzo(foto, 'grande') + pezzo(home[i + 1], 'piccolo') + '</div>');
        coppie += 1;
        i += 2;
      } else {
        righe.push('<div class="riga">' + pezzo(foto, 'grande') + '</div>');
        i += 1;
      }
    }
    impaginato.innerHTML = righe.join('');
    return;
  }

  var PRIORITARIE = 3;
  var mosaico = document.getElementById('mosaico');
  mosaico.innerHTML = window.FOTO.map(function (foto, i) {
    var verticale = window.orientamento(foto) === 'verticale';
    return '<figure class="tessera" style="--r: ' + (foto.w / foto.h).toFixed(4) + '">' +
      window.pictureFoto(foto, {
        sizes: verticale ? '(min-width: 768px) 22vw, 48vw' : '(min-width: 768px) 44vw, 100vw',
        priorita: i < PRIORITARIE,
      }) + '</figure>';
  }).join('');
})();
