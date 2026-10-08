import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { User, Mail, Lock, Phone, MapPin, Eye, EyeOff, Sparkles, AlertCircle, Loader2, ArrowRight } from 'lucide-react';
import api from '../api';

const Register = () => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    location: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    try {
      const response = await api.post('/auth/register', formData);
      localStorage.setItem('token', response.data.access_token);
      localStorage.setItem('user_id', response.data.user_id);
      navigate('/dashboard');
      window.location.reload();
    } catch (err) {
      setError(err.response?.data?.detail || t('err_invalid'));
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12 relative overflow-hidden">
      {/* Ambient Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/3 w-80 h-80 bg-green-500/10 rounded-full blur-[100px] pointer-events-none" />

      {/* Main Card */}
      <div className="w-full max-w-md bg-[#0a1a0f]/85 backdrop-blur-xl border border-emerald-500/20 rounded-3xl p-8 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.7),0_0_40px_rgba(34,197,94,0.12)] transition-all duration-300 relative z-10 animate-in fade-in zoom-in-95 duration-500">
        
        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold mb-3 tracking-wider uppercase">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400 animate-pulse" /> AgroVision AI
          </div>
          <h2 className="text-3xl font-extrabold text-white tracking-tight">{t('register_title')}</h2>
          <p className="text-gray-400 text-sm mt-1">Create your smart farming account</p>
        </div>

        {/* Error Alert Box */}
        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-sm flex items-center gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleRegister} className="space-y-4">
          {/* Full Name */}
          <div>
            <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1.5">
              {t('full_name')}
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                <User className="w-5 h-5 text-emerald-500/70" />
              </div>
              <input
                type="text"
                name="name"
                onChange={handleChange}
                required
                placeholder={t('enter_name')}
                className="w-full bg-[#06120a]/80 border border-emerald-500/20 rounded-xl pl-11 pr-4 py-2.5 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all duration-200"
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1.5">
              {t('email')}
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                <Mail className="w-5 h-5 text-emerald-500/70" />
              </div>
              <input
                type="email"
                name="email"
                onChange={handleChange}
                required
                placeholder={t('enter_email')}
                onInvalid={(e) => e.target.setCustomValidity(t('err_email_req'))}
                onInput={(e) => e.target.setCustomValidity('')}
                className="w-full bg-[#06120a]/80 border border-emerald-500/20 rounded-xl pl-11 pr-4 py-2.5 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all duration-200"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1.5">
              {t('password')}
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                <Lock className="w-5 h-5 text-emerald-500/70" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                onChange={handleChange}
                required
                placeholder={t('enter_password')}
                onInvalid={(e) => e.target.setCustomValidity(t('err_pass_req'))}
                onInput={(e) => e.target.setCustomValidity('')}
                className="w-full bg-[#06120a]/80 border border-emerald-500/20 rounded-xl pl-11 pr-11 py-2.5 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all duration-200"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-emerald-400 transition-colors focus:outline-none"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Phone */}
          <div>
            <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1.5">
              {t('phone_opt')}
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                <Phone className="w-5 h-5 text-emerald-500/70" />
              </div>
              <input
                type="tel"
                name="phone"
                onChange={handleChange}
                placeholder={t('enter_phone')}
                className="w-full bg-[#06120a]/80 border border-emerald-500/20 rounded-xl pl-11 pr-4 py-2.5 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all duration-200"
              />
            </div>
          </div>

          {/* Location */}
          <div>
            <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1.5">
              {t('location_opt')}
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                <MapPin className="w-5 h-5 text-emerald-500/70" />
              </div>
              <input
                type="text"
                name="location"
                onChange={handleChange}
                placeholder={t('enter_location')}
                className="w-full bg-[#06120a]/80 border border-emerald-500/20 rounded-xl pl-11 pr-4 py-2.5 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all duration-200"
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full mt-3 bg-gradient-to-r from-emerald-600 to-green-500 hover:from-emerald-500 hover:to-green-400 text-white font-bold py-3 px-6 rounded-xl shadow-lg shadow-emerald-900/40 hover:shadow-emerald-700/50 active:scale-[0.99] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 group text-sm tracking-wide"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin text-white" />
                <span>Creating Account...</span>
              </>
            ) : (
              <>
                <span>{t('register_btn')}</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </>
            )}
          </button>
        </form>

        {/* Footer */}
        <div className="mt-6 pt-5 border-t border-emerald-500/10 text-center">
          <p className="text-xs text-gray-400">
            {t('has_account')}{' '}
            <Link
              to="/login"
              className="text-emerald-400 hover:text-emerald-300 font-semibold transition-colors underline underline-offset-4"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
