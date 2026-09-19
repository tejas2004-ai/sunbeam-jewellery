const selectors = {
  menu: document.querySelector('[data-menu-panel]'),
  cart: document.querySelector('[data-cart-panel]'),
  search: document.querySelector('[data-search-overlay]'),
  scrim: document.querySelector('[data-scrim]'),
  toast: document.querySelector('[data-toast]'),
  cartItems: document.querySelector('[data-cart-items]'),
  cartTotal: document.querySelector('[data-cart-total]'),
  cartCount: document.querySelector('[data-cart-count]'),
  panelCount: document.querySelector('[data-cart-panel-count]')
};

let cart = [];
let toastTimer;

// The original hero is local to the project. It prevents an empty visual panel
// if a remote editorial image is unavailable on a visitor's connection.
document.querySelectorAll('img').forEach(image => {
  image.addEventListener('error', () => {
    if (image.dataset.fallbackApplied) return;
    image.dataset.fallbackApplied = 'true';
    image.classList.add('image-fallback');
    image.src = 'assets/isharya-hero-campaign.png';
  });
});

function toggleScrim(isVisible) {
  selectors.scrim.classList.toggle('is-visible', isVisible);
}

function closePanels() {
  [selectors.menu, selectors.cart].forEach(panel => {
    panel.classList.remove('is-open');
    panel.setAttribute('aria-hidden', 'true');
  });
  toggleScrim(false);
}

function openPanel(panel) {
  closePanels();
  panel.classList.add('is-open');
  panel.setAttribute('aria-hidden', 'false');
  toggleScrim(true);
}

function showToast(message) {
  clearTimeout(toastTimer);
  selectors.toast.textContent = message;
  selectors.toast.classList.add('is-visible');
  toastTimer = setTimeout(() => selectors.toast.classList.remove('is-visible'), 2800);
}

function parsePrice(price) {
  return Number(price.replace(/[^0-9]/g, '')) || 0;
}

function formatPrice(price) {
  return `₹${new Intl.NumberFormat('en-IN').format(price)}`;
}

function renderCart() {
  const total = cart.reduce((sum, item) => sum + item.price, 0);
  const count = cart.length;
  selectors.cartCount.textContent = count;
  selectors.panelCount.textContent = `(${count})`;
  selectors.cartTotal.textContent = formatPrice(total);

  if (!count) {
    selectors.cartItems.innerHTML = '<div class="empty-cart"><span>◌</span><p>Your bag is waiting for a little sparkle.</p><button class="text-link" data-close-panel>Continue shopping <i>↗</i></button></div>';
    selectors.cartItems.querySelector('[data-close-panel]').addEventListener('click', closePanels);
    return;
  }

  selectors.cartItems.innerHTML = cart.map((item, index) => `
    <article class="cart-item">
      <img src="${item.image}" alt="${item.name}" />
      <div><h3>${item.name}</h3><p>18k gold plated</p><strong>${formatPrice(item.price)}</strong></div>
      <button class="remove-item" data-remove-item="${index}" aria-label="Remove ${item.name}">×</button>
    </article>`).join('');

  document.querySelectorAll('[data-remove-item]').forEach(button => {
    button.addEventListener('click', () => {
      const removed = cart.splice(Number(button.dataset.removeItem), 1)[0];
      renderCart();
      showToast(`${removed.name} removed from your bag`);
    });
  });
}

function addProduct(element) {
  const product = {
    name: element.dataset.product,
    price: parsePrice(element.dataset.price),
    image: element.dataset.image
  };
  cart.push(product);
  renderCart();
  showToast(`${product.name} added to your bag`);
}

document.querySelector('[data-open-menu]').addEventListener('click', () => openPanel(selectors.menu));
document.querySelector('[data-open-cart]').addEventListener('click', () => openPanel(selectors.cart));
document.querySelectorAll('[data-close-panel]').forEach(button => button.addEventListener('click', closePanels));
selectors.scrim.addEventListener('click', closePanels);

document.querySelector('[data-open-search]').addEventListener('click', () => {
  selectors.search.classList.add('is-open');
  selectors.search.setAttribute('aria-hidden', 'false');
  setTimeout(() => document.querySelector('#search-input').focus(), 100);
});
document.querySelector('[data-close-search]').addEventListener('click', () => {
  selectors.search.classList.remove('is-open');
  selectors.search.setAttribute('aria-hidden', 'true');
});

document.querySelectorAll('.quick-add, .image-tag').forEach(button => button.addEventListener('click', () => addProduct(button)));
document.querySelectorAll('.wish-button').forEach(button => button.addEventListener('click', () => {
  button.classList.toggle('active');
  button.textContent = button.classList.contains('active') ? '♥' : '♡';
  showToast(button.classList.contains('active') ? 'Saved to your wishlist' : 'Removed from your wishlist');
}));

document.querySelector('.product-next').addEventListener('click', () => document.querySelector('[data-product-row]').scrollBy({ left: 370, behavior: 'smooth' }));
document.querySelector('.product-prev').addEventListener('click', () => document.querySelector('[data-product-row]').scrollBy({ left: -370, behavior: 'smooth' }));

document.querySelector('[data-newsletter-form]').addEventListener('submit', event => {
  event.preventDefault();
  const email = document.querySelector('#email');
  document.querySelector('.newsletter__response').textContent = `Thank you — you’re on the list, ${email.value}.`;
  email.value = '';
});

document.querySelector('[data-search-form]').addEventListener('submit', event => {
  event.preventDefault();
  const query = document.querySelector('#search-input').value.trim();
  document.querySelector('[data-search-message]').textContent = query ? `Searching the Isharya universe for “${query}”…` : 'Enter a word to discover something beautiful.';
});
document.querySelectorAll('.popular-searches button').forEach(button => button.addEventListener('click', () => {
  document.querySelector('#search-input').value = button.textContent;
  document.querySelector('#search-input').focus();
}));

document.querySelector('[data-checkout]').addEventListener('click', () => showToast(cart.length ? 'Checkout is ready for your store connection.' : 'Your bag is currently empty.'));

document.addEventListener('keydown', event => {
  if (event.key === 'Escape') {
    closePanels();
    selectors.search.classList.remove('is-open');
    selectors.search.setAttribute('aria-hidden', 'true');
  }
});

renderCart();
