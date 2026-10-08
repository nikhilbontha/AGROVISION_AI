import React, { useState, useEffect } from 'react';
import {
  Search, Bell, Plus, LayoutDashboard, Component, Map, Leaf, CloudSun,
  Droplets, Tractor, FileText, AlertCircle, Settings, Sparkles, ChevronDown,
  ArrowUpRight, ArrowDownRight, Wind, Droplet, ThermometerSun, Check, ChevronRight,
  TrendingUp, TrendingDown, Clock, Activity, PieChart as PieChartIcon, IndianRupee,
  Sun, Cloud, CloudRain, Snowflake, CloudLightning, Loader2, Edit, Trash2, Camera, Save, Play, Square, Settings2,
  User, LogOut, ChevronLeft, X
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip,
  ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, Legend, BarChart, Bar
} from 'recharts';
import api from '../api';
import { useNavigate, useLocation } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';

const COLORS = ['#fbbf24', '#22c55e', '#a3e635', '#2563eb', '#9ca3af'];
const SOIL_MOISTURE_DATA = [
  { day: 'Jun 14', actual: 45, forecast: 45 },
  { day: 'Jun 16', actual: 40, forecast: 42 },
  { day: 'Jun 18', actual: 75, forecast: 70 },
  { day: 'Jun 20', actual: 52, forecast: 65 },
  { day: 'Jun 22', actual: null, forecast: 60 },
  { day: 'Jun 24', actual: null, forecast: 68 },
  { day: 'Jun 26', actual: null, forecast: 62 },
];

const WEATHER_DAYS = [
  { day: 'Sun', icon: <CloudSun className="w-5 h-5 text-gray-300" />, temp: '21°/14°' },
  { day: 'Mon', icon: <CloudSun className="w-5 h-5 text-yellow-400" />, temp: '22°/15°' },
  { day: 'Tue', icon: <CloudSun className="w-5 h-5 text-yellow-400" />, temp: '24°/16°' },
  { day: 'Wed', icon: <Droplets className="w-5 h-5 text-blue-400" />, temp: '23°/15°' },
  { day: 'Thu', icon: <CloudSun className="w-5 h-5 text-gray-300" />, temp: '25°/17°' },
];

export default function Dashboard() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const userId = localStorage.getItem('user_id');

  const [loading, setLoading] = useState(true);
  const [userInfo, setUserInfo] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [stats, setStats] = useState(null);

  const [recentYield, setRecentYield] = useState([]);
  const [diseaseHistory, setDiseaseHistory] = useState([]);
  const [monthlyProfitData, setMonthlyProfitData] = useState([]);

  const location = useLocation();
  const [activeTab, setActiveTab] = useState(location.state?.activeTab || 'Dashboard');
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [dateDropdownOpen, setDateDropdownOpen] = useState(false);
  const [selectedDateRange, setSelectedDateRange] = useState('Jun 20 - Jun 26, 2024');

  useEffect(() => {
    if (location.state?.activeTab) {
      setActiveTab(location.state.activeTab);
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  useEffect(() => {
    if (!userId) { navigate('/login'); return; }

    // Convert text selection to explicit day range
    let daysParam = '';
    if (selectedDateRange.includes('7')) daysParam = '?days=7';
    else if (selectedDateRange.includes('30') || selectedDateRange.includes('Month')) daysParam = '?days=30';
    else if (selectedDateRange.includes('Custom')) {
      try {
        const dateStr = selectedDateRange.split('Custom: ')[1];
        if (dateStr) {
          const selectedDate = new Date(dateStr);
          const diffTime = Math.abs(new Date() - selectedDate);
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          daysParam = `?days=${diffDays}`;
        }
      } catch (e) { }
    }

    const fetchData = async () => {
      try {
        const [statsRes, userRes, analyticsRes, recentYieldRes, diseaseHistRes, profitRes] = await Promise.all([
          api.get(`/dashboard/stats${daysParam}`),
          api.get('/auth/me'),
          api.get(`/dashboard/analytics${daysParam}`),
          api.get('/dashboard/recent-yield'),
          api.get('/dashboard/recent-disease'),
          api.get('/dashboard/profit-analysis')
        ]);
        setStats(statsRes.data);
        setUserInfo(userRes.data);
        setAnalytics(analyticsRes.data);
        setRecentYield(recentYieldRes.data || []);
        setDiseaseHistory(diseaseHistRes.data || []);
        setMonthlyProfitData(profitRes.data || []);
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    };
    fetchData();
  }, [userId, navigate, selectedDateRange]);

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-screen bg-[#07130a] gap-4 w-full fixed inset-0 z-50">
        <div className="w-14 h-14 border-4 border-[#22c55e] border-t-transparent rounded-full animate-spin" />
        <p className="text-[#22c55e] font-semibold tracking-widest uppercase text-sm animate-pulse">Initializing Farm AI...</p>
      </div>
    );
  }

  const firstName = userInfo?.name?.split(' ')[0] || 'Farmer';
  const savedAvatar = userInfo?.avatar || '';
  const globalAvatar = savedAvatar || `https://ui-avatars.com/api/?name=${firstName}&background=ea580c&color=fff`;
  const cropDist = analytics?.diseaseDistribution?.length > 0 ? analytics.diseaseDistribution : [
    { name: 'Wheat', value: 45.2, percentage: '36%' },
    { name: 'Corn', value: 32.8, percentage: '26%' },
    { name: 'Soybean', value: 25.6, percentage: '20%' },
    { name: 'Barley', value: 12.5, percentage: '10%' },
    { name: 'Other', value: 9.5, percentage: '8%' },
  ];

  return (
    <div className="flex bg-[#061009] text-gray-200 overflow-hidden font-sans h-full w-full">

      {/* ─── SIDEBAR ──────────────────────────────────────────────────────── */}
      <aside className="w-[260px] flex-shrink-0 flex flex-col border-r border-white/5 bg-[#0a1a0f] p-5 hidden md:flex z-20">

        {/* Brand */}
        <div className="flex flex-col gap-6 mb-10 px-2">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/')}>
            <div className="w-8 h-8 flex items-center justify-center rounded-xl bg-gradient-to-br from-green-400 to-green-600 shadow-[0_0_15px_rgba(34,197,94,0.3)]">
              <Leaf className="w-4 h-4 text-[#061009]" />
            </div>
            <span className="font-bold text-lg text-white tracking-wide">{t('nav.brand') || 'Agriculture AI'}</span>
          </div>
          <button
            onClick={() => {
              if (activeTab !== 'Dashboard') {
                setActiveTab('Dashboard');
              } else {
                navigate(-1);
              }
            }}
            className="flex items-center justify-center gap-1.5 w-fit px-4 py-1.5 rounded-xl bg-gradient-to-br from-green-400 to-green-600 shadow-[0_0_15px_rgba(34,197,94,0.3)] text-[#061009] font-bold text-sm hover:scale-105 transition-transform"
          >
            <ChevronLeft className="w-4 h-4" />
            {t('nav.back') || 'Back'}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1.5 custom-scrollbar-hide overflow-y-auto pr-1">
          <NavItem icon={<LayoutDashboard size={18} />} label={t('nav.dashboard') || 'Dashboard'} active={activeTab === 'Dashboard'} onClick={() => setActiveTab('Dashboard')} />
          <NavItem icon={<Component size={18} />} label={t('nav.crop_management') || 'Crop Management'} active={activeTab === 'Crop Management'} onClick={() => setActiveTab('Crop Management')} />
          <NavItem icon={<Map size={18} />} label={t('nav.field_monitoring') || 'Field Monitoring'} active={activeTab === 'Field Monitoring'} onClick={() => setActiveTab('Field Monitoring')} />
          <NavItem icon={<Leaf size={18} />} label={t('nav.soil_health') || 'Soil Health'} active={activeTab === 'Soil Health'} onClick={() => setActiveTab('Soil Health')} />
          <NavItem icon={<CloudSun size={18} />} label={t('nav.weather_nav') || 'Weather'} active={activeTab === 'Weather'} onClick={() => setActiveTab('Weather')} />
          <NavItem icon={<Droplets size={18} />} label={t('nav.irrigation') || 'Irrigation'} active={activeTab === 'Irrigation'} onClick={() => setActiveTab('Irrigation')} />
          <NavItem icon={<Tractor size={18} />} label={t('nav.equipment') || 'Equipment'} active={activeTab === 'Equipment'} onClick={() => setActiveTab('Equipment')} />
          <NavItem icon={<FileText size={18} />} label={t('nav.reports') || 'Reports'} active={activeTab === 'Reports'} onClick={() => setActiveTab('Reports')} />
          <NavItem icon={<AlertCircle size={18} />} label={t('nav.alerts') || 'Alerts'} active={activeTab === 'Alerts'} onClick={() => setActiveTab('Alerts')} />
          <NavItem icon={<Settings size={18} />} label={t('nav.settings') || 'Settings'} active={activeTab === 'Settings'} onClick={() => setActiveTab('Settings')} />
        </nav>
      </aside>

      {/* ─── MAIN CONTENT ─────────────────────────────────────────────────── */}
      <main className="flex-1 flex flex-col h-full overflow-y-auto custom-scrollbar-hide relative bg-[#09150c]">
        {/* Subtle background glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-green-900/10 rounded-full blur-[120px] pointer-events-none" />

        {/* TOP HEADER */}
        <header className="flex items-center justify-end px-8 pt-6 pb-2 z-50">
          {/* Right Actions */}
          <div className="flex items-center gap-4">
            <button className="relative w-9 h-9 flex items-center justify-center rounded-full bg-[#0e1d11] border border-white/5 hover:border-gray-600 transition-colors">
              <Bell size={16} />
              <div className="absolute top-2 right-2 w-1.5 h-1.5 bg-green-500 rounded-full"></div>
            </button>
            <div className="relative">
              <div
                className="flex items-center gap-3 bg-[#0e1d11] border border-white/5 rounded-full p-2.5 pr-6 cursor-pointer hover:border-gray-600 transition-colors"
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
              >
                <div className="w-16 h-16 rounded-full bg-orange-600 overflow-hidden border border-white/10 shrink-0 shadow-lg">
                  <img src={globalAvatar} alt="User" className="w-full h-full object-cover" onError={(e) => e.target.src = 'https://ui-avatars.com/api/?name=Error'} />
                </div>
                <div className="hidden lg:block">
                  <p className="text-xs font-semibold text-gray-200 leading-none">{userInfo?.name || 'Farmer'}</p>
                  <p className="text-[10px] text-gray-500 leading-none mt-1">{t('settings.farmManager') || 'Farm Manager'}</p>
                </div>
                <ChevronDown size={14} className={`text-gray-500 ml-1 hidden lg:block transition-transform ${userDropdownOpen ? 'rotate-180' : ''}`} />
              </div>
              {userDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-[#0a1a0f] border border-green-800/40 rounded-xl shadow-lg shadow-black flex flex-col z-50">
                  <div className="px-4 py-3 border-b border-white/5">
                    <p className="text-sm font-semibold text-white">{userInfo?.name || 'Farmer'}</p>
                    <p className="text-xs text-gray-400">{userInfo?.email || 'farmer@example.com'}</p>
                  </div>
                  <div className="p-2 flex flex-col gap-1">
                    <button
                      className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-gray-300 hover:bg-[#1a2332] hover:text-white rounded-lg transition-colors"
                      onClick={() => {
                        setActiveTab('Settings');
                        setUserDropdownOpen(false);
                      }}
                    >
                      <User size={16} className="text-gray-400" /> {t('nav.my_farmer_profile') || 'My Farmer Profile'}
                    </button>
                    <button
                      className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-red-400 hover:bg-red-500/10 hover:text-red-300 rounded-lg transition-colors"
                      onClick={() => {
                        localStorage.removeItem('token');
                        localStorage.removeItem('user_id');
                        window.location.href = '/login';
                      }}
                    >
                      <LogOut size={16} /> {t('nav.logout') || 'Logout'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* DASHBOARD CONTENT */}
        <div className="px-8 pb-8 flex-1 z-10 flex flex-col gap-6 -mt-16">
          <div className="flex items-end justify-between">
            <div className="flex flex-col">
              <div className="flex items-center gap-3 mb-2 animate-fade-in">
                <div className="p-2 bg-gradient-to-br from-green-500/20 to-emerald-600/5 border border-green-500/30 rounded-lg shadow-[0_0_15px_rgba(34,197,94,0.15)] backdrop-blur-md">
                  <Sparkles className="w-5 h-5 text-green-400 animate-pulse" />
                </div>
                <p className="text-xl md:text-2xl font-black bg-gradient-to-r from-green-400 via-emerald-400 to-green-600 bg-clip-text text-transparent uppercase tracking-wide drop-shadow-[0_0_10px_rgba(34,197,94,0.2)]">
                  {t('dashboard.title') || 'AgroVision AI Command Center'}
                </p>
              </div>
              <h1 className="text-4xl md:text-5xl font-black text-white flex items-center gap-3 tracking-tight mt-1">
                {activeTab === 'Dashboard' ? (
                  <>{t('home.welcome')}, <span className="text-transparent bg-clip-text bg-gradient-to-br from-gray-100 to-gray-500">{firstName}</span> <span className="animate-bounce origin-bottom-right drop-shadow-lg">👋</span></>
                ) : (
                  t(`tabs.${activeTab}`) || activeTab
                )}
              </h1>
              <p className="text-base text-gray-400 mt-2 font-medium flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.8)] animate-pulse"></span>
                {t('dashboard.subtitle') || `Manage your ${activeTab.toLowerCase()}`}
              </p>
            </div>
            {activeTab === 'Dashboard' && (
              <div className="relative">
                <div
                  className="flex items-center gap-2 bg-[#0e1d11] border border-white/5 rounded-lg px-4 py-2 text-xs font-medium cursor-pointer hover:border-white/10 transition-colors"
                  onClick={() => setDateDropdownOpen(!dateDropdownOpen)}
                >
                  <Clock size={14} className="text-gray-400" />
                  <span>{selectedDateRange}</span>
                  <ChevronDown size={14} className={`text-gray-500 ml-1 transition-transform ${dateDropdownOpen ? 'rotate-180' : ''}`} />
                </div>
                {dateDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-[#0a1a0f] border border-green-800/40 rounded-xl shadow-lg shadow-black p-2 z-50">
                    <button onClick={() => { setSelectedDateRange('Last 7 Days (Jun 20 - 26)'); setDateDropdownOpen(false); }} className="w-full text-left px-3 py-2 text-sm text-green-400 bg-green-500/10 rounded-lg transition-colors mb-1">Last 7 Days (Jun 20 - Jun 26)</button>
                    <button onClick={() => { setSelectedDateRange('Last 30 Days'); setDateDropdownOpen(false); }} className="w-full text-left px-3 py-2 text-sm text-gray-300 hover:bg-white/5 rounded-lg transition-colors mb-1">Last 30 Days</button>
                    <button onClick={() => { setSelectedDateRange('This Month'); setDateDropdownOpen(false); }} className="w-full text-left px-3 py-2 text-sm text-gray-300 hover:bg-white/5 rounded-lg transition-colors mb-1">This Month</button>
                    <div className="border-t border-white/5 mt-1 pt-2 flex flex-col gap-2">
                      <span className="text-xs text-gray-400 px-3">Custom Start Date</span>
                      <input
                        type="date"
                        className="bg-[#0e1d11] text-xs text-gray-300 p-2 mx-1 rounded border border-white/5 outline-none custom-date-input"
                        onChange={(e) => {
                          if (e.target.value) {
                            setSelectedDateRange(`Custom: ${e.target.value}`);
                            setDateDropdownOpen(false);
                          }
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {activeTab === 'Dashboard' ? (
            <>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                <TopCard
                  icon={<TrendingUp size={16} className="text-green-400" />}
                  label={t('dashboard.totalProfit') || 'Total Profit'}
                  value={`₹${(stats?.totalProfit || 0).toLocaleString()}`}
                />
                <TopCard
                  icon={<TrendingDown size={16} className="text-red-400" />}
                  label={t('dashboard.totalLoss') || 'Total Loss'}
                  value={`₹${Math.abs(stats?.totalLoss || 0).toLocaleString()}`}
                />
                <TopCard
                  icon={<IndianRupee size={16} className="text-blue-400" />}
                  label={t('dashboard.remainingAmount') || 'Remaining Amount'}
                  value={`₹${(stats?.remainingAmount || 0).toLocaleString()}`}
                />
                <TopCard
                  icon={<Activity size={16} className="text-purple-400" />}
                  label={t('dashboard.totalScans')}
                  value={stats?.totalScans || "0"}
                />
                <TopCard
                  icon={<Leaf size={16} className="text-farm-green" />}
                  label={t('dashboard.yieldPredictions')}
                  value={stats?.yieldPredictions || "0"}
                />
              </div>

              <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 flex-1">

                <div className="xl:col-span-2 flex flex-col gap-6">

                  <GlassPanel className="p-0 overflow-hidden relative min-h-[380px] flex flex-col xl:col-span-2">
                    <div className="p-6 pb-0 relative z-10 w-full flex justify-between">
                      <div>
                        <h3 className="font-semibold text-gray-200">{t('dashboard.fieldHealthOverview') || 'Field Health Overview'}</h3>
                        <p className="text-xs text-gray-500">{t('dashboard.aiPowered') || 'AI-powered vegetation & soil analysis'}</p>
                      </div>
                      <div>
                        <div className="bg-[#0e2114] border border-green-800/40 rounded-xl p-2 px-4 shadow-[0_0_15px_rgba(34,197,94,0.15)] flex gap-4">
                          <div className="flex flex-col items-center">
                            <span className="text-2xl font-bold text-white leading-none">86</span>
                            <span className="text-[10px] text-green-500">{t('dashboard.goodScore') || 'Good Score'}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="absolute inset-0 z-0 flex items-center justify-center opacity-70">
                      {/* Fallback to simple gradient if fail to load map image */}
                      <div className="w-full h-full bg-gradient-to-tr from-[#0b1f11] to-[#040e06]" />
                      {/* Decorative geometry for field map simulation since we don't have perfect asset */}
                      <div className="absolute top-[20%] right-[30%] w-[40%] h-[50%] border border-green-500/20 bg-green-500/10 skew-y-12 rotate-12 rounded-xl"></div>
                      <div className="absolute top-[40%] left-[20%] w-[30%] h-[30%] border border-yellow-500/20 bg-yellow-500/5 -skew-y-12 rounded-xl"></div>
                    </div>

                    <div className="relative z-20 flex flex-col flex-1 pb-6 px-6 justify-end w-full">

                      {/* Overlay Map Pins */}
                      <div className="absolute right-[35%] top-[40%] group">
                        <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center border-2 border-[#061009] shadow-[0_0_20px_rgba(34,197,94,0.5)] z-20 relative cursor-pointer">
                          <Leaf size={14} className="text-white" />
                        </div>
                        <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 w-max bg-[#0c2014]/90 backdrop-blur-sm border border-green-800/40 rounded-xl p-2 z-30">
                          <p className="text-xs font-semibold text-white">{t('dashboard.georkField') || 'Geork Field'}</p>
                          <p className="text-[10px] text-gray-400">{t('dashboard.crops.Wheat') || 'Wheat'} • {t('dashboard.healthLabel') || 'Health'}: <span className="text-green-400">92</span></p>
                        </div>
                      </div>

                      <div className="absolute left-[30%] top-[45%]">
                        <div className="w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center border-2 border-[#061009] shadow-lg opacity-80 cursor-pointer">
                          <Leaf size={10} className="text-white" />
                        </div>
                      </div>

                      {/* Sidebar Widget on Map */}
                      <div className="w-[320px] bg-[#0c1f13]/80 backdrop-blur-xl border border-white/5 rounded-2xl p-4 mt-auto shadow-2xl relative">
                        <div className="flex items-center justify-between">
                          <div className="relative flex items-center justify-center w-[100px] h-[100px]">
                            <ResponsiveContainer width={100} height={100}>
                              <PieChart>
                                <Pie
                                  data={[{ value: 86 }, { value: 14 }]}
                                  cx="50%" cy="50%"
                                  innerRadius={36} outerRadius={46}
                                  dataKey="value"
                                  startAngle={90} endAngle={-270}
                                  stroke="none"
                                >
                                  <Cell fill="#22c55e" />
                                  <Cell fill="#1a2e20" />
                                </Pie>
                              </PieChart>
                            </ResponsiveContainer>
                            <div className="absolute flex flex-col items-center justify-center text-center">
                              <span className="text-2xl font-bold text-white leading-none">86</span>
                              <span className="text-[10px] text-gray-400 mt-1">{t('dashboard.good') || 'Good'}</span>
                            </div>
                          </div>

                          <div className="flex-1 ml-4 space-y-2">
                            <HealthStat label={t('dashboard.excellent') || 'Excellent'} value="35%" color="bg-[#22c55e]" />
                            <HealthStat label={t('dashboard.good') || 'Good'} value="40%" color="bg-[#a3e635]" />
                            <HealthStat label={t('dashboard.average') || 'Average'} value="15%" color="bg-[#fbbf24]" />
                            <HealthStat label={t('dashboard.poor') || 'Poor'} value="10%" color="bg-[#ef4444]" />
                          </div>
                        </div>

                        <div className="mt-4 pt-3 border-t border-white/5 flex items-center gap-2 text-xs font-medium text-green-400">
                          <TrendingUp size={14} />
                          12% improvement from last week
                        </div>
                      </div>
                    </div>
                  </GlassPanel>

                  {/* Recent Yield Predictions */}
                  <GlassPanel title={t('dashboard.recentYieldTitle')} icon={<Leaf size={18} className="mr-2 text-green-400 inline" />} className="xl:col-span-2 overflow-x-auto">
                    <table className="w-full text-left border-collapse mt-4">
                      <thead>
                        <tr className="border-b border-white/10 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                          <th className="py-3 font-medium">{t('dashboard.farmer')}</th>
                          <th className="py-3 font-medium">{t('dashboard.cropName')}</th>
                          <th className="py-3 font-medium">{t('dashboard.area')}</th>
                          <th className="py-3 font-medium">{t('dashboard.predictedYield')}</th>
                          <th className="py-3 font-medium">{t('dashboard.date')}</th>
                        </tr>
                      </thead>
                      <tbody className="text-sm">
                        {recentYield.map((yieldItem, index) => (
                          <tr key={index} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                            <td className="py-3 text-white font-medium">{yieldItem.farmer}</td>
                            <td className="py-3 text-gray-200">{t(`dashboard.crops.${yieldItem.cropName}`) || yieldItem.cropName}</td>
                            <td className="py-3 text-gray-400">{yieldItem.area} {t('dashboard.acres')}</td>
                            <td className="py-3 text-green-400 font-semibold">{yieldItem.predictedYield} {t('dashboard.tonsHectare')}</td>
                            <td className="py-3 text-gray-400">{new Date(yieldItem.date).toLocaleDateString()}</td>
                          </tr>
                        ))}
                        {recentYield.length === 0 && (
                          <tr>
                            <td colSpan="5" className="py-4 text-center text-gray-500 text-sm">No recent yield predictions found.</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </GlassPanel>

                  {/* Monthly Crop Profitability */}
                  <GlassPanel title={t('dashboard.monthlyChart')} className="xl:col-span-2" action={
                    <select className="bg-[#142618] border border-white/10 text-white text-xs rounded-lg px-2 py-1 outline-none">
                      <option>2026</option>
                      <option>2025</option>
                    </select>
                  }>
                    <div className="h-[250px] w-full mt-4">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={monthlyProfitData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                          <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 10 }} dy={10} />
                          <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 10 }} />
                          <RechartsTooltip
                            cursor={{ fill: 'rgba(255,255,255,0.02)' }}
                            contentStyle={{ backgroundColor: '#0d1f13', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)' }}
                            itemStyle={{ color: '#fff', fontSize: '12px' }}
                          />
                          <Bar dataKey="Wheat" fill="#fbbf24" barSize={8} radius={[4, 4, 0, 0]} />
                          <Bar dataKey="Rice" fill="#34d399" barSize={8} radius={[4, 4, 0, 0]} />
                          <Bar dataKey="Corn" fill="#60a5fa" barSize={8} radius={[4, 4, 0, 0]} />
                          <Bar dataKey="Tomato" fill="#f87171" barSize={8} radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </GlassPanel>
                </div>

                <div className="flex flex-col gap-6">

                  {/* Disease Distribution */}
                  <GlassPanel title={t('dashboard.diseaseDistribution')} icon={<PieChartIcon size={18} className="mr-2 text-green-400 inline" />}>
                    <div className="w-full h-[280px] mt-4">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={cropDist}
                            cx="50%" cy="45%"
                            innerRadius={60} outerRadius={85}
                            paddingAngle={4}
                            dataKey="value"
                            stroke="none"
                          >
                            {cropDist.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <RechartsTooltip
                            contentStyle={{ backgroundColor: '#0d1f13', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)' }}
                            itemStyle={{ color: '#fff', fontSize: '12px' }}
                          />
                          <Legend
                            layout="horizontal"
                            verticalAlign="bottom"
                            align="center"
                            wrapperStyle={{ fontSize: '11px', lineHeight: '1.5', paddingBottom: '10px' }}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </GlassPanel>


                  {/* Crop Health Overview */}
                  <GlassPanel title={t('dashboard.cropHealth')} icon={<Activity size={18} className="mr-2 text-green-400 inline" />}>
                    <div className="space-y-4 mt-2">
                      {analytics?.cropHealth?.map((crop, idx) => (
                        <div key={idx} className="space-y-1">
                          <div className="flex justify-between text-xs">
                            <span className="text-gray-300 font-medium">{t(`dashboard.crops.${crop.name}`) || crop.name}</span>
                            <span className="text-gray-200 font-semibold">{crop.health}% {t('dashboard.healthy')}</span>
                          </div>
                          <div className="h-1.5 w-full bg-[#142618] rounded-full overflow-hidden">
                            <div className="h-full bg-blue-500 rounded-full" style={{ width: `${crop.health}%`, backgroundColor: COLORS[idx % COLORS.length] }} />
                          </div>
                        </div>
                      )) || <p className="text-sm text-gray-500">No crop health data available</p>}
                    </div>
                  </GlassPanel>

                  <GlassPanel className="bg-gradient-to-b from-[#14301d] to-[#0a1a0f] border-green-800/40">
                    <div className="flex items-center gap-2 mb-4 text-yellow-400 text-sm font-semibold tracking-wider">
                      <Sparkles size={16} /> {t('dashboard.globalInsight')}
                    </div>
                    <p className="italic text-gray-300 text-sm mb-6 border-b border-white/10 pb-4">
                      "{t('dashboard.irrigationAdvice') || stats?.latestRecommendation || 'Ensure proper irrigation according to weather conditions.'}"
                    </p>

                    <div className="flex items-center gap-2 mb-4 text-green-400 text-sm font-semibold tracking-wider">
                      <Component size={16} /> {t('dashboard.liveAnalytics')}
                    </div>
                    <div className="space-y-4 text-sm mt-3">
                      <div className="flex justify-between items-center border-b border-white/5 pb-2">
                        <span className="text-gray-400">{t('dashboard.mostCommonDisease')}</span>
                        <span className="text-red-400 font-semibold">{t(`dashboard.diseaseNames.${analytics?.mostCommonDisease}`) || analytics?.mostCommonDisease || 'None'}</span>
                      </div>
                      <div className="flex justify-between items-center border-b border-white/5 pb-2">
                        <span className="text-gray-400">{t('dashboard.topAnalyzedCrop')}</span>
                        <span className="text-green-400 font-semibold">{t(`dashboard.crops.${analytics?.topPerformingCrop}`) || analytics?.topPerformingCrop || 'Unknown'}</span>
                      </div>
                      <div className="flex justify-between items-center border-b border-white/5 pb-2">
                        <span className="text-gray-400">{t('dashboard.systemAvgYield')}</span>
                        <span className="text-blue-400 font-semibold">{analytics?.avgYield || '0 tons'}</span>
                      </div>
                    </div>
                  </GlassPanel>

                </div>
              </div>
            </>
          ) : (
            <TabContentRenderer activeTab={activeTab} userInfo={userInfo} />
          )}

        </div>
      </main >
    </div >
  );
}

// ─── Sub-Components ─────────────────────────────────────────────────────────

function CropManagementTab() {
  const { t } = useLanguage();
  const [crops, setCrops] = useState([
    { id: 1, crop: 'Winter Wheat', field: 'North Field A', area: 120, date: 'Oct 12, 2023', statusKey: 'growing', status: 'Growing', health: 'bg-green-500/20 text-green-400 border-green-500/30', harvest: 'Jul 20, 2024' },
    { id: 2, crop: 'Corn (Maize)', field: 'East Valley', area: 85, date: 'Apr 05, 2024', statusKey: 'requiresWater', status: 'Requires Water', health: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30', harvest: 'Sep 15, 2024' },
    { id: 3, crop: 'Soybeans', field: 'South Plot 3', area: 40, date: 'May 10, 2024', statusKey: 'healthy', status: 'Healthy', health: 'bg-green-500/20 text-green-400 border-green-500/30', harvest: 'Oct 05, 2024' },
    { id: 4, crop: 'Barley', field: 'West Ridge', area: 65, date: 'Mar 22, 2024', statusKey: 'pestRisk', status: 'Pest Risk detected', health: 'bg-red-500/20 text-red-400 border-red-500/30', harvest: 'Aug 10, 2024' }
  ]);
  const [editingId, setEditingId] = useState(null);

  const addCrop = () => {
    const newId = Date.now();
    setCrops([{ id: newId, crop: '', field: '', area: '', date: '', statusKey: 'growing', status: 'New', health: 'bg-blue-500/20 text-blue-400 border-blue-500/30', harvest: '' }, ...crops]);
    setEditingId(newId);
  };
  const updateCrop = (id, field, value) => {
    setCrops(crops.map(c => c.id === id ? { ...c, [field]: value } : c));
  };
  const deleteCrop = (id) => setCrops(crops.filter(c => c.id !== id));

  return (
    <div className="flex flex-col gap-6 w-full animate-fade-in text-gray-200">
      <GlassPanel>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-white flex items-center gap-2"><Component size={24} className="text-green-500" /> {t('cropManagement.title')}</h2>
          <button onClick={addCrop} className="bg-green-600 flex items-center gap-2 font-semibold px-4 py-2 rounded-lg text-sm text-white hover:bg-green-500 transition"><Plus size={16} /> {t('cropManagement.add')}</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/10 text-xs font-semibold text-gray-400 uppercase">
                <th className="py-3 px-2">{t('cropManagement.cropType')}</th>
                <th className="py-3 px-2">{t('cropManagement.fieldLocation')}</th>
                <th className="py-3 px-2">{t('cropManagement.areaAcres')}</th>
                <th className="py-3 px-2">{t('cropManagement.plantedDate')}</th>
                <th className="py-3 px-2">{t('cropManagement.status')}</th>
                <th className="py-3 px-2 text-right">{t('cropManagement.estHarvest')}</th>
                <th className="py-3 px-2 text-right">{t('cropManagement.actions')}</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {crops.map((item) => (
                <tr key={item.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                  <td className="py-4 px-2 font-medium text-white">
                    {editingId === item.id ? <input className="bg-black/40 border border-white/10 text-white px-2 py-1 rounded w-28" value={item.crop} onChange={e => updateCrop(item.id, 'crop', e.target.value)} /> : item.crop}
                  </td>
                  <td className="py-4 px-2 text-gray-400">
                    {editingId === item.id ? <input className="bg-black/40 border border-white/10 text-white px-2 py-1 rounded w-28" value={item.field} onChange={e => updateCrop(item.id, 'field', e.target.value)} /> : item.field}
                  </td>
                  <td className="py-4 px-2 text-gray-300">
                    {editingId === item.id ? <input className="bg-black/40 border border-white/10 text-white px-2 py-1 rounded w-20" value={item.area} onChange={e => updateCrop(item.id, 'area', e.target.value)} /> : `${item.area} ${t('dashboard.acres')}`}
                  </td>
                  <td className="py-4 px-2 text-gray-400">
                    {editingId === item.id ? <input className="bg-black/40 border border-white/10 text-white px-2 py-1 rounded w-28" value={item.date} onChange={e => updateCrop(item.id, 'date', e.target.value)} /> : item.date}
                  </td>
                  <td className="py-4 px-2">
                    <span className={`px-2.5 py-1 text-xs border rounded-full font-medium ${item.health}`}>{t(`cropManagement.${item.statusKey}`) || item.status}</span>
                  </td>
                  <td className="py-4 px-2 text-right text-gray-300">
                    {editingId === item.id ? <input className="bg-black/40 border border-white/10 text-white px-2 py-1 rounded w-28 text-right" value={item.harvest} onChange={e => updateCrop(item.id, 'harvest', e.target.value)} /> : item.harvest}
                  </td>
                  <td className="py-4 px-2 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {editingId === item.id ? (
                        <button onClick={() => setEditingId(null)} className="p-1.5 text-blue-400 hover:bg-blue-500/20 rounded-lg transition"><Save size={16} /></button>
                      ) : (
                        <button onClick={() => setEditingId(item.id)} className="p-1.5 text-gray-400 hover:text-white transition"><Edit size={16} /></button>
                      )}
                      <button onClick={() => deleteCrop(item.id)} className="p-1.5 text-red-500 hover:bg-red-500/20 rounded-lg transition"><Trash2 size={16} /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {crops.length === 0 && <tr><td colSpan="7" className="text-center py-8 text-gray-500">No crops recorded. Note parameters to add one.</td></tr>}
            </tbody>
          </table>
        </div>
      </GlassPanel>
    </div>
  );
}

function FieldMonitoringTab({ userInfo }) {
  const { t } = useLanguage();
  const defaultCams = [
    { _uid: '1', id: 'ZN-12', crop: 'Wheat', status: 'Optimal', health: 95, battery: 88, img: '/images/cctv_wheat.jpg' },
    { _uid: '2', id: 'ZN-14', crop: 'Corn', status: 'Warning', health: 65, battery: 42, img: '/images/cctv_corn.jpg' },
    { _uid: '3', id: 'ZN-18', crop: 'Soybean', status: 'Optimal', health: 91, battery: 94, img: '/images/cctv_soybean.jpg' },
    { _uid: '4', id: 'ZN-05', crop: 'Tomato', status: 'Critical', health: 32, battery: 15, img: '/images/cctv_tomato.jpg' }
  ];
  const [cams, setCams] = useState(userInfo?.cameras?.length > 0 ? userInfo.cameras : defaultCams);
  const [fullscreen, setFullscreen] = useState(null);
  const [editingCam, setEditingCam] = useState(null);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      api.put('/auth/me', { cameras: cams }).catch(err => console.error("Failed to save cameras:", err));
    }, 1500);
    return () => clearTimeout(delayDebounceFn);
  }, [cams]);

  const addCam = () => {
    setCams([...cams, { _uid: Date.now().toString(), id: `ZN-${Math.floor(Math.random() * 90) + 10}`, crop: 'New Sector', status: 'Connecting', health: 100, battery: 100, img: 'https://images.unsplash.com/photo-1586771107445-d3ca888129ff?w=500&auto=format&fit=crop&q=60' }]);
  };
  const deleteCam = (uid, e) => {
    e.stopPropagation();
    setCams(cams.filter(c => c._uid !== uid));
  };
  const updateCam = (uid, field, value) => {
    setCams(cams.map(c => c._uid === uid ? { ...c, [field]: value } : c));
  };
  const handleCamImageUpload = (uid, e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => updateCam(uid, 'img', reader.result);
      reader.readAsDataURL(file);
    }
  };

  if (fullscreen) {
    return (
      <div className="absolute inset-0 bg-black/90 z-[100] flex flex-col p-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-3xl font-bold text-white flex items-center gap-3"><Camera className="text-green-500" /> {fullscreen.id} Live Feed</h2>
            <p className="text-gray-400 mt-1">{t(`dashboard.crops.${fullscreen.crop}`) || fullscreen.crop} Sector • Health: {fullscreen.health}/100</p>
          </div>
          <button onClick={() => setFullscreen(null)} className="px-6 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors font-medium">Close</button>
        </div>
        <div className="flex-1 w-full bg-black rounded-2xl overflow-hidden border border-white/10 relative">
          <img src={fullscreen.img} className="w-full h-full object-cover opacity-80" alt="camera feed" />
          <div className="absolute top-4 right-4 bg-red-600 text-white px-3 py-1 rounded text-xs font-bold animate-pulse flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-white" /> LIVE</div>
          <div className="absolute bottom-4 left-4 bg-black/60 backdrop-blur text-green-400 font-mono text-xs px-4 py-2 rounded">BAT: {fullscreen.battery}% • SIGNAL: STRONG</div>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in w-full text-gray-200">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-white flex items-center gap-2"><Map size={24} className="text-green-500" /> {t('fieldMonitoring.title')}</h2>
        <button onClick={addCam} className="bg-green-600 flex items-center gap-2 font-semibold px-4 py-2 rounded-lg text-sm text-white hover:bg-green-500 transition"><Plus size={16} /> {t('fieldMonitoring.deployCamera')}</button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {cams.map((cam) => (
          <GlassPanel key={cam._uid} className="flex flex-col group cursor-pointer hover:border-green-500/50 transition-all hover:-translate-y-1 relative">
            <div className="absolute top-2 right-2 flex gap-2 z-30">
              <button onClick={(e) => { e.stopPropagation(); setEditingCam(editingCam === cam._uid ? null : cam._uid); }} className="text-gray-500 hover:text-blue-400 p-2"><Edit size={16} /></button>
              <button onClick={(e) => deleteCam(cam._uid, e)} className="text-gray-500 hover:text-red-500 p-2"><Trash2 size={16} /></button>
            </div>
            <div onClick={() => setFullscreen(cam)} className="h-44 bg-[#061009] rounded-xl border border-white/5 mb-4 flex items-center justify-center relative overflow-hidden mt-3">
              <img src={cam.img} className="w-full h-full object-cover transition-all duration-500 group-hover:scale-105" alt={cam.crop} />

              {/* CCTV Overlay Effects */}
              <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%)] bg-[length:100%_4px] pointer-events-none opacity-40"></div>
              <div className="absolute top-2 left-2 text-[10px] font-mono text-red-500 bg-black/60 px-1.5 py-0.5 rounded tracking-widest flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></span> REC</div>
              <div className="absolute bottom-2 right-2 text-[9px] font-mono text-white/70 bg-black/60 px-1.5 py-0.5 rounded">CH-{cam.id}</div>

              <div className={`absolute top-2 right-12 w-2.5 h-2.5 rounded-full shadow-[0_0_8px_currentColor] ${cam.health > 80 ? 'bg-green-500 text-green-500' : cam.health > 50 ? 'bg-yellow-500 text-yellow-500' : 'bg-red-500 text-red-500'}`} />
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white font-semibold gap-2 z-10 backdrop-blur-sm"><Camera size={20} /> {t('fieldMonitoring.viewFeed')}</div>
            </div>

            {editingCam === cam._uid ? (
              <div onClick={(e) => e.stopPropagation()} className="flex flex-col gap-2 mt-2">
                <input type="text" value={cam.id} onChange={(e) => updateCam(cam._uid, 'id', e.target.value)} className="bg-black/40 border border-white/10 text-white px-2 py-1 rounded text-sm w-full" placeholder="Camera ID" />
                <input type="text" value={cam.crop} onChange={(e) => updateCam(cam._uid, 'crop', e.target.value)} className="bg-black/40 border border-white/10 text-white px-2 py-1 rounded text-sm w-full" placeholder="Crop Name" />
                <input type="file" accept="image/*" onChange={(e) => handleCamImageUpload(cam._uid, e)} className="text-xs text-gray-400 mt-1" />
              </div>
            ) : (
              <>
                <div className="font-bold text-white text-lg mt-2">{cam.id}</div>
                <div className="text-xs text-gray-400 mb-3">{t(`dashboard.crops.${cam.crop}`) || cam.crop} {t('fieldMonitoring.sectorMonitor')}</div>
                <div className="flex items-center justify-between mt-auto pt-3 border-t border-white/10 text-xs">
                  <span className="text-gray-300">{t('fieldMonitoring.healthIndex')} <b className={cam.health > 80 ? 'text-green-400' : 'text-yellow-400'}>{cam.health}</b></span>
                  <span className="text-gray-500 flexitems-center gap-1">Bat: {cam.battery}%</span>
                </div>
              </>
            )}
          </GlassPanel>
        ))}
      </div>
    </div>
  );
}

function WeatherTab() {
  const { t } = useLanguage();
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedDayIdx, setSelectedDayIdx] = useState(null);

  useEffect(() => {
    async function fetchWeather(lat, lon) {
      try {
        const res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&hourly=temperature_2m,weathercode&daily=temperature_2m_max,temperature_2m_min,weathercode&timezone=auto`);
        const data = await res.json();
        setWeather(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    // Attempt real geo-location, fallback to general coordinates
    navigator.geolocation.getCurrentPosition(
      (pos) => fetchWeather(pos.coords.latitude, pos.coords.longitude),
      async () => {
        try {
          const ipRes = await fetch('https://ipapi.co/json/');
          if (!ipRes.ok) throw new Error("Rate limit");
          const ipData = await ipRes.json();
          fetchWeather(ipData.latitude, ipData.longitude);
        } catch {
          fetchWeather(28.6139, 77.2090); // Fallback: New Delhi
        }
      }
    );
  }, []);

  if (loading || !weather) return <div className="flex flex-col items-center justify-center py-20 text-green-500"><Loader2 className="animate-spin mb-4" size={40} /><p>Integrating Real-Time Radar...</p></div>;

  const current = weather.current_weather;
  const renderIcon = (code, size) => {
    if (code === 0) return <Sun size={size} className="text-yellow-400" />;
    if (code >= 1 && code <= 3) return <CloudSun size={size} className="text-yellow-300" />;
    if (code >= 51 && code <= 67) return <CloudRain size={size} className="text-blue-400" />;
    if (code >= 71 && code <= 77) return <Snowflake size={size} className="text-white" />;
    if (code >= 95) return <CloudLightning size={size} className="text-purple-400" />;
    return <Cloud size={size} className="text-gray-400" />;
  };

  const getWeatherDesc = (code) => {
    if (code === 0) return "Sunny / Clear";
    if (code >= 1 && code <= 3) return "Partly Cloudy";
    if (code >= 51 && code <= 67) return "Rainy";
    if (code >= 71 && code <= 77) return "Snowy";
    if (code >= 95) return "Thunderstorms";
    return "Cloudy";
  };

  const currentDesc = getWeatherDesc(current.weathercode);
  let rainMessage = "No rain expected in the next 7 days.";

  if (weather.hourly) {
    const now = new Date();
    let rainStartIndex = -1;
    let rainEndIndex = -1;

    for (let i = 0; i < weather.hourly.time.length; i++) {
      const time = new Date(weather.hourly.time[i]);
      if (time < now) continue;

      const code = weather.hourly.weathercode[i];
      const isRaining = (code >= 51 && code <= 67) || code >= 95;

      if (isRaining && rainStartIndex === -1) {
        rainStartIndex = i;
      } else if (!isRaining && rainStartIndex !== -1 && rainEndIndex === -1) {
        rainEndIndex = i;
        break;
      }
    }

    if (rainStartIndex !== -1) {
      if (rainEndIndex === -1) rainEndIndex = weather.hourly.time.length - 1;

      const startTime = new Date(weather.hourly.time[rainStartIndex]);
      const endTime = new Date(weather.hourly.time[rainEndIndex]);

      const fmtOpts = { hour: 'numeric', minute: '2-digit', hour12: true };
      const startStr = startTime.toLocaleTimeString('en-US', fmtOpts);
      const endStr = endTime.toLocaleTimeString('en-US', fmtOpts);
      const dayStr = startTime.getDate() === now.getDate() ? "today" : startTime.toLocaleDateString('en-US', { weekday: 'long' });

      rainMessage = startTime - now < 3600000 && startTime.getDate() === now.getDate()
        ? `Rain will persist until ${endStr}`
        : `Rain expected ${dayStr} from ${startStr} to ${endStr}`;
    }
  }

  return (
    <div className="flex flex-col gap-6 w-full animate-fade-in text-gray-200">
      <GlassPanel className="relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-8 opacity-20 transform group-hover:scale-110 transition-transform duration-700">
          {renderIcon(current.weathercode, 150)}
        </div>
        <div className="relative z-10 flex items-center justify-between">
          <div>
            <h2 className="text-5xl font-bold text-white mb-3">{current.temperature}°C</h2>
            <p className="text-2xl text-white font-semibold mb-1">{currentDesc}</p>
            <p className="text-sm text-blue-300 font-medium mb-3 flex items-center gap-2"><CloudRain size={16} /> {rainMessage}</p>
            <p className="text-xs text-green-400 font-mono flex items-center gap-2">
              <Wind size={14} /> Wind: {current.windspeed} km/h • Direction: {current.winddirection}°
            </p>
          </div>
        </div>
      </GlassPanel>
      <h3 className="font-semibold text-lg text-white mt-2">{t('weatherTab.forecast7Day')}</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
        {weather.daily.time.map((time, idx) => {
          const max = weather.daily.temperature_2m_max[idx];
          const min = weather.daily.temperature_2m_min[idx];
          const date = new Date(time).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
          return (
            <GlassPanel
              key={idx}
              onClick={() => setSelectedDayIdx(idx)}
              className={`flex flex-col items-center justify-center text-center p-4 hover:bg-white/5 transition-colors cursor-pointer ${selectedDayIdx === idx ? 'border-blue-500 bg-blue-900/20' : ''}`}
            >
              <span className="text-xs font-semibold text-gray-400 mb-3">{date}</span>
              <div className="my-2">{renderIcon(weather.daily.weathercode[idx], 32)}</div>
              <span className="text-sm font-bold text-white mt-3">{max}° <span className="text-gray-500 font-normal">/ {min}°</span></span>
            </GlassPanel>
          )
        })}
      </div>

      {selectedDayIdx !== null && (
        <div className="mt-4 p-6 bg-[#0c1a12] border border-green-800/40 rounded-2xl shadow-xl animate-fade-in relative z-10 w-full overflow-hidden">
          <button onClick={() => setSelectedDayIdx(null)} className="absolute top-4 right-4 p-2 bg-white/5 rounded-full hover:bg-white/10 text-gray-400 hover:text-white transition-colors">
            <X size={16} />
          </button>

          <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <Clock size={20} className="text-blue-400" />
            {t('weatherTab.hourlyForecast')} {new Date(weather.daily.time[selectedDayIdx]).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
          </h3>

          <div className="flex overflow-x-auto gap-4 custom-scrollbar-hide pb-4 w-full cursor-grab active:cursor-grabbing">
            {weather.hourly.time.map((time, i) => {
              const dateItem = new Date(time).toLocaleDateString();
              const selectedDate = new Date(weather.daily.time[selectedDayIdx]).toLocaleDateString();

              if (dateItem !== selectedDate) return null;

              const hourTime = new Date(time).toLocaleTimeString('en-US', { hour: 'numeric', hour12: true });
              const temp = Math.round(weather.hourly.temperature_2m[i]);

              return (
                <div key={i} className="flex flex-col items-center flex-shrink-0 min-w-[75px] bg-[#07130a] rounded-xl p-3 py-4 border border-white/5 shadow-inner transition-transform hover:-translate-y-1">
                  <span className="text-xs font-semibold text-gray-400 mb-2">{hourTime}</span>
                  {renderIcon(weather.hourly.weathercode[i], 24)}
                  <span className="text-sm text-white font-bold mt-2">{temp}°C</span>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function IrrigationTab() {
  const { t } = useLanguage();
  const [zones, setZones] = useState([
    { id: 1, active: true, flow: 1.2 }, { id: 2, active: false, flow: 0 }, { id: 3, active: true, flow: 1.1 },
    { id: 4, active: false, flow: 0 }, { id: 5, active: false, flow: 0 }, { id: 6, active: true, flow: 0.9 }
  ]);
  const [systemOnline, setSystemOnline] = useState(true);

  const toggleZone = (id) => {
    setZones(zones.map(z => z.id === id ? { ...z, active: !z.active, flow: z.active ? 0 : 1.0 } : z));
  };
  const activeCount = zones.filter(z => z.active).length;
  const totalFlow = zones.reduce((acc, z) => acc + z.flow, 0).toFixed(1);

  return (
    <div className="flex flex-col gap-6 w-full animate-fade-in text-gray-200">
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-xl font-bold text-white flex items-center gap-2"><Droplets size={24} className="text-blue-500" /> {t('irrigation.control') || 'Irrigation Control'}</h2>
        <button onClick={() => setSystemOnline(!systemOnline)} className={`flex items-center gap-2 font-semibold px-4 py-2 rounded-lg text-sm text-white transition ${systemOnline ? 'bg-red-600 hover:bg-red-500' : 'bg-green-600 hover:bg-green-500'}`}>
          {systemOnline ? <Square size={16} fill="currentColor" /> : <Play size={16} fill="currentColor" />}
          {systemOnline ? (t('irrigation.halt') || 'HALT SYSTEM') : 'START SYSTEM'}
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <TopCard icon={<Droplets size={16} className="text-blue-400" />} label={t('irrigation.dailyAvg') || 'Daily Avg Usage'} value="452 L" />
        <TopCard icon={<Droplet size={16} className="text-blue-300" />} label={t('irrigation.currentFlow') || 'Current Total Flow'} value={`${systemOnline ? totalFlow : 0} L/s`} />
        <TopCard icon={<Check size={16} className={systemOnline ? "text-green-400" : "text-red-400"} />} label={t('irrigation.systemMaster') || 'System Master'} value={systemOnline ? (t('irrigation.online') || 'Online') : 'Offline'} />
      </div>
      <div className={`transition-opacity duration-500 ${systemOnline ? 'opacity-100' : 'opacity-50 pointer-events-none grayscale'}`}>
        <GlassPanel>
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-semibold text-gray-200">{t('irrigation.valveControls') || 'Valve Controls'} ({activeCount}/6 {t('dashboard.healthy') || 'Active'})</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {zones.map(zone => (
              <div key={zone.id} onClick={() => toggleZone(zone.id)} className={`cursor-pointer border ${zone.active ? 'border-blue-500/50 bg-blue-900/10' : 'border-white/5 bg-[#0a150c]'} rounded-xl p-5 flex justify-between items-center hover:border-blue-500/80 transition-all`}>
                <div>
                  <h4 className="text-base font-bold text-white mb-1">Zone {zone.id}</h4>
                  <p className="text-xs text-gray-400">{zone.active ? `${t('irrigation.flowing') || 'Flowing'}: ${zone.flow} L/s` : (t('irrigation.offSchedule') || 'Off / Auto Schedule')}</p>
                </div>
                <div className={`w-12 h-6 rounded-full flex items-center px-1 transition-colors ${zone.active ? 'bg-blue-500 justify-end' : 'bg-gray-700 justify-start'}`}>
                  <div className="w-4 h-4 rounded-full bg-white shadow-sm"></div>
                </div>
              </div>
            ))}
          </div>
        </GlassPanel>
      </div>
    </div>
  );
}

function EquipmentTab() {
  const { t } = useLanguage();
  const [equipmentItems, setEquipmentItems] = useState([
    { id: 1, name: 'John Deere Tractor', status: 'Active', fuel: 75, nextService: '14 days' },
    { id: 2, name: 'Harvester X200', status: 'Idle', fuel: 40, nextService: '2 days' },
    { id: 3, name: 'Sprayer Drone Array', status: 'Charging', fuel: 90, nextService: '30 days' },
    { id: 4, name: 'Heavy Planter', status: 'Maintenance', fuel: 10, nextService: 'Overdue' }
  ]);

  const addEquip = () => {
    setEquipmentItems([...equipmentItems, { id: Date.now(), name: 'New Machinery', status: 'Idle', fuel: 100, nextService: '365 days' }]);
  };
  const deleteEquip = (id) => setEquipmentItems(equipmentItems.filter(e => e.id !== id));

  const adjustFuel = (id, delta) => {
    setEquipmentItems(equipmentItems.map(e => {
      if (e.id === id) {
        let newF = Math.max(0, Math.min(100, e.fuel + delta));
        return { ...e, fuel: newF, status: newF === 0 ? 'Maintenance' : e.status };
      }
      return e;
    }));
  };

  return (
    <div className="flex flex-col gap-6 w-full animate-fade-in text-gray-200">
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-xl font-bold text-white flex items-center gap-2"><Tractor size={24} className="text-green-500" /> {t('equipment.fleet')}</h2>
        <button onClick={addEquip} className="bg-green-600 flex items-center gap-2 font-semibold px-4 py-2 rounded-lg text-sm text-white hover:bg-green-500 transition"><Plus size={16} /> {t('equipment.register')}</button>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {equipmentItems.map((eq) => (
          <GlassPanel key={eq.id} className="flex flex-col sm:flex-row items-center gap-5 relative group" action={<button onClick={() => deleteEquip(eq.id)} className="absolute top-4 right-4 text-gray-500 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={16} /></button>}>
            <div className="w-16 h-16 rounded-xl bg-[#061009] flex items-center justify-center border border-white/5 shrink-0">
              <Tractor size={32} className={eq.status === 'Maintenance' ? 'text-red-400' : 'text-green-500'} />
            </div>
            <div className="flex-1 w-full text-center sm:text-left">
              <h3 className="font-bold text-lg text-white mb-1 pr-6">{eq.name}</h3>
              <div className="flex items-center justify-center sm:justify-start gap-4 text-xs text-gray-400">
                <div className="flex items-center gap-1">{t('equipment.status')}: <span className={`font-semibold ${eq.status === 'Active' ? 'text-green-400' : eq.status === 'Maintenance' ? 'text-red-400' : 'text-yellow-400'}`}>{t(`equipment.${eq.status.toLowerCase()}`) || eq.status}</span></div>
                <div>{t('equipment.service')}: {eq.nextService === 'Overdue' ? t('equipment.overdue') : eq.nextService.replace('days', t('equipment.days'))}</div>
              </div>
              <div className="mt-4 flex items-center gap-3">
                <div className="text-xs font-medium text-gray-300 w-12">{t('equipment.fuel')} {eq.fuel}%</div>
                <div className="flex-1 h-2.5 bg-[#142618] rounded-full overflow-hidden relative cursor-crosshair">
                  <div className={`h-full transition-all duration-300 ${eq.fuel > 50 ? 'bg-green-500' : eq.fuel > 20 ? 'bg-yellow-400' : 'bg-red-500'}`} style={{ width: `${eq.fuel}%` }} />
                </div>
                <div className="flex gap-1 shrink-0">
                  <button onClick={() => adjustFuel(eq.id, -10)} className="w-6 h-6 bg-white/5 hover:bg-white/10 rounded items-center justify-center flex font-bold text-gray-400">-</button>
                  <button onClick={() => adjustFuel(eq.id, 10)} className="w-6 h-6 bg-white/5 hover:bg-white/10 rounded items-center justify-center flex font-bold text-gray-400">+</button>
                </div>
              </div>
            </div>
          </GlassPanel>
        ))}
      </div>
    </div>
  );
}

function AlertsSettingsTab({ type, userInfo }) {
  const { t } = useLanguage();
  const [isEditing, setIsEditing] = React.useState(false);
  const [customAvatar, setCustomAvatar] = React.useState(userInfo?.avatar || '');
  const [customEmail, setCustomEmail] = React.useState(userInfo?.email || '');
  const [customPhone, setCustomPhone] = React.useState(userInfo?.phone || '');

  React.useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      api.put('/auth/me', {
        email: customEmail || undefined,
        phone: customPhone || undefined,
        avatar: customAvatar || undefined
      }).catch(err => console.error(err));
    }, 1000);

    return () => clearTimeout(delayDebounceFn);
  }, [customEmail, customPhone, customAvatar]);

  const finalAvatar = customAvatar || `https://ui-avatars.com/api/?name=${userInfo?.name || 'Farmer'}&background=ea580c&color=fff&size=256`;

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setCustomAvatar(reader.result);
      reader.readAsDataURL(file);
    }
  };

  if (type === 'Settings') {
    return (
      <div className="flex flex-col gap-6 w-full animate-fade-in max-w-4xl">
        <h2 className="text-2xl font-bold text-white flex items-center gap-3">
          <User className="text-orange-400" size={28} />
          {t('settings.title')}
        </h2>

        {isEditing ? (
          <div className="bg-[#142618] border border-green-500/30 rounded-2xl p-6 shadow-xl animate-fade-in">
            <h3 className="text-xl font-bold text-white mb-4">{t('settings.editSettings')}</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">{t('settings.avatarLabel')}</label>
                <div className="flex flex-col md:flex-row gap-4 mb-4">
                  <div className="w-16 h-16 rounded-full border-2 border-white/10 overflow-hidden shrink-0">
                    <img src={finalAvatar} alt="Preview" className="w-full h-full object-cover" onError={(e) => e.target.src = 'https://ui-avatars.com/api/?name=Error'} />
                  </div>
                  <div className="flex-1 space-y-2">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="block w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-green-500/10 file:text-green-400 hover:file:bg-green-500/20 transition-colors"
                    />
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-500">OR</span>
                      <input
                        type="text"
                        value={customAvatar}
                        onChange={(e) => setCustomAvatar(e.target.value)}
                        placeholder={t('settings.pasteUrl')}
                        className="bg-[#0e1d11] border border-white/5 rounded-lg px-4 py-2 w-full text-sm text-gray-200 focus:outline-none focus:border-green-500/50"
                      />
                    </div>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">{t('settings.emailAddress')}</label>
                  <input type="email" value={customEmail} onChange={(e) => setCustomEmail(e.target.value)} className="bg-[#0e1d11] border border-white/5 rounded-lg px-4 py-2 w-full text-sm text-gray-200 focus:outline-none focus:border-green-500/50" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">{t('settings.phoneNumber')}</label>
                  <input type="tel" value={customPhone} onChange={(e) => setCustomPhone(e.target.value)} placeholder="+91 9999999999" className="bg-[#0e1d11] border border-white/5 rounded-lg px-4 py-2 w-full text-sm text-gray-200 focus:outline-none focus:border-green-500/50" />
                </div>
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setIsEditing(false)}
                  className="bg-green-600 hover:bg-green-500 text-white font-semibold py-2 px-6 rounded-lg transition-colors flex items-center gap-2"
                >
                  <Check size={16} /> {t('settings.doneEditing')}
                </button>
              </div>
            </div>
          </div>
        ) : null}

        <div className="bg-[#0e1d11]/90 backdrop-blur-xl border border-white/5 rounded-2xl p-8 flex flex-col md:flex-row items-center md:items-start gap-8 shadow-2xl">
          <div className="w-32 h-32 rounded-full border-4 border-white/5 bg-orange-600 overflow-hidden shadow-xl shrink-0 group relative">
            <img src={finalAvatar} alt="User" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer" onClick={() => setIsEditing(true)}>
              <Camera size={24} className="text-white" />
            </div>
          </div>
          <div className="flex-1 w-full text-center md:text-left space-y-4">
            <div>
              <h3 className="text-3xl font-bold text-white mb-2">{userInfo?.name || t('settings.farmManager')}</h3>
              <p className="text-green-400 font-medium tracking-wide">{t('settings.role')}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
              <div className="bg-[#142618] border border-white/5 rounded-xl p-4">
                <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">{t('settings.emailAddress')}</p>
                <p className="text-gray-200 font-medium">{customEmail || userInfo?.email || 'N/A'}</p>
              </div>
              <div className="bg-[#142618] border border-white/5 rounded-xl p-4">
                <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">{t('settings.accountRole')}</p>
                <p className="text-gray-200 font-medium">{t('settings.administrator')}</p>
              </div>
              <div className="bg-[#142618] border border-white/5 rounded-xl p-4">
                <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">{t('settings.memberSince')}</p>
                <p className="text-gray-200 font-medium">{new Date().getFullYear()}</p>
              </div>
              <div className="bg-[#142618] border border-white/5 rounded-xl p-4">
                <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">{t('settings.phoneNumber')}</p>
                <p className="text-gray-200 font-medium">{customPhone || '+91 - Not Set'}</p>
              </div>
            </div>

            <div className={`flex gap-4 pt-4 justify-center md:justify-start ${isEditing ? 'hidden' : ''}`}>
              <button onClick={() => setIsEditing(true)} className="bg-green-600 hover:bg-green-500 text-white font-semibold py-2.5 px-6 rounded-lg transition-colors flex items-center gap-2">
                <Edit size={16} /> {t('settings.editProfile')}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 w-full animate-fade-in max-w-4xl">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          {type === 'Reports' ? <FileText className="text-blue-400" /> : <AlertCircle className="text-red-400" />}
          {type === 'Reports' ? t('reports.title') : t('alerts.title')}
        </h2>
        <button className="bg-white/10 font-semibold px-4 py-2 rounded-lg text-sm text-white hover:bg-white/20 transition">{type === 'Reports' ? t('reports.manage') : t('alerts.manage')}</button>
      </div>
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="bg-[#0e1d11]/80 backdrop-blur-xl border border-white/5 rounded-xl p-5 flex items-center justify-between hover:bg-white/5 transition-colors cursor-pointer group">
          <div className="flex items-center gap-5">
            <div className="w-12 h-12 rounded-full bg-[#142618] border border-white/5 flex items-center justify-center shrink-0">
              {type === 'Reports' ? <FileText size={20} className="text-blue-400" /> : <AlertCircle size={20} className="text-red-400" />}
            </div>
            <div>
              <h4 className="text-base font-bold text-white mb-1 leading-tight">{type === 'Reports' ? t('reports.entry') : t('alerts.entry')} #{200 + i}</h4>
              <p className="text-xs text-gray-400">{type === 'Reports' ? t('reports.description') : t('alerts.description')}</p>
            </div>
          </div>
          <button className="text-xs font-bold px-4 py-2 bg-green-500/10 text-green-400 rounded-lg group-hover:bg-green-500/20 group-hover:scale-105 transition-all">{type === 'Reports' ? t('reports.interact') : t('alerts.interact')}</button>
        </div>
      ))}
    </div>
  );
}

function SoilHealthTab() {
  const { t } = useLanguage();
  return (
    <div className="flex flex-col gap-6 w-full animate-fade-in text-gray-200">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <GlassPanel title={t('soilHealth.moistureLevels')} className="lg:col-span-2 relative min-h-[300px]">
          <div className="absolute inset-0 top-16 px-5 pb-5">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={SOIL_MOISTURE_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorActual" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 10 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 10 }} />
                <RechartsTooltip cursor={{ stroke: 'rgba(255,255,255,0.1)' }} contentStyle={{ backgroundColor: '#0d1f13', border: '1px solid rgba(255,255,255,0.1)' }} />
                <Area type="monotone" dataKey="actual" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorActual)" />
                <Line type="monotone" dataKey="forecast" stroke="#9ca3af" strokeWidth={2} strokeDasharray="5 5" dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </GlassPanel>
        <div className="flex flex-col gap-6">
          <TopCard icon={<Droplets size={16} className="text-blue-400" />} label={t('soilHealth.avgMoisture')} value="48%" />
          <TopCard icon={<Leaf size={16} className="text-green-400" />} label={t('soilHealth.phValue')} value="6.5" />
          <GlassPanel className="flex-1">
            <h3 className="font-semibold text-gray-200 mb-4">{t('soilHealth.macronutrients')}</h3>
            <div className="space-y-4">
              <div className="space-y-1"><div className="flex justify-between text-xs"><span className="text-gray-400">{t('soilHealth.nitrogen')}</span><span className="text-green-400">{t('soilHealth.optimal')}</span></div><div className="h-1.5 w-full bg-[#142618] rounded-full overflow-hidden"><div className="h-full bg-green-500 w-[75%] rounded-full" /></div></div>
              <div className="space-y-1"><div className="flex justify-between text-xs"><span className="text-gray-400">{t('soilHealth.phosphorus')}</span><span className="text-yellow-400">{t('soilHealth.low')}</span></div><div className="h-1.5 w-full bg-[#142618] rounded-full overflow-hidden"><div className="h-full bg-yellow-400 w-[30%] rounded-full" /></div></div>
              <div className="space-y-1"><div className="flex justify-between text-xs"><span className="text-gray-400">{t('soilHealth.potassium')}</span><span className="text-green-400">{t('soilHealth.good')}</span></div><div className="h-1.5 w-full bg-[#142618] rounded-full overflow-hidden"><div className="h-full bg-blue-500 w-[60%] rounded-full" /></div></div>
            </div>
          </GlassPanel>
        </div>
      </div>
    </div>
  );
}

function TabContentRenderer({ activeTab, userInfo }) {
  if (activeTab === 'Crop Management') return <CropManagementTab />;
  if (activeTab === 'Field Monitoring') return <FieldMonitoringTab userInfo={userInfo} />;
  if (activeTab === 'Weather') return <WeatherTab />;
  if (activeTab === 'Irrigation') return <IrrigationTab />;
  if (activeTab === 'Equipment') return <EquipmentTab />;
  if (activeTab === 'Soil Health') return <SoilHealthTab />;
  if (['Reports', 'Alerts', 'Settings'].includes(activeTab)) return <AlertsSettingsTab type={activeTab} userInfo={userInfo} />;

  // Fallback for everything else
  return (
    <div className="flex flex-col items-center justify-center flex-1 h-full py-20 opacity-90 w-full animate-fade-in">
      <div className="w-24 h-24 mb-6 flex items-center justify-center text-green-500 bg-[#0e1d11] rounded-full border border-green-500/20 shadow-[0_0_30px_rgba(34,197,94,0.15)] relative">
        <Settings size={40} className="text-green-400 absolute animate-[spin_8s_linear_infinite]" />
      </div>
      <h2 className="text-3xl font-bold text-white mb-3 tracking-tight">{activeTab} Details</h2>
      <p className="text-gray-400 text-center max-w-md mb-8">
        Detailed metrics for {activeTab} are being gathered. This highly specialized view will be populated with precise farm data shortly.
      </p>
    </div>
  );
}

function NavItem({ icon, label, active, onClick }) {
  return (
    <div onClick={onClick} className={`flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-colors text-sm font-medium ${active ? 'bg-[#1b3d22] text-green-400 shadow-inner' : 'text-gray-400 hover:text-gray-200 hover:bg-white/5'}`}>
      {icon}
      <span>{label}</span>
    </div>
  );
}

function TopCard({ icon, label, value }) {
  return (
    <div className="bg-[#0e1d11]/80 backdrop-blur-xl border border-white/5 rounded-2xl p-4 shadow-lg flex flex-col justify-center min-h-[100px]">
      <div className="flex items-center gap-2 mb-2">
        <div className="w-8 h-8 rounded-lg bg-[#142618] flex items-center justify-center border border-white/5">
          {icon}
        </div>
        <span className="text-xs font-semibold text-gray-400 tracking-wide">{label}</span>
      </div>
      <div className="text-2xl font-bold text-white tracking-tight">{value}</div>
    </div>
  );
}

function GlassPanel({ title, subtitle, children, className = '', action, onClick }) {
  return (
    <div onClick={onClick} className={`bg-[#0e1d11]/80 backdrop-blur-xl border border-white/5 rounded-2xl p-5 shadow-lg ${className}`}>
      {(title || action) && (
        <div className="flex items-center justify-between mb-1 flex-wrap">
          <div>
            {title && <h3 className="font-semibold text-gray-200">{title}</h3>}
            {subtitle && <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p>}
          </div>
          {action && typeof action !== 'boolean' && action}
        </div>
      )}
      {children}
    </div>
  );
}

function HealthStat({ label, value, color }) {
  return (
    <div className="flex items-center gap-2 text-xs">
      <div className={`w-2 h-2 rounded-full ${color} shadow-sm`}></div>
      <span className="text-gray-400 flex-1">{label}</span>
      <span className="text-white font-medium">{value}</span>
    </div>
  );
}

function TaskItem({ icon, title, subtitle, time }) {
  return (
    <div className="flex items-center gap-3 bg-[#0a150c] border border-white/5 rounded-xl p-3 hover:border-gray-600 transition-colors cursor-default">
      <div className="w-8 h-8 rounded-lg bg-[#142918] flex items-center justify-center border border-white/5 shadow-inner">
        {icon}
      </div>
      <div className="flex-1">
        <h4 className="text-xs font-semibold text-gray-200">{title}</h4>
        <p className="text-[10px] text-gray-500 mt-0.5">{subtitle}</p>
      </div>
      <div className="text-right">
        <span className="block text-[10px] font-medium text-gray-400">{time}</span>
        <span className="inline-block px-1.5 py-0.5 bg-green-500/10 text-green-400 border border-green-500/20 rounded text-[9px] font-semibold mt-1 uppercase tracking-wider">Upcoming</span>
      </div>
    </div>
  );
}

function WeatherStat({ icon, label, value }) {
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-1.5 text-[10px] text-gray-500">
        {icon} {label}
      </div>
      <div className="text-xs font-semibold text-gray-200">{value}</div>
    </div>
  );
}

function SoilElement({ symbol, name, state, color }) {
  return (
    <div className="flex flex-col items-center gap-1.5">
      <div className="w-10 h-10 rounded-full border border-gray-700 bg-[#0a1a0f] flex items-center justify-center text-sm font-bold text-gray-300 shadow-inner">
        {symbol}
      </div>
      <div className="text-center">
        <div className="text-[10px] text-gray-500 mb-0.5">{name}</div>
        <div className={`text-[10px] font-semibold flex items-center justify-center gap-1 bg-[#122b19] px-2 py-0.5 rounded-full border border-white/5 ${color}`}>{state}</div>
      </div>
    </div>
  );
}

const MapPin = ({ size }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>;

