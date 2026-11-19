import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence, useMotionValue, useTransform, useSpring } from 'framer-motion';

export default function Register() {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [focusedField, setFocusedField] = useState('');
  const [success, setSuccess] = useState(false);
  const [counters, setCounters] = useState({ winners: 0, auctions: 0, satisfaction: 0 });
  const navigate = useNavigate();
  const cardRef = useRef(null);

  // 3D Tilt Effect
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setTilt({ x: y * -20, y: x * 20 });
  };
  const handleMouseLeave = () => setTilt({ x: 0, y: 0 });

  // Counting Animation
  useEffect(() => {
    const duration = 2000;
    const steps = 60;
    const interval = duration / steps;
    let step = 0;
    const timer = setInterval(() => {
      step++;
      const progress = step / steps;
      setCounters({
        winners: Math.floor(10000 * progress),
        auctions: Math.floor(500 * progress),
        satisfaction: Math.floor(99 * progress)
      });
      if (step >= steps) clearInterval(timer);
    }, interval);
  }, []);

  // Password strength
  const getPasswordStrength = () => {
    if (!password) return { level: 0, label: '', color: '' };
    let score = 0;
    if (password.length >= 6) score++;
    if (password.length >= 10) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    if (score <= 1) return { level: 1, label: 'Weak', color: 'from-red-500 to-red-400' };
    if (score <= 2) return { level: 2, label: 'Fair', color: 'from-orange-500 to-orange-400' };
    if (score <= 3) return { level: 3, label: 'Good', color: 'from-yellow-500 to-yellow-400' };
    if (score <= 4) return { level: 4, label: 'Strong', color: 'from-green-500 to-emerald-400' };
    return { level: 5, label: 'Elite', color: 'from-emerald-400 to-cyan-400' };
  };

  const passwordStrength = getPasswordStrength();
  const passwordsMatch = confirmPassword && password === confirmPassword;

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    if (phone.length < 10) {
      setError('Please enter a valid phone number');
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post('http://localhost:5000/api/auth/register', {
        phone, password, name
      });
      setSuccess(true);
      setTimeout(() => {
        localStorage.setItem('token', res.data.token);
        localStorage.setItem('user', JSON.stringify(res.data.user));
        navigate(res.data.user.role === 'admin' ? '/admin' : '/auctions');
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated Aurora Background */}
      <div className="absolute inset-0">
        <motion.div
          animate={{ 
            background: [
              'radial-gradient(circle at 20% 30%, rgba(168,85,247,0.4) 0%, transparent 50%)',
              'radial-gradient(circle at 80% 70%, rgba(236,72,153,0.4) 0%, transparent 50%)',
              'radial-gradient(circle at 20% 30%, rgba(168,85,247,0.4) 0%, transparent 50%)'
            ]
          }}
          transition={{ duration: 10, repeat: Infinity }}
          className="absolute inset-0"
        ></motion.div>
        <motion.div
          animate={{ 
            background: [
              'radial-gradient(circle at 80% 20%, rgba(249,115,22,0.3) 0%, transparent 50%)',
              'radial-gradient(circle at 20% 80%, rgba(59,130,246,0.3) 0%, transparent 50%)',
              'radial-gradient(circle at 80% 20%, rgba(249,115,22,0.3) 0%, transparent 50%)'
            ]
          }}
          transition={{ duration: 12, repeat: Infinity }}
          className="absolute inset-0"
        ></motion.div>
      </div>

      {/* Particle System */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(30)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              width: Math.random() * 4 + 2,
              height: Math.random() * 4 + 2,
              background: i % 3 === 0 ? '#a855f7' : i % 3 === 1 ? '#ec4899' : '#f97316'
            }}
            animate={{
              y: [0, -100, 0],
              x: [0, Math.random() * 50 - 25, 0],
              opacity: [0, 1, 0],
              scale: [0, 1, 0]
            }}
            transition={{
              duration: Math.random() * 10 + 10,
              delay: Math.random() * 5,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        ))}
      </div>

      {/* Grid Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:80px_80px]"></div>

      {/* Success Overlay */}
      <AnimatePresence>
        {success && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-xl"
          >
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 200, damping: 20 }}
              className="text-center"
            >
              <div className="relative inline-block mb-6">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                  className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 blur-2xl opacity-75"
                ></motion.div>
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.3, type: "spring" }}
                  className="relative w-32 h-32 bg-gradient-to-br from-purple-600 to-pink-600 rounded-full flex items-center justify-center shadow-2xl"
                >
                  <motion.svg
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ delay: 0.5, duration: 0.8 }}
                    className="w-16 h-16 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                  </motion.svg>
                </motion.div>
              </div>
              <motion.h2
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.7 }}
                className="text-5xl font-black text-white mb-3"
              >
                Welcome! 🎉
              </motion.h2>
              <motion.p
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.9 }}
                className="text-purple-300 text-xl"
              >
                Your account has been created
              </motion.p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Card with 3D Tilt */}
      <motion.div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="relative w-full max-w-6xl"
        style={{
          transform: `perspective(1000px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
          transition: 'transform 0.3s ease-out'
        }}
      >
        {/* Animated Gradient Border */}
        <div className="absolute -inset-[2px] rounded-3xl bg-gradient-to-r from-purple-500 via-pink-500 via-orange-500 via-pink-500 to-purple-500 opacity-80 bg-[length:400%_400%] animate-[gradient_8s_ease_infinite]"></div>
        
        <div className="relative grid grid-cols-1 lg:grid-cols-5 gap-0 rounded-3xl overflow-hidden bg-slate-950/95 backdrop-blur-2xl">
          
          {/* Left Side - Branding */}
          <div className="lg:col-span-3 relative bg-gradient-to-br from-purple-900/60 via-slate-900/60 to-pink-900/60 backdrop-blur-2xl p-12 flex flex-col justify-between min-h-[600px] overflow-hidden">
            
            {/* Animated Orbs */}
            <motion.div
              animate={{ x: [0, 100, 0], y: [0, 50, 0] }}
              transition={{ duration: 20, repeat: Infinity }}
              className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-purple-500/30 to-transparent rounded-full blur-3xl"
            ></motion.div>
            <motion.div
              animate={{ x: [0, -100, 0], y: [0, -50, 0] }}
              transition={{ duration: 25, repeat: Infinity }}
              className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-pink-500/30 to-transparent rounded-full blur-3xl"
            ></motion.div>

            {/* Logo */}
            <motion.div
              initial={{ y: -30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="relative z-10"
            >
              <div className="flex items-center gap-4 mb-12">
                <motion.div
                  whileHover={{ rotate: 360, scale: 1.1 }}
                  transition={{ duration: 0.6 }}
                  className="relative"
                >
                  <div className="absolute inset-0 bg-purple-500 rounded-2xl blur-xl opacity-75"></div>
                  <div className="relative bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl p-4 shadow-2xl">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-white" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M13 2L3 14h7l-1 8 10-12h-7l1-8z" />
                    </svg>
                  </div>
                </motion.div>
                <div>
                  <h2 className="text-3xl font-black text-white tracking-tight">
                    <span className="bg-gradient-to-r from-purple-300 via-pink-300 to-orange-300 bg-clip-text text-transparent">Adey Bid</span>
                  </h2>
                  <p className="text-purple-300/80 text-xs font-bold uppercase tracking-[0.3em] mt-1">Premium Auctions</p>
                </div>
              </div>
            </motion.div>

            {/* Animated Headline */}
            <motion.div
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="relative z-10 flex-1 flex flex-col justify-center"
            >
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.7 }}
                className="inline-flex items-center gap-2 bg-white/5 backdrop-blur-sm rounded-full px-4 py-2 mb-6 w-fit border border-white/10"
              >
                <div className="relative">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <div className="absolute inset-0 w-2 h-2 bg-green-400 rounded-full animate-ping"></div>
                </div>
                <span className="text-white text-xs font-bold uppercase tracking-[0.2em]">Live Auctions</span>
              </motion.div>

              <h1 className="text-6xl lg:text-7xl font-black leading-[0.95] mb-6 tracking-tight">
                <motion.span 
                  initial={{ opacity: 0, x: -50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.8 }}
                  className="block text-white"
                >
                  Start Your
                </motion.span>
                <motion.span 
                  initial={{ opacity: 0, x: -50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 1 }}
                  className="block bg-gradient-to-r from-purple-400 via-pink-400 to-orange-400 bg-clip-text text-transparent bg-[length:200%_auto]"
                  style={{
                    animation: 'gradient 5s ease infinite'
                  }}
                >
                  Winning
                </motion.span>
                <motion.span 
                  initial={{ opacity: 0, x: -50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 1.2 }}
                  className="block text-white"
                >
                  Journey
                </motion.span>
              </h1>

              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.4 }}
                className="text-gray-300 text-lg font-medium leading-relaxed max-w-md"
              >
                Join thousands of winners. Place your bid, make your payment, and claim your prize today.
              </motion.p>
            </motion.div>

            {/* Animated Stats */}
            <motion.div
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.7 }}
              className="relative z-10 grid grid-cols-3 gap-3 mt-8"
            >
              {[
                { value: counters.winners >= 1000 ? '10K+' : counters.winners.toLocaleString(), label: 'Winners', icon: '🏆' },
                { value: counters.auctions >= 500 ? '500+' : counters.auctions.toString(), label: 'Auctions', icon: '🎯' },
                { value: counters.satisfaction >= 99 ? '99%' : `${counters.satisfaction}%`, label: 'Satisfaction', icon: '⭐' }
              ].map((stat, i) => (
                <motion.div
                  key={i}
                  whileHover={{ y: -5, scale: 1.05 }}
                  className="bg-white/5 backdrop-blur-xl rounded-2xl p-4 border border-white/10 hover:border-purple-500/50 hover:bg-white/10 transition-all cursor-default"
                >
                  <div className="text-2xl mb-2">{stat.icon}</div>
                  <div className="text-2xl font-black text-white">{stat.value}</div>
                  <div className="text-purple-300/80 text-[10px] font-bold uppercase tracking-wider mt-1">{stat.label}</div>
                </motion.div>
              ))}
            </motion.div>

            {/* Social Proof */}
            <motion.div
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 1.6 }}
              className="relative z-10 mt-6"
            >
              <div className="flex items-center gap-3">
                <div className="flex -space-x-3">
                  {['👨', '👩', '👨‍💼', '👩‍💼'].map((emoji, i) => (
                    <div key={i} className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-lg border-2 border-slate-900">
                      {emoji}
                    </div>
                  ))}
                </div>
                <div>
                  <p className="text-white text-sm font-bold">Join 10,000+ winners</p>
                  <div className="flex items-center gap-1">
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <svg key={i} className="w-4 h-4 text-yellow-400 fill-current" viewBox="0 0 20 20">
                          <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"/>
                        </svg>
                      ))}
                    </div>
                    <span className="text-gray-400 text-xs">4.9/5</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Right Side - Form */}
          <div className="lg:col-span-2 bg-slate-950/95 backdrop-blur-2xl p-10 flex flex-col justify-center relative border-l border-white/5">
            
            {/* Header */}
            <motion.div
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="mb-8"
            >
              <div className="flex items-center gap-2 mb-3">
                <div className="h-1 w-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"></div>
                <span className="text-purple-400 text-[10px] font-black uppercase tracking-[0.3em]">Get Started</span>
              </div>
              <h2 className="text-4xl font-black text-white mb-2 tracking-tight">
                Create <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">Account</span>
              </h2>
              <p className="text-gray-500 text-sm">
                Fill in your details to join
              </p>
            </motion.div>

            {/* Error */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-red-500/10 border border-red-500/30 text-red-200 px-4 py-3 rounded-xl mb-4 text-sm flex items-center gap-2"
                >
                  <span>⚠️</span>
                  <span className="font-medium">{error}</span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Form */}
            <form onSubmit={handleRegister} className="space-y-4">
              {[
                { key: 'name', label: 'Full Name', icon: '👤', type: 'text', value: name, setter: setName, required: false },
                { key: 'phone', label: 'Phone Number', icon: '📱', type: 'tel', value: phone, setter: setPhone, required: true, placeholder: '09XXXXXXXX' },
                { key: 'password', label: 'Password', icon: '🔒', type: 'password', value: password, setter: setPassword, required: true },
                { key: 'confirm', label: 'Confirm Password', icon: '🔐', type: 'password', value: confirmPassword, setter: setConfirmPassword, required: true }
              ].map((field, i) => (
                <motion.div
                  key={field.key}
                  initial={{ x: 20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.5 + i * 0.1 }}
                  className="relative group"
                >
                  <label className={`absolute left-4 transition-all duration-300 pointer-events-none z-10 ${
                    focusedField === field.key || field.value ? '-top-2.5 text-[10px] bg-slate-950 px-2 text-purple-400 font-black uppercase tracking-wider' : 'top-3.5 text-sm text-gray-500'
                  }`}>
                    {field.icon} {field.label}
                  </label>
                  <div className={`absolute inset-0 rounded-xl transition-all duration-300 opacity-0 ${
                    focusedField === field.key ? 'opacity-100 bg-gradient-to-r from-purple-500/10 to-pink-500/10' : ''
                  }`}></div>
                  <input
                    type={field.type}
                    value={field.value}
                    onChange={(e) => field.setter(e.target.value)}
                    onFocus={() => setFocusedField(field.key)}
                    onBlur={() => setFocusedField('')}
                    placeholder={field.placeholder || ''}
                    required={field.required}
                    className={`relative w-full px-4 py-3.5 bg-white/5 border-2 rounded-xl text-white placeholder-gray-600 focus:outline-none transition-all ${
                      field.key === 'confirm' && field.value ? (
                        passwordsMatch ? 'border-green-500/50' : 'border-red-500/50'
                      ) : focusedField === field.key ? 'border-purple-500' : 'border-white/10'
                    }`}
                  />
                  {field.key === 'confirm' && field.value && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute right-4 top-1/2 -translate-y-1/2"
                    >
                      {passwordsMatch ? '✅' : '❌'}
                    </motion.div>
                  )}
                  {field.key === 'password' && field.value && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="mt-2"
                    >
                      <div className="flex gap-1 mb-1">
                        {[1, 2, 3, 4, 5].map(n => (
                          <motion.div
                            key={n}
                            initial={{ scaleX: 0 }}
                            animate={{ scaleX: n <= passwordStrength.level ? 1 : 0 }}
                            transition={{ delay: n * 0.1 }}
                            className={`h-1 flex-1 rounded-full origin-left ${
                              n <= passwordStrength.level ? `bg-gradient-to-r ${passwordStrength.color}` : 'bg-white/10'
                            }`}
                          ></motion.div>
                        ))}
                      </div>
                      <p className={`text-[10px] font-black uppercase tracking-wider bg-gradient-to-r ${passwordStrength.color} bg-clip-text text-transparent`}>
                        {passwordStrength.label}
                      </p>
                    </motion.div>
                  )}
                </motion.div>
              ))}

              {/* Submit Button */}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.9 }}
              >
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.95 }}
                  type="submit"
                  disabled={loading}
                  className="relative w-full overflow-hidden rounded-xl font-black text-lg shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-wider group"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 group-hover:from-orange-500 group-hover:via-pink-600 group-hover:to-purple-600 transition-all duration-700"></div>
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 -z-10"></div>
                  <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/30 to-transparent"></div>
                  <span className="relative flex items-center justify-center gap-2 py-4 text-white">
                    {loading ? (
                      <>
                        <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Creating...
                      </>
                    ) : (
                      <>🚀 Create Account</>
                    )}
                  </span>
                </motion.button>
              </motion.div>
            </form>

            {/* Trust Badges */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.2 }}
              className="mt-6 flex items-center justify-center gap-4"
            >
              {[
                { icon: '🔒', label: 'SSL Secure' },
                { icon: '🛡️', label: 'Protected' },
                { icon: '✓', label: 'Verified' }
              ].map((badge, i) => (
                <div key={i} className="flex items-center gap-1 text-gray-500 text-xs">
                  <span>{badge.icon}</span>
                  <span>{badge.label}</span>
                </div>
              ))}
            </motion.div>

            {/* Login Link */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
              className="mt-6 text-center"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="h-px flex-1 bg-gradient-to-r from-transparent to-white/20"></div>
                <span className="text-gray-600 text-[10px] uppercase tracking-[0.3em] font-black">or</span>
                <div className="h-px flex-1 bg-gradient-to-l from-transparent to-white/20"></div>
              </div>
              <p className="text-gray-400 text-sm">
                Already have an account?{' '}
                <button
                  onClick={() => navigate('/')}
                  className="text-purple-400 font-bold hover:text-purple-300 transition-colors group"
                >
                  Sign In <span className="inline-block group-hover:translate-x-1 transition-transform">→</span>
                </button>
              </p>
            </motion.div>
          </div>
        </div>
      </motion.div>

      <style>{`
        @keyframes gradient {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
      `}</style>
    </div>
  );
}