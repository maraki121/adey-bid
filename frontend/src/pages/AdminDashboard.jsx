import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const API = 'https://adey-bid-8k87.onrender.com/api';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [stats, setStats] = useState({});
  const [users, setUsers] = useState([]);
  const [auctions, setAuctions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [bids, setBids] = useState([]);
  const [payments, setPayments] = useState([]);
  const [otpRequests, setOtpRequests] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showAuctionForm, setShowAuctionForm] = useState(false);
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [expandedAuctions, setExpandedAuctions] = useState({});
  const [uploading, setUploading] = useState(false);
  const [imagePreview, setImagePreview] = useState('');
  const [newAuction, setNewAuction] = useState({
    title: '', description: '', image_url: '', category_id: '', bid_cost: '', duration_days: '', end_date: ''
  });
  const [newCategory, setNewCategory] = useState({ name: '' });

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) { navigate('/'); return; }
    loadDashboard();
    loadPayments();
    loadCategories();
    loadAuctions();
  }, [navigate]);

  const getHeaders = () => ({ headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });

  const loadDashboard = async () => {
    try {
      const statsRes = await axios.get(`${API}/admin/stats`, getHeaders());
      setStats(statsRes.data);
    } catch (err) { console.error(err); }
  };

  const loadUsers = async () => {
    try { const res = await axios.get(`${API}/admin/users`, getHeaders()); setUsers(res.data); } catch (err) { console.error(err); }
  };

  const loadAuctions = async () => {
    try {
      const res = await axios.get(`${API}/admin/auctions`, getHeaders());
      setAuctions(res.data);
    } catch (err) { console.error(err); }
  };

  const loadCategories = async () => {
    try { const res = await axios.get(`${API}/admin/categories`, getHeaders()); setCategories(res.data); } catch (err) { console.error(err); }
  };

  const loadBids = async () => {
    try {
      const res = await axios.get(`${API}/admin/bids`, getHeaders());
      setBids(res.data);
    } catch (err) { console.error(err); }
  };

  const loadPayments = async () => {
    try { const res = await axios.get(`${API}/admin/payments`, getHeaders()); setPayments(res.data); } catch (err) { console.error(err); }
  };

  const loadOtpRequests = async () => {
    try { const res = await axios.get(`${API}/admin/otp-requests`, getHeaders()); setOtpRequests(res.data); } catch (err) { setError('Failed to load OTP requests'); }
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setError('');
    setSuccess('');
    if (tab === 'dashboard') loadDashboard();
    else if (tab === 'users') loadUsers();
    else if (tab === 'auctions') loadAuctions();
    else if (tab === 'categories') loadCategories();
    else if (tab === 'bids') { loadBids(); loadAuctions(); }
    else if (tab === 'payments') loadPayments();
    else if (tab === 'otp') loadOtpRequests();
  };

  const toggleAuction = (auctionId) => {
    setExpandedAuctions(prev => ({ ...prev, [auctionId]: !prev[auctionId] }));
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { setError('Please select an image file'); return; }
    if (file.size > 5 * 1024 * 1024) { setError('Image size must be less than 5MB'); return; }

    setUploading(true);
    setError('');
    try {
      const formData = new FormData();
      formData.append('image', file);
      const res = await axios.post(`${API}/upload`, formData, {
        headers: { 'Content-Type': 'multipart/form-data', Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      const imageUrl = res.data.url || res.data.path || res.data.filename;
      const fullUrl = imageUrl.startsWith('http') ? imageUrl : `https://adey-bid-8k87.onrender.com${imageUrl.startsWith('/') ? '' : '/'}${imageUrl}`;
      setNewAuction({ ...newAuction, image_url: imageUrl });
      setImagePreview(fullUrl);
      setSuccess('✅ Image uploaded successfully!');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to upload image.');
    } finally {
      setUploading(false);
    }
  };

  const handleDurationChange = (days) => {
    const numDays = parseInt(days);
    if (isNaN(numDays) || numDays <= 0) return;
    const now = new Date();
    const endDate = new Date(now.getTime() + numDays * 24 * 60 * 60 * 1000);
    const year = endDate.getFullYear();
    const month = String(endDate.getMonth() + 1).padStart(2, '0');
    const day = String(endDate.getDate()).padStart(2, '0');
    const hours = String(endDate.getHours()).padStart(2, '0');
    const minutes = String(endDate.getMinutes()).padStart(2, '0');
    setNewAuction({ ...newAuction, duration_days: days, end_date: `${year}-${month}-${day}T${hours}:${minutes}` });
  };

  const handleCreateAuction = async (e) => {
    e.preventDefault();
    setError(''); setSuccess('');
    if (!newAuction.title || !newAuction.bid_cost || !newAuction.duration_days || !newAuction.end_date) {
      setError('Title, bid cost, duration, and end date are required'); return;
    }
    try {
      await axios.post(`${API}/admin/auctions`, newAuction, getHeaders());
      setSuccess('✅ Auction created successfully!');
      setShowAuctionForm(false);
      setNewAuction({ title: '', description: '', image_url: '', category_id: '', bid_cost: '', duration_days: '', end_date: '' });
      setImagePreview('');
      loadAuctions();
    } catch (err) { setError(err.response?.data?.error || 'Failed to create auction'); }
  };

  const handleCreateCategory = async (e) => {
    e.preventDefault();
    setError(''); setSuccess('');
    if (!newCategory.name) { setError('Category name is required'); return; }
    try {
      await axios.post(`${API}/admin/categories`, newCategory, getHeaders());
      setSuccess('✅ Category created successfully!');
      setShowCategoryForm(false);
      setNewCategory({ name: '' });
      loadCategories();
    } catch (err) { setError(err.response?.data?.error || 'Failed to create category'); }
  };

  const handleDeleteCategory = async (id) => {
    try { await axios.delete(`${API}/admin/categories/${id}`, getHeaders()); setSuccess('✅ Category deleted'); loadCategories(); } catch (err) { setError('Failed to delete category'); }
  };

  const handleUpdatePaymentStatus = async (id, status) => {
    try {
      await axios.put(`${API}/admin/payments/${id}/status`, { status }, getHeaders());
      setSuccess(`✅ Payment ${status}`);
      loadPayments();
      loadBids();
      loadDashboard();
    } catch (err) { setError(err.response?.data?.error || 'Failed to update payment'); }
  };

  const handleDeleteAuction = async (id) => {
    try { await axios.delete(`${API}/admin/auctions/${id}`, getHeaders()); setSuccess('✅ Auction deleted'); loadAuctions(); } catch (err) { setError('Failed to delete auction'); }
  };

  const handleDeleteUser = async (id) => {
    try { await axios.delete(`${API}/admin/users/${id}`, getHeaders()); setSuccess('✅ User deleted'); loadUsers(); } catch (err) { setError('Failed to delete user'); }
  };

  const handleSendOtp = async (id) => {
    try { await axios.post(`${API}/admin/otp-requests/${id}/send`, {}, getHeaders()); setSuccess('OTP marked as sent'); loadOtpRequests(); } catch (err) { setError('Failed to send OTP'); }
  };

  const handleRejectOtp = async (id) => {
    try { await axios.post(`${API}/admin/otp-requests/${id}/reject`, {}, getHeaders()); setSuccess('OTP request rejected'); loadOtpRequests(); } catch (err) { setError('Failed to reject OTP'); }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/');
  };

  // ==========================================
  // 🔥 BID LOGIC - LOWEST UNIQUE BID
  // ✅ 1 ጊዜ ብቻ የታየ (unique) ቁጥሮች ብቻ
  // ✅ ከእነዚህ ውስጥ ዝቅተኛው አሸናፊ
  // ==========================================

  // Count how many times each bid number appears per auction
  const bidCounts = {};
  bids.forEach(b => {
    const aid = b.auction_id;
    const num = parseFloat(b.number);
    if (!bidCounts[aid]) bidCounts[aid] = {};
    bidCounts[aid][num] = (bidCounts[aid][num] || 0) + 1;
  });

  // Find lowest unique bid per auction (appears exactly ONCE)
  const lowestUniqueByAuction = {};
  Object.keys(bidCounts).forEach(aid => {
    const counts = bidCounts[aid];
    const uniqueNumbers = Object.keys(counts)
      .filter(num => counts[num] === 1)
      .map(num => parseFloat(num));
    
    if (uniqueNumbers.length > 0) {
      lowestUniqueByAuction[aid] = Math.min(...uniqueNumbers);
    } else {
      lowestUniqueByAuction[aid] = null;
    }
  });

  // Auctions ከ bids ጋር ብቻ ያላቸው
  const auctionBidData = {};
  bids.forEach(b => {
    const aid = b.auction_id;
    if (!auctionBidData[aid]) {
      auctionBidData[aid] = { bids: [], title: b.auction_title, category: b.category_name };
    }
    auctionBidData[aid].bids.push(b);
  });

  // Leading user ለእያንዳንዱ auction
  Object.keys(auctionBidData).forEach(aid => {
    const lowestUnique = lowestUniqueByAuction[aid];
    auctionBidData[aid].lowestUniqueBid = lowestUnique;
    
    if (lowestUnique !== null) {
      const leadingBid = auctionBidData[aid].bids.find(b => parseFloat(b.number) === lowestUnique);
      auctionBidData[aid].leadingUser = leadingBid || null;
    } else {
      auctionBidData[aid].leadingUser = null;
    }
    
    auctionBidData[aid].totalEtb = auctionBidData[aid].bids.reduce((sum, b) => sum + (parseFloat(b.amount) || 0), 0);
  });

  const auctionsWithBids = Object.keys(auctionBidData).map(aid => ({
    id: aid,
    ...auctionBidData[aid]
  })).sort((a, b) => b.bids.length - a.bids.length);

  const groupBidsByUser = (bidsList) => {
    const groups = {};
    bidsList.forEach(b => {
      const key = `${b.user_name || 'Unknown'}|${b.user_phone || ''}`;
      if (!groups[key]) {
        groups[key] = { name: b.user_name, phone: b.user_phone, bids: [], totalEtb: 0 };
      }
      groups[key].bids.push(b);
      groups[key].totalEtb += (parseFloat(b.amount) || 0);
    });
    return Object.values(groups).sort((a, b) => b.bids.length - a.bids.length);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="bg-black/30 backdrop-blur-xl border-b border-white/10 p-6">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-black text-white">Admin Dashboard</h1>
            <p className="text-purple-300 text-sm">ADEY BID MANAGEMENT SYSTEM</p>
          </div>
          <button onClick={handleLogout} className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-xl font-bold">Logout</button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        <div className="flex flex-wrap gap-3 mb-8">
          {[
            { id: 'dashboard', label: '📊 Dashboard' },
            { id: 'users', label: '👥 Users' },
            { id: 'payments', label: `💰 Payments (${payments.length})` },
            { id: 'otp', label: `🔑 OTP Requests (${otpRequests.length})` },
            { id: 'bids', label: `🎯 Bid Management (${bids.length})` },
            { id: 'auctions', label: '🏆 Auctions' },
            { id: 'categories', label: '📁 Categories' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={`px-6 py-3 rounded-xl font-bold transition-all ${
                activeTab === tab.id ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white' : 'bg-white/5 text-gray-300 hover:bg-white/10'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {success && <div className="bg-green-500/10 border border-green-500/30 text-green-200 px-4 py-3 rounded-xl mb-6">✅ {success}</div>}
        {error && <div className="bg-red-500/10 border border-red-500/30 text-red-200 px-4 py-3 rounded-xl mb-6">⚠️ {error}</div>}

        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
              <h3 className="text-gray-400 text-sm">Total Users</h3>
              <p className="text-4xl font-black text-white mt-2">{stats.totalUsers || 0}</p>
            </div>
            <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
              <h3 className="text-gray-400 text-sm">Total Auctions</h3>
              <p className="text-4xl font-black text-white mt-2">{stats.totalAuctions || 0}</p>
            </div>
            <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
              <h3 className="text-gray-400 text-sm">Total Bids</h3>
              <p className="text-4xl font-black text-white mt-2">{stats.totalBids || 0}</p>
            </div>
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div>
            <h2 className="text-2xl font-black text-white mb-6">👥 Users</h2>
            {users.length === 0 ? (
              <div className="bg-white/5 rounded-2xl p-12 text-center text-gray-400">No users yet</div>
            ) : (
              <div className="space-y-3">
                {users.map(u => (
                  <div key={u.id} className="bg-white/5 rounded-xl p-4 border border-white/10 flex justify-between items-center">
                    <div>
                      <p className="text-white font-bold">{u.name || 'Unknown'}</p>
                      <p className="text-gray-400 text-sm">{u.phone} • Balance: {u.balance} ETB</p>
                    </div>
                    <button onClick={() => handleDeleteUser(u.id)} className="bg-red-500 text-white px-4 py-2 rounded-xl font-bold">❌ Delete</button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Payments Tab */}
        {activeTab === 'payments' && (
          <div>
            <h2 className="text-2xl font-black text-white mb-6">💰 Payments</h2>
            {payments.length === 0 ? (
              <div className="bg-white/5 rounded-2xl p-12 text-center text-gray-400">No payments yet</div>
            ) : (
              <div className="space-y-4">
                {payments.map(p => (
                  <div key={p.id} className="bg-white/5 rounded-xl p-6 border border-white/10">
                    <div className="flex justify-between items-start mb-4 flex-wrap gap-4">
                      <div>
                        <p className="text-white font-bold text-lg">{p.user_name || 'Unknown'}</p>
                        <p className="text-gray-400 text-sm">📱 {p.user_phone} • 🏆 {p.auction_title}</p>
                        <p className="text-purple-300 text-sm mt-2">💳 Transaction: <span className="font-mono font-bold">{p.transaction_id || 'N/A'}</span></p>
                        <p className="text-yellow-300 text-sm mt-1">🎫 Bid Number: <span className="font-mono font-bold text-lg">{p.bid_number || 'N/A'}</span></p>
                        <p className="text-gray-500 text-xs mt-1">Date: {new Date(p.created_at).toLocaleString()}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-green-400 font-bold text-xl">{p.amount} ETB</p>
                        <p className={`text-sm mt-1 font-bold ${
                          p.status === 'pending' ? 'text-yellow-400' :
                          p.status === 'completed' || p.status === 'approved' ? 'text-green-400' : 'text-red-400'
                        }`}>
                          {p.status === 'pending' && '⏳ Pending'}
                          {p.status === 'completed' && '✅ Completed'}
                          {p.status === 'approved' && '✅ Approved'}
                          {p.status === 'rejected' && '❌ Rejected'}
                        </p>
                      </div>
                    </div>
                    {p.status === 'pending' && (
                      <div className="flex gap-3 mt-4 pt-4 border-t border-white/10">
                        <button onClick={() => handleUpdatePaymentStatus(p.id, 'completed')} className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-xl font-bold">✅ Approve</button>
                        <button onClick={() => handleUpdatePaymentStatus(p.id, 'rejected')} className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-xl font-bold">❌ Reject</button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 🔥 BID MANAGEMENT - LOWEST UNIQUE BID LOGIC */}
        {activeTab === 'bids' && (
          <div>
            <h2 className="text-2xl font-black text-white mb-2">🎯 Bid Management</h2>
            <p className="text-gray-400 text-sm mb-6">
              💡 Winner = Lowest UNIQUE bid number (appears exactly once)
            </p>

            {auctionsWithBids.length === 0 ? (
              <div className="bg-white/5 rounded-2xl p-12 text-center text-gray-400">
                <div className="text-5xl mb-3">📭</div>
                <p>No bids yet. Wait for users to place bids!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {auctionsWithBids.map(auction => {
                  const isExpanded = expandedAuctions[auction.id];
                  const userGroups = groupBidsByUser(auction.bids);

                  return (
                    <div key={auction.id} className="bg-white/5 rounded-2xl border border-white/10 overflow-hidden">
                      {/* Auction Header */}
                      <div
                        onClick={() => toggleAuction(auction.id)}
                        className={`px-6 py-5 cursor-pointer transition-all ${
                          isExpanded
                            ? 'bg-gradient-to-r from-purple-600/30 to-pink-600/30'
                            : 'hover:bg-white/5'
                        }`}
                      >
                        <div className="flex justify-between items-center flex-wrap gap-4">
                          <div className="flex items-center gap-4 flex-1">
                            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-2xl">
                              🏆
                            </div>
                            <div>
                              <p className="text-white font-black text-xl">{auction.title}</p>
                              <div className="flex items-center gap-3 mt-1 flex-wrap">
                                {auction.category && (
                                  <span className="bg-purple-500/20 text-purple-300 text-xs px-2 py-0.5 rounded-full border border-purple-500/30">
                                    📁 {auction.category}
                                  </span>
                                )}
                                <span className="text-gray-400 text-xs">
                                  {auction.bids.length} bid{auction.bids.length !== 1 ? 's' : ''}
                                </span>
                                <span className="text-green-400 text-xs font-bold">
                                  {auction.totalEtb} ETB collected
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-4">
                            {auction.leadingUser && (
                              <div className="text-right">
                                <p className="text-gray-400 text-xs uppercase tracking-wider">🏆 Winner (Lowest Unique)</p>
                                <p className="text-green-400 font-black text-lg">
                                  {auction.leadingUser.user_name}
                                </p>
                                <p className="text-gray-400 text-xs">
                                  Bid: <span className="font-mono font-bold">{auction.lowestUniqueBid}</span>
                                </p>
                              </div>
                            )}
                            {!auction.leadingUser && (
                              <div className="text-right">
                                <p className="text-gray-400 text-xs uppercase tracking-wider">⚠️ No Winner</p>
                                <p className="text-yellow-400 font-bold text-sm">No unique bids yet</p>
                              </div>
                            )}
                            <div className={`text-2xl transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}>
                              ▼
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Expanded Content */}
                      {isExpanded && (
                        <div className="border-t border-white/10 divide-y divide-white/5">
                          {userGroups.map((group, idx) => {
                            const groupLeading = group.bids.some(
                              b => parseFloat(b.number) === auction.lowestUniqueBid
                            );
                            return (
                              <div key={idx} className="px-6 py-4">
                                {/* User Header */}
                                <div className="flex items-center gap-3 mb-3 flex-wrap">
                                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-black">
                                    {(group.name || '?').charAt(0).toUpperCase()}
                                  </div>
                                  <div>
                                    <p className="text-white font-bold">{group.name}</p>
                                    <p className="text-gray-500 text-xs">📱 {group.phone}</p>
                                  </div>
                                  {groupLeading && (
                                    <span className="bg-green-500 text-white text-xs px-3 py-1 rounded-full font-bold animate-pulse ml-2">
                                      🏆 WINNER
                                    </span>
                                  )}
                                  <div className="ml-auto text-right">
                                    <p className="text-green-400 font-bold">{group.totalEtb} ETB</p>
                                    <p className="text-gray-500 text-xs">{group.bids.length} bids</p>
                                  </div>
                                </div>

                                {/* User's Bids */}
                                <div className="ml-12 space-y-2">
                                  {group.bids
                                    .sort((a, b) => parseFloat(a.number) - parseFloat(b.number))
                                    .map(b => {
                                      const num = parseFloat(b.number);
                                      const isWinner = num === auction.lowestUniqueBid;
                                      const count = bidCounts[auction.id] && bidCounts[auction.id][num] ? bidCounts[auction.id][num] : 0;
                                      const isUnique = count === 1;
                                      return (
                                        <div
                                          key={b.id}
                                          className={`flex justify-between items-center px-4 py-2 rounded-xl ${
                                            isWinner
                                              ? 'bg-green-500/15 border-2 border-green-500/50'
                                              : !isUnique
                                              ? 'bg-red-500/5 border border-red-500/20'
                                              : 'bg-white/5 border border-white/10'
                                          }`}
                                        >
                                          <div className="flex items-center gap-3 flex-wrap">
                                            <span className={`font-mono font-black text-xl ${
                                              isWinner ? 'text-green-400' : !isUnique ? 'text-red-400 line-through' : 'text-white'
                                            }`}>
                                              {b.number}
                                            </span>
                                            {isWinner && (
                                              <span className="text-green-400 text-xs font-bold bg-green-500/20 px-2 py-0.5 rounded-full">
                                                🥇 WINNER
                                              </span>
                                            )}
                                            {!isUnique && (
                                              <span className="text-red-400 text-xs font-bold bg-red-500/20 px-2 py-0.5 rounded-full">
                                                ❌ Duplicate ({count}x)
                                              </span>
                                            )}
                                            {isUnique && !isWinner && (
                                              <span className="text-blue-400 text-xs font-bold bg-blue-500/20 px-2 py-0.5 rounded-full">
                                                ✓ Unique
                                              </span>
                                            )}
                                            {b.transaction_id && (
                                              <span className="text-gray-500 text-xs">💳 {b.transaction_id}</span>
                                            )}
                                          </div>
                                          <div className="flex items-center gap-3">
                                            <span className="text-green-400 font-bold text-sm">{b.amount || 0} ETB</span>
                                            <span className="text-gray-500 text-xs">
                                              {new Date(b.created_at).toLocaleDateString()}
                                            </span>
                                          </div>
                                        </div>
                                      );
                                    })}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Auctions Tab */}
        {activeTab === 'auctions' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-black text-white">🏆 Auctions</h2>
              <button onClick={() => { setShowAuctionForm(!showAuctionForm); setImagePreview(''); }} className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-xl font-bold">
                {showAuctionForm ? '✕ Cancel' : '➕ Add Auction'}
              </button>
            </div>

            {showAuctionForm && (
              <form onSubmit={handleCreateAuction} className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10 mb-6 space-y-4">
                <h3 className="text-xl font-bold text-white mb-4">Create New Auction</h3>
                <input type="text" placeholder="Title" value={newAuction.title} onChange={(e) => setNewAuction({ ...newAuction, title: e.target.value })} className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-purple-500" required />
                <textarea placeholder="Description" value={newAuction.description} onChange={(e) => setNewAuction({ ...newAuction, description: e.target.value })} className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-purple-500" rows="3" />

                <div>
                  <label className="block text-sm font-bold uppercase tracking-wider mb-2 text-gray-400">📷 Auction Photo</label>
                  <div className={`border-2 border-dashed rounded-xl p-6 text-center transition-all ${
                    imagePreview ? 'border-green-500/50 bg-green-500/5' : 'border-white/20 bg-white/5 hover:border-purple-500/50'
                  }`}>
                    {uploading ? (
                      <div className="text-purple-300">
                        <div className="animate-spin h-8 w-8 mx-auto mb-2 border-4 border-purple-500 border-t-transparent rounded-full"></div>
                        <p className="text-sm font-bold">Uploading photo...</p>
                      </div>
                    ) : imagePreview ? (
                      <div>
                        <img src={imagePreview} alt="Preview" className="w-full max-h-48 object-cover rounded-xl mb-3" />
                        <p className="text-green-400 text-sm font-bold">✅ Photo uploaded!</p>
                        <button type="button" onClick={() => { setImagePreview(''); setNewAuction({ ...newAuction, image_url: '' }); }} className="mt-2 bg-red-500/20 text-red-300 px-4 py-1 rounded-lg text-xs font-bold hover:bg-red-500/30">
                          ❌ Remove Photo
                        </button>
                      </div>
                    ) : (
                      <div>
                        <div className="text-4xl mb-2">📸</div>
                        <p className="text-gray-400 text-sm mb-3">Click to upload auction photo</p>
                        <label className="inline-block bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-2 rounded-xl font-bold cursor-pointer hover:opacity-90 transition-all">
                          📁 Choose Photo
                          <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                        </label>
                        <p className="text-gray-500 text-xs mt-2">JPG, PNG, GIF, WebP (max 5MB)</p>
                      </div>
                    )}
                  </div>
                </div>

                <select value={newAuction.category_id} onChange={(e) => setNewAuction({ ...newAuction, category_id: e.target.value })} className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-purple-500">
                  <option value="" className="bg-slate-900">Select Category</option>
                  {categories.map(c => (<option key={c.id} value={c.id} className="bg-slate-900">{c.name}</option>))}
                </select>
                <div className="grid grid-cols-2 gap-4">
                  <input type="number" placeholder="Bid Cost (ETB)" value={newAuction.bid_cost} onChange={(e) => setNewAuction({ ...newAuction, bid_cost: e.target.value })} className="px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-purple-500" required />
                  <input type="number" placeholder="Duration (days)" value={newAuction.duration_days} onChange={(e) => handleDurationChange(e.target.value)} className="px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-purple-500" required />
                </div>
                <input type="datetime-local" value={newAuction.end_date} readOnly className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-purple-500 opacity-70 cursor-not-allowed" />
                <button type="submit" disabled={uploading} className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-3 rounded-xl font-bold disabled:opacity-50">
                  {uploading ? '⏳ Uploading...' : '✅ Create Auction'}
                </button>
              </form>
            )}

            {auctions.length === 0 ? (
              <div className="bg-white/5 rounded-2xl p-12 text-center text-gray-400">No auctions yet</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {auctions.map(a => (
                  <div key={a.id} className="bg-white/5 rounded-xl p-4 border border-white/10">
                    {a.image_url && (
                      <img
                        src={a.image_url.startsWith('http') ? a.image_url : `https://adey-bid-8k87.onrender.com${a.image_url.startsWith('/') ? '' : '/'}${a.image_url}`}
                        alt={a.title}
                        className="w-full h-40 object-cover rounded-xl mb-3"
                        onError={(e) => { e.target.style.display = 'none'; }}
                      />
                    )}
                    <p className="text-white font-bold">{a.title}</p>
                    <p className="text-gray-400 text-sm">{a.category_name} • {a.bid_cost} ETB • {a.status}</p>
                    <p className="text-gray-500 text-xs mt-1">Ends: {new Date(a.end_date).toLocaleString()}</p>
                    <button onClick={() => handleDeleteAuction(a.id)} className="mt-2 bg-red-500 text-white px-3 py-1 rounded-lg text-sm">❌ Delete</button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Categories Tab */}
        {activeTab === 'categories' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-black text-white">📁 Categories</h2>
              <button onClick={() => setShowCategoryForm(!showCategoryForm)} className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-xl font-bold">
                {showCategoryForm ? '✕ Cancel' : '➕ Add Category'}
              </button>
            </div>

            {showCategoryForm && (
              <form onSubmit={handleCreateCategory} className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10 mb-6 space-y-4">
                <h3 className="text-xl font-bold text-white mb-4">Create New Category</h3>
                <input type="text" placeholder="Category Name" value={newCategory.name} onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })} className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-purple-500" required />
                <button type="submit" className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-3 rounded-xl font-bold">✅ Create Category</button>
              </form>
            )}

            {categories.length === 0 ? (
              <div className="bg-white/5 rounded-2xl p-12 text-center text-gray-400">No categories</div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {categories.map(c => (
                  <div key={c.id} className="bg-white/5 rounded-xl p-4 border border-white/10 text-center">
                    <p className="text-white font-bold">{c.name}</p>
                    <button onClick={() => handleDeleteCategory(c.id)} className="mt-2 bg-red-500 text-white px-3 py-1 rounded-lg text-sm">❌ Delete</button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* OTP Requests Tab */}
        {activeTab === 'otp' && (
          <div>
            <h2 className="text-2xl font-black text-white mb-6">🔑 OTP Requests</h2>
            {otpRequests.length === 0 ? (
              <div className="bg-white/5 rounded-2xl p-12 text-center text-gray-400"><div className="text-6xl mb-4">📭</div><p>No pending OTP requests</p></div>
            ) : (
              <div className="space-y-4">
                {otpRequests.map(req => (
                  <div key={req.id} className="bg-white/5 rounded-2xl p-6 border border-white/10 flex justify-between items-center">
                    <div>
                      <p className="text-white font-bold">User: {req.name || 'Unknown'}</p>
                      <p className="text-gray-400">Phone: {req.phone || req.user_phone}</p>
                      <p className="text-purple-300">OTP: <span className="font-mono text-lg">{req.otp}</span></p>
                      <p className="text-gray-500 text-sm">Status: {req.status}</p>
                    </div>
                    <div className="flex gap-3">
                      <button onClick={() => handleSendOtp(req.id)} className="bg-green-500 text-white px-4 py-2 rounded-xl font-bold">✅ Send</button>
                      <button onClick={() => handleRejectOtp(req.id)} className="bg-red-500 text-white px-4 py-2 rounded-xl font-bold">❌ Reject</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}