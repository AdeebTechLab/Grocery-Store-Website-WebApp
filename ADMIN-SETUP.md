# Product Admin Panel — Setup Guide

The site now has a password-protected admin panel at **`/admin.html`** for
editing the product catalog (names, categories, prices, discounts, ratings,
badges, units, descriptions, and photos) without touching any code. Changes
made in the panel go live on the site immediately after **Save Changes** —
no redeploy needed.

## How it works

- `/admin-login.html` — login screen
- `/admin.html` — the product catalog editor
- `/api/*` — small serverless functions (already included, run automatically
  on Vercel) that handle login and reading/writing the product catalog
- Product data is stored in **Vercel Blob** storage, so edits persist across
  deployments. Photos you upload in the panel are also stored there.
- If Blob storage isn't set up yet, or nothing has been saved yet, the site
  falls back to the catalog bundled in `data/products-data.json` (the same
  58 products you already have today), so the public site never breaks.
- The storefront (`js/products-data.js`) now loads products from
  `/api/products` at runtime instead of a hardcoded array. If that request
  fails for any reason (offline, static hosting without the API, etc.) it
  falls back to a snapshot bundled directly in the same file, so the site
  keeps working either way.

## One-time setup on Vercel

### 1. Add environment variables
In your Vercel project → **Settings → Environment Variables**, add:

| Name | Value |
|---|---|
| `ADMIN_USERNAME` | the login username you want, e.g. `admin` |
| `ADMIN_PASSWORD` | a strong password |
| `SESSION_SECRET` | any long random string (e.g. generate one at randomkeygen.com) — this signs the login session, keep it secret |

Apply them to the **Production** environment (and Preview if you want admin
access on preview deployments too).

### 2. Add Vercel Blob storage
1. In your Vercel project, go to the **Storage** tab.
2. Click **Create Database → Blob**.
3. Connect it to this project.

Vercel automatically adds the required token to your project — no extra
env var needed on your end.

### 3. Install the dependency & redeploy
`package.json` already lists `@vercel/blob` as a dependency. Push a commit
(or click **Redeploy** in Vercel) so the new environment variables, the
`/api` folder and admin files, and the dependency all take effect.

## Using the panel

1. Go to `https://yourdomain.com/admin.html` (or `/admin-login.html`).
2. Log in with the username/password you set above.
3. Products are grouped into the same 12 fixed categories used by the
   storefront's filter pills (Fruits, Vegetables, Dairy & Eggs, etc.) —
   the category dropdown on each product only lets you pick from those, so
   the "Shop by category" filters on `products.html` never break.
4. Edit name, description, price, rating, review count, unit, and badge
   directly in the fields. Toggle **Apply a discount** to show a crossed-out
   old price.
5. Click **Change Photo** on any product to upload a new photo — it's
   resized client-side automatically so uploads stay small and fast. You can
   also just view the current image URL in the field if you'd rather keep
   the existing hotlinked photo.
6. Use **+ Add Product** inside any category card to add a new item, or the
   **Delete** button on a product card to remove one. Use the category
   dropdown on a product to move it to a different section.
7. Use the search box at the top to quickly find a product by name across
   all categories.
8. Click **Save Changes** at the top. The public site (`products.html`,
   `index.html`'s featured stage) updates right away.

## Notes & limits

- Sessions last 12 hours, then you'll need to log in again.
- Photo uploads are capped at a few MB after automatic compression — plenty
  for product photos.
- Only one admin account is supported (shared username/password). If you
  need multiple staff logins later, that's a bigger change — just ask.
- Categories are a fixed set of 12 matching the storefront's filter pills —
  adding a brand-new category (a 13th) requires also adding a matching
  filter pill in `products.html` and an entry in `CATEGORY_ORDER` in
  `js/admin.js` and `CATEGORIES` in `api/products.js`. Just ask if you'd
  like that added.
- Consider changing `ADMIN_PASSWORD` periodically, especially if staff turn
  over.
