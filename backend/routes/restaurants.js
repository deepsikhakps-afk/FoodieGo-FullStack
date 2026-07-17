const express = require('express');
const router = express.Router();
const db = require('../config/db');

// GET /api/restaurants  -> list all, with optional filters
// query params: search, veg(true/false), fastDelivery(true), minRating
router.get('/', (req, res) => {
  const { search } = req.query;
  let restaurants = db.prepare('SELECT * FROM restaurants').all();

  restaurants = restaurants.map(r => {
    const menu = db.prepare('SELECT * FROM menu_items WHERE restaurant_id = ?').all(r.id);
    return { ...r, menu };
  });

  if (search) {
    const q = search.toLowerCase();
    restaurants = restaurants.filter(r =>
      r.name.toLowerCase().includes(q) ||
      r.cuisine.toLowerCase().includes(q) ||
      r.menu.some(m => m.name.toLowerCase().includes(q))
    );
  }

  res.json({ success: true, count: restaurants.length, data: restaurants });
});

// GET /api/restaurants/:id -> single restaurant with menu
router.get('/:id', (req, res) => {
  const restaurant = db.prepare('SELECT * FROM restaurants WHERE id = ?').get(req.params.id);
  if (!restaurant) return res.status(404).json({ success: false, message: 'Restaurant not found' });
  const menu = db.prepare('SELECT * FROM menu_items WHERE restaurant_id = ?').all(req.params.id);
  res.json({ success: true, data: { ...restaurant, menu } });
});

module.exports = router;
