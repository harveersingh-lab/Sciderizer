// Measures the fixed header so page content and #anchor jumps land in the right spot
(function () {
  function start() {
    var header = document.querySelector('.fixed-header-wrapper');
    if (!header) return;
    var update = function () {
      document.documentElement.style.setProperty('--header-h', header.offsetHeight + 'px');
    };
    update();
    window.addEventListener('resize', update);
    window.addEventListener('load', function () {
      update();
      if (location.hash) {
        var el = document.getElementById(decodeURIComponent(location.hash.slice(1)));
        if (el) el.scrollIntoView();
      }
    });
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(update);
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start);
  } else {
    start();
  }
})();