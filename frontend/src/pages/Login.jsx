import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

export default function Login() {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [focusedField, setFocusedField] = useState('');
  const [typewriterText, setTypewriterText] = useState('');
  const navigate = useNavigate();
  const cardRef = useRef(null);

  // 3D Tilt Effect
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setTilt({ x: y * -15, y: x * 15 });
  };
  const handleMouseLeave = () => setTilt({ x: 0, y: 0 });

  // Typewriter Effect
  useEffect(() => {
    const text = "Welcome Back!";
    let index = 0;
    const timer = setInterval(() => {
      if (index < text.length) {
        setTypewriterText(text.substring(0, index + 1));
        index++;
      } else {
        clearInterval(timer);
      }
    }, 100);
    return () => clearInterval(timer);
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await axios.post('https://adey-bid-8k87.onrender.com/api/auth/login', {
        phone,
        password
      });

      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));

      if (rememberMe) {
        localStorage.setItem('rememberedPhone', phone);
      } else {
        localStorage.removeItem('rememberedPhone');
      }

      if (res.data.user.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/auctions');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed. Please check your credentials.');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated Mesh Gradient Background */}
      <div className="absolute inset-0">
        <motion.div
          animate={{ 
            background: [
              'radial-gradient(circle at 20% 30%, rgba(168,85,247,0.5) 0%, transparent 50%)',
              'radial-gradient(circle at 80% 70%, rgba(236,72,153,0.5) 0%, transparent 50%)',
              'radial-gradient(circle at 50% 50%, rgba(249,115,22,0.3) 0%, transparent 50%)',
              'radial-gradient(circle at 20% 30%, rgba(168,85,247,0.5) 0%, transparent 50%)'
            ]
          }}
          transition={{ duration: 15, repeat: Infinity }}
          className="absolute inset-0"
        ></motion.div>
        <motion.div
          animate={{ 
            background: [
              'radial-gradient(circle at 80% 20%, rgba(59,130,246,0.4) 0%, transparent 50%)',
              'radial-gradient(circle at 20% 80%, rgba(16,185,129,0.4) 0%, transparent 50%)',
              'radial-gradient(circle at 80% 20%, rgba(59,130,246,0.4) 0%, transparent 50%)'
            ]
          }}
          transition={{ duration: 18, repeat: Infinity }}
          className="absolute inset-0"
        ></motion.div>
      </div>

      {/* Animated Waves */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(5)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute bottom-0 left-0 w-full h-32"
            style={{
              background: `linear-gradient(to top, rgba(${168 + i * 20}, ${85 + i * 30}, ${247 - i * 20}, ${0.1 - i * 0.02}), transparent)`,
              borderRadius: '50% 50% 0 0'
            }}
            animate={{ x: [0, 100, 0], y: [0, -20, 0] }}
            transition={{ duration: 10 + i * 2, repeat: Infinity, ease: "easeInOut" }}
          />
        ))}
      </div>

      {/* Particle System */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(40)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              width: Math.random() * 6 + 2,
              height: Math.random() * 6 + 2,
              background: ['#a855f7', '#ec4899', '#f97316', '#3b82f6', '#10b981'][i % 5]
            }}
            animate={{
              y: [0, -150, 0],
              x: [0, Math.random() * 100 - 50, 0],
              opacity: [0, 0.8, 0],
              scale: [0, 1.5, 0]
            }}
            transition={{
              duration: Math.random() * 15 + 10,
              delay: Math.random() * 5,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        ))}
      </div>

      {/* Grid Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:100px_100px]"></div>

      {/* Main Card with 3D Tilt */}
      <motion.div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        initial={{ opacity: 0, y: 50, rotateX: 10 }}
        animate={{ opacity: 1, y: 0, rotateX: 0 }}
        transition={{ duration: 1, type: "spring" }}
        className="relative w-full max-w-6xl"
        style={{
          transform: `perspective(1200px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
          transition: 'transform 0.2s ease-out'
        }}
      >
        {/* Animated Gradient Border */}
        <div className="absolute -inset-[3px] rounded-3xl bg-gradient-to-r from-purple-500 via-pink-500 via-orange-500 via-pink-500 to-purple-500 opacity-90 bg-[length:400%_400%]" style={{ animation: 'gradient 8s ease infinite' }}></div>
        
        <div className="relative grid grid-cols-1 lg:grid-cols-5 gap-0 rounded-3xl overflow-hidden bg-slate-950/95 backdrop-blur-2xl shadow-2xl">
          
          {/* Left Side - Branding (Compact on Mobile) */}
          <div className="lg:col-span-3 relative bg-gradient-to-br from-purple-900/70 via-slate-900/70 to-pink-900/70 backdrop-blur-2xl p-6 lg:p-12 flex flex-col justify-center lg:min-h-[650px] overflow-hidden">
            
            {/* Animated Orbs */}
            <motion.div
              animate={{ x: [0, 150, 0], y: [0, 80, 0], scale: [1, 1.2, 1] }}
              transition={{ duration: 25, repeat: Infinity }}
              className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-bl from-purple-500/40 to-transparent rounded-full blur-3xl"
            ></motion.div>
            <motion.div
              animate={{ x: [0, -150, 0], y: [0, -80, 0], scale: [1, 1.3, 1] }}
              transition={{ duration: 30, repeat: Infinity }}
              className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-gradient-to-tr from-pink-500/40 to-transparent rounded-full blur-3xl"
            ></motion.div>

            {/* Logo */}
            <motion.div
              initial={{ y: -50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3, type: "spring" }}
              className="relative z-10"
            >
              <div className="flex items-center gap-3 lg:gap-4 mb-4 lg:mb-8">
                <motion.div
                  whileHover={{ rotate: 360, scale: 1.2 }}
                  transition={{ duration: 0.8 }}
                  className="relative"
                >
                  <motion.div
                    animate={{ scale: [1, 1.3, 1], opacity: [0.7, 1, 0.7] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="absolute inset-0 bg-purple-500 rounded-2xl blur-2xl"
                  ></motion.div>
                  <div className="relative bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl p-3 lg:p-5 shadow-2xl">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 lg:h-14 lg:w-14 text-white" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M13 2L3 14h7l-1 8 10-12h-7l1-8z" />
                    </svg>
                  </div>
                </motion.div>
                <div>
                  <h2 className="text-2xl lg:text-4xl font-black text-white tracking-tight">
                    <span className="bg-gradient-to-r from-purple-300 via-pink-300 to-orange-300 bg-clip-text text-transparent">Adey Bid</span>
                  </h2>
                  <p className="text-purple-300/90 text-[10px] lg:text-sm font-bold uppercase tracking-[0.2em] lg:tracking-[0.4em] mt-1 lg:mt-2">Premium Auctions</p>
                </div>
              </div>
            </motion.div>

            {/* Animated Headline with Typewriter */}
            <motion.div
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="relative z-10 flex-1 flex flex-col justify-center"
            >
              {/* Hidden on mobile to save space */}
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.7 }}
                className="hidden md:inline-flex items-center gap-3 bg-white/10 backdrop-blur-xl rounded-full px-4 py-2 lg:px-5 lg:py-3 mb-4 lg:mb-8 w-fit border border-white/20 shadow-lg"
              >
                <div className="relative">
                  <div className="w-2 h-2 lg:w-3 lg:h-3 bg-green-400 rounded-full animate-pulse"></div>
                  <div className="absolute inset-0 w-2 h-2 lg:w-3 lg:h-3 bg-green-400 rounded-full animate-ping"></div>
                </div>
                <span className="text-white text-xs lg:text-sm font-bold uppercase tracking-[0.2em] lg:tracking-[0.3em]">Live Auctions</span>
              </motion.div>

              <h1 className="text-3xl lg:text-7xl xl:text-8xl font-black leading-[1.1] lg:leading-[0.9] mb-3 lg:mb-8 tracking-tight">
                <motion.span 
                  initial={{ opacity: 0, x: -100 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.8, type: "spring" }}
                  className="block text-white"
                >
                  {typewriterText}
                </motion.span>
                <motion.span
                  animate={{ opacity: [1, 0, 1] }}
                  transition={{ duration: 0.8, repeat: Infinity }}
                  className="inline-block w-1 lg:w-2 h-8 lg:h-16 bg-purple-400 ml-2 align-middle"
                ></motion.span>
              </h1>

              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.5 }}
                className="text-gray-300 text-sm lg:text-xl font-medium leading-relaxed max-w-lg mb-4 lg:mb-0"
              >
                Sign in to continue your winning journey.
              </motion.p>
            </motion.div>

            {/* ✅ REMOVED: "Join our growing community" section is completely deleted here */}
          </div>

          {/* Right Side - Form */}
          <div className="lg:col-span-2 bg-slate-950/95 backdrop-blur-2xl p-6 lg:p-12 flex flex-col justify-center relative border-t lg:border-t-0 lg:border-l border-white/10">
            
            {/* Header */}
            <motion.div
              initial={{ y: -30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="mb-6 lg:mb-10"
            >
              <div className="flex items-center gap-3 mb-3 lg:mb-4">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: 40 }}
                  transition={{ delay: 0.6, duration: 0.5 }}
                  className="h-1.5 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
                ></motion.div>
                <span className="text-purple-400 text-[10px] lg:text-xs font-black uppercase tracking-[0.3em] lg:tracking-[0.4em]">Sign In</span>
              </div>
              <h2 className="text-3xl lg:text-5xl font-black text-white mb-2 lg:mb-3 tracking-tight">
                Welcome <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">Back</span>
              </h2>
              <p className="text-gray-500 text-xs lg:text-base">
                Sign in to your account
              </p>
            </motion.div>

            {/* Error */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0, y: -20 }}
                  animate={{ opacity: 1, height: 'auto', y: 0 }}
                  exit={{ opacity: 0, height: 0, y: -20 }}
                  className="bg-red-500/10 border-2 border-red-500/30 text-red-200 px-4 py-3 lg:px-5 lg:py-4 rounded-xl mb-4 lg:mb-6 text-xs lg:text-sm flex items-center gap-3 backdrop-blur-sm"
                >
                  <motion.div animate={{ rotate: [0, -10, 10, -10, 0] }} transition={{ duration: 0.5 }}>⚠️</motion.div>
                  <span className="font-bold">{error}</span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Form */}
            <form onSubmit={handleLogin} className="space-y-4 lg:space-y-6">
              {/* Phone Field */}
              <motion.div
                initial={{ x: 30, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="relative group"
              >
                <label className={`absolute left-4 lg:left-5 transition-all duration-300 pointer-events-none z-10 ${
                  focusedField === 'phone' || phone ? '-top-2.5 lg:-top-3 text-[10px] lg:text-xs bg-slate-950 px-2 lg:px-3 text-purple-400 font-black uppercase tracking-wider' : 'top-3.5 lg:top-4 text-sm lg:text-base text-gray-500'
                }`}>
                  📱 Phone Number
                </label>
                <div className={`absolute inset-0 rounded-2xl transition-all duration-500 opacity-0 ${
                  focusedField === 'phone' ? 'opacity-100 bg-gradient-to-r from-purple-500/20 to-pink-500/20 blur-xl' : ''
                }`}></div>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  onFocus={() => setFocusedField('phone')}
                  onBlur={() => setFocusedField('')}
                  placeholder="09XXXXXXXX"
                  required
                  className={`relative w-full px-4 lg:px-5 py-3.5 lg:py-4 bg-white/5 border-2 rounded-2xl text-white text-sm lg:text-lg placeholder-gray-600 focus:outline-none transition-all ${
                    focusedField === 'phone' ? 'border-purple-500 shadow-lg shadow-purple-500/20' : 'border-white/10 hover:border-white/20'
                  }`}
                />
              </motion.div>

              {/* Password Field */}
              <motion.div
                initial={{ x: 30, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="relative group"
              >
                <label className={`absolute left-4 lg:left-5 transition-all duration-300 pointer-events-none z-10 ${
                  focusedField === 'password' || password ? '-top-2.5 lg:-top-3 text-[10px] lg:text-xs bg-slate-950 px-2 lg:px-3 text-purple-400 font-black uppercase tracking-wider' : 'top-3.5 lg:top-4 text-sm lg:text-base text-gray-500'
                }`}>
                  🔒 Password
                </label>
                <div className={`absolute inset-0 rounded-2xl transition-all duration-500 opacity-0 ${
                  focusedField === 'password' ? 'opacity-100 bg-gradient-to-r from-purple-500/20 to-pink-500/20 blur-xl' : ''
                }`}></div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={() => setFocusedField('password')}
                  onBlur={() => setFocusedField('')}
                  required
                  className={`relative w-full px-4 lg:px-5 py-3.5 lg:py-4 bg-white/5 border-2 rounded-2xl text-white text-sm lg:text-lg placeholder-gray-600 focus:outline-none transition-all pr-12 lg:pr-14 ${
                    focusedField === 'password' ? 'border-purple-500 shadow-lg shadow-purple-500/20' : 'border-white/10 hover:border-white/20'
                  }`}
                />
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 lg:right-5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-purple-400 transition-colors"
                >
                  {showPassword ? (
                    <svg className="w-5 h-5 lg:w-6 lg:h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5 lg:w-6 lg:h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </motion.button>
              </motion.div>

              {/* Remember Me & Forgot Password */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7 }}
                className="flex justify-between items-center"
              >
                <label className="flex items-center gap-2 cursor-pointer group">
                  <div className="relative">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="sr-only"
                    />
                    <div className={`w-4 h-4 lg:w-5 lg:h-5 rounded border-2 transition-all ${
                      rememberMe ? 'bg-gradient-to-r from-purple-500 to-pink-500 border-purple-500' : 'border-gray-600 group-hover:border-purple-500'
                    }`}>
                      {rememberMe && (
                        <motion.svg initial={{ scale: 0 }} animate={{ scale: 1 }} className="w-4 h-4 lg:w-5 lg:h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                        </motion.svg>
                      )}
                    </div>
                  </div>
                  <span className="text-gray-400 text-xs lg:text-sm font-medium group-hover:text-purple-400 transition-colors">Remember me</span>
                </label>
                <button
                  type="button"
                  onClick={() => navigate('/forgot-password')}
                  className="text-purple-400 text-xs lg:text-sm font-bold hover:text-purple-300 transition-colors"
                >
                  Forgot Password?
                </button>
              </motion.div>

              {/* Submit Button */}
              <motion.div
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.8 }}
              >
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  type="submit"
                  disabled={loading}
                  className="relative w-full overflow-hidden rounded-2xl font-black text-sm lg:text-xl shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-wider group"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 group-hover:from-orange-500 group-hover:via-pink-600 group-hover:to-purple-600 transition-all duration-700"></div>
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-2xl bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 -z-10"></div>
                  <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/40 to-transparent"></div>
                  <span className="relative flex items-center justify-center gap-3 py-3.5 lg:py-5 text-white">
                    {loading ? (
                      <>
                        <svg className="animate-spin h-4 w-4 lg:h-6 lg:w-6" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Signing in...
                      </>
                    ) : (
                      <>🚀 Sign In</>
                    )}
                  </span>
                </motion.button>
              </motion.div>
            </form>

            {/* Register Link */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
              className="mt-6 lg:mt-10 text-center"
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="h-px flex-1 bg-gradient-to-r from-transparent to-white/20"></div>
                <span className="text-gray-600 text-[10px] lg:text-xs uppercase tracking-[0.3em] lg:tracking-[0.4em] font-black">or</span>
                <div className="h-px flex-1 bg-gradient-to-l from-transparent to-white/20"></div>
              </div>
              <p className="text-gray-400 text-xs lg:text-base">
                Don't have an account?{' '}
                <motion.button
                  whileHover={{ x: 5 }}
                  onClick={() => navigate('/register')}
                  className="text-purple-400 font-bold hover:text-purple-300 transition-colors group"
                >
                  Register <span className="inline-block group-hover:translate-x-1 transition-transform">→</span>
                </motion.button>
              </p>
            </motion.div>

            {/* Trust Badges */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.2 }}
              className="mt-4 lg:mt-8 flex items-center justify-center gap-3 lg:gap-6"
            >
              {[
                { icon: '🔒', label: 'SSL Secure' },
                { icon: '🛡️', label: 'Protected' },
                { icon: '✓', label: 'Verified' }
              ].map((badge, i) => (
                <motion.div
                  key={i}
                  whileHover={{ y: -3 }}
                  className="flex items-center gap-1.5 lg:gap-2 text-gray-500 text-[10px] lg:text-sm"
                >
                  <span className="text-sm lg:text-lg">{badge.icon}</span>
                  <span className="font-medium hidden sm:inline">{badge.label}</span>
                </motion.div>
              ))}
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