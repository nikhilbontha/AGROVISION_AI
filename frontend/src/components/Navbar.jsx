import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Leaf, Activity, BarChart3, Home, LogIn, LogOut, User, UserPlus, Globe } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '../context/LanguageContext';
import api from "../api";

const Navbar = () => {
  const { t, language, changeLanguage } = useLanguage();
  const location = useLocation();
  const navigate = useNavigate();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const dropdownRef = useRef(null);

  const isLoggedIn = !!localStorage.getItem('token');

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user_id');
    navigate('/login');
    window.location.reload();
  };

  const handleLanguageChange = async (lng) => {
    changeLanguage(lng);
    
    // Save to backend if user is logged in
    const token = localStorage.getItem('token');
    if (token) {
      try {
        await api.put('/auth/language', { language: lng });
      } catch (error) {
        console.error("Failed to update language on backend:", error);
      }
    }
  };

  // Close dropdown if clicked outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownRef]);

  const links = [
    { name: t('nav.home'), path: '/', icon: <Home className="w-5 h-5" /> },
    { name: t('nav.disease'), path: '/disease-detection', icon: <Activity className="w-5 h-5" /> },
    { name: t('nav.yield'), path: '/yield-prediction', icon: <Leaf className="w-5 h-5" /> },
    { name: t('nav.dashboard'), path: '/dashboard', icon: <BarChart3 className="w-5 h-5" /> },
  ];

  return (
    <nav className="bg-farm-card shadow-lg sticky top-0 z-50">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* LEFT: Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-2">
              <Leaf className="w-8 h-8 text-farm-green" />
              <span className="font-bold text-xl text-white tracking-wider">AgroVision <span className="text-farm-green">AI</span></span>
            </Link>
          </div>

          {/* RIGHT: Navigation Links & Profile */}
          <div className="flex items-center gap-6">
            <div className="hidden md:flex items-center space-x-2">
              {links.map((link) => {
                const isActive = location.pathname === link.path;
                return (
                  <Link
                    key={link.name}
                    to={link.path}
                    className={`relative flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      isActive ? 'text-farm-green' : 'text-gray-300 hover:text-white hover:bg-gray-800'
                    }`}
                  >
                    {link.icon}
                    {link.name}
                    {isActive && (
                      <motion.div
                        layoutId="navbar-indicator"
                        className="absolute bottom-0 left-0 right-0 h-0.5 bg-farm-green"
                        initial={false}
                      />
                    )}
                  </Link>
                );
              })}
            </div>
            
            {/* Profile Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button 
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center justify-center p-2 rounded-full bg-gray-800 border border-gray-700 text-gray-300 hover:text-farm-green hover:border-farm-green transition-all"
              >
                <User className="w-5 h-5" />
              </button>

              <AnimatePresence>
                {isProfileOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute right-0 mt-3 w-48 bg-farm-card rounded-xl shadow-2xl py-2 border border-gray-700 z-50 overflow-hidden"
                  >
                    <div className="px-4 py-2 border-b border-gray-700">
                      <div className="text-xs text-gray-500 font-bold mb-2 flex items-center gap-1">
                        <Globe className="w-3 h-3" /> {t('nav.language')}
                      </div>
                      <div className="flex justify-between items-center bg-farm-dark rounded-lg p-1">
                        <button 
                          onClick={() => handleLanguageChange('en')}
                          className={`flex-1 text-center py-1 rounded-md text-sm transition-colors ${language === 'en' ? 'bg-farm-green text-black font-bold' : 'text-gray-400 hover:text-white'}`}
                        >
                          EN
                        </button>
                        <button 
                          onClick={() => handleLanguageChange('te')}
                          className={`flex-1 text-center py-1 rounded-md text-sm transition-colors ${language === 'te' ? 'bg-farm-green text-black font-bold' : 'text-gray-400 hover:text-white'}`}
                        >
                          తెలుగు
                        </button>
                      </div>
                    </div>

                    <div className="py-1">
                      {isLoggedIn ? (
                        <>
                          <button 
                            onClick={() => { setIsProfileOpen(false); navigate('/dashboard', { state: { activeTab: 'profile' } }); }}
                            className="w-full text-left px-4 py-3 text-sm text-gray-300 hover:bg-farm-dark hover:text-white flex items-center gap-3 transition-colors"
                          >
                            <User className="w-4 h-4" /> {t('nav.my_farmer_profile')}
                          </button>
                          <button 
                            onClick={() => { handleLogout(); setIsProfileOpen(false); }}
                            className="w-full text-left px-4 py-3 text-sm text-red-400 hover:bg-red-500/10 flex items-center gap-3 transition-colors border-t border-gray-700/50"
                          >
                            <LogOut className="w-4 h-4" /> {t('nav.logout')}
                          </button>
                        </>
                      ) : (
                        <>
                          <Link 
                            to="/login"
                            onClick={() => setIsProfileOpen(false)}
                            className="px-4 py-3 text-sm text-gray-300 hover:bg-farm-dark hover:text-farm-green flex items-center gap-3 transition-colors"
                          >
                            <LogIn className="w-4 h-4" /> {t('nav.login')}
                          </Link>
                          <Link 
                            to="/register"
                            onClick={() => setIsProfileOpen(false)}
                            className="px-4 py-3 text-sm text-gray-300 hover:bg-farm-dark hover:text-farm-green flex items-center gap-3 transition-colors"
                          >
                            <UserPlus className="w-4 h-4" /> {t('register')}
                          </Link>
                        </>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
