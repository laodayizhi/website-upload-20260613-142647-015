(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    function normalize(value) {
        return String(value || "").toLowerCase().trim();
    }

    ready(function () {
        var toggle = document.querySelector(".menu-toggle");
        var panel = document.querySelector(".mobile-panel");
        if (toggle && panel) {
            toggle.addEventListener("click", function () {
                var opened = panel.classList.toggle("is-open");
                toggle.setAttribute("aria-expanded", opened ? "true" : "false");
                panel.setAttribute("aria-hidden", opened ? "false" : "true");
            });
        }

        var searchInput = document.querySelector("[data-movie-search]");
        var scope = document.querySelector("[data-search-scope]");
        var activeKeyword = "";
        if (searchInput && scope) {
            var params = new URLSearchParams(window.location.search);
            var query = params.get("q");
            if (query) {
                searchInput.value = query;
            }

            var empty = document.createElement("div");
            empty.className = "empty-state";
            empty.textContent = "没有找到匹配影片，可以换一个片名、年份或标签继续搜索。";
            empty.style.display = "none";
            scope.parentNode.appendChild(empty);

            function applyFilter() {
                var term = normalize(searchInput.value);
                var cards = scope.querySelectorAll(".movie-card");
                var visible = 0;
                cards.forEach(function (card) {
                    var text = normalize([
                        card.getAttribute("data-title"),
                        card.getAttribute("data-year"),
                        card.getAttribute("data-tags"),
                        card.getAttribute("data-region"),
                        card.getAttribute("data-type"),
                        card.textContent
                    ].join(" "));
                    var matchText = !term || text.indexOf(term) !== -1;
                    var matchChip = !activeKeyword || text.indexOf(activeKeyword) !== -1;
                    var show = matchText && matchChip;
                    card.classList.toggle("is-hidden", !show);
                    if (show) {
                        visible += 1;
                    }
                });
                empty.style.display = visible ? "none" : "block";
            }

            searchInput.addEventListener("input", applyFilter);
            document.querySelectorAll("[data-filter-chip]").forEach(function (chip) {
                chip.addEventListener("click", function () {
                    document.querySelectorAll("[data-filter-chip]").forEach(function (node) {
                        node.classList.remove("is-active");
                    });
                    chip.classList.add("is-active");
                    activeKeyword = normalize(chip.getAttribute("data-filter-chip"));
                    applyFilter();
                });
            });
            applyFilter();
        }

        var carousel = document.querySelector("[data-hero-carousel]");
        if (carousel) {
            var slides = Array.prototype.slice.call(carousel.querySelectorAll("[data-hero-slide]"));
            var dots = Array.prototype.slice.call(carousel.querySelectorAll("[data-hero-dot]"));
            var current = 0;
            var timer = null;
            function show(index) {
                current = index;
                slides.forEach(function (slide, idx) {
                    slide.classList.toggle("is-active", idx === current);
                });
                dots.forEach(function (dot, idx) {
                    dot.classList.toggle("is-active", idx === current);
                });
            }
            function next() {
                show((current + 1) % slides.length);
            }
            function start() {
                timer = window.setInterval(next, 5200);
            }
            function restart() {
                window.clearInterval(timer);
                start();
            }
            dots.forEach(function (dot, idx) {
                dot.addEventListener("click", function () {
                    show(idx);
                    restart();
                });
            });
            if (slides.length > 1) {
                start();
            }
        }
    });
})();

function initMoviePlayer(sourceUrl) {
    var video = document.getElementById("movie-player");
    var overlay = document.getElementById("play-overlay");
    if (!video || !sourceUrl) {
        return;
    }
    var loaded = false;
    function attach() {
        if (loaded) {
            return;
        }
        loaded = true;
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = sourceUrl;
        } else if (window.Hls && window.Hls.isSupported()) {
            var hls = new window.Hls({
                enableWorker: true,
                lowLatencyMode: true
            });
            hls.loadSource(sourceUrl);
            hls.attachMedia(video);
            video._hlsInstance = hls;
        } else {
            video.src = sourceUrl;
        }
    }
    function play() {
        attach();
        if (overlay) {
            overlay.classList.add("is-hidden");
        }
        var promise = video.play();
        if (promise && typeof promise.catch === "function") {
            promise.catch(function () {});
        }
    }
    if (overlay) {
        overlay.addEventListener("click", play);
    }
    video.addEventListener("click", function () {
        if (video.paused) {
            play();
        } else {
            video.pause();
        }
    });
    video.addEventListener("play", function () {
        if (overlay) {
            overlay.classList.add("is-hidden");
        }
    });
}
