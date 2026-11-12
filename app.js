'use strict';

document.documentElement.classList.add('js');

const revealGroups = [
  '.hero-copy > *, .hero-visual',
  '.intro-band .proof-item',
  '.journey-intro > *, .prompt-cloud, .journey-cta',
  '.journey-step',
  '.section-heading > *, .service-card',
  '.app-copy > *:not(.visually-hidden), .app-carousel',
  '.questions-heading > *, .faq-item',
  '.contact-inner > *',
  '.footer-main > *, .footer-bottom'
];
const revealTargets = new Set();
revealGroups.forEach(selector => {
  document.querySelectorAll(selector).forEach((element, index) => {
    element.classList.add('reveal-on-scroll');
    element.style.setProperty('--reveal-delay', `${index * 75}ms`);
    revealTargets.add(element);
  });
});

if ('IntersectionObserver' in window && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  const revealObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-visible');
      revealObserver.unobserve(entry.target);
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -6% 0px' });
  revealTargets.forEach(element => revealObserver.observe(element));
} else {
  revealTargets.forEach(element => element.classList.add('is-visible'));
}

const appScreens = [
  ['app-gallery/site-welcome.webp', 'Welcome', 'CheQBuy app welcome screen with supplier, payment and delivery features'],
  ['app-gallery/site-home.webp', 'Home', 'CheQBuy app home screen with product search and quick actions'],
  ['app-gallery/site-shop.webp', 'Shop', 'CheQBuy app shop screen with verified sellers and product prices'],
  ['app-gallery/site-shipping.webp', 'Shipping options', 'CheQBuy app air, sea and express shipping options']
];

const carouselRegion = document.querySelector('#appCarousel');
const carouselControls = document.querySelector('#appCarouselControls');
const screenImage = document.querySelector('#appScreenImage');
const count = document.querySelector('#appCount');
const dots = document.querySelector('#appDots');
const announcement = document.querySelector('#appScreenAnnouncement');
const playToggle = document.querySelector('#appTogglePlay');
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const screenPreloads = appScreens.map(([image]) => {
  const preload = new Image();
  preload.src = `img/${image}`;
  return preload;
});
const autoAdvanceDelay = 3600;
let currentScreen = -1;
let imageRequest = 0;
let autoAdvanceTimer = null;
let manuallyPaused = false;

function showScreen(index, { animate = true, announce = false } = {}) {
  currentScreen = (index + appScreens.length) % appScreens.length;
  const [image, label, alt] = appScreens[currentScreen];
  const request = ++imageRequest;
  const updateImage = () => {
    if (request !== imageRequest) return;

    if (animate && !reducedMotion.matches) {
      screenImage.classList.add('is-changing');
      window.setTimeout(() => {
        if (request !== imageRequest) return;
        screenImage.src = `img/${image}`;
        screenImage.alt = alt;
        window.requestAnimationFrame(() => screenImage.classList.remove('is-changing'));
      }, 130);
    } else {
      screenImage.classList.remove('is-changing');
      screenImage.src = `img/${image}`;
      screenImage.alt = alt;
    }
  };
  const preload = screenPreloads[currentScreen];

  if (preload.complete) {
    if (preload.naturalWidth) {
      updateImage();
    } else {
      console.error(`Unable to load CheQBuy app screen: ${preload.src}`);
    }
  } else {
    preload.addEventListener('load', updateImage, { once: true });
    preload.addEventListener('error', () => {
      if (request === imageRequest) console.error(`Unable to load CheQBuy app screen: ${preload.src}`);
    }, { once: true });
  }

  const screenPosition = `${String(currentScreen + 1).padStart(2, '0')} / ${String(appScreens.length).padStart(2, '0')}`;
  count.textContent = screenPosition;
  carouselRegion.setAttribute('aria-label', `CheQBuy app screens. ${label}, screen ${screenPosition}`);
  if (announce) announcement.textContent = `${label}, screen ${screenPosition}`;

  [...dots.children].forEach((dot, dotIndex) => {
    const active = dotIndex === currentScreen;
    dot.classList.toggle('active', active);
    dot.setAttribute('aria-current', active ? 'true' : 'false');
  });
}

appScreens.forEach(([image, label], index) => {
  const dot = document.createElement('button');
  dot.type = 'button';
  dot.className = 'carousel-dot';
  dot.setAttribute('aria-label', `Show ${label} screen`);
  dot.addEventListener('click', () => changeScreen(index));
  dots.append(dot);
});

function stopAutoAdvance() {
  window.clearInterval(autoAdvanceTimer);
  autoAdvanceTimer = null;
}

function startAutoAdvance() {
  const carouselFocused = carouselRegion.contains(document.activeElement) || carouselControls.contains(document.activeElement);
  if (autoAdvanceTimer !== null || manuallyPaused || reducedMotion.matches || document.hidden
    || carouselRegion.matches(':hover') || carouselControls.matches(':hover') || carouselFocused) return;
  autoAdvanceTimer = window.setInterval(() => showScreen(currentScreen + 1), autoAdvanceDelay);
}

function syncAutoAdvance() {
  stopAutoAdvance();
  const motionDisabled = reducedMotion.matches;
  playToggle.disabled = motionDisabled;
  playToggle.setAttribute('aria-label', motionDisabled
    ? 'Automatic screen changes are disabled by your reduced motion setting'
    : manuallyPaused ? 'Play automatic screen changes' : 'Pause automatic screen changes');
  playToggle.setAttribute('aria-pressed', String(manuallyPaused));
  playToggle.textContent = manuallyPaused ? '▶' : 'Ⅱ';
  startAutoAdvance();
}

function changeScreen(index) {
  showScreen(index, { announce: true });
  syncAutoAdvance();
}

document.querySelector('#appPrev').addEventListener('click', () => changeScreen(currentScreen - 1));
document.querySelector('#appNext').addEventListener('click', () => changeScreen(currentScreen + 1));
playToggle.addEventListener('click', () => {
  manuallyPaused = !manuallyPaused;
  syncAutoAdvance();
});
carouselRegion.addEventListener('keydown', event => {
  if (event.key === 'ArrowLeft') changeScreen(currentScreen - 1);
  if (event.key === 'ArrowRight') changeScreen(currentScreen + 1);
});
carouselRegion.addEventListener('pointerenter', stopAutoAdvance);
carouselRegion.addEventListener('pointerleave', startAutoAdvance);
carouselControls.addEventListener('pointerenter', stopAutoAdvance);
carouselControls.addEventListener('pointerleave', startAutoAdvance);
carouselRegion.addEventListener('focusin', stopAutoAdvance);
carouselRegion.addEventListener('focusout', event => {
  if (!carouselRegion.contains(event.relatedTarget)) startAutoAdvance();
});
carouselControls.addEventListener('focusin', stopAutoAdvance);
carouselControls.addEventListener('focusout', event => {
  if (!carouselControls.contains(event.relatedTarget)) startAutoAdvance();
});
document.addEventListener('visibilitychange', syncAutoAdvance);
reducedMotion.addEventListener('change', syncAutoAdvance);
showScreen(0, { animate: false });
syncAutoAdvance();

const menuToggle = document.querySelector('#menuToggle');
const siteNav = document.querySelector('#siteNav');

menuToggle.addEventListener('click', () => {
  const isOpen = menuToggle.getAttribute('aria-expanded') === 'true';
  menuToggle.setAttribute('aria-expanded', String(!isOpen));
  menuToggle.setAttribute('aria-label', isOpen ? 'Open navigation' : 'Close navigation');
  siteNav.classList.toggle('is-open', !isOpen);
});

siteNav.addEventListener('click', event => {
  if (event.target.closest('a')) {
    menuToggle.setAttribute('aria-expanded', 'false');
    menuToggle.setAttribute('aria-label', 'Open navigation');
    siteNav.classList.remove('is-open');
  }
});
