import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';

function CountdownTimer({ endDate }) {
  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

  function calculateTimeLeft() {
    const difference = new Date(endDate) - new Date();
    if (difference <= 0) return null;
    return {
      days: Math.floor(difference / (1000 * 60 * 60 * 24)),
      hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
      minutes: Math.floor((difference / 1000 / 60) % 60),
      seconds: Math.floor((difference / 1000) % 60)
    };
  }

  useEffect(() => {
    const timer = setInterval(() => setTimeLeft(calculateTimeLeft()), 1000);
    return () => clearInterval(timer);
  }, [endDate]);

  if (!timeLeft) {
    return (
      <div className="bg-gradient-to-r from-red-500 to-pink-500 text-white px-4 py-2 rounded-xl text-sm font-black uppercase tracking-wider shadow-lg">
        ⏰ Ended
      </div>
    );
  }

  return (
    <div className="flex gap-2">
      {[
        { label: 'Days', value: timeLeft.days, color: 'from-purple-500 to-pink-500' },
        { label: 'Hours', value: timeLeft.hours, color: 'from-pink-500 to-orange-500' },
        { label: 'Minutes', value: timeLeft.minutes, color: 'from-orange-500 to-yellow-500' },
        { label: 'Seconds', value: timeLeft.seconds, color: 'from-yellow-500 to-red-500' }
      ].map((item, i) => (
        <motion.div
          key={i}
          initial={{ scale: 0, rotateY: 180 }}
          animate={{ scale: 1, rotateY: 0 }}
          transition={{ delay: i * 0.1, type: "spring" }}
          className={`bg-gradient-to-br ${item.color} text-white px-3 py-2 rounded-xl text-center min-w-[55px] shadow-lg transform hover:scale-110 transition-transform`}
          style={{ transformStyle: 'preserve-3d' }}
        >
          <div className="text-[10px] opacity-80 font-bold uppercase tracking-wider">{item.label}</div>
          <div className="text-xl font-black">{String(item.value).padStart(2, '0')}</div>
        </motion.div>
      ))}
    </div>
  );
}

export default function Auctions() {
  const [auctions, setAuctions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [winnerModal, setWinnerModal] = useState(null);
  const [winnerLoading, setWinnerLoading] = useState(false);
  const navigate = useNavigate();
  const cardRefs = useRef({});
  const { isSunny, toggleTheme } = useTheme();

  useEffect(() => {
    loadAuctions();
    loadCategories();
  }, []);

  const loadAuctions = async () => {
    try {
      const res = await axios.get('https://adey-bid-8k87.onrender.com/api/auctions');
      setAuctions(res.data);
    } catch (error) { console.error('Error:', error); }
  };

  const loadCategories = async () => {
    try {
      const res = await axios.get('https://adey-bid-8k87.onrender.com/api/admin/categories', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setCategories(res.data);
    } catch (error) { console.error('Error:', error); }
  };

  const handleShowWinner = async (auctionId, auctionTitle) => {
    setWinnerLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`https://adey-bid-8k87.onrender.com/api/admin/auctions/${auctionId}/winner`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setWinnerModal({ ...res.data, auction_title: auctionTitle });
    } catch (error) {
      console.error('Error fetching winner:', error);
    } finally {
      setWinnerLoading(false);
    }
  };

  const filteredAuctions = auctions.filter(a => {
    const matchCategory = selectedCategory === 'all' || a.category_name === selectedCategory;
    const matchSearch = a.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCategory && matchSearch;
  });

  const handleCardMouseMove = (e, id) => {
    if (!cardRefs.current[id]) return;
    const rect = cardRefs.current[id].getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    cardRefs.current[id].style.transform = `perspective(1000px) rotateX(${y * -10}deg) rotateY(${x * 10}deg) scale(1.05)`;
  };

  const handleCardMouseLeave = (id) => {
    if (cardRefs.current[id]) {
      cardRefs.current[id].style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale(1)';
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  return (
    <div className={`min-h-screen relative overflow-hidden transition-colors duration-700 ${
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
        className={`relative z-10 backdrop-blur-2xl border-b sticky top-0 transition-all duration-500 ${
          isSunny ? 'bg-white/70 border-orange-200 shadow-lg shadow-orange-500/10' : 'bg-slate-950/80 border-white/10 shadow-lg shadow-purple-500/10'
        }`}
        style={{ transform: 'translateZ(50px)' }}
      >
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <motion.div
            whileHover={{ scale: 1.05, rotateY: 10 }}
            className="flex items-center gap-3 cursor-pointer"
            onClick={() => navigate('/auctions')}
            style={{ transformStyle: 'preserve-3d' }}
          >
            <div className="relative">
              <div className={`absolute inset-0 rounded-xl blur-lg opacity-75 ${isSunny ? 'bg-orange-400' : 'bg-purple-500'}`}></div>
              <div className={`relative bg-gradient-to-br rounded-xl p-2.5 shadow-xl ${isSunny ? 'from-orange-400 to-pink-500' : 'from-purple-600 to-pink-600'}`}>
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
            <motion.button
              whileHover={{ scale: 1.1, rotate: isSunny ? 180 : 0 }}
              whileTap={{ scale: 0.9 }}
              onClick={toggleTheme}
              className={`relative w-11 h-11 rounded-xl flex items-center justify-center shadow-lg transition-all duration-300 ${
                isSunny 
                  ? 'bg-gradient-to-br from-yellow-400 to-orange-500 shadow-yellow-500/40 hover:shadow-yellow-500/60' 
                  : 'bg-gradient-to-br from-indigo-500 to-purple-600 shadow-indigo-500/40 hover:shadow-indigo-500/60'
              }`}
              title={isSunny ? 'Switch to Dark Mode' : 'Switch to Sunny Mode'}
            >
              {isSunny ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              )}
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/my-bids')}
              className={`px-5 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center gap-2 shadow-lg ${
                isSunny 
                  ? 'bg-gradient-to-r from-orange-500 to-pink-500 text-white shadow-orange-500/30 hover:shadow-orange-500/50' 
                  : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-blue-500/30 hover:shadow-blue-500/50'
              }`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
              My Bids
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleLogout}
              className="px-5 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center gap-2 shadow-lg bg-gradient-to-r from-red-500 to-pink-600 text-white shadow-red-500/30 hover:shadow-red-500/50"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Logout
            </motion.button>
          </div>
        </div>
      </motion.header>

      {/* Hero Section */}
      <motion.section
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="relative z-10 max-w-7xl mx-auto px-6 pt-16 pb-12"
      >
        <div className="text-center mb-12">
          <motion.div
            initial={{ opacity: 0, scale: 0, rotateY: 180 }}
            animate={{ opacity: 1, scale: 1, rotateY: 0 }}
            transition={{ delay: 0.3, type: "spring" }}
            className={`inline-flex items-center gap-2 backdrop-blur-xl rounded-full px-5 py-2 mb-6 border shadow-lg ${
              isSunny ? 'bg-orange-100/50 border-orange-300' : 'bg-white/5 border-white/10'
            }`}
          >
            <div className="relative">
              <div className="w-2.5 h-2.5 bg-green-400 rounded-full animate-pulse"></div>
              <div className="absolute inset-0 w-2.5 h-2.5 bg-green-400 rounded-full animate-ping"></div>
            </div>
            <span className={`text-xs font-bold uppercase tracking-[0.3em] ${isSunny ? 'text-orange-700' : 'text-white'}`}>Live Auctions</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: 0.4, type: "spring" }}
            className={`text-6xl lg:text-8xl font-black mb-4 tracking-tight ${isSunny ? 'text-gray-800' : 'text-white'}`}
            style={{ textShadow: isSunny ? 'none' : '0 0 40px rgba(168,85,247,0.3)' }}
          >
            Active <span className={`bg-gradient-to-r bg-clip-text text-transparent ${isSunny ? 'from-orange-500 via-pink-500 to-red-500' : 'from-purple-400 via-pink-400 to-orange-400'}`} style={{ animation: 'gradient 5s ease infinite', backgroundSize: '200% auto' }}>Auctions</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className={`text-xl max-w-2xl mx-auto ${isSunny ? 'text-gray-600' : 'text-gray-400'}`}
          >
            Find the lowest unique number and win amazing prizes!
          </motion.p>
        </div>

        {/* Search & Filter */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="flex flex-col md:flex-row gap-4 mb-12"
        >
          <div className="relative flex-1">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Search auctions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full pl-12 pr-4 py-3.5 border-2 rounded-2xl text-lg placeholder-gray-500 focus:outline-none transition-all backdrop-blur-xl shadow-lg ${
                isSunny 
                  ? 'bg-white/70 border-orange-300 text-gray-800 focus:border-orange-500 focus:shadow-orange-500/20' 
                  : 'bg-white/5 border-white/10 text-white focus:border-purple-500 focus:shadow-purple-500/20'
              }`}
            />
          </div>

          <div className="flex gap-2 overflow-x-auto pb-2">
            <motion.button
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setSelectedCategory('all')}
              className={`px-5 py-3 rounded-xl font-bold text-sm whitespace-nowrap transition-all shadow-lg ${
                selectedCategory === 'all'
                  ? isSunny
                    ? 'bg-gradient-to-r from-orange-500 to-pink-500 text-white shadow-orange-500/30'
                    : 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-purple-500/30'
                  : isSunny
                    ? 'bg-white/70 text-gray-600 border border-orange-300 hover:bg-white'
                    : 'bg-white/5 text-gray-400 border border-white/10 hover:bg-white/10'
              }`}
            >
              🎯 All
            </motion.button>
            {categories.map(cat => (
              <motion.button
                key={cat.id}
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSelectedCategory(cat.name)}
                className={`px-5 py-3 rounded-xl font-bold text-sm whitespace-nowrap transition-all shadow-lg ${
                  selectedCategory === cat.name
                    ? isSunny
                      ? 'bg-gradient-to-r from-orange-500 to-pink-500 text-white shadow-orange-500/30'
                      : 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-purple-500/30'
                    : isSunny
                      ? 'bg-white/70 text-gray-600 border border-orange-300 hover:bg-white'
                      : 'bg-white/5 text-gray-400 border border-white/10 hover:bg-white/10'
                }`}
              >
                {cat.name}
              </motion.button>
            ))}
          </div>
        </motion.div>
      </motion.section>

      {/* Auctions Grid */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 pb-16">
        {filteredAuctions.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`backdrop-blur-xl rounded-3xl p-16 text-center border shadow-2xl ${
              isSunny ? 'bg-white/60 border-orange-200' : 'bg-white/5 border-white/10'
            }`}
          >
            <div className="text-7xl mb-4">🎪</div>
            <h3 className={`text-2xl font-black mb-2 ${isSunny ? 'text-gray-800' : 'text-white'}`}>No auctions found</h3>
            <p className={isSunny ? 'text-gray-600' : 'text-gray-400'}>Try adjusting your search or filter</p>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAuctions.map((a, i) => {
              const isEnded = new Date(a.end_date) < new Date();
              
              return (
                <motion.div
                  key={a.id}
                  ref={(el) => (cardRefs.current[a.id] = el)}
                  initial={{ opacity: 0, y: 30, rotateX: 10 }}
                  animate={{ opacity: 1, y: 0, rotateX: 0 }}
                  transition={{ delay: i * 0.1, type: "spring" }}
                  onMouseMove={(e) => !isEnded && handleCardMouseMove(e, a.id)}
                  onMouseLeave={() => handleCardMouseLeave(a.id)}
                  onClick={() => {
                    // ✅ FIXED: Ended auction ከሆነ ወደ bid page አይሄድም
                    if (!isEnded) {
                      navigate(`/auction/${a.id}`);
                    }
                  }}
                  className={`relative group ${isEnded ? 'opacity-80' : 'cursor-pointer'}`}
                  style={{ 
                    transition: 'transform 0.3s ease-out',
                    transformStyle: 'preserve-3d'
                  }}
                >
                  {!isEnded && (
                    <div className={`absolute -inset-[2px] rounded-3xl opacity-0 group-hover:opacity-80 transition-opacity duration-500 bg-[length:400%_400%] ${
                      isSunny ? 'bg-gradient-to-r from-orange-500 via-pink-500 to-red-500' : 'bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500'
                    }`} style={{ animation: 'gradient 5s ease infinite' }}></div>
                  )}
                  
                  <div className={`relative backdrop-blur-2xl rounded-3xl overflow-hidden border transition-all shadow-2xl ${
                    isSunny ? 'bg-white/80' : 'bg-slate-950/90'
                  } ${isEnded ? 'border-red-500/30' : isSunny ? 'border-orange-200 group-hover:border-transparent' : 'border-white/10 group-hover:border-transparent'}`}>
                    
                    {isEnded && (
                      <div className="absolute inset-0 z-20 bg-black/60 backdrop-blur-sm flex items-center justify-center pointer-events-none">
                        <motion.div
                          initial={{ scale: 0, rotate: -180 }}
                          animate={{ scale: 1, rotate: 0 }}
                          transition={{ type: "spring", stiffness: 200 }}
                          className="text-center w-full px-4"
                        >
                          <motion.div
                            animate={{ textShadow: ['0 0 20px rgba(239, 68, 68, 0.8)', '0 0 40px rgba(239, 68, 68, 1)', '0 0 20px rgba(239, 68, 68, 0.8)'] }}
                            transition={{ duration: 2, repeat: Infinity }}
                            className="text-4xl font-black text-red-500 mb-2"
                          >
                            🏁 ENDED
                          </motion.div>
                          <p className="text-gray-300 text-sm font-bold mb-4">This auction has ended</p>
                        </motion.div>
                      </div>
                    )}

                    <div className="relative h-56 overflow-hidden">
                      {a.image_url ? (
                        <motion.img
                          whileHover={!isEnded ? { scale: 1.1 } : {}}
                          transition={{ duration: 0.5 }}
                          src={`https://adey-bid-8k87.onrender.com${a.image_url}`}
                          className={`w-full h-full object-cover ${isEnded ? 'grayscale' : ''}`}
                          onError={(e) => { e.target.style.display = 'none'; }}
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-purple-900/50 to-pink-900/50 flex items-center justify-center text-6xl">📷</div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent"></div>
                      
                      <div className="absolute top-4 left-4">
                        <div className="bg-white/10 backdrop-blur-xl rounded-full px-4 py-1.5 border border-white/20 shadow-lg">
                          <span className="text-white text-xs font-bold">📁 {a.category_name}</span>
                        </div>
                      </div>

                      <div className="absolute top-4 right-4">
                        <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-full px-4 py-1.5 shadow-lg">
                          <span className="text-white text-xs font-black">🎯 {a.total_bids || 0} bids</span>
                        </div>
                      </div>
                    </div>

                    <div className="p-6">
                      <h2 className={`text-2xl font-black mb-3 ${isSunny ? 'text-gray-800' : 'text-white'}`}>
                        {a.title}
                      </h2>

                      <div className="flex justify-between items-end mb-4">
                        <div>
                          <p className={`text-xs font-bold uppercase tracking-wider mb-1 ${isSunny ? 'text-gray-500' : 'text-gray-500'}`}>Bid Cost</p>
                          <p className="text-3xl font-black bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
                            {a.bid_cost} <span className="text-lg">ETB</span>
                          </p>
                        </div>
                        <div>
                          <p className={`text-xs font-bold uppercase tracking-wider mb-2 text-right ${isSunny ? 'text-gray-500' : 'text-gray-500'}`}>Ends On</p>
                          <CountdownTimer endDate={a.end_date} />
                        </div>
                      </div>

                      {/* 🔥 WINNER BUTTON - ሚያምር እና ቀላል */}
                      {isEnded ? (
                        <motion.button
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          whileHover={{ scale: 1.03 }}
                          whileTap={{ scale: 0.97 }}
                          onClick={(e) => {
                            // ✅ FIXED: stopPropagation - ወደ card onClick አይሄድም!
                            e.stopPropagation();
                            handleShowWinner(a.id, a.title);
                          }}
                          disabled={winnerLoading}
                          className="w-full relative overflow-hidden rounded-xl font-black text-lg shadow-2xl uppercase tracking-wider bg-gradient-to-r from-yellow-500 via-amber-500 to-orange-500 text-white hover:from-yellow-600 hover:via-amber-600 hover:to-orange-600 transition-all flex items-center justify-center gap-2 disabled:opacity-50 py-4 group"
                        >
                          {/* Shimmer effect */}
                          <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.3)_50%,transparent_75%)] bg-[length:200%_200%] animate-[shimmer_2s_linear_infinite]"></div>
                          {winnerLoading ? (
                            <svg className="animate-spin h-6 w-6" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                          ) : (
                            <span className="relative flex items-center justify-center gap-2">
                              <span className="text-2xl group-hover:animate-bounce">🏆</span>
                              Show Winner
                            </span>
                          )}
                        </motion.button>
                      ) : (
                        <motion.button
                          whileHover={{ scale: 1.02, y: -2 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/auction/${a.id}`);
                          }}
                          className={`w-full text-white py-3.5 rounded-xl font-black uppercase tracking-wider shadow-xl transition-all relative overflow-hidden ${
                            isSunny 
                              ? 'bg-gradient-to-r from-orange-500 via-pink-500 to-red-500 shadow-orange-500/50 hover:shadow-orange-500/70' 
                              : 'bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 shadow-purple-500/50 hover:shadow-purple-500/70'
                          }`}
                        >
                          <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/30 to-transparent"></div>
                          <span className="relative flex items-center justify-center gap-2">
                            🎯 Place Bid →
                          </span>
                        </motion.button>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </section>

      {/* How It Works Section */}
      <motion.section
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        className="relative z-10 max-w-7xl mx-auto px-6 py-16"
      >
        <div className="text-center mb-12">
          <h2 className={`text-5xl font-black mb-4 ${isSunny ? 'text-gray-800' : 'text-white'}`}>
            How It <span className={`bg-gradient-to-r bg-clip-text text-transparent ${isSunny ? 'from-orange-500 to-pink-500' : 'from-purple-400 to-pink-400'}`}>Works</span>
          </h2>
          <p className={`text-lg ${isSunny ? 'text-gray-600' : 'text-gray-400'}`}>Three simple steps to win</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { step: '01', icon: '🎯', title: 'Choose Your Number', desc: 'Pick any number from 1 upwards. Decimals allowed (1.50, 2.34, etc.)', color: 'from-purple-500 to-pink-500' },
            { step: '02', icon: '💳', title: 'Make Payment', desc: 'Pay via Telebirr or CBE Birr. Submit transaction ID for verification.', color: 'from-pink-500 to-orange-500' },
            { step: '03', icon: '🏆', title: 'Win & Claim', desc: 'Lowest unique number wins! Admin approves and you claim your prize.', color: 'from-orange-500 to-yellow-500' }
          ].map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30, rotateY: 90 }}
              whileInView={{ opacity: 1, y: 0, rotateY: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.2, type: "spring" }}
              whileHover={{ y: -10, rotateY: 5 }}
              className="relative group"
              style={{ transformStyle: 'preserve-3d' }}
            >
              <div className={`absolute -inset-[2px] rounded-3xl opacity-0 group-hover:opacity-80 transition-opacity duration-500 ${
                isSunny ? 'bg-gradient-to-r from-orange-500 via-pink-500 to-red-500' : 'bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500'
              }`}></div>
              <div className={`relative backdrop-blur-2xl rounded-3xl p-8 border transition-all h-full shadow-2xl ${
                isSunny ? 'bg-white/80 border-orange-200' : 'bg-slate-950/90 border-white/10 group-hover:border-transparent'
              }`}>
                <div className={`text-6xl font-black bg-gradient-to-r bg-clip-text text-transparent mb-4 opacity-30 ${isSunny ? 'from-orange-500 to-pink-500' : 'from-purple-400 to-pink-400'}`}>
                  {item.step}
                </div>
                <div className={`inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br ${item.color} rounded-2xl mb-4 shadow-xl transform group-hover:scale-110 transition-transform`}>
                  <span className="text-3xl">{item.icon}</span>
                </div>
                <h3 className={`text-2xl font-black mb-3 ${isSunny ? 'text-gray-800' : 'text-white'}`}>{item.title}</h3>
                <p className={isSunny ? 'text-gray-600 leading-relaxed' : 'text-gray-400 leading-relaxed'}>{item.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* Footer */}
      <motion.footer
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        className={`relative z-10 backdrop-blur-2xl border-t mt-16 transition-colors duration-500 shadow-2xl ${
          isSunny ? 'bg-white/70 border-orange-200' : 'bg-slate-950/80 border-white/10'
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="relative">
                  <div className={`absolute inset-0 rounded-xl blur-lg opacity-75 ${isSunny ? 'bg-orange-400' : 'bg-purple-500'}`}></div>
                  <div className={`relative bg-gradient-to-br rounded-xl p-2.5 shadow-xl ${isSunny ? 'from-orange-400 to-pink-500' : 'from-purple-600 to-pink-600'}`}>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M13 2L3 14h7l-1 8 10-12h-7l1-8z" />
                    </svg>
                  </div>
                </div>
                <h3 className={`text-xl font-black bg-gradient-to-r bg-clip-text text-transparent ${isSunny ? 'from-orange-600 to-pink-600' : 'from-purple-300 to-pink-300'}`}>Adey Bid</h3>
              </div>
              <p className={isSunny ? 'text-gray-600 text-sm' : 'text-gray-400 text-sm'}>Ethiopia's premier lowest unique bid auction platform.</p>
            </div>

            <div>
              <h4 className={`font-bold mb-4 ${isSunny ? 'text-gray-800' : 'text-white'}`}>Quick Links</h4>
              <ul className="space-y-2">
                {['Home', 'Auctions', 'My Bids'].map((link, i) => (
                  <li key={i}>
                    <button className={`text-sm transition-colors ${isSunny ? 'text-gray-600 hover:text-orange-600' : 'text-gray-400 hover:text-purple-400'}`}>{link}</button>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className={`font-bold mb-4 ${isSunny ? 'text-gray-800' : 'text-white'}`}>Payment Methods</h4>
              <div className="space-y-3">
                <motion.div
                  whileHover={{ scale: 1.05, x: 5 }}
                  className={`group flex items-center gap-3 backdrop-blur-xl rounded-xl p-3 border transition-all cursor-default shadow-lg ${
                    isSunny ? 'bg-orange-50 border-orange-200' : 'bg-gradient-to-r from-sky-500/10 to-emerald-500/10 border-sky-500/20'
                  }`}
                >
                  <div className="relative">
                    <div className={`absolute inset-0 rounded-lg blur-md opacity-60 group-hover:opacity-100 transition-opacity ${isSunny ? 'bg-orange-400' : 'bg-sky-400'}`}></div>
                    <div className="relative bg-white rounded-lg p-1.5 shadow-lg w-16 h-16 flex items-center justify-center overflow-hidden">
                      <img src="/telebirr.png" alt="Telebirr" className="w-full h-full object-contain" />
                    </div>
                  </div>
                  <div>
                    <p className={`font-bold text-sm ${isSunny ? 'text-gray-800' : 'text-white'}`}>Telebirr</p>
                    <p className={`text-[10px] font-medium ${isSunny ? 'text-orange-600/70' : 'text-sky-400/70'}`}>Mobile Money</p>
                  </div>
                </motion.div>

                <motion.div
                  whileHover={{ scale: 1.05, x: 5 }}
                  className={`group flex items-center gap-3 backdrop-blur-xl rounded-xl p-3 border transition-all cursor-default shadow-lg ${
                    isSunny ? 'bg-yellow-50 border-yellow-200' : 'bg-gradient-to-r from-yellow-600/10 to-amber-600/10 border-yellow-600/20'
                  }`}
                >
                  <div className="relative">
                    <div className={`absolute inset-0 rounded-lg blur-md opacity-60 group-hover:opacity-100 transition-opacity ${isSunny ? 'bg-yellow-400' : 'bg-yellow-500'}`}></div>
                    <div className="relative bg-white rounded-lg p-1.5 shadow-lg w-16 h-16 flex items-center justify-center overflow-hidden">
                      <img src="/CBE-Birr.png" alt="CBE Birr" className="w-full h-full object-contain" />
                    </div>
                  </div>
                  <div>
                    <p className={`font-bold text-sm ${isSunny ? 'text-gray-800' : 'text-white'}`}>CBE Birr</p>
                    <p className={`text-[10px] font-medium ${isSunny ? 'text-yellow-600/70' : 'text-yellow-500/70'}`}>Commercial Bank</p>
                  </div>
                </motion.div>
              </div>
            </div>

            <div>
              <h4 className={`font-bold mb-4 ${isSunny ? 'text-gray-800' : 'text-white'}`}>Contact</h4>
              <ul className="space-y-3">
                <li className={`flex items-center gap-2 text-sm ${isSunny ? 'text-gray-600' : 'text-gray-400'}`}>
                  <span className={isSunny ? 'text-orange-500' : 'text-purple-400'}>📧</span>
                  <span>support@adeybid.com</span>
                </li>
                <li className={`flex items-center gap-2 text-sm ${isSunny ? 'text-gray-600' : 'text-gray-400'}`}>
                  <span className={isSunny ? 'text-orange-500' : 'text-purple-400'}>📱</span>
                  <span>0963163020</span>
                </li>
                <li className={`flex items-center gap-2 text-sm ${isSunny ? 'text-gray-600' : 'text-gray-400'}`}>
                  <span className={isSunny ? 'text-orange-500' : 'text-purple-400'}>📍</span>
                  <span>Addis Ababa, Ethiopia</span>
                </li>
              </ul>
            </div>
          </div>

          <div className={`pt-8 border-t flex flex-col md:flex-row justify-between items-center gap-4 ${isSunny ? 'border-orange-200' : 'border-white/10'}`}>
            <p className={isSunny ? 'text-gray-600 text-sm' : 'text-gray-500 text-sm'}>© 2026 Adey Bid. All rights reserved.</p>
            <div className="flex gap-4">
              {['Privacy Policy', 'Terms of Service', 'Cookie Policy'].map((item, i) => (
                <button key={i} className={`text-sm transition-colors ${isSunny ? 'text-gray-600 hover:text-orange-600' : 'text-gray-500 hover:text-purple-400'}`}>{item}</button>
              ))}
            </div>
          </div>
        </div>
      </motion.footer>

      {/* 🔥 WINNER MODAL - ሚያምር እና ቀላል (Bid Number ብቻ) */}
      <AnimatePresence>
        {winnerModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setWinnerModal(null)}
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xl flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.5, opacity: 0, y: 50 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.5, opacity: 0, y: 50 }}
              onClick={(e) => e.stopPropagation()}
              className={`max-w-md w-full rounded-3xl p-8 border ${
                isSunny ? 'bg-white border-orange-200' : 'bg-slate-950 border-white/10'
              }`}
            >
              {/* Header */}
              <div className="text-center mb-6">
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: "spring", delay: 0.2 }}
                  className="inline-flex items-center justify-center w-24 h-24 rounded-3xl mb-4 bg-gradient-to-br from-yellow-400 via-amber-500 to-orange-500 shadow-2xl"
                >
                  <span className="text-5xl">🏆</span>
                </motion.div>
                <h2 className={`text-3xl font-black mb-1 ${isSunny ? 'text-gray-800' : 'text-white'}`}>
                  Winner Announced!
                </h2>
                <p className={`text-sm ${isSunny ? 'text-gray-600' : 'text-gray-400'}`}>
                  {winnerModal.auction_title}
                </p>
              </div>

              {winnerModal.winner ? (
                <div className="space-y-4">
                  {/* 🔥 Winning Bid Number ONLY */}
                  <div className={`rounded-2xl p-8 text-center border-2 ${
                    isSunny ? 'bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-300' : 'bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border-yellow-500/30'
                  }`}>
                    <p className={`text-xs uppercase tracking-wider mb-2 ${isSunny ? 'text-gray-500' : 'text-gray-400'}`}>
                      Winning Bid Number
                    </p>
                    <motion.p
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", delay: 0.3 }}
                      className={`text-7xl font-black bg-gradient-to-r from-yellow-500 via-amber-500 to-orange-500 bg-clip-text text-transparent`}
                    >
                      {winnerModal.winner.bid_number}
                    </motion.p>
                    <p className={`text-sm mt-3 font-bold ${isSunny ? 'text-yellow-700' : 'text-yellow-400'}`}>
                      🥇 Lowest Unique Bid
                    </p>
                  </div>

                  <button
                    onClick={() => setWinnerModal(null)}
                    className={`w-full py-3 rounded-xl font-bold transition-all ${
                      isSunny ? 'bg-gray-200 text-gray-800 hover:bg-gray-300' : 'bg-white/10 text-white hover:bg-white/20'
                    }`}
                  >
                    Close
                  </button>
                </div>
              ) : (
                <div className={`text-center py-8 rounded-2xl ${isSunny ? 'bg-gray-50' : 'bg-white/5'}`}>
                  <div className="text-5xl mb-3">😔</div>
                  <p className={`text-lg font-bold ${isSunny ? 'text-gray-700' : 'text-white'}`}>
                    {winnerModal.message || 'No winner yet'}
                  </p>
                  <button
                    onClick={() => setWinnerModal(null)}
                    className={`mt-4 px-6 py-2 rounded-xl font-bold transition-all ${
                      isSunny ? 'bg-gray-200 text-gray-800 hover:bg-gray-300' : 'bg-white/10 text-white hover:bg-white/20'
                    }`}
                  >
                    Close
                  </button>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        @keyframes gradient {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
      `}</style>
    </div>
  );
}