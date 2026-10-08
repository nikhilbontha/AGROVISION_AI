import React, { useState, useEffect } from 'react';
import { BarChart3, Calendar, Filter, Users, Activity, Wheat } from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import ChartCard from '../components/ChartCard';
import StatCard from '../components/StatCard';
import { adminApi } from '../services/adminApi';

const DedicatedAnalytics = () => {
  const [range, setRange] = useState('30d');
  const [stats, setStats] = useState(null);
  const [analyticsData, setAnalyticsData] = useState({
    diseaseDistribution: [],
    cropWiseDetections: [],
    yieldTrend: [],
    detectionTrend: [],
    userGrowth: []
  });

  useEffect(() => {
    const loadRealAnalytics = async () => {
      const statsRes = await adminApi.getDashboardStats();
      const analyticsRes = await adminApi.getAnalyticsData(range);
      setStats(statsRes);
      setAnalyticsData(analyticsRes);
    };
    loadRealAnalytics();
  }, [range]);

  return (
    <div className="space-y-6">
      {/* Title Bar & Date Filter Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-farm-card/90 p-5 rounded-2xl border border-slate-800 shadow-xl">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-farm-green" /> Dedicated Platform Analytics
          </h2>
          <p className="text-xs text-slate-400">Real-time MongoDB Atlas statistical reporting for users, diseases, and yield forecasts</p>
        </div>

        {/* Date Range Selector Pills */}
        <div className="flex flex-wrap items-center gap-1.5 bg-farm-dark p-1 rounded-xl border border-slate-800">
          {[
            { id: '7d', label: '7 Days' },
            { id: '30d', label: '30 Days' },
            { id: '3m', label: '3 Months' },
            { id: '6m', label: '6 Months' },
            { id: '1y', label: '1 Year' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setRange(item.id)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
                range === item.id
                  ? 'bg-farm-green text-black font-bold shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* User Analytics Section */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider text-emerald-400">
          👥 1. User Engagement & Growth Analytics
        </h3>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="space-y-4">
            <StatCard title="Total Registered Farmers" value={stats?.total_users ?? 0} changeLabel="registered in MongoDB" icon={Users} color="emerald" />
            <StatCard title="Active Monthly Users" value={stats?.active_users ?? 0} changeLabel="active accounts" icon={Users} color="cyan" />
            <StatCard title="Disease Scans Recorded" value={stats?.total_disease_detections ?? 0} changeLabel="computer vision scans" icon={Activity} color="amber" />
          </div>

          <div className="lg:col-span-2">
            <ChartCard title="User Acquisition & Active User Growth" subtitle="Real-time MongoDB user metrics">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={analyticsData.userGrowth}>
                  <defs>
                    <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2ecc71" stopOpacity={0.5}/>
                      <stop offset="95%" stopColor="#2ecc71" stopOpacity={0.05}/>
                    </linearGradient>
                    <linearGradient id="colorActive" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.05}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="period" stroke="#64748b" tick={{ fontSize: 11 }} />
                  <YAxis stroke="#64748b" tick={{ fontSize: 11 }} allowDecimals={false} />
                  <Tooltip contentStyle={{ backgroundColor: '#16213e', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }} />
                  <Legend verticalAlign="top" height={36} iconSize={10} wrapperStyle={{ fontSize: '11px', color: '#94a3b8' }} />
                  <Area type="monotone" dataKey="total" stroke="#2ecc71" strokeWidth={3} fillOpacity={1} fill="url(#colorTotal)" name="Total Farmers" dot={{ r: 4, fill: '#2ecc71', stroke: '#16213e', strokeWidth: 2 }} />
                  <Area type="monotone" dataKey="active" stroke="#3b82f6" strokeWidth={2.5} fillOpacity={1} fill="url(#colorActive)" name="Active Accounts" dot={{ r: 4, fill: '#3b82f6', stroke: '#16213e', strokeWidth: 2 }} />
                </AreaChart>
              </ResponsiveContainer>
            </ChartCard>
          </div>
        </div>
      </div>

      {/* Disease Analytics Section */}
      <div className="space-y-4 pt-4">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider text-amber-400">
          🦠 2. Disease Pathology & Frequency Analytics
        </h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ChartCard title="Most Detected Pathogens" subtitle="Real distribution of detected plant diseases from MongoDB">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={analyticsData.diseaseDistribution}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="value"
                  label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                  labelLine={false}
                >
                  {analyticsData.diseaseDistribution.map((entry, idx) => (
                    <Cell key={`cell-${idx}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#16213e', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }} />
              </PieChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="Crop Disease Breakdown" subtitle="Real infected vs healthy scans per crop from database">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analyticsData.cropWiseDetections}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="crop" stroke="#64748b" tick={{ fontSize: 11 }} />
                <YAxis stroke="#64748b" tick={{ fontSize: 11 }} />
                <Tooltip contentStyle={{ backgroundColor: '#16213e', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }} />
                <Bar dataKey="count" fill="#ef4444" radius={[4, 4, 0, 0]} name="Infected Scans" />
                <Bar dataKey="healthy" fill="#2ecc71" radius={[4, 4, 0, 0]} name="Healthy Scans" />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>
      </div>

      {/* Yield Analytics Section */}
      <div className="space-y-4 pt-4">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider text-purple-400">
          🌾 3. Crop Yield & Production Forecast Analytics
        </h3>
        <ChartCard title="Predicted Metric Yield vs Target Benchmarks" subtitle="Real average predicted yield per crop from MongoDB (Tons/Hectare)">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={analyticsData.yieldTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="month" stroke="#64748b" tick={{ fontSize: 11 }} />
              <YAxis stroke="#64748b" tick={{ fontSize: 11 }} />
              <Tooltip contentStyle={{ backgroundColor: '#16213e', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }} />
              <Line type="monotone" dataKey="avgYield" stroke="#a855f7" strokeWidth={3} dot={{ r: 5 }} name="Avg Yield Forecast" />
              <Line type="monotone" dataKey="target" stroke="#06b6d4" strokeDasharray="4 4" strokeWidth={2} name="Benchmark Target" />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
    </div>
  );
};

export default DedicatedAnalytics;
