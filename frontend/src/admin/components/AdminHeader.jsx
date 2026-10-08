import React, { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { Search, Bell, Menu, User, Shield, LogOut, Settings } from 'lucide-react';
import { useAdmin } from '../context/AdminContext';
import NotificationDrawer from './NotificationDrawer';

const PAGE_TITLES = {
  '/admin': 'Admin Overview Dashboard',
  '/admin/users': 'User Management',
  '/admin/crops': 'Crop Management',
  '/admin/diseases': 'Disease Management',
  '/admin/detections': 'Disease Detection Records',
  '/admin/predictions': 'Yield Prediction Management',
  '/admin/analytics': 'Dedicated System Analytics',
  '/admin/model': 'ML Model Management',
  '/admin/feedback': 'Feedback & Issues',
  '/admin/settings': 'Admin System Settings'
};

const AdminHeader = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { globalSearch, setGlobalSearch, unreadCount, setMobileSidebarOpen } = useAdmin();

  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const notifRef = useRef(null);
  const profileRef = useRef(null);

  const pageTitle = PAGE_TITLES[location.pathname] || 'Admin Portal';

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setIsNotificationsOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user_id');
    navigate('/login');
  };

  return (
    <header className="h-16 px-4 sm:px-6 bg-farm-card/90 backdrop-blur-md border-b border-slate-800 sticky top-0 z-30 flex items-center justify-between gap-4">
      {/* Left: Mobile Menu Toggle + Page Title */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={() => setMobileSidebarOpen(true)}
          className="md:hidden p-2 rounded-xl text-slate-300 hover:text-white bg-farm-dark border border-slate-800"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div>
          <h1 className="text-base sm:text-lg font-bold text-white tracking-tight truncate">
            {pageTitle}
          </h1>
          <p className="hidden sm:block text-[11px] text-slate-400">
            Real-time Monitoring & Administration
          </p>
        </div>
      </div>

      {/* Right: Search, Notifications, Profile Dropdown */}
      <div className="flex items-center gap-3">
        {/* Quick Search */}
        <div className="relative hidden sm:block w-48 md:w-64">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search admin portal..."
            value={globalSearch}
            onChange={(e) => setGlobalSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 bg-farm-dark border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-farm-green transition-colors"
          />
        </div>

        {/* Notifications */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
            className="relative p-2 rounded-xl bg-farm-dark border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700 transition-colors"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 text-black font-extrabold text-[10px] rounded-full flex items-center justify-center animate-pulse">
                {unreadCount}
              </span>
            )}
          </button>

          <NotificationDrawer
            isOpen={isNotificationsOpen}
            onClose={() => setIsNotificationsOpen(false)}
          />
        </div>

        {/* Admin Profile */}
        <div className="relative" ref={profileRef}>
          <button
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="flex items-center gap-2.5 p-1.5 pl-2.5 rounded-full sm:rounded-xl bg-farm-dark border border-slate-800 hover:border-slate-700 transition-all"
          >
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center font-bold text-xs">
              <Shield className="w-4 h-4" />
            </div>
            <div className="hidden md:flex flex-col text-left">
              <span className="text-xs font-bold text-white leading-none">Admin User</span>
              <span className="text-[10px] text-emerald-400 font-semibold leading-tight">Super Administrator</span>
            </div>
          </button>

          {isProfileOpen && (
            <div className="absolute right-0 mt-3 w-52 bg-farm-card border border-slate-700 rounded-2xl shadow-2xl py-2 z-50 overflow-hidden animate-slide-down">
              <div className="px-4 py-2.5 border-b border-slate-800">
                <p className="text-xs font-bold text-white">System Administrator</p>
                <p className="text-[11px] text-slate-400 truncate">admin@agrovision.ai</p>
              </div>

              <div className="py-1">
                <Link
                  to="/admin/settings"
                  onClick={() => setIsProfileOpen(false)}
                  className="w-full text-left px-4 py-2.5 text-xs text-slate-300 hover:bg-slate-800 hover:text-white flex items-center gap-2.5 transition-colors"
                >
                  <Settings className="w-4 h-4 text-slate-400" /> Account Settings
                </Link>
                <Link
                  to="/"
                  onClick={() => setIsProfileOpen(false)}
                  className="w-full text-left px-4 py-2.5 text-xs text-slate-300 hover:bg-slate-800 hover:text-white flex items-center gap-2.5 transition-colors"
                >
                  <User className="w-4 h-4 text-slate-400" /> Switch to Farmer Portal
                </Link>
                <button
                  onClick={() => { handleLogout(); setIsProfileOpen(false); }}
                  className="w-full text-left px-4 py-2.5 text-xs text-rose-400 hover:bg-rose-500/10 flex items-center gap-2.5 transition-colors border-t border-slate-800/80 mt-1"
                >
                  <LogOut className="w-4 h-4" /> Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;
