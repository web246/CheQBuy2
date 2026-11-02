'use strict';

const PRODUCTS = [
  { id: 'iphone', name: 'iPhone 16 Pro', price: 103071, origin: 'China', category: 'Electronics', image: 'iphone.jpg', supplier: 'GlobalTech Supplies' },
  { id: 'galaxy', name: 'Galaxy A55 5G', price: 42441, origin: 'China', category: 'Electronics', image: 'galaxy.jpg', supplier: 'Shenzhen Mobile Co.' },
  { id: 'pump', name: 'Solar Water Pump 2HP', price: 59340, origin: 'India', category: 'Machinery', image: 'pump.jpg', supplier: 'Sunflow Industries' },
  { id: 'nike', name: 'Nike Dunk Low Retro Panda', price: 5000, origin: 'Kenya', category: 'Fashion & Textiles', image: 'nike.jpg', supplier: 'Nairobi Sneaker Hub' },
  { id: 'sofa', name: '3-Seater Fabric Sofa', price: 54180, origin: 'China', category: 'Home & Living', image: 'sofa.jpg', supplier: 'Foshan Home Co.' },
  { id: 'coffee', name: 'Arabica Coffee Beans AA', price: 877, origin: 'Kenya', category: 'Agricultural Products', image: 'coffee.jpg', supplier: 'Rift Valley Growers' },
  { id: 'leather', name: 'Handmade Leather Bags', price: 4902, origin: 'Ethiopia', category: 'Fashion & Textiles', image: 'leather.jpg', supplier: 'Addis Leather Works' },
  { id: 'tea', name: 'Kenyan Black Tea (CTC)', price: 413, origin: 'Kenya', category: 'Agricultural Products', image: 'tea.jpg', supplier: 'Kericho Tea Estates' },
  { id: 'lenovo', name: 'Lenovo Laptop', price: 35000, origin: 'Kenya', category: 'Electronics', image: 'lenovo.jpg', supplier: 'Nairobi Tech Mart' },
  { id: 's26', name: 'Samsung S26', price: 126000, origin: 'Kenya', category: 'Electronics', image: 's26.jpg', supplier: 'Nairobi Tech Mart' },
  { id: 'macm3', name: 'MacBook Air 13" M3', price: 135321, origin: 'China', category: 'Electronics', image: 'macm3.jpg', supplier: 'GlobalTech Supplies' },
  { id: 'air', name: 'MacBook Air', price: 100000, origin: 'Kenya', category: 'Electronics', image: 'air.jpg', supplier: 'Nairobi Tech Mart' },
  { id: 'redmi', name: 'Redmi Note 15', price: 445000, origin: 'Kenya', category: 'Electronics', image: 'redmi.jpg', supplier: 'Nairobi Tech Mart' },
  { id: 'cookware', name: 'Stainless Cookware Set', price: 7800, origin: 'China', category: 'Home & Living', image: 'cookware.jpg', supplier: 'Yongkang Kitchenware' },
  { id: 'generator', name: 'Diesel Generator 10kVA', price: 277350, origin: 'Turkey', category: 'Machinery', image: 'generator.jpg', supplier: 'Istanbul Power Systems' },
  { id: 'kitenge', name: 'Kitenge Cotton Fabric', price: 581, origin: 'Nigeria', category: 'Fashion & Textiles', image: 'kitenge.jpg', supplier: 'Lagos Textile House' }
];

const STORAGE = { cart: 'cheqbuy-store-cart', wishlist: 'cheqbuy-store-wishlist' };
const signInUrl = 'https://chiche.savannahsystems.uk/login?redirect=/orders';
const productGrid = document.querySelector('#productGrid');
const wishlistGrid = document.querySelector('#wishlistGrid');
const cartList = document.querySelector('#cartList');
const homeFeaturedGrid = document.querySelector('#homeFeaturedGrid');
const spotlightProduct = document.querySelector('#homeSpotlightProduct');
const spotlightDots = document.querySelector('#spotlightDots');
const toast = document.querySelector('#storeToast');
const views = {
  home: document.querySelector('#homeView'),
  shop: document.querySelector('#catalogView'),
  wishlist: document.querySelector('#wishlistView'),
  cart: document.querySelector('#cartView')
};
let activeView = ['shop', 'wishlist', 'cart'].includes(location.hash.slice(1)) ? location.hash.slice(1) : 'home';
let activeCategory = 'All products';
let searchTerm = '';
let toastTimer;
const featuredProducts = ['iphone', 'coffee', 'kitenge', 'pump'].map(getProduct);
let activeSpotlight = 0;

function readStorage(key, fallback) {
  try {
    const value = localStorage.getItem(key);
    if (!value) return fallback;
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : fallback;
  } catch (error) {
    console.error(`Unable to read ${key} from local storage.`, error);
    return fallback;
  }
}

let cart = readStorage(STORAGE.cart, []).filter(item =>
  item && PRODUCTS.some(product => product.id === item.id) &&
  Number.isInteger(item.quantity) && item.quantity > 0
);
let wishlist = readStorage(STORAGE.wishlist, []).filter(id =>
  typeof id === 'string' && PRODUCTS.some(product => product.id === id)
);

function saveStorage(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Unable to save ${key} to local storage.`, error);
    showToast('We could not save this change in your browser.');
  }
}

function money(amount) {
  return `KES ${new Intl.NumberFormat('en-KE', { maximumFractionDigits: 0 }).format(amount)}`;
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, char => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  })[char]);
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add('visible');
  window.clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => toast.classList.remove('visible'), 2600);
}

function getProduct(id) {
  return PRODUCTS.find(product => product.id === id);
}

function productCard(product) {
  const saved = wishlist.includes(product.id);
  return `<article class="product-card">
    <div class="product-image">
      <img src="img/${product.image}" alt="${escapeHtml(product.name)}" loading="lazy">
      <button class="save-button${saved ? ' is-saved' : ''}" type="button" data-action="wishlist" data-id="${product.id}" aria-label="${saved ? 'Remove' : 'Save'} ${escapeHtml(product.name)} ${saved ? 'from' : 'to'} wishlist" aria-pressed="${saved}">
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8l1 1.1L12 21l7.8-7.5 1-1.1a5.5 5.5 0 0 0 0-7.8z"/></svg>
      </button>
      <span class="product-origin">${escapeHtml(product.origin)}</span>
    </div>
    <div class="product-info">
      <span class="product-category">${escapeHtml(product.category)}</span>
      <h3>${escapeHtml(product.name)}</h3>
      <p class="product-supplier">From ${escapeHtml(product.supplier)}</p>
      <div class="product-card-bottom"><b>${money(product.price)}</b><button type="button" class="add-button" data-action="add" data-id="${product.id}" aria-label="Add ${escapeHtml(product.name)} to cart">+</button></div>
    </div>
  </article>`;
}

function renderCategories() {
  const categories = ['All products', ...new Set(PRODUCTS.map(product => product.category))];
  document.querySelector('#categoryList').innerHTML = categories.map(category =>
    `<button class="category-chip${activeCategory === category ? ' active' : ''}" type="button" data-category="${escapeHtml(category)}" aria-pressed="${activeCategory === category}">${escapeHtml(category)}</button>`
  ).join('');
}

function renderCatalog() {
  const filtered = PRODUCTS.filter(product => {
    const matchesCategory = activeCategory === 'All products' || product.category === activeCategory;
    const query = searchTerm.toLowerCase();
    const matchesSearch = !query || `${product.name} ${product.category} ${product.origin} ${product.supplier}`.toLowerCase().includes(query);
    return matchesCategory && matchesSearch;
  });
  productGrid.innerHTML = filtered.map(productCard).join('');
  document.querySelector('#catalogEmpty').hidden = filtered.length !== 0;
  document.querySelector('#resultCount').textContent = `${filtered.length} ${filtered.length === 1 ? 'product' : 'products'}`;
}

function renderHome() {
  const product = featuredProducts[activeSpotlight];
  spotlightProduct.innerHTML = `
    <div class="spotlight-image-wrap"><img src="img/${product.image}" alt="${escapeHtml(product.name)}" loading="eager"></div>
    <div class="spotlight-details">
      <span class="spotlight-kicker">${escapeHtml(product.category)} <i></i> ${escapeHtml(product.origin)}</span>
      <h3>${escapeHtml(product.name)}</h3>
      <div class="spotlight-bottom"><b>${money(product.price)}</b><button type="button" class="spotlight-add" data-action="add" data-id="${product.id}">Add to cart <span aria-hidden="true">＋</span></button></div>
    </div>`;
  spotlightProduct.setAttribute('role', 'group');
  spotlightProduct.setAttribute('aria-roledescription', 'slide');
  spotlightProduct.setAttribute('aria-label', `Featured product ${activeSpotlight + 1} of ${featuredProducts.length}: ${product.name}`);
  spotlightDots.innerHTML = featuredProducts.map((item, index) =>
    `<button type="button" class="spotlight-dot${index === activeSpotlight ? ' is-active' : ''}" aria-label="Show ${escapeHtml(item.name)}" aria-current="${index === activeSpotlight}"></button>`
  ).join('');
  homeFeaturedGrid.innerHTML = featuredProducts.map(productCard).join('');
}

function showSpotlight(index) {
  activeSpotlight = (index + featuredProducts.length) % featuredProducts.length;
  renderHome();
}

function renderWishlist() {
  const products = wishlist.map(getProduct).filter(Boolean);
  wishlistGrid.innerHTML = products.map(productCard).join('');
  document.querySelector('#wishlistEmpty').hidden = products.length !== 0;
  document.querySelector('#wishlistCount').textContent = `${products.length} saved`;
}

function renderCart() {
  const validItems = cart.map(item => ({ ...item, product: getProduct(item.id) })).filter(item => item.product);
  const itemCount = validItems.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = validItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  cartList.innerHTML = validItems.map(({ product, quantity }) => `
    <article class="cart-item">
      <img src="img/${product.image}" alt="${escapeHtml(product.name)}" loading="lazy">
      <div class="cart-item-info"><span>${escapeHtml(product.category)}</span><h3>${escapeHtml(product.name)}</h3><small>${escapeHtml(product.origin)} · ${escapeHtml(product.supplier)}</small><b>${money(product.price)}</b></div>
      <div class="cart-item-actions">
        <div class="quantity-control"><button type="button" data-action="decrease" data-id="${product.id}" aria-label="Decrease ${escapeHtml(product.name)} quantity">−</button><span>${quantity}</span><button type="button" data-action="increase" data-id="${product.id}" aria-label="Increase ${escapeHtml(product.name)} quantity">+</button></div>
        <button type="button" class="remove-button" data-action="remove" data-id="${product.id}">Remove</button>
      </div>
    </article>`).join('');
  document.querySelector('#cartEmpty').hidden = validItems.length !== 0;
  document.querySelector('.cart-layout').hidden = validItems.length === 0;
  document.querySelector('#cartItemsTotal').textContent = String(itemCount);
  document.querySelector('#cartSubtotal').textContent = money(subtotal);
  document.querySelector('#cartCountLabel').textContent = `${itemCount} ${itemCount === 1 ? 'item' : 'items'}`;
  document.querySelector('#checkoutButton').disabled = itemCount === 0;
}

function renderBadges() {
  const savedCount = wishlist.length;
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const wishlistBadge = document.querySelector('#wishlistBadge');
  const cartBadge = document.querySelector('#cartBadge');
  wishlistBadge.hidden = savedCount === 0;
  wishlistBadge.textContent = String(savedCount);
  cartBadge.hidden = cartCount === 0;
  cartBadge.textContent = String(cartCount);
  document.querySelector('[data-view="wishlist"]').setAttribute('aria-label', `View wishlist${savedCount ? `, ${savedCount} saved` : ''}`);
  document.querySelector('[data-view="cart"]').setAttribute('aria-label', `View cart${cartCount ? `, ${cartCount} items` : ''}`);
}

function renderView() {
  document.body.dataset.storeView = activeView;
  Object.entries(views).forEach(([name, element]) => {
    const active = name === activeView;
    element.hidden = !active;
    element.setAttribute('aria-hidden', String(!active));
  });
  document.querySelectorAll('.orb-link[data-view]').forEach(button => {
    const active = button.dataset.view === activeView;
    button.classList.toggle('active', active);
    button.setAttribute('aria-current', active ? 'page' : 'false');
  });
  const isHome = activeView === 'home';
  const isShop = activeView === 'shop';
  const homeView = document.querySelector('#homeView');
  homeView.classList.remove('is-entering');
  if (isHome) {
    void homeView.offsetWidth;
    homeView.classList.add('is-entering');
  }
  document.querySelector('#catalogTools').hidden = !isShop;
  document.querySelector('#viewTitle').innerHTML = isHome ? 'Welcome to<br><em>CheQBuy.</em>' :
    isShop ? 'Find what moves<br><em>your business.</em>' :
      activeView === 'wishlist' ? 'The good finds,<br><em>all in one place.</em>' : 'Your next order,<br><em>starts here.</em>';
  document.querySelector('#viewSubtitle').textContent = isShop
    ? 'Explore products from trusted trade categories. Add your picks to a list, then sign in with CheQBuy to place an order.'
    : isHome ? 'Explore products for your business, home and everyday.'
      : activeView === 'wishlist'
        ? 'Keep track of products you’re interested in and come back to them anytime.'
        : 'Review your selected products and continue to secure CheQBuy checkout when you’re ready.';
  document.querySelector('.store-promise').innerHTML = isHome
    ? '<span aria-hidden="true">✓</span><span>Made for easy discovery<small>Shop across five product categories.</small></span>'
    : '<span aria-hidden="true">✓</span><span>Trade with confidence<small>One platform for your next opportunity.</small></span>';
  document.querySelector('#catalogEyebrow').textContent = isShop ? 'MADE FOR YOUR BUSINESS' : '';
  renderHome();
  renderCatalog();
  renderWishlist();
  renderCart();
  renderBadges();
  document.title = `${isHome ? 'Home' : isShop ? 'Shop' : activeView === 'wishlist' ? 'Wishlist' : 'Cart'} CheQBuy | African Trade`;
}

function setView(view) {
  if (!views[view]) return;
  activeView = view;
  if (location.hash !== `#${view}`) history.replaceState(null, '', `#${view}`);
  renderView();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function persistCart() {
  saveStorage(STORAGE.cart, cart);
  renderCart();
  renderBadges();
}

function addToCart(id) {
  const item = cart.find(entry => entry.id === id);
  if (item) item.quantity += 1;
  else cart.push({ id, quantity: 1 });
  persistCart();
  showToast(`${getProduct(id).name} added to your cart.`);
}

function toggleWishlist(id) {
  const product = getProduct(id);
  if (wishlist.includes(id)) {
    wishlist = wishlist.filter(savedId => savedId !== id);
    showToast(`${product.name} removed from your wishlist.`);
  } else {
    wishlist.push(id);
    showToast(`${product.name} saved to your wishlist.`);
  }
  saveStorage(STORAGE.wishlist, wishlist);
  renderCatalog();
  renderWishlist();
  renderBadges();
}

function updateQuantity(id, amount) {
  const item = cart.find(entry => entry.id === id);
  if (!item) return;
  item.quantity += amount;
  if (item.quantity <= 0) cart = cart.filter(entry => entry.id !== id);
  persistCart();
}

function openCheckout() {
  if (!cart.length) return;
  document.querySelector('#signinDialog').showModal();
}

document.querySelector('#productSearch').addEventListener('input', event => {
  searchTerm = event.target.value.trim();
  renderCatalog();
});

document.querySelector('#homeSearchForm').addEventListener('submit', event => {
  event.preventDefault();
  searchTerm = document.querySelector('#homeSearch').value.trim();
  document.querySelector('#productSearch').value = searchTerm;
  activeCategory = 'All products';
  renderCategories();
  setView('shop');
});

document.querySelector('#spotlightPrev').addEventListener('click', () => showSpotlight(activeSpotlight - 1));
document.querySelector('#spotlightNext').addEventListener('click', () => showSpotlight(activeSpotlight + 1));
spotlightDots.addEventListener('click', event => {
  const dot = event.target.closest('.spotlight-dot');
  if (dot) showSpotlight([...spotlightDots.children].indexOf(dot));
});
document.querySelector('#homeSpotlight').addEventListener('keydown', event => {
  if (event.key === 'ArrowLeft') showSpotlight(activeSpotlight - 1);
  if (event.key === 'ArrowRight') showSpotlight(activeSpotlight + 1);
});
let spotlightTouchStart;
document.querySelector('#homeSpotlight').addEventListener('pointerdown', event => {
  spotlightTouchStart = event.clientX;
});
document.querySelector('#homeSpotlight').addEventListener('pointerup', event => {
  if (spotlightTouchStart === undefined) return;
  const delta = event.clientX - spotlightTouchStart;
  spotlightTouchStart = undefined;
  if (Math.abs(delta) > 45) showSpotlight(activeSpotlight + (delta < 0 ? 1 : -1));
});
document.querySelector('#homeSpotlight').addEventListener('pointercancel', () => {
  spotlightTouchStart = undefined;
});

document.querySelector('#categoryList').addEventListener('click', event => {
  const button = event.target.closest('[data-category]');
  if (!button) return;
  activeCategory = button.dataset.category;
  renderCategories();
  renderCatalog();
});

document.addEventListener('click', event => {
  const homeCategory = event.target.closest('[data-home-category]');
  if (homeCategory) {
    activeCategory = homeCategory.dataset.homeCategory;
    renderCategories();
    setView('shop');
    return;
  }
  const viewButton = event.target.closest('[data-view]');
  if (viewButton) {
    setView(viewButton.dataset.view);
    return;
  }
  const button = event.target.closest('[data-action]');
  if (!button) return;
  const { action, id } = button.dataset;
  if (action === 'add') addToCart(id);
  if (action === 'wishlist') toggleWishlist(id);
  if (action === 'increase') updateQuantity(id, 1);
  if (action === 'decrease') updateQuantity(id, -1);
  if (action === 'remove') {
    cart = cart.filter(item => item.id !== id);
    persistCart();
    showToast('Product removed from your cart.');
  }
});

document.querySelector('#checkoutButton').addEventListener('click', openCheckout);
document.querySelector('#closeDialog').addEventListener('click', () => document.querySelector('#signinDialog').close());
document.querySelector('#cancelDialog').addEventListener('click', () => document.querySelector('#signinDialog').close());
document.querySelector('.dialog-signin').href = signInUrl;
renderCategories();
renderView();
