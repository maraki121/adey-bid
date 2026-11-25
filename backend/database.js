// Force IPv4 to fix ENETUNREACH on Render
const dns = require('dns');
dns.setDefaultResultOrder('ipv4first');

const { Pool } = require('pg');
const bcrypt = require('bcryptjs');

// PostgreSQL Connection Pool (ለ 30,000+ ሰዎች የተሰራ)
// ✅ Project ID: zhjxlpclomsypeftixkf (l እንጂ d አይደለም!)
// ✅ Password: Tsion-1811-qpio (i እንጂ l አይደለም!)
// ✅ Render ላይ DATABASE_URL ከ Environment Variables ይጠቀማል
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:Tsion-1811-qpio@db.zhjxlpclomsypeftixkf.supabase.co:5432/postgres',
  ssl: false
});

// ዳታቤዝ ሰንጠረዦችን መፍጠር (ካልተፈጠሩ ብቻ)
const initializeDatabase = async () => {
  try {
    // 1. Users table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        phone TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        name TEXT,
        balance NUMERIC DEFAULT 0,
        role TEXT DEFAULT 'user',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 2. Categories table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS categories (
        id SERIAL PRIMARY KEY,
        name TEXT UNIQUE NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 3. Auctions table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS auctions (
        id SERIAL PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT,
        image_url TEXT,
        category_id INTEGER REFERENCES categories(id),
        bid_cost NUMERIC NOT NULL,
        duration_days INTEGER NOT NULL,
        end_date TIMESTAMP NOT NULL,
        status TEXT DEFAULT 'active',
        winner_id INTEGER REFERENCES users(id),
        winning_number NUMERIC,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 4. Bids table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS bids (
        id SERIAL PRIMARY KEY,
        auction_id INTEGER REFERENCES auctions(id),
        user_id INTEGER REFERENCES users(id),
        number NUMERIC NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 5. Payments table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS payments (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        amount NUMERIC NOT NULL,
        method TEXT NOT NULL,
        transaction_id TEXT NOT NULL,
        auction_id INTEGER,
        bid_number NUMERIC,
        status TEXT DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 6. Password resets table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS password_resets (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        phone TEXT NOT NULL,
        otp TEXT NOT NULL,
        status TEXT DEFAULT 'pending',
        new_password TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Indexes (ለፍጥነት)
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_bids_auction ON bids(auction_id)`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_bids_user ON bids(user_id)`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_payments_user ON payments(user_id)`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status)`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_password_resets_phone ON password_resets(phone)`);

    // Seed default categories
    const defaultCategories = ['Electronics', 'Vehicles', 'Fashion', 'Sports', 'Home'];
    for (const cat of defaultCategories) {
      await pool.query(
        `INSERT INTO categories (name) VALUES ($1) ON CONFLICT (name) DO NOTHING`,
        [cat]
      );
    }

    // Create default admin user
    const adminCheck = await pool.query('SELECT id FROM users WHERE phone = $1', ['0911111111']);
    if (adminCheck.rows.length === 0) {
      const hashedPassword = bcrypt.hashSync('admin123', 10);
      await pool.query(
        'INSERT INTO users (phone, password, name, role) VALUES ($1, $2, $3, $4)',
        ['0911111111', hashedPassword, 'Admin', 'admin']
      );
      console.log('✅ Default admin created: 0911111111 / admin123');
    }

    console.log('✅ PostgreSQL Database initialized successfully!');
  } catch (error) {
    console.error('❌ Database initialization error:', error);
  }
};

// ግንኙነት መሞከር እና ሰንጠረዦችን መፍጠር
pool.connect((err, client, release) => {
  if (err) {
    console.error('❌ PostgreSQL connection error:', err.stack);
  } else {
    console.log('✅ Connected to PostgreSQL! Initializing tables...');
    release();
    initializeDatabase();
  }
});

module.exports = pool;