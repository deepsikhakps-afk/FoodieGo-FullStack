// ============================================================
// DATABASE CONFIG
// Using SQLite (file-based, zero setup) so the project runs
// instantly without installing MySQL/MongoDB server.
// Schema is plain SQL -> to switch to real MySQL, just:
//   1. npm install mysql2
//   2. replace this file's connection with mysql2/promise pool
//   3. keep the same SQL queries used in routes/controllers
// (See README.md -> "Switch to MySQL" section)
// ============================================================
const Database = require('better-sqlite3');
const path = require('path');

const db = new Database(path.join(__dirname, '..', 'foodapp.db'));
db.pragma('journal_mode = WAL');

db.exec(`
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS restaurants (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  cuisine TEXT,
  image TEXT,
  rating REAL DEFAULT 4.0,
  delivery_time INTEGER DEFAULT 30,
  offer TEXT
);

CREATE TABLE IF NOT EXISTS menu_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  restaurant_id INTEGER NOT NULL,
  name TEXT NOT NULL,
  price REAL NOT NULL,
  is_veg INTEGER DEFAULT 1,
  is_bogo INTEGER DEFAULT 0,
  image TEXT,
  FOREIGN KEY (restaurant_id) REFERENCES restaurants(id)
);

CREATE TABLE IF NOT EXISTS coupons (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  code TEXT UNIQUE NOT NULL,
  discount_type TEXT NOT NULL,   -- 'percent' or 'flat'
  discount_value REAL NOT NULL,
  max_discount REAL,
  active INTEGER DEFAULT 1
);

CREATE TABLE IF NOT EXISTS orders (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_name TEXT,
  restaurant_id INTEGER,
  items_json TEXT NOT NULL,
  item_total REAL,
  delivery_fee REAL,
  gst REAL,
  discount REAL,
  grand_total REAL,
  coupon_code TEXT,
  status TEXT DEFAULT 'placed',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
`);

// ---------------- SEED DATA (only if empty) ----------------
const restCount = db.prepare('SELECT COUNT(*) c FROM restaurants').get().c;
if (restCount === 0) {
  const insertRest = db.prepare(`INSERT INTO restaurants (name,cuisine,image,rating,delivery_time,offer) VALUES (?,?,?,?,?,?)`);
  const insertItem = db.prepare(`INSERT INTO menu_items (restaurant_id,name,price,is_veg,is_bogo,image) VALUES (?,?,?,?,?,?)`);

  const data = [
    { name: "Punjabi Tadka", cuisine: "North Indian, Punjabi", image: "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=500", rating: 4.3, time: 25, offer: "50% OFF up to ₹100",
      menu: [["Butter Chicken",280,0,0,"https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=200"],
             ["Paneer Tikka",190,1,1,"https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=200"],
             ["Dal Makhani",150,1,0,"https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=200"],
             ["Tandoori Roti",30,1,0,"https://images.unsplash.com/photo-1601050690597-df0568f70950?w=200"]] },
    { name: "Domino's Pizza", cuisine: "Pizza, Fast Food", image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=500", rating: 4.1, time: 18, offer: "Buy 1 Get 1 Free",
      menu: [["Margherita Pizza",199,1,1,"https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=200"],
             ["Farmhouse Pizza",299,1,1,"https://images.unsplash.com/photo-1594007654729-407eedc4be65?w=200"],
             ["Chicken Pepperoni",349,0,0,"https://images.unsplash.com/photo-1628840042765-356cda07504e?w=200"],
             ["Garlic Breadsticks",99,1,0,"https://images.unsplash.com/photo-1619535860434-ba1d8fa78fb2?w=200"]] },
    { name: "South Spice", cuisine: "South Indian", image: "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=500", rating: 4.5, time: 20, offer: "Flat 20% OFF",
      menu: [["Masala Dosa",90,1,0,"https://images.unsplash.com/photo-1668236543090-82eba5ee5976?w=200"],
             ["Idli Sambhar",70,1,0,"https://images.unsplash.com/photo-1589301773859-628a8ea20d99?w=200"],
             ["Chicken Chettinad",260,0,0,"https://images.unsplash.com/photo-1631515243349-e0cb75fb8d3a?w=200"],
             ["Filter Coffee",40,1,0,"https://images.unsplash.com/photo-1595434091143-b375ced5fe4a?w=200"]] },
    { name: "Burger Point", cuisine: "Burgers, American", image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500", rating: 3.9, time: 15, offer: "Under ₹100 Combo",
      menu: [["Veg Burger",79,1,0,"https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=200"],
             ["Chicken Burger",99,0,1,"https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=200"],
             ["French Fries",60,1,0,"https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=200"],
             ["Cold Coffee",80,1,0,"https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=200"]] },
    { name: "Chinese Wok", cuisine: "Chinese, Asian", image: "https://images.unsplash.com/photo-1585032226651-759b368d7246?w=500", rating: 4.2, time: 30, offer: "₹125 OFF above ₹299",
      menu: [["Veg Noodles",120,1,0,"https://images.unsplash.com/photo-1585032226651-759b368d7246?w=200"],
             ["Chicken Manchurian",220,0,0,"https://images.unsplash.com/photo-1626776877233-ce7f5b58e2d0?w=200"],
             ["Spring Rolls",110,1,1,"https://images.unsplash.com/photo-1548507200-64f5abbc4de2?w=200"]] },
    { name: "Sweet Treats Bakery", cuisine: "Desserts, Bakery", image: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=500", rating: 4.6, time: 22, offer: "Under ₹200 desserts",
      menu: [["Chocolate Cake Slice",99,1,0,"https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=200"],
             ["Red Velvet Pastry",120,1,1,"https://images.unsplash.com/photo-1586985289906-406988974504?w=200"],
             ["Brownie Sundae",150,1,0,"https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=200"]] },
  ];

  const insertAll = db.transaction((rests) => {
    for (const r of rests) {
      const info = insertRest.run(r.name, r.cuisine, r.image, r.rating, r.time, r.offer);
      const restId = info.lastInsertRowid;
      for (const m of r.menu) insertItem.run(restId, m[0], m[1], m[2], m[3], m[4]);
    }
  });
  insertAll(data);

  db.prepare(`INSERT INTO coupons (code,discount_type,discount_value,max_discount) VALUES (?,?,?,?)`).run('FOODIE50','percent',20,50);
  db.prepare(`INSERT INTO coupons (code,discount_type,discount_value,max_discount) VALUES (?,?,?,?)`).run('WELCOME20','percent',20,null);
  db.prepare(`INSERT INTO coupons (code,discount_type,discount_value,max_discount) VALUES (?,?,?,?)`).run('BOGO','flat',0,null);

  console.log('✅ Database seeded with restaurants, menu items & coupons');
}

module.exports = db;
