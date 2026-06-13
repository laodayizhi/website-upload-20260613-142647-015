document.addEventListener("DOMContentLoaded", function () {
    var toggle = document.querySelector(".menu-toggle");
    var panel = document.querySelector(".mobile-panel");

    if (toggle && panel) {
        toggle.addEventListener("click", function () {
            var isOpen = toggle.classList.toggle("is-open");
            toggle.setAttribute("aria-expanded", String(isOpen));
            panel.hidden = !isOpen;
            document.body.classList.toggle("locked", isOpen);
        });
    }

    var backTopButtons = document.querySelectorAll(".back-top");
    backTopButtons.forEach(function (button) {
        button.addEventListener("click", function () {
            window.scrollTo({ top: 0, behavior: "smooth" });
        });
    });

    var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(document.querySelectorAll(".hero-dot"));
    var activeIndex = 0;

    function showSlide(index) {
        if (!slides.length) {
            return;
        }

        activeIndex = (index + slides.length) % slides.length;

        slides.forEach(function (slide, current) {
            slide.classList.toggle("is-active", current === activeIndex);
        });

        dots.forEach(function (dot, current) {
            dot.classList.toggle("is-active", current === activeIndex);
        });
    }

    dots.forEach(function (dot, index) {
        dot.addEventListener("click", function () {
            showSlide(index);
        });
    });

    if (slides.length > 1) {
        setInterval(function () {
            showSlide(activeIndex + 1);
        }, 5600);
    }

    var filterForm = document.querySelector("[data-filter-form]");
    var searchInput = document.querySelector("[data-filter-search]");
    var categorySelect = document.querySelector("[data-filter-category]");
    var yearSelect = document.querySelector("[data-filter-year]");
    var typeSelect = document.querySelector("[data-filter-type]");
    var regionSelect = document.querySelector("[data-filter-region]");
    var cards = Array.prototype.slice.call(document.querySelectorAll(".movie-card[data-title]"));
    var emptyState = document.querySelector(".empty-state");

    function getQueryValue() {
        var params = new URLSearchParams(window.location.search);
        return params.get("q") || "";
    }

    if (searchInput && getQueryValue()) {
        searchInput.value = getQueryValue();
    }

    function cardMatches(card) {
        var keyword = searchInput ? searchInput.value.trim().toLowerCase() : "";
        var category = categorySelect ? categorySelect.value : "";
        var year = yearSelect ? yearSelect.value : "";
        var type = typeSelect ? typeSelect.value : "";
        var region = regionSelect ? regionSelect.value : "";
        var haystack = [card.dataset.title, card.dataset.tags, card.dataset.year, card.dataset.type, card.dataset.region].join(" ").toLowerCase();

        if (keyword && haystack.indexOf(keyword) === -1) {
            return false;
        }

        if (category && card.dataset.category !== category) {
            return false;
        }

        if (year && card.dataset.year !== year) {
            return false;
        }

        if (type && card.dataset.type !== type) {
            return false;
        }

        if (region && card.dataset.region !== region) {
            return false;
        }

        return true;
    }

    function applyFilters() {
        var visible = 0;

        cards.forEach(function (card) {
            var matched = cardMatches(card);
            card.style.display = matched ? "" : "none";

            if (matched) {
                visible += 1;
            }
        });

        if (emptyState) {
            emptyState.classList.toggle("is-visible", visible === 0);
        }
    }

    if (filterForm) {
        filterForm.addEventListener("submit", function (event) {
            event.preventDefault();
            applyFilters();
        });
    }

    [searchInput, categorySelect, yearSelect, typeSelect, regionSelect].forEach(function (element) {
        if (element) {
            element.addEventListener("input", applyFilters);
            element.addEventListener("change", applyFilters);
        }
    });

    if (cards.length && (filterForm || searchInput)) {
        applyFilters();
    }
});
