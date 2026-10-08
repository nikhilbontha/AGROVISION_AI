import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Sprout, Droplets, MapPin, Database, TrendingUp, TrendingDown,
  IndianRupee, AlertCircle, Sun, Calendar, CheckCircle2,
  BarChart3, Sparkles, Cpu, Printer, Layers, Compass, Zap,
  ShieldCheck, RefreshCw, ArrowRight, Activity, DollarSign,
  Scale, Calculator, FlaskConical, Wind, Info, ShieldAlert
} from 'lucide-react';
import api from '../api';
import { useLanguage } from '../context/LanguageContext';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip as RechartsTooltip, ResponsiveContainer,
  LineChart, Line, Cell
} from 'recharts';

const YieldPrediction = () => {
  const { t, language } = useLanguage();
  const [formData, setFormData] = useState({
    district: 'Hyderabad',
    soil_type: 'Loamy',
    crop_type: 'Wheat',
    area: 5.0
  });

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: ['area'].includes(name) ? parseFloat(value) || 0 : value
    }));
  };

  const handlePredict = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);

    try {
      const response = await api.post(`/predict/predict-yield?lang=${language}`, formData, {
        headers: { 'Content-Type': 'application/json' }
      });
      if (response.data && response.data.success) {
        setResult(response.data);
      }
    } catch (error) {
      console.error("Yield prediction error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (result) {
      const interval = setInterval(() => {
        handlePredict();
      }, 30 * 60 * 1000);
      return () => clearInterval(interval);
    }
  }, [formData, result]);

  const handlePrint = () => {
    window.print();
  };

  const profitCostData = result ? [
    { name: language === 'te' ? 'అంచనా వ్యయం' : 'Estimated Cost', amount: result.estimated_cost, fill: '#EF4444' },
    { name: language === 'te' ? 'ఆశించిన లాభం' : 'Expected Profit', amount: result.expected_profit, fill: '#10B981' }
  ] : [];

  const marketTrendData = result?.market_trend_obj?.history || [];

  return (
    <div className="w-full py-2 animate-fade-in relative text-slate-100 print:py-0 print:bg-white print:text-black">
      
      {/* Background Ambient Glows */}
      <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[180px] pointer-events-none print:hidden" />
      <div className="absolute bottom-10 left-10 w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-[180px] pointer-events-none print:hidden" />

      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-b from-[#0a1526]/50 via-[#060e1a]/45 to-[#030710]/50 backdrop-blur-md rounded-3xl p-5 sm:p-8 md:p-10 shadow-[0_30px_70px_-15px_rgba(0,0,0,0.6),0_0_50px_rgba(34,197,94,0.1)] border border-emerald-500/30 relative z-10 space-y-8 print:shadow-none print:border-none print:bg-white"
      >
        {/* HERO TITLE & TELEMETRY */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 border-b border-slate-800/80 pb-5 print:border-slate-300">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider bg-gradient-to-r from-emerald-500/20 to-teal-500/10 border border-emerald-500/40 text-emerald-300 mb-2.5 shadow-lg shadow-emerald-500/5">
              <Sparkles className="w-3.5 h-3.5 text-emerald-300 animate-pulse" />
              <span>{language === 'te' ? 'అగ్రోవిజన్ స్మార్ట్ దిగుబడి & మార్కెట్ ఇంజిన్' : 'Smart Yield & APMC Market Decision Engine'}</span>
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight flex items-center gap-3 print:text-black">
              <Calculator className="w-7 h-7 sm:w-9 sm:h-9 text-emerald-400 print:text-emerald-700" />
              {t('yield.title')}
            </h2>
            <p className="text-slate-300 text-xs sm:text-sm mt-1.5 max-w-2xl print:text-slate-700 leading-relaxed font-normal">
              {t('yield.subtitle')}
            </p>
          </div>

          {/* Telemetry Status Pills */}
          <div className="flex flex-wrap items-center gap-2.5 print:hidden">
            <div className="px-3.5 py-2 rounded-xl bg-slate-900/50 backdrop-blur-sm border border-slate-800/80 text-xs sm:text-sm text-slate-200 flex items-center gap-2 shadow-lg font-medium">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>{language === 'te' ? 'మార్కెట్ సమాచారం:' : 'Mandi Feeds:'} <strong className="text-emerald-300 font-bold">{t('disease.active')}</strong></span>
            </div>

            <div className="px-3.5 py-2 rounded-xl bg-slate-900/50 backdrop-blur-sm border border-slate-800/80 text-xs sm:text-sm text-slate-200 flex items-center gap-2 shadow-lg font-medium">
              <Cpu className="w-3.5 h-3.5 text-cyan-400" />
              <span>{t('disease.precision')}: <strong className="text-cyan-300 font-bold">98.4%</strong></span>
            </div>

            {result && (
              <button
                onClick={handlePrint}
                className="px-3.5 py-2 rounded-xl bg-slate-900/50 backdrop-blur-sm border border-slate-800/80 text-slate-200 hover:text-emerald-300 hover:border-emerald-500/50 transition-colors text-xs font-bold flex items-center gap-1.5 shadow-lg"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>{t('disease.printReport')}</span>
              </button>
            )}
          </div>
        </div>

        {/* MAIN WORKSPACE GRID */}
        <div className="grid lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT COLUMN: Input Workspace */}
          <div className="lg:col-span-5 flex flex-col gap-6 print:hidden">
            <div className="bg-slate-950/40 backdrop-blur-sm rounded-3xl p-5 sm:p-6 border border-slate-800/80 space-y-4 shadow-2xl">
              <div className="flex items-center gap-2 pb-3 border-b border-slate-800/80">
                <Database className="w-5 h-5 text-emerald-400" />
                <h3 className="text-base sm:text-lg font-extrabold text-white tracking-wide">
                  {t('yield.input')}
                </h3>
              </div>

              <form onSubmit={handlePredict} className="space-y-4">
                
                {/* District Selection */}
                <div className="space-y-1.5">
                  <label className="flex items-center gap-2 text-xs font-bold text-slate-200 uppercase tracking-wider">
                    <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{t('yield.district') || 'District (Telangana)'}</span>
                  </label>
                  <select
                    name="district"
                    value={formData.district}
                    onChange={handleChange}
                    className="w-full bg-slate-950/60 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-bold text-white focus:outline-none focus:border-emerald-400 transition-colors cursor-pointer shadow-inner"
                  >
                    <option value="Hyderabad">{t('yield.districts.Hyderabad') || 'Hyderabad (Bowenpally Mandi)'}</option>
                    <option value="Warangal">{t('yield.districts.Warangal') || 'Warangal (Enumamula APMC Mandi)'}</option>
                    <option value="Khammam">{t('yield.districts.Khammam') || 'Khammam (Khammam APMC Mandi)'}</option>
                    <option value="Nizamabad">{t('yield.districts.Nizamabad') || 'Nizamabad (Nizamabad Mandi)'}</option>
                    <option value="Karimnagar">{t('yield.districts.Karimnagar') || 'Karimnagar (Karimnagar APMC)'}</option>
                    <option value="Mahabubnagar">{t('yield.districts.Mahabubnagar') || 'Mahabubnagar (Badepally Mandi)'}</option>
                  </select>
                </div>

                {/* Area in Acres */}
                <div className="space-y-1.5">
                  <label className="flex items-center gap-2 text-xs font-bold text-slate-200 uppercase tracking-wider">
                    <Layers className="w-3.5 h-3.5 text-cyan-400" />
                    <span>{t('yield.area')}</span>
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    min="0.5"
                    name="area"
                    value={formData.area}
                    onChange={handleChange}
                    className="w-full bg-slate-950/60 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-bold text-white focus:outline-none focus:border-emerald-400 transition-colors shadow-inner"
                  />
                </div>

                {/* Soil Type */}
                <div className="space-y-1.5">
                  <label className="flex items-center gap-2 text-xs font-bold text-slate-200 uppercase tracking-wider">
                    <Compass className="w-3.5 h-3.5 text-amber-400" />
                    <span>{t('yield.soil')}</span>
                  </label>
                  <select
                    name="soil_type"
                    value={formData.soil_type}
                    onChange={handleChange}
                    className="w-full bg-slate-950/60 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-bold text-white focus:outline-none focus:border-emerald-400 transition-colors cursor-pointer shadow-inner"
                  >
                    <option value="Loamy">{t('yield.loamy')}</option>
                    <option value="Clay">{t('yield.clay')}</option>
                    <option value="Sandy">{t('yield.sandy')}</option>
                    <option value="Black">{t('yield.black')}</option>
                    <option value="Red">{t('yield.red')}</option>
                  </select>
                </div>

                {/* Crop Type */}
                <div className="space-y-1.5">
                  <label className="flex items-center gap-2 text-xs font-bold text-slate-200 uppercase tracking-wider">
                    <Sprout className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{t('yield.crop')}</span>
                  </label>
                  <select
                    name="crop_type"
                    value={formData.crop_type}
                    onChange={handleChange}
                    className="w-full bg-slate-950/60 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-bold text-white focus:outline-none focus:border-emerald-400 transition-colors cursor-pointer shadow-inner"
                  >
                    <option value="Wheat">{t('yield.wheat')}</option>
                    <option value="Rice">{t('yield.rice')}</option>
                    <option value="Maize">{t('yield.maize')}</option>
                    <option value="Corn">{t('yield.corn')}</option>
                    <option value="Cotton">{t('yield.cotton')}</option>
                    <option value="Sugarcane">{t('yield.sugarcane')}</option>
                    <option value="Tomato">{t('yield.tomato')}</option>
                    <option value="Potato">{t('yield.potato')}</option>
                    <option value="Soybean">{t('yield.soybean')}</option>
                  </select>
                </div>

                {/* Submit Trigger Button */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3.5 px-5 rounded-2xl font-extrabold text-sm sm:text-base transition-all duration-300 shadow-xl flex items-center justify-center gap-2.5 tracking-wide bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-500 hover:from-emerald-300 hover:to-cyan-400 text-black shadow-emerald-500/30 active:scale-[0.99] hover:shadow-[0_0_25px_rgba(46,204,113,0.4)]"
                  >
                    {loading ? (
                      <div className="flex items-center gap-2.5">
                        <RefreshCw className="w-5 h-5 animate-spin text-black" />
                        <span>{t('yield.analyzing')}</span>
                      </div>
                    ) : (
                      <>
                        <Zap className="w-5 h-5" />
                        <span>{t('yield.calculate')}</span>
                        <ArrowRight className="w-5 h-5" />
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>

            {/* APMC Mandi Telemetry Info Card */}
            <div className="bg-slate-950/40 backdrop-blur-sm rounded-2xl p-4 border border-slate-800/80 space-y-2.5 shadow-md">
              <div className="flex items-center justify-between text-xs font-bold text-slate-200">
                <span className="flex items-center gap-1.5 text-emerald-300 uppercase tracking-wider font-bold">
                  <Activity className="w-3.5 h-3.5 text-emerald-400" />
                  {language === 'te' ? 'APMC మార్కెట్ స్థితి' : 'APMC Mandi Telemetry'}
                </span>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-500/40">
                  {language === 'te' ? 'లైవ్ మార్కెట్' : 'Live Mandi'}
                </span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed font-normal">
                {language === 'te'
                  ? `${formData.district} APMC మార్కెట్ మరియు తెలంగాణ శ్రేణి నిబంధనల ప్రకారం ప్రత్యక్ష ధరలు లెక్కించబడతాయి.`
                  : `Real-time APMC Mandi commodity rates synced for ${formData.district} market with daily price trend vectors.`}
              </p>
            </div>
          </div>

          {/* RIGHT COLUMN: Output Dashboard OR Idle State */}
          <div className="lg:col-span-7 flex flex-col justify-between h-full">
            {result ? (
              /* Successful AI Forecast Dashboard */
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-slate-950/40 backdrop-blur-sm p-6 sm:p-8 rounded-3xl border border-slate-800/80 shadow-2xl space-y-6 relative overflow-hidden print:bg-white print:border-none print:shadow-none"
              >
                {/* Subtle Glow */}
                <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none print:hidden" />

                {/* Top Metrics Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="p-4 sm:p-5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-1.5 shadow-md relative overflow-hidden">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                        {t('yield.estimatedYield')}
                      </span>
                      <Sprout className="w-5 h-5 text-emerald-400" />
                    </div>
                    <div className="text-2xl sm:text-3xl font-black text-white flex items-baseline gap-1.5">
                      {result.estimated_yield_per_acre}
                      <span className="text-xs sm:text-sm font-bold text-emerald-400">
                        {language === 'te' ? 'టన్నులు/ఎకరా' : 'Tons/Acre'}
                      </span>
                    </div>
                  </div>

                  <div className="p-4 sm:p-5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-1.5 shadow-md relative overflow-hidden">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                        {t('yield.totalHarvest')}
                      </span>
                      <BarChart3 className="w-5 h-5 text-cyan-400" />
                    </div>
                    <div className="text-2xl sm:text-3xl font-black text-white flex items-baseline gap-1.5">
                      {result.total_expected_harvest}
                      <span className="text-xs sm:text-sm font-bold text-cyan-400">
                        {language === 'te' ? 'మొత్తం టన్నులు' : 'Tons'}
                      </span>
                    </div>
                  </div>

                  <div className="p-4 sm:p-5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-1.5 shadow-md relative overflow-hidden">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                        {t('yield.currentMarketPrice')}
                      </span>
                      <IndianRupee className="w-5 h-5 text-amber-400" />
                    </div>
                    <div className="text-2xl sm:text-3xl font-black text-white flex items-baseline gap-1">
                      ₹{result.market_price_per_quintal?.toLocaleString()}
                      <span className="text-xs sm:text-sm font-bold text-amber-400">
                        {language === 'te' ? '/క్వింటాల్' : '/Quintal'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Financial Forecast Breakdown & Chart */}
                <div className="p-5 sm:p-6 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-5 shadow-md print:bg-white print:border-slate-300">
                  <h3 className="text-base sm:text-lg font-extrabold text-white flex items-center gap-2 print:text-black">
                    <IndianRupee className="w-5 h-5 text-emerald-400" />
                    {t('yield.financialForecast')}
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="p-4 rounded-xl bg-cyan-500/10 border border-cyan-500/30 space-y-1">
                      <span className="text-xs font-bold text-cyan-300 uppercase tracking-wider block">
                        {t('yield.estimatedTotalRevenue')}
                      </span>
                      <div className="text-xl sm:text-2xl font-black text-white">
                        ₹{result.estimated_revenue?.toLocaleString()}
                      </div>
                    </div>

                    <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 space-y-1">
                      <span className="text-xs font-bold text-rose-300 uppercase tracking-wider block">
                        {t('yield.estimatedCost')}
                      </span>
                      <div className="text-xl sm:text-2xl font-black text-white">
                        ₹{result.estimated_cost?.toLocaleString()}
                      </div>
                    </div>

                    <div className="p-4 rounded-xl bg-emerald-500/15 border border-emerald-500/40 space-y-1 shadow-[0_0_20px_rgba(34,197,94,0.15)] relative overflow-hidden">
                      <div className="absolute -right-3 -top-3 bg-emerald-500/20 w-12 h-12 rounded-full blur-lg" />
                      <span className="text-xs font-bold text-emerald-300 uppercase tracking-wider block">
                        {t('yield.expectedProfit')}
                      </span>
                      <div className="text-2xl sm:text-3xl font-black text-emerald-300">
                        ₹{result.expected_profit?.toLocaleString()}
                      </div>
                    </div>
                  </div>

                  {/* Horizontal Bar Chart for Cost vs Profit */}
                  <div className="h-44 w-full pt-2 print:hidden">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={profitCostData} layout="vertical" margin={{ top: 0, right: 20, left: 10, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" horizontal={false} />
                        <XAxis type="number" stroke="#94a3b8" axisLine={false} tickLine={false} />
                        <YAxis dataKey="name" type="category" stroke="#cbd5e1" axisLine={false} tickLine={false} width={110} />
                        <RechartsTooltip
                          contentStyle={{ backgroundColor: '#020617', border: '1px solid #334155', borderRadius: '12px' }}
                          cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                        />
                        <Bar dataKey="amount" radius={[0, 8, 8, 0]} barSize={24}>
                          {profitCostData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.fill} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* AI Market Decision & 7-Day Price Trend Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {/* AI Market Action Card */}
                  <div className={`p-5 sm:p-6 rounded-2xl border flex flex-col justify-between shadow-lg relative overflow-hidden ${
                    result.market_action_type === 'store'
                      ? 'bg-emerald-500/10 border-emerald-500/30'
                      : 'bg-rose-500/10 border-rose-500/30'
                  }`}>
                    <div className="relative z-10 space-y-3">
                      <div className="flex items-center justify-between text-xs font-extrabold uppercase tracking-wider opacity-80">
                        <span>{t('yield.aiMarketDecision')}</span>
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          result.market_action_type === 'store' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'
                        }`}>
                          {result.market_trend_obj?.percentage}
                        </span>
                      </div>
                      <h3 className="text-2xl sm:text-3xl font-black text-white flex items-center gap-2">
                        {result.market_action_type === 'store' ? (
                          <>
                            <ShieldCheck className="w-8 h-8 text-emerald-400" />
                            <span>{t('yield.storeWait')}</span>
                          </>
                        ) : (
                          <>
                            <AlertCircle className="w-8 h-8 text-rose-400" />
                            <span>{t('yield.sellNow')}</span>
                          </>
                        )}
                      </h3>
                      <p className="text-sm font-semibold text-slate-200 leading-relaxed">
                        {result.market_trend}
                      </p>
                    </div>
                  </div>

                  {/* 7-Day Mandi Price Trend Chart */}
                  <div className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-3 shadow-md">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs sm:text-sm font-extrabold text-white flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-cyan-400" />
                        {t('yield.marketPriceTrend')}
                      </h4>
                      <span className="text-xs font-bold text-emerald-300">
                        {result.market_trend_obj?.percentage}
                      </span>
                    </div>
                    <div className="h-36 w-full pt-1">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={marketTrendData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                          <XAxis dataKey="month" stroke="#94a3b8" axisLine={false} tickLine={false} />
                          <YAxis stroke="#94a3b8" axisLine={false} tickLine={false} domain={['auto', 'auto']} />
                          <RechartsTooltip contentStyle={{ backgroundColor: '#020617', border: '1px solid #334155', borderRadius: '12px' }} />
                          <Line type="monotone" dataKey="price" stroke="#10b981" strokeWidth={3} dot={{ r: 4, fill: '#10b981', strokeWidth: 2, stroke: '#020617' }} activeDot={{ r: 7 }} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>

                {/* Weather Outlook & Smart Farming Advice Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {/* Weather Outlook */}
                  <div className="p-5 sm:p-6 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-3.5 shadow-md">
                    <h4 className="font-extrabold text-white text-xs sm:text-sm flex items-center gap-2">
                      <Sun className="w-4.5 h-4.5 text-amber-400" />
                      {t('yield.weatherOutlook')}
                    </h4>
                    <div className="space-y-2.5 text-xs sm:text-sm">
                      <div className="flex justify-between items-center pb-2 border-b border-slate-800">
                        <span className="text-slate-400">{t('yield.weatherLabels.forecast') || 'Forecast'}</span>
                        <span className="text-white font-bold">{result.weather_forecast?.outlook}</span>
                      </div>
                      <div className="flex justify-between items-center pb-2 border-b border-slate-800">
                        <span className="text-slate-400">{t('yield.weatherLabels.avgTemp') || 'Avg Temperature'}</span>
                        <span className="text-rose-400 font-bold">{result.weather_forecast?.temperature}</span>
                      </div>
                      <div className="flex justify-between items-center pb-2 border-b border-slate-800">
                        <span className="text-slate-400">{t('yield.weatherLabels.avgHumidity') || 'Avg Humidity'}</span>
                        <span className="text-cyan-400 font-bold">{result.weather_forecast?.humidity}</span>
                      </div>
                      <div className="flex justify-between items-center pt-1">
                        <span className="text-slate-400">{t('yield.weatherLabels.cropImpact') || 'Crop Impact'}</span>
                        <span className="text-emerald-400 font-bold">{result.weather_forecast?.impact}</span>
                      </div>
                    </div>
                  </div>

                  {/* Smart Farming Suggestions */}
                  <div className="p-5 sm:p-6 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-3.5 shadow-md">
                    <h4 className="font-extrabold text-white text-xs sm:text-sm flex items-center gap-2">
                      <Sprout className="w-4.5 h-4.5 text-emerald-400" />
                      {t('yield.smartFarmingSuggestions')}
                    </h4>
                    <div className="space-y-3 text-xs sm:text-sm">
                      <div className="flex items-start gap-2.5">
                        <div className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400 mt-0.5 flex-shrink-0">
                          <Droplets className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="font-bold text-white text-xs">{t('yield.watering')}</p>
                          <p className="text-slate-300 text-xs font-normal leading-relaxed">{result.smart_suggestions?.watering}</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-2.5">
                        <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400 mt-0.5 flex-shrink-0">
                          <FlaskConical className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="font-bold text-white text-xs">{t('yield.fertilizer')}</p>
                          <p className="text-slate-300 text-xs font-normal leading-relaxed">{result.smart_suggestions?.fertilizer}</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-2.5">
                        <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 mt-0.5 flex-shrink-0">
                          <Calendar className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="font-bold text-white text-xs">{t('yield.harvestTarget')}</p>
                          <p className="text-slate-300 text-xs font-normal leading-relaxed">{result.smart_suggestions?.harvest}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

              </motion.div>
            ) : (
              /* IDLE STATE: Awaiting Farm Data & Features Preview */
              <div className="bg-slate-950/40 backdrop-blur-sm p-6 sm:p-8 rounded-3xl border border-slate-800/80 shadow-2xl flex flex-col justify-between space-y-6 min-h-[460px]">
                <div>
                  <div className="flex items-center justify-between border-b border-slate-800/80 pb-4 mb-6">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 shadow-md">
                        <BarChart3 className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="text-lg sm:text-xl font-bold text-white tracking-wide">{t('yield.waiting')}</h3>
                        <p className="text-xs text-slate-300 font-normal mt-0.5">{t('yield.waitingDesc')}</p>
                      </div>
                    </div>
                    <span className="hidden sm:inline-flex px-3 py-1 rounded-full bg-slate-800/70 border border-slate-700 text-xs text-slate-300 font-bold shadow">
                      {t('disease.awaitingScan')}
                    </span>
                  </div>

                  {/* Feature Highlights Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 mb-6">
                    <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-1.5 shadow-md">
                      <div className="flex items-center gap-2 text-xs font-bold text-emerald-300">
                        <IndianRupee className="w-4 h-4 text-emerald-400" />
                        <span>{language === 'te' ? 'ప్రత్యక్ష APMC మండి ధరలు' : 'Real-Time APMC Mandi Pricing'}</span>
                      </div>
                      <p className="text-xs text-slate-300 font-normal leading-relaxed">
                        {language === 'te' ? 'తెలంగాణ APMC మార్కెట్‌ల ఆధారంగా ప్రత్యక్ష పంట ధరల లెక్కింపు.' : 'Daily updated Mandi commodity benchmarks per quintal across Telangana districts.'}
                      </p>
                    </div>

                    <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-1.5 shadow-md">
                      <div className="flex items-center gap-2 text-xs font-bold text-cyan-300">
                        <TrendingUp className="w-4 h-4 text-cyan-400" />
                        <span>{language === 'te' ? 'ఆర్థిక ఆదాయ అంచనా' : 'Financial Revenue & Profit Forecast'}</span>
                      </div>
                      <p className="text-xs text-slate-300 font-normal leading-relaxed">
                        {language === 'te' ? 'పంట ఉత్పత్తి వ్యయం మరియు నికర లాభాల విశ్లేషణ.' : 'Calculates total harvest revenue, cultivation expenses, and net profit margins.'}
                      </p>
                    </div>

                    <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-1.5 shadow-md">
                      <div className="flex items-center gap-2 text-xs font-bold text-amber-300">
                        <ShieldCheck className="w-4 h-4 text-amber-400" />
                        <span>{language === 'te' ? 'AI మార్కెట్ అమ్మకపు ఉచిత నిర్ణయం' : 'AI Market Action Strategy'}</span>
                      </div>
                      <p className="text-xs text-slate-300 font-normal leading-relaxed">
                        {language === 'te' ? 'పంటను నిల్వ ఉంచాలా లేదా వెంటనే విక్రయించాలా అని AI సూచిస్తుంది.' : 'Determines optimal sell timing vs storage strategy based on price vectors.'}
                      </p>
                    </div>

                    <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-1.5 shadow-md">
                      <div className="flex items-center gap-2 text-xs font-bold text-emerald-300">
                        <Sun className="w-4 h-4 text-emerald-400" />
                        <span>{language === 'te' ? 'వాతావరణం & సాగు సలహాలు' : 'Weather & Agronomy Advice'}</span>
                      </div>
                      <p className="text-xs text-slate-300 font-normal leading-relaxed">
                        {language === 'te' ? 'వాతావరణ పరిస్థితులకు అనుగుణంగా సాగు నీరు మరియు ఎరువుల ప్రణాళిక.' : 'Provides weather-adjusted irrigation schedules and targeted NPK protocols.'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Footer Telemetry */}
                <div className="pt-3 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-1.5 font-normal">
                  <div className="flex items-center gap-1.5">
                    <Info className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{language === 'te' ? 'తెలంగాణ జిల్లాల వ్యవసాయ సమాచారం & AI అంచనా' : 'Telangana Agricultural District Data & Neural Yield Pipeline'}</span>
                  </div>
                  <div className="text-xs font-semibold text-slate-400">
                    AgroVision AI Decision v2.4
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default YieldPrediction;
