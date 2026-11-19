import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';

const API = 'http://localhost:5000/api';

export default function MyBids() {
  const navigate = useNavigate();
  const { isSunny } = useTheme();
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }
    loadMyBids();
  }, [navigate]);

  const loadMyBids = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API}/payment/my-payments`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPayments(res.data);
    } catch (err) {
      console.error('Error loading bids:', err);
      setError('Failed to load your bids');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
      case 'approved':
        return '✅';
      case 'pending':
        return '⏳';
      case 'rejected':
        return '❌';
      default:
        return '❓';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
      case 'approved':
        return 'from-green-500 to-emerald-500';
      case 'pending':
        return 'from-yellow-500 to-orange-500';
      case 'rejected':
        return 'from-red-500 to-pink-500';
      default:
        return 'from-gray-500 to-gray-600';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'completed':
      case 'approved':
        return 'Completed';
      case 'pending':
        return 'Pending';
      case 'rejected':
        return 'Rejected';
      default:
        return 'Unknown';
    }
  };

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${isSunny ? 'bg-gradient-to-br from-yellow-100 via-orange-50 to-pink-100' : 'bg-black'}`}>
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen relative overflow-hidden transition-colors duration-500 ${
      isSunny ? 'bg-gradient-to-br from-yellow-100 via-orange-50 to-pink-100' : 'bg-black'
    }`}>
      {/* Background */}
      {!isSunny && (
        <>
          <div className="absolute inset-0">
            <motion.div
              animate={{ background: ['radial-gradient(circle at 20% 30%, rgba(168,85,247,0.4) 0%, transparent 50%)', 'radial-gradient(circle at 80% 70%, rgba(236,72,153,0.4) 0%, transparent 50%)', 'radial-gradient(circle at 20% 30%, rgba(168,85,247,0.4) 0%, transparent 50%)'] }}
              transition={{ duration: 15, repeat: Infinity }}
              className="absolute inset-0"
            ></motion.div>
          </div>
        </>
      )}

      {/* Header */}
      <motion.header
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className={`relative z-10 backdrop-blur-2xl border-b sticky top-0 transition-colors duration-500 ${
          isSunny ? 'bg-white/60 border-orange-200' : 'bg-slate-950/80 border-white/10'
        }`}
      >
        <div className="max-w-4xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/auctions')}
              className={`transition-colors text-sm font-medium ${isSunny ? 'text-gray-600 hover:text-orange-600' : 'text-gray-400 hover:text-white'}`}
            >
              ← Back to Auctions
            </button>
          </div>
          <div>
            <h1 className={`text-2xl font-black bg-gradient-to-r bg-clip-text text-transparent ${
              isSunny ? 'from-orange-600 via-pink-600 to-red-600' : 'from-purple-300 via-pink-300 to-orange-300'
            }`}>
              Adey Bid
            </h1>
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
            <span className="text-4xl">📋</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className={`text-5xl font-black mb-3 tracking-tight ${isSunny ? 'text-gray-800' : 'text-white'}`}
          >
            My Bids
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className={`text-lg ${isSunny ? 'text-gray-600' : 'text-gray-400'}`}
          >
            {payments.length} bid{payments.length !== 1 ? 's' : ''} placed
          </motion.p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-200 px-4 py-3 rounded-xl mb-6">
            ⚠️ {error}
          </div>
        )}

        {payments.length === 0 ? (
          <div className={`backdrop-blur-2xl rounded-3xl p-12 border text-center ${
            isSunny ? 'bg-white/80 border-orange-200' : 'bg-slate-950/90 border-white/10'
          }`}>
            <div className="text-6xl mb-4">📭</div>
            <p className={`text-xl font-bold ${isSunny ? 'text-gray-700' : 'text-white'}`}>
              No bids yet
            </p>
            <p className={`text-sm mt-2 ${isSunny ? 'text-gray-500' : 'text-gray-400'}`}>
              Place your first bid to see it here!
            </p>
            <button
              onClick={() => navigate('/auctions')}
              className="mt-6 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-3 rounded-xl font-bold"
            >
              🏆 Browse Auctions
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {payments.map((p, idx) => (
              <motion.div
                key={p.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className={`backdrop-blur-2xl rounded-2xl p-6 border transition-all hover:scale-[1.02] ${
                  isSunny
                    ? 'bg-white/80 border-orange-200 hover:border-orange-400'
                    : 'bg-slate-950/90 border-white/10 hover:border-purple-500/50'
                }`}
              >
                <div className="flex justify-between items-start mb-4 flex-wrap gap-4">
                  <div className="flex-1">
                    {/* Auction Title */}
                    <h3 className={`text-2xl font-black mb-2 ${isSunny ? 'text-gray-800' : 'text-white'}`}>
                      {p.auction_title || 'Auction'}
                    </h3>

                    {/* 🔥 BID NUMBER - ዋናው ለውጭ! */}
                    {p.bid_number && (
                      <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl mb-3 ${
                        isSunny
                          ? 'bg-gradient-to-r from-orange-500 to-pink-500 text-white'
                          : 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                      }`}>
                        <span className="text-sm font-bold">🎫 Your Bid Number:</span>
                        <span className="font-mono font-black text-xl">{p.bid_number}</span>
                      </div>
                    )}

                    {/* Transaction ID */}
                    <div className="space-y-1">
                      <p className={`text-sm ${isSunny ? 'text-gray-600' : 'text-gray-400'}`}>
                        💳 Transaction ID: <span className="font-mono font-bold">{p.transaction_id || 'N/A'}</span>
                      </p>
                      <p className={`text-sm ${isSunny ? 'text-gray-600' : 'text-gray-400'}`}>
                        💰 Amount: <span className="font-bold text-green-500">{p.amount} ETB</span>
                      </p>
                      <p className={`text-xs ${isSunny ? 'text-gray-500' : 'text-gray-500'}`}>
                        📅 Date: {new Date(p.created_at).toLocaleString()}
                      </p>
                    </div>
                  </div>

                  {/* Status Badge */}
                  <div className={`px-4 py-2 rounded-xl font-bold text-white text-sm bg-gradient-to-r ${getStatusColor(p.status)}`}>
                    <span className="mr-1">{getStatusIcon(p.status)}</span>
                    {getStatusText(p.status)}
                  </div>
                </div>

                {/* Status Message */}
                {p.status === 'pending' && (
                  <div className={`mt-4 flex items-start gap-3 rounded-xl p-4 border ${
                    isSunny ? 'bg-yellow-50 border-yellow-300' : 'bg-yellow-500/10 border-yellow-500/30'
                  }`}>
                    <span className="text-yellow-400 text-xl">⏳</span>
                    <p className={`text-sm ${isSunny ? 'text-yellow-700' : 'text-yellow-200/80'}`}>
                      Waiting for admin approval. Your payment is being reviewed.
                    </p>
                  </div>
                )}

                {p.status === 'completed' || p.status === 'approved' ? (
                  <div className={`mt-4 flex items-start gap-3 rounded-xl p-4 border ${
                    isSunny ? 'bg-green-50 border-green-300' : 'bg-green-500/10 border-green-500/30'
                  }`}>
                    <span className="text-green-400 text-xl">✅</span>
                    <p className={`text-sm ${isSunny ? 'text-green-700' : 'text-green-200/80'}`}>
                      Approved! Your bid is active. Bid #{p.bid_number} is now participating.
                    </p>
                  </div>
                ) : null}

                {p.status === 'rejected' && (
                  <div className={`mt-4 flex items-start gap-3 rounded-xl p-4 border ${
                    isSunny ? 'bg-red-50 border-red-300' : 'bg-red-500/10 border-red-500/30'
                  }`}>
                    <span className="text-red-400 text-xl">❌</span>
                    <p className={`text-sm ${isSunny ? 'text-red-700' : 'text-red-200/80'}`}>
                      Rejected. Your payment was not approved. Please contact support.
                    </p>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </motion.section>
    </div>
  );
}