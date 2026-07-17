const express = require('express');
const router = express.Router();
const db = require('../config/db');

// POST /api/orders  { userName, restaurantId, items:[{id,name,price,qty,isBogo}], couponCode }
router.post('/', (req, res) => {
  const { userName, restaurantId, items, couponCode } = req.body;
  if (!items || items.length === 0) {
    return res.status(400).json({ success: false, message: 'Cart is empty' });
  }

  let itemTotal = 0;
  items.forEach(it => {
    const payQty = it.isBogo ? Math.ceil(it.qty / 2) : it.qty;
    itemTotal += payQty * it.price;
  });

  const deliveryFee = itemTotal > 299 ? 0 : 40;
  const gst = Math.round(itemTotal * 0.05);

  let discount = 0;
  if (couponCode) {
    const coupon = db.prepare('SELECT * FROM coupons WHERE code = ? AND active = 1').get(couponCode.toUpperCase());
    if (coupon) {
      if (coupon.discount_type === 'percent') {
        discount = itemTotal * (coupon.discount_value / 100);
        if (coupon.max_discount) discount = Math.min(discount, coupon.max_discount);
      } else {
        discount = coupon.discount_value;
      }
    }
  }
  discount = Math.round(discount);
  const grandTotal = Math.max(0, itemTotal + deliveryFee + gst - discount);

  const stmt = db.prepare(`
    INSERT INTO orders (user_name, restaurant_id, items_json, item_total, delivery_fee, gst, discount, grand_total, coupon_code, status)
    VALUES (?,?,?,?,?,?,?,?,?,?)
  `);
  const info = stmt.run(
    userName || 'Guest', restaurantId || null, JSON.stringify(items),
    itemTotal, deliveryFee, gst, discount, grandTotal, couponCode || null, 'placed'
  );

  res.json({
    success: true,
    orderId: info.lastInsertRowid,
    bill: { itemTotal, deliveryFee, gst, discount, grandTotal },
    message: 'Order placed successfully'
  });
});

// GET /api/orders/:id -> order status/details
router.get('/:id', (req, res) => {
  const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(req.params.id);
  if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
  res.json({ success: true, data: { ...order, items_json: JSON.parse(order.items_json) } });
});

// GET /api/orders -> all orders (admin/history)
router.get('/', (req, res) => {
  const orders = db.prepare('SELECT * FROM orders ORDER BY created_at DESC').all();
  res.json({ success: true, count: orders.length, data: orders });
});

module.exports = router;
