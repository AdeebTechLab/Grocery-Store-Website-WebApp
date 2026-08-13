/**
 * Groco Dedicated Article Reader Engine (article.js)
 */

document.addEventListener('DOMContentLoaded', () => {
  const urlParams = new URLSearchParams(window.location.search);
  const articleId = urlParams.get('id');

  const mainView = document.getElementById('article-main-view');
  const notFoundView = document.getElementById('article-404-container');

  const bcTitle = document.getElementById('art-bc-title');
  const catBadge = document.getElementById('art-cat-badge');
  const mainTitle = document.getElementById('art-main-title');
  const subtitleLead = document.getElementById('art-subtitle-lead');
  const authorEl = document.getElementById('art-author');
  const metaLine = document.getElementById('art-meta-line');
  const heroImg = document.getElementById('art-hero-img');
  const bodyContent = document.getElementById('art-body-content');
  const relatedGrid = document.getElementById('related-grid');

  const shareBtn = document.getElementById('btn-share-article');
  const bookmarkBtn = document.getElementById('btn-bookmark-article');
  const bookmarkLabel = document.getElementById('bookmark-label');
  const progressBar = document.getElementById('reading-progress-bar');

  if (typeof GROCO_JOURNAL_ARTICLES === 'undefined') return;

  // 1. Find requested article by ID or slug
  let article = null;
  if (articleId) {
    article = GROCO_JOURNAL_ARTICLES.find(a => a.id === articleId || a.slug === articleId);
  }

  // 2. Handle Article Not Found 404 State
  if (!article) {
    if (mainView) mainView.style.display = 'none';
    if (notFoundView) notFoundView.style.display = 'block';
    document.title = 'Article Not Found — Groco Journal';
    return;
  }

  // Hide 404 & Show Main View
  if (notFoundView) notFoundView.style.display = 'none';
  if (mainView) mainView.style.display = 'block';

  // 3. Set Document Title & Header Fields
  document.title = `${article.title} — Groco Journal`;

  if (bcTitle) bcTitle.textContent = article.title;
  if (catBadge) catBadge.textContent = article.category;
  if (mainTitle) mainTitle.textContent = article.title;
  if (subtitleLead) subtitleLead.textContent = article.shortDescription;
  if (authorEl) authorEl.textContent = article.author || 'Groco Editorial Team';
  if (metaLine) metaLine.textContent = `${article.date} • ${article.readTime}`;

  // 4. Hero Image Entrance Animation
  if (heroImg) {
    heroImg.src = article.image;
    heroImg.alt = article.title;
    heroImg.style.opacity = '0';
    heroImg.style.transform = 'scale(0.97)';
    heroImg.style.transition = 'transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.5s ease';

    requestAnimationFrame(() => {
      heroImg.style.opacity = '1';
      heroImg.style.transform = 'scale(1)';
    });
  }

  // 5. Render Article Body Content
  if (bodyContent) {
    bodyContent.innerHTML = article.content;
  }

  // 6. Share Button Listener
  if (shareBtn) {
    shareBtn.addEventListener('click', () => {
      if (navigator.share) {
        navigator.share({
          title: article.title,
          text: article.shortDescription,
          url: window.location.href
        }).catch(() => {});
      } else {
        navigator.clipboard.writeText(window.location.href).then(() => {
          if (typeof GrocoToast !== 'undefined') {
            GrocoToast.show('🔗 Article link copied to clipboard!');
          } else {
            alert('🔗 Article link copied to clipboard!');
          }
        });
      }
    });
  }

  // 7. Bookmark State Persistence (localStorage)
  const bookmarkedKey = `groco_bookmark_${article.id}`;
  let isBookmarked = localStorage.getItem(bookmarkedKey) === 'true';

  function updateBookmarkUI() {
    if (!bookmarkBtn) return;
    if (isBookmarked) {
      bookmarkBtn.classList.add('bookmarked');
      if (bookmarkLabel) bookmarkLabel.textContent = '🔖 Saved';
    } else {
      bookmarkBtn.classList.remove('bookmarked');
      if (bookmarkLabel) bookmarkLabel.textContent = '🔖 Save Story';
    }
  }
  updateBookmarkUI();

  if (bookmarkBtn) {
    bookmarkBtn.addEventListener('click', () => {
      isBookmarked = !isBookmarked;
      localStorage.setItem(bookmarkedKey, isBookmarked ? 'true' : 'false');
      updateBookmarkUI();
      const msg = isBookmarked ? `🔖 Saved <strong>${article.title}</strong> to reading list!` : `Removed story from reading list.`;
      if (typeof GrocoToast !== 'undefined') {
        GrocoToast.show(msg);
      }
    });
  }

  // 8. Top Reading Progress Indicator
  window.addEventListener('scroll', () => {
    if (!progressBar) return;
    const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
    if (totalHeight > 0) {
      const progress = Math.min(Math.max((window.scrollY / totalHeight) * 100, 0), 100);
      progressBar.style.width = `${progress}%`;
    }
  });

  // 9. Populate Related Articles ("You May Also Like")
  if (relatedGrid) {
    // Select related articles sharing category or tags first, fallback to others
    let related = GROCO_JOURNAL_ARTICLES.filter(a => a.id !== article.id && a.category === article.category);
    if (related.length < 3) {
      const extra = GROCO_JOURNAL_ARTICLES.filter(a => a.id !== article.id && !related.includes(a));
      related = [...related, ...extra];
    }
    related = related.slice(0, 3);

    relatedGrid.innerHTML = related.map(rel => `
      <article class="related-card">
        <div class="related-img-wrap">
          <span class="related-badge">${escapeHTML(rel.category)}</span>
          <img src="${escapeHTML(rel.image)}" alt="${escapeHTML(rel.title)}" class="related-img" loading="lazy">
        </div>
        <div class="related-content">
          <h3 class="related-card-title">${escapeHTML(rel.title)}</h3>
          <p class="related-excerpt">${escapeHTML(rel.shortDescription)}</p>
          
          <div class="related-footer">
            <span class="related-meta">${escapeHTML(rel.readTime)} • ${escapeHTML(rel.date)}</span>
            <a href="article.html?id=${rel.id}" class="related-read-link">
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

});
