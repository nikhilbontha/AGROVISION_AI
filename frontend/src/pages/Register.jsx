import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
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
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post('/auth/register', formData);
      localStorage.setItem('token', response.data.access_token);
      localStorage.setItem('user_id', response.data.user_id);
      navigate('/dashboard');
      window.location.reload();
    } catch (err) {
      setError(err.response?.data?.detail || t('err_invalid'));
    }
  };

  return (
    <div className="flex justify-center items-center h-[80vh] my-10">
      <div className="bg-farm-light/10 backdrop-blur-md p-8 rounded-xl shadow-lg w-full max-w-md border border-farm-light/20">
        <h2 className="text-3xl font-bold mb-6 text-center text-farm-primary">{t('register_title')}</h2>
        {error && <div className="bg-red-500/20 border border-red-500 text-red-100 p-3 rounded mb-4">{error}</div>}
        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">{t('full_name')}</label>
            <input type="text" name="name" onChange={handleChange} required 
              placeholder={t('enter_name')}
              className="w-full bg-farm-dark/50 border border-farm-light/30 rounded p-2 text-white focus:outline-none focus:border-farm-primary" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">{t('email')}</label>
            <input type="email" name="email" onChange={handleChange} required 
              placeholder={t('enter_email')}
              onInvalid={(e) => e.target.setCustomValidity(t('err_email_req'))}
              onInput={(e) => e.target.setCustomValidity('')}
              className="w-full bg-farm-dark/50 border border-farm-light/30 rounded p-2 text-white focus:outline-none focus:border-farm-primary" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">{t('password')}</label>
            <input type="password" name="password" onChange={handleChange} required 
              placeholder={t('enter_password')}
              onInvalid={(e) => e.target.setCustomValidity(t('err_pass_req'))}
              onInput={(e) => e.target.setCustomValidity('')}
              className="w-full bg-farm-dark/50 border border-farm-light/30 rounded p-2 text-white focus:outline-none focus:border-farm-primary" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">{t('phone_opt')}</label>
            <input type="tel" name="phone" onChange={handleChange} 
              placeholder={t('enter_phone')}
              className="w-full bg-farm-dark/50 border border-farm-light/30 rounded p-2 text-white focus:outline-none focus:border-farm-primary" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">{t('location_opt')}</label>
            <input type="text" name="location" onChange={handleChange} 
              placeholder={t('enter_location')}
              className="w-full bg-farm-dark/50 border border-farm-light/30 rounded p-2 text-white focus:outline-none focus:border-farm-primary" />
          </div>
          <button type="submit" className="w-full bg-farm-primary hover:bg-farm-secondary text-white font-bold py-2 px-4 rounded transition-colors mt-4">
            {t('register_btn')}
          </button>
        </form>
        <p className="mt-4 text-center text-sm text-gray-300">
          <Link to="/login" className="text-farm-primary hover:underline">{t('has_account')}</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
