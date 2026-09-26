// Proiezione: in home una breve proiezione delle foto in_home, nel portfolio
// una foto per schermo alla massima dimensione, con il contatore della sequenza.
(function () {
  var radice = document.documentElement;

  function rapporto(foto) {
    return foto.w / foto.h;
  }

  // Altezze e margini rispecchiano --altezza-*, --margine e --bordo di
  // stile.css: sizes non legge le variabili CSS. `quota` è la parte di riga
  // occupata in una doppia, al netto dello spazio tra i due proiettori.
  function sizesTelaio(r, quota, altezzaTelefono, altezzaSchermo) {
    function schermo(margini) {
      var larghezza = quota === 1
        ? 'calc(100vw - ' + margini + ')'
        : 'calc((100vw - ' + margini + ' - 2rem) * ' + quota.toFixed(3) + ')';
      return 'min(' + larghezza + ', calc(' + altezzaSchermo + 'vh * ' + r.toFixed(3) + '))';
    }
    return '(min-width: 1200px) ' + schermo('22rem') + ', (min-width: 768px) ' + schermo('4rem') +
      ', min(calc(100vw - 2rem), calc(' + altezzaTelefono + 'vh * ' + r.toFixed(3) + '))';
  }

  function telaio(foto, quota) {
    var r = rapporto(foto);
    return '<figure class="telaio" style="--r: ' + r.toFixed(3) + '">' +
      window.pictureFoto(foto, { sizes: sizesTelaio(r, quota, 80, 76), priorita: false }) +
      '</figure>';
  }

  // Ogni diapositiva resta al buio finché non arriva sul telo: allora si accende
  // una volta sola. Senza html.anima non c'è niente da accendere. Si confronta
  // il rapporto e non isIntersecting, che è vero già al primo pixel visibile.
  var SOGLIA_ARRIVO = 0.2;
  function accendiAllArrivo(telai) {
    if (!radice.classList.contains('anima')) return;
    var osservatore = new IntersectionObserver(function (voci) {
      voci.forEach(function (voce) {
        if (voce.intersectionRatio < SOGLIA_ARRIVO) return;
        voce.target.classList.add('accesa');
        osservatore.unobserve(voce.target);
      });
    }, { threshold: SOGLIA_ARRIVO });
    telai.forEach(function (t) {
      osservatore.observe(t);
    });
  }

  var provino = document.getElementById('provino');
  if (provino) {
    var inHome = window.FOTO.filter(function (foto) {
      return foto.in_home;
    });
    var righe = [];
    for (var i = 0; i < inHome.length; i++) {
      var dopo = inHome[i + 1];
      if (dopo && rapporto(inHome[i]) < 1 && rapporto(dopo) < 1) {
        righe.push([inHome[i], dopo]);
        i++;
      } else {
        righe.push([inHome[i]]);
      }
    }
    provino.innerHTML = righe.map(function (riga) {
      if (riga.length === 1) return telaio(riga[0], 1);
      var somma = rapporto(riga[0]) + rapporto(riga[1]);
      return '<div class="doppia" style="--somma: ' + somma.toFixed(3) + '">' +
        telaio(riga[0], rapporto(riga[0]) / somma) + telaio(riga[1], rapporto(riga[1]) / somma) +
        '</div>';
    }).join('');

    var ritratto = document.getElementById('ritratto');
    var r = rapporto(window.RITRATTO);
    ritratto.style.setProperty('--r', r.toFixed(3));
    ritratto.innerHTML = window.pictureFoto(window.RITRATTO, { sizes: sizesTelaio(r, 1, 58, 56), priorita: false });

    accendiAllArrivo(document.querySelectorAll('.telaio'));
    return;
  }

  // La diapositiva è limitata dall'altezza: una verticale a 1440 px è larga
  // circa 500 px, e chiederle 100vw la farebbe scaricare tre volte più grande.
  function sizesDiapositiva(foto) {
    var r = rapporto(foto).toFixed(3);
    return '(min-width: 768px) min(calc(100vw - 4rem), calc((100vh - 8.5rem) * ' + r + ')), ' +
      'min(calc(100vw - 2rem), calc((100vh - 10rem) * ' + r + '))';
  }

  var PRIORITARIE = 3;
  var sequenza = document.getElementById('sequenza');
  var totale = window.FOTO.length;
  sequenza.innerHTML = window.FOTO.map(function (foto, i) {
    return '<figure class="diapositiva" data-numero="' + (i + 1) + '">' +
      window.pictureFoto(foto, { sizes: sizesDiapositiva(foto), priorita: i < PRIORITARIE }) +
      '</figure>';
  }).join('');

  // Lo snap si accende solo ora: se fosse attivo prima del render, l'unico
  // punto di aggancio sarebbe il blocco finale e il browser resterebbe lì.
  radice.classList.add('scatto');

  // Ogni diapositiva si accende la prima volta che diventa corrente, e resta
  // accesa: riaccenderle a ogni passaggio, scorrendo veloce, lampeggerebbe.
  // La prima è accesa già al primo paint e senza animazione: è l'LCP.
  var anima = window.matchMedia('(prefers-reduced-motion: no-preference)').matches;
  var attuale = sequenza.firstElementChild;
  attuale.classList.add('accesa');
  if (anima) radice.classList.add('anima');

  // Metà schermo: due diapositive alte un viewport se lo dividono, quindi in
  // qualunque punto ce n'è sempre una corrente, anche fermandosi a metà.
  var META = 0.5;
  var corrente = document.getElementById('corrente');
  document.getElementById('totale').textContent = totale;
  var osservatore = new IntersectionObserver(function (voci) {
    voci.forEach(function (voce) {
      if (voce.intersectionRatio < META || voce.target === attuale) return;
      attuale = voce.target;
      if (!attuale.classList.contains('accesa')) attuale.classList.add('accesa', 'accende');
      corrente.textContent = attuale.dataset.numero;
      if (!anima) return;
      // Riavvia lo scatto anche se la cifra cambiava già un attimo fa.
      corrente.classList.remove('scatta');
      void corrente.offsetWidth;
      corrente.classList.add('scatta');
    });
  }, { threshold: META });
  sequenza.querySelectorAll('.diapositiva').forEach(function (d) {
    osservatore.observe(d);
  });
})();
