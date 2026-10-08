import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  Activity,
  TrendingUp,
  Wheat,
  Cpu,
  UserCheck,
  PlusCircle,
  Eye,
  Scan,
  CheckCircle2,
  ArrowRight
} from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import StatCard from '../components/StatCard';
import ChartCard from '../components/ChartCard';
import StatusBadge from '../components/StatusBadge';
import { adminApi } from '../services/adminApi';
import { useAdmin } from '../context/AdminContext';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { addToast } = useAdmin();
  const [stats, setStats] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [recentDetections, setRecentDetections] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const statsRes = await adminApi.getDashboardStats();
      const analyticsRes = await adminApi.getAnalyticsData('30d');
      const detectionsRes = await adminApi.getDetections();

      setStats(statsRes);
      setAnalytics(analyticsRes);
      setRecentDetections(detectionsRes.slice(0, 6));
      setLoading(false);
    };

    fetchData();
  }, []);

  return (
    <div className="space-[#16213e] space-y-6">
      {/* Page Title & Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-gradient-to-r from-farm-card via-slate-900 to-farm-card p-6 rounded-2xl border border-slate-800 shadow-xl">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
            Welcome, System Administrator 👋
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Real-time MongoDB Atlas analytics and monitoring for AgroVision AI platform.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
            MongoDB Connected
          </span>
        </div>
      </div>

      {/* 1. Summary Cards (Real Database Counts) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <StatCard
          title="Total Users"
          value={stats?.total_users ?? 0}
          changeLabel="registered in DB"
          icon={Users}
          color="emerald"
        />
        <StatCard
          title="Disease Detections"
          value={stats?.total_disease_detections ?? 0}
          changeLabel="scans in DB"
          icon={Activity}
          color="amber"
        />
        <StatCard
          title="Yield Predictions"
          value={stats?.total_yield_predictions ?? 0}
          changeLabel="forecasts in DB"
          icon={TrendingUp}
          color="cyan"
        />
        <StatCard
          title="Crop Diseases"
          value={stats?.number_of_crop_diseases ?? 0}
          changeLabel="cataloged"
          icon={Wheat}
          color="purple"
        />
        <StatCard
          title="Model Accuracy"
          value={`${stats?.model_accuracy ?? 96.4}%`}
          changeLabel="validation score"
          icon={Cpu}
          color="blue"
        />
        <StatCard
          title="Active Users"
          value={stats?.active_users ?? 0}
          changeLabel="active accounts"
          icon={UserCheck}
          color="rose"
        />
      </div>

      {/* 2. Charts Grid (4 Interactive Charts) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Disease Detection Trend (Area Chart) */}
        <ChartCard
          title="Disease Detection Trend"
          subtitle="Daily scan volume over the past 7 days"
        >
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={analytics?.detectionTrend || []}>
              <defs>
                <linearGradient id="colorDetections" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2ecc71" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#2ecc71" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="day" stroke="#64748b" tick={{ fontSize: 11 }} />
              <YAxis stroke="#64748b" tick={{ fontSize: 11 }} />
              <Tooltip contentStyle={{ backgroundColor: '#16213e', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }} />
              <Area type="monotone" dataKey="detections" stroke="#2ecc71" strokeWidth={3} fillOpacity={1} fill="url(#colorDetections)" name="Detections" />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Disease Distribution (Donut Chart) */}
        <ChartCard
          title="Disease Distribution"
          subtitle="Proportion of detected plant diseases"
        >
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={analytics?.diseaseDistribution || []}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={85}
                paddingAngle={4}
                dataKey="value"
              >
                {(analytics?.diseaseDistribution || []).map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ backgroundColor: '#16213e', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }} />
              <Legend verticalAlign="bottom" height={36} iconSize={10} wrapperStyle={{ fontSize: '11px', color: '#94a3b8' }} />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Crop-wise Detection (Bar Chart) */}
        <ChartCard
          title="Crop-wise Disease Scans"
          subtitle="Detections grouped by crop type"
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={analytics?.cropWiseDetections || []}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="crop" stroke="#64748b" tick={{ fontSize: 11 }} />
              <YAxis stroke="#64748b" tick={{ fontSize: 11 }} />
              <Tooltip contentStyle={{ backgroundColor: '#16213e', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }} />
              <Bar dataKey="count" fill="#3b82f6" radius={[6, 6, 0, 0]} name="Infected Scans" />
              <Bar dataKey="healthy" fill="#2ecc71" radius={[6, 6, 0, 0]} name="Healthy Scans" />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Yield Prediction Trend (Line Chart) */}
        <ChartCard
          title="Yield Prediction Trends"
          subtitle="Average predicted metric yield (Tons/Hectare)"
        >
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={analytics?.yieldTrend || []}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="month" stroke="#64748b" tick={{ fontSize: 11 }} />
              <YAxis stroke="#64748b" tick={{ fontSize: 11 }} />
              <Tooltip contentStyle={{ backgroundColor: '#16213e', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }} />
              <Line type="monotone" dataKey="avgYield" stroke="#a855f7" strokeWidth={3} dot={{ r: 4 }} name="Avg Predicted Yield" />
              <Line type="monotone" dataKey="target" stroke="#64748b" strokeDasharray="5 5" strokeWidth={2} name="Benchmark Target" />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* 3. Quick Actions Banner */}
      <div className="bg-farm-card/90 backdrop-blur-md rounded-2xl p-5 border border-slate-800 shadow-xl">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
          ⚡ Quick Administrative Actions
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
          <button
            onClick={() => navigate('/admin/crops', { state: { openAdd: true } })}
            className="flex items-center justify-center gap-2 p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20 rounded-xl text-xs font-semibold transition-colors shadow-lg"
          >
            <PlusCircle className="w-4 h-4" /> Add Crop
          </button>
          <button
            onClick={() => navigate('/admin/diseases', { state: { openAdd: true } })}
            className="flex items-center justify-center gap-2 p-3 bg-amber-500/10 border border-amber-500/30 text-amber-400 hover:bg-amber-500/20 rounded-xl text-xs font-semibold transition-colors shadow-lg"
          >
            <PlusCircle className="w-4 h-4" /> Add Disease
          </button>
          <button
            onClick={() => navigate('/admin/users')}
            className="flex items-center justify-center gap-2 p-3 bg-blue-500/10 border border-blue-500/30 text-blue-400 hover:bg-blue-500/20 rounded-xl text-xs font-semibold transition-colors shadow-lg"
          >
            <Users className="w-4 h-4" /> View Users
          </button>
          <button
            onClick={() => navigate('/admin/detections')}
            className="flex items-center justify-center gap-2 p-3 bg-purple-500/10 border border-purple-500/30 text-purple-400 hover:bg-purple-500/20 rounded-xl text-xs font-semibold transition-colors shadow-lg"
          >
            <Scan className="w-4 h-4" /> Detection Log
          </button>
          <button
            onClick={() => navigate('/admin/predictions')}
            className="flex items-center justify-center gap-2 p-3 bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/20 rounded-xl text-xs font-semibold transition-colors shadow-lg"
          >
            <TrendingUp className="w-4 h-4" /> Yield Log
          </button>
        </div>
      </div>

      {/* 4. Recent Activity Table */}
      <div className="bg-farm-card/90 backdrop-blur-md rounded-2xl border border-slate-800 shadow-xl overflow-hidden">
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-white">Recent System Activity</h3>
            <p className="text-xs text-slate-400">Latest disease detections and yield predictions across farmers</p>
          </div>
          <button
            onClick={() => navigate('/admin/detections')}
            className="flex items-center gap-1 text-xs text-farm-green font-bold hover:underline"
          >
            View All <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-farm-dark/80 text-slate-400 font-semibold uppercase border-b border-slate-800">
              <tr>
                <th className="px-5 py-3.5">User</th>
                <th className="px-5 py-3.5">Crop</th>
                <th className="px-5 py-3.5">Activity</th>
                <th className="px-5 py-3.5">Disease / Result</th>
                <th className="px-5 py-3.5">Confidence</th>
                <th className="px-5 py-3.5">Date</th>
                <th className="px-5 py-3.5">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-200">
              {recentDetections.map((row) => (
                <tr key={row.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="px-5 py-3.5 font-medium text-white">{row.user_name}</td>
                  <td className="px-5 py-3.5">{row.crop}</td>
                  <td className="px-5 py-3.5">
                    <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-medium text-[11px]">
                      Disease Scan
                    </span>
                  </td>
                  <td className="px-5 py-3.5 font-semibold text-emerald-400">{row.disease}</td>
                  <td className="px-5 py-3.5 font-mono">{row.confidence}%</td>
                  <td className="px-5 py-3.5 text-slate-400">{row.date}</td>
                  <td className="px-5 py-3.5">
                    <StatusBadge status={row.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
