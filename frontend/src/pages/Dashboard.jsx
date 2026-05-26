import React, { useState, useEffect } from 'react';
import { Users, Activity, Leaf, AlertTriangle, CheckCircle2, User, Cpu, Database, Zap, PieChart as PieChartIcon, TrendingUp, IndianRupee } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell
} from 'recharts';
import api from '../api';
import { useNavigate, useLocation } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';

const COLORS = ['#10B981', '#F59E0B', '#EF4444', '#3B82F6', '#8B5CF6'];

const Dashboard = () => {
  const location = useLocation();
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState(location.state?.activeTab || 'overview');

  useEffect(() => {
    if (location.state?.activeTab) {
      setActiveTab(location.state.activeTab);
    }
  }, [location.state]);

  const [stats, setStats] = useState(null);
  const [recentDisease, setRecentDisease] = useState([]);
  const [recentYield, setRecentYield] = useState([]);
  const [myDisease, setMyDisease] = useState([]);
  const [myYield, setMyYield] = useState([]);
  const [userInfo, setUserInfo] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());
  const [monthlyProfitData, setMonthlyProfitData] = useState([]);
  
  const navigate = useNavigate();
  const userId = localStorage.getItem('user_id');

  useEffect(() => {
    if (!userId) {
      navigate('/login');
      return;
    }

    const fetchDashboardData = async () => {
      try {
        const [statsRes, recDiseaseRes, recYieldRes, myDiseaseRes, myYieldRes, userRes, analyticsRes] = await Promise.all([
          api.get('/dashboard/stats'),
          api.get('/dashboard/recent-disease'),
          api.get('/dashboard/recent-yield'),
          api.get(`/history/disease/${userId}`),
          api.get(`/history/yield/${userId}`),
          api.get('/auth/me'),
          api.get('/dashboard/analytics')
        ]);

        setStats(statsRes.data);
        setRecentDisease(recDiseaseRes.data);
        setRecentYield(recYieldRes.data);
        setMyDisease(myDiseaseRes.data);
        setMyYield(myYieldRes.data);
        setUserInfo(userRes.data);
        setAnalytics(analyticsRes.data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [userId, navigate]);

  useEffect(() => {
    if (!userId) return;
    const fetchProfitData = async () => {
      try {
        const res = await api.get(`/dashboard/profit-analysis?year=${selectedYear}`);
        setMonthlyProfitData(res.data);
      } catch (err) {
        console.error("Error fetching profit data", err);
      }
    };
    fetchProfitData();
  }, [userId, selectedYear]);

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-[80vh] space-y-4">
        <div className="w-16 h-16 border-4 border-farm-green border-t-transparent rounded-full animate-spin"></div>
        <div className="text-xl text-farm-green animate-pulse font-bold tracking-widest uppercase">Initializing Command Center...</div>
      </div>
    );
  }

  const diseaseChartData = myDisease.map((d, i) => ({ name: `${t('profile.pred')} ${i+1}`, confidence: d.confidence }));
  const yieldChartData = myYield.map((y, i) => ({ name: `${t('profile.field')} ${i+1}`, yield: parseFloat(y.predicted_yield) || 0 }));


  return (
    <div className="w-full space-y-8 animate-fade-in py-2">
      
      {/* Hero Section */}
      <div className="flex flex-col md:flex-row justify-between items-center bg-gray-900/40 backdrop-blur-xl p-8 rounded-2xl border border-white/10 shadow-[0_0_20px_rgba(16,185,129,0.1)] relative overflow-hidden">
        {/* Glow effect */}
        <div className="absolute top-[-50%] left-[-10%] w-64 h-64 bg-farm-green/20 rounded-full blur-[80px]"></div>
        <div className="absolute bottom-[-50%] right-[-10%] w-64 h-64 bg-blue-500/20 rounded-full blur-[80px]"></div>

        <div className="relative z-10 w-full text-left">
          <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-farm-green to-blue-400 mb-2">{t('dashboard.title')}</h1>
          <p className="text-gray-400 font-medium tracking-wide uppercase text-sm">{t('dashboard.subtitle')}</p>
        </div>
      </div>

      {activeTab === 'overview' && (
        <div className="space-y-8">
          
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
            <SummaryCard icon={<Users className="w-6 h-6 text-blue-400" />} title={t('dashboard.totalFarmers')} value={stats?.totalFarmers || 0} />
            <SummaryCard icon={<Activity className="w-6 h-6 text-purple-400" />} title={t('dashboard.totalScans')} value={stats?.totalScans || 0} />
            <SummaryCard icon={<IndianRupee className="w-6 h-6 text-green-400" />} title={t('dashboard.monthlyProfit')} value={`₹${(stats?.profitThisMonth || 0).toLocaleString()}`} />
            <SummaryCard icon={<Leaf className="w-6 h-6 text-farm-green" />} title={t('dashboard.yieldPredictions')} value={stats?.yieldPredictions || 0} />
            <SummaryCard icon={<CheckCircle2 className="w-6 h-6 text-teal-400" />} title={t('dashboard.healthyCrop')} value={`${stats?.healthyPercent || 0}%`} />
            <SummaryCard icon={<AlertTriangle className="w-6 h-6 text-red-400" />} title={t('dashboard.highRisk')} value={stats?.highRiskCrops || 0} />
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
            {/* Left Col: Tables & Charts */}
            <div className="xl:col-span-2 space-y-8">
              
              {/* Disease Table */}
              <div className="bg-gray-900/40 backdrop-blur-xl p-6 rounded-2xl border border-white/10 shadow-lg">
                <div className="flex items-center gap-3 mb-6">
                  <AlertTriangle className="w-6 h-6 text-farm-green" />
                  <h3 className="text-xl font-bold text-white">{t('dashboard.recentDiseaseTitle')}</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-gray-700/50">
                        <th className="p-3 text-xs uppercase tracking-wider text-gray-400 font-semibold">{t('dashboard.farmer')}</th>
                        <th className="p-3 text-xs uppercase tracking-wider text-gray-400 font-semibold">{t('dashboard.cropName')}</th>
                        <th className="p-3 text-xs uppercase tracking-wider text-gray-400 font-semibold">{t('dashboard.detectedDisease')}</th>
                        <th className="p-3 text-xs uppercase tracking-wider text-gray-400 font-semibold">{t('dashboard.confidence')}</th>
                        <th className="p-3 text-xs uppercase tracking-wider text-gray-400 font-semibold">{t('dashboard.date')}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-700/30">
                      {recentDisease.map((item, index) => {
                        const cropName = t(`dashboard.crops.${item.cropName}`) !== `dashboard.crops.${item.cropName}` ? t(`dashboard.crops.${item.cropName}`) : item.cropName;
                        const diseaseName = t(`dashboard.diseaseNames.${item.disease}`) !== `dashboard.diseaseNames.${item.disease}` ? t(`dashboard.diseaseNames.${item.disease}`) : item.disease;
                        return (
                        <tr key={index} className="hover:bg-white/5 transition-colors group">
                          <td className="p-3 font-medium text-gray-200">{item.farmer}</td>
                          <td className="p-3 font-medium text-gray-200">{cropName}</td>
                          <td className="p-3 text-gray-300">{diseaseName}</td>
                          <td className="p-3 text-gray-300">{item.confidence}</td>
                          <td className="p-3 text-gray-300 text-sm">{new Date(item.date).toLocaleDateString()}</td>
                        </tr>
                      )})}
                    </tbody>
                  </table>
                  {recentDisease.length === 0 && <p className="text-center text-gray-500 py-4">No recent data found.</p>}
                </div>
              </div>

              {/* Yield Table */}
              <div className="bg-gray-900/40 backdrop-blur-xl p-6 rounded-2xl border border-white/10 shadow-lg">
                <div className="flex items-center gap-3 mb-6">
                  <Leaf className="w-6 h-6 text-farm-green" />
                  <h3 className="text-xl font-bold text-white">{t('dashboard.recentYieldTitle')}</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-gray-700/50">
                        <th className="p-3 text-xs uppercase tracking-wider text-gray-400 font-semibold">{t('dashboard.farmer')}</th>
                        <th className="p-3 text-xs uppercase tracking-wider text-gray-400 font-semibold">{t('dashboard.cropName')}</th>
                        <th className="p-3 text-xs uppercase tracking-wider text-gray-400 font-semibold">{t('dashboard.area')}</th>
                        <th className="p-3 text-xs uppercase tracking-wider text-gray-400 font-semibold">{t('dashboard.predictedYield')}</th>
                        <th className="p-3 text-xs uppercase tracking-wider text-gray-400 font-semibold">{t('dashboard.date')}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-700/30">
                      {recentYield.map((item, index) => {
                        const cropName = t(`dashboard.crops.${item.cropName}`) !== `dashboard.crops.${item.cropName}` ? t(`dashboard.crops.${item.cropName}`) : item.cropName;
                        const predictedNum = parseFloat(item.predictedYield);
                        return (
                        <tr key={index} className="hover:bg-white/5 transition-colors group">
                          <td className="p-3 font-medium text-gray-200">{item.farmer}</td>
                          <td className="p-3 font-medium text-gray-200">{cropName}</td>
                          <td className="p-3 text-gray-300">{item.area} {t('dashboard.acres')}</td>
                          <td className="p-3 text-farm-green font-bold">{predictedNum} {t('dashboard.tonsHectare')}</td>
                          <td className="p-3 text-gray-300 text-sm">{new Date(item.date).toLocaleDateString()}</td>
                        </tr>
                      )})}
                    </tbody>
                  </table>
                  {recentYield.length === 0 && <p className="text-center text-gray-500 py-4">No recent data found.</p>}
                </div>
              </div>

              {/* Visualizations Grid inside Left Column */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Disease Distribution */}
                <div className="bg-gray-900/40 backdrop-blur-xl p-6 rounded-2xl border border-white/10 shadow-lg">
                  <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2"><PieChartIcon className="w-5 h-5 text-farm-green"/> {t('dashboard.diseaseDistribution')}</h3>
                  <div className="h-[250px] w-full">
                    {analytics?.diseaseDistribution?.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={analytics.diseaseDistribution}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            paddingAngle={5}
                            dataKey="value"
                          >
                            {analytics.diseaseDistribution.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <RechartsTooltip contentStyle={{ backgroundColor: '#111827', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}/>
                        </PieChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="flex justify-center items-center h-full text-gray-500 text-sm">No disease data</div>
                    )}
                  </div>
                  <div className="flex flex-wrap justify-center gap-3 mt-4">
                    {(analytics?.diseaseDistribution || []).map((entry, index) => {
                      const diseaseName = t(`dashboard.diseaseNames.${entry.name}`) !== `dashboard.diseaseNames.${entry.name}` ? t(`dashboard.diseaseNames.${entry.name}`) : entry.name;
                      return (
                      <div key={index} className="flex items-center gap-2 text-xs">
                        <div className="w-3 h-3 rounded-full" style={{backgroundColor: COLORS[index % COLORS.length]}}></div>
                        <span className="text-gray-300">{diseaseName} ({entry.value})</span>
                      </div>
                    )})}
                  </div>
                </div>

                {/* Crop Health Overview */}
                <div className="bg-gray-900/40 backdrop-blur-xl p-6 rounded-2xl border border-white/10 shadow-lg h-full">
                  <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2"><TrendingUp className="w-5 h-5 text-farm-green"/> {t('dashboard.cropHealth')}</h3>
                  <div className="space-y-4">
                    {analytics?.cropHealth?.length > 0 ? (
                      analytics.cropHealth.map((crop, index) => {
                        const cropName = t(`dashboard.crops.${crop.name}`) !== `dashboard.crops.${crop.name}` ? t(`dashboard.crops.${crop.name}`) : crop.name;
                        return (
                        <div key={index}>
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-gray-300">{cropName}</span>
                            <span className="font-bold text-white">{crop.health}% {t('dashboard.healthy')}</span>
                          </div>
                          <div className="w-full bg-gray-700/50 rounded-full h-2">
                            <div className="bg-gradient-to-r from-farm-green to-blue-500 h-2 rounded-full" style={{width: `${crop.health}%`}}></div>
                          </div>
                        </div>
                      )})
                    ) : (
                      <div className="flex justify-center items-center h-32 text-gray-500 text-sm">No health data</div>
                    )}
                  </div>
                </div>
              </div>

              {/* Dynamic Monthly Profit Analysis */}
              <div className="bg-gray-900/40 backdrop-blur-xl p-6 rounded-2xl border border-white/10 shadow-lg mt-8">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-bold text-white">{t('dashboard.monthlyChart')}</h3>
                  <select 
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(e.target.value)}
                    className="bg-black/50 border border-white/10 text-white text-sm rounded-lg focus:ring-farm-green focus:border-farm-green block p-2 outline-none"
                  >
                    <option value="2026">2026</option>
                    <option value="2025">2025</option>
                    <option value="2024">2024</option>
                  </select>
                </div>
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={monthlyProfitData.map(d => ({...d, month: t(`dashboard.months.${d.month}`) !== `dashboard.months.${d.month}` ? t(`dashboard.months.${d.month}`) : d.month}))}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
                      <XAxis dataKey="month" stroke="#9CA3AF" axisLine={false} tickLine={false} />
                      <YAxis stroke="#9CA3AF" axisLine={false} tickLine={false} />
                      <RechartsTooltip contentStyle={{ backgroundColor: '#111827', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }} cursor={{fill: 'rgba(255,255,255,0.05)'}}/>
                      <Bar dataKey="Wheat" fill="#F59E0B" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="Rice" fill="#10B981" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="Corn" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="Tomato" fill="#EF4444" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

            </div>

            {/* Right Col: Analytics */}
            <div className="space-y-8">
              
              {/* AI Recommendation */}
              <div className="bg-gradient-to-br from-farm-green/20 to-blue-900/20 backdrop-blur-xl p-6 rounded-2xl border border-farm-green/30 shadow-[0_0_15px_rgba(16,185,129,0.15)] sticky top-6">
                <div className="flex items-center gap-2 mb-4">
                  <Zap className="w-5 h-5 text-yellow-400" />
                  <h3 className="font-bold text-white uppercase tracking-wider text-sm">{t('dashboard.globalInsight')}</h3>
                </div>
                <p className="text-gray-200 text-lg italic leading-relaxed">
                  "{t('dashboard.irrigationAdvice')}"
                </p>
                <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2 border-t border-white/10 pt-6"><Cpu className="w-5 h-5 text-farm-green"/> {t('dashboard.liveAnalytics')}</h3>
                <div className="space-y-4">
                  <AnalyticsRow label={t('dashboard.mostCommonDisease')} value={t(`dashboard.diseaseNames.${analytics?.mostCommonDisease}`) !== `dashboard.diseaseNames.${analytics?.mostCommonDisease}` ? t(`dashboard.diseaseNames.${analytics?.mostCommonDisease}`) : analytics?.mostCommonDisease} color="text-red-400" />
                  <AnalyticsRow label={t('dashboard.topAnalyzedCrop')} value={t(`dashboard.crops.${analytics?.topPerformingCrop}`) !== `dashboard.crops.${analytics?.topPerformingCrop}` ? t(`dashboard.crops.${analytics?.topPerformingCrop}`) : analytics?.topPerformingCrop} color="text-green-400" />
                  <AnalyticsRow label={t('dashboard.systemAvgYield')} value={analytics?.avgYield ? parseFloat(analytics.avgYield) + " " + t('dashboard.tons') : ""} color="text-blue-400" />
                </div>
              </div>

            </div>
          </div>
        </div>
      )}

      {activeTab === 'profile' && (
        <div className="space-y-8">
          <div className="bg-gray-900/40 backdrop-blur-xl p-8 rounded-2xl border border-farm-green/30 shadow-[0_0_15px_rgba(16,185,129,0.1)] relative overflow-hidden">
            <h2 className="text-3xl font-bold mb-2 text-white">{t('profile.title')}</h2>
            <p className="text-gray-400 mb-8">{t('profile.subtitle')}</p>
            
            {userInfo && (
              <div className="bg-black/30 p-8 rounded-2xl border border-white/10 flex flex-col md:flex-row gap-8 items-center md:items-start relative z-10">
                <div className="w-32 h-32 bg-farm-green/20 rounded-full flex items-center justify-center border-4 border-farm-green shadow-[0_0_20px_rgba(16,185,129,0.3)]">
                  <User className="w-16 h-16 text-farm-green" />
                </div>
                <div className="flex-1 w-full">
                  <h3 className="text-3xl font-black text-white mb-6">{userInfo.name}</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                    <ProfileField label={t('profile.email')} value={userInfo.email} />
                    <ProfileField label={t('profile.phone')} value={userInfo.phone || 'Not provided'} />
                    <ProfileField label={t('profile.location')} value={userInfo.location || 'Not provided'} />
                    <ProfileField label={t('profile.language')} value={userInfo.language === 'te' ? t('profile.telugu') : t('profile.english')} />
                    <ProfileField label={t('profile.joined')} value={new Date(userInfo.created_at).toLocaleDateString()} />
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-gray-900/40 backdrop-blur-xl p-6 rounded-2xl border border-white/10 shadow-lg">
              <h3 className="text-xl font-bold mb-6 text-white">{t('profile.diseaseHistory')}</h3>
              <div className="h-[300px] w-full">
                {diseaseChartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={diseaseChartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
                      <XAxis dataKey="name" stroke="#9CA3AF" axisLine={false} tickLine={false} />
                      <YAxis stroke="#9CA3AF" axisLine={false} tickLine={false} />
                      <RechartsTooltip contentStyle={{ backgroundColor: '#111827', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }} />
                      <Line type="monotone" dataKey="confidence" stroke="#10B981" strokeWidth={3} dot={{ r: 4, fill: '#10B981', strokeWidth: 2, stroke: '#111827' }} activeDot={{ r: 8 }} />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex justify-center items-center h-full text-gray-500 text-sm">{t('profile.noDiseaseData')}</div>
                )}
              </div>
            </div>

            <div className="bg-gray-900/40 backdrop-blur-xl p-6 rounded-2xl border border-white/10 shadow-lg">
              <h3 className="text-xl font-bold mb-6 text-white">{t('profile.yieldAnalytics')}</h3>
              <div className="h-[300px] w-full">
                {yieldChartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={yieldChartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
                      <XAxis dataKey="name" stroke="#9CA3AF" axisLine={false} tickLine={false} />
                      <YAxis stroke="#9CA3AF" axisLine={false} tickLine={false} />
                      <RechartsTooltip contentStyle={{ backgroundColor: '#111827', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }} cursor={{fill: 'rgba(255,255,255,0.05)'}} />
                      <Bar dataKey="yield" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex justify-center items-center h-full text-gray-500 text-sm">{t('profile.noYieldData')}</div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const SummaryCard = ({ icon, title, value }) => (
  <div className="bg-gray-900/40 backdrop-blur-xl p-6 rounded-2xl border border-white/10 shadow-lg hover:border-farm-green/50 transition-all hover:-translate-y-1 group cursor-default relative overflow-hidden">
    <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-[40px] group-hover:bg-farm-green/10 transition-colors"></div>
    <div className="flex justify-between items-start mb-4 relative z-10">
      <div className="p-3 bg-black/40 rounded-xl border border-white/5 group-hover:border-farm-green/30 transition-colors">
        {icon}
      </div>
    </div>
    <div className="relative z-10">
      <p className="text-sm text-gray-400 font-medium mb-1">{title}</p>
      <h3 className="text-3xl font-black text-white">{value}</h3>
    </div>
  </div>
);

const AnalyticsRow = ({ label, value, color }) => (
  <div className="flex justify-between items-center py-3 border-b border-gray-700/50 last:border-0">
    <span className="text-gray-400 text-sm">{label}</span>
    <span className={`font-bold ${color}`}>{value}</span>
  </div>
);

const ProfileField = ({ label, value }) => (
  <div className="bg-black/20 p-4 rounded-xl border border-white/5">
    <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">{label}</p>
    <p className="text-gray-200 font-medium">{value}</p>
  </div>
);

export default Dashboard;
