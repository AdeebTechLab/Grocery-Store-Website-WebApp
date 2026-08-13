const fs = require('fs');
const path = require('path');
const { getSessionFromRequest, readJsonBody } = require('../lib/auth');
const { loadCategories } = require('./categories');

const PRODUCTS_PATHNAME = 'products-data.json';

const BADGE_TYPES = ['organic', 'bestseller', 'new', 'sale'];

function loadBundledDefault() {
  const filePath = path.join(__dirname, '..', 'data', 'products-data.json');
  const raw = fs.readFileSync(filePath, 'utf8');
  return JSON.parse(raw);
}

function validateProducts(data, categorySlugs) {
  if (!Array.isArray(data)) return 'Product data must be an array';

  const seenIds = new Set();

  for (const product of data) {
    if (!product || typeof product !== 'object') return 'Each product must be an object';

    if (typeof product.id !== 'string' || !product.id.trim()) {
      return 'Every product needs a non-empty id';
    }
    if (seenIds.has(product.id)) {
      return `Duplicate product id "${product.id}". Please refresh and try again.`;
    }
    seenIds.add(product.id);

    if (typeof product.name !== 'string' || !product.name.trim()) {
      return `Product "${product.id}" needs a non-empty name`;
    }

    if (!categorySlugs.has(product.categorySlug)) {
      return `Product "${product.name}" has an unrecognized category`;
    }

    if (typeof product.price !== 'number' || Number.isNaN(product.price) || product.price < 0) {
      return `Product "${product.name}" needs a valid non-negative price`;
    }

    if (product.oldPrice != null) {
      if (typeof product.oldPrice !== 'number' || Number.isNaN(product.oldPrice) || product.oldPrice < 0) {
        return `Product "${product.name}" has an invalid old price for its discount`;
      }
      if (product.oldPrice <= product.price) {
        return `Product "${product.name}"'s old price must be higher than its current price`;
      }
    }

    if (product.rating != null) {
      if (typeof product.rating !== 'number' || Number.isNaN(product.rating) || product.rating < 0 || product.rating > 5) {
        return `Product "${product.name}" needs a rating between 0 and 5`;
      }
    }

    if (product.reviews != null) {
      if (typeof product.reviews !== 'number' || Number.isNaN(product.reviews) || product.reviews < 0) {
        return `Product "${product.name}" needs a valid non-negative review count`;
      }
    }

    if (product.badgeType != null && !BADGE_TYPES.includes(product.badgeType)) {
      return `Product "${product.name}" has an unrecognized badge type`;
    }

    if (typeof product.image !== 'string' || !product.image.trim()) {
      return `Product "${product.name}" needs an image`;
    }
  }

  return null;
}

module.exports = async (req, res) => {
  if (req.method === 'GET') {
    // Try the live, admin-edited copy in Vercel Blob first. Fall back to the
    // JSON file bundled in the deployment so the site keeps working even
    // before Blob storage has been set up or before any edits have been saved.
    try {
      const { head } = require('@vercel/blob');
      const blob = await head(PRODUCTS_PATHNAME);
      const response = await fetch(blob.url, { cache: 'no-store' });
      if (!response.ok) throw new Error('blob fetch failed');
      const data = await response.json();
      res.setHeader('Cache-Control', 'no-store');
      res.status(200).json(data);
    } catch {
      try {
        const data = loadBundledDefault();
        res.setHeader('Cache-Control', 'no-store');
        res.status(200).json(data);
      } catch (err) {
        res.status(500).json({ error: 'Could not load product data: ' + err.message });
      }
    }
    return;
  }

  if (req.method === 'PUT') {
    const session = getSessionFromRequest(req);
    if (!session) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    let body;
    try {
      body = await readJsonBody(req);
    } catch {
      res.status(400).json({ error: 'Invalid request body' });
      return;
    }

    const categories = await loadCategories();
    const categorySlugs = new Set(categories.map((c) => c.slug));
    const validationError = validateProducts(body, categorySlugs);
    if (validationError) {
      res.status(400).json({ error: validationError });
      return;
    }

    try {
      const { put } = require('@vercel/blob');
      await put(PRODUCTS_PATHNAME, JSON.stringify(body, null, 2), {
        access: 'public',
        addRandomSuffix: false,
        allowOverwrite: true,
        contentType: 'application/json',
      });
      res.status(200).json({ ok: true });
    } catch (err) {
      res.status(500).json({
        error:
          'Failed to save products. Make sure Vercel Blob storage is connected to this project (' +
          err.message +
          ')',
      });
    }
    return;
  }

  res.status(405).json({ error: 'Method not allowed' });
};

module.exports.BADGE_TYPES = BADGE_TYPES;
