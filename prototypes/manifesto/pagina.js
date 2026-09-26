// Manifesto: in home un impaginato da rivista, grande e piccolo a contrasto;
// nel portfolio un mosaico a righe giustificate, tutte della stessa altezza.
(function () {
  function impagina(impaginato) {
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
  }

  function componiMosaico(mosaico) {
    var PRIORITARIE = 3;
    mosaico.innerHTML = window.FOTO.map(function (foto, i) {
      var verticale = window.orientamento(foto) === 'verticale';
      return '<figure class="tessera" style="--r: ' + (foto.w / foto.h).toFixed(4) + '">' +
        window.pictureFoto(foto, {
          sizes: verticale ? '(min-width: 768px) 22vw, 48vw' : '(min-width: 768px) 44vw, 100vw',
          priorita: i < PRIORITARIE,
        }) + '</figure>';
    }).join('');
  }

  // I corsivi grandi salgono riga per riga, ogni parola dentro la propria
  // maschera. Le righe si contano solo quando il blocco entra nello schermo,
  // perché dipendono dalla larghezza. Il testo intero resta ai lettori di
  // schermo in una copia non spezzata.
  function rivela() {
    var blocchi = document.querySelectorAll('[data-rivela]');
    if (!blocchi.length || !('IntersectionObserver' in window)) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    blocchi.forEach(function (blocco) {
      var testo = blocco.textContent.trim();
      var parole = document.createElement('span');
      parole.setAttribute('aria-hidden', 'true');
      testo.split(/\s+/).forEach(function (voce, i) {
        var maschera = document.createElement('span');
        var interno = document.createElement('span');
        maschera.className = 'parola';
        interno.textContent = voce;
        maschera.appendChild(interno);
        if (i > 0) parole.appendChild(document.createTextNode(' '));
        parole.appendChild(maschera);
      });
      blocco.textContent = '';
      if (blocco.getAttribute('aria-hidden') !== 'true') {
        var copia = document.createElement('span');
        copia.className = 'per-lettori';
        copia.textContent = testo;
        blocco.appendChild(copia);
      }
      blocco.appendChild(parole);
    });
    document.documentElement.classList.add('osserva');

    var osservatore = new IntersectionObserver(function (voci) {
      voci.forEach(function (voce) {
        if (!voce.isIntersecting) return;
        var riga = -1;
        var alto = null;
        voce.target.querySelectorAll('.parola').forEach(function (parola) {
          if (alto === null || Math.abs(parola.offsetTop - alto) > 2) {
            riga += 1;
            alto = parola.offsetTop;
          }
          parola.style.setProperty('--riga', riga);
        });
        voce.target.classList.add('visto');
        osservatore.unobserve(voce.target);
      });
    }, { rootMargin: '0px 0px -12% 0px' });
    blocchi.forEach(function (blocco) {
      osservatore.observe(blocco);
    });
  }

  var impaginato = document.getElementById('impaginato');
  if (impaginato) impagina(impaginato);

  var ritratto = document.getElementById('ritratto');
  if (ritratto) {
    ritratto.innerHTML = window.pictureFoto(window.RITRATTO, {
      sizes: '(min-width: 768px) 38vw, calc(100vw - 2rem)',
      priorita: false,
    });
  }

  var mosaico = document.getElementById('mosaico');
  if (mosaico) componiMosaico(mosaico);

  rivela();
})();
