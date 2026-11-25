const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../database'); // ✅ SQLite db ወደ PostgreSQL pool ተቀይሯል
const { JWT_SECRET } = require('../middleware/auth');
const router = express.Router();

// ==========================================
// USER AUTH ROUTES
// ==========================================

// Login
router.post('/login', async (req, res) => {
  try {
    const { phone, password } = req.body;
    
    if (!phone || !password) {
      return res.status(400).json({ error: 'Phone and password required' });
    }

    // ✅ PostgreSQL: ? ወደ $1 ተቀይሯል፣ .get() ወደ .query() ተቀይሯል
    const result = await pool.query('SELECT * FROM users WHERE phone = $1', [phone]);
    const user = result.rows[0];
    
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
  } catch (error) {
    console.error('❌ Login error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Register
router.post('/register', async (req, res) => {
  try {
    const { phone, password, name } = req.body;
    
    if (!phone || !password) {
      return res.status(400).json({ error: 'Phone and password required' });
    }

    const existingResult = await pool.query('SELECT id FROM users WHERE phone = $1', [phone]);
    if (existingResult.rows.length > 0) {
      return res.status(400).json({ error: 'Phone already registered' });
    }

    const hashedPassword = bcrypt.hashSync(password, 10);
    
    // ✅ PostgreSQL: RETURNING * የተጨመረ ሲሆን lastInsertRowid አያስፈልግም
    const insertResult = await pool.query(
      'INSERT INTO users (phone, password, name, role) VALUES ($1, $2, $3, $4) RETURNING *',
      [phone, hashedPassword, name || '', 'user']
    );

    const user = insertResult.rows[0];
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
  } catch (error) {
    console.error('❌ Register error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// ==========================================
// FORGOT PASSWORD ROUTES
// ==========================================

// Forgot Password - Request OTP
router.post('/forgot-password', async (req, res) => {
  try {
    console.log('🔥 FORGOT PASSWORD REQUEST:', req.body);
    
    const { phone } = req.body;
    
    if (!phone) {
      console.log('❌ No phone provided');
      return res.status(400).json({ error: 'Phone number is required' });
    }

    const userResult = await pool.query('SELECT * FROM users WHERE phone = $1', [phone]);
    const user = userResult.rows[0];
    
    if (!user) {
      console.log('❌ User not found for phone:', phone);
      return res.status(404).json({ error: 'Phone number not found' });
    }

    console.log('✅ User found. ID:', user.id, 'Generating OTP...');
    
    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    console.log('🔑 Generated OTP:', otp);
    
    await pool.query(
      "INSERT INTO password_resets (user_id, phone, otp, status) VALUES ($1, $2, $3, 'pending')",
      [user.id, phone, otp]
    );
    console.log('✅ OTP saved to database successfully!');
    res.json({ message: 'OTP generated successfully. Admin will review.' });
  } catch (error) {
    console.error('❌ DATABASE ERROR saving OTP:', error.message);
    res.status(500).json({ error: 'Database error: ' + error.message });
  }
});

// Reset Password - Verify OTP and Update
router.post('/reset-password', async (req, res) => {
  try {
    console.log('🔥 RESET PASSWORD REQUEST:', req.body);
    
    const { phone, otp, newPassword } = req.body;
    
    if (!phone || !otp || !newPassword) {
      return res.status(400).json({ error: 'Phone, OTP, and new password are required' });
    }

    const resetResult = await pool.query(`
      SELECT * FROM password_resets 
      WHERE phone = $1 AND otp = $2 AND status IN ($3, $4) 
      ORDER BY created_at DESC LIMIT 1
    `, [phone, otp, 'pending', 'sent']);

    const resetRequest = resetResult.rows[0];

    if (!resetRequest) {
      console.log('❌ Invalid or expired OTP');
      return res.status(400).json({ error: 'Invalid or expired OTP' });
    }

    const hashedPassword = bcrypt.hashSync(newPassword, 10);
    
    // Update user password
    await pool.query('UPDATE users SET password = $1 WHERE phone = $2', [hashedPassword, phone]);
    
    // Mark reset as completed
    await pool.query('UPDATE password_resets SET status = $1 WHERE id = $2', ['completed', resetRequest.id]);

    console.log('✅ Password reset successfully for:', phone);
    res.json({ message: 'Password reset successfully' });
  } catch (error) {
    console.error('❌ Reset password error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// ==========================================
// ADMIN OTP ROUTES
// ==========================================

// Get Pending OTP Requests
router.get('/admin/otp-requests', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT * FROM password_resets 
      WHERE status IN ('pending', 'sent') 
      ORDER BY created_at DESC
    `);
    res.json(result.rows);
  } catch (error) {
    console.error('❌ Fetch OTP requests error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Admin: Mark OTP as Sent
router.post('/admin/otp-requests/:id/send', async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('UPDATE password_resets SET status = $1 WHERE id = $2', ['sent', id]);
    res.json({ message: 'OTP marked as sent' });
  } catch (error) {
    console.error('❌ Update OTP status error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Admin: Reject OTP Request
router.post('/admin/otp-requests/:id/reject', async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('UPDATE password_resets SET status = $1 WHERE id = $2', ['rejected', id]);
    res.json({ message: 'OTP request rejected' });
  } catch (error) {
    console.error('❌ Reject OTP request error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;