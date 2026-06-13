document.addEventListener("DOMContentLoaded", function () {
    var body = document.body;
    var header = document.querySelector("[data-header]");
    var menuToggle = document.querySelector("[data-menu-toggle]");
    var mobilePanel = document.querySelector("[data-mobile-panel]");

    function updateHeader() {
        body.classList.toggle("is-scrolled", window.scrollY > 20);
    }

    updateHeader();
    window.addEventListener("scroll", updateHeader, { passive: true });

    if (menuToggle && header && mobilePanel) {
        menuToggle.addEventListener("click", function () {
            header.classList.toggle("menu-open");
        });
    }

    var hero = document.querySelector("[data-hero]");
    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
        var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
        var prev = hero.querySelector("[data-hero-prev]");
        var next = hero.querySelector("[data-hero-next]");
        var current = 0;
        var timer = null;

        function showSlide(index) {
            if (!slides.length) {
                return;
            }
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, idx) {
                slide.classList.toggle("active", idx === current);
            });
            dots.forEach(function (dot, idx) {
                dot.classList.toggle("active", idx === current);
            });
        }

        function startTimer() {
            window.clearInterval(timer);
            timer = window.setInterval(function () {
                showSlide(current + 1);
            }, 5200);
        }

        if (prev) {
            prev.addEventListener("click", function () {
                showSlide(current - 1);
                startTimer();
            });
        }

        if (next) {
            next.addEventListener("click", function () {
                showSlide(current + 1);
                startTimer();
            });
        }

        dots.forEach(function (dot) {
            dot.addEventListener("click", function () {
                showSlide(Number(dot.getAttribute("data-hero-dot")) || 0);
                startTimer();
            });
        });

        startTimer();
    }

    var searchInputs = Array.prototype.slice.call(document.querySelectorAll("[data-live-search]"));
    var cards = Array.prototype.slice.call(document.querySelectorAll("[data-card]"));
    var resultText = document.querySelector("[data-result-text]");
    var activeFilter = "全部";

    function normalize(value) {
        return String(value || "").trim().toLowerCase();
    }

    function applyFilters() {
        var query = "";
        searchInputs.forEach(function (input) {
            if (input.value) {
                query = input.value;
            }
        });
        var normalizedQuery = normalize(query);
        var visible = 0;

        cards.forEach(function (card) {
            var text = normalize(card.getAttribute("data-terms"));
            var matchesQuery = !normalizedQuery || text.indexOf(normalizedQuery) !== -1;
            var matchesFilter = activeFilter === "全部" || text.indexOf(normalize(activeFilter)) !== -1;
            var show = matchesQuery && matchesFilter;
            card.classList.toggle("is-hidden", !show);
            if (show) {
                visible += 1;
            }
        });

        if (resultText) {
            resultText.textContent = normalizedQuery ? "为你找到 " + visible + " 部相关影片" : "输入关键词开始检索";
        }
    }

    searchInputs.forEach(function (input) {
        if (input.hasAttribute("data-url-query")) {
            var params = new URLSearchParams(window.location.search);
            var key = input.getAttribute("data-url-query");
            var value = params.get(key);
            if (value) {
                input.value = value;
            }
        }
        input.addEventListener("input", applyFilters);
    });

    var filterButtons = Array.prototype.slice.call(document.querySelectorAll("[data-filter]"));
    filterButtons.forEach(function (button) {
        button.addEventListener("click", function () {
            activeFilter = button.getAttribute("data-filter") || "全部";
            filterButtons.forEach(function (item) {
                item.classList.toggle("active", item === button);
            });
            applyFilters();
        });
    });

    if (cards.length && searchInputs.length) {
        applyFilters();
    }
});
