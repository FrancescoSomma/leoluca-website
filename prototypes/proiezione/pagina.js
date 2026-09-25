// Proiezione: in home un provino di diapositive, nel portfolio una foto per
// schermo alla massima dimensione, con il contatore della sequenza.
(function () {
  var provino = document.getElementById('provino');
  if (provino) {
    provino.innerHTML = window.FOTO.filter(function (foto) {
      return foto.in_home;
    }).map(function (foto) {
      return '<figure class="telaio">' +
        window.pictureFoto(foto, {
          sizes: foto.w >= foto.h ? '(min-width: 768px) 46vw, calc(100vw - 2rem)' : '(min-width: 768px) 26vw, 66vw',
          priorita: false,
        }) +
        '</figure>';
    }).join('');
    return;
  }

  // La diapositiva è limitata dall'altezza: una verticale a 1440 px è larga
  // circa 500 px, e chiederle 100vw la farebbe scaricare tre volte più grande.
  function sizesDiapositiva(foto) {
    var r = (foto.w / foto.h).toFixed(3);
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
  document.documentElement.classList.add('scatto');

  var corrente = document.getElementById('corrente');
  document.getElementById('totale').textContent = totale;
  var osservatore = new IntersectionObserver(function (voci) {
    voci.forEach(function (voce) {
      if (voce.isIntersecting) corrente.textContent = voce.target.dataset.numero;
    });
  }, { threshold: 0.6 });
  sequenza.querySelectorAll('.diapositiva').forEach(function (d) {
    osservatore.observe(d);
  });
})();
