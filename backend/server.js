const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const authRoutes = require('./routes/auth');
const auctionRoutes = require('./routes/auction');
const adminRoutes = require('./routes/admin');
const paymentRoutes = require('./routes/payment');
const uploadRoutes = require('./routes/upload'); // ✅ አዲስ የተጨመረ

const app = express();

// Create uploads folder
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// ==========================================
// 🔥 MIDDLEWARE (በትክክለኛው order!)
// ==========================================
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// ✅ JSON body parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ✅ Static files (ፎቶዎችን ለ browser ለማሳየት ይህ ወሳኝ ነው!)
app.use('/uploads', express.static(uploadDir));

// Request logger
app.use((req, res, next) => {
  console.log(`📥 REQUEST: ${req.method} ${req.originalUrl}`);
  if (!req.originalUrl.includes('/api/upload')) {
    console.log('📋 Body:', req.body);
  }
  next();
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/auctions', auctionRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/upload', uploadRoutes); // ✅ አዲስ የተጨመረ

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// 404 Handler
app.use((req, res) => {
  console.log(`❌ 404 NOT FOUND: ${req.method} ${req.originalUrl}`);
  res.status(404).json({
    error: 'Route not found',
    path: req.originalUrl,
    method: req.method
  });
});

// Error Handler
app.use((err, req, res, next) => {
  console.error('❌ SERVER ERROR:', err.message);
  res.status(500).json({ error: err.message });
});

// Start server
const PORT = 5000;
app.listen(PORT, () => {
  console.log('========================================');
  console.log(`✅ Server running on port ${PORT}`);
  console.log(`✅ Uploads served at: http://localhost:${PORT}/uploads/`);
  console.log('========================================');
});