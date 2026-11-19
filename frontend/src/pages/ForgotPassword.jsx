import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const API = 'https://adey-bid-8k87.onrender.com/api';

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1: Phone, 2: OTP + New Password
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  // Step 1: Request OTP
  const handleRequestOTP = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      console.log('🔥 Sending request to:', `${API}/auth/forgot-password`);
      console.log('📱 Phone:', phone);
      
      const response = await axios.post(`${API}/auth/forgot-password`, { phone });
      
      console.log('✅ Response:', response.data);
      setSuccess('OTP request sent! Please wait for admin approval.');
      
      // Auto-advance to step 2 after 2 seconds
      setTimeout(() => {
        setStep(2);
        setSuccess('');
      }, 2000);
    } catch (err) {
      console.error('❌ Error:', err);
      setError(err.response?.data?.error || 'Failed to send OTP request');
    }
    setLoading(false);
  };

  // Step 2: Reset Password with OTP
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      console.log('🔥 Resetting password with OTP:', otp);
      
      const response = await axios.post(`${API}/auth/reset-password`, {
        phone,
        otp,
        newPassword
      });
      
      console.log('✅ Password reset:', response.data);
      setSuccess('Password reset successfully! Please login.');
      
      setTimeout(() => {
        navigate('/');
      }, 2000);
    } catch (err) {
      console.error('❌ Error:', err);
      setError(err.response?.data?.error || 'Failed to reset password');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-black relative overflow-hidden flex items-center justify-center p-4">
      {/* Aurora Background */}
      <div className="absolute inset-0">
        <motion.div
          animate={{
            background: [
              'radial-gradient(circle at 20% 30%, rgba(168,85,247,0.4) 0%, transparent 50%)',
              'radial-gradient(circle at 80% 70%, rgba(236,72,153,0.4) 0%, transparent 50%)',
              'radial-gradient(circle at 20% 30%, rgba(168,85,247,0.4) 0%, transparent 50%)'
            ]
          }}
          transition={{ duration: 15, repeat: Infinity }}
          className="absolute inset-0"
        ></motion.div>
      </div>

      {/* Main Card */}
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="relative z-10 w-full max-w-md"
      >
        <div className="absolute -inset-[2px] rounded-3xl bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 opacity-80 bg-[length:400%_400%]" style={{ animation: 'gradient 8s ease infinite' }}></div>
        
        <div className="relative bg-slate-950/95 backdrop-blur-2xl rounded-3xl p-10">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-black text-white mb-2">Forgot Password?</h1>
            <p className="text-gray-400 text-sm">
              {step === 1 ? 'Enter your phone number' : 'Enter OTP and new password'}
            </p>
          </div>

          {success && (
            <div className="bg-green-500/10 border border-green-500/30 text-green-200 px-4 py-3 rounded-xl mb-6 text-sm">
              ✅ {success}
            </div>
          )}

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-200 px-4 py-3 rounded-xl mb-6 text-sm">
              ⚠️ {error}
            </div>
          )}

          <AnimatePresence mode="wait">
            {step === 1 ? (
              <motion.form
                key="step1"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                onSubmit={handleRequestOTP}
                className="space-y-5"
              >
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="09XXXXXXXX"
                  className="w-full px-5 py-4 bg-white/5 border-2 border-white/10 rounded-2xl text-white focus:outline-none focus:border-purple-500"
                  required
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-4 rounded-2xl font-bold disabled:opacity-50 hover:from-purple-700 hover:to-pink-700 transition-all"
                >
                  {loading ? 'Sending...' : '📧 Request OTP'}
                </button>
              </motion.form>
            ) : (
              <motion.form
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                onSubmit={handleResetPassword}
                className="space-y-5"
              >
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder="Enter OTP (6 digits)"
                  maxLength={6}
                  className="w-full px-5 py-4 bg-white/5 border-2 border-white/10 rounded-2xl text-white focus:outline-none focus:border-purple-500 text-center text-2xl font-mono tracking-widest"
                  required
                />
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="New Password"
                  className="w-full px-5 py-4 bg-white/5 border-2 border-white/10 rounded-2xl text-white focus:outline-none focus:border-purple-500"
                  required
                />
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm New Password"
                  className="w-full px-5 py-4 bg-white/5 border-2 border-white/10 rounded-2xl text-white focus:outline-none focus:border-purple-500"
                  required
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-4 rounded-2xl font-bold disabled:opacity-50 hover:from-purple-700 hover:to-pink-700 transition-all"
                >
                  {loading ? 'Resetting...' : '🔐 Reset Password'}
                </button>
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="w-full text-gray-400 hover:text-white text-sm"
                >
                  ← Back to phone number
                </button>
              </motion.form>
            )}
          </AnimatePresence>

          <div className="mt-6 text-center">
            <button onClick={() => navigate('/')} className="text-purple-400 font-bold hover:text-purple-300">
              ← Back to Login
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}