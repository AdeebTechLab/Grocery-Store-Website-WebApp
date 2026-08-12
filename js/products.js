/**
 * Groco Dedicated Products Catalog Script (products.js)
 * 2-Row Horizontal Scroll Carousel Viewport, Live Search Suggestions & Arrow Navigation
 */

function createCatalogCardHTML(product) {
  const isWishlisted = GrocoStore.getWishlist().includes(product.id);
  const badgeHTML = product.badge ? `<span class="catalog-badge badge-${product.badgeType}">${product.badge}</span>` : '';

  return `
    <div class="catalog-card" data-id="${product.id}" data-category="${product.categorySlug}">
      <div class="catalog-img-box">
        ${badgeHTML}
        
        <button class="catalog-wishlist-btn wishlist-btn ${isWishlisted ? 'active' : ''}" data-id="${product.id}" aria-label="Add to Wishlist">
          <svg width="17" height="17" viewBox="0 0 24 24" fill="${isWishlisted ? '#e74c3c' : 'none'}" stroke="${isWishlisted ? '#e74c3c' : 'currentColor'}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l8.78-8.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
          </svg>
        </button>

        <img src="${product.image}" alt="${product.name}" class="catalog-img" loading="lazy">

        <button class="catalog-quickview-btn quick-view-btn" data-id="${product.id}" aria-label="Quick View">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          <span>Quick View</span>
        </button>
      </div>

      <div class="catalog-info">
        <span class="catalog-category-tag">${product.category}</span>
        <h3 class="catalog-title">${product.name}</h3>

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
          <span class="catalog-unit">${product.unit}</span>
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

document.addEventListener('DOMContentLoaded', () => {
  const catalogViewport = document.getElementById('catalog-carousel-viewport');
  const catalogGrid = document.getElementById('catalog-products-grid');
  const searchInput = document.getElementById('catalog-search-input');
  const searchClearBtn = document.getElementById('search-clear-btn');
  const suggestionsPanel = document.getElementById('search-suggestions-panel');
  const sortSelect = document.getElementById('catalog-sort-select');
  const categoryPills = document.querySelectorAll('#catalog-category-pills .cat-tab');
  const countLabel = document.getElementById('catalog-count-label');
  const prevBtn = document.getElementById('catalog-prev');
  const nextBtn = document.getElementById('catalog-next');
  const dotsContainer = document.getElementById('catalog-progress-dots');

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
      catalogGrid.style.gridAutoFlow = 'row';
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
      updateProgressDots(0, 1);
      return;
    }

    catalogGrid.style.gridAutoFlow = 'column';
    catalogGrid.style.opacity = '0';

    setTimeout(() => {
      catalogGrid.innerHTML = result.map(createCatalogCardHTML).join('');
      catalogGrid.style.opacity = '1';
      if (catalogViewport) catalogViewport.scrollLeft = 0;
      updateProgressTracker();
    }, 100);
  }

  // Carousel Controls & Progress Dots Tracker
  function updateProgressTracker() {
    if (!catalogViewport || !catalogGrid) return;
    const scrollLeft = catalogViewport.scrollLeft;
    const maxScroll = catalogViewport.scrollWidth - catalogViewport.clientWidth;
    const totalPages = Math.max(1, Math.ceil(catalogGrid.children.length / 8));
    const currentPage = Math.min(totalPages - 1, Math.floor((scrollLeft / (maxScroll || 1)) * totalPages));

    updateProgressDots(currentPage, totalPages);
  }

  function updateProgressDots(activeIdx, totalPages) {
    if (!dotsContainer) return;
    dotsContainer.innerHTML = Array.from({ length: totalPages }, (_, i) => 
      `<span class="progress-dot ${i === activeIdx ? 'active' : ''}" data-idx="${i}"></span>`
    ).join('');

    dotsContainer.querySelectorAll('.progress-dot').forEach(dot => {
      dot.addEventListener('click', () => {
        const idx = parseInt(dot.getAttribute('data-idx'));
        if (catalogViewport) {
          const scrollWidth = catalogViewport.scrollWidth - catalogViewport.clientWidth;
          catalogViewport.scrollTo({
            left: (idx / (totalPages - 1 || 1)) * scrollWidth,
            behavior: 'smooth'
          });
        }
      });
    });
  }

  // Navigation Arrow Click Listeners
  if (prevBtn && catalogViewport) {
    prevBtn.addEventListener('click', () => {
      catalogViewport.scrollBy({ left: -catalogViewport.clientWidth, behavior: 'smooth' });
    });
  }

  if (nextBtn && catalogViewport) {
    nextBtn.addEventListener('click', () => {
      catalogViewport.scrollBy({ left: catalogViewport.clientWidth, behavior: 'smooth' });
    });
  }

  // Mouse Wheel Listener: ONLY handle horizontal intent (Shift + wheel or horizontal deltaX)
  // Normal vertical mouse wheel deltaY is UNTOUCHED so the browser page scrolls UP/DOWN naturally!
  if (catalogViewport) {
    catalogViewport.addEventListener('wheel', (e) => {
      if (e.shiftKey || (Math.abs(e.deltaX) > Math.abs(e.deltaY) && Math.abs(e.deltaX) > 0)) {
        e.preventDefault();
        catalogViewport.scrollLeft += (e.deltaX || e.deltaY);
        updateProgressTracker();
      }
    }, { passive: false });

    catalogViewport.addEventListener('scroll', updateProgressTracker, { passive: true });
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
  filterAndRenderCatalog();
});
