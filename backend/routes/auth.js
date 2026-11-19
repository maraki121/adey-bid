const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../database');
const { JWT_SECRET } = require('../middleware/auth');
const router = express.Router();

// ==========================================
// USER AUTH ROUTES
// ==========================================

// Login
router.post('/login', (req, res) => {
  const { phone, password } = req.body;
  
  if (!phone || !password) {
    return res.status(400).json({ error: 'Phone and password required' });
  }

  const user = db.prepare('SELECT * FROM users WHERE phone = ?').get(phone);
  
  if (!user) {
    return res.status(401).json({ error: 'User not found' });
  }

  const validPassword = bcrypt.compareSync(password, user.password);
  
  if (!validPassword) {
    return res.status(401).json({ error: 'Invalid password' });
  }

  const token = jwt.sign({ userId: user.id, role: user.role }, JWT_SECRET, { expiresIn: '24h' });

  res.json({
    token,
    user: {
      id: user.id,
      phone: user.phone,
      name: user.name,
      role: user.role,
      balance: user.balance
    }
  });
});

// Register
router.post('/register', (req, res) => {
  const { phone, password, name } = req.body;
  
  if (!phone || !password) {
    return res.status(400).json({ error: 'Phone and password required' });
  }

  const existingUser = db.prepare('SELECT id FROM users WHERE phone = ?').get(phone);
  
  if (existingUser) {
    return res.status(400).json({ error: 'Phone already registered' });
  }

  const hashedPassword = bcrypt.hashSync(password, 10);
  
  const result = db.prepare('INSERT INTO users (phone, password, name, role) VALUES (?, ?, ?, ?)').run(
    phone, hashedPassword, name || '', 'user'
  );

  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(result.lastInsertRowid);
  const token = jwt.sign({ userId: user.id, role: user.role }, JWT_SECRET, { expiresIn: '24h' });

  res.json({
    token,
    user: {
      id: user.id,
      phone: user.phone,
      name: user.name,
      role: user.role,
      balance: user.balance
    }
  });
});

// ==========================================
// FORGOT PASSWORD ROUTES
// ==========================================

// Forgot Password - Request OTP
router.post('/forgot-password', (req, res) => {
  console.log('🔥 FORGOT PASSWORD REQUEST:', req.body);
  
  const { phone } = req.body;
  
  if (!phone) {
    console.log('❌ No phone provided');
    return res.status(400).json({ error: 'Phone number is required' });
  }

  const user = db.prepare('SELECT * FROM users WHERE phone = ?').get(phone);
  
  if (!user) {
    console.log('❌ User not found for phone:', phone);
    return res.status(404).json({ error: 'Phone number not found' });
  }

  console.log('✅ User found. ID:', user.id, 'Generating OTP...');
  
  // Generate 6-digit OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  console.log('🔑 Generated OTP:', otp);
  
  try {
    // ✅ FIXED: user_id is now included and NOT NULL
    db.prepare("INSERT INTO password_resets (user_id, phone, otp, status) VALUES (?, ?, ?, 'pending')").run(user.id, phone, otp);
    console.log('✅ OTP saved to database successfully!');
    res.json({ message: 'OTP generated successfully. Admin will review.' });
  } catch (error) {
    console.error('❌ DATABASE ERROR saving OTP:', error.message);
    res.status(500).json({ error: 'Database error: ' + error.message });
  }
});

// Reset Password - Verify OTP and Update
router.post('/reset-password', (req, res) => {
  console.log('🔥 RESET PASSWORD REQUEST:', req.body);
  
  const { phone, otp, newPassword } = req.body;
  
  if (!phone || !otp || !newPassword) {
    return res.status(400).json({ error: 'Phone, OTP, and new password are required' });
  }

  const resetRequest = db.prepare(`
    SELECT * FROM password_resets 
    WHERE phone = ? AND otp = ? AND status IN ('pending', 'sent') 
    ORDER BY created_at DESC LIMIT 1
  `).get(phone, otp);

  if (!resetRequest) {
    console.log('❌ Invalid or expired OTP');
    return res.status(400).json({ error: 'Invalid or expired OTP' });
  }

  const hashedPassword = bcrypt.hashSync(newPassword, 10);
  
  // Update user password
  db.prepare('UPDATE users SET password = ? WHERE phone = ?').run(hashedPassword, phone);
  
  // Mark reset as completed
  db.prepare('UPDATE password_resets SET status = ? WHERE id = ?').run('completed', resetRequest.id);

  console.log('✅ Password reset successfully for:', phone);
  res.json({ message: 'Password reset successfully' });
});

// ==========================================
// ADMIN OTP ROUTES
// ==========================================

// Get Pending OTP Requests
router.get('/admin/otp-requests', (req, res) => {
  const requests = db.prepare(`
    SELECT * FROM password_resets 
    WHERE status IN ('pending', 'sent') 
    ORDER BY created_at DESC
  `).all();
  res.json(requests);
});

// Admin: Mark OTP as Sent
router.post('/admin/otp-requests/:id/send', (req, res) => {
  const { id } = req.params;
  db.prepare('UPDATE password_resets SET status = ? WHERE id = ?').run('sent', id);
  res.json({ message: 'OTP marked as sent' });
});

// Admin: Reject OTP Request
router.post('/admin/otp-requests/:id/reject', (req, res) => {
  const { id } = req.params;
  db.prepare('UPDATE password_resets SET status = ? WHERE id = ?').run('rejected', id);
  res.json({ message: 'OTP request rejected' });
});

module.exports = router;