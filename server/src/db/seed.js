require('dotenv').config();
const bcrypt = require('bcryptjs');
const { pool } = require('../config/database');

const seed = async () => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // --- Seed Admin User ---
    const adminPassword = await bcrypt.hash('Admin@12345', 12);
    await client.query(`
      INSERT INTO users (name, email, password_hash, role, phone)
      VALUES ($1, $2, $3, $4, $5)
      ON CONFLICT (email) DO NOTHING
    `, ['Super Admin', 'admin@naijabites.com', adminPassword, 'admin', '+234 800 000 0001']);

    // --- Seed a Demo Customer ---
    const userPassword = await bcrypt.hash('User@12345', 12);
    await client.query(`
      INSERT INTO users (name, email, password_hash, role, phone)
      VALUES ($1, $2, $3, $4, $5)
      ON CONFLICT (email) DO NOTHING
    `, ['Chidi Okeke', 'customer@naijabites.com', userPassword, 'user', '+234 800 000 0002']);

    // --- Seed Categories ---
    const categories = [
      { name: 'Rice & Rice Dishes', description: 'Nigerian rice classics — Jollof, Fried Rice, White Rice, and more', image_url: 'https://images.unsplash.com/photo-1512058564366-18510be2db19?w=400&q=80' },
      { name: 'Soups', description: 'Rich and hearty Nigerian soups — Egusi, Okra, Efo Riro, Afang, and more', image_url: 'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?w=400&q=80' },
      { name: 'Swallow', description: 'Traditional Nigerian swallow — Pounded Yam, Amala, Eba, Semo, and Fufu', image_url: 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=400&q=80' },
      { name: 'Proteins', description: 'Grilled, fried, and peppered proteins — Chicken, Beef, Fish, and more', image_url: 'https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?w=400&q=80' },
      { name: 'Breakfast', description: 'Classic Nigerian morning favourites — Akara, Moi Moi, Pap, and more', image_url: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=400&q=80' },
      { name: 'Drinks', description: 'Refreshing Nigerian drinks — Zobo, Chapman, Palm Wine, and Cold Drinks', image_url: 'https://images.unsplash.com/photo-1544145945-f90425340c7e?w=400&q=80' },
      { name: 'Snacks', description: 'Light bites and street food — Puff Puff, Chin Chin, Plantain, and more', image_url: 'https://images.unsplash.com/photo-1601313642524-92f8d346c24b?w=400&q=80' },
    ];

    const categoryIds = {};
    for (const cat of categories) {
      const res = await client.query(`
        INSERT INTO categories (name, description, image_url)
        VALUES ($1, $2, $3)
        ON CONFLICT (name) DO UPDATE SET description = EXCLUDED.description
        RETURNING id
      `, [cat.name, cat.description, cat.image_url]);
      categoryIds[cat.name] = res.rows[0].id;
    }

    // --- Seed Menu Items ---
    const menuItems = [
      // Rice & Rice Dishes
      {
        category: 'Rice & Rice Dishes',
        name: 'Signature Jollof Rice',
        description: 'Our famous smoky party jollof rice slow-cooked in a rich tomato and pepper base, served with a side of coleslaw.',
        price: 2800,
        image_url: 'https://images.unsplash.com/photo-1512058564366-18510be2db19?w=500&q=80',
        is_available: true,
      },
      {
        category: 'Rice & Rice Dishes',
        name: 'Nigerian Fried Rice',
        description: 'Colourful stir-fried rice loaded with vegetables, liver, and spices — a true Nigerian classic.',
        price: 2600,
        image_url: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=500&q=80',
        is_available: true,
      },
      {
        category: 'Rice & Rice Dishes',
        name: 'White Rice & Stew',
        description: 'Perfectly steamed white rice served with our rich tomato beef stew, a Nigerian home comfort classic.',
        price: 2200,
        image_url: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&q=80',
        is_available: true,
      },
      {
        category: 'Rice & Rice Dishes',
        name: 'Ofada Rice & Sauce',
        description: 'Local brown Ofada rice served with spicy ofada ayamase sauce — earthy, bold, and unforgettable.',
        price: 3200,
        image_url: 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=500&q=80',
        is_available: true,
      },

      // Soups
      {
        category: 'Soups',
        name: 'Egusi Soup',
        description: 'Ground melon seed soup cooked with leafy greens, assorted meat, and a rich palm oil base. A Nigerian staple.',
        price: 3500,
        image_url: 'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?w=500&q=80',
        is_available: true,
      },
      {
        category: 'Soups',
        name: 'Okra Soup',
        description: 'Thick and flavourful okra soup with assorted seafood and beef, lightly peppered and palm-oil kissed.',
        price: 3800,
        image_url: 'https://images.unsplash.com/photo-1541014741259-de529411b96a?w=500&q=80',
        is_available: true,
      },
      {
        category: 'Soups',
        name: 'Efo Riro',
        description: 'Silky Yoruba vegetable soup made with fresh spinach, locust beans, assorted meats, and stockfish.',
        price: 3600,
        image_url: 'https://images.unsplash.com/photo-1580822184713-fc5400e7fe10?w=500&q=80',
        is_available: true,
      },
      {
        category: 'Soups',
        name: 'Afang Soup',
        description: 'Premium Cross River delicacy combining water leaves and afang leaves with periwinkle, assorted meat, and seafood.',
        price: 4200,
        image_url: 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=500&q=80',
        is_available: true,
      },
      {
        category: 'Soups',
        name: 'Banga Soup',
        description: 'Delta-style palm nut soup richly spiced with banga spices, served with your choice of assorted fish and meat.',
        price: 4000,
        image_url: 'https://images.unsplash.com/photo-1598515213045-bb51dfe7a1c8?w=500&q=80',
        is_available: true,
      },

      // Swallow
      {
        category: 'Swallow',
        name: 'Pounded Yam',
        description: 'Smooth and elastic hand-pounded yam — the perfect partner for any Nigerian soup.',
        price: 1500,
        image_url: 'https://images.unsplash.com/photo-1562802378-063ec186a863?w=500&q=80',
        is_available: true,
      },
      {
        category: 'Swallow',
        name: 'Amala',
        description: 'Soft dark yam flour swallow — the Yoruba classic, best enjoyed with ewedu or gbegiri.',
        price: 1200,
        image_url: 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=500&q=80',
        is_available: true,
      },
      {
        category: 'Swallow',
        name: 'Eba (Garri)',
        description: 'Classic cassava swallow — firm, stretchy, and perfectly paired with any soup on our menu.',
        price: 1000,
        image_url: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&q=80',
        is_available: true,
      },
      {
        category: 'Swallow',
        name: 'Semo',
        description: 'Light and smooth semolina swallow — soft texture, mild taste, great with any soup.',
        price: 1200,
        image_url: 'https://images.unsplash.com/photo-1512058564366-18510be2db19?w=500&q=80',
        is_available: true,
      },

      // Proteins
      {
        category: 'Proteins',
        name: 'Grilled Chicken',
        description: 'Juicy whole chicken leg marinated in a blend of Nigerian spices and slow-grilled to golden perfection.',
        price: 3000,
        image_url: 'https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?w=500&q=80',
        is_available: true,
      },
      {
        category: 'Proteins',
        name: 'Peppered Fried Chicken',
        description: 'Crispy fried chicken tossed in our signature Nigerian pepper sauce — bold, spicy, and irresistible.',
        price: 3200,
        image_url: 'https://images.unsplash.com/photo-1562802378-063ec186a863?w=500&q=80',
        is_available: true,
      },
      {
        category: 'Proteins',
        name: 'Suya (Beef Skewers)',
        description: 'Classic Nigerian street food — thinly sliced beef rubbed with groundnut suya spice and grilled over open flame.',
        price: 2800,
        image_url: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=500&q=80',
        is_available: true,
      },
      {
        category: 'Proteins',
        name: 'Peppered Beef',
        description: 'Tender pieces of beef stewed then tossed in our rich peppered tomato and onion sauce.',
        price: 2500,
        image_url: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=500&q=80',
        is_available: true,
      },
      {
        category: 'Proteins',
        name: 'Catfish (Point & Kill)',
        description: 'Fresh river catfish grilled or peppered to your preference — a true Nigerian delicacy.',
        price: 4500,
        image_url: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=500&q=80',
        is_available: true,
      },

      // Breakfast
      {
        category: 'Breakfast',
        name: 'Akara (Bean Cakes)',
        description: 'Golden fried bean cakes seasoned with onions and peppers — a favourite Nigerian breakfast served with pap.',
        price: 1500,
        image_url: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=500&q=80',
        is_available: true,
      },
      {
        category: 'Breakfast',
        name: 'Moi Moi',
        description: 'Steamed bean pudding with boiled eggs and fish, wrapped in banana leaves for an authentic touch.',
        price: 1800,
        image_url: 'https://images.unsplash.com/photo-1512058564366-18510be2db19?w=500&q=80',
        is_available: true,
      },
      {
        category: 'Breakfast',
        name: 'Yam & Egg Sauce',
        description: 'Boiled or fried yam slices served with our rich tomato and pepper egg sauce.',
        price: 2000,
        image_url: 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=500&q=80',
        is_available: true,
      },

      // Drinks
      {
        category: 'Drinks',
        name: 'Zobo Drink',
        description: 'Chilled hibiscus flower drink infused with ginger, cloves, and pineapple — refreshing and natural.',
        price: 800,
        image_url: 'https://images.unsplash.com/photo-1544145945-f90425340c7e?w=500&q=80',
        is_available: true,
      },
      {
        category: 'Drinks',
        name: 'Chapman Cocktail',
        description: 'Nigeria\'s favourite non-alcoholic cocktail — a mix of Fanta, Sprite, Grenadine, cucumber, and lemon.',
        price: 1200,
        image_url: 'https://images.unsplash.com/photo-1561758033-7e924f619b47?w=500&q=80',
        is_available: true,
      },
      {
        category: 'Drinks',
        name: 'Kunu Aya (Tiger Nut Milk)',
        description: 'Creamy and naturally sweet tiger nut milk — a traditional northern Nigerian health drink.',
        price: 900,
        image_url: 'https://images.unsplash.com/photo-1544145945-f90425340c7e?w=500&q=80',
        is_available: true,
      },
      {
        category: 'Drinks',
        name: 'Cold Soft Drinks',
        description: 'Choice of Coke, Fanta, Sprite, or Pepsi — ice cold and refreshing.',
        price: 500,
        image_url: 'https://images.unsplash.com/photo-1554866585-cd94860890b7?w=500&q=80',
        is_available: true,
      },

      // Snacks
      {
        category: 'Snacks',
        name: 'Puff Puff',
        description: 'Soft, pillowy fried dough balls lightly dusted with sugar — a beloved Nigerian street snack.',
        price: 700,
        image_url: 'https://images.unsplash.com/photo-1601313642524-92f8d346c24b?w=500&q=80',
        is_available: true,
      },
      {
        category: 'Snacks',
        name: 'Fried Plantain (Dodo)',
        description: 'Sweet ripe plantains fried to golden perfection — a side dish that goes with everything.',
        price: 900,
        image_url: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=500&q=80',
        is_available: true,
      },
      {
        category: 'Snacks',
        name: 'Chin Chin',
        description: 'Crunchy fried pastry snack flavoured with nutmeg and coconut — a Nigerian party staple.',
        price: 800,
        image_url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=500&q=80',
        is_available: true,
      },
    ];

    for (const item of menuItems) {
      const catId = categoryIds[item.category];
      await client.query(`
        INSERT INTO menu_items (category_id, name, description, price, image_url, is_available)
        VALUES ($1, $2, $3, $4, $5, $6)
        ON CONFLICT DO NOTHING
      `, [catId, item.name, item.description, item.price, item.image_url, item.is_available]);
    }

    await client.query('COMMIT');
    console.log('✅ Database seeded successfully');
    console.log('   Admin:    admin@naijabites.com / Admin@12345');
    console.log('   Customer: customer@naijabites.com / User@12345');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('❌ Seeding failed:', err);
    throw err;
  } finally {
    client.release();
    await pool.end();
  }
};

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
