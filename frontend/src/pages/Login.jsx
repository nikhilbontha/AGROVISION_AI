import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import api from '../api';

const Login = () => {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post('/auth/login', { email, password });
      localStorage.setItem('token', response.data.access_token);
      localStorage.setItem('user_id', response.data.user_id);
      navigate('/dashboard');
      // trigger page reload to update navbar state
      window.location.reload();
    } catch (err) {
      setError(err.response?.data?.detail === "Incorrect email or password" ? t('err_invalid') : err.response?.data?.detail || t('err_invalid'));
    }
  };

  return (
    <div className="flex justify-center items-center h-[80vh]">
      <div className="bg-farm-light/10 backdrop-blur-md p-8 rounded-xl shadow-lg w-full max-w-md border border-farm-light/20">
        <h2 className="text-3xl font-bold mb-6 text-center text-farm-primary">{t('login_title')}</h2>
        {error && <div className="bg-red-500/20 border border-red-500 text-red-100 p-3 rounded mb-4">{error}</div>}
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">{t('email')}</label>
            <input 
              type="email" 
              className="w-full bg-farm-dark/50 border border-farm-light/30 rounded p-2 text-white focus:outline-none focus:border-farm-primary"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t('enter_email')}
              required 
              onInvalid={(e) => e.target.setCustomValidity(t('err_email_req'))}
              onInput={(e) => e.target.setCustomValidity('')}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">{t('password')}</label>
            <input 
              type="password" 
              className="w-full bg-farm-dark/50 border border-farm-light/30 rounded p-2 text-white focus:outline-none focus:border-farm-primary"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={t('enter_password')}
              required 
              onInvalid={(e) => e.target.setCustomValidity(t('err_pass_req'))}
              onInput={(e) => e.target.setCustomValidity('')}
            />
          </div>
          <button 
            type="submit" 
            className="w-full bg-farm-primary hover:bg-farm-secondary text-white font-bold py-2 px-4 rounded transition-colors"
          >
            {t('login_btn')}
          </button>
        </form>
        <p className="mt-4 text-center text-sm text-gray-300">
          <Link to="/register" className="text-farm-primary hover:underline">{t('no_account')}</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
