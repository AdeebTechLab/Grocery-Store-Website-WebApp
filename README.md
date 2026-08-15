# Groco — Grocery Store Website / WebApp

A multi-page, front-end-only grocery store website: a marketing homepage, a searchable product catalog, and a blog ("Journal") with individual article pages. Built with plain HTML, CSS, and vanilla JavaScript — no frameworks, no build step, no backend.

## Project Structure

```
Grocery-Store-Website-WebApp-main/
├── index.html                  Homepage
├── products.html                Product catalog page
├── journal.html                 Journal / blog listing page
├── article.html                 Single article reader page
│
├── css/
│   ├── styles.css               Core site-wide styles (used by index & products)
│   ├── products.css             Product catalog page styles
│   ├── journal.css              Journal listing page styles
│   ├── article.css              Article reader page styles
│   └── groco-shared-widgets.css Shared widgets used on every page (navbar, footer, cart drawer, toasts, modal)
│
├── js/
│   ├── script.js                 Homepage interactivity (nav, hero, category showcase, testimonials, animations)
│   ├── products-data.js          Product catalog dataset + helper functions (e.g. getProductById)
│   ├── products-core.js          Shared cart & wishlist engine, cart drawer, quick-view modal, toasts (loaded on every page)
│   ├── products.js               Product catalog page logic (filtering, sorting, search, rendering)
│   ├── articles.js               Shared journal/article dataset (used by homepage, journal, and article pages)
│   ├── journal.js                Journal listing page logic (filtering, search, rendering)
│   └── article.js                Article reader page logic (loading an article by ID, related articles, bookmarking)
│
├── assets/                       Images (avatars, hero product image)
├── LICENSE                       MIT License
└── README.md
```

## Pages

- **Homepage (`index.html`)** — hero section, animated category showcase, a rotating "featured product" stage, testimonials carousel, and a preview of the latest journal articles.
- **Products (`products.html`)** — full catalog of 58 products across 12 categories, with live search, category filter pills, and sorting (price, rating, newest).
- **Journal (`journal.html`)** — blog-style listing of articles with a featured hero story, category filter pills, and search.
- **Article (`article.html`)** — single article reader with a reading-progress bar, share and bookmark actions, and related-articles suggestions, loaded dynamically by article ID from the URL (`?id=...`).

## Features

- 🛒 **Shopping cart** — add to cart, adjust quantities, remove items, persisted in `localStorage` and shared across every page via a slide-out cart drawer.
- ❤️ **Wishlist** — save products for later, persisted in `localStorage`.
- 🔍 **Search & filtering** — instant search and category filters on both the product catalog and the journal.
- 👁️ **Quick View modal** — preview a product's details without leaving the catalog.
- 🔖 **Article bookmarking** — mark articles as read-later, persisted per-article in `localStorage`.
- 📖 **Reading progress bar** — visual scroll progress indicator on article pages.
- ✈️ **"Fly to cart" animation** — animated product image flies to the cart icon on add-to-cart.
- 🔔 **Toast notifications** — lightweight feedback messages for cart/wishlist/newsletter actions.
- 📬 **Newsletter signup** — footer subscribe form (demo only, no backend).
- 📱 **Responsive design** — mobile navigation menu and responsive layouts across all pages.
- ✨ **Scroll animations** — fade/slide-in effects as sections enter the viewport on the homepage.
