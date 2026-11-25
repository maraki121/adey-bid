const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../database'); // ✅ SQLite db ወደ PostgreSQL pool ተቀይሯል
const { JWT_SECRET, authenticateAdmin } = require('../middleware/auth');
const router = express.Router();

console.log('✅ admin.js loaded successfully');

// ==========================================
// ADMIN AUTH
// ==========================================
router.post('/login', async (req, res) => {
  try {
    const { phone, password } = req.body;
    if (!phone || !password) return res.status(400).json({ error: 'Phone and password required' });
    
    const adminResult = await pool.query('SELECT * FROM users WHERE phone = $1 AND role = $2', [phone, 'admin']);
    const admin = adminResult.rows[0];
    
    if (!admin) return res.status(401).json({ error: 'Admin not found' });
    
    const validPassword = bcrypt.compareSync(password, admin.password);
    if (!validPassword) return res.status(401).json({ error: 'Invalid password' });
    
    const token = jwt.sign({ userId: admin.id, role: admin.role }, JWT_SECRET, { expiresIn: '24h' });
    res.json({ token, user: { id: admin.id, phone: admin.phone, name: admin.name, role: admin.role } });
  } catch (error) {
    console.error('❌ Admin login error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// ==========================================
// DASHBOARD STATS
// ==========================================
router.get('/stats', authenticateAdmin, async (req, res) => {
  try {
    // ✅ PostgreSQL COUNT(*) returns a string, so we use parseInt
    const totalUsersRes = await pool.query('SELECT COUNT(*) as count FROM users WHERE role = $1', ['user']);
    const totalAuctionsRes = await pool.query('SELECT COUNT(*) as count FROM auctions');
    const totalBidsRes = await pool.query('SELECT COUNT(*) as count FROM bids');
    const totalPaymentsRes = await pool.query('SELECT COALESCE(SUM(amount), 0) as total FROM payments WHERE status = $1', ['completed']);
    const pendingPaymentsRes = await pool.query('SELECT COUNT(*) as count FROM payments WHERE status = $1', ['pending']);

    res.json({
      totalUsers: parseInt(totalUsersRes.rows[0].count),
      totalAuctions: parseInt(totalAuctionsRes.rows[0].count),
      totalBids: parseInt(totalBidsRes.rows[0].count),
      totalPayments: parseFloat(totalPaymentsRes.rows[0].total),
      pendingPayments: parseInt(pendingPaymentsRes.rows[0].count)
    });
  } catch (error) {
    console.error('❌ Stats error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// ==========================================
// USER MANAGEMENT
// ==========================================
router.get('/users', authenticateAdmin, async (req, res) => {
  try {
    const result = await pool.query('SELECT id, phone, name, balance, role, created_at FROM users ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.put('/users/:id/balance', authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { balance } = req.body;
    await pool.query('UPDATE users SET balance = $1 WHERE id = $2', [balance, id]);
    res.json({ message: 'Balance updated' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.delete('/users/:id', authenticateAdmin, async (req, res) => {
  try {
    await pool.query('DELETE FROM users WHERE id = $1', [req.params.id]);
    res.json({ message: 'User deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// ==========================================
// AUCTION MANAGEMENT
// ==========================================
router.get('/auctions', authenticateAdmin, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT a.*, c.name as category_name, u.name as winner_name 
      FROM auctions a 
      LEFT JOIN categories c ON a.category_id = c.id 
      LEFT JOIN users u ON a.winner_id = u.id 
      ORDER BY a.created_at DESC
    `);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/auctions', authenticateAdmin, async (req, res) => {
  try {
    const { title, description, category_id, bid_cost, duration_days, end_date, image_url } = req.body;
    if (!title || !bid_cost || !duration_days || !end_date) return res.status(400).json({ error: 'Title, bid cost, duration, and end date are required' });
    
    const result = await pool.query(`
      INSERT INTO auctions (title, description, image_url, category_id, bid_cost, duration_days, end_date, status) 
      VALUES ($1, $2, $3, $4, $5, $6, $7, 'active') RETURNING *
    `, [title, description, image_url || '', category_id || null, parseFloat(bid_cost), parseInt(duration_days), end_date]);
    
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.put('/auctions/:id', authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, image_url, category_id, bid_cost, duration_days, end_date, status } = req.body;
    await pool.query(`
      UPDATE auctions SET title = $1, description = $2, image_url = $3, category_id = $4, bid_cost = $5, duration_days = $6, end_date = $7, status = $8 WHERE id = $9
    `, [title, description, image_url, category_id, bid_cost, duration_days, end_date, status, id]);
    
    const result = await pool.query('SELECT * FROM auctions WHERE id = $1', [id]);
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.delete('/auctions/:id', authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    console.log('🗑️ Deleting auction:', id);
    
    await pool.query('DELETE FROM bids WHERE auction_id = $1', [id]);
    await pool.query('DELETE FROM payments WHERE auction_id = $1', [id]);
    await pool.query('DELETE FROM auctions WHERE id = $1', [id]);
    
    console.log('✅ Auction and related data deleted');
    res.json({ message: 'Auction deleted successfully' });
  } catch (error) {
    console.error('❌ Error deleting auction:', error);
    res.status(500).json({ error: error.message });
  }
});

// ==========================================
// GET WINNER FOR AN AUCTION
// ==========================================
router.get('/auctions/:id/winner', authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const auctionResult = await pool.query('SELECT * FROM auctions WHERE id = $1', [id]);
    const auction = auctionResult.rows[0];
    if (!auction) return res.status(404).json({ error: 'Auction not found' });
    
    const bidsResult = await pool.query(`
      SELECT b.*, u.name as user_name, u.phone as user_phone
      FROM bids b
      LEFT JOIN users u ON b.user_id = u.id
      WHERE b.auction_id = $1
      ORDER BY b.number ASC
    `, [id]);
    
    const bids = bidsResult.rows;
    if (bids.length === 0) return res.json({ winner: null, message: 'No bids for this auction' });
    
    const bidCounts = {};
    bids.forEach(b => {
      const num = parseFloat(b.number);
      bidCounts[num] = (bidCounts[num] || 0) + 1;
    });
    
    const uniqueNumbers = Object.keys(bidCounts)
      .filter(num => bidCounts[num] === 1)
      .map(num => parseFloat(num));
    
    if (uniqueNumbers.length === 0) {
      return res.json({ winner: null, message: 'No unique bids - no winner yet' });
    }
    
    const winningNumber = Math.min(...uniqueNumbers);
    const winner = bids.find(b => parseFloat(b.number) === winningNumber);
    
    res.json({
      winner: {
        user_id: winner.user_id,
        user_name: winner.user_name,
        user_phone: winner.user_phone,
        bid_number: winningNumber,
        created_at: winner.created_at
      },
      auction_title: auction.title,
      total_bids: bids.length,
      total_unique_bids: uniqueNumbers.length
    });
  } catch (error) {
    console.error('❌ Fetch winner error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

router.put('/auctions/:id/status', authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    await pool.query('UPDATE auctions SET status = $1 WHERE id = $2', [status, id]);
    res.json({ message: 'Auction status updated' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// ==========================================
// CATEGORY MANAGEMENT
// ==========================================
router.get('/categories', authenticateAdmin, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM categories ORDER BY name');
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/categories', authenticateAdmin, async (req, res) => {
  try {
    const { name } = req.body;
    const result = await pool.query('INSERT INTO categories (name) VALUES ($1) RETURNING *', [name]);
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.delete('/categories/:id', authenticateAdmin, async (req, res) => {
  try {
    await pool.query('DELETE FROM categories WHERE id = $1', [req.params.id]);
    res.json({ message: 'Category deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// ==========================================
// BID MANAGEMENT
// ==========================================
router.get('/bids', authenticateAdmin, async (req, res) => {
  try {
    const bidsResult = await pool.query(`
      SELECT b.*, a.title as auction_title, a.category_id, c.name as category_name,
             u.name as user_name, u.phone as user_phone, p.amount, p.transaction_id, 
             p.bid_number as payment_bid_number, p.status as payment_status
      FROM bids b
      LEFT JOIN auctions a ON b.auction_id = a.id
      LEFT JOIN categories c ON a.category_id = c.id
      LEFT JOIN users u ON b.user_id = u.id
      LEFT JOIN payments p ON p.user_id = b.user_id AND p.auction_id = b.auction_id AND p.bid_number = b.number AND p.status = 'completed'
      ORDER BY b.number ASC
    `);
    
    const bids = bidsResult.rows;
    const bidCounts = {};
    bids.forEach(b => {
      const aid = b.auction_id;
      const num = parseFloat(b.number);
      if (!bidCounts[aid]) bidCounts[aid] = {};
      bidCounts[aid][num] = (bidCounts[aid][num] || 0) + 1;
    });
    
    const lowestUniqueByAuction = {};
    Object.keys(bidCounts).forEach(aid => {
      const counts = bidCounts[aid];
      const uniqueNumbers = Object.keys(counts).filter(num => counts[num] === 1).map(num => parseFloat(num));
      lowestUniqueByAuction[aid] = uniqueNumbers.length > 0 ? Math.min(...uniqueNumbers) : null;
    });
    
    const bidsWithLeading = bids.map(b => {
      const aid = b.auction_id;
      const num = parseFloat(b.number);
      const isLeading = lowestUniqueByAuction[aid] !== null && num === lowestUniqueByAuction[aid];
      return { ...b, is_leading: isLeading, lowest_unique_bid: lowestUniqueByAuction[aid] };
    });
    
    res.json(bidsWithLeading);
  } catch (error) {
    console.error('❌ Fetch bids error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// ==========================================
// PAYMENT MANAGEMENT
// ==========================================
router.get('/payments', authenticateAdmin, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT p.*, u.name as user_name, u.phone as user_phone, a.title as auction_title 
      FROM payments p 
      LEFT JOIN users u ON p.user_id = u.id 
      LEFT JOIN auctions a ON p.auction_id = a.id 
      ORDER BY p.created_at DESC
    `);
    res.json(result.rows);
  } catch (error) {
    console.error('❌ Fetch payments error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

router.put('/payments/:id/status', authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    const paymentResult = await pool.query('SELECT * FROM payments WHERE id = $1', [id]);
    const payment = paymentResult.rows[0];
    if (!payment) return res.status(404).json({ error: 'Payment not found' });

    await pool.query('UPDATE payments SET status = $1 WHERE id = $2', [status, id]);
    
    if (status === 'completed' || status === 'approved') {
      let bidNumber = payment.bid_number;
      if (!bidNumber) bidNumber = Math.floor(100000 + Math.random() * 900000);
      
      const dupResult = await pool.query('SELECT * FROM bids WHERE user_id = $1 AND auction_id = $2 AND number = $3', [payment.user_id, payment.auction_id, bidNumber]);
      
      if (dupResult.rows.length === 0) {
        await pool.query('INSERT INTO bids (auction_id, user_id, number) VALUES ($1, $2, $3)', [payment.auction_id, payment.user_id, bidNumber]);
        await pool.query('UPDATE users SET balance = balance - $1 WHERE id = $2', [payment.amount, payment.user_id]);
      } else {
        await pool.query('UPDATE users SET balance = balance - $1 WHERE id = $2', [payment.amount, payment.user_id]);
      }
    }
    
    res.json({ message: 'Payment status updated' });
  } catch (error) {
    console.error('❌ Error updating payment:', error);
    res.status(500).json({ error: error.message });
  }
});

// ==========================================
// OTP REQUESTS MANAGEMENT
// ==========================================
router.get('/otp-requests', authenticateAdmin, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT pr.*, u.name, u.phone as user_phone 
      FROM password_resets pr 
      LEFT JOIN users u ON pr.user_id = u.id 
      WHERE pr.status IN ('pending', 'sent') 
      ORDER BY pr.created_at DESC
    `);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/otp-requests/:id/send', authenticateAdmin, async (req, res) => {
  try {
    await pool.query('UPDATE password_resets SET status = $1 WHERE id = $2', ['sent', req.params.id]);
    res.json({ message: 'OTP marked as sent' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/otp-requests/:id/reject', authenticateAdmin, async (req, res) => {
  try {
    await pool.query('UPDATE password_resets SET status = $1 WHERE id = $2', ['rejected', req.params.id]);
    res.json({ message: 'OTP request rejected' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;