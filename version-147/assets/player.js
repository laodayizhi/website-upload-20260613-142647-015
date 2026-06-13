function initMoviePlayer(source) {
    var video = document.querySelector("[data-player-video]");
    var overlay = document.querySelector("[data-player-overlay]");
    var button = document.querySelector("[data-player-button]");

    if (!video || !source) {
        return;
    }

    function assignSource() {
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = source;
            return;
        }

        if (window.Hls && window.Hls.isSupported()) {
            var hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
            hls.loadSource(source);
            hls.attachMedia(video);
            return;
        }

        video.src = source;
    }

    function start() {
        if (!video.src) {
            assignSource();
        }

        if (overlay) {
            overlay.classList.add("is-hidden");
        }

        var playAttempt = video.play();
        if (playAttempt && typeof playAttempt.catch === "function") {
            playAttempt.catch(function () {});
        }
    }

    if (overlay) {
        overlay.addEventListener("click", start);
    }

    if (button) {
        button.addEventListener("click", function (event) {
            event.stopPropagation();
            start();
        });
    }

    video.addEventListener("play", function () {
        if (overlay) {
            overlay.classList.add("is-hidden");
        }
    });

    video.addEventListener("click", function () {
        if (video.paused) {
            start();
        }
    });
}
