/**
 * Groco Products Core Utilities & State Management
 * Cart, Wishlist, Flying Add-To-Cart Animation, Toast Notifications & Quick View Modal
 */

// --------------------------------------------------------------------------
// 0. HTML ESCAPING HELPER
// --------------------------------------------------------------------------
// Product (and article) fields like name/description/badge are editable
// through the admin panel and are rendered via innerHTML template strings
// throughout the site. Without escaping, a value like `<img src=x
// onerror=alert(1)>` saved as a product name would execute as script for
// every visitor. Always pass untrusted text through this before it goes
// into an innerHTML template — including inside HTML attributes (it also
// escapes quotes, so it's safe to interpolate into src="${...}" etc).
function escapeHTML(value) {
  if (value === null || value === undefined) return '';
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// --------------------------------------------------------------------------
// 1. LOCALSTORAGE CART & WISHLIST MANAGERS
// --------------------------------------------------------------------------
const GrocoStore = {
  getCart() {
    try {
      return JSON.parse(localStorage.getItem('groco_cart')) || [];
    } catch (e) {
      return [];
    }
  },

  getCartCount() {
    const cart = this.getCart();
    return cart.reduce((total, item) => total + (item.quantity || 1), 0);
  },

  addToCart(productId, quantity = 1, triggerImgElement = null) {
    const cart = this.getCart();
    const product = typeof getProductById === 'function' ? getProductById(productId) : null;
    const existing = cart.find(item => item.id === productId);

    if (existing) {
      existing.quantity += quantity;
    } else {
      cart.push({ id: productId, quantity: quantity });
    }

    localStorage.setItem('groco_cart', JSON.stringify(cart));

    // Trigger Flying Animation if image element passed
    if (triggerImgElement) {
      this.animateFlyToCart(triggerImgElement);
    } else {
      this.updateCartBadges();
    }

    const name = escapeHTML(product ? product.name : 'Product');
    GrocoToast.show(`Fresh <strong>${name}</strong> added to cart! 🛍️`);
  },

  animateFlyToCart(imgElement) {
    const cartBadge = document.querySelector('.cart-count-badge, #cart-badge');
    if (!imgElement || !cartBadge) {
      this.updateCartBadges();
      return;
    }

    const imgRect = imgElement.getBoundingClientRect();
    const cartRect = cartBadge.getBoundingClientRect();

    const clone = imgElement.cloneNode(true);
    clone.style.position = 'fixed';
    clone.style.top = imgRect.top + 'px';
    clone.style.left = imgRect.left + 'px';
    clone.style.width = imgRect.width + 'px';
    clone.style.height = imgRect.height + 'px';
    clone.style.borderRadius = '16px';
    clone.style.zIndex = '9999';
    clone.style.pointerEvents = 'none';
    clone.style.transition = 'all 0.8s cubic-bezier(0.2, 1, 0.3, 1)';
    clone.style.boxShadow = '0 10px 25px rgba(54, 105, 51, 0.3)';

    document.body.appendChild(clone);

    // Force reflow
    clone.getBoundingClientRect();

    // Move clone to cart badge position
    clone.style.top = (cartRect.top + cartRect.height / 2 - 20) + 'px';
    clone.style.left = (cartRect.left + cartRect.width / 2 - 20) + 'px';
    clone.style.width = '40px';
    clone.style.height = '40px';
    clone.style.opacity = '0.2';
    clone.style.transform = 'scale(0.3) rotate(360deg)';

    setTimeout(() => {
      if (clone.parentNode) clone.parentNode.removeChild(clone);
      this.updateCartBadges();
    }, 800);
  },

  updateCartBadges() {
    const count = this.getCartCount();
    const badges = document.querySelectorAll('.cart-count-badge, #cart-badge');
    badges.forEach(b => {
      b.textContent = count;
      b.style.transform = 'scale(1.4)';
      setTimeout(() => {
        b.style.transform = 'scale(1)';
      }, 250);
    });
  },

  updateWishlistBadges() {
    const count = this.getWishlist().length;
    const badges = document.querySelectorAll('#wishlist-badge, .wishlist-count-badge');
    badges.forEach(b => {
      b.textContent = count;
      b.style.transform = 'scale(1.4)';
      setTimeout(() => {
        b.style.transform = 'scale(1)';
      }, 250);
    });
  },

  // Wishlist Methods
  getWishlist() {
    try {
      return JSON.parse(localStorage.getItem('groco_wishlist')) || [];
    } catch (e) {
      return [];
    }
  },

  removeFromCart(productId) {
    let cart = this.getCart();
    cart = cart.filter(item => item.id !== productId);
    localStorage.setItem('groco_cart', JSON.stringify(cart));
    this.updateCartBadges();
  },

  clearCart() {
    localStorage.setItem('groco_cart', JSON.stringify([]));
    this.updateCartBadges();
  },

  setQuantity(productId, quantity) {
    const cart = this.getCart();
    const item = cart.find(i => i.id === productId);
    if (!item) return;
    if (quantity <= 0) {
      this.removeFromCart(productId);
      return;
    }
    item.quantity = quantity;
    localStorage.setItem('groco_cart', JSON.stringify(cart));
    this.updateCartBadges();
  },

  getCartTotal() {
    const cart = this.getCart();
    return cart.reduce((total, item) => {
      const product = typeof getProductById === 'function' ? getProductById(item.id) : null;
      const price = product ? product.price : 0;
      return total + price * (item.quantity || 1);
    }, 0);
  },

  toggleWishlist(productId) {
    let wishlist = this.getWishlist();
    const index = wishlist.indexOf(productId);
    let added = false;

    if (index > -1) {
      wishlist.splice(index, 1);
    } else {
      wishlist.push(productId);
      added = true;
    }

    localStorage.setItem('groco_wishlist', JSON.stringify(wishlist));
    this.updateWishlistBadges();

    // Update heart icons in DOM
    const heartBtns = document.querySelectorAll(`.wishlist-btn[data-id="${productId}"], .catalog-wishlist-btn[data-id="${productId}"]`);
    heartBtns.forEach(btn => {
      btn.classList.toggle('active', added);
      const svg = btn.querySelector('svg');
      if (svg) {
        svg.setAttribute('fill', added ? '#e74c3c' : 'none');
        svg.setAttribute('stroke', added ? '#e74c3c' : 'currentColor');
      }
    });

    const product = typeof getProductById === 'function' ? getProductById(productId) : null;
    const name = escapeHTML(product ? product.name : 'Product');
    if (added) {
      GrocoToast.show(`Saved <strong>${name}</strong> to your wishlist! ❤️`);
    } else {
      GrocoToast.show(`Removed <strong>${name}</strong> from wishlist.`);
    }

    return added;
  }
};

// --------------------------------------------------------------------------
// 2. TOAST NOTIFICATION SYSTEM
// --------------------------------------------------------------------------
const GrocoToast = {
  container: null,

  init() {
    if (!this.container) {
      this.container = document.createElement('div');
      this.container.className = 'groco-toast-container';
      document.body.appendChild(this.container);
    }
  },

  show(message) {
    this.init();
    const toast = document.createElement('div');
    toast.className = 'groco-toast';
    toast.innerHTML = message;
    this.container.appendChild(toast);

    setTimeout(() => {
      toast.classList.add('show');
    }, 10);

    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => {
        if (toast.parentNode) toast.parentNode.removeChild(toast);
      }, 300);
    }, 3200);
  }
};

// --------------------------------------------------------------------------
// 3. QUICK VIEW MODAL MANAGER
// --------------------------------------------------------------------------
const QuickViewModal = {
  overlay: null,

  init() {
    if (!this.overlay) {
      this.overlay = document.createElement('div');
      this.overlay.className = 'quick-view-overlay catalog-modal-overlay';
      this.overlay.innerHTML = `
        <div class="quick-view-modal catalog-modal">
          <button class="modal-close-btn" aria-label="Close Modal">&times;</button>
          <div class="modal-body-grid" id="modal-content"></div>
        </div>
      `;
      document.body.appendChild(this.overlay);

      // Event Listeners
      this.overlay.addEventListener('click', (e) => {
        if (e.target === this.overlay || e.target.classList.contains('modal-close-btn')) {
          this.close();
        }
      });

      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && this.overlay.classList.contains('open')) {
          this.close();
        }
      });
    }
  },

  open(productId) {
    this.init();
    const product = typeof getProductById === 'function' ? getProductById(productId) : null;
    if (!product) return;

    const isWishlisted = GrocoStore.getWishlist().includes(product.id);
    const content = document.getElementById('modal-content');

    const name = escapeHTML(product.name);
    const badge = escapeHTML(product.badge);
    const badgeType = escapeHTML(product.badgeType);
    const image = escapeHTML(product.image);
    const category = escapeHTML(product.category);
    const unit = escapeHTML(product.unit);
    const description = escapeHTML(product.description);

    content.innerHTML = `
      <div class="modal-img-col">
        ${product.badge ? `<span class="product-badge badge-${badgeType}">${badge}</span>` : ''}
        <img src="${image}" alt="${name}" class="modal-img" id="modal-target-img">
      </div>
      <div class="modal-details-col">
        <span class="modal-cat">${category}</span>
        <h2 class="modal-title">${name}</h2>
        
        <div class="modal-rating">
          <div class="stars-gold">★★★★★</div>
          <span class="rating-num">${product.rating}</span>
          <span class="reviews-num">(${product.reviews} customer reviews)</span>
        </div>

        <div class="modal-price-box">
          <span class="modal-curr-price">$${product.price.toFixed(2)}</span>
          ${product.oldPrice ? `<span class="modal-old-price">$${product.oldPrice.toFixed(2)}</span>` : ''}
          <span class="modal-unit">/ ${unit}</span>
        </div>

        <p class="modal-desc">${description}</p>

        <div class="modal-actions-row">
          <div class="qty-selector">
            <button class="qty-btn qty-minus">-</button>
            <input type="number" class="qty-input" value="1" min="1" max="99" id="modal-qty">
            <button class="qty-btn qty-plus">+</button>
          </div>

          <button class="btn btn-primary modal-cart-btn" data-id="${product.id}">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="9" cy="21" r="1"></circle>
              <circle cx="20" cy="21" r="1"></circle>
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
            </svg>
            <span>Add to Cart</span>
          </button>

          <button class="modal-wishlist-icon-btn ${isWishlisted ? 'active' : ''}" data-id="${product.id}">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="${isWishlisted ? '#e74c3c' : 'none'}" stroke="${isWishlisted ? '#e74c3c' : 'currentColor'}" stroke-width="2">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l8.78-8.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
            </svg>
          </button>
        </div>
      </div>
    `;

    // Qty handlers inside modal
    const qtyInput = content.querySelector('#modal-qty');
    const minusBtn = content.querySelector('.qty-minus');
    const plusBtn = content.querySelector('.qty-plus');

    if (minusBtn && qtyInput) {
      minusBtn.addEventListener('click', () => {
        let val = parseInt(qtyInput.value) || 1;
        if (val > 1) qtyInput.value = val - 1;
      });
    }

    if (plusBtn && qtyInput) {
      plusBtn.addEventListener('click', () => {
        let val = parseInt(qtyInput.value) || 1;
        qtyInput.value = val + 1;
      });
    }

    // Modal Add to Cart
    const cartBtn = content.querySelector('.modal-cart-btn');
    const modalImg = content.querySelector('#modal-target-img');
    if (cartBtn) {
      cartBtn.addEventListener('click', () => {
        const qty = parseInt(qtyInput.value) || 1;
        GrocoStore.addToCart(productId, qty, modalImg);
        this.close();
      });
    }

    // Modal Wishlist
    const wishBtn = content.querySelector('.modal-wishlist-icon-btn');
    if (wishBtn) {
      wishBtn.addEventListener('click', () => {
        const added = GrocoStore.toggleWishlist(productId);
        wishBtn.classList.toggle('active', added);
        const svg = wishBtn.querySelector('svg');
        if (svg) {
          svg.setAttribute('fill', added ? '#e74c3c' : 'none');
          svg.setAttribute('stroke', added ? '#e74c3c' : 'currentColor');
        }
      });
    }

    this.overlay.classList.add('open');
    document.body.style.overflow = 'hidden';
  },

  close() {
    if (this.overlay) {
      this.overlay.classList.remove('open');
      document.body.style.overflow = '';
    }
  }
};

// --------------------------------------------------------------------------
// 4. CART DRAWER (slide-in panel showing current cart contents)
// --------------------------------------------------------------------------
const GrocoCartDrawer = {
  overlay: null,

  init() {
    if (this.overlay) return;
    this.overlay = document.createElement('div');
    this.overlay.className = 'groco-cart-drawer-overlay';
    this.overlay.innerHTML = `
      <aside class="groco-cart-drawer" role="dialog" aria-label="Shopping Cart">
        <div class="groco-cart-drawer-header">
          <h2>Your Cart</h2>
          <button class="groco-cart-close-btn" aria-label="Close Cart">&times;</button>
        </div>
        <div class="groco-cart-drawer-body" id="groco-cart-drawer-body"></div>
        <div class="groco-cart-drawer-footer" id="groco-cart-drawer-footer"></div>
      </aside>
    `;
    document.body.appendChild(this.overlay);

    this.overlay.addEventListener('click', (e) => {
      if (e.target === this.overlay || e.target.classList.contains('groco-cart-close-btn')) {
        this.close();
      }
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.overlay.classList.contains('open')) {
        this.close();
      }
    });

    // Delegated handlers for quantity / remove buttons inside the drawer
    this.overlay.addEventListener('click', (e) => {
      const minusBtn = e.target.closest('.groco-cart-qty-minus');
      const plusBtn = e.target.closest('.groco-cart-qty-plus');
      const removeBtn = e.target.closest('.groco-cart-remove-btn');
      const checkoutBtn = e.target.closest('.groco-cart-checkout-btn');

      if (minusBtn) {
        const id = minusBtn.getAttribute('data-id');
        const cart = GrocoStore.getCart();
        const item = cart.find(i => i.id === id);
        if (item) GrocoStore.setQuantity(id, (item.quantity || 1) - 1);
        this.render();
      } else if (plusBtn) {
        const id = plusBtn.getAttribute('data-id');
        const cart = GrocoStore.getCart();
        const item = cart.find(i => i.id === id);
        if (item) GrocoStore.setQuantity(id, (item.quantity || 1) + 1);
        this.render();
      } else if (removeBtn) {
        const id = removeBtn.getAttribute('data-id');
        GrocoStore.removeFromCart(id);
        this.render();
      } else if (checkoutBtn) {
        this.close();
        GrocoCheckoutModal.open();
      }
    });
  },

  render() {
    const body = document.getElementById('groco-cart-drawer-body');
    const footer = document.getElementById('groco-cart-drawer-footer');
    if (!body || !footer) return;

    const cart = GrocoStore.getCart();

    if (cart.length === 0) {
      body.innerHTML = `
        <div class="groco-cart-empty-state">
          <p>Your cart is empty 🌿</p>
          <p class="groco-cart-empty-sub">Browse our fresh picks and add something delicious!</p>
        </div>
      `;
      footer.innerHTML = '';
      return;
    }

    body.innerHTML = cart.map(item => {
      const product = typeof getProductById === 'function' ? getProductById(item.id) : null;
      if (!product) return '';
      const qty = item.quantity || 1;
      const lineTotal = (product.price * qty).toFixed(2);
      const name = escapeHTML(product.name);
      const image = escapeHTML(product.image);
      const unit = escapeHTML(product.unit);
      return `
        <div class="groco-cart-line-item" data-id="${product.id}">
          <img src="${image}" alt="${name}" class="groco-cart-item-img">
          <div class="groco-cart-item-info">
            <span class="groco-cart-item-name">${name}</span>
            <span class="groco-cart-item-unit">${unit}</span>
            <div class="groco-cart-qty-row">
              <button class="groco-cart-qty-minus" data-id="${product.id}" aria-label="Decrease quantity">-</button>
              <span class="groco-cart-qty-val">${qty}</span>
              <button class="groco-cart-qty-plus" data-id="${product.id}" aria-label="Increase quantity">+</button>
            </div>
          </div>
          <div class="groco-cart-item-price-col">
            <span class="groco-cart-item-price">$${lineTotal}</span>
            <button class="groco-cart-remove-btn" data-id="${product.id}" aria-label="Remove item">Remove</button>
          </div>
        </div>
      `;
    }).join('');

    const total = GrocoStore.getCartTotal().toFixed(2);
    footer.innerHTML = `
      <div class="groco-cart-total-row">
        <span>Subtotal</span>
        <span class="groco-cart-total-val">$${total}</span>
      </div>
      <button class="btn btn-primary groco-cart-checkout-btn">Checkout</button>
    `;
  },

  open() {
    this.init();
    this.render();
    this.overlay.classList.add('open');
    document.body.style.overflow = 'hidden';
  },

  close() {
    if (this.overlay) {
      this.overlay.classList.remove('open');
      document.body.style.overflow = '';
    }
  }
};

// --------------------------------------------------------------------------
// 4B. CHECKOUT MODAL — collects customer details, shows an order summary
//     table built from the live cart, and sends the whole order as a single
//     prewritten message to the store's WhatsApp number. There is no
//     payment backend here: WhatsApp is where the order actually gets
//     confirmed with the shopper.
// --------------------------------------------------------------------------
const GROCO_ORDER_WHATSAPP_NUMBER = '+92 309 2333121';

const GrocoCheckoutModal = {
  overlay: null,

  init() {
    if (this.overlay) return;
    this.overlay = document.createElement('div');
    this.overlay.className = 'groco-checkout-modal-overlay';
    this.overlay.innerHTML = `
      <div class="groco-checkout-modal" role="dialog" aria-label="Checkout">
        <div class="groco-checkout-modal-header">
          <h2>Checkout</h2>
          <button class="groco-checkout-close-btn" aria-label="Close Checkout">&times;</button>
        </div>
        <div class="groco-checkout-modal-body">
          <div id="groco-checkout-summary"></div>

          <form class="groco-checkout-form" id="groco-checkout-form" novalidate>
            <label class="groco-checkout-field">
              <span>Full Name *</span>
              <input type="text" id="checkout-name" autocomplete="name" required>
            </label>
            <label class="groco-checkout-field">
              <span>Phone Number *</span>
              <input type="tel" id="checkout-phone" autocomplete="tel" required>
            </label>
            <label class="groco-checkout-field">
              <span>Delivery Address *</span>
              <textarea id="checkout-address" rows="2" autocomplete="street-address" required></textarea>
            </label>
            <label class="groco-checkout-field">
              <span>City</span>
              <input type="text" id="checkout-city" autocomplete="address-level2">
            </label>
            <label class="groco-checkout-field">
              <span>Order Notes (optional)</span>
              <textarea id="checkout-notes" rows="2" placeholder="Preferred delivery time, substitutions, etc."></textarea>
            </label>
            <p class="groco-checkout-error" id="groco-checkout-error"></p>
            <button type="submit" class="groco-checkout-submit-btn">
              <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.372-.025-.521-.075-.148-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.71.306 1.263.489 1.694.625.712.227 1.36.195 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"></path>
                <path d="M12.004 2.003c-5.514 0-9.997 4.483-9.997 9.997 0 1.762.462 3.482 1.34 4.997L2 22l5.116-1.341a9.96 9.96 0 0 0 4.888 1.243h.004c5.514 0 9.997-4.483 9.997-9.997 0-2.67-1.04-5.182-2.929-7.07a9.933 9.933 0 0 0-7.072-2.832zm.001 18.174h-.003a8.183 8.183 0 0 1-4.166-1.14l-.299-.177-3.037.797.81-2.96-.194-.304a8.166 8.166 0 0 1-1.256-4.393c0-4.515 3.673-8.188 8.191-8.188a8.13 8.13 0 0 1 5.792 2.401 8.132 8.132 0 0 1 2.397 5.792c0 4.516-3.674 8.172-8.235 8.172z"></path>
              </svg>
              <span>Send Order via WhatsApp</span>
            </button>
            <p class="groco-checkout-disclaimer">You'll be taken to WhatsApp with your order pre-filled — confirm it there with our team. No payment is collected on this site.</p>
          </form>
        </div>
      </div>
    `;
    document.body.appendChild(this.overlay);

    this.overlay.addEventListener('click', (e) => {
      if (e.target === this.overlay || e.target.classList.contains('groco-checkout-close-btn')) {
        this.close();
      }
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.overlay.classList.contains('open')) {
        this.close();
      }
    });

    // Pre-fill from the last order so a returning shopper doesn't have to
    // retype their details. Purely a local convenience - never sent
    // anywhere until they submit this form themselves.
    try {
      const saved = JSON.parse(localStorage.getItem('groco_checkout_customer') || 'null');
      if (saved) {
        this.overlay.querySelector('#checkout-name').value = saved.name || '';
        this.overlay.querySelector('#checkout-phone').value = saved.phone || '';
        this.overlay.querySelector('#checkout-address').value = saved.address || '';
        this.overlay.querySelector('#checkout-city').value = saved.city || '';
      }
    } catch {}

    this.overlay.querySelector('#groco-checkout-form').addEventListener('submit', (e) => {
      e.preventDefault();
      this.submit();
    });
  },

  // Renders the read-only order summary table from the live cart.
  renderSummary() {
    const summaryEl = this.overlay.querySelector('#groco-checkout-summary');
    const cart = GrocoStore.getCart();

    const rows = cart.map((item) => {
      const product = typeof getProductById === 'function' ? getProductById(item.id) : null;
      if (!product) return '';
      const qty = item.quantity || 1;
      const lineTotal = (product.price * qty).toFixed(2);
      const name = escapeHTML(product.name);
      const unit = escapeHTML(product.unit);
      return `
        <tr>
          <td>
            <div class="groco-checkout-summary-item">
              <span class="groco-checkout-summary-name">${name}</span>
              <span class="groco-checkout-summary-unit">${unit}</span>
            </div>
          </td>
          <td class="groco-checkout-summary-qty">x${qty}</td>
          <td class="groco-checkout-summary-price">$${lineTotal}</td>
        </tr>
      `;
    }).join('');

    const total = GrocoStore.getCartTotal().toFixed(2);

    summaryEl.innerHTML = `
      <table class="groco-checkout-summary-table">
        <thead>
          <tr><th>Item</th><th>Qty</th><th>Price</th></tr>
        </thead>
        <tbody>${rows}</tbody>
        <tfoot>
          <tr><td colspan="2">Subtotal</td><td class="groco-checkout-summary-total">$${total}</td></tr>
        </tfoot>
      </table>
    `;
  },

  // Validates the form, builds the prewritten WhatsApp message from the
  // customer details + itemized cart, and opens it in a new tab.
  submit() {
    const cart = GrocoStore.getCart();
    if (cart.length === 0) {
      GrocoToast.show('Your cart is empty — add something before checking out.');
      this.close();
      return;
    }

    const nameInput = this.overlay.querySelector('#checkout-name');
    const phoneInput = this.overlay.querySelector('#checkout-phone');
    const addressInput = this.overlay.querySelector('#checkout-address');
    const cityInput = this.overlay.querySelector('#checkout-city');
    const notesInput = this.overlay.querySelector('#checkout-notes');
    const errorEl = this.overlay.querySelector('#groco-checkout-error');

    const name = nameInput.value.trim();
    const phone = phoneInput.value.trim();
    const address = addressInput.value.trim();
    const city = cityInput.value.trim();
    const notes = notesInput.value.trim();

    [nameInput, phoneInput, addressInput].forEach((input) => input.classList.remove('field-error'));

    if (!name || !phone || !address) {
      errorEl.textContent = 'Please fill in your name, phone number, and delivery address.';
      errorEl.classList.add('show');
      [nameInput, phoneInput, addressInput].forEach((input) => {
        if (!input.value.trim()) input.classList.add('field-error');
      });
      return;
    }
    errorEl.classList.remove('show');

    try {
      localStorage.setItem('groco_checkout_customer', JSON.stringify({ name, phone, address, city }));
    } catch {}

    const lines = cart.map((item, idx) => {
      const product = typeof getProductById === 'function' ? getProductById(item.id) : null;
      if (!product) return '';
      const qty = item.quantity || 1;
      const lineTotal = (product.price * qty).toFixed(2);
      return `${idx + 1}. ${product.name} x${qty} — $${lineTotal}`;
    }).filter(Boolean).join('\n');

    const total = GrocoStore.getCartTotal().toFixed(2);

    const messageLines = [
      '🛒 *New Order — Groco*',
      '',
      '*Customer Details*',
      `Name: ${name}`,
      `Phone: ${phone}`,
      `Address: ${address}${city ? ', ' + city : ''}`,
    ];
    if (notes) messageLines.push(`Notes: ${notes}`);
    messageLines.push('', '*Order Items*', lines, '', `*Subtotal: $${total}*`, '', 'Sent from the Groco website.');

    const message = messageLines.join('\n');
    const cleanNumber = GROCO_ORDER_WHATSAPP_NUMBER.replace(/[^0-9]/g, '');
    const whatsappUrl = `https://wa.me/${cleanNumber}?text=${encodeURIComponent(message)}`;

    window.open(whatsappUrl, '_blank', 'noopener');

    GrocoToast.show('✅ Order sent! Confirm the details with us on WhatsApp.');
    GrocoStore.clearCart();
    this.close();
  },

  open() {
    const cart = GrocoStore.getCart();
    if (cart.length === 0) {
      GrocoToast.show('Your cart is empty — add something before checking out.');
      return;
    }
    this.init();
    this.renderSummary();
    const errorEl = this.overlay.querySelector('#groco-checkout-error');
    if (errorEl) errorEl.classList.remove('show');
    this.overlay.querySelectorAll('.field-error').forEach((el) => el.classList.remove('field-error'));
    this.overlay.classList.add('open');
    document.body.style.overflow = 'hidden';
  },

  close() {
    if (this.overlay) {
      this.overlay.classList.remove('open');
      document.body.style.overflow = '';
    }
  }
};

// --------------------------------------------------------------------------
// 5. WISHLIST DRAWER (slide-in panel showing saved items, opened from the
//    heart/wishlist icon on product cards or the header wishlist icon)
// --------------------------------------------------------------------------
const GrocoWishlistDrawer = {
  overlay: null,

  init() {
    if (this.overlay) return;
    this.overlay = document.createElement('div');
    this.overlay.className = 'groco-wishlist-drawer-overlay';
    this.overlay.innerHTML = `
      <aside class="groco-wishlist-drawer" role="dialog" aria-label="Wishlist">
        <div class="groco-wishlist-drawer-header">
          <h2>Your Wishlist</h2>
          <button class="groco-wishlist-close-btn" aria-label="Close Wishlist">&times;</button>
        </div>
        <div class="groco-wishlist-drawer-body" id="groco-wishlist-drawer-body"></div>
        <div class="groco-wishlist-drawer-footer" id="groco-wishlist-drawer-footer"></div>
      </aside>
    `;
    document.body.appendChild(this.overlay);

    this.overlay.addEventListener('click', (e) => {
      if (e.target === this.overlay || e.target.classList.contains('groco-wishlist-close-btn')) {
        this.close();
      }
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.overlay.classList.contains('open')) {
        this.close();
      }
    });

    // Delegated handlers for add-to-cart / remove / add-all buttons inside the drawer
    this.overlay.addEventListener('click', (e) => {
      const addCartBtn = e.target.closest('.groco-wishlist-add-cart-btn');
      const removeBtn = e.target.closest('.groco-wishlist-remove-btn');
      const addAllBtn = e.target.closest('.groco-wishlist-add-all-btn');

      if (addCartBtn) {
        const id = addCartBtn.getAttribute('data-id');
        const img = this.overlay.querySelector(`.groco-wishlist-line-item[data-id="${id}"] img`);
        GrocoStore.addToCart(id, 1, img);
        addCartBtn.textContent = 'Added ✓';
        addCartBtn.classList.add('added');
        setTimeout(() => {
          addCartBtn.textContent = 'Add to Cart';
          addCartBtn.classList.remove('added');
        }, 1200);
      } else if (removeBtn) {
        const id = removeBtn.getAttribute('data-id');
        GrocoStore.toggleWishlist(id);
        this.render();
      } else if (addAllBtn) {
        const wishlist = GrocoStore.getWishlist();
        wishlist.forEach((id) => GrocoStore.addToCart(id, 1));
        GrocoToast.show('🛍️ Added every wishlist item to your cart!');
      }
    });
  },

  render() {
    const body = document.getElementById('groco-wishlist-drawer-body');
    const footer = document.getElementById('groco-wishlist-drawer-footer');
    if (!body || !footer) return;

    const wishlist = GrocoStore.getWishlist();

    if (wishlist.length === 0) {
      body.innerHTML = `
        <div class="groco-wishlist-empty-state">
          <p>Your wishlist is empty 💚</p>
          <p class="groco-wishlist-empty-sub">Tap the heart on any product to save it for later!</p>
        </div>
      `;
      footer.innerHTML = '';
      return;
    }

    body.innerHTML = wishlist.map((id) => {
      const product = typeof getProductById === 'function' ? getProductById(id) : null;
      if (!product) return '';
      const name = escapeHTML(product.name);
      const image = escapeHTML(product.image);
      const unit = escapeHTML(product.unit);
      return `
        <div class="groco-wishlist-line-item" data-id="${product.id}">
          <img src="${image}" alt="${name}" class="groco-wishlist-item-img">
          <div class="groco-wishlist-item-info">
            <span class="groco-wishlist-item-name">${name}</span>
            <span class="groco-wishlist-item-price">$${product.price.toFixed(2)}</span>
            <span class="groco-wishlist-item-unit">${unit}</span>
          </div>
          <div class="groco-wishlist-item-actions">
            <button class="groco-wishlist-add-cart-btn" data-id="${product.id}">Add to Cart</button>
            <button class="groco-wishlist-remove-btn" data-id="${product.id}" aria-label="Remove from wishlist">Remove</button>
          </div>
        </div>
      `;
    }).join('');

    footer.innerHTML = `
      <button class="groco-wishlist-add-all-btn">Add All to Cart</button>
    `;
  },

  open() {
    this.init();
    this.render();
    this.overlay.classList.add('open');
    document.body.style.overflow = 'hidden';
  },

  close() {
    if (this.overlay) {
      this.overlay.classList.remove('open');
      document.body.style.overflow = '';
    }
  }
};

// Wire up every "cart-btn" (button, anchor, or div wrapper) across all pages
// to open the shared cart drawer instead of doing nothing / navigating to a dead anchor.
document.addEventListener('click', (e) => {
  const trigger = e.target.closest('#cart-btn, .cart-btn');
  if (!trigger) return;
  e.preventDefault();
  GrocoCartDrawer.open();
});

// Wire up the header wishlist icon (present on every page) to open the
// wishlist drawer.
document.addEventListener('click', (e) => {
  const trigger = e.target.closest('#wishlist-drawer-btn, .wishlist-header-btn');
  if (!trigger) return;
  e.preventDefault();
  GrocoWishlistDrawer.open();
});

// Global Delegated Event Handler for Product Card Actions Across All Components
document.addEventListener('click', (e) => {
  // 1. Add to Cart Click
  const cartBtn = e.target.closest('.add-to-cart-action-btn, .catalog-add-cart-btn');
  if (cartBtn) {
    e.stopPropagation();
    const productId = cartBtn.getAttribute('data-id');
    const card = cartBtn.closest('.product-card, .catalog-card, .stage-product-item');
    const imgEl = card ? card.querySelector('img') : null;

    // Visual button text update
    const btnSpan = cartBtn.querySelector('span');
    const originalText = btnSpan ? btnSpan.textContent : 'Add to Cart';
    if (btnSpan) btnSpan.textContent = '✓ Added to Cart';
    cartBtn.style.backgroundColor = 'var(--color-primary-green)';
    cartBtn.style.color = '#ffffff';

    setTimeout(() => {
      if (btnSpan) btnSpan.textContent = originalText;
      cartBtn.style.backgroundColor = '';
      cartBtn.style.color = '';
    }, 1200);

    GrocoStore.addToCart(productId, 1, imgEl);
    return;
  }

  // 2. Wishlist Click
  const wishBtn = e.target.closest('.wishlist-btn, .catalog-wishlist-btn');
  if (wishBtn) {
    e.stopPropagation();
    const productId = wishBtn.getAttribute('data-id');
    const added = GrocoStore.toggleWishlist(productId);
    if (added) {
      // Show the wishlist right away so the shopper can see what's saved
      // and, if they want, send it straight to their cart.
      GrocoWishlistDrawer.open();
    } else if (GrocoWishlistDrawer.overlay && GrocoWishlistDrawer.overlay.classList.contains('open')) {
      GrocoWishlistDrawer.render();
    }
    return;
  }

  // 3. Quick View Click
  const qvBtn = e.target.closest('.quick-view-btn, .catalog-quickview-btn, .catalog-img-box, .product-img-box');
  if (qvBtn) {
    // Avoid triggering if wishlist button was clicked inside img box
    if (e.target.closest('.wishlist-btn, .catalog-wishlist-btn')) return;

    e.stopPropagation();
    let productId = qvBtn.getAttribute('data-id');
    if (!productId) {
      const parentCard = qvBtn.closest('.catalog-card, .product-card, .stage-product-item');
      if (parentCard) productId = parentCard.getAttribute('data-id');
    }
    if (productId) {
      QuickViewModal.open(productId);
    }
    return;
  }
});

// Initialize Cart & Wishlist Badge Counts on DOM Load
document.addEventListener('DOMContentLoaded', () => {
  GrocoStore.updateCartBadges();
  GrocoStore.updateWishlistBadges();
});

// ==========================================================================
// GROCO PREMIUM FOOTER LOGIC & WHATSAPP CONFIG
// ==========================================================================
/**
 * WhatsApp Phone Number Constant
 * Easily configurable placeholder number for all WhatsApp chat links across Groco.
 */
const GROCO_WHATSAPP_NUMBER = "15551234567";

function initGrocoFooter() {
  // 1. Configure WhatsApp Link dynamically from constant
  const whatsappLink = document.getElementById('groco-whatsapp-link');
  if (whatsappLink) {
    const cleanNumber = GROCO_WHATSAPP_NUMBER.replace(/[^0-9]/g, '');
    whatsappLink.href = `https://wa.me/${cleanNumber}`;
  }

  // 2. Newsletter Form Submission Handling
  const newsletterForm = document.getElementById('groco-footer-newsletter-form');
  const newsletterEmail = document.getElementById('groco-newsletter-email');
  const newsletterStatus = document.getElementById('groco-newsletter-status');

  if (newsletterForm && newsletterEmail) {
    newsletterForm.addEventListener('submit', function (e) {
      e.preventDefault();
      const email = newsletterEmail.value.trim();
      if (!email || !email.includes('@')) {
        if (newsletterStatus) {
          newsletterStatus.classList.add('error');
          newsletterStatus.textContent = 'Please enter a valid email address.';
        }
        return;
      }

      if (newsletterStatus) {
        newsletterStatus.classList.remove('error');
        newsletterStatus.textContent = 'Thank you for subscribing! 🌱';
      }
      newsletterEmail.value = '';

      if (typeof GrocoToast !== 'undefined' && GrocoToast.show) {
        GrocoToast.show('Welcome to the Groco family! 🌿 check your inbox soon.');
      }

      setTimeout(() => {
        if (newsletterStatus) {
          newsletterStatus.textContent = '';
          newsletterStatus.classList.remove('error');
        }
      }, 4000);
    });
  }

  // 3. Footer Scroll Reveal Animations (IntersectionObserver)
  const footerElement = document.getElementById('groco-footer');
  if (footerElement) {
    const animElements = footerElement.querySelectorAll('.footer-anim');
    animElements.forEach((el) => {
      const delay = el.getAttribute('data-anim-delay') || '0';
      el.style.transitionDelay = `${delay}ms`;
    });

    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              footerElement.classList.add('in-view');
              observer.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.1 }
      );
      observer.observe(footerElement);
    } else {
      footerElement.classList.add('in-view');
    }
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initGrocoFooter);
} else {
  initGrocoFooter();
}

