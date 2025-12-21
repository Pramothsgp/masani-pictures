import { setupCarousels, setupTrailerModal } from './carousels.js';
import { setupLazyLoading } from './lazyload.js';

document.addEventListener('DOMContentLoaded', async () => {
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
  const header = document.querySelector('.main-header');
  const navToggle = document.getElementById('navToggle');
  const nav = document.getElementById('primaryNav');

  let lastScrollY = window.scrollY;

  const toggleScrolled = () => {
    if (!header) return;
    const isScrolled = window.scrollY > 10;
    header.classList.toggle('scrolled', isScrolled);
  };

  toggleScrolled();
  window.addEventListener('scroll', toggleScrolled, { passive: true });

  if (navToggle && nav) {
    navToggle.addEventListener('click', () => {
      const isOpen = nav.classList.toggle('open');
      navToggle.setAttribute('aria-expanded', String(isOpen));
      navToggle.classList.toggle('open', isOpen);
      if (isOpen) {
        header?.classList.remove('header-hide');
      }
    });
  }

  nav?.querySelectorAll('.nav-link').forEach((link) => {
    link.addEventListener('click', () => {
      nav.classList.remove('open');
      navToggle?.setAttribute('aria-expanded', 'false');
    });
  });

  const handleHideOnScroll = () => {
    if (!header) return;
    const currentY = window.scrollY;
    const isNavOpen = nav?.classList.contains('open');
    const shouldHide = currentY > lastScrollY && currentY > 120 && !isNavOpen;
    if (shouldHide) {
      header.classList.add('header-hide');
    } else {
      header.classList.remove('header-hide');
    }
    lastScrollY = currentY;
  };

  window.addEventListener(
    'scroll',
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
    link.addEventListener('click', (event) => {
      const targetId = link.getAttribute('href');
      if (!targetId || targetId === '#') return;
      const targetEl = document.querySelector(targetId);
      if (!targetEl) return;
      event.preventDefault();
      targetEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });
}

function initThumbnailScrollers() {
  // Handle new In Release section navigation
  const inReleaseScroll = document.getElementById('inReleaseScroll');
  const leftBtn = document.querySelector('.in-release-nav-left');
  const rightBtn = document.querySelector('.in-release-nav-right');
  const progressBar = document.querySelector('.in-release-progress-bar');

  if (inReleaseScroll && leftBtn && rightBtn && progressBar) {
    const updateProgressBar = () => {
      const scrollPercentage =
        (inReleaseScroll.scrollLeft /
          (inReleaseScroll.scrollWidth - inReleaseScroll.clientWidth)) *
        100;
      progressBar.style.width = Math.max(20, scrollPercentage) + '%';

      // Parallax effect to movie cards
      const movies = inReleaseScroll.querySelectorAll(
        '.in-release-movie-wrapper'
      );
      movies.forEach((movie, index) => {
        const movieScroll = inReleaseScroll.scrollLeft * (0.05 * (index % 3));
        movie.style.transform = `translateX(${movieScroll * 0.1}px)`;
      });
    };

    leftBtn.addEventListener('click', () => {
      const scrollAmount = inReleaseScroll.clientWidth * 0.9;
      inReleaseScroll.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
    });

    rightBtn.addEventListener('click', () => {
      const scrollAmount = inReleaseScroll.clientWidth * 0.9;
      inReleaseScroll.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    });

    inReleaseScroll.addEventListener('scroll', updateProgressBar);

    // Add keyboard navigation
    document.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft') {
        leftBtn.click();
      } else if (e.key === 'ArrowRight') {
        rightBtn.click();
      }
    });

    // Add touch/swipe support for mobile
    let startX = 0;
    let scrollLeft = 0;

    inReleaseScroll.addEventListener('touchstart', (e) => {
      startX = e.touches[0].pageX - inReleaseScroll.offsetLeft;
      scrollLeft = inReleaseScroll.scrollLeft;
    });

    inReleaseScroll.addEventListener('touchmove', (e) => {
      const x = e.touches[0].pageX - inReleaseScroll.offsetLeft;
      const walk = (x - startX) * 2;
      inReleaseScroll.scrollLeft = scrollLeft - walk;
    });

    // Initialize progress bar
    updateProgressBar();

    // Add hover effects to movie cards
    const movieCards = inReleaseScroll.querySelectorAll(
      '.in-release-movie-card'
    );
    movieCards.forEach((movie) => {
      movie.addEventListener('mouseenter', () => {
        movie.style.zIndex = '10';
      });

      movie.addEventListener('mouseleave', () => {
        movie.style.zIndex = '1';
      });
    });
  }

  // Handle existing scroll buttons for backward compatibility
  const buttons = document.querySelectorAll('.scroll-btn');
  buttons.forEach((btn) => {
    const direction = btn.getAttribute('data-direction') === 'left' ? -1 : 1;
    const target = document.querySelector(btn.getAttribute('data-target'));
    if (!target) return;
    btn.addEventListener('click', () => {
      const scrollAmount = target.clientWidth * 0.8 * direction;
      target.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    });
  });
}

function initThumbnailModal() {
  const modalEl = document.getElementById('movieModal');
  if (!modalEl || !window.bootstrap?.Modal) return;

  const modal = new bootstrap.Modal(modalEl, {
    focus: true,
    keyboard: true,
    backdrop: true,
  });
  const titleEl = document.getElementById('movieModalLabel');
  const metaEl = document.getElementById('movieModalMeta');
  const imgEl = document.getElementById('movieModalImg');
  const synopsisEl = document.getElementById('movieModalSynopsis');
  const directorEl = document.getElementById('movieModalDirector');
  const castEl = document.getElementById('movieModalCast');
  const runtimeEl = document.getElementById('movieModalRuntime');
  const closeBtn = document.getElementById('movieModalClose');

  // Close button handler
  if (closeBtn) {
    closeBtn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      modal.hide();
    });
  }

  // Handle both old thumbnail-card and new in-release-movie-card
  document
    .querySelectorAll('.thumbnail-card, .in-release-movie-card')
    .forEach((card) => {
      card.addEventListener('click', (e) => {
        // Don't open modal if clicking on buttons
        if (
          e.target.classList.contains('in-release-btn') ||
          e.target.closest('.in-release-btn')
        ) {
          return;
        }

        const title = card.dataset.title || 'Untitled';
        const year = card.dataset.year || '';
        const runtime = card.dataset.runtime || '';
        const genre = card.dataset.genre || '';
        const director = card.dataset.director || '';
        const cast = card.dataset.cast || '';
        const synopsis = card.dataset.synopsis || '';
        const img =
          card.dataset.img || card.querySelector('img')?.dataset.src || '';

        titleEl.textContent = title;
        metaEl.textContent = [year, runtime, genre].filter(Boolean).join(' • ');
        synopsisEl.textContent = synopsis || 'No synopsis available.';
        directorEl.textContent = director || 'N/A';
        castEl.textContent = cast || 'N/A';
        runtimeEl.textContent = runtime || 'N/A';
        if (img) {
          imgEl.src = img;
          imgEl.alt = `${title} poster`;
        }

        modal.show();
      });
    });
}

function initFilterPills() {
  const pills = document.querySelectorAll('.filter-pill');
  const cards = document.querySelectorAll('.release-card');
  if (!pills.length || !cards.length) return;

  pills.forEach((pill) => {
    pill.addEventListener('click', () => {
      pills.forEach((p) => p.classList.remove('active'));
      pill.classList.add('active');
      const filter = pill.getAttribute('data-filter');

      cards.forEach((card) => {
        const categories = (card.getAttribute('data-category') || '').split(
          ' '
        );
        const shouldShow = filter === 'all' || categories.includes(filter);
        card.parentElement.style.display = shouldShow ? '' : 'none';
      });
    });
  });
}

function animateCounters() {
  const counters = document.querySelectorAll('.stat-number');
  const speed = 300; // Animation speed

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const counter = entry.target;
          const target = parseInt(counter.getAttribute('data-target'));
          const increment = target / speed;

          const updateCounter = () => {
            const current = parseInt(counter.innerText);

            if (current < target) {
              counter.innerText = Math.ceil(current + increment);
              setTimeout(updateCounter, 10);
            } else {
              counter.innerText = target + '+';
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
    '.fade-in, .fade-in-up, .scroll-fade-in, .scroll-slide-left, .scroll-slide-right, .scroll-scale-in, .scroll-rotate-in'
  );
  if (!animated.length) return;

  const reveal = (el) => {
    el.classList.add('is-visible');
    el.classList.add('visible');
  };

  if ('IntersectionObserver' in window) {
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
        rootMargin: '80px',
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
  const form = document.getElementById('contactForm');
  const status = document.getElementById('formStatus');
  if (!form || !status) return;

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const formData = new FormData(form);
    const values = Object.fromEntries(formData.entries());
    const hasEmpty = Object.values(values).some(
      (value) => !String(value).trim()
    );

    if (hasEmpty) {
      status.textContent = 'Please complete all fields before sending.';
      status.style.color = '#f5a623';
      return;
    }

    status.textContent = 'Thanks! Your message has been recorded.';
    status.style.color = '#38d36f';
    form.reset();
  });
}

function initFooterYear() {
  const yearEl = document.getElementById('yearNow');
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }
}
