const express = require('express');
const pool = require('../database'); // ✅ SQLite db ወደ PostgreSQL pool ተቀይሯል
const { authenticateUser } = require('../middleware/auth');
const router = express.Router();

console.log('✅ payment.js loaded successfully');

// ==========================================
// 🔥 CREATE PAYMENT (PostgreSQL Version)
// Balance አይቀንስም - admin approve ሲያደርግ ብቻ ይቀንሳል
// ==========================================
router.post('/', authenticateUser, async (req, res) => {
  try {
    const { auction_id, amount, transaction_id, bid_number, method } = req.body;
    const user_id = req.userId;

    console.log('💰 Creating payment:', { auction_id, amount, transaction_id, bid_number, user_id });

    if (!auction_id || !amount || !transaction_id) {
      return res.status(400).json({ error: 'Auction ID, amount, and transaction ID are required' });
    }

    // ✅ PostgreSQL Query: 
    // 1. ? ወደ $1, $2, $3... ተቀይሯል
    // 2. datetime('now') ወደ CURRENT_TIMESTAMP ተቀይሯል
    // 3. RETURNING * ተጨምሯል (የተጨመረውን ረድፍ ወዲያውኑ ለማግኘት)
    const result = await pool.query(`
      INSERT INTO payments (user_id, auction_id, amount, transaction_id, method, bid_number, status, created_at)
      VALUES ($1, $2, $3, $4, $5, $6, 'pending', CURRENT_TIMESTAMP)
      RETURNING *
    `, [user_id, auction_id, amount, transaction_id, method || 'telebirr', bid_number || null]);

    // ✅ በ PostgreSQL ላይ lastInsertRowid አያስፈልግም፣ RETURNING * ወዲያውኑ ይሰጠናል
    const payment = result.rows[0];
    console.log('✅ Payment created (pending):', payment);
    res.json(payment);
    
  } catch (error) {
    console.error('❌ Payment creation error:', error);
    res.status(500).json({ error: 'Failed to create payment. Please try again.' });
  }
});

// ==========================================
// 🔥 GET USER'S PAYMENTS (PostgreSQL Version)
// ==========================================
router.get('/my-payments', authenticateUser, async (req, res) => {
  try {
    const user_id = req.userId;
    
    // ✅ .all() ወደ pool.query ተቀይሯል፣ ? ወደ $1 ተቀይሯል
    const result = await pool.query(`
      SELECT p.*, a.title as auction_title
      FROM payments p
      LEFT JOIN auctions a ON p.auction_id = a.id
      WHERE p.user_id = $1
      ORDER BY p.created_at DESC
    `, [user_id]);
    
    // ✅ ውጤቱ በ result.rows ውስጥ ነው የሚመጣው
    res.json(result.rows);
    
  } catch (error) {
    console.error('❌ Fetch payments error:', error);
    res.status(500).json({ error: 'Failed to fetch payments' });
  }
});

module.exports = router;