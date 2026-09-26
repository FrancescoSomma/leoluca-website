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

  // Il ritratto è una tavola senza numero: stessa resa, fuori dal flusso.
  var ritratto = document.getElementById('ritratto');
  if (ritratto) {
    ritratto.innerHTML = window.pictureFoto(window.RITRATTO, {
      sizes: '(min-width: 768px) 38vw, 72vw',
      priorita: false,
    });
  }
})();

// La tavola si posa come una pagina voltata quando entra nel viewport. Solo le
// tavole sotto la piega al caricamento: quelle già visibili, nel portfolio le
// prime tre e con loro l'LCP, non vengono mai nascoste né ritardate.
(function () {
  var riduci = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (riduci || !('IntersectionObserver' in window)) return;

  // Una pagina voltata su una foto non ancora arrivata scopre solo la carta:
  // si aspetta l'immagine, ma mai più di così.
  var ATTESA_MASSIMA = 1200;

  function quandoPronta(tavola, fatto) {
    var mancanti = Array.prototype.filter.call(tavola.querySelectorAll('img'), function (img) {
      return !img.complete;
    });
    if (mancanti.length === 0) return fatto();
    var chiuso = false;
    function chiudi() {
      if (chiuso) return;
      chiuso = true;
      fatto();
    }
    var restanti = mancanti.length;
    mancanti.forEach(function (img) {
      function uno() {
        restanti -= 1;
        if (restanti === 0) chiudi();
      }
      img.addEventListener('load', uno, { once: true });
      img.addEventListener('error', uno, { once: true });
    });
    setTimeout(chiudi, ATTESA_MASSIMA);
  }

  var osservatore = new IntersectionObserver(
    function (voci) {
      voci.forEach(function (voce) {
        if (!voce.isIntersecting) return;
        osservatore.unobserve(voce.target);
        quandoPronta(voce.target, function () {
          voce.target.classList.add('posata');
        });
      });
    },
    { rootMargin: '0px 0px -12% 0px' }
  );

  var piega = window.innerHeight;
  document.querySelectorAll('.tavola').forEach(function (tavola) {
    if (tavola.getBoundingClientRect().top < piega) return;
    tavola.classList.add('da-posare');
    osservatore.observe(tavola);
  });
  document.documentElement.classList.add('anima');
})();
