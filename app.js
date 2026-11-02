'use strict';

const appScreens = [
  ['app-gallery/app-splash.jpeg', 'Welcome', 'CheQBuy app welcome screen'],
  ['app-gallery/app-trade-partner.jpeg', 'Trade partner', 'CheQBuy app trade partner introduction'],
  ['app-gallery/app-verified-suppliers.jpeg', 'Verified suppliers', 'CheQBuy app verified suppliers screen'],
  ['app-gallery/app-track-shipment.jpeg', 'Track shipment', 'CheQBuy app shipment tracking screen'],
  ['app-gallery/app-shipping-rates.jpeg', 'Shipping rates', 'CheQBuy app shipping rates screen'],
  ['app-gallery/app-home.jpeg', 'Home', 'CheQBuy app home screen'],
  ['app-gallery/app-home-products.jpeg', 'Featured products', 'CheQBuy app featured products screen'],
  ['app-gallery/app-more.jpeg', 'More services', 'CheQBuy app more services screen'],
  ['app-gallery/app-verify-number.jpeg', 'Verify number', 'CheQBuy app phone verification screen'],
  ['app-gallery/app-login.jpeg', 'Log in', 'CheQBuy app login screen']
];

const track = document.querySelector('#appTrack');
const count = document.querySelector('#appCount');
const dots = document.querySelector('#appDots');
const carousel = document.querySelector('#appCarousel');
let currentScreen = 0;

function showScreen(index) {
  currentScreen = (index + appScreens.length) % appScreens.length;
  const half = Math.floor(appScreens.length / 2);
  const [, activeLabel, activeAlt] = appScreens[currentScreen];
  track.setAttribute('aria-label', `Screen ${currentScreen + 1} of ${appScreens.length}: ${appScreens[currentScreen][1]}`);
  [...track.children].forEach((card, cardIndex) => {
    let offset = cardIndex - currentScreen;
    if (offset > half) offset -= appScreens.length;
    if (offset < -half) offset += appScreens.length;
    const position = offset === 0 ? 'active' : Math.abs(offset) === 1 ? `near-${offset < 0 ? 'left' : 'right'}` : Math.abs(offset) === 2 ? `far-${offset < 0 ? 'left' : 'right'}` : 'hidden';
    const active = offset === 0;
    card.dataset.position = position;
    card.setAttribute('aria-current', active ? 'step' : 'false');
    card.setAttribute('aria-hidden', Math.abs(offset) > 2 ? 'true' : 'false');
    card.setAttribute('aria-label', `Show ${appScreens[cardIndex][1]} app screen${active ? ', current screen' : ''}`);
    card.tabIndex = active ? 0 : -1;
    card.querySelector('img').loading = Math.abs(offset) <= 1 ? 'eager' : 'lazy';
  });
  carousel.setAttribute('aria-label', `CheQBuy app screens. Current screen: ${activeLabel}`);
  count.textContent = `${String(currentScreen + 1).padStart(2, '0')} / ${String(appScreens.length).padStart(2, '0')}`;
  [...dots.children].forEach((dot, dotIndex) => {
    const active = dotIndex === currentScreen;
    dot.classList.toggle('active', active);
    dot.setAttribute('aria-current', active ? 'true' : 'false');
  });
}

appScreens.forEach(([image, label, alt], index) => {
  const card = document.createElement('button');
  card.type = 'button';
  card.className = 'screen-card';
  card.dataset.index = String(index);
  card.dataset.position = 'hidden';
  card.setAttribute('aria-label', `Show ${label} app screen`);
  card.setAttribute('aria-hidden', 'true');
  card.tabIndex = -1;
  card.innerHTML = `<span class="screen-card-image"><img src="img/${image}" alt="${alt}" loading="${index < 3 ? 'eager' : 'lazy'}"></span><span class="screen-card-label"><small>CHEQBUY APP · ${String(index + 1).padStart(2, '0')}</small><b>${label}</b></span>`;
  card.addEventListener('click', () => showScreen(index));
  track.append(card);

  const dot = document.createElement('button');
  dot.type = 'button';
  dot.className = 'carousel-dot';
  dot.setAttribute('aria-label', `Show ${label} screen`);
  dot.addEventListener('click', () => showScreen(index));
  dots.append(dot);
});

document.querySelector('#appPrev').addEventListener('click', () => showScreen(currentScreen - 1));
document.querySelector('#appNext').addEventListener('click', () => showScreen(currentScreen + 1));
carousel.addEventListener('keydown', event => {
  if (event.key === 'ArrowLeft') showScreen(currentScreen - 1);
  if (event.key === 'ArrowRight') showScreen(currentScreen + 1);
});
showScreen(0);

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
