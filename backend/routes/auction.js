const express = require('express');
const pool = require('../database'); // ✅ SQLite db ወደ PostgreSQL pool ተቀይሯል
const authMiddleware = require('../middleware/auth');
const router = express.Router();

// ==========================================
// 🔥 GET ALL ACTIVE AUCTIONS (PostgreSQL Version)
// ==========================================
router.get('/', async (req, res) => {
  try {
    // ✅ .all() ወደ pool.query ተቀይሯል
    const result = await pool.query(`
      SELECT a.*, c.name as category_name,
        (SELECT COUNT(*) FROM bids WHERE auction_id = a.id) as total_bids
      FROM auctions a 
      LEFT JOIN categories c ON a.category_id = c.id 
      WHERE a.status = 'active'
      ORDER BY a.created_at DESC
    `);
    
    // ✅ ውጤቱ በ result.rows ውስጥ ነው የሚመጣው
    res.json(result.rows);
  } catch (error) {
    console.error('❌ Failed to load auctions:', error);
    res.status(500).json({ error: 'Failed to load auctions' });
  }
});

// ==========================================
// 🔥 GET SINGLE AUCTION WITH BIDS (PostgreSQL Version)
// ==========================================
router.get('/:id', async (req, res) => {
  try {
    // ✅ ? ወደ $1 ተቀይሯል፣ .get() ወደ pool.query ተቀይሯል
    const auctionResult = await pool.query(`
      SELECT a.*, c.name as category_name 
      FROM auctions a 
      LEFT JOIN categories c ON a.category_id = c.id 
      WHERE a.id = $1
    `, [req.params.id]);

    const auction = auctionResult.rows[0];
    if (!auction) return res.status(404).json({ error: 'Auction not found' });

    // ✅ Bids ለማግኘት
    const bidsResult = await pool.query(`
      SELECT b.*, u.phone as user_phone 
      FROM bids b 
      JOIN users u ON b.user_id = u.id 
      WHERE b.auction_id = $1
      ORDER BY b.created_at ASC
    `, [req.params.id]);

    res.json({ 
      auction, 
      bids: bidsResult.rows 
    });
  } catch (error) {
    console.error('❌ Failed to load auction:', error);
    res.status(500).json({ error: 'Failed to load auction' });
  }
});

module.exports = router;