import React, { createContext, useContext, useState, useEffect } from 'react';

const AdminContext = createContext();

export const AdminProvider = ({ children }) => {
  const [globalSearch, setGlobalSearch] = useState('');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [notifications, setNotifications] = useState([
    { id: 1, title: 'High Disease Outbreak', message: 'Tomato Early Blight detected in 15 Guntur scans today', time: '10m ago', unread: true, type: 'warning' },
    { id: 2, title: 'New Model Version Ready', message: 'Model v2.5.0 evaluated with 97.1% validation accuracy', time: '1h ago', unread: true, type: 'info' },
    { id: 3, title: 'System Backup Complete', message: 'Automated database and image storage snapshot completed', time: '3h ago', unread: false, type: 'success' },
    { id: 4, title: 'User Milestone Reached', message: 'AgroVision AI surpassed 1,500 registered farmers', time: '1d ago', unread: false, type: 'success' }
  ]);

  const [toasts, setToasts] = useState([]);

  const addToast = (message, type = 'success') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const markAllNotificationsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, unread: false })));
  };

  const clearNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const unreadCount = notifications.filter(n => n.unread).length;

  return (
    <AdminContext.Provider
      value={{
        globalSearch,
        setGlobalSearch,
        sidebarCollapsed,
        setSidebarCollapsed,
        mobileSidebarOpen,
        setMobileSidebarOpen,
        notifications,
        unreadCount,
        markAllNotificationsRead,
        clearNotification,
        toasts,
        addToast,
        removeToast
      }}
    >
      {children}
      {/* Toast Notification Container */}
      <div className="fixed bottom-5 right-5 z-[9999] flex flex-col gap-2 pointer-events-none">
        {toasts.map(toast => (
          <div
            key={toast.id}
            className={`pointer-events-auto min-w-[280px] max-w-md px-4 py-3 rounded-xl shadow-2xl border flex items-center justify-between gap-3 text-sm font-medium backdrop-blur-md transition-all duration-300 animate-slide-up ${
              toast.type === 'error'
                ? 'bg-rose-950/90 border-rose-500/50 text-rose-200'
                : toast.type === 'warning'
                ? 'bg-amber-950/90 border-amber-500/50 text-amber-200'
                : 'bg-emerald-950/90 border-emerald-500/50 text-emerald-200'
            }`}
          >
            <span>{toast.message}</span>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-slate-400 hover:text-white text-xs px-1.5 py-0.5 rounded bg-white/10"
            >
              ✕
            </button>
          </div>
        ))}
      </div>
    </AdminContext.Provider>
  );
};

export const useAdmin = () => useContext(AdminContext);
