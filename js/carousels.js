export function setupCarousels() {
  const hero = document.getElementById("heroCarousel");
  const upcoming = document.getElementById("upcomingCarousel");

  if (hero && window.bootstrap?.Carousel) {
    setupHeroVideoCarousel(hero);
  }

  if (upcoming && window.bootstrap?.Carousel) {
    new bootstrap.Carousel(upcoming, {
      interval: 6500,
      ride: "carousel",
      pause: false,
      wrap: true,
    });
  }
}

function setupHeroVideoCarousel(hero) {
  const carousel = new bootstrap.Carousel(hero, {
    interval: false,
    ride: false,
    pause: false,
    wrap: true,
  });

  let heroTimer = null;
  let outgoingVideo = null;

  const clearTimer = () => {
    if (heroTimer) {
      clearTimeout(heroTimer);
      heroTimer = null;
    }
  };

  const getActiveVideo = () =>
    hero.querySelector(".carousel-item.active video.hero-video");

  const resetVideo = (video) => {
    video.pause();
    video.currentTime = 0;
    video.onended = null;
    if (video.__waitTimer) {
      clearTimeout(video.__waitTimer);
      video.__waitTimer = null;
    }
    if (video.__playHook) {
      video.removeEventListener("canplay", video.__playHook);
      video.__playHook = null;
    }
  };

  const playActiveVideo = () => {
    clearTimer();
    const video = getActiveVideo();
    if (!video) {
      carousel.next();
      return;
    }

    const slide = video.closest(".hero-slide");
    const poster = video.getAttribute("poster");

    resetVideo(video);
    video.autoplay = false;
    video.muted = true;
    video.playsInline = true;

    // Show the poster by hiding the video briefly and painting the slide background.
    if (slide && poster) {
      slide.style.backgroundImage = `url("${poster}")`;
      slide.style.backgroundSize = "cover";
      slide.style.backgroundPosition = "center";
      slide.style.backgroundRepeat = "no-repeat";
    }
    video.style.opacity = "0";
    if (!video.style.transition) {
      video.style.transition = "opacity 300ms ease";
    }

    const handleEnded = () => {
      clearTimer();
      carousel.next();
    };

    const failAndAdvance = () => {
      clearTimer();
      heroTimer = setTimeout(() => {
        handleEnded();
      }, 1200);
    };

    const scheduleFallback = (durationSec) => {
      // Use a long, safe fallback so we never cut the video short.
      // If we know the duration, wait duration + 2s; otherwise wait 60s.
      const fallbackMs =
        Number.isFinite(durationSec) && durationSec > 0
          ? durationSec * 1000 + 2500
          : 6000;
      clearTimer();
      heroTimer = setTimeout(() => {
        handleEnded();
      }, fallbackMs);
    };

    video.onended = handleEnded;

    const startPlayback = () => {
      const durationSec =
        Number.isFinite(video.duration) && video.duration > 0
          ? video.duration
          : null;

      video
        .play()
        .then(() => {
          // Fade video in and clear poster background once playback starts.
          video.style.opacity = "1";
          if (slide) {
            slide.style.backgroundImage = "";
          }
          // Rely on the native "ended" event; fallback only after the full duration.
          scheduleFallback(durationSec);
        })
        .catch(() => {
          // If autoplay is blocked or fails, bail to next slide soon.
          failAndAdvance();
        });
    };

    const startAfterPosterPause = () => {
      // Briefly show the poster image before starting playback.
      clearTimer();
      heroTimer = setTimeout(() => {
        startPlayback();
      }, 1000);
    };

    if (video.readyState < 2) {
      const hook = () => {
        startAfterPosterPause();
      };
      video.__playHook = hook;
      video.addEventListener("canplay", hook, { once: true });
      video.__waitTimer = setTimeout(() => {
        startAfterPosterPause();
      }, 1800);
    } else {
      startAfterPosterPause();
    }

    video.addEventListener("error", failAndAdvance, { once: true });
  };

  hero.addEventListener("slide.bs.carousel", () => {
    clearTimer();
    outgoingVideo = getActiveVideo();
  });

  hero.addEventListener("slid.bs.carousel", () => {
    if (outgoingVideo) {
      resetVideo(outgoingVideo);
      outgoingVideo = null;
    }
    playActiveVideo();
  });

  playActiveVideo();
}

export function setupTrailerModal() {
  const modalEl = document.getElementById("trailerModal");
  const iframe = document.getElementById("trailerFrame");
  if (!modalEl || !iframe) return;

  const modal = window.bootstrap
    ? new bootstrap.Modal(modalEl, { focus: true })
    : null;

  document.querySelectorAll(".trailer-card").forEach((card) => {
    card.addEventListener("click", () => {
      const id = card.getAttribute("data-video-id");
      if (!id) return;
      iframe.src = `https://www.youtube.com/embed/${id}?autoplay=1&rel=0`;
      modal?.show();
    });
  });

  modalEl.addEventListener("hidden.bs.modal", () => {
    iframe.src = "";
  });
}
