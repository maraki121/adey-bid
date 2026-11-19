import { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';

export default function BidPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isSunny, toggleTheme } = useTheme();
  const [auction, setAuction] = useState(null);
  const [bids, setBids] = useState([]);
  const [number, setNumber] = useState('');
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState(null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem('user'));
    setUser(userData);
    loadAuction();
  }, [id]);

  useEffect(() => {
    const timer = setInterval(() => {
      if (auction?.end_date) {
        const diff = new Date(auction.end_date) - new Date();
        if (diff > 0) {
          setTimeLeft({
            days: Math.floor(diff / (1000 * 60 * 60 * 24)),
            hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
            minutes: Math.floor((diff / 1000 / 60) % 60),
            seconds: Math.floor((diff / 1000) % 60)
          });
        } else { setTimeLeft(null); }
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [auction]);

  const loadAuction = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/api/auctions/${id}`);
      setAuction(res.data.auction);
      setBids(res.data.bids || []);
      setLoading(false);
    } catch (error) { console.error('Error:', error); setLoading(false); }
  };

  const handleBid = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    if (!token) {
      alert('Please login first');
      navigate('/');
      return;
    }
    const bidNum = parseFloat(number);
    if (isNaN(bidNum) || bidNum < 1) {
      alert('Please enter a valid number (minimum 1)');
      return;
    }
    navigate(`/payment?auction_id=${id}&bid_number=${bidNum}&amount=${auction.bid_cost}`);
  };

  if (loading) return (
    <div className={`min-h-screen flex items-center justify-center ${isSunny ? 'bg-gradient-to-br from-yellow-100 to-orange-100' : 'bg-black'}`}>
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        className={`w-16 h-16 border-4 border-t-transparent rounded-full ${isSunny ? 'border-orange-500' : 'border-purple-500'}`}
      ></motion.div>
    </div>
  );
  
  if (!auction) return (
    <div className={`min-h-screen flex items-center justify-center ${isSunny ? 'bg-gradient-to-br from-yellow-100 to-orange-100' : 'bg-black'}`}>
      <p className={`text-xl ${isSunny ? 'text-gray-800' : 'text-white'}`}>Auction not found</p>
    </div>
  );

  const uniqueBids = bids.filter((b, i, arr) => arr.findIndex(x => x.number === b.number) === i);
  const lowestUnique = uniqueBids.length > 0 ? Math.min(...uniqueBids.map(b => b.number)) : null;
  const isAdmin = user?.role === 'admin';

  return (
    <div className={`min-h-screen relative overflow-hidden transition-colors duration-500 ${
      isSunny ? 'bg-gradient-to-br from-yellow-100 via-orange-50 to-pink-100' : 'bg-black'
    }`}>
      
      {/* Background */}
      {isSunny ? (
        <div className="absolute inset-0 pointer-events-none">
          <motion.div
            animate={{ y: [0, -20, 0], scale: [1, 1.1, 1] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-20 right-20 w-32 h-32"
          >
            <div className="absolute inset-0 bg-yellow-400 rounded-full blur-3xl opacity-60"></div>
            <div className="relative w-full h-full bg-gradient-to-br from-yellow-300 to-orange-400 rounded-full shadow-2xl"></div>
          </motion.div>
          {[...Array(5)].map((_, i) => (
            <motion.div
              key={i}
              animate={{ x: [0, 100, 0] }}
              transition={{ duration: 20 + i * 5, repeat: Infinity, ease: "linear" }}
              className="absolute bg-white/70 rounded-full blur-xl"
              style={{ width: 100 + i * 20, height: 40 + i * 10, top: `${10 + i * 15}%`, left: `${i * 20}%` }}
            />
          ))}
        </div>
      ) : (
        <>
          <div className="absolute inset-0">
            <motion.div
              animate={{ background: ['radial-gradient(circle at 20% 30%, rgba(168,85,247,0.4) 0%, transparent 50%)', 'radial-gradient(circle at 80% 70%, rgba(236,72,153,0.4) 0%, transparent 50%)', 'radial-gradient(circle at 20% 30%, rgba(168,85,247,0.4) 0%, transparent 50%)'] }}
              transition={{ duration: 15, repeat: Infinity }}
              className="absolute inset-0"
            ></motion.div>
            <motion.div
              animate={{ background: ['radial-gradient(circle at 80% 20%, rgba(249,115,22,0.3) 0%, transparent 50%)', 'radial-gradient(circle at 20% 80%, rgba(59,130,246,0.3) 0%, transparent 50%)', 'radial-gradient(circle at 80% 20%, rgba(249,115,22,0.3) 0%, transparent 50%)'] }}
              transition={{ duration: 18, repeat: Infinity }}
              className="absolute inset-0"
            ></motion.div>
          </div>
          <div className="absolute inset-0 pointer-events-none">
            {[...Array(25)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute rounded-full"
                style={{ left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%`, width: Math.random() * 4 + 2, height: Math.random() * 4 + 2, background: ['#a855f7', '#ec4899', '#f97316', '#3b82f6'][i % 4] }}
                animate={{ y: [0, -100, 0], opacity: [0, 0.6, 0], scale: [0, 1, 0] }}
                transition={{ duration: Math.random() * 10 + 10, delay: Math.random() * 5, repeat: Infinity, ease: "easeInOut" }}
              />
            ))}
          </div>
        </>
      )}

      {/* Grid Pattern */}
      <div className={`absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:80px_80px] ${isSunny ? 'opacity-30' : ''}`}></div>

      {/* Header */}
      <motion.header
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className={`relative z-10 backdrop-blur-2xl border-b sticky top-0 transition-colors duration-500 ${
          isSunny ? 'bg-white/60 border-orange-200' : 'bg-slate-950/80 border-white/10'
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="flex items-center gap-3 cursor-pointer"
            onClick={() => navigate('/auctions')}
          >
            <div className="relative">
              <div className={`absolute inset-0 rounded-xl blur-lg opacity-75 ${isSunny ? 'bg-orange-400' : 'bg-purple-500'}`}></div>
              <div className={`relative bg-gradient-to-br rounded-xl p-2.5 ${isSunny ? 'from-orange-400 to-pink-500' : 'from-purple-600 to-pink-600'}`}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-white" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M13 2L3 14h7l-1 8 10-12h-7l1-8z" />
                </svg>
              </div>
            </div>
            <div>
              <h1 className={`text-2xl font-black bg-gradient-to-r bg-clip-text text-transparent ${isSunny ? 'from-orange-600 via-pink-600 to-red-600' : 'from-purple-300 via-pink-300 to-orange-300'}`}>
                Adey Bid
              </h1>
              <p className={`text-[10px] font-bold uppercase tracking-[0.3em] ${isSunny ? 'text-orange-600/70' : 'text-purple-300/70'}`}>Premium Auctions</p>
            </div>
          </motion.div>

          <div className="flex items-center gap-3">
            {isAdmin && (
              <span className="px-3 py-1 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full text-white text-xs font-bold">
                👑 Admin
              </span>
            )}
            <motion.button
              whileHover={{ scale: 1.1, rotate: 180 }}
              whileTap={{ scale: 0.9 }}
              onClick={toggleTheme}
              className={`relative w-12 h-12 rounded-xl font-bold text-xl shadow-lg transition-all ${
                isSunny ? 'bg-gradient-to-br from-yellow-400 to-orange-500 text-white shadow-yellow-500/50' : 'bg-gradient-to-br from-indigo-600 to-purple-700 text-white shadow-indigo-500/50'
              }`}
              title={isSunny ? 'Switch to Dark Mode' : 'Switch to Sunny Mode'}
            >
              {isSunny ? '🌙' : '☀️'}
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/auctions')}
              className={`transition-colors text-sm font-medium ${isSunny ? 'text-gray-600 hover:text-orange-600' : 'text-gray-400 hover:text-white'}`}
            >
              ← Back to Auctions
            </motion.button>
          </div>
        </div>
      </motion.header>

      {/* Main Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Image */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`backdrop-blur-2xl rounded-3xl overflow-hidden border shadow-2xl ${
                isSunny ? 'bg-white/80 border-orange-200' : 'bg-slate-950/90 border-white/10'
              }`}
            >
              {auction.image_url ? (
                <img src={`http://localhost:5000${auction.image_url}`} className="w-full h-80 object-cover" />
              ) : (
                <div className="w-full h-80 bg-gradient-to-br from-purple-900/50 to-pink-900/50 flex items-center justify-center text-6xl">📷</div>
              )}
            </motion.div>

            {/* Details Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className={`backdrop-blur-2xl rounded-3xl p-8 border shadow-2xl ${
                isSunny ? 'bg-white/80 border-orange-200' : 'bg-slate-950/90 border-white/10'
              }`}
            >
              <h1 className={`text-4xl font-black mb-3 ${isSunny ? 'text-gray-800' : 'text-white'}`}>{auction.title}</h1>
              <p className={`font-bold mb-4 flex items-center gap-2 ${isSunny ? 'text-orange-600' : 'text-purple-400'}`}>
                📁 {auction.category_name}
              </p>
              <p className={`leading-relaxed mb-6 ${isSunny ? 'text-gray-600' : 'text-gray-300'}`}>{auction.description}</p>
              
              <div className="grid grid-cols-2 gap-4">
                <div className={`rounded-2xl p-5 border ${isSunny ? 'bg-orange-50 border-orange-200' : 'bg-gradient-to-br from-green-500/20 to-emerald-500/20 border-green-500/30'}`}>
                  <p className={`text-xs font-bold uppercase tracking-wider mb-1 ${isSunny ? 'text-gray-500' : 'text-gray-400'}`}>💰 Bid Cost</p>
                  <p className="text-3xl font-black bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">{auction.bid_cost} ETB</p>
                </div>
                <div className={`rounded-2xl p-5 border ${isSunny ? 'bg-pink-50 border-pink-200' : 'bg-gradient-to-br from-purple-500/20 to-pink-500/20 border-purple-500/30'}`}>
                  <p className={`text-xs font-bold uppercase tracking-wider mb-1 ${isSunny ? 'text-gray-500' : 'text-gray-400'}`}>🎯 Total Bids</p>
                  <p className="text-3xl font-black bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">{bids.length}</p>
                </div>
              </div>
            </motion.div>

            {/* Place Bid Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="relative group"
            >
              <div className={`absolute -inset-[2px] rounded-3xl opacity-80 bg-[length:400%_400%] ${
                isSunny ? 'bg-gradient-to-r from-orange-500 via-pink-500 to-red-500' : 'bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500'
              }`} style={{ animation: 'gradient 5s ease infinite' }}></div>
              
              <div className={`relative backdrop-blur-2xl rounded-3xl p-8 overflow-hidden ${
                isSunny ? 'bg-white/95' : 'bg-slate-950/95'
              }`}>
                <div className="absolute inset-0 opacity-20">
                  <div className={`absolute top-0 right-0 w-64 h-64 rounded-full blur-3xl ${isSunny ? 'bg-orange-400' : 'bg-purple-500'}`}></div>
                  <div className={`absolute bottom-0 left-0 w-64 h-64 rounded-full blur-3xl ${isSunny ? 'bg-pink-400' : 'bg-pink-500'}`}></div>
                </div>

                <div className="relative z-10">
                  <h2 className={`text-3xl font-black mb-2 flex items-center gap-3 ${isSunny ? 'text-gray-800' : 'text-white'}`}>
                    <span className={`bg-gradient-to-r bg-clip-text text-transparent ${isSunny ? 'from-orange-500 to-pink-500' : 'from-purple-500 to-pink-500'}`}>🎯</span>
                    Place Bid
                  </h2>
                  <p className={`text-sm mb-6 ${isSunny ? 'text-gray-600' : 'text-gray-400'}`}>Enter your unique number to participate</p>

                  <form onSubmit={handleBid} className="space-y-4">
                    <div className="relative">
                      <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${isSunny ? 'text-gray-500' : 'text-gray-400'}`}>
                        Your Number
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        min="1"
                        placeholder="e.g., 1, 1.50, 2.34, 10.45"
                        value={number}
                        onChange={(e) => setNumber(e.target.value)}
                        className={`w-full px-5 py-4 border-2 rounded-2xl text-lg placeholder-gray-500 focus:outline-none transition-all ${
                          isSunny 
                            ? 'bg-orange-50 border-orange-300 text-gray-800 focus:border-orange-500' 
                            : 'bg-white/5 border-white/10 text-white focus:border-purple-500'
                        }`}
                        required
                      />
                    </div>

                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      type="submit"
                      className="w-full relative overflow-hidden rounded-2xl font-black text-xl shadow-2xl uppercase tracking-wider group/btn"
                    >
                      <div className={`absolute inset-0 group-hover/btn:from-orange-500 group-hover/btn:via-pink-600 group-hover/btn:to-red-600 transition-all duration-700 ${
                        isSunny ? 'bg-gradient-to-r from-orange-500 via-pink-500 to-red-500' : 'bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500'
                      }`}></div>
                      <div className="absolute inset-0 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-500 blur-2xl bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 -z-10"></div>
                      <div className="absolute inset-0 -translate-x-full group-hover/btn:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/30 to-transparent"></div>
                      <span className="relative flex items-center justify-center gap-2 py-5 text-white">
                        🚀 Place Bid ({auction.bid_cost} ETB)
                      </span>
                    </motion.button>
                  </form>

                  <div className={`mt-4 flex items-start gap-2 rounded-xl p-3 border ${
                    isSunny ? 'bg-orange-50 border-orange-300' : 'bg-yellow-500/10 border-yellow-500/30'
                  }`}>
                    <span className="text-yellow-400">⚠️</span>
                    <p className={`text-xs ${isSunny ? 'text-orange-700' : 'text-yellow-200/80'}`}>
                      Lowest unique number wins! Decimals allowed (1.50, 2.34, etc.)
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            
            {/* Countdown Timer */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className={`backdrop-blur-2xl rounded-3xl p-6 border shadow-2xl ${
                isSunny ? 'bg-white/80 border-orange-200' : 'bg-slate-950/90 border-white/10'
              }`}
            >
              <h3 className={`text-lg font-black mb-4 flex items-center gap-2 ${isSunny ? 'text-gray-800' : 'text-white'}`}>
                ⏰ Ends On
              </h3>
              {timeLeft ? (
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { label: 'Days', value: timeLeft.days, color: 'from-purple-500 to-pink-500' },
                    { label: 'Hours', value: timeLeft.hours, color: 'from-pink-500 to-orange-500' },
                    { label: 'Minutes', value: timeLeft.minutes, color: 'from-orange-500 to-yellow-500' },
                    { label: 'Seconds', value: timeLeft.seconds, color: 'from-yellow-500 to-red-500' }
                  ].map((item, i) => (
                    <motion.div
                      key={i}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: i * 0.1 }}
                      className={`bg-gradient-to-br ${item.color} text-white p-3 rounded-xl text-center shadow-lg`}
                    >
                      <div className="text-2xl font-black">{String(item.value).padStart(2, '0')}</div>
                      <div className="text-[10px] opacity-80 font-bold uppercase">{item.label}</div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="bg-gradient-to-r from-red-500 to-pink-500 text-white p-4 rounded-xl text-center font-bold">
                  ⏰ Auction Ended
                </div>
              )}
            </motion.div>

            {/* Admin: Lowest Unique */}
            {isAdmin && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-3xl p-6 shadow-2xl relative overflow-hidden"
              >
                <div className="absolute top-3 right-3 bg-white/20 backdrop-blur-xl rounded-full px-3 py-1 border border-white/30">
                  <span className="text-white text-[10px] font-bold uppercase tracking-wider">🔒 Admin Only</span>
                </div>
                <h3 className="text-sm font-bold text-white/90 mb-2 flex items-center gap-2">🎯 Current Lowest Unique Number</h3>
                <div className="text-5xl font-black text-white">{lowestUnique || '---'}</div>
                {lowestUnique && <p className="text-white/70 text-xs mt-2">Be lower & unique to win!</p>}
              </motion.div>
            )}

            {/* Customer: Encouragement */}
            {!isAdmin && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className={`rounded-3xl p-6 shadow-2xl text-center ${
                  isSunny ? 'bg-gradient-to-br from-orange-400 to-pink-500' : 'bg-gradient-to-br from-purple-500 to-pink-600'
                }`}
              >
                <div className="text-5xl mb-3">🎯</div>
                <h3 className="text-xl font-black text-white mb-2">Your Chance to Win!</h3>
                <p className="text-white/80 text-sm">
                  {bids.length === 0 ? 'Be the first to place a bid!' : `${bids.length} bid${bids.length > 1 ? 's' : ''} placed. Be unique & lowest to win!`}
                </p>
              </motion.div>
            )}

            {/* Admin: Bid History */}
            {isAdmin && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className={`backdrop-blur-2xl rounded-3xl p-6 border shadow-2xl relative overflow-hidden ${
                  isSunny ? 'bg-white/80 border-orange-200' : 'bg-slate-950/90 border-white/10'
                }`}
              >
                <div className="absolute top-3 right-3 bg-white/20 backdrop-blur-xl rounded-full px-3 py-1 border border-white/30">
                  <span className="text-white text-[10px] font-bold uppercase tracking-wider">🔒 Admin Only</span>
                </div>
                <h3 className={`text-lg font-black mb-4 flex items-center gap-2 ${isSunny ? 'text-gray-800' : 'text-white'}`}>📜 Bid History</h3>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {bids.length === 0 ? (
                    <p className={`text-center py-4 ${isSunny ? 'text-gray-500' : 'text-gray-400'}`}>No bids yet</p>
                  ) : (
                    bids.map((bid, i) => {
                      const isDuplicate = bids.filter(b => b.number === bid.number).length > 1;
                      const isLowest = bid.number === lowestUnique;
                      return (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.05 }}
                          className={`flex justify-between items-center p-3 rounded-xl border ${
                            isLowest ? 'bg-green-500/20 border-green-500/50 text-green-400' :
                            isDuplicate ? 'bg-red-500/20 border-red-500/50 text-red-400' :
                            isSunny ? 'bg-orange-50 border-orange-200 text-gray-700' : 'bg-white/5 border-white/10 text-gray-300'
                          }`}
                        >
                          <span className="font-bold">#{bid.number}</span>
                          <span className="text-xs">{isLowest ? '👑 Leading' : isDuplicate ? '❌ Duplicate' : '✓ Unique'}</span>
                        </motion.div>
                      );
                    })
                  )}
                </div>
              </motion.div>
            )}

            {/* Customer: Rules */}
            {!isAdmin && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className={`backdrop-blur-2xl rounded-3xl p-6 border shadow-2xl ${
                  isSunny ? 'bg-white/80 border-orange-200' : 'bg-slate-950/90 border-white/10'
                }`}
              >
                <h3 className={`text-lg font-black mb-4 flex items-center gap-2 ${isSunny ? 'text-gray-800' : 'text-white'}`}>📋 How to Win</h3>
                <div className="space-y-3">
                  {[
                    { icon: '1️⃣', text: 'Pick any number (decimals allowed)' },
                    { icon: '2️⃣', text: 'Pay the bid cost via Telebirr/CBE' },
                    { icon: '3️⃣', text: 'Lowest UNIQUE number wins!' },
                    { icon: '4️⃣', text: 'If your number is duplicated, you lose' }
                  ].map((rule, i) => (
                    <div key={i} className={`flex items-start gap-3 rounded-xl p-3 border ${
                      isSunny ? 'bg-orange-50 border-orange-200' : 'bg-white/5 border-white/10'
                    }`}>
                      <span className="text-xl">{rule.icon}</span>
                      <p className={`text-sm ${isSunny ? 'text-gray-700' : 'text-gray-300'}`}>{rule.text}</p>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes gradient {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
      `}</style>
    </div>
  );
}