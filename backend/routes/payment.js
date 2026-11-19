const express = require('express');
const db = require('../database');
const { authenticateUser } = require('../middleware/auth');
const router = express.Router();

console.log('✅ payment.js loaded successfully');

// ==========================================
// 🔥 CREATE PAYMENT (WITH USER'S BID NUMBER)
// Balance አይቀንስም - admin approve ሲያደርግ ብቻ ይቀንሳል
// ==========================================
router.post('/', authenticateUser, (req, res) => {
  const { auction_id, amount, transaction_id, bid_number, method } = req.body;
  const user_id = req.userId;

  console.log('💰 Creating payment:', { auction_id, amount, transaction_id, bid_number, user_id });

  if (!auction_id || !amount || !transaction_id) {
    return res.status(400).json({ error: 'Auction ID, amount, and transaction ID are required' });
  }

  const result = db.prepare(`
    INSERT INTO payments (user_id, auction_id, amount, transaction_id, method, bid_number, status, created_at)
    VALUES (?, ?, ?, ?, ?, ?, 'pending', datetime('now'))
  `).run(user_id, auction_id, amount, transaction_id, method || 'telebirr', bid_number || null);

  const payment = db.prepare('SELECT * FROM payments WHERE id = ?').get(result.lastInsertRowid);
  console.log('✅ Payment created (pending):', payment);
  res.json(payment);
});

// Get user's payments
router.get('/my-payments', authenticateUser, (req, res) => {
  const user_id = req.userId;
  const payments = db.prepare(`
    SELECT p.*, a.title as auction_title
    FROM payments p
    LEFT JOIN auctions a ON p.auction_id = a.id
    WHERE p.user_id = ?
    ORDER BY p.created_at DESC
  `).all(user_id);
  res.json(payments);
});

module.exports = router;