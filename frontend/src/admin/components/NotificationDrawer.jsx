import React from 'react';
import { useAdmin } from '../context/AdminContext';
import { Bell, CheckCheck, Trash2, Info, AlertTriangle, CheckCircle } from 'lucide-react';

const NotificationDrawer = ({ isOpen, onClose }) => {
  const { notifications, markAllNotificationsRead, clearNotification } = useAdmin();

  if (!isOpen) return null;

  return (
    <div className="absolute right-0 mt-3 w-80 sm:w-96 bg-farm-card/95 backdrop-blur-xl border border-slate-700 rounded-2xl shadow-2xl py-3 z-50 overflow-hidden animate-slide-down">
      <div className="px-4 py-2 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bell className="w-4 h-4 text-farm-green" />
          <span className="font-bold text-sm text-white">Notifications</span>
        </div>
        <button
          onClick={markAllNotificationsRead}
          className="text-xs text-farm-green hover:underline flex items-center gap-1 font-medium"
        >
          <CheckCheck className="w-3.5 h-3.5" /> Mark all read
        </button>
      </div>

      <div className="max-h-80 overflow-y-auto custom-scrollbar divide-y divide-slate-800/60">
        {notifications.length === 0 ? (
          <div className="p-6 text-center text-xs text-slate-400">
            No notifications at this time.
          </div>
        ) : (
          notifications.map(item => (
            <div
              key={item.id}
              className={`p-4 flex items-start gap-3 transition-colors ${
                item.unread ? 'bg-slate-800/40' : 'hover:bg-slate-800/20'
              }`}
            >
              <div className="mt-0.5">
                {item.type === 'warning' ? (
                  <AlertTriangle className="w-4 h-4 text-amber-400" />
                ) : item.type === 'success' ? (
                  <CheckCircle className="w-4 h-4 text-emerald-400" />
                ) : (
                  <Info className="w-4 h-4 text-cyan-400" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-1">
                  <h4 className="text-xs font-semibold text-white truncate">{item.title}</h4>
                  <span className="text-[10px] text-slate-500">{item.time}</span>
                </div>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">{item.message}</p>
              </div>
              <button
                onClick={() => clearNotification(item.id)}
                className="text-slate-500 hover:text-rose-400 p-1"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default NotificationDrawer;
