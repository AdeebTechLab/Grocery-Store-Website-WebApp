/**
 * Groco Products Core Utilities & State Management
 * Cart, Wishlist, Flying Add-To-Cart Animation, Toast Notifications & Quick View Modal
 */

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

    const name = product ? product.name : 'Product';
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

  // Wishlist Methods
  getWishlist() {
    try {
      return JSON.parse(localStorage.getItem('groco_wishlist')) || [];
    } catch (e) {
      return [];
    }
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
    const name = product ? product.name : 'Product';
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

    content.innerHTML = `
      <div class="modal-img-col">
        ${product.badge ? `<span class="product-badge badge-${product.badgeType}">${product.badge}</span>` : ''}
        <img src="${product.image}" alt="${product.name}" class="modal-img" id="modal-target-img">
      </div>
      <div class="modal-details-col">
        <span class="modal-cat">${product.category}</span>
        <h2 class="modal-title">${product.name}</h2>
        
        <div class="modal-rating">
          <div class="stars-gold">★★★★★</div>
          <span class="rating-num">${product.rating}</span>
          <span class="reviews-num">(${product.reviews} customer reviews)</span>
        </div>

        <div class="modal-price-box">
          <span class="modal-curr-price">$${product.price.toFixed(2)}</span>
          ${product.oldPrice ? `<span class="modal-old-price">$${product.oldPrice.toFixed(2)}</span>` : ''}
          <span class="modal-unit">/ ${product.unit}</span>
        </div>

        <p class="modal-desc">${product.description}</p>

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
    GrocoStore.toggleWishlist(productId);
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

// Initialize Cart Badge Count on DOM Load
document.addEventListener('DOMContentLoaded', () => {
  GrocoStore.updateCartBadges();
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
          newsletterStatus.style.color = '#FF6B6B';
          newsletterStatus.textContent = 'Please enter a valid email address.';
        }
        return;
      }

      if (newsletterStatus) {
        newsletterStatus.style.color = '#2ECC71';
        newsletterStatus.textContent = 'Thank you for subscribing! 🌱';
      }
      newsletterEmail.value = '';

      if (typeof GrocoToast !== 'undefined' && GrocoToast.show) {
        GrocoToast.show('Welcome to the Groco family! 🌿 check your inbox soon.');
      }

      setTimeout(() => {
        if (newsletterStatus) {
          newsletterStatus.textContent = '';
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

