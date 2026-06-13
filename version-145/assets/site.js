(function () {
  function ready(callback) {
    if (document.readyState !== 'loading') {
      callback();
    } else {
      document.addEventListener('DOMContentLoaded', callback);
    }
  }

  function initMobileNav() {
    var toggle = document.querySelector('[data-mobile-toggle]');
    var panel = document.querySelector('[data-mobile-panel]');
    if (!toggle || !panel) {
      return;
    }
    toggle.addEventListener('click', function () {
      panel.classList.toggle('is-open');
    });
  }

  function initSearchForms() {
    document.querySelectorAll('[data-search-form]').forEach(function (form) {
      form.addEventListener('submit', function (event) {
        event.preventDefault();
        var input = form.querySelector('input[name="q"]');
        var query = input ? input.value.trim() : '';
        var target = form.getAttribute('action') || './search.html';
        if (query) {
          window.location.href = target + '?q=' + encodeURIComponent(query);
        } else {
          window.location.href = target;
        }
      });
    });
  }

  function initFiltering() {
    var input = document.querySelector('[data-filter-input]');
    var list = document.querySelector('[data-filter-list]');
    if (!input || !list) {
      return;
    }
    var params = new URLSearchParams(window.location.search);
    var query = params.get('q') || '';
    if (query) {
      input.value = query;
    }
    var run = function () {
      var value = input.value.trim().toLowerCase();
      list.querySelectorAll('[data-movie-card]').forEach(function (card) {
        var haystack = (card.getAttribute('data-search') || '').toLowerCase();
        card.classList.toggle('is-filtered-out', value && haystack.indexOf(value) === -1);
      });
    };
    input.addEventListener('input', run);
    run();
  }

  function initHero() {
    var root = document.querySelector('[data-hero-carousel]');
    if (!root) {
      return;
    }
    var slides = Array.prototype.slice.call(root.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(root.querySelectorAll('[data-hero-dot]'));
    var prev = root.querySelector('[data-hero-prev]');
    var next = root.querySelector('[data-hero-next]');
    if (!slides.length) {
      return;
    }
    var current = 0;
    var timer;
    var show = function (index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === current);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('is-active', i === current);
      });
    };
    var play = function () {
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5200);
    };
    var restart = function () {
      window.clearInterval(timer);
      play();
    };
    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        show(i);
        restart();
      });
    });
    if (prev) {
      prev.addEventListener('click', function () {
        show(current - 1);
        restart();
      });
    }
    if (next) {
      next.addEventListener('click', function () {
        show(current + 1);
        restart();
      });
    }
    play();
  }

  function initPlayers() {
    document.querySelectorAll('[data-player]').forEach(function (frame) {
      var video = frame.querySelector('video[data-stream]');
      var trigger = frame.querySelector('[data-play-trigger]');
      if (!video || !trigger) {
        return;
      }
      var hlsInstance;
      var attach = function () {
        if (video.dataset.ready === '1') {
          return;
        }
        var stream = video.getAttribute('data-stream');
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = stream;
        } else if (window.Hls && window.Hls.isSupported()) {
          hlsInstance = new window.Hls({ enableWorker: true });
          hlsInstance.loadSource(stream);
          hlsInstance.attachMedia(video);
        } else {
          video.src = stream;
        }
        video.dataset.ready = '1';
      };
      var start = function () {
        attach();
        trigger.classList.add('is-hidden');
        video.play().catch(function () {});
      };
      trigger.addEventListener('click', start);
      video.addEventListener('click', function () {
        if (video.paused) {
          start();
        }
      });
      window.addEventListener('pagehide', function () {
        if (hlsInstance) {
          hlsInstance.destroy();
        }
      });
    });
  }

  function initBackTop() {
    document.querySelectorAll('[data-back-top]').forEach(function (button) {
      button.addEventListener('click', function () {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    });
  }

  ready(function () {
    initMobileNav();
    initSearchForms();
    initFiltering();
    initHero();
    initPlayers();
    initBackTop();
  });
})();
