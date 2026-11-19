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
  const [showSuccess, setShowSuccess] = useState(false);
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem('user'));
    setUser(userData);
  }, []);

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
    if (!method) { alert('Please select a payment method first'); return; }
    if (!transactionId.trim()) { alert('Please enter transaction ID'); return; }
    if (!bid_number) { alert('Bid number is missing. Please go back and try again.'); return; }

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      await axios.post('https://adey-bid-8k87.onrender.com/api/payment', {
        amount: parseFloat(amount),
        method,
        transaction_id: transactionId,
        auction_id: parseInt(auction_id),
        bid_number: parseFloat(bid_number)
      }, { headers: { Authorization: `Bearer ${token}` } });
      setShowSuccess(true);
    } catch (error) {
      console.error('Payment error:', error);
      alert(error.response?.data?.error || 'Payment failed. Please try again.');
    }
    setLoading(false);
  };

  const accountNumber = method === 'telebirr' ? '0963163020' : '1000488492687';
  const accountName = 'Eyob';
  const bankName = method === 'telebirr' ? 'Telebirr Mobile Money' : 'Commercial Bank of Ethiopia';

  return (
    <div className={`min-h-screen relative overflow-hidden transition-colors duration-500 ${
      isSunny ? 'bg-gradient-to-br from-yellow-100 via-orange-50 to-pink-100' : 'bg-black'
    }`}>
      
      {/* Background Effects */}
      {isSunny ? (
        <div className="absolute inset-0 pointer-events-none">
          <motion.div animate={{ y: [0, -20, 0], scale: [1, 1.1, 1] }} transition={{ duration: 4, repeat: Infinity }} className="absolute top-20 right-20 w-32 h-32">
            <div className="absolute inset-0 bg-yellow-400 rounded-full blur-3xl opacity-60"></div>
            <div className="relative w-full h-full bg-gradient-to-br from-yellow-300 to-orange-400 rounded-full shadow-2xl"></div>
          </motion.div>
        </div>
      ) : (
        <div className="absolute inset-0">
          <motion.div animate={{ background: ['radial-gradient(circle at 20% 30%, rgba(168,85,247,0.4) 0%, transparent 50%)', 'radial-gradient(circle at 80% 70%, rgba(236,72,153,0.4) 0%, transparent 50%)'] }} transition={{ duration: 15, repeat: Infinity }} className="absolute inset-0"></motion.div>
        </div>
      )}

      {/* Header */}
      <motion.header initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className={`relative z-10 backdrop-blur-2xl border-b sticky top-0 ${isSunny ? 'bg-white/70 border-orange-200' : 'bg-slate-950/80 border-white/10'}`}>
        <div className="max-w-3xl mx-auto px-4 py-3 flex justify-between items-center">
          <motion.div whileHover={{ scale: 1.05 }} className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/auctions')}>
            <div className={`relative bg-gradient-to-br rounded-lg p-2 ${isSunny ? 'from-orange-400 to-pink-500' : 'from-purple-600 to-pink-600'}`}>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 md:h-6 md:w-6 text-white" viewBox="0 0 24 24" fill="currentColor"><path d="M13 2L3 14h7l-1 8 10-12h-7l1-8z" /></svg>
            </div>
            <div>
              <h1 className={`text-lg md:text-xl font-black bg-gradient-to-r bg-clip-text text-transparent ${isSunny ? 'from-orange-600 to-red-600' : 'from-purple-300 to-orange-300'}`}>Adey Bid</h1>
            </div>
          </motion.div>
          <motion.button whileTap={{ scale: 0.9 }} onClick={toggleTheme} className={`w-9 h-9 md:w-10 md:h-10 rounded-lg flex items-center justify-center text-lg shadow-lg ${isSunny ? 'bg-yellow-400 text-white' : 'bg-indigo-600 text-white'}`}>
            {isSunny ? '🌙' : '☀️'}
          </motion.button>
        </div>
      </motion.header>

      {/* Main Content */}
      <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="relative z-10 max-w-3xl mx-auto px-4 py-6 md:py-10">
        
        {/* Hero */}
        <div className="text-center mb-6 md:mb-10">
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring" }} className={`inline-flex items-center justify-center w-16 h-16 md:w-20 md:h-20 rounded-2xl mb-4 shadow-xl ${isSunny ? 'bg-gradient-to-br from-orange-400 to-pink-500' : 'bg-gradient-to-br from-purple-600 to-pink-600'}`}>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 md:h-10 md:w-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
          </motion.div>
          <h1 className={`text-3xl md:text-5xl font-black mb-2 tracking-tight ${isSunny ? 'text-gray-800' : 'text-white'}`}>
            Complete <span className={`bg-gradient-to-r bg-clip-text text-transparent ${isSunny ? 'from-orange-500 to-pink-500' : 'from-purple-400 to-orange-400'}`}>Payment</span>
          </h1>
          <p className={`text-sm md:text-lg ${isSunny ? 'text-gray-600' : 'text-gray-400'}`}>Select a method to continue</p>
        </div>

        {/* Details Summary */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className={`backdrop-blur-xl rounded-2xl p-4 md:p-6 border mb-6 ${isSunny ? 'bg-white/80 border-orange-200' : 'bg-slate-950/90 border-white/10'}`}>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3">
            <div className={`rounded-xl p-3 border ${isSunny ? 'bg-orange-50 border-orange-200' : 'bg-white/5 border-white/10'}`}>
              <p className={`text-[10px] font-bold uppercase mb-1 ${isSunny ? 'text-gray-500' : 'text-gray-400'}`}>Bid Number</p>
              <p className={`text-lg md:text-xl font-black ${isSunny ? 'text-orange-600' : 'text-purple-400'}`}>#{bid_number}</p>
            </div>
            <div className={`rounded-xl p-3 border ${isSunny ? 'bg-green-50 border-green-200' : 'bg-white/5 border-white/10'}`}>
              <p className={`text-[10px] font-bold uppercase mb-1 ${isSunny ? 'text-gray-500' : 'text-gray-400'}`}>Amount</p>
              <p className="text-lg md:text-xl font-black text-green-500">{amount} ETB</p>
            </div>
            <div className={`rounded-xl p-3 border ${isSunny ? 'bg-blue-50 border-blue-200' : 'bg-white/5 border-white/10'}`}>
              <p className={`text-[10px] font-bold uppercase mb-1 ${isSunny ? 'text-gray-500' : 'text-gray-400'}`}>Auction ID</p>
              <p className={`text-lg md:text-xl font-black ${isSunny ? 'text-blue-600' : 'text-blue-400'}`}>#{auction_id}</p>
            </div>
            <div className={`rounded-xl p-3 border ${isSunny ? 'bg-yellow-50 border-yellow-200' : 'bg-white/5 border-white/10'}`}>
              <p className={`text-[10px] font-bold uppercase mb-1 ${isSunny ? 'text-gray-500' : 'text-gray-400'}`}>User</p>
              <p className={`text-lg md:text-xl font-black ${isSunny ? 'text-yellow-600' : 'text-yellow-400'}`}>{user?.name || 'User'}</p>
            </div>
          </div>
        </motion.div>

        {/* Payment Method Selection */}
        <div className="mb-6">
          <h2 className={`text-lg md:text-2xl font-black mb-4 flex items-center gap-2 md:gap-3 ${isSunny ? 'text-gray-800' : 'text-white'}`}>
            <span className={`flex items-center justify-center w-6 h-6 md:w-8 md:h-8 rounded-full text-white text-xs md:text-sm font-black ${isSunny ? 'bg-orange-500' : 'bg-purple-600'}`}>1</span>
            Select Method
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
            <motion.button whileTap={{ scale: 0.98 }} onClick={() => handleSelectMethod('telebirr')} className={`relative group p-4 md:p-6 rounded-xl md:rounded-2xl border-2 text-left transition-all ${method === 'telebirr' ? (isSunny ? 'border-orange-500 bg-orange-50' : 'border-sky-500 bg-sky-500/10') : (isSunny ? 'border-orange-200 bg-white/70' : 'border-white/10 bg-white/5')}`}>
              <div className="flex items-center gap-3 md:gap-4">
                <div className={`relative bg-white rounded-lg md:rounded-xl p-2 md:p-3 shadow-md w-12 h-12 md:w-20 md:h-20 flex items-center justify-center overflow-hidden`}>
                  <img src="/telebirr.png" alt="Telebirr" className="w-full h-full object-contain" />
                </div>
                <div>
                  <p className={`font-black text-base md:text-xl ${isSunny ? 'text-gray-800' : 'text-white'}`}>Telebirr</p>
                  <p className={`text-xs md:text-sm font-medium ${isSunny ? 'text-orange-600/70' : 'text-sky-400/70'}`}>Mobile Money</p>
                  {method === 'telebirr' && <span className="mt-1 md:mt-2 inline-flex items-center gap-1 text-white text-[10px] md:text-xs font-bold px-2 md:px-3 py-1 rounded-full bg-sky-500">✓ Selected</span>}
                </div>
              </div>
            </motion.button>

            <motion.button whileTap={{ scale: 0.98 }} onClick={() => handleSelectMethod('cbe')} className={`relative group p-4 md:p-6 rounded-xl md:rounded-2xl border-2 text-left transition-all ${method === 'cbe' ? (isSunny ? 'border-yellow-500 bg-yellow-50' : 'border-yellow-500 bg-yellow-500/10') : (isSunny ? 'border-yellow-200 bg-white/70' : 'border-white/10 bg-white/5')}`}>
              <div className="flex items-center gap-3 md:gap-4">
                <div className={`relative bg-white rounded-lg md:rounded-xl p-2 md:p-3 shadow-md w-12 h-12 md:w-20 md:h-20 flex items-center justify-center overflow-hidden`}>
                  <img src="/CBE-Birr.png" alt="CBE Birr" className="w-full h-full object-contain" />
                </div>
                <div>
                  <p className={`font-black text-base md:text-xl ${isSunny ? 'text-gray-800' : 'text-white'}`}>CBE Birr</p>
                  <p className={`text-xs md:text-sm font-medium ${isSunny ? 'text-yellow-600/70' : 'text-yellow-400/70'}`}>Commercial Bank</p>
                  {method === 'cbe' && <span className="mt-1 md:mt-2 inline-flex items-center gap-1 text-white text-[10px] md:text-xs font-bold px-2 md:px-3 py-1 rounded-full bg-yellow-500">✓ Selected</span>}
                </div>
              </div>
            </motion.button>
          </div>
        </div>

        {/* Payment Details Card */}
        <AnimatePresence>
          {method && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden mb-6">
              <div className={`relative rounded-xl md:rounded-2xl p-4 md:p-6 shadow-xl overflow-hidden ${method === 'telebirr' ? (isSunny ? 'bg-gradient-to-br from-sky-400 to-emerald-500' : 'bg-gradient-to-br from-sky-600 to-emerald-600') : (isSunny ? 'bg-gradient-to-br from-yellow-400 to-orange-500' : 'bg-gradient-to-br from-yellow-600 to-orange-600')}`}>
                <div className="relative z-10">
                  <div className="flex items-center gap-2 md:gap-3 mb-3 md:mb-4">
                    <span className="flex items-center justify-center w-6 h-6 md:w-8 md:h-8 bg-white/20 backdrop-blur-xl rounded-full text-white text-xs md:text-sm font-black">2</span>
                    <h2 className="text-lg md:text-2xl font-black text-white">Send Payment</h2>
                  </div>

                  <div className="bg-white/10 backdrop-blur-xl rounded-xl p-3 md:p-4 mb-3 md:mb-4 border border-white/20">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <p className="text-white/70 text-[10px] font-bold uppercase">Account Number</p>
                        <p className="text-white font-black text-xl md:text-2xl tracking-wider">{accountNumber}</p>
                      </div>
                      <motion.button whileTap={{ scale: 0.9 }} onClick={() => handleCopy(accountNumber)} className="bg-white/20 hover:bg-white/30 rounded-lg p-2 transition-all">
                        {copied ? <svg className="h-5 w-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg> : <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg>}
                      </motion.button>
                    </div>
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-white/70 text-[10px] font-bold uppercase">Name</p>
                        <p className="text-white font-bold text-sm md:text-base">{accountName}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-white/70 text-[10px] font-bold uppercase">Amount</p>
                        <p className="text-white font-bold text-sm md:text-base">{amount} ETB</p>
                      </div>
                    </div>
                    <div className="mt-3 pt-3 border-t border-white/20">
                      <p className="text-white/70 text-[10px] font-bold uppercase">Bank/Service</p>
                      <p className="text-white font-bold text-sm md:text-base">{bankName}</p>
                    </div>
                  </div>

                  <div className="bg-white/10 backdrop-blur-xl rounded-xl p-3 border border-white/20">
                    <p className="text-white/90 text-xs md:text-sm font-medium flex items-center gap-2">
                      <span>💡</span>
                      <span>Send <span className="font-black">{amount} ETB</span> to the account above via your {method === 'telebirr' ? 'Telebirr' : 'CBE Birr'} app.</span>
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Transaction ID Form */}
        <motion.form initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} onSubmit={handleSubmit} className={`backdrop-blur-xl rounded-2xl p-4 md:p-8 border ${isSunny ? 'bg-white/80 border-orange-200' : 'bg-slate-950/90 border-white/10'}`}>
          <h2 className={`text-lg md:text-2xl font-black mb-4 md:mb-6 flex items-center gap-2 md:gap-3 ${isSunny ? 'text-gray-800' : 'text-white'}`}>
            <span className={`flex items-center justify-center w-6 h-6 md:w-8 md:h-8 rounded-full text-white text-xs md:text-sm font-black ${isSunny ? 'bg-orange-500' : 'bg-purple-600'}`}>3</span>
            Confirm Payment
          </h2>
          
          <div className="mb-4 md:mb-6">
            <label className={`block text-xs md:text-sm font-bold uppercase tracking-wider mb-2 ${isSunny ? 'text-gray-500' : 'text-gray-400'}`}>Transaction ID / Reference</label>
            <input
              type="text"
              value={transactionId}
              onChange={(e) => setTransactionId(e.target.value)}
              placeholder="e.g., TX123456789"
              className={`w-full px-4 py-3 md:py-4 border-2 rounded-xl md:rounded-2xl text-sm md:text-lg placeholder-gray-500 focus:outline-none transition-all ${isSunny ? 'bg-orange-50 border-orange-300 text-gray-800 focus:border-orange-500' : 'bg-white/5 border-white/10 text-white focus:border-purple-500'}`}
              required
            />
          </div>

          <motion.button whileTap={{ scale: 0.98 }} type="submit" disabled={loading || !method} className="w-full relative overflow-hidden rounded-xl md:rounded-2xl font-black text-sm md:text-xl shadow-xl disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-wider group">
            <div className={`absolute inset-0 transition-all duration-700 ${method === 'telebirr' ? (isSunny ? 'bg-gradient-to-r from-sky-500 to-emerald-500' : 'bg-gradient-to-r from-sky-600 to-emerald-600') : method === 'cbe' ? (isSunny ? 'bg-gradient-to-r from-yellow-500 to-orange-500' : 'bg-gradient-to-r from-yellow-600 to-orange-600') : 'bg-gradient-to-r from-gray-600 to-gray-700'}`}></div>
            <span className="relative flex items-center justify-center gap-2 py-3.5 md:py-5 text-white">
              {loading ? (
                <><svg className="animate-spin h-5 w-5" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path></svg> Processing...</>
              ) : !method ? (
                <>👆 Select a method first</>
              ) : (
                <>💳 Submit Payment</>
              )}
            </span>
          </motion.button>

          <div className={`mt-4 md:mt-6 flex items-start gap-3 rounded-xl p-3 md:p-4 border ${isSunny ? 'bg-orange-50 border-orange-300' : 'bg-yellow-500/10 border-yellow-500/30'}`}>
            <span className="text-yellow-500 text-lg md:text-xl">⚠️</span>
            <p className={`text-xs md:text-sm ${isSunny ? 'text-orange-700' : 'text-yellow-200/80'}`}>
              After submission, admin will review your payment. Once approved, your bid will be active.
            </p>
          </div>
        </motion.form>
      </motion.section>

      {/* Success Modal */}
      <AnimatePresence>
        {showSuccess && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xl flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.8, opacity: 0 }} className={`max-w-md w-full rounded-2xl md:rounded-3xl p-5 md:p-8 border overflow-hidden relative ${isSunny ? 'bg-white border-green-300' : 'bg-slate-950 border-green-500/30'}`}>
              <div className="relative z-10 text-center">
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="inline-flex items-center justify-center w-20 h-20 md:w-24 md:h-24 rounded-full mb-4 bg-gradient-to-br from-green-400 to-emerald-600 shadow-2xl shadow-green-500/50">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 md:h-12 md:w-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                </motion.div>

                <h2 className={`text-2xl md:text-4xl font-black mb-2 ${isSunny ? 'text-gray-800' : 'text-white'}`}>
                  Payment <span className="text-green-500">Submitted!</span>
                </h2>
                <p className={`text-xs md:text-sm mb-4 md:mb-6 ${isSunny ? 'text-gray-600' : 'text-gray-400'}`}>Your payment is being reviewed by admin</p>

                <div className={`rounded-xl p-4 border mb-4 md:mb-6 text-left ${isSunny ? 'bg-green-50 border-green-200' : 'bg-white/5 border-white/10'}`}>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className={`text-[10px] md:text-xs uppercase ${isSunny ? 'text-gray-500' : 'text-gray-400'}`}>🎫 Bid Number</span>
                      <span className={`font-mono font-black text-base md:text-lg ${isSunny ? 'text-green-700' : 'text-green-400'}`}>{bid_number}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className={`text-[10px] md:text-xs uppercase ${isSunny ? 'text-gray-500' : 'text-gray-400'}`}>💰 Amount</span>
                      <span className={`font-black text-base md:text-lg ${isSunny ? 'text-green-700' : 'text-green-400'}`}>{amount} ETB</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className={`text-[10px] md:text-xs uppercase ${isSunny ? 'text-gray-500' : 'text-gray-400'}`}>💳 Transaction</span>
                      <span className={`font-mono text-xs md:text-sm truncate max-w-[120px] md:max-w-[140px] ${isSunny ? 'text-gray-700' : 'text-gray-300'}`}>{transactionId}</span>
                    </div>
                  </div>
                </div>

                <div className={`text-xs mb-4 ${isSunny ? 'text-gray-500' : 'text-gray-400'}`}>
                  Auto redirecting in <span className="font-black text-green-500">{countdown}</span>s...
                </div>

                <div className="flex gap-3">
                  <button onClick={() => navigate('/my-bids')} className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 text-white py-3 rounded-xl font-black text-sm md:text-base hover:from-green-600 hover:to-emerald-700 transition-all shadow-lg shadow-green-500/30">
                    📋 My Bids
                  </button>
                  <button onClick={() => navigate('/auctions')} className={`flex-1 py-3 rounded-xl font-bold text-sm md:text-base transition-all ${isSunny ? 'bg-gray-200 text-gray-800' : 'bg-white/10 text-white'}`}>
                    🏠 Home
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}