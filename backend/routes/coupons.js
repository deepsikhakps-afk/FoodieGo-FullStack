const express = require('express');
const router = express.Router();
const db = require('../config/db');

// POST /api/coupons/apply  { code, itemTotal }
router.post('/apply', (req, res) => {
  const { code, itemTotal } = req.body;
  if (!code) return res.status(400).json({ success: false, message: 'Coupon code required' });

  const coupon = db.prepare('SELECT * FROM coupons WHERE code = ? AND active = 1').get(code.toUpperCase());
  if (!coupon) return res.status(404).json({ success: false, message: 'Invalid coupon code' });

  let discount = 0;
  if (coupon.discount_type === 'percent') {
    discount = (itemTotal || 0) * (coupon.discount_value / 100);
    if (coupon.max_discount) discount = Math.min(discount, coupon.max_discount);
  } else if (coupon.discount_type === 'flat') {
    discount = coupon.discount_value;
  }

  res.json({ success: true, coupon: coupon.code, discount: Math.round(discount) });
});

module.exports = router;
