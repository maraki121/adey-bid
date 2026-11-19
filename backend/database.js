const Database = require('better-sqlite3');
const bcrypt = require('bcryptjs');
const path = require('path');

const db = new Database(path.join(__dirname, 'adey-bid.db'));

db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// Users table
db.prepare(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    phone TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    name TEXT,
    balance REAL DEFAULT 0,
    role TEXT DEFAULT 'user',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`).run();

// Categories table
db.prepare(`
  CREATE TABLE IF NOT EXISTS categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT UNIQUE NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`).run();

// Auctions table
db.prepare(`
  CREATE TABLE IF NOT EXISTS auctions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT,
    image_url TEXT,
    category_id INTEGER,
    bid_cost REAL NOT NULL,
    duration_days INTEGER NOT NULL,
    end_date DATETIME NOT NULL,
    status TEXT DEFAULT 'active',
    winner_id INTEGER,
    winning_number INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(id),
    FOREIGN KEY (winner_id) REFERENCES users(id)
  )
`).run();

// Bids table
db.prepare(`
  CREATE TABLE IF NOT EXISTS bids (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    auction_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    number REAL NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (auction_id) REFERENCES auctions(id),
    FOREIGN KEY (user_id) REFERENCES users(id)
  )
`).run();

// Payments table
db.prepare(`
  CREATE TABLE IF NOT EXISTS payments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    amount REAL NOT NULL,
    method TEXT NOT NULL,
    transaction_id TEXT NOT NULL,
    auction_id INTEGER,
    bid_number REAL,
    status TEXT DEFAULT 'pending',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
  )
`).run();

// ✅ FIXED: password_resets table - user_id is NOT NULL
db.prepare(`
  CREATE TABLE IF NOT EXISTS password_resets (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    phone TEXT NOT NULL,
    otp TEXT NOT NULL,
    status TEXT DEFAULT 'pending',
    new_password TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
  )
`).run();

// Indexes
db.prepare(`CREATE INDEX IF NOT EXISTS idx_bids_auction ON bids(auction_id)`).run();
db.prepare(`CREATE INDEX IF NOT EXISTS idx_bids_user ON bids(user_id)`).run();
db.prepare(`CREATE INDEX IF NOT EXISTS idx_payments_user ON payments(user_id)`).run();
db.prepare(`CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status)`).run();
db.prepare(`CREATE INDEX IF NOT EXISTS idx_password_resets_phone ON password_resets(phone)`).run();

// Seed default categories
const defaultCategories = ['Electronics', 'Vehicles', 'Fashion', 'Sports', 'Home'];
const insertCat = db.prepare('INSERT OR IGNORE INTO categories (name) VALUES (?)');
defaultCategories.forEach(cat => insertCat.run(cat));

// Create default admin user
const adminExists = db.prepare('SELECT id FROM users WHERE phone = ?').get('0911111111');
if (!adminExists) {
  const hashedPassword = bcrypt.hashSync('admin123', 10);
  db.prepare('INSERT INTO users (phone, password, name, role) VALUES (?, ?, ?, ?)').run(
    '0911111111',
    hashedPassword,
    'Admin',
    'admin'
  );
  console.log('✅ Default admin created: 0911111111 / admin123');
}

console.log('✅ Database initialized successfully');

module.exports = db;