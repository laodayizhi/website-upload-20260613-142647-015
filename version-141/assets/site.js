document.addEventListener("DOMContentLoaded", function () {
    var menuButton = document.querySelector("[data-menu-button]");
    var mobileNav = document.querySelector("[data-mobile-nav]");

    if (menuButton && mobileNav) {
        menuButton.addEventListener("click", function () {
            mobileNav.classList.toggle("is-open");
        });
    }

    var hero = document.querySelector("[data-hero]");

    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
        var prev = hero.querySelector("[data-hero-prev]");
        var next = hero.querySelector("[data-hero-next]");
        var index = 0;
        var timer = null;

        function showSlide(nextIndex) {
            if (!slides.length) {
                return;
            }

            index = (nextIndex + slides.length) % slides.length;

            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("active", slideIndex === index);
            });

            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("active", dotIndex === index);
            });
        }

        function restartTimer() {
            if (timer) {
                window.clearInterval(timer);
            }

            timer = window.setInterval(function () {
                showSlide(index + 1);
            }, 5200);
        }

        dots.forEach(function (dot) {
            dot.addEventListener("click", function () {
                showSlide(Number(dot.getAttribute("data-hero-dot")) || 0);
                restartTimer();
            });
        });

        if (prev) {
            prev.addEventListener("click", function () {
                showSlide(index - 1);
                restartTimer();
            });
        }

        if (next) {
            next.addEventListener("click", function () {
                showSlide(index + 1);
                restartTimer();
            });
        }

        showSlide(0);
        restartTimer();
    }

    var grids = Array.prototype.slice.call(document.querySelectorAll("[data-movie-grid]"));
    var searchInput = document.querySelector("[data-search-input]");
    var categoryFilter = document.querySelector("[data-category-filter]");
    var yearFilter = document.querySelector("[data-year-filter]");
    var typeFilter = document.querySelector("[data-type-filter]");

    function applyFilters() {
        if (!grids.length) {
            return;
        }

        var keyword = searchInput ? searchInput.value.trim().toLowerCase() : "";
        var category = categoryFilter ? categoryFilter.value : "";
        var year = yearFilter ? yearFilter.value : "";
        var type = typeFilter ? typeFilter.value : "";

        grids.forEach(function (grid) {
            Array.prototype.slice.call(grid.querySelectorAll(".movie-card")).forEach(function (card) {
                var text = (card.getAttribute("data-text") || "").toLowerCase();
                var title = (card.getAttribute("data-title") || "").toLowerCase();
                var cardCategory = card.getAttribute("data-category") || "";
                var cardYear = card.getAttribute("data-year") || "";
                var cardType = card.getAttribute("data-type") || "";
                var keywordMatch = !keyword || text.indexOf(keyword) >= 0 || title.indexOf(keyword) >= 0;
                var categoryMatch = !category || cardCategory === category;
                var yearMatch = !year || cardYear === year;
                var typeMatch = !type || cardType === type;

                card.classList.toggle("is-hidden", !(keywordMatch && categoryMatch && yearMatch && typeMatch));
            });
        });
    }

    [searchInput, categoryFilter, yearFilter, typeFilter].forEach(function (control) {
        if (control) {
            control.addEventListener("input", applyFilters);
            control.addEventListener("change", applyFilters);
        }
    });

    applyFilters();

    Array.prototype.slice.call(document.querySelectorAll("[data-player]")).forEach(function (player) {
        var video = player.querySelector("video");
        var button = player.querySelector("[data-play-button]");
        var hlsInstance = null;

        if (!video || !button) {
            return;
        }

        function attachStream() {
            var stream = video.getAttribute("data-stream") || "";

            if (!stream) {
                return;
            }

            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                if (!video.getAttribute("src")) {
                    video.setAttribute("src", stream);
                }
            } else if (window.Hls && window.Hls.isSupported()) {
                if (!hlsInstance) {
                    hlsInstance = new window.Hls({
                        maxBufferLength: 30,
                        enableWorker: true
                    });
                    hlsInstance.loadSource(stream);
                    hlsInstance.attachMedia(video);
                }
            } else if (!video.getAttribute("src")) {
                video.setAttribute("src", stream);
            }
        }

        function startPlayback() {
            attachStream();
            button.hidden = true;
            player.classList.add("is-playing");

            var playPromise = video.play();

            if (playPromise && typeof playPromise.catch === "function") {
                playPromise.catch(function () {
                    button.hidden = false;
                    player.classList.remove("is-playing");
                });
            }
        }

        button.addEventListener("click", startPlayback);

        video.addEventListener("click", function () {
            if (video.paused) {
                startPlayback();
            }
        });
    });
});
