import { useState, useEffect } from 'react';
import axios from 'axios';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';

export default function Payment() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { isSunny, toggleTheme } = useTheme();
  
  const auction_id = searchParams.get('auction_id');
  const bid_number = searchParams.get('bid_number');
  const amount = searchParams.get('amount');

  const [method, setMethod] = useState(null);
  const [transactionId, setTransactionId] = useState('');
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);
  const [copied, setCopied] = useState(false);
  // 🔥 Success Modal State
  const [showSuccess, setShowSuccess] = useState(false);
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem('user'));
    setUser(userData);
  }, []);

  // 🔥 Auto countdown when success modal opens
  useEffect(() => {
    if (showSuccess && countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else if (showSuccess && countdown === 0) {
      navigate('/my-bids');
    }
  }, [showSuccess, countdown, navigate]);

  const handleSelectMethod = (newMethod) => {
    if (method === newMethod) { setMethod(null); } else { setMethod(newMethod); }
    setCopied(false);
  };

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!method) { 
      alert('Please select a payment method first'); 
      return; 
    }
    if (!transactionId.trim()) { 
      alert('Please enter transaction ID'); 
      return; 
    }
    if (!bid_number) {
      alert('Bid number is missing. Please go back to auction and try again.');
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      
      await axios.post('https://adey-bid-8k87.onrender.com/api/payment', {
        amount: parseFloat(amount),
        method,
        transaction_id: transactionId,
        auction_id: parseInt(auction_id),
        bid_number: parseFloat(bid_number)
      }, { 
        headers: { Authorization: `Bearer ${token}` } 
      });

      // 🔥 Show beautiful success modal instead of alert
      setShowSuccess(true);
    } catch (error) {
      console.error('Payment error:', error);
      alert(error.response?.data?.error || 'Payment failed. Please try again.');
    }
    setLoading(false);
  };

  const accountNumber = method === 'telebirr' ? '0963163020' : '1000488492687';
  const accountName = 'Eyob';
  const bankName = method === 'telebirr' ? 'Telebirr Mobile Money' : 'ንግድ ባንክ (Commercial Bank of Ethiopia)';

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
            {[...Array(20)].map((_, i) => (
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
        <div className="max-w-4xl mx-auto px-6 py-4 flex justify-between items-center">
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
      <motion.section
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="relative z-10 max-w-4xl mx-auto px-6 py-12"
      >
        <div className="text-center mb-10">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", delay: 0.3 }}
            className={`inline-flex items-center justify-center w-20 h-20 rounded-2xl mb-4 shadow-2xl ${
              isSunny ? 'bg-gradient-to-br from-orange-400 to-pink-500' : 'bg-gradient-to-br from-purple-600 to-pink-600'
            }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className={`text-5xl font-black mb-3 tracking-tight ${isSunny ? 'text-gray-800' : 'text-white'}`}
          >
            Complete <span className={`bg-gradient-to-r bg-clip-text text-transparent ${
              isSunny ? 'from-orange-500 via-pink-500 to-red-500' : 'from-purple-400 via-pink-400 to-orange-400'
            }`} style={{ animation: 'gradient 5s ease infinite', backgroundSize: '200% auto' }}>Payment</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className={`text-lg ${isSunny ? 'text-gray-600' : 'text-gray-400'}`}
          >
            Select a payment method to continue
          </motion.p>
        </div>

        {/* Payment Details Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className={`backdrop-blur-2xl rounded-3xl p-6 border mb-8 ${
            isSunny ? 'bg-white/80 border-orange-200' : 'bg-slate-950/90 border-white/10'
          }`}
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className={`rounded-xl p-3 border ${isSunny ? 'bg-orange-50 border-orange-200' : 'bg-white/5 border-white/10'}`}>
              <p className={`text-[10px] font-bold uppercase tracking-wider mb-1 ${isSunny ? 'text-gray-500' : 'text-gray-500'}`}>Bid Number</p>
              <p className={`text-xl font-black bg-gradient-to-r bg-clip-text text-transparent ${isSunny ? 'from-orange-500 to-pink-500' : 'from-purple-400 to-pink-400'}`}>#{bid_number}</p>
            </div>
            <div className={`rounded-xl p-3 border ${isSunny ? 'bg-green-50 border-green-200' : 'bg-white/5 border-white/10'}`}>
              <p className={`text-[10px] font-bold uppercase tracking-wider mb-1 ${isSunny ? 'text-gray-500' : 'text-gray-500'}`}>Amount</p>
              <p className="text-xl font-black bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">{amount} ETB</p>
            </div>
            <div className={`rounded-xl p-3 border ${isSunny ? 'bg-blue-50 border-blue-200' : 'bg-white/5 border-white/10'}`}>
              <p className={`text-[10px] font-bold uppercase tracking-wider mb-1 ${isSunny ? 'text-gray-500' : 'text-gray-500'}`}>Auction ID</p>
              <p className={`text-xl font-black bg-gradient-to-r bg-clip-text text-transparent ${isSunny ? 'from-blue-500 to-indigo-500' : 'from-blue-400 to-indigo-400'}`}>#{auction_id}</p>
            </div>
            <div className={`rounded-xl p-3 border ${isSunny ? 'bg-yellow-50 border-yellow-200' : 'bg-white/5 border-white/10'}`}>
              <p className={`text-[10px] font-bold uppercase tracking-wider mb-1 ${isSunny ? 'text-gray-500' : 'text-gray-500'}`}>User</p>
              <p className={`text-xl font-black bg-gradient-to-r bg-clip-text text-transparent ${isSunny ? 'from-yellow-500 to-orange-500' : 'from-orange-400 to-yellow-400'}`}>{user?.name || 'User'}</p>
            </div>
          </div>
        </motion.div>

        {/* Payment Method Selection */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="mb-6"
        >
          <h2 className={`text-2xl font-black mb-6 flex items-center gap-3 ${isSunny ? 'text-gray-800' : 'text-white'}`}>
            <span className={`flex items-center justify-center w-8 h-8 rounded-full text-white text-sm font-black ${isSunny ? 'bg-gradient-to-br from-orange-500 to-pink-500' : 'bg-gradient-to-br from-purple-600 to-pink-600'}`}>1</span>
            Select Payment Method
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <motion.button
              whileHover={{ scale: 1.02, y: -5 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleSelectMethod('telebirr')}
              className={`relative group p-6 rounded-2xl border-2 text-left transition-all ${
                method === 'telebirr'
                  ? isSunny ? 'border-orange-500 bg-gradient-to-br from-orange-100 to-pink-100 shadow-lg shadow-orange-500/30' : 'border-sky-500 bg-gradient-to-br from-sky-500/20 to-emerald-500/20 shadow-lg shadow-sky-500/30'
                  : isSunny ? 'border-orange-200 bg-white/70 hover:border-orange-400' : 'border-white/10 bg-white/5 hover:border-sky-500/50'
              }`}
            >
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className={`absolute inset-0 rounded-xl blur-lg transition-opacity ${
                    method === 'telebirr' ? (isSunny ? 'bg-orange-400 opacity-60' : 'bg-sky-400 opacity-60') : 'opacity-0'
                  }`}></div>
                  <div className="relative bg-white rounded-xl p-3 shadow-lg w-20 h-20 flex items-center justify-center overflow-hidden">
                    <img src="/telebirr.png" alt="Telebirr" className="w-full h-full object-contain" />
                  </div>
                </div>
                <div>
                  <p className={`font-black text-xl ${isSunny ? 'text-gray-800' : 'text-white'}`}>Telebirr</p>
                  <p className={`text-sm font-medium ${isSunny ? 'text-orange-600/70' : 'text-sky-400/70'}`}>Mobile Money</p>
                  {method === 'telebirr' && (
                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className={`mt-2 inline-flex items-center gap-1 text-white text-xs font-bold px-3 py-1 rounded-full ${isSunny ? 'bg-orange-500' : 'bg-sky-500'}`}>✓ Selected</motion.div>
                  )}
                </div>
              </div>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02, y: -5 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleSelectMethod('cbe')}
              className={`relative group p-6 rounded-2xl border-2 text-left transition-all ${
                method === 'cbe'
                  ? isSunny ? 'border-yellow-500 bg-gradient-to-br from-yellow-100 to-amber-100 shadow-lg shadow-yellow-500/30' : 'border-yellow-500 bg-gradient-to-br from-yellow-500/20 to-amber-500/20 shadow-lg shadow-yellow-500/30'
                  : isSunny ? 'border-yellow-200 bg-white/70 hover:border-yellow-400' : 'border-white/10 bg-white/5 hover:border-yellow-500/50'
              }`}
            >
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className={`absolute inset-0 rounded-xl blur-lg transition-opacity ${
                    method === 'cbe' ? (isSunny ? 'bg-yellow-400 opacity-60' : 'bg-yellow-400 opacity-60') : 'opacity-0'
                  }`}></div>
                  <div className="relative bg-white rounded-xl p-3 shadow-lg w-20 h-20 flex items-center justify-center overflow-hidden">
                    <img src="/CBE-Birr.png" alt="CBE Birr" className="w-full h-full object-contain" />
                  </div>
                </div>
                <div>
                  <p className={`font-black text-xl ${isSunny ? 'text-gray-800' : 'text-white'}`}>CBE Birr</p>
                  <p className={`text-sm font-medium ${isSunny ? 'text-yellow-600/70' : 'text-yellow-400/70'}`}>Commercial Bank</p>
                  {method === 'cbe' && (
                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className={`mt-2 inline-flex items-center gap-1 text-white text-xs font-bold px-3 py-1 rounded-full ${isSunny ? 'bg-yellow-500' : 'bg-yellow-500'}`}>✓ Selected</motion.div>
                  )}
                </div>
              </div>
            </motion.button>
          </div>
        </motion.div>

        {/* Payment Card */}
        <AnimatePresence>
          {method && (
            <motion.div
              initial={{ opacity: 0, height: 0, y: -20 }}
              animate={{ opacity: 1, height: 'auto', y: 0 }}
              exit={{ opacity: 0, height: 0, y: -20 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="overflow-hidden mb-6"
            >
              <div className={`relative group rounded-2xl p-6 shadow-2xl overflow-hidden ${
                method === 'telebirr' 
                  ? (isSunny ? 'bg-gradient-to-br from-sky-400 via-blue-500 to-emerald-500' : 'bg-gradient-to-br from-sky-600 via-blue-600 to-emerald-600')
                  : (isSunny ? 'bg-gradient-to-br from-yellow-400 via-amber-500 to-orange-500' : 'bg-gradient-to-br from-yellow-600 via-amber-600 to-orange-600')
              }`}>
                <div className="absolute inset-0 opacity-20">
                  <div className="absolute top-0 right-0 w-48 h-48 bg-white rounded-full blur-3xl"></div>
                  <div className="absolute bottom-0 left-0 w-48 h-48 bg-white rounded-full blur-3xl"></div>
                </div>

                <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="flex items-center justify-center w-8 h-8 bg-white/20 backdrop-blur-xl rounded-full text-white text-sm font-black">2</span>
                    <h2 className="text-2xl font-black text-white">Send Payment</h2>
                  </div>

                  <div className="bg-white/10 backdrop-blur-xl rounded-xl p-4 mb-4 border border-white/20">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <p className="text-white/70 text-[10px] font-bold uppercase tracking-wider">Account Number</p>
                        <p className="text-white font-black text-2xl tracking-wider">{accountNumber}</p>
                      </div>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handleCopy(accountNumber)}
                        className="bg-white/20 hover:bg-white/30 rounded-lg p-2 transition-all"
                        title="Copy"
                      >
                        {copied ? (
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                        ) : (
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg>
                        )}
                      </motion.button>
                    </div>

                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-white/70 text-[10px] font-bold uppercase tracking-wider">Name</p>
                        <p className="text-white font-bold">{accountName}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-white/70 text-[10px] font-bold uppercase tracking-wider">Amount</p>
                        <p className="text-white font-bold">{amount} ETB</p>
                      </div>
                    </div>

                    <div className="mt-3 pt-3 border-t border-white/20">
                      <p className="text-white/70 text-[10px] font-bold uppercase tracking-wider">Bank/Service</p>
                      <p className="text-white font-bold">{bankName}</p>
                    </div>
                  </div>

                  <div className="bg-white/10 backdrop-blur-xl rounded-xl p-3 border border-white/20">
                    <p className="text-white/90 text-xs font-medium flex items-center gap-2">
                      <span>💡</span>
                      <span>Open your {method === 'telebirr' ? 'Telebirr' : 'CBE Birr'} app and send <span className="font-black">{amount} ETB</span> to the account above</span>
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* No Method Selected */}
        <AnimatePresence>
          {!method && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className={`backdrop-blur-xl rounded-2xl p-6 border mb-6 text-center ${
                isSunny ? 'bg-white/60 border-orange-200' : 'bg-white/5 border-white/10'
              }`}
            >
              <div className="text-4xl mb-3">👆</div>
              <p className={`text-sm font-medium ${isSunny ? 'text-gray-600' : 'text-gray-400'}`}>
                Please select a payment method above to see account details
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Transaction ID Form */}
        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
          onSubmit={handleSubmit}
          className={`backdrop-blur-2xl rounded-3xl p-8 border ${
            isSunny ? 'bg-white/80 border-orange-200' : 'bg-slate-950/90 border-white/10'
          }`}
        >
          <h2 className={`text-2xl font-black mb-6 flex items-center gap-3 ${isSunny ? 'text-gray-800' : 'text-white'}`}>
            <span className={`flex items-center justify-center w-8 h-8 rounded-full text-white text-sm font-black ${isSunny ? 'bg-gradient-to-br from-orange-500 to-pink-500' : 'bg-gradient-to-br from-purple-600 to-pink-600'}`}>3</span>
            Confirm Payment
          </h2>
          
          <div className="mb-6">
            <label className={`block text-sm font-bold uppercase tracking-wider mb-2 ${isSunny ? 'text-gray-500' : 'text-gray-400'}`}>Transaction ID</label>
            <input
              type="text"
              value={transactionId}
              onChange={(e) => setTransactionId(e.target.value)}
              placeholder="e.g., TX123456789"
              className={`w-full px-5 py-4 border-2 rounded-2xl text-lg placeholder-gray-500 focus:outline-none transition-all ${
                isSunny ? 'bg-orange-50 border-orange-300 text-gray-800 focus:border-orange-500' : 'bg-white/5 border-white/10 text-white focus:border-purple-500'
              }`}
              required
            />
          </div>

          <motion.button
            whileHover={method ? { scale: 1.02 } : {}}
            whileTap={method ? { scale: 0.98 } : {}}
            type="submit"
            disabled={loading || !method}
            className="w-full relative overflow-hidden rounded-2xl font-black text-xl shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-wider group"
          >
            <div className={`absolute inset-0 transition-all duration-700 ${
              method === 'telebirr'
                ? (isSunny ? 'bg-gradient-to-r from-sky-500 via-blue-500 to-emerald-500' : 'bg-gradient-to-r from-sky-600 via-blue-600 to-emerald-600')
                : method === 'cbe'
                ? (isSunny ? 'bg-gradient-to-r from-yellow-500 via-amber-500 to-orange-500' : 'bg-gradient-to-r from-yellow-600 via-amber-600 to-orange-600')
                : 'bg-gradient-to-r from-gray-600 to-gray-700'
            } ${method ? 'group-hover:from-orange-500 group-hover:via-pink-600 group-hover:to-purple-600' : ''}`}></div>
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-2xl bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 -z-10"></div>
            <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/30 to-transparent"></div>
            <span className="relative flex items-center justify-center gap-2 py-5 text-white">
              {loading ? (
                <>
                  <svg className="animate-spin h-6 w-6" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                  Processing...
                </>
              ) : !method ? (
                <>👆 Select a method first</>
              ) : (
                <>💳 Submit Payment</>
              )}
            </span>
          </motion.button>

          <div className={`mt-6 flex items-start gap-3 rounded-xl p-4 border ${
            isSunny ? 'bg-orange-50 border-orange-300' : 'bg-yellow-500/10 border-yellow-500/30'
          }`}>
            <span className="text-yellow-400 text-xl">⚠️</span>
            <p className={`text-sm ${isSunny ? 'text-orange-700' : 'text-yellow-200/80'}`}>
              After submission, admin will review your payment. Once approved, your bid will be active.
            </p>
          </div>
        </motion.form>
      </motion.section>

      {/* 🔥 BEAUTIFUL SUCCESS MODAL - Instead of alert() */}
      <AnimatePresence>
        {showSuccess && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xl flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.3, opacity: 0, y: 50 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.3, opacity: 0, y: 50 }}
              transition={{ type: "spring", stiffness: 200, damping: 20 }}
              className={`max-w-md w-full rounded-3xl p-8 border overflow-hidden relative ${
                isSunny ? 'bg-white border-green-300' : 'bg-slate-950 border-green-500/30'
              }`}
            >
              {/* Animated Background Glow */}
              <motion.div
                animate={{ 
                  background: [
                    'radial-gradient(circle at 50% 0%, rgba(34,197,94,0.3) 0%, transparent 60%)',
                    'radial-gradient(circle at 50% 0%, rgba(34,197,94,0.5) 0%, transparent 60%)',
                    'radial-gradient(circle at 50% 0%, rgba(34,197,94,0.3) 0%, transparent 60%)'
                  ]
                }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute inset-0 pointer-events-none"
              ></motion.div>

              {/* Confetti Particles */}
              <div className="absolute inset-0 pointer-events-none overflow-hidden">
                {[...Array(20)].map((_, i) => (
                  <motion.div
                    key={i}
                    initial={{ y: -50, opacity: 0 }}
                    animate={{ 
                      y: [0, 400], 
                      opacity: [1, 0],
                      x: [0, Math.random() * 100 - 50],
                      rotate: [0, 360]
                    }}
                    transition={{ 
                      duration: 2 + Math.random() * 2, 
                      delay: Math.random() * 0.5,
                      repeat: Infinity 
                    }}
                    className="absolute w-2 h-2 rounded-full"
                    style={{ 
                      left: `${Math.random() * 100}%`, 
                      top: 0,
                      background: ['#22c55e', '#10b981', '#34d399', '#a7f3d0', '#fbbf24'][i % 5]
                    }}
                  />
                ))}
              </div>

              <div className="relative z-10 text-center">
                {/* Success Icon with Pulse */}
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: "spring", delay: 0.2 }}
                  className="inline-flex items-center justify-center w-24 h-24 rounded-full mb-4 bg-gradient-to-br from-green-400 via-emerald-500 to-green-600 shadow-2xl shadow-green-500/50"
                >
                  <motion.svg
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ delay: 0.5, duration: 0.5 }}
                    xmlns="http://www.w3.org/2000/svg" 
                    className="h-12 w-12 text-white" 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor" 
                    strokeWidth="3"
                  >
                    <motion.path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M5 13l4 4L19 7"
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ delay: 0.5, duration: 0.5 }}
                    />
                  </motion.svg>
                </motion.div>

                {/* Outer pulse ring */}
                <motion.div
                  animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0, 0.5] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="absolute top-12 left-1/2 -translate-x-1/2 w-24 h-24 rounded-full border-4 border-green-500 pointer-events-none"
                ></motion.div>

                <motion.h2
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className={`text-4xl font-black mb-2 ${isSunny ? 'text-gray-800' : 'text-white'}`}
                >
                  Payment <span className="bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent">Submitted!</span>
                </motion.h2>

                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className={`text-sm mb-6 ${isSunny ? 'text-gray-600' : 'text-gray-400'}`}
                >
                  Your payment is being reviewed by admin
                </motion.p>

                {/* Payment Summary Card */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  className={`rounded-2xl p-5 border mb-6 text-left ${
                    isSunny ? 'bg-green-50 border-green-200' : 'bg-white/5 border-white/10'
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className={`text-xs uppercase tracking-wider ${isSunny ? 'text-gray-500' : 'text-gray-400'}`}>🎫 Bid Number</span>
                      <span className={`font-mono font-black text-lg ${isSunny ? 'text-green-700' : 'text-green-400'}`}>{bid_number}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className={`text-xs uppercase tracking-wider ${isSunny ? 'text-gray-500' : 'text-gray-400'}`}>💰 Amount</span>
                      <span className={`font-black text-lg ${isSunny ? 'text-green-700' : 'text-green-400'}`}>{amount} ETB</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className={`text-xs uppercase tracking-wider ${isSunny ? 'text-gray-500' : 'text-gray-400'}`}>💳 Transaction</span>
                      <span className={`font-mono text-sm truncate max-w-[140px] ${isSunny ? 'text-gray-700' : 'text-gray-300'}`}>{transactionId}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className={`text-xs uppercase tracking-wider ${isSunny ? 'text-gray-500' : 'text-gray-400'}`}>📱 Method</span>
                      <span className={`font-bold text-sm uppercase ${isSunny ? 'text-gray-700' : 'text-gray-300'}`}>{method === 'telebirr' ? 'Telebirr' : 'CBE Birr'}</span>
                    </div>
                  </div>
                </motion.div>

                {/* Status Info */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.7 }}
                  className={`rounded-xl p-3 mb-4 flex items-center gap-2 ${
                    isSunny ? 'bg-yellow-50 border border-yellow-200' : 'bg-yellow-500/10 border border-yellow-500/30'
                  }`}
                >
                  <span className="text-xl">⏳</span>
                  <p className={`text-xs text-left ${isSunny ? 'text-yellow-800' : 'text-yellow-200'}`}>
                    Admin will review and approve. Once approved, your bid becomes active.
                  </p>
                </motion.div>

                {/* Countdown */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.8 }}
                  className={`text-xs mb-4 ${isSunny ? 'text-gray-500' : 'text-gray-400'}`}
                >
                  Auto redirecting to My Bids in <span className="font-black text-green-500">{countdown}</span>s...
                </motion.div>

                {/* Action Buttons */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.9 }}
                  className="flex gap-3"
                >
                  <button
                    onClick={() => navigate('/my-bids')}
                    className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 text-white py-3 rounded-xl font-black hover:from-green-600 hover:to-emerald-700 transition-all shadow-lg shadow-green-500/30"
                  >
                    📋 View My Bids
                  </button>
                  <button
                    onClick={() => navigate('/auctions')}
                    className={`flex-1 py-3 rounded-xl font-bold transition-all ${
                      isSunny ? 'bg-gray-200 text-gray-800 hover:bg-gray-300' : 'bg-white/10 text-white hover:bg-white/20'
                    }`}
                  >
                    🏠 Home
                  </button>
                </motion.div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        @keyframes gradient {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
      `}</style>
    </div>
  );
}