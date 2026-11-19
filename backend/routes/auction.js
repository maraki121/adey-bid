const express = require('express');
const db = require('../database');
const authMiddleware = require('../middleware/auth');
const router = express.Router();

// Get all active auctions
router.get('/', (req, res) => {
  try {
    const auctions = db.prepare(`
      SELECT a.*, c.name as category_name,
        (SELECT COUNT(*) FROM bids WHERE auction_id = a.id) as total_bids
      FROM auctions a 
      LEFT JOIN categories c ON a.category_id = c.id 
      WHERE a.status = 'active'
      ORDER BY a.created_at DESC
    `).all();
    res.json(auctions);
  } catch (error) {
    res.status(500).json({ error: 'Failed to load auctions' });
  }
});

// Get single auction with bids
router.get('/:id', (req, res) => {
  try {
    const auction = db.prepare(`
      SELECT a.*, c.name as category_name 
      FROM auctions a 
      LEFT JOIN categories c ON a.category_id = c.id 
      WHERE a.id = ?
    `).get(req.params.id);

    if (!auction) return res.status(404).json({ error: 'Auction not found' });

    const bids = db.prepare(`
      SELECT b.*, u.phone as user_phone 
      FROM bids b 
      JOIN users u ON b.user_id = u.id 
      WHERE b.auction_id = ?
      ORDER BY b.created_at ASC
    `).all(req.params.id);

    res.json({ auction, bids });
  } catch (error) {
    res.status(500).json({ error: 'Failed to load auction' });
  }
});

module.exports = router;