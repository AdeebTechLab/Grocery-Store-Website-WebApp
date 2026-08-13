(function () {
  'use strict';

  // Category taxonomy. Loaded from /api/categories on startup; editable
  // in-panel via "+ Add Category" and each section's "Delete Category".
  let CATEGORY_ORDER = [];
  let CATEGORY_TITLE_BY_SLUG = {};

  function rebuildCategoryLookup() {
    CATEGORY_TITLE_BY_SLUG = {};
    CATEGORY_ORDER.forEach((c) => { CATEGORY_TITLE_BY_SLUG[c.slug] = c.title; });
  }

  let products = [];
  let nextIdNum = 1;

  const authGate = document.getElementById('auth-gate');
  const app = document.getElementById('app');
  const usernameLabel = document.getElementById('username-label');
  const container = document.getElementById('categories-container');
  const jumpNav = document.getElementById('jump-nav');
  const searchInput = document.getElementById('admin-search-input');
  const saveBtn = document.getElementById('save-btn');
  const saveStatus = document.getElementById('save-status');
  const banner = document.getElementById('banner');
  const categoryTemplate = document.getElementById('category-template');
  const itemTemplate = document.getElementById('item-template');
  const addCategoryBtn = document.getElementById('add-category-btn');
  const scrollTopBtn = document.getElementById('scroll-top-btn');

  // --- Crop/fit modal elements ---
  const cropOverlay = document.getElementById('crop-modal-overlay');
  const cropCanvas = document.getElementById('crop-canvas');
  const cropCanvasWrap = document.querySelector('.crop-canvas-wrap');
  const cropCtx = cropCanvas.getContext('2d');
  const cropZoomRange = document.getElementById('crop-zoom-range');
  const cropSizeEstimate = document.getElementById('crop-size-estimate');
  const cropApplyBtn = document.getElementById('crop-apply-btn');
  const cropCloseBtns = document.querySelectorAll('.crop-modal-close');

  // Internal backing resolution of the crop canvas — matches the product
  // card's 4:3 photo area exactly, so "Apply" always produces an image that
  // fits the card with no letterboxing or stretching.
  const CROP_CANVAS_W = 720;
  const CROP_CANVAS_H = 540;
  cropCanvas.width = CROP_CANVAS_W;
  cropCanvas.height = CROP_CANVAS_H;

  let cropState = null;

  // --- Smart compression settings ---
  // Product cards display photos at well under 400px wide, so there's no
  // visual benefit to shipping much larger files. WebP gets a noticeably
  // smaller file than JPEG at the same visual quality, so we use it when the
  // browser supports encoding it and fall back to JPEG otherwise (older
  // Safari/iOS versions in particular).
  const UPLOAD_MAX_DIMENSION = 640;
  const WEBP_QUALITY = 0.8;
  const JPEG_QUALITY = 0.82;
  const SUPPORTS_WEBP = (() => {
    try {
      return document.createElement('canvas').toDataURL('image/webp').indexOf('data:image/webp') === 0;
    } catch {
      return false;
    }
  })();
  const UPLOAD_FORMAT = SUPPORTS_WEBP ? 'image/webp' : 'image/jpeg';
  const UPLOAD_QUALITY = SUPPORTS_WEBP ? WEBP_QUALITY : JPEG_QUALITY;
  const UPLOAD_EXT = SUPPORTS_WEBP ? '.webp' : '.jpg';

  function showBanner(message, type) {
    banner.textContent = message;
    banner.className = 'banner ' + type;
    banner.classList.remove('hidden');
  }

  function hideBanner() {
    banner.classList.add('hidden');
  }

  function imageSrc(image) {
    if (!image) return 'data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=';
    return image;
  }

  // --- Auth gate ---
  async function checkSession() {
    try {
      const res = await fetch('/api/session');
      const data = await res.json();
      if (!data.authenticated) {
        window.location.href = '/admin-login.html';
        return;
      }
      usernameLabel.textContent = data.username || '';
      authGate.classList.add('hidden');
      app.classList.remove('hidden');
      await loadCategories();
      await loadProducts();
    } catch (err) {
      authGate.textContent = 'Could not check your session. Please refresh.';
    }
  }

  // --- Load category taxonomy ---
  async function loadCategories() {
    try {
      const res = await fetch('/api/categories', { cache: 'no-store' });
      if (!res.ok) throw new Error('Failed to load categories (status ' + res.status + ')');
      CATEGORY_ORDER = await res.json();
      rebuildCategoryLookup();
    } catch (err) {
      showBanner('Could not load categories: ' + err.message, 'error');
    }
  }

  async function saveCategories() {
    const res = await fetch('/api/categories', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(CATEGORY_ORDER),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Save failed');
  }

  // --- Reorder categories (swap with the neighbor in `direction`: -1 up, 1 down) ---
  async function moveCategory(slug, direction) {
    const idx = CATEGORY_ORDER.findIndex((c) => c.slug === slug);
    const swapWith = idx + direction;
    if (idx === -1 || swapWith < 0 || swapWith >= CATEGORY_ORDER.length) return;

    const original = CATEGORY_ORDER.slice();
    const [moved] = CATEGORY_ORDER.splice(idx, 1);
    CATEGORY_ORDER.splice(swapWith, 0, moved);
    renderAll();

    try {
      await saveCategories();
    } catch (err) {
      CATEGORY_ORDER = original;
      rebuildCategoryLookup();
      renderAll();
      showBanner('Could not save the new category order: ' + err.message, 'error');
    }
  }

  // --- Load product data ---
  async function loadProducts() {
    try {
      const res = await fetch('/api/products', { cache: 'no-store' });
      if (!res.ok) throw new Error('Failed to load products (status ' + res.status + ')');
      products = await res.json();
      computeNextId();
      renderAll();
    } catch (err) {
      showBanner('Could not load the product catalog: ' + err.message, 'error');
    }
  }

  function computeNextId() {
    let max = 0;
    products.forEach((p) => {
      const match = /^p(\d+)$/.exec(String(p.id || ''));
      if (match) {
        const n = parseInt(match[1], 10);
        if (n > max) max = n;
      }
    });
    nextIdNum = max + 1;
  }

  // --- Rendering ---
  function renderAll() {
    container.innerHTML = '';
    jumpNav.innerHTML = '';

    CATEGORY_ORDER.forEach((cat) => {
      const catProducts = products.filter((p) => p.categorySlug === cat.slug);
      container.appendChild(renderCategory(cat, catProducts));

      const jumpLink = document.createElement('a');
      jumpLink.href = '#cat-section-' + cat.slug;
      jumpLink.textContent = `${cat.title} (${catProducts.length})`;
      jumpNav.appendChild(jumpLink);
    });

    applySearchFilter();
  }

  function renderCategory(cat, catProducts) {
    const node = categoryTemplate.content.firstElementChild.cloneNode(true);
    node.id = 'cat-section-' + cat.slug;
    node.querySelector('h2').textContent = cat.title;
    const countLabel = node.querySelector('.category-count');
    const itemsGrid = node.querySelector('.items-grid');
    const addItemBtn = node.querySelector('.add-item-btn');
    const deleteCategoryBtn = node.querySelector('.delete-category-btn');
    const confirmBox = node.querySelector('.category-delete-confirm');
    const confirmInput = node.querySelector('.category-delete-confirm-input');
    const confirmBtn = node.querySelector('.category-delete-confirm-btn');
    const cancelBtn = node.querySelector('.category-delete-cancel-btn');
    const moveUpBtn = node.querySelector('.move-category-up-btn');
    const moveDownBtn = node.querySelector('.move-category-down-btn');

    function updateCount() {
      const count = itemsGrid.querySelectorAll('.item-card').length;
      countLabel.textContent = count === 1 ? '1 product' : `${count} products`;
    }

    catProducts.forEach((product) => {
      itemsGrid.appendChild(renderItem(product));
    });
    updateCount();

    // Disable up/down arrows at the ends of the list so it's obvious there's
    // nowhere further to move.
    const catIndex = CATEGORY_ORDER.findIndex((c) => c.slug === cat.slug);
    moveUpBtn.disabled = catIndex <= 0;
    moveDownBtn.disabled = catIndex === -1 || catIndex >= CATEGORY_ORDER.length - 1;

    moveUpBtn.addEventListener('click', () => moveCategory(cat.slug, -1));
    moveDownBtn.addEventListener('click', () => moveCategory(cat.slug, 1));

    addItemBtn.addEventListener('click', () => {
      const newProduct = {
        id: 'p' + nextIdNum++,
        name: '',
        category: cat.title,
        categorySlug: cat.slug,
        price: 0,
        rating: 4.5,
        reviews: 0,
        image: '',
        badge: null,
        badgeType: null,
        unit: '',
        description: '',
      };
      products.push(newProduct);
      const itemNode = renderItem(newProduct);
      itemsGrid.appendChild(itemNode);
      updateCount();
      itemNode.scrollIntoView({ behavior: 'smooth', block: 'center' });
      const nameField = itemNode.querySelector('.item-name-input');
      if (nameField) nameField.focus();
    });

    // Keep the count in sync whenever an item inside this section is removed.
    itemsGrid.addEventListener('groco:item-removed', updateCount);

    // --- Delete category (requires typing "delete" to confirm) ---
    deleteCategoryBtn.addEventListener('click', () => {
      confirmBox.classList.remove('hidden');
      confirmInput.value = '';
      confirmBtn.disabled = true;
      confirmInput.focus();
    });

    cancelBtn.addEventListener('click', () => {
      confirmBox.classList.add('hidden');
      confirmInput.value = '';
    });

    confirmInput.addEventListener('input', () => {
      confirmBtn.disabled = confirmInput.value.trim().toLowerCase() !== 'delete';
    });

    confirmBtn.addEventListener('click', async () => {
      if (confirmInput.value.trim().toLowerCase() !== 'delete') return;
      const stillHasProducts = products.some((p) => p.categorySlug === cat.slug);
      if (stillHasProducts) {
        showBanner(
          `"${cat.title}" still has products in it. Move or delete them first, then delete the category.`,
          'error'
        );
        confirmBox.classList.add('hidden');
        return;
      }
      confirmBtn.disabled = true;
      confirmBtn.textContent = 'Deleting…';
      const idx = CATEGORY_ORDER.findIndex((c) => c.slug === cat.slug);
      try {
        if (idx !== -1) CATEGORY_ORDER.splice(idx, 1);
        rebuildCategoryLookup();
        await saveCategories();
        showBanner(`"${cat.title}" category deleted.`, 'success');
        renderAll();
      } catch (err) {
        // Roll back on failure so the in-memory list stays correct.
        CATEGORY_ORDER.splice(idx, 0, cat);
        rebuildCategoryLookup();
        showBanner('Could not delete category: ' + err.message, 'error');
        confirmBtn.disabled = false;
        confirmBtn.textContent = 'Confirm Delete';
      }
    });

    return node;
  }

  // --- Crop/fit modal ---
  // Opens the modal with `file` loaded onto the crop canvas and resolves
  // with a canvas containing exactly the cropped 4:3 region once the user
  // clicks "Apply & Upload", or null if they cancel.
  function openCropModal(file) {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onerror = () => resolve(null);
      reader.onload = () => {
        const image = new Image();
        image.onerror = () => resolve(null);
        image.onload = () => {
          const baseScale = Math.max(CROP_CANVAS_W / image.width, CROP_CANVAS_H / image.height);
          cropState = {
            image,
            zoom: 1,
            offsetX: 0,
            offsetY: 0,
            baseScale,
            dragging: false,
            lastX: 0,
            lastY: 0,
            resolve,
          };
          cropZoomRange.value = 100;
          centerCropImage();
          drawCrop();
          updateCropSizeEstimate();
          cropOverlay.classList.remove('hidden');
        };
        image.src = reader.result;
      };
      reader.readAsDataURL(file);
    });
  }

  function closeCropModal(result) {
    cropOverlay.classList.add('hidden');
    if (cropState) {
      const resolve = cropState.resolve;
      cropState = null;
      resolve(result);
    }
  }

  function centerCropImage() {
    const scale = cropState.baseScale * cropState.zoom;
    const drawW = cropState.image.width * scale;
    const drawH = cropState.image.height * scale;
    cropState.offsetX = (CROP_CANVAS_W - drawW) / 2;
    cropState.offsetY = (CROP_CANVAS_H - drawH) / 2;
  }

  // Keeps the image edge-to-edge with the frame — no empty gaps, whichever
  // way the user pans or zooms.
  function clampCropOffsets() {
    const scale = cropState.baseScale * cropState.zoom;
    const drawW = cropState.image.width * scale;
    const drawH = cropState.image.height * scale;
    const minX = CROP_CANVAS_W - drawW;
    const minY = CROP_CANVAS_H - drawH;
    cropState.offsetX = Math.min(0, Math.max(minX, cropState.offsetX));
    cropState.offsetY = Math.min(0, Math.max(minY, cropState.offsetY));
  }

  function drawCrop() {
    const { image, zoom, baseScale, offsetX, offsetY } = cropState;
    const scale = baseScale * zoom;
    cropCtx.clearRect(0, 0, CROP_CANVAS_W, CROP_CANVAS_H);
    cropCtx.drawImage(image, offsetX, offsetY, image.width * scale, image.height * scale);
  }

  function updateCropSizeEstimate() {
    if (!cropState) return;
    try {
      // Preview at the same downscale + format + quality that will actually
      // be uploaded, so the number shown is the real expected file size.
      let width = CROP_CANVAS_W;
      let height = CROP_CANVAS_H;
      if (width > UPLOAD_MAX_DIMENSION) {
        height = Math.round((height / width) * UPLOAD_MAX_DIMENSION);
        width = UPLOAD_MAX_DIMENSION;
      }
      const previewCanvas = document.createElement('canvas');
      previewCanvas.width = width;
      previewCanvas.height = height;
      previewCanvas.getContext('2d').drawImage(cropCanvas, 0, 0, width, height);
      const dataUrl = previewCanvas.toDataURL(UPLOAD_FORMAT, UPLOAD_QUALITY);
      const commaIdx = dataUrl.indexOf(',');
      const bytes = Math.round((dataUrl.length - commaIdx - 1) * 0.75);
      const kb = Math.max(1, Math.round(bytes / 1024));
      const formatLabel = SUPPORTS_WEBP ? 'WebP' : 'JPEG';
      cropSizeEstimate.textContent = `~${kb} KB (${formatLabel})`;
    } catch {
      cropSizeEstimate.textContent = '';
    }
  }

  cropZoomRange.addEventListener('input', () => {
    if (!cropState) return;
    const newZoom = cropZoomRange.value / 100;
    const oldScale = cropState.baseScale * cropState.zoom;
    const newScale = cropState.baseScale * newZoom;
    const cx = CROP_CANVAS_W / 2;
    const cy = CROP_CANVAS_H / 2;
    // Zoom around the frame's center so the visible subject doesn't jump.
    cropState.offsetX = cx - (cx - cropState.offsetX) * (newScale / oldScale);
    cropState.offsetY = cy - (cy - cropState.offsetY) * (newScale / oldScale);
    cropState.zoom = newZoom;
    clampCropOffsets();
    drawCrop();
    updateCropSizeEstimate();
  });

  function cropPointerPos(evt) {
    const touch = evt.touches && evt.touches[0];
    return touch ? { x: touch.clientX, y: touch.clientY } : { x: evt.clientX, y: evt.clientY };
  }

  function startCropDrag(evt) {
    if (!cropState) return;
    const p = cropPointerPos(evt);
    cropState.dragging = true;
    cropState.lastX = p.x;
    cropState.lastY = p.y;
  }

  function onCropDrag(evt) {
    if (!cropState || !cropState.dragging) return;
    const p = cropPointerPos(evt);
    const rect = cropCanvasWrap.getBoundingClientRect();
    const scaleFactor = CROP_CANVAS_W / rect.width;
    cropState.offsetX += (p.x - cropState.lastX) * scaleFactor;
    cropState.offsetY += (p.y - cropState.lastY) * scaleFactor;
    cropState.lastX = p.x;
    cropState.lastY = p.y;
    clampCropOffsets();
    drawCrop();
    if (evt.cancelable) evt.preventDefault();
  }

  function endCropDrag() {
    if (!cropState || !cropState.dragging) return;
    cropState.dragging = false;
    updateCropSizeEstimate();
  }

  cropCanvasWrap.addEventListener('mousedown', startCropDrag);
  cropCanvasWrap.addEventListener('touchstart', startCropDrag, { passive: true });
  window.addEventListener('mousemove', onCropDrag);
  window.addEventListener('touchmove', onCropDrag, { passive: false });
  window.addEventListener('mouseup', endCropDrag);
  window.addEventListener('touchend', endCropDrag);

  cropCloseBtns.forEach((btn) => btn.addEventListener('click', () => closeCropModal(null)));
  document.addEventListener('keydown', (evt) => {
    if (evt.key === 'Escape' && !cropOverlay.classList.contains('hidden')) closeCropModal(null);
  });

  cropApplyBtn.addEventListener('click', () => {
    if (!cropState) return;
    // Copy out the current pixels — the shared crop canvas gets reused for
    // the next photo, so the resolved result needs to be independent of it.
    const exportCanvas = document.createElement('canvas');
    exportCanvas.width = CROP_CANVAS_W;
    exportCanvas.height = CROP_CANVAS_H;
    exportCanvas.getContext('2d').drawImage(cropCanvas, 0, 0);
    closeCropModal(exportCanvas);
  });

  function renderItem(product) {
    const node = itemTemplate.content.firstElementChild.cloneNode(true);
    const img = node.querySelector('.item-photo-img');
    const photoInput = node.querySelector('.photo-input');
    const nameInput = node.querySelector('.item-name-input');
    const categorySelect = node.querySelector('.item-category-select');
    const descInput = node.querySelector('.item-desc-input');
    const priceInput = node.querySelector('.item-price-input');
    const badgeTypeSelect = node.querySelector('.item-badge-type-select');
    const badgeInput = node.querySelector('.item-badge-input');
    const discountInput = node.querySelector('.item-discount-input');
    const discountRow = node.querySelector('.item-discount-row');
    const oldPriceInput = node.querySelector('.item-oldprice-input');
    const ratingInput = node.querySelector('.item-rating-input');
    const reviewsInput = node.querySelector('.item-reviews-input');
    const unitInput = node.querySelector('.item-unit-input');
    const deleteBtn = node.querySelector('.delete-item-btn');

    img.src = imageSrc(product.image);
    img.alt = product.name || '';
    nameInput.value = product.name || '';

    CATEGORY_ORDER.forEach((cat) => {
      const opt = document.createElement('option');
      opt.value = cat.slug;
      opt.textContent = cat.title;
      if (cat.slug === product.categorySlug) opt.selected = true;
      categorySelect.appendChild(opt);
    });

    descInput.value = product.description || '';
    priceInput.value = product.price != null ? product.price : '';
    badgeTypeSelect.value = product.badgeType || '';
    badgeInput.value = product.badge || '';
    discountInput.checked = product.oldPrice != null;
    oldPriceInput.value = product.oldPrice != null ? product.oldPrice : '';
    discountRow.classList.toggle('hidden', !discountInput.checked);
    ratingInput.value = product.rating != null ? product.rating : '';
    reviewsInput.value = product.reviews != null ? product.reviews : '';
    unitInput.value = product.unit || '';

    nameInput.addEventListener('input', () => {
      product.name = nameInput.value;
      img.alt = nameInput.value;
    });

    categorySelect.addEventListener('change', () => {
      product.categorySlug = categorySelect.value;
      product.category = CATEGORY_TITLE_BY_SLUG[categorySelect.value] || product.category;
      // Moving a product to a different section requires a re-render so it
      // lands in the right category card and the counts stay accurate.
      renderAll();
    });

    descInput.addEventListener('input', () => {
      product.description = descInput.value || '';
    });

    priceInput.addEventListener('input', () => {
      const v = parseFloat(priceInput.value);
      product.price = Number.isNaN(v) ? 0 : v;
    });

    badgeTypeSelect.addEventListener('change', () => {
      product.badgeType = badgeTypeSelect.value || null;
    });

    badgeInput.addEventListener('input', () => {
      product.badge = badgeInput.value.trim() || null;
    });

    discountInput.addEventListener('change', () => {
      discountRow.classList.toggle('hidden', !discountInput.checked);
      if (discountInput.checked) {
        if (product.oldPrice == null) product.oldPrice = product.price || 0;
        oldPriceInput.value = product.oldPrice;
      } else {
        delete product.oldPrice;
        oldPriceInput.value = '';
      }
    });

    oldPriceInput.addEventListener('input', () => {
      const v = parseFloat(oldPriceInput.value);
      product.oldPrice = Number.isNaN(v) ? 0 : v;
    });

    ratingInput.addEventListener('input', () => {
      const v = parseFloat(ratingInput.value);
      product.rating = Number.isNaN(v) ? 0 : v;
    });

    reviewsInput.addEventListener('input', () => {
      const v = parseInt(reviewsInput.value, 10);
      product.reviews = Number.isNaN(v) ? 0 : v;
    });

    unitInput.addEventListener('input', () => {
      product.unit = unitInput.value || '';
    });

    photoInput.addEventListener('change', async () => {
      const file = photoInput.files[0];
      if (!file) return;
      try {
        const croppedCanvas = await openCropModal(file);
        if (!croppedCanvas) {
          photoInput.value = '';
          return;
        }
        img.style.opacity = '0.5';
        const dataUrl = await compressCanvas(croppedCanvas, UPLOAD_MAX_DIMENSION, UPLOAD_FORMAT, UPLOAD_QUALITY);
        const uploadFilename = file.name.replace(/\.[^.]+$/, '') + UPLOAD_EXT;
        const res = await fetch('/api/upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ filename: uploadFilename, dataUrl }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Upload failed');
        product.image = data.url;
        img.src = data.url;
      } catch (err) {
        showBanner('Photo upload failed: ' + err.message, 'error');
      } finally {
        img.style.opacity = '1';
        photoInput.value = '';
      }
    });

    deleteBtn.addEventListener('click', () => {
      if (!confirm(`Delete "${product.name || 'this product'}"?`)) return;
      const idx = products.indexOf(product);
      if (idx !== -1) products.splice(idx, 1);
      const grid = node.parentElement;
      node.remove();
      if (grid) grid.dispatchEvent(new CustomEvent('groco:item-removed', { bubbles: false }));
    });

    return node;
  }

  // Resizes/re-encodes the already-cropped canvas so uploads stay well under
  // Vercel's request body limit and use as little storage as possible, before
  // sending it to /api/upload. Since the source is already cropped to the
  // card's 4:3 ratio, this is a pure downscale — no letterboxing or
  // distortion. Prefers WebP (smaller at equal visual quality) and falls
  // back to JPEG if the browser can't encode WebP.
  function compressCanvas(sourceCanvas, maxDimension, format, quality) {
    return new Promise((resolve, reject) => {
      try {
        let width = sourceCanvas.width;
        let height = sourceCanvas.height;
        if (width > maxDimension || height > maxDimension) {
          if (width >= height) {
            height = Math.round((height / width) * maxDimension);
            width = maxDimension;
          } else {
            width = Math.round((width / height) * maxDimension);
            height = maxDimension;
          }
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(sourceCanvas, 0, 0, width, height);
        let dataUrl = canvas.toDataURL(format, quality);
        // Some browsers silently ignore an unsupported mime type and return
        // a PNG instead — catch that and fall back to JPEG so we never ship
        // an oversized, uncompressed image.
        if (format === 'image/webp' && dataUrl.indexOf('data:image/webp') !== 0) {
          dataUrl = canvas.toDataURL('image/jpeg', JPEG_QUALITY);
        }
        resolve(dataUrl);
      } catch (err) {
        reject(err instanceof Error ? err : new Error('Could not process the image'));
      }
    });
  }

  // --- Search filter (client-side only, doesn't touch saved data) ---
  function applySearchFilter() {
    const q = (searchInput.value || '').trim().toLowerCase();
    document.querySelectorAll('.item-card').forEach((card) => {
      const name = (card.querySelector('.item-name-input').value || '').toLowerCase();
      const match = !q || name.includes(q);
      card.classList.toggle('item-filtered-out', !match);
    });
    document.querySelectorAll('.category-card').forEach((section) => {
      const hasVisible = !!section.querySelector('.item-card:not(.item-filtered-out)');
      section.classList.toggle('hidden', !!q && !hasVisible);
    });
  }
  searchInput.addEventListener('input', applySearchFilter);

  // --- Save ---
  saveBtn.addEventListener('click', async () => {
    hideBanner();
    const validationError = validate();
    if (validationError) {
      showBanner(validationError, 'error');
      return;
    }
    saveBtn.disabled = true;
    saveStatus.textContent = 'Saving…';
    saveStatus.className = 'save-status';
    try {
      const res = await fetch('/api/products', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(products),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Save failed');
      saveStatus.textContent = 'Saved ✓';
      saveStatus.className = 'save-status ok';
      showBanner('Catalog saved. Changes are live on the site now.', 'success');
    } catch (err) {
      saveStatus.textContent = 'Save failed';
      saveStatus.className = 'save-status err';
      showBanner('Could not save: ' + err.message, 'error');
    } finally {
      saveBtn.disabled = false;
      setTimeout(() => { saveStatus.textContent = ''; }, 4000);
    }
  });

  function validate() {
    const seenIds = new Set();
    for (const product of products) {
      if (!product.name || !product.name.trim()) {
        return `A product in "${CATEGORY_TITLE_BY_SLUG[product.categorySlug] || 'a category'}" is missing a name.`;
      }
      if (!CATEGORY_TITLE_BY_SLUG[product.categorySlug]) {
        return `"${product.name}" has an invalid category.`;
      }
      if (product.price == null || Number.isNaN(product.price) || product.price < 0) {
        return `"${product.name}" needs a valid price.`;
      }
      if (product.oldPrice != null) {
        if (Number.isNaN(product.oldPrice) || product.oldPrice < 0) {
          return `"${product.name}" needs a valid old price for its discount.`;
        }
        if (product.oldPrice <= product.price) {
          return `"${product.name}"'s old price must be higher than its current price for the discount to show.`;
        }
      }
      if (product.rating != null && (Number.isNaN(product.rating) || product.rating < 0 || product.rating > 5)) {
        return `"${product.name}" needs a rating between 0 and 5.`;
      }
      if (!product.image || !product.image.trim()) {
        return `"${product.name}" needs a photo.`;
      }
      if (seenIds.has(product.id)) {
        return `Duplicate product id detected for "${product.name}". Please refresh and try again.`;
      }
      seenIds.add(product.id);
    }
    return null;
  }

  // --- Add category ---
  function slugify(title) {
    return title
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  addCategoryBtn.addEventListener('click', async () => {
    const title = window.prompt('New category name (e.g. "Baby Care"):');
    if (title == null) return;
    const trimmed = title.trim();
    if (!trimmed) {
      showBanner('Category name cannot be empty.', 'error');
      return;
    }
    const slug = slugify(trimmed);
    if (!slug) {
      showBanner('That name could not be turned into a valid category id. Try letters or numbers.', 'error');
      return;
    }
    if (CATEGORY_TITLE_BY_SLUG[slug]) {
      showBanner(`A category with that name already exists.`, 'error');
      return;
    }

    const newCategory = { slug, title: trimmed };
    CATEGORY_ORDER.push(newCategory);
    rebuildCategoryLookup();
    addCategoryBtn.disabled = true;
    try {
      await saveCategories();
      showBanner(`"${trimmed}" category added.`, 'success');
      renderAll();
    } catch (err) {
      const idx = CATEGORY_ORDER.indexOf(newCategory);
      if (idx !== -1) CATEGORY_ORDER.splice(idx, 1);
      rebuildCategoryLookup();
      showBanner('Could not add category: ' + err.message, 'error');
    } finally {
      addCategoryBtn.disabled = false;
    }
  });

  // --- Logout ---
  document.getElementById('logout-btn').addEventListener('click', async () => {
    await fetch('/api/logout', { method: 'POST' });
    window.location.href = '/admin-login.html';
  });

  // --- Scroll to top ---
  window.addEventListener('scroll', () => {
    scrollTopBtn.classList.toggle('scroll-top-btn-hidden', window.scrollY < 400);
  });
  scrollTopBtn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  checkSession();
})();
