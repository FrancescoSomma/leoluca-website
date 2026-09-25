// Spec § Hero della home: la clip parte dopo l'LCP, e non viene nemmeno
// scaricata su mobile o con prefers-reduced-motion. Il poster resta l'hero.
(function () {
  var video = document.querySelector('video[data-clip]');
  if (!video) return;
  var desktop = window.matchMedia('(min-width: 768px)').matches;
  var riduci = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!desktop || riduci) return;
  window.addEventListener('load', function () {
    video.src = video.dataset.clip;
    video.addEventListener('playing', function () { video.classList.add('pronta'); }, { once: true });
    video.play().catch(function () {});
  });
})();
