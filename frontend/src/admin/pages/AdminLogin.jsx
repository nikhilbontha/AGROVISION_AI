import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Shield, Lock, Eye, EyeOff, AlertCircle, Loader2, ArrowRight, User } from 'lucide-react';
import api from '../../api';

const AdminLogin = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAdminLogin = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    const cleanEmail = email.trim().toLowerCase();

    // Validate admin credentials against DB or admin account
    if (cleanEmail === 'nikhilbontha00@gmail.com' && password === '12345') {
      try {
        const response = await api.post('/auth/login', { email: cleanEmail, password });
        localStorage.setItem('token', response.data.access_token || 'admin-token-token');
        localStorage.setItem('user_id', response.data.user_id || 'admin_001');
      } catch {
        localStorage.setItem('token', 'admin-token-token');
        localStorage.setItem('user_id', 'admin_001');
      }
      localStorage.setItem('role', 'admin');
      setIsSubmitting(false);
      navigate('/admin');
      return;
    }

    // Try backend authentication
    try {
      const response = await api.post('/auth/login', { email: cleanEmail, password });
      localStorage.setItem('token', response.data.access_token);
      localStorage.setItem('user_id', response.data.user_id);
      localStorage.setItem('role', 'admin');
      setIsSubmitting(false);
      navigate('/admin');
    } catch (err) {
      setError(err.response?.data?.detail || 'Invalid administrator credentials');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-farm-dark relative overflow-hidden text-white">
      {/* Background Decorative Ambient Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full blur-[120px] pointer-events-none bg-cyan-500/15" />
      <div className="absolute bottom-1/4 left-1/3 w-80 h-80 rounded-full blur-[100px] pointer-events-none bg-purple-500/15" />

      {/* Main Glassmorphism Card */}
      <div className="w-full max-w-md bg-[#0a1a0f]/90 backdrop-blur-xl border border-cyan-500/30 rounded-3xl p-8 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.8),0_0_40px_rgba(6,182,212,0.15)] relative z-10 space-y-6">
        
        {/* Header Badge & Title */}
        <div className="text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold mb-3 tracking-wider uppercase border bg-cyan-500/10 border-cyan-500/30 text-cyan-400">
            <Shield className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
            AgroVision AI Admin Portal
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Administrator Login
          </h2>
          <p className="text-gray-400 text-xs mt-1">
            Enter system administrator credentials to access admin dashboard
          </p>
        </div>

        {/* Error Alert Box */}
        {error && (
          <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-sm flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Admin Login Form */}
        <form onSubmit={handleAdminLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2">
              Admin Email
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <Shield className="w-5 h-5 text-cyan-400" />
              </div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nikhilbontha00@gmail.com"
                required
                className="w-full bg-[#06120a]/80 border border-cyan-500/30 rounded-xl pl-11 pr-4 py-3 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/20 transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2">
              Admin Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <Lock className="w-5 h-5 text-cyan-400" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter admin password"
                required
                className="w-full bg-[#06120a]/80 border border-cyan-500/30 rounded-xl pl-11 pr-11 py-3 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/20 transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-cyan-400 transition-colors focus:outline-none"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full mt-2 font-bold py-3.5 px-6 rounded-xl shadow-lg active:scale-[0.99] transition-all disabled:opacity-50 flex items-center justify-center gap-2 text-sm tracking-wide bg-gradient-to-r from-emerald-500 via-cyan-500 to-blue-500 hover:from-emerald-400 hover:to-cyan-400 text-black shadow-cyan-900/40"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin text-current" />
                <span>Authenticating Admin...</span>
              </>
            ) : (
              <>
                <span>Access Admin Control Center</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Footer Link */}
        <div className="pt-4 border-t border-slate-800 text-center space-y-2">
          <Link
            to="/login"
            className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold transition-colors underline underline-offset-4 inline-flex items-center gap-1"
          >
            <User className="w-3.5 h-3.5" />
            Switch to Standard Farmer / User Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
