import { setupCarousels, setupTrailerModal } from "./carousels.js";
import { setupLazyLoading } from "./lazyload.js";

document.addEventListener("DOMContentLoaded", async () => {
  await loadMoviesData();
  setupCarousels();
  setupTrailerModal();
  setupLazyLoading();
  initHeader();
  initSmoothScroll();
  initThumbnailScrollers();
  initThumbnailModal();
  initFilterPills();
  initScrollAnimations();
  animateCounters();
  initContactForm();
  initFooterYear();

  // Reinit scroll animations after all content loaded
  setTimeout(() => {
    if (window.reinitScrollAnimations) {
      window.reinitScrollAnimations();
    }
  }, 300);
});

function initHeader() {
  const header = document.querySelector(".main-header");
  const navToggle = document.getElementById("navToggle");
  const nav = document.getElementById("primaryNav");

  let lastScrollY = window.scrollY;

  const toggleScrolled = () => {
    if (!header) return;
    const isScrolled = window.scrollY > 10;
    header.classList.toggle("scrolled", isScrolled);
  };

  toggleScrolled();
  window.addEventListener("scroll", toggleScrolled, { passive: true });

  if (navToggle && nav) {
    navToggle.addEventListener("click", () => {
      const isOpen = nav.classList.toggle("open");
      navToggle.setAttribute("aria-expanded", String(isOpen));
      navToggle.classList.toggle("open", isOpen);
      if (isOpen) {
        header?.classList.remove("header-hide");
      }
    });
  }

  nav?.querySelectorAll(".nav-link").forEach((link) => {
    link.addEventListener("click", () => {
      nav.classList.remove("open");
      navToggle?.setAttribute("aria-expanded", "false");
    });
  });

  const handleHideOnScroll = () => {
    if (!header) return;
    const currentY = window.scrollY;
    const isNavOpen = nav?.classList.contains("open");
    const shouldHide = currentY > lastScrollY && currentY > 120 && !isNavOpen;
    if (shouldHide) {
      header.classList.add("header-hide");
    } else {
      header.classList.remove("header-hide");
    }
    lastScrollY = currentY;
  };

  window.addEventListener(
    "scroll",
    () => {
      toggleScrolled();
      handleHideOnScroll();
    },
    { passive: true }
  );
}

function initSmoothScroll() {
  const links = document.querySelectorAll('a[href^="#"]');
  links.forEach((link) => {
    link.addEventListener("click", (event) => {
      const targetId = link.getAttribute("href");
      if (!targetId || targetId === "#") return;
      const targetEl = document.querySelector(targetId);
      if (!targetEl) return;
      event.preventDefault();
      targetEl.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  });
}

function initThumbnailScrollers() {
  // Handle new In Release section navigation
  const inReleaseScroll = document.getElementById("inReleaseScroll");
  const leftBtn = document.querySelector(".in-release-nav-left");
  const rightBtn = document.querySelector(".in-release-nav-right");
  const progressBar = document.querySelector(".in-release-progress-bar");

  if (inReleaseScroll && leftBtn && rightBtn && progressBar) {
    const updateProgressBar = () => {
      const scrollPercentage =
        (inReleaseScroll.scrollLeft /
          (inReleaseScroll.scrollWidth - inReleaseScroll.clientWidth)) *
        100;
      progressBar.style.width = Math.max(20, scrollPercentage) + "%";

      // Parallax effect to movie cards
      const movies = inReleaseScroll.querySelectorAll(
        ".in-release-movie-wrapper"
      );
      movies.forEach((movie, index) => {
        const movieScroll = inReleaseScroll.scrollLeft * (0.05 * (index % 3));
        movie.style.transform = `translateX(${movieScroll * 0.1}px)`;
      });
    };

    leftBtn.addEventListener("click", () => {
      const scrollAmount = inReleaseScroll.clientWidth * 0.9;
      inReleaseScroll.scrollBy({ left: -scrollAmount, behavior: "smooth" });
    });

    rightBtn.addEventListener("click", () => {
      const scrollAmount = inReleaseScroll.clientWidth * 0.9;
      inReleaseScroll.scrollBy({ left: scrollAmount, behavior: "smooth" });
    });

    inReleaseScroll.addEventListener("scroll", updateProgressBar);

    // Add keyboard navigation
    document.addEventListener("keydown", (e) => {
      if (e.key === "ArrowLeft") {
        leftBtn.click();
      } else if (e.key === "ArrowRight") {
        rightBtn.click();
      }
    });

    // Add touch/swipe support for mobile
    let startX = 0;
    let scrollLeft = 0;

    inReleaseScroll.addEventListener("touchstart", (e) => {
      startX = e.touches[0].pageX - inReleaseScroll.offsetLeft;
      scrollLeft = inReleaseScroll.scrollLeft;
    });

    inReleaseScroll.addEventListener("touchmove", (e) => {
      const x = e.touches[0].pageX - inReleaseScroll.offsetLeft;
      const walk = (x - startX) * 2;
      inReleaseScroll.scrollLeft = scrollLeft - walk;
    });

    // Initialize progress bar
    updateProgressBar();

    // Add hover effects to movie cards
    const movieCards = inReleaseScroll.querySelectorAll(
      ".in-release-movie-card"
    );
    movieCards.forEach((movie) => {
      movie.addEventListener("mouseenter", () => {
        movie.style.zIndex = "10";
      });

      movie.addEventListener("mouseleave", () => {
        movie.style.zIndex = "1";
      });
    });
  }

  // Handle existing scroll buttons for backward compatibility
  const buttons = document.querySelectorAll(".scroll-btn");
  buttons.forEach((btn) => {
    const direction = btn.getAttribute("data-direction") === "left" ? -1 : 1;
    const target = document.querySelector(btn.getAttribute("data-target"));
    if (!target) return;
    btn.addEventListener("click", () => {
      const scrollAmount = target.clientWidth * 0.8 * direction;
      target.scrollBy({ left: scrollAmount, behavior: "smooth" });
    });
  });
}

function initThumbnailModal() {
  const modalEl = document.getElementById("movieModal");
  if (!modalEl || !window.bootstrap?.Modal) return;

  const modal = new bootstrap.Modal(modalEl, {
    focus: true,
    keyboard: true,
    backdrop: true,
  });
  const titleEl = document.getElementById("movieModalLabel");
  const metaEl = document.getElementById("movieModalMeta");
  const imgEl = document.getElementById("movieModalImg");
  const synopsisEl = document.getElementById("movieModalSynopsis");
  const directorEl = document.getElementById("movieModalDirector");
  const castEl = document.getElementById("movieModalCast");
  const runtimeEl = document.getElementById("movieModalRuntime");
  const closeBtn = document.getElementById("movieModalClose");

  // Close button handler
  if (closeBtn) {
    closeBtn.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      modal.hide();
    });
  }

  // Handle both old thumbnail-card and new in-release-movie-card
  document
    .querySelectorAll(".thumbnail-card, .in-release-movie-card")
    .forEach((card) => {
      card.addEventListener("click", (e) => {
        // Don't open modal if clicking on buttons
        if (
          e.target.classList.contains("in-release-btn") ||
          e.target.closest(".in-release-btn")
        ) {
          return;
        }

        const title = card.dataset.title || "Untitled";
        const year = card.dataset.year || "";
        const runtime = card.dataset.runtime || "";
        const genre = card.dataset.genre || "";
        const director = card.dataset.director || "";
        const cast = card.dataset.cast || "";
        const synopsis = card.dataset.synopsis || "";
        const img =
          card.dataset.img || card.querySelector("img")?.dataset.src || "";

        titleEl.textContent = title;
        metaEl.textContent = [year, runtime, genre].filter(Boolean).join(" • ");
        synopsisEl.textContent = synopsis || "No synopsis available.";
        directorEl.textContent = director || "N/A";
        castEl.textContent = cast || "N/A";
        runtimeEl.textContent = runtime || "N/A";
        if (img) {
          imgEl.src = img;
          imgEl.alt = `${title} poster`;
        }

        modal.show();
      });
    });
}

function initFilterPills() {
  const pills = document.querySelectorAll(".filter-pill");
  const cards = document.querySelectorAll(".release-card");
  if (!pills.length || !cards.length) return;

  pills.forEach((pill) => {
    pill.addEventListener("click", () => {
      pills.forEach((p) => p.classList.remove("active"));
      pill.classList.add("active");
      const filter = pill.getAttribute("data-filter");

      cards.forEach((card) => {
        const categories = (card.getAttribute("data-category") || "").split(
          " "
        );
        const shouldShow = filter === "all" || categories.includes(filter);
        card.parentElement.style.display = shouldShow ? "" : "none";
      });
    });
  });
}

function animateCounters() {
  const counters = document.querySelectorAll(".stat-number");
  const speed = 300; // Animation speed

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const counter = entry.target;
          const target = parseInt(counter.getAttribute("data-target"));
          const increment = target / speed;

          const updateCounter = () => {
            const current = parseInt(counter.innerText);

            if (current < target) {
              counter.innerText = Math.ceil(current + increment);
              setTimeout(updateCounter, 10);
            } else {
              counter.innerText = target + "+";
            }
          };

          updateCounter();
          observer.unobserve(counter);
        }
      });
    },
    { threshold: 0.5 }
  );

  counters.forEach((counter) => {
    observer.observe(counter);
  });
}

function initScrollAnimations() {
  const animated = document.querySelectorAll(
    ".fade-in, .fade-in-up, .scroll-fade-in, .scroll-slide-left, .scroll-slide-right, .scroll-scale-in, .scroll-rotate-in"
  );
  if (!animated.length) return;

  const reveal = (el) => {
    el.classList.add("is-visible");
    el.classList.add("visible");
  };

  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            reveal(entry.target);
            observer.unobserve(entry.target);
          }
        });
      },
      {
        rootMargin: "80px",
        threshold: 0.1,
      }
    );
    animated.forEach((el) => observer.observe(el));
  } else {
    animated.forEach(reveal);
  }
}

// Re-init scroll animations after dynamic content loads
window.reinitScrollAnimations = initScrollAnimations;

function initContactForm() {
  const form = document.getElementById("contactForm");
  const status = document.getElementById("formStatus");
  if (!form || !status) return;

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const formData = new FormData(form);
    const values = Object.fromEntries(formData.entries());
    const hasEmpty = Object.values(values).some(
      (value) => !String(value).trim()
    );

    if (hasEmpty) {
      status.textContent = "Please complete all fields before sending.";
      status.style.color = "#f5a623";
      return;
    }

    status.textContent = "Thanks! Your message has been recorded.";
    status.style.color = "#38d36f";
    form.reset();
  });
}

function initFooterYear() {
  const yearEl = document.getElementById("yearNow");
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }
}

async function loadMoviesData() {
  try {
    const res = await fetch("demo/movies.json");
    const data = await res.json();
    renderHero(data.hero || []);
    renderThumbnails(data.thumbnails || data.releases || []);
    renderReleases(data.releases || []);
    renderUpcoming(data.upcoming || []);
    renderTrailers(data.trailers || []);
    renderTeam(data.team || []);
    renderAwards(data.awards || []);
  } catch (err) {
    console.warn("Failed to load movies.json, using existing markup.", err);
  }
}

function renderHero(hero = []) {
  const heroCarousel = document.getElementById("heroCarousel");
  if (!heroCarousel || !hero.length) return;
  const indicators = heroCarousel.querySelector(".carousel-indicators");
  const inner = heroCarousel.querySelector(".carousel-inner");
  if (!indicators || !inner) return;

  indicators.innerHTML = hero
    .map(
      (_, idx) =>
        `<button type="button" data-bs-target="#heroCarousel" data-bs-slide-to="${idx}" class="${
          idx === 0 ? "active" : ""
        }" aria-label="Slide ${idx + 1}"></button>`
    )
    .join("");

  inner.innerHTML = hero
    .map((item, idx) => {
      const isActive = idx === 0 ? "active" : "";
      const video = item.video || "";
      const poster = item.poster || item.image || "";
      const media = video
        ? `<video class="hero-visual hero-video" src="${video}" ${
            poster ? `poster="${poster}"` : ""
          } muted autoplay playsinline preload="metadata" crossorigin="anonymous"></video>`
        : `<img class="hero-visual" src="${poster}" alt="${item.title}">`;
      return `
        <div class="carousel-item ${isActive}">
          <div class="hero-slide">
            ${media}
            <div class="hero-overlay">
              <div class="container">
                <div class="hero-content fade-in-up">
                  <p class="hero-label">${item.tagline || ""}</p>
                  <h1 class="hero-title">${item.title || ""}</h1>
                  <div class="d-flex flex-wrap gap-3">
                    <button class="btn-primary-custom">Book Tickets</button>
                    <button class="btn-secondary-custom">Watch Trailer</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>`;
    })
    .join("");
}

function renderThumbnails(thumbnails = []) {
  const container = document.getElementById("inReleaseScroll");
  if (!container) return;

  const moviesToRender =
    thumbnails.length > 0
      ? thumbnails.map((t) => ({
          title: t.title || "Untitled",
          poster:
            t.img ||
            t.poster ||
            "https://images.unsplash.com/photo-1485846234645-a62644f84728?w=400&h=600&fit=crop",
          date: t.date || "Now Showing",
          action: t.action || "Get Tickets",
          secondary: t.secondary || "More Info",
          year: t.year || "",
          runtime: t.runtime || "",
          genre: t.genre || "",
          director: t.director || "",
          cast: t.cast || "",
          synopsis: t.synopsis || "",
        }))
      : sampleMovies;

  container.innerHTML = moviesToRender
    .map(
      (m) => `
    <div class="in-release-movie-wrapper">
      <div class="in-release-movie-card" 
           data-title="${m.title}"
           data-year="${m.year || ""}"
           data-runtime="${m.runtime || ""}"
           data-genre="${m.genre || ""}"
           data-director="${m.director || ""}"
           data-cast="${m.cast || ""}"
           data-synopsis="${m.synopsis || ""}"
           data-img="${m.poster}">
        <img
          loading="lazy"
          class="in-release-poster lazy"
          src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw=="
          data-src="${m.poster}"
          alt="${m.title} poster"
        />
        <div class="in-release-play-overlay">
          <i class="fas fa-play-circle in-release-play-icon"></i>
        </div>
      </div>
      <div class="in-release-movie-info">
        <h3 class="in-release-movie-title">${m.title}</h3>
        <div class="in-release-movie-buttons">
          <button class="in-release-btn in-release-btn-primary">${
            m.action
          }</button>
          <button class="in-release-btn in-release-btn-secondary">${
            m.secondary
          }</button>
        </div>
      </div>
    </div>
    `
    )
    .join("");
}

function renderReleases(releases = []) {
  const row = document.querySelector("#moviesContainer");
  if (!row) return;

  const isHomepage =
    window.location.pathname.endsWith("index.html") ||
    window.location.pathname === "/";

  const releasesToShow = isHomepage ? releases.slice(0, 3) : releases;

  row.innerHTML = releasesToShow
    .map(
      (m, idx) => `
      <div class="col-md-4">
        <div class="movie-card scroll-scale-in delay-${Math.min(
          (idx % 3) * 100 + 100,
          400
        )} release-card" data-category="${(m.categories || []).join(" ")}">
          <img
            loading="lazy"
            class="movie-poster lazy"
            src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw=="
            data-src="${m.poster || ""}"
            alt="${m.title || "Movie"} poster"
          />
          <div class="movie-info">
            <h3 class="movie-title">${m.title || ""}</h3>
            <div class="movie-date">${m.date || ""}</div>
            <p class="movie-description">${m.description || ""}</p>
            <div class="d-flex flex-wrap gap-2">
              <button class="btn-primary-custom glow-on-hover">Book Tickets</button>
              <button class="btn-secondary-custom">Watch Trailer</button>
            </div>
          </div>
        </div>
      </div>
      `
    )
    .join("");

  if (isHomepage && releases.length > 3) {
    const seeMoreButton = document.createElement("div");
    seeMoreButton.className = "text-center mt-4";
    seeMoreButton.innerHTML =
      '<button class="btn-primary-custom see-more-btn" onclick="window.location.href=\'movies.html\'">See More</button>';
    row.parentNode.appendChild(seeMoreButton);
  }
}

function renderUpcoming(upcoming = []) {
  const carousel = document.getElementById("upcomingCarousel");
  if (!carousel) return;
  const inner = carousel.querySelector(".carousel-inner");
  if (!inner || !upcoming.length) return;
  inner.innerHTML = upcoming
    .map(
      (u, idx) => `
      <div class="carousel-item ${idx === 0 ? "active" : ""}">
        <div class="upcoming-slide">
          <img loading="lazy" class="upcoming-image" src="${
            u.image || ""
          }" alt="${u.title || ""} banner">
          <div class="upcoming-overlay">
            <div class="container">
              <div class="upcoming-content fade-in">
                <div class="upcoming-badge">${u.window || ""}</div>
                <h2 class="upcoming-title">${u.title || ""}</h2>
                <p class="hero-description">${u.description || ""}</p>
                <button class="btn-primary-custom">Notify Me</button>
              </div>
            </div>
          </div>
        </div>
      </div>`
    )
    .join("");
}

function renderTrailers(trailers = []) {
  const container = document.querySelector("#trailersContent");
  if (!container || !trailers.length) return;

  const data = rotateFirstToEnd(trailers);

  const perSlide =
    typeof window !== "undefined" &&
    window.matchMedia &&
    window.matchMedia("(max-width: 767px)").matches
      ? 1
      : 3;

  // If 3 or fewer trailers, show as simple grid
  if (data.length <= 3) {
    container.innerHTML = `
      <div class="row">
        ${data
          .map(
            (t) => `
          <div class="col-md-4">
            <div class="trailer-card" data-video-id="${t.videoId || ""}">
              <img
                loading="lazy"
                class="trailer-thumbnail lazy"
                src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw=="
                data-src="${t.thumbnail || ""}"
                alt="${t.title || ""}"
              />
              <div class="trailer-play-overlay">
                <i class="fas fa-play-circle trailer-play-icon"></i>
              </div>
              <div class="trailer-title">${t.title || ""}</div>
            </div>
          </div>
          `
          )
          .join("")}
      </div>
    `;
    return;
  }

  // More than 3: create carousel that moves one card at a time
  const slides = buildSlides(data, perSlide);

  container.innerHTML = `
    <div id="trailersCarousel" class="carousel slide" data-bs-ride="carousel">
      <div class="carousel-inner">
        ${slides
          .map(
            (slideItems, idx) => `
          <div class="carousel-item ${idx === 0 ? "active" : ""}">
            <div class="row">
              ${slideItems
                .map(
                  (t) => `
                <div class="col-md-4">
                  <div class="trailer-card" data-video-id="${t.videoId || ""}">
                    <img
                      loading="lazy"
                      class="trailer-thumbnail lazy"
                      src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw=="
                      data-src="${t.thumbnail || ""}"
                      alt="${t.title || ""}"
                    />
                    <div class="trailer-play-overlay">
                      <i class="fas fa-play-circle trailer-play-icon"></i>
                    </div>
                    <div class="trailer-title">${t.title || ""}</div>
                  </div>
                </div>
                `
                )
                .join("")}
            </div>
          </div>
          `
          )
          .join("")}
      </div>
    </div>
  `;

  // Initialize infinite carousel
  const carouselEl = document.getElementById("trailersCarousel");
  if (carouselEl && window.bootstrap) {
    const existingCarousel = bootstrap.Carousel.getInstance(carouselEl);
    if (existingCarousel) existingCarousel.dispose();

    new bootstrap.Carousel(carouselEl, {
      interval: 4000,
      wrap: true,
      ride: "carousel",
    });
  }
}

function renderTeam(team = []) {
  const container = document.querySelector("#teamContent");
  if (!container || !team.length) return;

  const data = rotateFirstToEnd(team);

  const perSlide =
    typeof window !== "undefined" &&
    window.matchMedia &&
    window.matchMedia("(max-width: 767px)").matches
      ? 1
      : 3;

  // If 3 or fewer team members, show as simple grid
  if (data.length <= 3) {
    container.innerHTML = `
      <div class="row">
        ${data
          .map(
            (t) => `
          <div class="col-md-4">
            <!-- Team card -->
            <article class="teambox" tabindex="0" aria-label="Team member card">
              <img
                class="teambox__img"
                src="${t.photo || "https://via.placeholder.com/700x985"}"
                alt="${t.name || "Team member"}"
                loading="lazy" decoding="async" width="700" height="985"
              />

              <span class="teambox__role">${
                t.role || "Executive Producer"
              }</span>

              <h4 class="teambox__name">${t.name || "Arlene Bell"}</h4>

              <!-- description only visible on hover/focus -->
              <div class="teambox__desc">
                <div class="teambox__desc-inner">
                  "${t.bio || "Make your hobby your job"}"
                </div>
              </div>

              <a href="#" class="teambox__btn" aria-label="View profile">
                <i class="framek-icon-chevron-right" aria-hidden="true">›</i>
              </a>
            </article>
          </div>
          `
          )
          .join("")}
      </div>
    `;
    return;
  }

  // More than 3: create carousel that moves one card at a time
  const slides = buildSlides(data, perSlide);

  container.innerHTML = `
    <div id="teamCarousel" class="carousel slide" data-bs-ride="carousel">
      <div class="carousel-inner">
        ${slides
          .map(
            (slideItems, idx) => `
          <div class="carousel-item ${idx === 0 ? "active" : ""}">
            <div class="row">
              ${slideItems
                .map(
                  (t) => `
                <div class="col-md-4">
                  <article class="teambox" tabindex="0" aria-label="Team member card">
                    <img
                      class="teambox__img"
                      src="${t.photo || "https://via.placeholder.com/700x985"}"
                      alt="${t.name || "Team member"}"
                      loading="lazy" decoding="async" width="700" height="985"
                    />

                    <span class="teambox__role">${
                      t.role || "Executive Producer"
                    }</span>

                    <h4 class="teambox__name">${t.name || "Arlene Bell"}</h4>

                    <!-- description only visible on hover/focus -->
                    <div class="teambox__desc">
                      <div class="teambox__desc-inner">
                        "${t.bio || "Make your hobby your job"}"
                      </div>
                    </div>

                    <a href="#" class="teambox__btn" aria-label="View profile">
                      <i class="framek-icon-chevron-right" aria-hidden="true">›</i>
                    </a>
                  </article>
                </div>
                `
                )
                .join("")}
            </div>
          </div>
          `
          )
          .join("")}
      </div>
    </div>
  `;

  // Initialize infinite carousel
  const carouselEl = document.getElementById("teamCarousel");
  if (carouselEl && window.bootstrap) {
    const existingCarousel = bootstrap.Carousel.getInstance(carouselEl);
    if (existingCarousel) existingCarousel.dispose();

    new bootstrap.Carousel(carouselEl, {
      interval: 4000,
      wrap: true,
      ride: "carousel",
    });
  }
}

function renderAwards(awards = []) {
  const table = document.querySelector("#awards .awards-table");
  if (!table || !awards.length) return;
  table.innerHTML = `
    <table>
      <thead>
        <tr class="award-header-row">
          <th></th>
          <th class="award-header-source">SOURCE</th>
          <th class="award-header-title">AWARD TITLE</th>
          <th class="award-header-date">DATE</th>
        </tr>
      </thead>
      <tbody>
        ${awards
          .map(
            (a) => `
        <tr class="award-row fade-in">
          <td>
            <div class="award-thumb" aria-hidden="true">
              <span
                class="award-thumb-img"
                style="background-image: url('assets/images/award.png')"
              ></span>
              <span class="award-thumb-icon">
                <i class="fas fa-trophy"></i>
              </span>
            </div>
          </td>
          <td class="award-source">${a.source || ""}</td>
          <td class="award-title">${a.title || ""}</td>
          <td class="award-date">${a.year || ""}</td>
        </tr>`
          )
          .join("")}
      </tbody>
    </table>`;
}

function rotateFirstToEnd(list = []) {
  if (!Array.isArray(list) || list.length === 0) return list;
  const copy = [...list];
  const first = copy.shift();
  if (first !== undefined) copy.push(first);
  return copy;
}

// Build overlapping slides so only one card advances while showing N per slide
function buildSlides(items = [], perSlide = 3) {
  if (!Array.isArray(items) || items.length === 0) return [];
  const count = Math.max(1, perSlide);
  return items.map((_, startIdx) => {
    const slide = [];
    for (let j = 0; j < count; j += 1) {
      const item = items[(startIdx + j) % items.length];
      slide.push(item);
    }
    return slide;
  });
}
