/**
 * Groco Reusable Shared Journal Dataset (journal-data.js)
 * Central dataset shared across index.html, journal.html, and article.html
 */

const GROCO_JOURNAL_ARTICLES = [
  {
    id: "healthy-breakfast",
    category: "Health & Nutrition",
    categorySlug: "health",
    title: "Healthy Breakfast Ideas for Energetic Mornings",
    description: "Kickstart your day with nutrient-packed organic bowls and quick 10-minute fresh smoothie recipes crafted for everyday wellness.",
    date: "May 12, 2026",
    readTime: "5 min read",
    author: "Groco Editorial Team",
    image: "https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?auto=format&fit=crop&w=1200&q=80",
    badge: "FEATURED",
    content: `
      <p class="article-lead">Mornings set the tone for your entire day. Fueling your body with clean, nutrient-dense organic foods ensures sustained physical energy, mental clarity, and digestive harmony from sunrise to sunset.</p>

      <h2>1. The Ultimate Organic Berry & Acai Power Bowl</h2>
      <p>A vibrant bowl packed with antioxidants, healthy fats, and fiber is one of the easiest ways to elevate your morning routine. Combine frozen organic blueberries, acai puree, and a splash of unsweetened almond milk into a thick, creamy consistency.</p>
      
      <div class="article-tip-box">
        <span class="tip-icon">🌿</span>
        <div class="tip-text">
          <strong>Groco Fresh Tip:</strong> Top your smoothie bowl with raw pumpkin seeds, toasted chia seeds, and fresh organic kiwi slices for an extra omega-3 boost and satisfying crunch.
        </div>
      </div>

      <h2>2. Avocado & Soft-Poached Pasture-Raised Eggs on Sourdough</h2>
      <p>Whole grain sourdough bread provides complex carbohydrates that release energy gradually without causing blood sugar spikes. Paired with ripe organic avocado and rich pasture-raised eggs, this breakfast classic delivers high-quality protein and essential healthy fats.</p>

      <ul class="article-bullet-list">
        <li><strong>Sourdough Toast:</strong> 2 slices toasted to golden perfection.</li>
        <li><strong>Avocado Mash:</strong> 1 ripe avocado mashed with fresh lime juice, sea salt, and red pepper flakes.</li>
        <li><strong>Pasture-Raised Eggs:</strong> 2 soft-poached eggs rich in choline and vitamin D.</li>
      </ul>

      <h2>3. Overnight Organic Oats with Roasted Nuts & Honey</h2>
      <p>If you're pressed for time in the morning, overnight oats are your ultimate secret weapon. Simply mix rolled oats with fresh organic milk or oat milk, a spoonful of chia seeds, and raw honey before sleeping. In the morning, top with crunchy roasted almonds and sliced bananas for an instant 2-minute breakfast!</p>

      <h2>Conclusion</h2>
      <p>Prioritizing a wholesome organic breakfast transforms your morning mood, productivity, and long-term health. Explore Groco's fresh fruit and organic dairy section to get all your ingredients delivered fresh to your door today!</p>
    `
  },
  {
    id: "farm-to-table",
    category: "Organic Living",
    categorySlug: "organic",
    title: "Farm to Table: Why Fresh Organic Produce Matters",
    description: "Explore how sourcing directly from local sustainable farms preserves vitamins, natural flavor, and supports our environment.",
    date: "May 10, 2026",
    readTime: "4 min read",
    author: "Elena Vance, Nutrition Specialist",
    image: "https://images.unsplash.com/photo-1610832958506-aa56368176cf?auto=format&fit=crop&w=1200&q=80",
    badge: "ORGANIC",
    content: `
      <p class="article-lead">The farm-to-table movement is more than just a culinary trend—it represents a conscious return to clean nutrition, ecological stewardship, and vibrant natural flavors.</p>

      <h2>Peak Freshness Means Peak Nutrition</h2>
      <p>Fruits and vegetables begin losing nutrient density the moment they are harvested. Conventional produce often travels thousands of miles across weeks in refrigerated storage before reaching supermarket shelves. In contrast, farm-fresh organic produce from Groco is harvested at peak maturity and delivered within 24 hours.</p>

      <div class="article-tip-box">
        <span class="tip-icon">🚜</span>
        <div class="tip-text">
          <strong>Did You Know?</strong> Organic soil enriched with natural compost yields up to 40% higher levels of beneficial polyphenols and antioxidants compared to synthetic chemically-treated crops.
        </div>
      </div>

      <h2>Supporting Local Eco-Farmers & Biodiversity</h2>
      <p>When you choose organic, you directly support local farming families who practice crop rotation, natural pest management, and soil regeneration. This preserves local water tables and protects honeybees and pollinator insects essential for our agricultural ecosystem.</p>

      <h2>Taste the Real Flavor Difference</h2>
      <p>Once you taste a sun-ripened organic tomato or a crisp farm apple free of synthetic waxes, you'll immediately recognize the deep, rich natural sweetness that industrial farming strips away.</p>
    `
  },
  {
    id: "grocery-shopping-tips",
    category: "Smart Shopping",
    categorySlug: "shopping",
    title: "10 Easy Grocery Shopping Tips for Busy Families",
    description: "Smart meal planning, seasonal shopping guides, and time-saving grocery organization strategies that cut your budget.",
    date: "May 06, 2026",
    readTime: "6 min read",
    author: "David Miller, Family Lifestyle Editor",
    image: "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=1200&q=80",
    badge: "GUIDE",
    content: `
      <p class="article-lead">Navigating weekly grocery shopping for a busy household doesn't have to be overwhelming or expensive. With a few smart strategies, you can save time, cut food waste, and keep your pantry stocked with fresh organic goods.</p>

      <h2>1. Plan Meals Around Seasonal Produce</h2>
      <p>Produce that is currently in season is not only at its peak flavor and nutrient quality, but it is also abundantly available and significantly less expensive. Check Groco's weekly seasonal picks for the best deals!</p>

      <h2>2. Categorize Your Shopping List</h2>
      <p>Group your list into produce, dairy & chilled, bakery, staples, and home care. This prevents back-and-tracking across store aisles or online catalog categories, cutting your ordering time in half.</p>

      <ul class="article-bullet-list">
        <li><strong>Produce First:</strong> Stock up on core greens, apples, citrus, and carrots.</li>
        <li><strong>Proteins & Dairy:</strong> Fresh pasture-raised eggs, organic milk, lean meats.</li>
        <li><strong>Pantry Essentials:</strong> Grains, Basmati rice, cold-pressed olive oil, and pulses.</li>
      </ul>

      <div class="article-tip-box">
        <span class="tip-icon">💡</span>
        <div class="tip-text">
          <strong>Smart Tip:</strong> Use Groco's quick reorder feature or category filters on products.html to restock your weekly staples in less than 3 minutes.
        </div>
      </div>
    `
  },
  {
    id: "15-minute-meals",
    category: "Quick Recipes",
    categorySlug: "recipes",
    title: "Simple 15-Minute Meals with Farm Fresh Ingredients",
    description: "Delicious wholesome dinners made with fresh veggies and wholesome dairy that anyone can prepare in 15 minutes.",
    date: "May 02, 2026",
    readTime: "7 min read",
    author: "Chef Marcus Lin",
    image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=1200&q=80",
    badge: "RECIPES",
    content: `
      <p class="article-lead">Eating healthy after a long workday doesn't require hours in the kitchen. Here are three lightning-fast 15-minute gourmet meals crafted with fresh organic ingredients from Groco.</p>

      <h2>1. Tuscan Garlic Butter Spinach & Tomato Pasta</h2>
      <p>Toss al dente organic pasta with sauteed cherry tomatoes, fresh baby spinach, minced garlic, extra virgin olive oil, and shaved parmesan cheese. Fast, aromatic, and deeply comforting!</p>

      <h2>2. Fresh Mediterranean Quinoa & Avocado Bowl</h2>
      <p>Fluff pre-cooked quinoa and combine with diced organic cucumbers, cherry tomatoes, Kalamata olives, fresh parsley, and creamy ripe avocado. Drizzle with a lemon-herb dressing for a refreshing 10-minute dinner.</p>

      <div class="article-tip-box">
        <span class="tip-icon">⏱️</span>
        <div class="tip-text">
          <strong>Meal Prep Hack:</strong> Keep pre-washed organic spinach, chopped garlic, and cooked grains in airtight glass containers for instant 5-minute assembly anytime.
        </div>
      </div>
    `
  },
  {
    id: "organic-lifestyle-guide",
    category: "Lifestyle",
    categorySlug: "lifestyle",
    title: "The Essential Guide to Sustainable & Eco-Friendly Living",
    description: "Small daily swaps in your kitchen and home that reduce plastic waste and create a cleaner, greener home environment.",
    date: "Apr 28, 2026",
    readTime: "5 min read",
    author: "Sophia Sterling, Eco-Living Specialist",
    image: "https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=1200&q=80",
    badge: "ECO",
    content: `
      <p class="article-lead">Building a sustainable lifestyle doesn't mean changing everything overnight. Small, deliberate eco-friendly choices in your kitchen, personal care, and grocery routine aggregate into a massive environmental impact over time.</p>

      <h2>1. Switch to Biodegradable & Plant-Based Home Cleaners</h2>
      <p>Conventional household cleaners often contain harsh synthetic chemicals and artificial fragrances that end up in municipal waterways. Plant-based biodegradable cleaners clean effectively using citrus and botanical enzymes without toxic residues.</p>

      <h2>2. Say Goodbye to Single-Use Plastic Wraps</h2>
      <p>Replace plastic cling wrap with reusable beeswax wraps or silicone bowl covers. They keep cut produce, avocados, and cheeses fresh for days without creating plastic waste.</p>

      <div class="article-tip-box">
        <span class="tip-icon">🌍</span>
        <div class="tip-text">
          <strong>Eco Fact:</strong> Switching to concentrated plant-based soap bars and eco cleaning refills eliminates up to 30 plastic bottles per household every year.
        </div>
      </div>
    `
  },
  {
    id: "kitchen-pantry-hacks",
    category: "Smart Shopping",
    categorySlug: "shopping",
    title: "15 Smart Kitchen Hacks to Keep Organic Food Fresh Longer",
    description: "Simple storage techniques and humidity controls that extend produce shelf-life, save money, and eliminate food waste.",
    date: "Apr 22, 2026",
    readTime: "6 min read",
    author: "Groco Kitchen Team",
    image: "https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=1200&q=80",
    badge: "HACKS",
    content: `
      <p class="article-lead">Because organic produce contains no synthetic chemical preservatives or artificial waxes, proper kitchen storage is key to extending its natural farm-fresh lifespan.</p>

      <h2>1. Store Herbs Like Fresh Flowers</h2>
      <p>Trim the stems of fresh cilantro, parsley, and basil, and place them upright in a small glass jar filled with 1 inch of fresh water. Cover cilantro and parsley loosely with a paper bag and store in the fridge—they'll stay crisp for up to two weeks!</p>

      <h2>2. Wrap Leafy Greens in Cloth Towels</h2>
      <p>Excess moisture is the #1 enemy of fresh lettuce and spinach. Place a dry cotton towel or paper towel inside your salad container to absorb condensation and keep greens crisp.</p>

      <div class="article-tip-box">
        <span class="tip-icon">🥑</span>
        <div class="tip-text">
          <strong>Avocado Preservation Hack:</strong> Store half-cut avocados submerged face down in fresh water or brushed with olive oil in the fridge to stop oxidation completely.
        </div>
      </div>
    `
  }
];

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { GROCO_JOURNAL_ARTICLES };
}
