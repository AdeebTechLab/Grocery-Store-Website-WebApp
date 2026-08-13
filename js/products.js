/**
 * Groco Dedicated Products Catalog Script (products.js)
 * 2-Row Horizontal Scroll Carousel Viewport, Live Search Suggestions & Arrow Navigation
 */

// Simple inline SVG placeholder shown when a product's image URL fails to
// load (e.g. a dead hotlinked Unsplash link) so we never show the browser's
// broken-image icon.
const FALLBACK_IMG = 'data:image/svg+xml;utf8,' + encodeURIComponent(`
  <svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300">
    <rect width="400" height="300" fill="#f0f5ed"/>
    <g fill="none" stroke="#a9c79c" stroke-width="6" stroke-linecap="round" stroke-linejoin="round">
      <rect x="120" y="95" width="160" height="120" rx="10"/>
      <circle cx="160" cy="130" r="12"/>
      <path d="M120 190l45-45 30 30 25-25 40 40"/>
    </g>
    <text x="200" y="245" font-family="Arial, sans-serif" font-size="14" fill="#8fa982" text-anchor="middle">Image unavailable</text>
  </svg>
`);

function createCatalogCardHTML(product) {
  const isWishlisted = GrocoStore.getWishlist().includes(product.id);
  const name = escapeHTML(product.name);
  const badge = escapeHTML(product.badge);
  const badgeType = escapeHTML(product.badgeType);
  const image = escapeHTML(product.image);
  const category = escapeHTML(product.category);
  const unit = escapeHTML(product.unit);
  const badgeHTML = product.badge ? `<span class="catalog-badge badge-${badgeType}">${badge}</span>` : '';

  return `
    <div class="catalog-card" data-id="${product.id}" data-category="${product.categorySlug}">
      <div class="catalog-img-box">
        ${badgeHTML}
        
        <button class="catalog-wishlist-btn wishlist-btn ${isWishlisted ? 'active' : ''}" data-id="${product.id}" aria-label="Add to Wishlist">
          <svg width="17" height="17" viewBox="0 0 24 24" fill="${isWishlisted ? '#e74c3c' : 'none'}" stroke="${isWishlisted ? '#e74c3c' : 'currentColor'}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l8.78-8.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
          </svg>
        </button>

        <img src="${image}" alt="${name}" class="catalog-img" loading="lazy" onerror="this.onerror=null;this.src='${FALLBACK_IMG}';this.classList.add('catalog-img-fallback');">

        <button class="catalog-quickview-btn quick-view-btn" data-id="${product.id}" aria-label="Quick View">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          <span>Quick View</span>
        </button>
      </div>

      <div class="catalog-info">
        <span class="catalog-category-tag">${category}</span>
        <h3 class="catalog-title">${name}</h3>

        <div class="catalog-rating-row">
          <div class="stars-gold">★★★★★</div>
          <span class="rating-val" style="font-weight:800; color:var(--color-text-main);">${product.rating}</span>
          <span class="reviews-count" style="color:var(--color-text-body); font-size:11px;">(${product.reviews})</span>
        </div>

        <div class="catalog-price-row">
          <div class="price-wrap">
            <span class="catalog-curr-price">$${product.price.toFixed(2)}</span>
            ${product.oldPrice ? `<span class="catalog-old-price">$${product.oldPrice.toFixed(2)}</span>` : ''}
          </div>
          <span class="catalog-unit">${unit}</span>
        </div>

        <button class="catalog-add-cart-btn add-to-cart-action-btn" data-id="${product.id}">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="9" cy="21" r="1"></circle>
            <circle cx="20" cy="21" r="1"></circle>
            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
          </svg>
          <span>Add to Cart</span>
        </button>
      </div>
    </div>
  `;
}

document.addEventListener('DOMContentLoaded', async () => {
  // Wait for the product catalog (loaded via /api/products, with a bundled
  // fallback) before doing the first filter/render pass.
  if (window.GrocoProductsReady) {
    await window.GrocoProductsReady;
  }

  const catalogGrid = document.getElementById('catalog-products-grid');
  const searchInput = document.getElementById('catalog-search-input');
  const searchClearBtn = document.getElementById('search-clear-btn');
  const suggestionsPanel = document.getElementById('search-suggestions-panel');
  const sortSelect = document.getElementById('catalog-sort-select');
  const categoryPills = document.querySelectorAll('#catalog-category-pills .cat-tab');
  const catPillsTrack = document.getElementById('catalog-category-pills');
  const catPillsPrev = document.getElementById('cat-pills-prev');
  const catPillsNext = document.getElementById('cat-pills-next');
  const countLabel = document.getElementById('catalog-count-label');

  let currentCategory = 'all';
  let currentSearch = '';
  let currentSort = 'featured';

  function filterAndRenderCatalog() {
    if (!catalogGrid || typeof GROCO_PRODUCTS === 'undefined') return;

    let result = [...GROCO_PRODUCTS];

    // 1. Category Filter
    if (currentCategory !== 'all') {
      result = result.filter(p => p.categorySlug === currentCategory);
    }

    // 2. Search Filter
    if (currentSearch.trim() !== '') {
      const q = currentSearch.toLowerCase().trim();
      result = result.filter(p => 
        p.name.toLowerCase().includes(q) || 
        p.category.toLowerCase().includes(q) || 
        p.description.toLowerCase().includes(q)
      );
    }

    // 3. Sorting
    if (currentSort === 'price-low') {
      result.sort((a, b) => a.price - b.price);
    } else if (currentSort === 'price-high') {
      result.sort((a, b) => b.price - a.price);
    } else if (currentSort === 'rating') {
      result.sort((a, b) => b.rating - a.rating);
    } else if (currentSort === 'newest') {
      result.sort((a, b) => (b.badge === 'NEW' ? 1 : 0) - (a.badge === 'NEW' ? 1 : 0));
    }

    // 4. Update Product Count Label
    if (countLabel) {
      countLabel.textContent = `Showing ${result.length} of ${GROCO_PRODUCTS.length} products`;
    }

    // 5. Render Grid or Empty State
    if (result.length === 0) {
      catalogGrid.innerHTML = `
        <div class="catalog-empty-state">
          <h3>No fresh picks found 🌿</h3>
          <p>Try searching for fruits, vegetables, bakery or dairy.</p>
          <button class="clear-search-action-btn" id="reset-search-btn">Clear Search</button>
        </div>
      `;
      const resetBtn = catalogGrid.querySelector('#reset-search-btn');
      if (resetBtn) {
        resetBtn.addEventListener('click', () => {
          if (searchInput) searchInput.value = '';
          currentSearch = '';
          if (searchClearBtn) searchClearBtn.classList.remove('visible');
          filterAndRenderCatalog();
        });
      }
      return;
    }

    catalogGrid.style.opacity = '0';

    setTimeout(() => {
      catalogGrid.innerHTML = result.map(createCatalogCardHTML).join('');
      catalogGrid.style.opacity = '1';
    }, 100);
  }

  // Search Input & Suggestions Event Listeners
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      currentSearch = e.target.value;
      if (searchClearBtn) {
        searchClearBtn.classList.toggle('visible', currentSearch.length > 0);
      }
      filterAndRenderCatalog();
    });

    searchInput.addEventListener('focus', () => {
      if (suggestionsPanel) suggestionsPanel.classList.add('open');
    });

    document.addEventListener('click', (e) => {
      if (suggestionsPanel && !e.target.closest('.catalog-search-wrap')) {
        suggestionsPanel.classList.remove('open');
      }
    });
  }

  if (searchClearBtn) {
    searchClearBtn.addEventListener('click', () => {
      if (searchInput) searchInput.value = '';
      currentSearch = '';
      searchClearBtn.classList.remove('visible');
      filterAndRenderCatalog();
    });
  }

  // Suggestion Pills Click
  if (suggestionsPanel) {
    suggestionsPanel.querySelectorAll('.suggestion-pill').forEach(pill => {
      pill.addEventListener('click', () => {
        const text = pill.textContent.trim();
        if (searchInput) searchInput.value = text;
        currentSearch = text;
        if (searchClearBtn) searchClearBtn.classList.add('visible');
        suggestionsPanel.classList.remove('open');
        filterAndRenderCatalog();
      });
    });
  }

  // Sort Dropdown Change Listener
  if (sortSelect) {
    sortSelect.addEventListener('change', (e) => {
      currentSort = e.target.value;
      filterAndRenderCatalog();
    });
  }

  // Category Pills Click Listener
  categoryPills.forEach(pill => {
    pill.addEventListener('click', () => {
      categoryPills.forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      currentCategory = pill.getAttribute('data-category');
      filterAndRenderCatalog();
    });
  });

  // Read URL Query Parameter for Category (e.g. products.html?category=fruits)
  const urlParams = new URLSearchParams(window.location.search);
  const catParam = urlParams.get('category');
  if (catParam) {
    currentCategory = catParam;
    categoryPills.forEach(pill => {
      if (pill.getAttribute('data-category') === catParam) {
        pill.classList.add('active');
      } else {
        pill.classList.remove('active');
      }
    });
  }

  // Initial Catalog Render
  // Category Pills Left/Right Scroll Arrows
  function updateCatPillsArrows() {
    if (!catPillsTrack || !catPillsPrev || !catPillsNext) return;
    const maxScroll = catPillsTrack.scrollWidth - catPillsTrack.clientWidth;
    catPillsPrev.disabled = catPillsTrack.scrollLeft <= 4;
    catPillsNext.disabled = catPillsTrack.scrollLeft >= maxScroll - 4;
  }

  if (catPillsTrack && catPillsPrev && catPillsNext) {
    catPillsPrev.addEventListener('click', () => {
      catPillsTrack.scrollBy({ left: -220, behavior: 'smooth' });
    });
    catPillsNext.addEventListener('click', () => {
      catPillsTrack.scrollBy({ left: 220, behavior: 'smooth' });
    });
    catPillsTrack.addEventListener('scroll', updateCatPillsArrows);
    window.addEventListener('resize', updateCatPillsArrows);
    updateCatPillsArrows();
  }

  window.addEventListener('resize', () => {
    clearTimeout(window.__catalogResizeTimer);
    window.__catalogResizeTimer = setTimeout(filterAndRenderCatalog, 200);
  });

  filterAndRenderCatalog();
});
