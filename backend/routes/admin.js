const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../database');
const { JWT_SECRET, authenticateAdmin } = require('../middleware/auth');
const router = express.Router();

console.log('✅ admin.js loaded successfully');

// ==========================================
// ADMIN AUTH
// ==========================================
router.post('/login', (req, res) => {
  const { phone, password } = req.body;
  if (!phone || !password) return res.status(400).json({ error: 'Phone and password required' });
  
  const admin = db.prepare('SELECT * FROM users WHERE phone = ? AND role = ?').get(phone, 'admin');
  if (!admin) return res.status(401).json({ error: 'Admin not found' });
  
  const validPassword = bcrypt.compareSync(password, admin.password);
  if (!validPassword) return res.status(401).json({ error: 'Invalid password' });
  
  const token = jwt.sign({ userId: admin.id, role: admin.role }, JWT_SECRET, { expiresIn: '24h' });
  res.json({ token, user: { id: admin.id, phone: admin.phone, name: admin.name, role: admin.role } });
});

// ==========================================
// DASHBOARD STATS
// ==========================================
router.get('/stats', authenticateAdmin, (req, res) => {
  const totalUsers = db.prepare('SELECT COUNT(*) as count FROM users WHERE role = ?').get('user').count;
  const totalAuctions = db.prepare('SELECT COUNT(*) as count FROM auctions').get().count;
  const totalBids = db.prepare('SELECT COUNT(*) as count FROM bids').get().count;
  const totalPayments = db.prepare('SELECT COALESCE(SUM(amount), 0) as total FROM payments WHERE status = ?').get('completed').total;
  const pendingPayments = db.prepare('SELECT COUNT(*) as count FROM payments WHERE status = ?').get('pending').count;
  res.json({ totalUsers, totalAuctions, totalBids, totalPayments, pendingPayments });
});

// ==========================================
// USER MANAGEMENT
// ==========================================
router.get('/users', authenticateAdmin, (req, res) => {
  res.json(db.prepare('SELECT id, phone, name, balance, role, created_at FROM users ORDER BY created_at DESC').all());
});

router.put('/users/:id/balance', authenticateAdmin, (req, res) => {
  const { id } = req.params;
  const { balance } = req.body;
  db.prepare('UPDATE users SET balance = ? WHERE id = ?').run(balance, id);
  res.json({ message: 'Balance updated' });
});

router.delete('/users/:id', authenticateAdmin, (req, res) => {
  db.prepare('DELETE FROM users WHERE id = ?').run(req.params.id);
  res.json({ message: 'User deleted' });
});

// ==========================================
// AUCTION MANAGEMENT
// ==========================================
router.get('/auctions', authenticateAdmin, (req, res) => {
  res.json(db.prepare(`SELECT a.*, c.name as category_name, u.name as winner_name FROM auctions a LEFT JOIN categories c ON a.category_id = c.id LEFT JOIN users u ON a.winner_id = u.id ORDER BY a.created_at DESC`).all());
});

router.post('/auctions', authenticateAdmin, (req, res) => {
  const { title, description, category_id, bid_cost, duration_days, end_date, image_url } = req.body;
  if (!title || !bid_cost || !duration_days || !end_date) return res.status(400).json({ error: 'Title, bid cost, duration, and end date are required' });
  const result = db.prepare(`INSERT INTO auctions (title, description, image_url, category_id, bid_cost, duration_days, end_date, status) VALUES (?, ?, ?, ?, ?, ?, ?, 'active')`).run(title, description, image_url || '', category_id || null, parseFloat(bid_cost), parseInt(duration_days), end_date);
  res.json(db.prepare('SELECT * FROM auctions WHERE id = ?').get(result.lastInsertRowid));
});

router.put('/auctions/:id', authenticateAdmin, (req, res) => {
  const { id } = req.params;
  const { title, description, image_url, category_id, bid_cost, duration_days, end_date, status } = req.body;
  db.prepare(`UPDATE auctions SET title = ?, description = ?, image_url = ?, category_id = ?, bid_cost = ?, duration_days = ?, end_date = ?, status = ? WHERE id = ?`).run(title, description, image_url, category_id, bid_cost, duration_days, end_date, status, id);
  res.json(db.prepare('SELECT * FROM auctions WHERE id = ?').get(id));
});

// ==========================================
// 🔥 DELETE AUCTION - WITH CASCADE DELETE
// ✅ Bids and payments also deleted
// ==========================================
router.delete('/auctions/:id', authenticateAdmin, (req, res) => {
  const { id } = req.params;
  
  console.log('🗑️ Deleting auction:', id);
  
  try {
    // Enable foreign keys
    db.exec('PRAGMA foreign_keys = ON');
    
    // Delete related bids first
    db.prepare('DELETE FROM bids WHERE auction_id = ?').run(id);
    console.log('✅ Related bids deleted');
    
    // Delete related payments
    db.prepare('DELETE FROM payments WHERE auction_id = ?').run(id);
    console.log('✅ Related payments deleted');
    
    // Delete the auction
    db.prepare('DELETE FROM auctions WHERE id = ?').run(id);
    console.log('✅ Auction deleted');
    
    res.json({ message: 'Auction deleted successfully' });
  } catch (error) {
    console.error('❌ Error deleting auction:', error);
    res.status(500).json({ error: error.message });
  }
});

// ==========================================
// 🔥 GET WINNER FOR AN AUCTION
// ✅ Lowest UNIQUE bid = Winner
// ==========================================
router.get('/auctions/:id/winner', authenticateAdmin, (req, res) => {
  const { id } = req.params;
  
  console.log('🏆 Fetching winner for auction:', id);
  
  const auction = db.prepare('SELECT * FROM auctions WHERE id = ?').get(id);
  if (!auction) return res.status(404).json({ error: 'Auction not found' });
  
  const bids = db.prepare(`
    SELECT b.*, u.name as user_name, u.phone as user_phone
    FROM bids b
    LEFT JOIN users u ON b.user_id = u.id
    WHERE b.auction_id = ?
    ORDER BY b.number ASC
  `).all(id);
  
  if (bids.length === 0) {
    return res.json({ winner: null, message: 'No bids for this auction' });
  }
  
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
  
  console.log('🏆 Winner:', winner.user_name, 'with bid:', winningNumber);
  
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
});

// ==========================================
// 🔥 UPDATE AUCTION STATUS
// ==========================================
router.put('/auctions/:id/status', authenticateAdmin, (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  
  console.log('🔄 Updating auction status:', id, 'to', status);
  
  db.prepare('UPDATE auctions SET status = ? WHERE id = ?').run(status, id);
  res.json({ message: 'Auction status updated' });
});

// ==========================================
// CATEGORY MANAGEMENT
// ==========================================
router.get('/categories', authenticateAdmin, (req, res) => {
  res.json(db.prepare('SELECT * FROM categories ORDER BY name').all());
});

router.post('/categories', authenticateAdmin, (req, res) => {
  const { name } = req.body;
  const result = db.prepare('INSERT INTO categories (name) VALUES (?)').run(name);
  res.json(db.prepare('SELECT * FROM categories WHERE id = ?').get(result.lastInsertRowid));
});

router.delete('/categories/:id', authenticateAdmin, (req, res) => {
  db.prepare('DELETE FROM categories WHERE id = ?').run(req.params.id);
  res.json({ message: 'Category deleted' });
});

// ==========================================
// 🔥 BID MANAGEMENT - LOWEST UNIQUE BID LOGIC
// ==========================================
router.get('/bids', authenticateAdmin, (req, res) => {
  console.log('🎯 Fetching all bids...');
  
  const bids = db.prepare(`
    SELECT b.*, 
           a.title as auction_title, 
           a.category_id,
           c.name as category_name,
           u.name as user_name, 
           u.phone as user_phone,
           p.amount, 
           p.transaction_id, 
           p.bid_number as payment_bid_number,
           p.status as payment_status
    FROM bids b
    LEFT JOIN auctions a ON b.auction_id = a.id
    LEFT JOIN categories c ON a.category_id = c.id
    LEFT JOIN users u ON b.user_id = u.id
    LEFT JOIN payments p ON p.user_id = b.user_id 
                        AND p.auction_id = b.auction_id 
                        AND p.bid_number = b.number
                        AND p.status = 'completed'
    ORDER BY b.number ASC
  `).all();
  
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
    const uniqueNumbers = Object.keys(counts)
      .filter(num => counts[num] === 1)
      .map(num => parseFloat(num));
    
    if (uniqueNumbers.length > 0) {
      lowestUniqueByAuction[aid] = Math.min(...uniqueNumbers);
      console.log(`🏆 Auction ${aid}: Lowest unique bid = ${lowestUniqueByAuction[aid]}`);
    } else {
      lowestUniqueByAuction[aid] = null;
      console.log(`⚠️ Auction ${aid}: No unique bids`);
    }
  });
  
  const bidsWithLeading = bids.map(b => {
    const aid = b.auction_id;
    const num = parseFloat(b.number);
    const isLeading = lowestUniqueByAuction[aid] !== null && num === lowestUniqueByAuction[aid];
    return {
      ...b,
      is_leading: isLeading,
      lowest_unique_bid: lowestUniqueByAuction[aid]
    };
  });
  
  console.log('📋 Found', bidsWithLeading.length, 'bids');
  res.json(bidsWithLeading);
});

// ==========================================
// PAYMENT MANAGEMENT
// ==========================================
router.get('/payments', authenticateAdmin, (req, res) => {
  console.log('💰 Fetching all payments...');
  const payments = db.prepare(`
    SELECT p.*, u.name as user_name, u.phone as user_phone, a.title as auction_title 
    FROM payments p 
    LEFT JOIN users u ON p.user_id = u.id 
    LEFT JOIN auctions a ON p.auction_id = a.id 
    ORDER BY p.created_at DESC
  `).all();
  console.log('📋 Found', payments.length, 'payments');
  res.json(payments);
});

// ==========================================
// 🔥 UPDATE PAYMENT STATUS + CREATE BID + DEDUCT BALANCE
// ==========================================
router.put('/payments/:id/status', authenticateAdmin, (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  
  console.log('💰 Updating payment status:', id, 'to', status);
  
  try {
    const payment = db.prepare('SELECT * FROM payments WHERE id = ?').get(id);
    if (!payment) return res.status(404).json({ error: 'Payment not found' });

    console.log('📋 Payment details:', payment);
    console.log('🔍 Payment bid_number value:', payment.bid_number, typeof payment.bid_number);
    
    db.prepare('UPDATE payments SET status = ? WHERE id = ?').run(status, id);
    
    if (status === 'completed' || status === 'approved') {
      console.log('📦 Creating bid for payment:', payment.id);
      
      let bidNumber = payment.bid_number;
      
      if (!bidNumber) {
        bidNumber = Math.floor(100000 + Math.random() * 900000);
        console.log('⚠️ No bid number in payment, generated random:', bidNumber);
      }
      
      const exactDuplicate = db.prepare('SELECT * FROM bids WHERE user_id = ? AND auction_id = ? AND number = ?').get(payment.user_id, payment.auction_id, bidNumber);
      
      console.log('🔍 Exact duplicate check result:', exactDuplicate);
      
      if (!exactDuplicate) {
        console.log('🟢 Inserting NEW bid: auction_id=', payment.auction_id, 'user_id=', payment.user_id, 'number=', bidNumber);
        
        db.prepare(`INSERT INTO bids (auction_id, user_id, number) VALUES (?, ?, ?)`).run(payment.auction_id, payment.user_id, bidNumber);
        
        console.log('✅ Bid created successfully with number:', bidNumber);
        
        console.log('💸 Deducting', payment.amount, 'from user', payment.user_id);
        db.prepare('UPDATE users SET balance = balance - ? WHERE id = ?').run(payment.amount, payment.user_id);
        console.log('✅ Balance deducted');
      } else {
        console.log('🟡 Exact duplicate bid exists (same number) - skipping bid creation but still deducting balance');
        db.prepare('UPDATE users SET balance = balance - ? WHERE id = ?').run(payment.amount, payment.user_id);
      }
    }
    
    if (status === 'rejected') {
      console.log('❌ Payment rejected - no bid created, no balance deducted');
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
router.get('/otp-requests', authenticateAdmin, (req, res) => {
  const requests = db.prepare(`SELECT pr.*, u.name, u.phone as user_phone FROM password_resets pr LEFT JOIN users u ON pr.user_id = u.id WHERE pr.status IN ('pending', 'sent') ORDER BY pr.created_at DESC`).all();
  res.json(requests);
});

router.post('/otp-requests/:id/send', authenticateAdmin, (req, res) => {
  db.prepare('UPDATE password_resets SET status = ? WHERE id = ?').run('sent', req.params.id);
  res.json({ message: 'OTP marked as sent' });
});

router.post('/otp-requests/:id/reject', authenticateAdmin, (req, res) => {
  db.prepare('UPDATE password_resets SET status = ? WHERE id = ?').run('rejected', req.params.id);
  res.json({ message: 'OTP request rejected' });
});

module.exports = router;