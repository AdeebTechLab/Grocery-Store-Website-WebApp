/* ==========================================================================
   GROCO HOMEPAGE HERO SECTION - JAVASCRIPT
   Lightweight interactive logic for mobile menu toggle, active nav states & buttons.
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  // Elements
  const mobileToggle = document.getElementById('mobile-toggle');
  const navMenu = document.getElementById('nav-menu');
  const navLinks = document.querySelectorAll('.nav-link');
  const cartBtn = document.getElementById('cart-btn');
  const cartBadge = document.querySelector('.cart-badge');
  const searchBtn = document.getElementById('search-btn');
  const userBtn = document.getElementById('user-btn');

  let cartCount = 0;

  // Mobile Hamburger Menu Toggle
  if (mobileToggle && navMenu) {
    mobileToggle.addEventListener('click', () => {
      navMenu.classList.toggle('active');
      mobileToggle.classList.toggle('active');
    });
  }



  // Interactive Cart Counter Increment Animation
  if (cartBtn && cartBadge) {
    cartBtn.addEventListener('click', () => {
      cartCount++;
      cartBadge.textContent = cartCount;
      
      // Bump animation
      cartBadge.style.transform = 'scale(1.4)';
      setTimeout(() => {
        cartBadge.style.transform = 'scale(1)';
      }, 200);
    });
  }

  // Subtle Interactive Feedback on Search & User Buttons
  [searchBtn, userBtn].forEach(btn => {
    if (btn) {
      btn.addEventListener('click', () => {
        btn.style.transform = 'scale(0.92)';
        setTimeout(() => {
          btn.style.transform = '';
        }, 150);
      });
    }
  });

  // Staggered Entrance Animations for Why Choose Us Benefit Pills
  const benefitPills = document.querySelectorAll('.benefit-pill');
  if (benefitPills.length > 0 && 'IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          benefitPills.forEach((pill, idx) => {
            setTimeout(() => {
              pill.style.opacity = '1';
              pill.style.transform = 'translateY(0)';
            }, idx * 100);
          });
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.2 });

    const wcuSection = document.querySelector('.why-choose-us-section');
    if (wcuSection) {
      benefitPills.forEach(pill => {
        pill.style.opacity = '0';
        pill.style.transform = 'translateY(20px)';
        pill.style.transition = 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)';
      });
      observer.observe(wcuSection);
    }
  }

  // --------------------------------------------------------------------------
  // PRODUCTS SHOWCASE INTERACTIVITY & CAROUSEL
  // --------------------------------------------------------------------------
  const catTabs = document.querySelectorAll('.cat-tab');
  const productCards = document.querySelectorAll('.product-card');
  const productTrack = document.getElementById('product-track');
  const prodPrev = document.getElementById('prod-prev');
  const prodNext = document.getElementById('prod-next');
  const prodDots = document.querySelectorAll('#prod-dots .dot');

  let currentSlide = 0;
  const maxSlides = 3;
  // --------------------------------------------------------------------------
  // --------------------------------------------------------------------------
  // HOMEPAGE EDITORIAL FLOATING PRODUCT STAGE SHOWCASE ENGINE
  // --------------------------------------------------------------------------
  const stageLayout = document.getElementById('showcase-stage-layout');
  const stageCatTabs = document.querySelectorAll('#stage-category-tabs .cat-tab');
  const stageCatBadge = document.getElementById('stage-cat-badge');
  const stageProdName = document.getElementById('stage-prod-name');
  const stageProdRating = document.getElementById('stage-prod-rating');
  const stageProdReviews = document.getElementById('stage-prod-reviews');
  const stageProdUnit = document.getElementById('stage-prod-unit');
  const stageProdPrice = document.getElementById('stage-prod-price');
  const stageProdOldPrice = document.getElementById('stage-prod-old-price');
  const stageProdDiscount = document.getElementById('stage-prod-discount');
  const stageProdDesc = document.getElementById('stage-prod-desc');
  const stageAddCartBtn = document.getElementById('stage-add-cart-btn');
  const stageQuickviewBtn = document.getElementById('stage-quickview-btn');
  const centerFeaturedImg = document.getElementById('center-featured-img');
  const satellitesContainer = document.getElementById('satellites-container');
  const stagePrevBtn = document.getElementById('stage-prev');
  const stageNextBtn = document.getElementById('stage-next');
  const stageDotsContainer = document.getElementById('stage-dots');
  const stagePauseIndicator = document.getElementById('stage-pause-indicator');

  let activeStageCategory = 'all';
  let stageProducts = [];
  let currentActiveIndex = 0;
  let stageAutoTimer = null;
  let isHoverPaused = false;

  function updateFeaturedDisplay(index, animate = true) {
    if (!stageProducts.length) return;
    currentActiveIndex = index % stageProducts.length;
    const p = stageProducts[currentActiveIndex];

    if (animate && centerFeaturedImg) {
      centerFeaturedImg.style.transform = 'scale(0.88)';
      centerFeaturedImg.style.opacity = '0.4';
      if (stageProdName) stageProdName.style.opacity = '0.4';
      if (stageProdDesc) stageProdDesc.style.opacity = '0.4';
    }

    setTimeout(() => {
      // Update Info Panel
      if (stageCatBadge) stageCatBadge.textContent = (p.category || 'FRESH').toUpperCase();
      if (stageProdName) stageProdName.textContent = p.name;
      if (stageProdRating) stageProdRating.textContent = p.rating || '4.8';
      if (stageProdReviews) stageProdReviews.textContent = `(${p.reviews || 120} reviews)`;
      if (stageProdUnit) stageProdUnit.textContent = p.unit || '1 kg / Pack';
      
      const calcPrice = Math.round((p.price || 3.99) * 60);
      if (stageProdPrice) stageProdPrice.textContent = `Rs. ${calcPrice} / ${p.unit ? p.unit.split(' ')[0] : 'kg'}`;
      
      if (p.oldPrice) {
        const calcOld = Math.round(p.oldPrice * 60);
        if (stageProdOldPrice) {
          stageProdOldPrice.textContent = `Rs. ${calcOld}`;
          stageProdOldPrice.style.display = 'inline';
        }
        if (stageProdDiscount) {
          const discountPct = Math.round(((p.oldPrice - p.price) / p.oldPrice) * 100);
          stageProdDiscount.textContent = `${discountPct}% OFF`;
          stageProdDiscount.style.display = 'inline';
        }
      } else {
        if (stageProdOldPrice) stageProdOldPrice.style.display = 'none';
        if (stageProdDiscount) stageProdDiscount.style.display = 'none';
      }

      if (stageProdDesc) {
        stageProdDesc.textContent = p.description || "Handpicked organic favorites delivered peak-fresh to your kitchen everyday.";
      }

      if (centerFeaturedImg) {
        centerFeaturedImg.src = p.image;
        centerFeaturedImg.alt = p.name;
        centerFeaturedImg.style.transform = 'scale(1)';
        centerFeaturedImg.style.opacity = '1';
      }
      if (stageProdName) stageProdName.style.opacity = '1';
      if (stageProdDesc) stageProdDesc.style.opacity = '1';

      // Update Satellites Container
      renderSatellites();
      // Update Progress Dots
      updateProgressDots();
    }, animate ? 150 : 0);
  }

  function renderSatellites() {
    if (!satellitesContainer) return;
    satellitesContainer.innerHTML = '';

    // Create satellite nodes for products other than currentActiveIndex
    let posCount = 0;
    stageProducts.forEach((prod, idx) => {
      if (idx === currentActiveIndex) return;
      if (posCount >= 7) return;

      const node = document.createElement('div');
      node.className = 'satellite-product-node';
      node.setAttribute('data-pos', posCount);
      node.setAttribute('data-idx', idx);

      node.innerHTML = `
        <div class="sat-img-box">
          <img src="${prod.image}" alt="${prod.name}" loading="lazy">
          <span class="sat-tooltip">${prod.name}</span>
        </div>
      `;

      node.addEventListener('click', () => {
        updateFeaturedDisplay(idx, true);
        restartAutoSlide();
      });

      satellitesContainer.appendChild(node);
      posCount++;
    });
  }

  function updateProgressDots() {
    if (!stageDotsContainer) return;
    stageDotsContainer.innerHTML = stageProducts.map((_, i) => `
      <span class="dot ${i === currentActiveIndex ? 'active' : ''}" data-idx="${i}"></span>
    `).join('');

    stageDotsContainer.querySelectorAll('.dot').forEach(dot => {
      dot.addEventListener('click', () => {
        const idx = parseInt(dot.getAttribute('data-idx'));
        updateFeaturedDisplay(idx, true);
        restartAutoSlide();
      });
    });
  }

  function renderStageProducts(categorySlug = 'all') {
    if (typeof GROCO_PRODUCTS === 'undefined') return;

    let filtered = GROCO_PRODUCTS;
    if (categorySlug !== 'all') {
      filtered = GROCO_PRODUCTS.filter(p => p.categorySlug === categorySlug);
    }
    if (filtered.length === 0) filtered = GROCO_PRODUCTS;

    stageProducts = filtered.slice(0, 8); // Select up to 8 items
    currentActiveIndex = 0;
    updateFeaturedDisplay(0, false);
  }

  function startAutoSlide() {
    stopAutoSlide();
    stageAutoTimer = setInterval(() => {
      if (!isHoverPaused && stageProducts.length > 0) {
        const nextIdx = (currentActiveIndex + 1) % stageProducts.length;
        updateFeaturedDisplay(nextIdx, true);
      }
    }, 4500);
  }

  function stopAutoSlide() {
    if (stageAutoTimer) clearInterval(stageAutoTimer);
  }

  function restartAutoSlide() {
    stopAutoSlide();
    startAutoSlide();
  }

  // Hover Pause Interaction
  if (stageLayout) {
    stageLayout.addEventListener('mouseenter', () => {
      isHoverPaused = true;
      if (stagePauseIndicator) stagePauseIndicator.classList.add('show');
    });

    stageLayout.addEventListener('mouseleave', () => {
      isHoverPaused = false;
      if (stagePauseIndicator) stagePauseIndicator.classList.remove('show');
    });
  }

  // Next / Prev Arrows
  if (stageNextBtn) {
    stageNextBtn.addEventListener('click', () => {
      if (stageProducts.length > 0) {
        const nextIdx = (currentActiveIndex + 1) % stageProducts.length;
        updateFeaturedDisplay(nextIdx, true);
        restartAutoSlide();
      }
    });
  }

  if (stagePrevBtn) {
    stagePrevBtn.addEventListener('click', () => {
      if (stageProducts.length > 0) {
        const prevIdx = (currentActiveIndex - 1 + stageProducts.length) % stageProducts.length;
        updateFeaturedDisplay(prevIdx, true);
        restartAutoSlide();
      }
    });
  }

  // Add to Cart Button Action
  if (stageAddCartBtn) {
    stageAddCartBtn.addEventListener('click', () => {
      if (!stageProducts.length) return;
      const activeProd = stageProducts[currentActiveIndex];

      // Add to GrocoCart if engine available
      if (typeof GrocoCart !== 'undefined' && typeof GrocoCart.addToCart === 'function') {
        GrocoCart.addToCart(activeProd.id, 1, centerFeaturedImg);
      } else {
        // Fallback cart badge update
        if (cartBtn && cartBadge) {
          cartCount++;
          cartBadge.textContent = cartCount;
          cartBadge.style.transform = 'scale(1.4)';
          setTimeout(() => cartBadge.style.transform = 'scale(1)', 200);
        }
        if (typeof GrocoToast !== 'undefined') {
          GrocoToast.show(`Fresh <strong>${activeProd.name}</strong> added to cart! 🛍️`);
        }
      }

      // Button compression feedback animation
      stageAddCartBtn.style.transform = 'scale(0.92)';
      const btnText = stageAddCartBtn.querySelector('.btn-text');
      if (btnText) {
        const oldText = btnText.textContent;
        btnText.textContent = '✓ Added to Cart!';
        setTimeout(() => {
          stageAddCartBtn.style.transform = '';
          btnText.textContent = oldText;
        }, 1200);
      }
    });
  }

  // Quick View Button Action
  if (stageQuickviewBtn) {
    stageQuickviewBtn.addEventListener('click', () => {
      if (!stageProducts.length) return;
      const activeProd = stageProducts[currentActiveIndex];
      if (typeof QuickViewModal !== 'undefined' && typeof QuickViewModal.open === 'function') {
        QuickViewModal.open(activeProd.id);
      }
    });
  }

  // Category Filter Pill Click Handlers
  stageCatTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      stageCatTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      activeStageCategory = tab.getAttribute('data-category');
      renderStageProducts(activeStageCategory);
      restartAutoSlide();
    });
  });

  // Initialize Showcase Stage
  renderStageProducts('all');
  // --------------------------------------------------------------------------
  // HOMEPAGE EDITORIAL INTERACTIVE CATEGORIES SHOWCASE ENGINE
  // --------------------------------------------------------------------------
  // --------------------------------------------------------------------------
  // HOMEPAGE EDITORIAL INTERACTIVE CATEGORIES SHOWCASE ENGINE
  // --------------------------------------------------------------------------
  const CATEGORY_SHOWCASE_DATA = {
    fruits: {
      name: "Fruits",
      slogan: "Fresh & Naturally Sweet",
      subtext: "Fresh organic fruits picked at peak ripeness for everyday nutrition.",
      count: "45+ Products",
      image: "https://images.unsplash.com/photo-1619566636858-adf3ef46400b?auto=format&fit=crop&w=800&q=80",
      slug: "fruits"
    },
    vegetables: {
      name: "Vegetables",
      slogan: "Farm Fresh & Nutritious",
      subtext: "Nutrient-rich organic vegetables harvested daily from local eco farms.",
      count: "60+ Products",
      image: "https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=800&q=80",
      slug: "vegetables"
    },
    dairy: {
      name: "Dairy & Eggs",
      slogan: "Pure & Fresh Dairy",
      subtext: "Fresh farm milk, organic eggs & artisanal cheeses rich in calcium.",
      count: "30+ Products",
      image: "https://images.unsplash.com/photo-1628088062854-d1870b4553da?auto=format&fit=crop&w=800&q=80",
      slug: "dairy"
    },
    beverages: {
      name: "Beverages",
      slogan: "Refreshing & Healthy Juices",
      subtext: "100% natural cold-pressed juices, sparkling drinks & wellness teas.",
      count: "25+ Products",
      image: "https://images.unsplash.com/photo-1613478223719-2ab802602423?auto=format&fit=crop&w=800&q=80",
      slug: "beverages"
    },
    bakery: {
      name: "Bakery & Bread",
      slogan: "Freshly Baked Every Day",
      subtext: "Warm artisanal sourdoughs, butter croissants & breakfast muffins.",
      count: "35+ Products",
      image: "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=800&q=80",
      slug: "bakery"
    },
    snacks: {
      name: "Snacks",
      slogan: "Delicious & Healthy Bites",
      subtext: "Organic roasted nuts, dried fruits & guilt-free crispy snacks.",
      count: "40+ Products",
      image: "https://images.unsplash.com/photo-1599599810769-bcde5a160d32?auto=format&fit=crop&w=800&q=80",
      slug: "snacks"
    },
    staples: {
      name: "Staples & Grains",
      slogan: "Pantry Essentials & Grains",
      subtext: "Aromatic Basmati rice, pulses, organic flours & cold-pressed oils.",
      count: "50+ Products",
      image: "https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=800&q=80",
      slug: "staples"
    },
    meat: {
      name: "Meat & Seafood",
      slogan: "Premium & Sustainable Cuts",
      subtext: "Freshly cut organic poultry, tender prime meats & wild seafood.",
      count: "20+ Products",
      image: "https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?auto=format&fit=crop&w=800&q=80",
      slug: "meat"
    },
    frozen: {
      name: "Frozen Foods",
      slogan: "Peak-Fresh Frozen Favorites",
      subtext: "Quick-frozen organic berries, green peas & gourmet ready meals.",
      count: "18+ Products",
      image: "https://images.unsplash.com/photo-1563805042-7684c019e1cb?auto=format&fit=crop&w=800&q=80",
      slug: "frozen"
    },
    sauces: {
      name: "Sauces & Condiments",
      slogan: "Rich Flavors & Artisan Oils",
      subtext: "Extra virgin olive oil, basil pesto & organic salad dressings.",
      count: "22+ Products",
      image: "https://images.unsplash.com/photo-1472476443507-c7a5948772fc?auto=format&fit=crop&w=800&q=80",
      slug: "sauces"
    },
    personal: {
      name: "Personal Care",
      slogan: "Gentle & Botanical Care",
      subtext: "Natural botanical skincare, herbal shampoos & organic bar soaps.",
      count: "35+ Products",
      image: "https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=800&q=80",
      slug: "personal"
    },
    home: {
      name: "Home Care",
      slogan: "Eco-Friendly Cleaning",
      subtext: "Non-toxic biodegradable cleaners & sustainable home supplies.",
      count: "20+ Products",
      image: "https://images.unsplash.com/photo-1583947215259-38e31be8751f?auto=format&fit=crop&w=800&q=80",
      slug: "home"
    }
  };

  const catCapsules = document.querySelectorAll('.cat-capsule');
  const catCenterStage = document.getElementById('cat-center-stage');
  const catCenterImg = document.getElementById('cat-center-img');
  const catCenterSlogan = document.getElementById('cat-center-slogan');
  const catCenterSubtext = document.getElementById('cat-center-subtext');
  const catCenterCount = document.getElementById('cat-center-count');
  const catExploreBtn = document.getElementById('cat-explore-btn');
  const catPulseParticle = document.getElementById('cat-pulse-particle');

  function triggerConnectionPulse(capsuleEl) {
    if (!catPulseParticle || !capsuleEl || !catCenterStage) return;

    const capsuleRect = capsuleEl.getBoundingClientRect();
    const stageRect = catCenterStage.getBoundingClientRect();

    const startX = (capsuleRect.left + capsuleRect.width / 2) - stageRect.left;
    const startY = (capsuleRect.top + capsuleRect.height / 2) - stageRect.top;
    const endX = stageRect.width / 2;
    const endY = stageRect.height / 2 - 20;

    catPulseParticle.style.left = startX + 'px';
    catPulseParticle.style.top = startY + 'px';
    catPulseParticle.style.opacity = '1';
    catPulseParticle.style.transform = 'scale(1.5)';
    catPulseParticle.style.transition = 'none';

    requestAnimationFrame(() => {
      catPulseParticle.style.transition = 'all 0.35s cubic-bezier(0.25, 1, 0.5, 1)';
      catPulseParticle.style.left = endX + 'px';
      catPulseParticle.style.top = endY + 'px';
      catPulseParticle.style.opacity = '0';
      catPulseParticle.style.transform = 'scale(0.4)';
    });
  }

  const innerFrameRing = document.getElementById('cat-inner-frame-ring');

  function switchCategoryShowcase(categorySlug, clickedCapsule = null) {
    const data = CATEGORY_SHOWCASE_DATA[categorySlug] || CATEGORY_SHOWCASE_DATA.fruits;

    // 1. Update Capsule Active States
    catCapsules.forEach(capsule => {
      if (capsule.getAttribute('data-category') === categorySlug) {
        capsule.classList.add('active');
        if (!clickedCapsule) clickedCapsule = capsule;
      } else {
        capsule.classList.remove('active');
      }
    });

    // 2. Trigger Connection Pulse
    if (clickedCapsule) {
      triggerConnectionPulse(clickedCapsule);
    }

    // 3. Scale down current image to 0.96 & fade opacity
    if (catCenterImg) {
      catCenterImg.style.transition = 'transform 0.22s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.22s ease';
      catCenterImg.style.transform = 'scale(0.96)';
      catCenterImg.style.opacity = '0.2';
    }
    if (catCenterSlogan) {
      catCenterSlogan.style.transition = 'opacity 0.22s ease';
      catCenterSlogan.style.opacity = '0.2';
    }

    // 4. Brief Pulse on Inner Decorative Frame Ring
    if (innerFrameRing) {
      innerFrameRing.style.transition = 'transform 0.22s ease, box-shadow 0.22s ease';
      innerFrameRing.style.transform = 'scale(1.04)';
      innerFrameRing.style.boxShadow = '0 0 16px rgba(54, 105, 51, 0.4)';
      setTimeout(() => {
        innerFrameRing.style.transform = '';
        innerFrameRing.style.boxShadow = '';
      }, 220);
    }

    // 5. Load New Content & Scale Up 0.96 -> 1
    setTimeout(() => {
      if (catCenterImg) {
        catCenterImg.src = data.image;
        catCenterImg.alt = data.name;
        catCenterImg.style.transition = 'transform 0.38s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.38s ease';
        catCenterImg.style.transform = 'scale(1)';
        catCenterImg.style.opacity = '1';
      }
      if (catCenterSlogan) {
        catCenterSlogan.textContent = data.slogan;
        catCenterSlogan.style.opacity = '1';
      }
      if (catCenterSubtext) catCenterSubtext.textContent = data.subtext;
      if (catCenterCount) catCenterCount.textContent = data.count;
      if (catExploreBtn) catExploreBtn.href = `products.html?category=${data.slug}`;
    }, 220);
  }

  // Capsule Click Handler
  catCapsules.forEach(capsule => {
    capsule.addEventListener('click', () => {
      const slug = capsule.getAttribute('data-category');
      switchCategoryShowcase(slug, capsule);
    });
  });

  // --------------------------------------------------------------------------
  // GLOBAL NAVBAR SCROLL SPY & CLICK NAVIGATION
  // --------------------------------------------------------------------------
  let isNavClicking = false;
  let clickTimeout = null;

  function setActiveNavLink(targetId) {
    navLinks.forEach(link => {
      link.classList.remove('active');
      const href = link.getAttribute('href');
      if (href === `#${targetId}` || (targetId === 'home' && (href === '#home' || href === '#'))) {
        link.classList.add('active');
      }
    });
  }

  // Smooth Scroll & Immediate Active Update on Nav Link Click
  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      const href = link.getAttribute('href');
      if (href && href.startsWith('#')) {
        e.preventDefault();
        const targetId = href.substring(1) || 'home';
        const targetSection = document.getElementById(targetId) || document.querySelector('main.hero-section');

        if (targetSection) {
          isNavClicking = true;
          setActiveNavLink(targetId);

          targetSection.scrollIntoView({ behavior: 'smooth' });

          if (navMenu && navMenu.classList.contains('active')) {
            navMenu.classList.remove('active');
            if (mobileToggle) mobileToggle.classList.remove('active');
          }

          if (clickTimeout) clearTimeout(clickTimeout);
          clickTimeout = setTimeout(() => {
            isNavClicking = false;
          }, 850);
        }
      }
    });
  });

  // IntersectionObserver Scroll Spy
  const trackedSections = document.querySelectorAll('#home, #features, #products, #categories, #review, #blogs, #about, main.hero-section');

  if ('IntersectionObserver' in window && trackedSections.length > 0) {
    const observerOptions = {
      root: null,
      rootMargin: '-20% 0px -50% 0px',
      threshold: 0.1
    };

    const sectionObserver = new IntersectionObserver((entries) => {
      if (isNavClicking) return;

      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const id = entry.target.getAttribute('id') || 'home';
          setActiveNavLink(id);
        }
      });
    }, observerOptions);

    trackedSections.forEach(sec => sectionObserver.observe(sec));
  } else {
    // Fallback scroll spy listener
    window.addEventListener('scroll', () => {
      if (isNavClicking) return;
      let currentSectionId = 'home';
      const scrollPos = window.scrollY + 180;

      trackedSections.forEach(section => {
        const top = section.offsetTop;
        const height = section.offsetHeight;
        if (scrollPos >= top && scrollPos < top + height) {
          currentSectionId = section.getAttribute('id') || 'home';
        }
      });
      setActiveNavLink(currentSectionId);
    });
  }
  // --------------------------------------------------------------------------
  // CUSTOMER REVIEWS CAROUSEL & ANIMATION LOGIC
  // --------------------------------------------------------------------------
  const reviewTrack = document.getElementById('testimonial-track');
  const reviewPrev = document.getElementById('review-prev');
  const reviewNext = document.getElementById('review-next');
  const reviewDots = document.querySelectorAll('#review-dots .dot');

  let reviewSlideIndex = 0;
  const maxReviewSlides = 3;

  function updateReviewCarousel(index) {
    reviewSlideIndex = index;
    if (reviewTrack) {
      const cardWidth = 280;
      reviewTrack.scrollTo({
        left: reviewSlideIndex * cardWidth,
        behavior: 'smooth'
      });
    }
    reviewDots.forEach((d, i) => {
      d.classList.toggle('active', i === reviewSlideIndex);
    });
  }

  if (reviewNext) {
    reviewNext.addEventListener('click', () => {
      const nextIndex = (reviewSlideIndex + 1) % maxReviewSlides;
      updateReviewCarousel(nextIndex);
    });
  }

  if (reviewPrev) {
    reviewPrev.addEventListener('click', () => {
      const prevIndex = (reviewSlideIndex - 1 + maxReviewSlides) % maxReviewSlides;
      updateReviewCarousel(prevIndex);
    });
  }

  reviewDots.forEach((dot, idx) => {
    dot.addEventListener('click', () => {
      updateReviewCarousel(idx);
    });
  });

  // Animated Rating Progress Bars on Scroll Entrance
  const reviewSection = document.querySelector('.review-section');
  const barFills = document.querySelectorAll('.bar-fill');

  if (reviewSection && 'IntersectionObserver' in window) {
    barFills.forEach(bar => {
      bar.dataset.width = bar.style.width;
      bar.style.width = '0%';
    });

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          barFills.forEach((bar, idx) => {
            setTimeout(() => {
              bar.style.width = bar.dataset.width;
            }, idx * 120);
          });
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.3 });

    observer.observe(reviewSection);
  }

  // --------------------------------------------------------------------------
  // GROCO JOURNAL EDITORIAL MAGAZINE INTERACTIVE ENGINE
  // --------------------------------------------------------------------------
  const GROCO_JOURNAL_ARTICLES = [
    {
      id: 1,
      category: "HEALTH & NUTRITION",
      title: "Healthy Breakfast Ideas for Energetic Mornings",
      excerpt: "Kickstart your day with nutrient-packed organic bowls and quick 10-minute fresh smoothie recipes crafted for everyday wellness.",
      meta: "5 min read • May 12, 2026",
      image: "https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?auto=format&fit=crop&w=1000&q=80"
    },
    {
      id: 2,
      category: "ORGANIC LIVING",
      title: "Farm to Table: Why Fresh Organic Produce Matters",
      excerpt: "Explore how sourcing directly from local sustainable farms preserves vitamins, natural flavor, and supports our environment.",
      meta: "4 min read • May 10, 2026",
      image: "https://images.unsplash.com/photo-1610832958506-aa56368176cf?auto=format&fit=crop&w=1000&q=80"
    },
    {
      id: 3,
      category: "SMART SHOPPING",
      title: "10 Easy Grocery Shopping Tips for Busy Families",
      excerpt: "Smart meal planning, seasonal shopping guides, and time-saving grocery organization strategies that cut your budget.",
      meta: "6 min read • May 06, 2026",
      image: "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=1000&q=80"
    },
    {
      id: 4,
      category: "QUICK RECIPES",
      title: "Simple 15-Minute Meals with Farm Fresh Ingredients",
      excerpt: "Delicious wholesome dinners made with fresh veggies and wholesome dairy that anyone can prepare in 15 minutes.",
      meta: "7 min read • May 02, 2026",
      image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=1000&q=80"
    }
  ];

  const journalRows = document.querySelectorAll('.journal-row');
  const featImg = document.getElementById('feat-img');
  const featCat = document.getElementById('feat-cat');
  const featTitle = document.getElementById('feat-title');
  const featExcerpt = document.getElementById('feat-excerpt');
  const featMeta = document.getElementById('feat-meta');
  const btnJournalExplore = document.getElementById('btn-journal-explore');
  const featReadBtn = document.getElementById('feat-read-btn');

  function switchJournalArticle(row) {
    if (!row) return;

    journalRows.forEach(r => r.classList.remove('active'));
    row.classList.add('active');

    const id = row.getAttribute('data-id') || 'healthy-breakfast';
    const img = row.getAttribute('data-img');
    const cat = row.getAttribute('data-cat');
    const title = row.getAttribute('data-title');
    const excerpt = row.getAttribute('data-excerpt');
    const meta = row.getAttribute('data-meta');

    // Smooth Cinematic Transition (450ms)
    if (featImg) {
      featImg.style.transition = 'transform 0.22s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.22s ease';
      featImg.style.transform = 'scale(0.96)';
      featImg.style.opacity = '0.2';
    }

    if (featTitle) {
      featTitle.style.transition = 'opacity 0.22s ease, transform 0.22s ease';
      featTitle.style.opacity = '0.2';
      featTitle.style.transform = 'translateY(6px)';
    }

    setTimeout(() => {
      if (featImg) {
        featImg.src = img;
        featImg.alt = title;
        featImg.style.transition = 'transform 0.38s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.38s ease';
        featImg.style.transform = 'scale(1)';
        featImg.style.opacity = '1';
      }

      if (featCat) featCat.textContent = cat;

      if (featTitle) {
        featTitle.textContent = title;
        featTitle.style.opacity = '1';
        featTitle.style.transform = 'translateY(0)';
      }

      if (featExcerpt) featExcerpt.textContent = excerpt;
      if (featMeta) featMeta.innerHTML = meta.includes('•') ? `<span>${meta.split('•')[0].trim()}</span> • <span>${meta.split('•')[1].trim()}</span>` : meta;
      if (featReadBtn) featReadBtn.href = `article.html?id=${id}`;
    }, 200);
  }

  journalRows.forEach(row => {
    row.addEventListener('mouseenter', () => switchJournalArticle(row));
    row.addEventListener('click', () => switchJournalArticle(row));
  });

  // ==========================================================================
  // GROCO GLOBAL SCROLL MOTION & ANIMATION SYSTEM ENGINE
  // ==========================================================================
  function initGrocoScrollMotionSystem() {
    // 1. Scroll Progress Bar Initialization
    let progressBar = document.getElementById('groco-scroll-progress');
    if (!progressBar) {
      progressBar = document.createElement('div');
      progressBar.id = 'groco-scroll-progress';
      progressBar.className = 'groco-scroll-progress';
      document.body.prepend(progressBar);
    }

    let ticking = false;
    window.addEventListener('scroll', () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
          if (totalHeight > 0 && progressBar) {
            const progress = (window.scrollY / totalHeight) * 100;
            progressBar.style.width = `${Math.min(100, Math.max(0, progress))}%`;
          }

          // Parallax calculation for .groco-parallax elements
          const parallaxEls = document.querySelectorAll('.groco-parallax');
          const scrollY = window.scrollY;
          parallaxEls.forEach(el => {
            const speed = parseFloat(el.getAttribute('data-parallax-speed')) || 0.04;
            const direction = el.getAttribute('data-parallax-dir') === 'down' ? 1 : -1;
            el.style.transform = `translateY(${scrollY * speed * direction}px)`;
          });

          ticking = false;
        });
        ticking = true;
      }
    }, { passive: true });

    // 2. Headings Text Reveal Word Splitting Engine
    const headingEls = document.querySelectorAll('.groco-text-reveal');
    headingEls.forEach(heading => {
      if (heading.dataset.splitDone) return;
      
      const freshWrapper = heading.querySelector('.fresh-wrapper');
      if (freshWrapper) {
        let wordCount = 0;
        Array.from(heading.childNodes).forEach(child => {
          if (child.nodeType === Node.TEXT_NODE && child.textContent.trim()) {
            const words = child.textContent.split(/(\s+)/);
            const frag = document.createDocumentFragment();
            words.forEach(w => {
              if (w.trim()) {
                const span = document.createElement('span');
                span.className = 'groco-word';
                span.style.setProperty('--word-idx', wordCount++);
                span.textContent = w;
                frag.appendChild(span);
              } else if (w) {
                frag.appendChild(document.createTextNode(w));
              }
            });
            child.replaceWith(frag);
          } else if (child.classList && child.classList.contains('fresh-wrapper')) {
            const freshText = child.querySelector('.fresh-text');
            if (freshText && !freshText.dataset.splitDone) {
              const text = freshText.textContent;
              freshText.innerHTML = '';
              const span = document.createElement('span');
              span.className = 'groco-word';
              span.style.setProperty('--word-idx', wordCount++);
              span.textContent = text;
              freshText.appendChild(span);
              freshText.dataset.splitDone = 'true';
            }
          }
        });
      } else {
        const text = heading.textContent.trim();
        const words = text.split(/\s+/);
        heading.innerHTML = '';
        words.forEach((w, idx) => {
          const span = document.createElement('span');
          span.className = 'groco-word';
          span.style.setProperty('--word-idx', idx);
          span.textContent = w;
          heading.appendChild(span);
          if (idx < words.length - 1) {
            heading.appendChild(document.createTextNode(' '));
          }
        });
      }
      heading.dataset.splitDone = 'true';
    });

    // 3. Statistics Counting Animation
    function animateStatNumber(el) {
      if (el.dataset.animated) return;
      el.dataset.animated = 'true';

      const targetAttr = el.getAttribute('data-count-to') || el.textContent.trim();
      const cleanNumStr = targetAttr.replace(/[^0-9.]/g, '');
      const targetVal = parseFloat(cleanNumStr);
      if (isNaN(targetVal)) return;

      const hasPlus = targetAttr.includes('+');
      const hasPercent = targetAttr.includes('%');
      const isDecimal = targetAttr.includes('.');
      const hasSlash = targetAttr.includes('/');
      const slashSuffix = hasSlash ? targetAttr.substring(targetAttr.indexOf('/')) : '';

      const duration = 1400;
      const startTime = performance.now();

      function updateNumber(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const easeProgress = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
        const currentVal = targetVal * easeProgress;

        let formatted = isDecimal ? currentVal.toFixed(1) : Math.floor(currentVal).toLocaleString();
        if (hasPlus) formatted += '+';
        if (hasPercent) formatted += '%';
        if (hasSlash) formatted += slashSuffix;

        el.textContent = formatted;

        if (progress < 1) {
          requestAnimationFrame(updateNumber);
        } else {
          el.textContent = targetAttr;
        }
      }

      requestAnimationFrame(updateNumber);
    }

    // 4. IntersectionObserver Triggering Engine
    const observerOptions = {
      root: null,
      rootMargin: '0px 0px -40px 0px',
      threshold: 0.15
    };

    const revealElements = document.querySelectorAll(
      '.groco-reveal, .groco-reveal-up, .groco-reveal-left, .groco-reveal-right, .groco-reveal-scale, .groco-stagger, .groco-text-reveal, .bottom-stats-strip'
    );

    if ('IntersectionObserver' in window) {
      const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');

            // Trigger number animation for stat numbers
            const statNumbers = entry.target.querySelectorAll('.stat-number');
            statNumbers.forEach(statEl => animateStatNumber(statEl));
            if (entry.target.classList.contains('stat-number')) {
              animateStatNumber(entry.target);
            }

            observer.unobserve(entry.target);
          }
        });
      }, observerOptions);

      revealElements.forEach(el => revealObserver.observe(el));
    } else {
      revealElements.forEach(el => el.classList.add('is-visible'));
    }
  }

  // Trigger Motion System Init
  initGrocoScrollMotionSystem();

  console.log('Groco Website fully initialized with Global Scroll Motion System.');
});





