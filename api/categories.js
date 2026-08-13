const fs = require('fs');
const path = require('path');
const { getSessionFromRequest, readJsonBody } = require('../lib/auth');

const CATEGORIES_PATHNAME = 'categories-data.json';

function loadBundledDefault() {
  const filePath = path.join(__dirname, '..', 'data', 'categories-data.json');
  const raw = fs.readFileSync(filePath, 'utf8');
  return JSON.parse(raw);
}

// Reads the live, admin-edited category list from Blob storage, falling
// back to the bundled default so the site keeps working before any edits
// have been saved. Exported so api/products.js can validate against the
// same taxonomy without duplicating it.
async function loadCategories() {
  try {
    const { head } = require('@vercel/blob');
    const blob = await head(CATEGORIES_PATHNAME);
    const response = await fetch(blob.url, { cache: 'no-store' });
    if (!response.ok) throw new Error('blob fetch failed');
    return await response.json();
  } catch {
    return loadBundledDefault();
  }
}

const SLUG_RE = /^[a-z0-9]+(-[a-z0-9]+)*$/;

function validateCategories(data) {
  if (!Array.isArray(data)) return 'Category data must be an array';
  if (data.length === 0) return 'There must be at least one category';

  const seenSlugs = new Set();
  for (const cat of data) {
    if (!cat || typeof cat !== 'object') return 'Each category must be an object';
    if (typeof cat.slug !== 'string' || !SLUG_RE.test(cat.slug)) {
      return `"${cat.slug}" is not a valid category slug`;
    }
    if (typeof cat.title !== 'string' || !cat.title.trim()) {
      return `Category "${cat.slug}" needs a non-empty title`;
    }
    if (seenSlugs.has(cat.slug)) {
      return `Duplicate category slug "${cat.slug}"`;
    }
    seenSlugs.add(cat.slug);
  }
  return null;
}

module.exports = async (req, res) => {
  if (req.method === 'GET') {
    try {
      const data = await loadCategories();
      res.setHeader('Cache-Control', 'no-store');
      res.status(200).json(data);
    } catch (err) {
      res.status(500).json({ error: 'Could not load categories: ' + err.message });
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

    const validationError = validateCategories(body);
    if (validationError) {
      res.status(400).json({ error: validationError });
      return;
    }

    try {
      const { put } = require('@vercel/blob');
      await put(CATEGORIES_PATHNAME, JSON.stringify(body, null, 2), {
        access: 'public',
        addRandomSuffix: false,
        allowOverwrite: true,
        contentType: 'application/json',
      });
      res.status(200).json({ ok: true });
    } catch (err) {
      res.status(500).json({
        error:
          'Failed to save categories. Make sure Vercel Blob storage is connected to this project (' +
          err.message +
          ')',
      });
    }
    return;
  }

  res.status(405).json({ error: 'Method not allowed' });
};

module.exports.loadCategories = loadCategories;
