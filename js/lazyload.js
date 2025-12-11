export function setupLazyLoading(selector = ".lazy") {
  const images = Array.from(document.querySelectorAll(selector));
  if (!images.length) return;

  const loadImage = (img) => {
    const src = img.dataset.src;
    if (!src) return;
    img.src = src;
    img.addEventListener(
      "load",
      () => {
        img.classList.add("is-loaded");
        img.removeAttribute("data-src");
      },
      { once: true }
    );
  };

  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            loadImage(entry.target);
            observer.unobserve(entry.target);
          }
        });
      },
      { rootMargin: "150px" }
    );

    images.forEach((img) => observer.observe(img));
  } else {
    images.forEach((img) => loadImage(img));
  }
}
