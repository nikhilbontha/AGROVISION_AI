import React, { useState } from 'react';
import { Settings, Shield, Lock, Bell, Server, Cpu, Check, Save } from 'lucide-react';
import { useAdmin } from '../context/AdminContext';

const AdminSettings = () => {
  const { addToast } = useAdmin();
  const [activeTab, setActiveTab] = useState('profile');

  // Form states
  const [profile, setProfile] = useState({
    name: 'Admin User',
    email: 'admin@agrovision.ai',
    role: 'Super Administrator',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'
  });

  const [passwords, setPasswords] = useState({
    current: '',
    newPass: '',
    confirmPass: ''
  });

  const [systemConfig, setSystemConfig] = useState({
    maintenanceMode: false,
    emailAlerts: true,
    autoBackup: true,
    confidenceThreshold: 85,
    maxImageSizeMB: 10,
    modelAutoUpdate: true
  });

  const handleSaveProfile = (e) => {
    e.preventDefault();
    addToast('Admin profile details updated successfully!');
  };

  const handleSavePassword = (e) => {
    e.preventDefault();
    if (passwords.newPass !== passwords.confirmPass) {
      addToast('New passwords do not match!', 'error');
      return;
    }
    addToast('Admin password changed successfully!');
    setPasswords({ current: '', newPass: '', confirmPass: '' });
  };

  const handleSaveSystem = (e) => {
    e.preventDefault();
    addToast('System preferences saved successfully!');
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Settings className="w-6 h-6 text-farm-green" /> Admin System Settings
          </h2>
          <p className="text-xs text-slate-400">Configure administrative credentials, security rules, and system parameters</p>
        </div>
      </div>

      {/* Tabs Row */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
        {[
          { id: 'profile', label: 'Admin Profile', icon: Shield },
          { id: 'security', label: 'Security & Password', icon: Lock },
          { id: 'system', label: 'System Configuration', icon: Server }
        ].map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === tab.id
                  ? 'bg-farm-green text-black shadow-lg shadow-emerald-500/20'
                  : 'bg-farm-card text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              <Icon className="w-4 h-4" /> {tab.label}
            </button>
          );
        })}
      </div>

      {/* 1. Admin Profile Tab */}
      {activeTab === 'profile' && (
        <div className="bg-farm-card/90 backdrop-blur-md rounded-2xl p-6 border border-slate-800 shadow-xl max-w-2xl">
          <form onSubmit={handleSaveProfile} className="space-y-5 text-xs">
            <div className="flex items-center gap-4 pb-4 border-b border-slate-800">
              <div className="w-16 h-16 rounded-2xl overflow-hidden border-2 border-farm-green shadow-xl">
                <img src={profile.avatar} alt="Admin Avatar" className="w-full h-full object-cover" />
              </div>
              <div>
                <h4 className="text-base font-bold text-white">{profile.name}</h4>
                <span className="text-xs text-emerald-400 font-semibold">{profile.role}</span>
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-300 mb-1">Full Admin Name</label>
              <input
                type="text"
                value={profile.name}
                onChange={e => setProfile({ ...profile, name: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-farm-dark border border-slate-700 rounded-xl text-white focus:border-farm-green focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-300 mb-1">Admin Email Address</label>
              <input
                type="email"
                value={profile.email}
                onChange={e => setProfile({ ...profile, email: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-farm-dark border border-slate-700 rounded-xl text-white focus:border-farm-green focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-300 mb-1">Role / Permissions</label>
              <input
                type="text"
                disabled
                value={profile.role}
                className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-slate-400 cursor-not-allowed"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="flex items-center gap-2 px-5 py-2.5 bg-farm-green text-black font-bold rounded-xl text-xs shadow-lg shadow-emerald-500/20"
              >
                <Save className="w-4 h-4" /> Save Profile Details
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 2. Security & Password Tab */}
      {activeTab === 'security' && (
        <div className="bg-farm-card/90 backdrop-blur-md rounded-2xl p-6 border border-slate-800 shadow-xl max-w-2xl">
          <form onSubmit={handleSavePassword} className="space-y-4 text-xs">
            <h3 className="text-base font-bold text-white mb-2">Change Administrator Password</h3>

            <div>
              <label className="block font-semibold text-slate-300 mb-1">Current Password</label>
              <input
                type="password"
                required
                value={passwords.current}
                onChange={e => setPasswords({ ...passwords, current: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-farm-dark border border-slate-700 rounded-xl text-white focus:border-farm-green focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-300 mb-1">New Password</label>
              <input
                type="password"
                required
                value={passwords.newPass}
                onChange={e => setPasswords({ ...passwords, newPass: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-farm-dark border border-slate-700 rounded-xl text-white focus:border-farm-green focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-300 mb-1">Confirm New Password</label>
              <input
                type="password"
                required
                value={passwords.confirmPass}
                onChange={e => setPasswords({ ...passwords, confirmPass: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-farm-dark border border-slate-700 rounded-xl text-white focus:border-farm-green focus:outline-none"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="flex items-center gap-2 px-5 py-2.5 bg-farm-green text-black font-bold rounded-xl text-xs shadow-lg shadow-emerald-500/20"
              >
                <Lock className="w-4 h-4" /> Update Admin Password
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 3. System Configuration Tab */}
      {activeTab === 'system' && (
        <div className="bg-farm-card/90 backdrop-blur-md rounded-2xl p-6 border border-slate-800 shadow-xl max-w-2xl">
          <form onSubmit={handleSaveSystem} className="space-y-5 text-xs">
            <h3 className="text-base font-bold text-white mb-2">Platform Application Parameters</h3>

            <div className="flex items-center justify-between p-3.5 rounded-xl bg-farm-dark border border-slate-800">
              <div>
                <span className="font-bold text-white block">System Maintenance Mode</span>
                <span className="text-[11px] text-slate-400">Temporarily pause public farmer scans for system upgrade</span>
              </div>
              <input
                type="checkbox"
                checked={systemConfig.maintenanceMode}
                onChange={e => setSystemConfig({ ...systemConfig, maintenanceMode: e.target.checked })}
                className="w-5 h-5 accent-emerald-500 cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between p-3.5 rounded-xl bg-farm-dark border border-slate-800">
              <div>
                <span className="font-bold text-white block">Automated Email System Alerts</span>
                <span className="text-[11px] text-slate-400">Notify admins when disease outbreaks spike in a region</span>
              </div>
              <input
                type="checkbox"
                checked={systemConfig.emailAlerts}
                onChange={e => setSystemConfig({ ...systemConfig, emailAlerts: e.target.checked })}
                className="w-5 h-5 accent-emerald-500 cursor-pointer"
              />
            </div>

            <div className="p-3.5 rounded-xl bg-farm-dark border border-slate-800 space-y-2">
              <label className="font-bold text-white block">Minimum Confidence Filter Threshold (%)</label>
              <input
                type="number"
                min={50}
                max={99}
                value={systemConfig.confidenceThreshold}
                onChange={e => setSystemConfig({ ...systemConfig, confidenceThreshold: Number(e.target.value) })}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white font-mono focus:border-farm-green focus:outline-none"
              />
              <span className="text-[10px] text-slate-400">Scans below this score trigger manual expert review flag</span>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="flex items-center gap-2 px-5 py-2.5 bg-farm-green text-black font-bold rounded-xl text-xs shadow-lg shadow-emerald-500/20"
              >
                <Save className="w-4 h-4" /> Save System Preferences
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default AdminSettings;
