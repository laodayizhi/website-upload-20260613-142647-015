(function () {
    var menuButton = document.querySelector('[data-menu-toggle]');
    var mobilePanel = document.querySelector('[data-mobile-panel]');

    if (menuButton && mobilePanel) {
        menuButton.addEventListener('click', function () {
            mobilePanel.classList.toggle('is-open');
        });
    }

    var carousel = document.querySelector('[data-hero-carousel]');

    if (carousel) {
        var slides = Array.prototype.slice.call(carousel.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(carousel.querySelectorAll('[data-hero-target]'));
        var index = 0;
        var timer = null;

        function showSlide(nextIndex) {
            if (!slides.length) {
                return;
            }

            index = (nextIndex + slides.length) % slides.length;

            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === index);
            });

            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === index);
            });
        }

        function startTimer() {
            window.clearInterval(timer);
            timer = window.setInterval(function () {
                showSlide(index + 1);
            }, 5200);
        }

        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                showSlide(Number(dot.getAttribute('data-hero-target')) || 0);
                startTimer();
            });
        });

        showSlide(0);
        startTimer();
    }

    var pageFilter = document.querySelector('[data-page-filter]');
    var filterList = document.querySelector('[data-filter-list]');

    if (pageFilter && filterList) {
        var filterCards = Array.prototype.slice.call(filterList.querySelectorAll('.movie-card'));

        pageFilter.addEventListener('input', function () {
            var query = pageFilter.value.trim().toLowerCase();

            filterCards.forEach(function (card) {
                var haystack = [
                    card.getAttribute('data-title') || '',
                    card.getAttribute('data-tags') || '',
                    card.getAttribute('data-region') || '',
                    card.getAttribute('data-year') || ''
                ].join(' ').toLowerCase();

                card.hidden = query && haystack.indexOf(query) === -1;
            });
        });
    }

    function setupPlayers() {
        var players = Array.prototype.slice.call(document.querySelectorAll('.player-card'));

        players.forEach(function (player) {
            var video = player.querySelector('video');
            var button = player.querySelector('.play-button');
            var stream = player.getAttribute('data-stream');
            var hlsInstance = null;

            if (!video || !button || !stream) {
                return;
            }

            function attachStream() {
                if (video.getAttribute('data-ready') === '1') {
                    return;
                }

                if (window.Hls && window.Hls.isSupported()) {
                    hlsInstance = new window.Hls({
                        enableWorker: true,
                        lowLatencyMode: true
                    });
                    hlsInstance.loadSource(stream);
                    hlsInstance.attachMedia(video);
                } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
                    video.src = stream;
                } else {
                    video.src = stream;
                }

                video.setAttribute('data-ready', '1');
            }

            function playVideo() {
                attachStream();
                player.classList.add('is-playing');
                var playPromise = video.play();

                if (playPromise && typeof playPromise.catch === 'function') {
                    playPromise.catch(function () {
                        player.classList.remove('is-playing');
                    });
                }
            }

            button.addEventListener('click', playVideo);
            video.addEventListener('play', function () {
                player.classList.add('is-playing');
            });
            video.addEventListener('pause', function () {
                if (video.currentTime === 0 || video.ended) {
                    player.classList.remove('is-playing');
                }
            });
            video.addEventListener('error', function () {
                if (hlsInstance) {
                    hlsInstance.destroy();
                    hlsInstance = null;
                }
            });
        });
    }

    setupPlayers();

    function renderSearch() {
        var results = document.querySelector('[data-search-results]');
        var input = document.querySelector('[data-search-input]');
        var form = document.querySelector('[data-search-form]');
        var regionFilter = document.querySelector('[data-region-filter]');
        var typeFilter = document.querySelector('[data-type-filter]');
        var yearFilter = document.querySelector('[data-year-filter]');

        if (!results || !input || !window.MOVIE_INDEX) {
            return;
        }

        var params = new URLSearchParams(window.location.search);
        input.value = params.get('q') || '';

        function fillSelect(select, values) {
            if (!select) {
                return;
            }

            values.forEach(function (value) {
                var option = document.createElement('option');
                option.value = value;
                option.textContent = value;
                select.appendChild(option);
            });
        }

        function uniqueValues(key) {
            var seen = {};
            window.MOVIE_INDEX.forEach(function (movie) {
                if (movie[key]) {
                    seen[movie[key]] = true;
                }
            });
            return Object.keys(seen).sort(function (a, b) {
                return String(b).localeCompare(String(a), 'zh-Hans-CN');
            });
        }

        fillSelect(regionFilter, uniqueValues('region').slice(0, 80));
        fillSelect(typeFilter, uniqueValues('type').slice(0, 40));
        fillSelect(yearFilter, uniqueValues('year').slice(0, 40));

        function movieCard(movie) {
            var tagHtml = (movie.tags || []).slice(0, 2).map(function (tag) {
                return '<span>' + escapeHtml(tag) + '</span>';
            }).join('');

            return [
                '<article class="movie-card" data-title="', escapeHtml(movie.title), '">',
                '<a class="movie-card-link" href="', escapeHtml(movie.url), '" aria-label="', escapeHtml(movie.title), '">',
                '<span class="poster-shell">',
                '<img src="', escapeHtml(movie.cover), '" alt="', escapeHtml(movie.title), '" loading="lazy" onerror="this.closest(\'.poster-shell\').classList.add(\'image-off\'); this.remove();">',
                '<span class="poster-shade"></span>',
                '<span class="poster-play">播放</span>',
                '</span>',
                '<span class="movie-card-body">',
                '<strong class="movie-card-title">', escapeHtml(movie.title), '</strong>',
                '<span class="movie-card-meta">', escapeHtml(movie.year), ' · ', escapeHtml(movie.region), ' · ', escapeHtml(movie.type), '</span>',
                '<span class="movie-card-tags">', tagHtml, '</span>',
                '<span class="movie-card-desc">', escapeHtml(movie.oneLine || ''), '</span>',
                '</span>',
                '</a>',
                '</article>'
            ].join('');
        }

        function escapeHtml(value) {
            return String(value || '')
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/"/g, '&quot;')
                .replace(/'/g, '&#39;');
        }

        function updateResults() {
            var query = input.value.trim().toLowerCase();
            var region = regionFilter ? regionFilter.value : '';
            var type = typeFilter ? typeFilter.value : '';
            var year = yearFilter ? yearFilter.value : '';

            var filtered = window.MOVIE_INDEX.filter(function (movie) {
                var haystack = [
                    movie.title,
                    movie.region,
                    movie.type,
                    movie.year,
                    movie.genre,
                    (movie.tags || []).join(' '),
                    movie.oneLine
                ].join(' ').toLowerCase();

                if (query && haystack.indexOf(query) === -1) {
                    return false;
                }

                if (region && movie.region !== region) {
                    return false;
                }

                if (type && movie.type !== type) {
                    return false;
                }

                if (year && movie.year !== year) {
                    return false;
                }

                return true;
            }).slice(0, 96);

            results.innerHTML = filtered.map(movieCard).join('');
        }

        if (form) {
            form.addEventListener('submit', function (event) {
                event.preventDefault();
                var url = new URL(window.location.href);
                url.searchParams.set('q', input.value.trim());
                history.replaceState(null, '', url.toString());
                updateResults();
            });
        }

        [input, regionFilter, typeFilter, yearFilter].forEach(function (control) {
            if (control) {
                control.addEventListener('input', updateResults);
                control.addEventListener('change', updateResults);
            }
        });

        updateResults();
    }

    renderSearch();
})();
