import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Wheat,
  Activity,
  ScanEye,
  TrendingUp,
  BarChart3,
  Cpu,
  MessageSquare,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Leaf
} from 'lucide-react';
import { useAdmin } from '../context/AdminContext';

const NAV_ITEMS = [
  { name: 'Dashboard', path: '/admin', icon: LayoutDashboard, badge: null },
  { name: 'User Management', path: '/admin/users', icon: Users, badge: null },
  { name: 'Crop Management', path: '/admin/crops', icon: Wheat, badge: null },
  { name: 'Disease Management', path: '/admin/diseases', icon: Activity, badge: null },
  { name: 'Disease Detection', path: '/admin/detections', icon: ScanEye, badge: 'Live' },
  { name: 'Yield Predictions', path: '/admin/predictions', icon: TrendingUp, badge: null },
  { name: 'Analytics', path: '/admin/analytics', icon: BarChart3, badge: null },
  { name: 'ML Model', path: '/admin/model', icon: Cpu, badge: 'v2.4' },
  { name: 'Feedback', path: '/admin/feedback', icon: MessageSquare, badge: null },
  { name: 'Settings', path: '/admin/settings', icon: Settings, badge: null },
];

const AdminSidebar = () => {
  const { sidebarCollapsed, setSidebarCollapsed, mobileSidebarOpen, setMobileSidebarOpen } = useAdmin();
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user_id');
    navigate('/login');
  };

  const sidebarContent = (
    <div className="flex flex-col h-full bg-farm-card border-r border-slate-800 transition-all duration-300">
      {/* Brand Header */}
      <div className="h-16 px-4 flex items-center justify-between border-b border-slate-800">
        <NavLink to="/admin" className="flex items-center gap-3 overflow-hidden">
          <div className="p-2 rounded-xl bg-farm-green/10 border border-farm-green/30 text-farm-green shrink-0">
            <Leaf className="w-6 h-6" />
          </div>
          {!sidebarCollapsed && (
            <div className="flex flex-col">
              <span className="font-extrabold text-base text-white tracking-wider">
                AgroVision <span className="text-farm-green">AI</span>
              </span>
              <span className="text-[10px] text-emerald-400 font-semibold tracking-widest uppercase">
                Admin Control
              </span>
            </div>
          )}
        </NavLink>

        {/* Desktop Collapse Toggle */}
        <button
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          className="hidden md:flex p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          title={sidebarCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
        >
          {sidebarCollapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
        </button>
      </div>

      {/* Navigation List */}
      <div className="flex-1 py-4 px-3 space-y-1 overflow-y-auto custom-scrollbar">
        {NAV_ITEMS.map(item => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/admin'}
              onClick={() => setMobileSidebarOpen(false)}
              className={({ isActive }) =>
                `relative flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-xs transition-all duration-200 group ${
                  isActive
                    ? 'bg-farm-green text-black font-bold shadow-lg shadow-emerald-500/20'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
                }`
              }
            >
              <Icon className="w-5 h-5 shrink-0" />

              {!sidebarCollapsed && (
                <span className="truncate flex-1">{item.name}</span>
              )}

              {!sidebarCollapsed && item.badge && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950 text-emerald-400 border border-emerald-500/30">
                  {item.badge}
                </span>
              )}

              {/* Tooltip for collapsed desktop sidebar */}
              {sidebarCollapsed && (
                <div className="absolute left-full ml-2 px-3 py-1.5 bg-slate-900 text-white text-xs font-semibold rounded-lg shadow-xl opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50 whitespace-nowrap border border-slate-700">
                  {item.name}
                </div>
              )}
            </NavLink>
          );
        })}
      </div>

      {/* Footer / Logout */}
      <div className="p-3 border-t border-slate-800">
        <button
          onClick={handleLogout}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 transition-colors ${
            sidebarCollapsed ? 'justify-center' : ''
          }`}
        >
          <LogOut className="w-5 h-5 shrink-0" />
          {!sidebarCollapsed && <span>Logout</span>}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className={`hidden md:block fixed top-0 left-0 h-screen z-40 transition-all duration-300 ${
          sidebarCollapsed ? 'w-20' : 'w-64'
        }`}
      >
        {sidebarContent}
      </aside>

      {/* Mobile Drawer Backdrop */}
      {mobileSidebarOpen && (
        <div
          onClick={() => setMobileSidebarOpen(false)}
          className="md:hidden fixed inset-0 bg-black/70 backdrop-blur-sm z-40 animate-fade-in"
        />
      )}

      {/* Mobile Sidebar Drawer */}
      <aside
        className={`md:hidden fixed top-0 left-0 h-screen w-72 z-50 transform transition-transform duration-300 ${
          mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {sidebarContent}
      </aside>
    </>
  );
};

export default AdminSidebar;
