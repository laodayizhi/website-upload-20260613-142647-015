(function () {
    var mobileButton = document.querySelector('[data-menu-toggle]');
    var mobileNav = document.querySelector('[data-mobile-nav]');

    if (mobileButton && mobileNav) {
        mobileButton.addEventListener('click', function () {
            mobileNav.classList.toggle('is-open');
        });
    }

    function setupHero() {
        var slider = document.querySelector('[data-hero-slider]');
        if (!slider) {
            return;
        }

        var slides = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-dot]'));
        var prev = slider.querySelector('[data-hero-prev]');
        var next = slider.querySelector('[data-hero-next]');
        var index = 0;
        var timer = null;

        function show(nextIndex) {
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle('is-active', i === index);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle('is-active', i === index);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5600);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        dots.forEach(function (dot, i) {
            dot.addEventListener('click', function () {
                show(i);
                start();
            });
        });

        if (prev) {
            prev.addEventListener('click', function () {
                show(index - 1);
                start();
            });
        }

        if (next) {
            next.addEventListener('click', function () {
                show(index + 1);
                start();
            });
        }

        slider.addEventListener('mouseenter', stop);
        slider.addEventListener('mouseleave', start);
        show(0);
        start();
    }

    function setupFilter() {
        var input = document.querySelector('[data-filter-input]');
        var area = document.querySelector('[data-filter-area]');

        if (!input || !area) {
            return;
        }

        var cards = Array.prototype.slice.call(area.querySelectorAll('[data-filter-card]'));

        function normalize(value) {
            return String(value || '').toLowerCase().replace(/\s+/g, '');
        }

        function applyFilter(value) {
            var keyword = normalize(value);
            cards.forEach(function (card) {
                var text = normalize((card.getAttribute('data-title') || '') + ' ' + (card.getAttribute('data-meta') || '') + ' ' + card.textContent);
                card.classList.toggle('is-filter-hidden', keyword && text.indexOf(keyword) === -1);
            });
        }

        if (input.hasAttribute('data-query-sync')) {
            var params = new URLSearchParams(window.location.search);
            var q = params.get('q') || '';
            input.value = q;
            applyFilter(q);
        }

        input.addEventListener('input', function () {
            applyFilter(input.value);
        });
    }

    function setupPlayer() {
        var video = document.getElementById('movie-player-video');
        var cover = document.querySelector('[data-play-cover]');

        if (!video) {
            return;
        }

        var source = video.getAttribute('data-hls');
        var loaded = false;
        var hlsInstance = null;

        function loadSource() {
            if (loaded || !source) {
                return;
            }

            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = source;
            } else if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls();
                hlsInstance.loadSource(source);
                hlsInstance.attachMedia(video);
            } else {
                video.src = source;
            }

            loaded = true;
        }

        function beginPlay() {
            loadSource();
            if (cover) {
                cover.classList.add('is-hidden');
            }
            var promise = video.play();
            if (promise && typeof promise.catch === 'function') {
                promise.catch(function () {});
            }
        }

        if (cover) {
            cover.addEventListener('click', beginPlay);
        }

        video.addEventListener('click', function () {
            if (video.paused) {
                beginPlay();
            }
        });

        video.addEventListener('play', function () {
            if (cover) {
                cover.classList.add('is-hidden');
            }
        });

        video.addEventListener('ended', function () {
            if (cover) {
                cover.classList.remove('is-hidden');
            }
        });

        window.addEventListener('beforeunload', function () {
            if (hlsInstance) {
                hlsInstance.destroy();
            }
        });
    }

    document.addEventListener('DOMContentLoaded', function () {
        setupHero();
        setupFilter();
        setupPlayer();
    });
})();
