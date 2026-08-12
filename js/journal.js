/**
 * Groco Dedicated Journal Page Engine (journal.js)
 */

document.addEventListener('DOMContentLoaded', () => {
  const filterPills = document.querySelectorAll('#journal-filter-pills .j-pill');
  const searchInput = document.getElementById('journal-search-input');
  const clearBtn = document.getElementById('j-clear-btn');
  const featuredHero = document.getElementById('journal-featured-hero');
  const secondaryRows = document.getElementById('secondary-editorial-rows');
  const storiesGrid = document.getElementById('journal-stories-grid');
  const storiesCountBadge = document.getElementById('stories-count-badge');
  const newsletterForm = document.getElementById('newsletter-form');

  let activeFilter = 'all';
  let searchQuery = '';

  function renderJournalPage() {
    if (typeof GROCO_JOURNAL_ARTICLES === 'undefined') return;

    let articles = [...GROCO_JOURNAL_ARTICLES];

    // 1. Filter by Category
    if (activeFilter !== 'all') {
      articles = articles.filter(a => a.category.toLowerCase() === activeFilter.toLowerCase());
    }

    // 2. Filter by Search Query
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase().trim();
      articles = articles.filter(a => 
        a.title.toLowerCase().includes(q) ||
        a.category.toLowerCase().includes(q) ||
        a.shortDescription.toLowerCase().includes(q) ||
        a.content.toLowerCase().includes(q) ||
        (a.tags && a.tags.some(t => t.toLowerCase().includes(q)))
      );
    }

    // Update Count Badge
    if (storiesCountBadge) {
      storiesCountBadge.textContent = `Showing ${articles.length} article${articles.length === 1 ? '' : 's'}`;
    }

    // Handle Empty Search Results State
    if (articles.length === 0) {
      if (featuredHero) featuredHero.style.display = 'none';
      if (secondaryRows) secondaryRows.style.display = 'none';
      if (storiesGrid) {
        storiesGrid.innerHTML = `
          <div class="journal-empty-state">
            <h3>No journal stories found 🌿</h3>
            <p>Try searching for recipes, health, organic living, or grocery tips.</p>
            <button class="j-reset-btn" id="j-reset-btn">Clear Filter & Search</button>
          </div>
        `;
        const resetBtn = storiesGrid.querySelector('#j-reset-btn');
        if (resetBtn) {
          resetBtn.addEventListener('click', () => {
            activeFilter = 'all';
            searchQuery = '';
            if (searchInput) searchInput.value = '';
            filterPills.forEach(p => p.classList.toggle('active', p.dataset.filter === 'all'));
            if (clearBtn) clearBtn.classList.remove('visible');
            renderJournalPage();
          });
        }
      }
      return;
    }

    // Render Top Featured Hero (Index 0)
    const feat = articles[0];
    if (featuredHero) {
      featuredHero.style.display = 'block';
      featuredHero.innerHTML = `
        <div class="j-hero-card">
          <div class="j-hero-img-wrap">
            <span class="j-badge">${feat.badge || 'FEATURED'}</span>
            <img src="${feat.image}" alt="${feat.title}" class="j-hero-img" loading="lazy">
          </div>
          <div class="j-hero-content">
            <span class="j-category-tag">${feat.category}</span>
            <h2 class="j-hero-title">${feat.title}</h2>
            <p class="j-hero-desc">${feat.shortDescription}</p>
            
            <div class="j-hero-meta-row">
              <div class="j-meta-info">
                <span class="j-author">By ${feat.author}</span> •
                <span class="j-date">${feat.date}</span> •
                <span class="j-read-time">${feat.readTime}</span>
              </div>
              <a href="article.html?id=${feat.id}" class="j-read-btn">
                <span>Read Article</span>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                  <polyline points="12 5 19 12 12 19"></polyline>
                </svg>
              </a>
            </div>
          </div>
        </div>
      `;
    }

    // Render Secondary Horizontal Editorial Rows (Index 1 & 2 if available)
    const rowsArticles = articles.slice(1, 3);
    if (secondaryRows) {
      if (rowsArticles.length > 0) {
        secondaryRows.style.display = 'flex';
        secondaryRows.innerHTML = rowsArticles.map(art => `
          <div class="j-row-card">
            <div class="j-row-img-wrap">
              <img src="${art.image}" alt="${art.title}" class="j-row-img" loading="lazy">
            </div>
            <div class="j-row-content">
              <span class="j-category-tag">${art.category}</span>
              <h3 class="j-row-title">${art.title}</h3>
              <p class="j-row-desc">${art.shortDescription}</p>
              <div class="j-row-footer">
                <span class="j-card-meta">By ${art.author} • ${art.readTime} • ${art.date}</span>
                <a href="article.html?id=${art.id}" class="j-card-read-link">
                  <span>Read Article</span>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                    <polyline points="12 5 19 12 12 19"></polyline>
                  </svg>
                </a>
              </div>
            </div>
          </div>
        `).join('');
      } else {
        secondaryRows.style.display = 'none';
      }
    }

    // Render Remaining Grid Stories (Index 3 to End)
    const gridArticles = articles.slice(3);
    if (storiesGrid) {
      if (gridArticles.length === 0 && articles.length <= 3) {
        storiesGrid.innerHTML = ``;
      } else {
        storiesGrid.innerHTML = gridArticles.map(art => `
          <article class="j-story-card">
            <div class="j-card-img-wrap">
              <span class="j-card-badge">${art.category}</span>
              <img src="${art.image}" alt="${art.title}" class="j-card-img" loading="lazy">
            </div>
            <div class="j-card-content">
              <span class="j-card-category">${art.category}</span>
              <h3 class="j-card-title">${art.title}</h3>
              <p class="j-card-excerpt">${art.shortDescription}</p>
              
              <div class="j-card-footer">
                <span class="j-card-meta">${art.readTime} • ${art.date}</span>
                <a href="article.html?id=${art.id}" class="j-card-read-link">
                  <span>Read Article</span>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                    <polyline points="12 5 19 12 12 19"></polyline>
                  </svg>
                </a>
              </div>
            </div>
          </article>
        `).join('');
      }
    }
  }

  // Filter Pill Listeners
  filterPills.forEach(pill => {
    pill.addEventListener('click', () => {
      filterPills.forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      activeFilter = pill.getAttribute('data-filter');
      renderJournalPage();
    });
  });

  // Search Input Listener
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      searchQuery = e.target.value;
      if (clearBtn) clearBtn.classList.toggle('visible', searchQuery.length > 0);
      renderJournalPage();
    });
  }

  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      if (searchInput) searchInput.value = '';
      searchQuery = '';
      clearBtn.classList.remove('visible');
      renderJournalPage();
    });
  }

  // Newsletter Form Listener
  if (newsletterForm) {
    newsletterForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const emailInput = document.getElementById('newsletter-email');
      const email = emailInput ? emailInput.value : '';
      if (typeof GrocoToast !== 'undefined') {
        GrocoToast.show(`🌱 Thank you for subscribing with <strong>${email}</strong>!`);
      } else {
        alert(`🌱 Thank you for subscribing with ${email}!`);
      }
      if (emailInput) emailInput.value = '';
    });
  }

  // Initial Journal Page Render
  renderJournalPage();
});
