import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Sprout, Droplets, ThermometerSun, Map, Database, TrendingUp, TrendingDown, IndianRupee, AlertCircle, CloudRain, Sun, Calendar, CheckCircle2, BarChart3 } from 'lucide-react';
import axios from 'axios';
import { useLanguage } from '../context/LanguageContext';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, LineChart, Line, Cell } from 'recharts';

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
      [name]: ['area'].includes(name) ? parseFloat(value) : value
    }));
  };

  const handlePredict = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);
    
    try {
      const token = localStorage.getItem('token') || "mock-token";
      const response = await axios.post(`http://localhost:8000/predict/predict-yield?lang=${language}`, formData, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      setResult(response.data);
    } catch (error) {
      console.error(error);
      alert("Failed to connect to the AI backend.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (result) {
      const interval = setInterval(() => {
        handlePredict();
      }, 30 * 60 * 1000); // 30 minutes
      return () => clearInterval(interval);
    }
  }, [formData, result]);

  // Mock chart data generation based on result
  const profitCostData = result ? [
    { name: 'Estimated Cost', amount: result.estimated_cost, fill: '#EF4444' },
    { name: 'Expected Profit', amount: result.expected_profit, fill: '#10B981' }
  ] : [];

  const marketTrendData = result?.market_trend_obj?.history || [];

  return (
    <div className="w-full py-2 space-y-8 animate-fade-in">
      <div className="text-center mb-8">
        <h2 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-farm-green to-blue-400 mb-2">{t('yield.title')}</h2>
        <p className="text-gray-400">{t('yield.subtitle')}</p>
      </div>
      
      <div className="grid lg:grid-cols-12 gap-8">
        {/* INPUT FORM - left column */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:col-span-4 bg-[#091228]/60 backdrop-blur-md rounded-2xl p-6 shadow-xl border border-farm-green/20 h-fit sticky top-6"
        >
          <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2"><Database className="w-5 h-5 text-farm-green"/> {t('yield.input')}</h3>
          <form onSubmit={handlePredict} className="space-y-5">
            
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-400 mb-1">
                <Map className="w-4 h-4 text-orange-400" /> District (Telangana)
              </label>
              <select 
                name="district" value={formData.district} onChange={handleChange}
                className="w-full bg-[#0B1120]/40 border border-gray-700/50 rounded-lg px-4 py-2 focus:outline-none focus:border-farm-green transition-colors text-white appearance-none backdrop-blur-sm"
              >
                <option value="Hyderabad">Hyderabad</option>
                <option value="Warangal">Warangal</option>
                <option value="Khammam">Khammam</option>
                <option value="Nizamabad">Nizamabad</option>
                <option value="Karimnagar">Karimnagar</option>
                <option value="Mahabubnagar">Mahabubnagar</option>
              </select>
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-400 mb-1">
                <Map className="w-4 h-4 text-yellow-600" /> {t('yield.area')}
              </label>
              <input 
                type="number" step="0.1" name="area" value={formData.area} onChange={handleChange}
                className="w-full bg-[#0B1120]/40 border border-gray-700/50 rounded-lg px-4 py-2 focus:outline-none focus:border-farm-green transition-colors text-white backdrop-blur-sm"
              />
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-400 mb-1">
                <Map className="w-4 h-4 text-orange-600" /> {t('yield.soil')}
              </label>
              <select 
                name="soil_type" value={formData.soil_type} onChange={handleChange}
                className="w-full bg-[#0B1120]/40 border border-gray-700/50 rounded-lg px-4 py-2 focus:outline-none focus:border-farm-green transition-colors text-white appearance-none backdrop-blur-sm"
              >
                <option value="Loamy">{t('yield.loamy')}</option>
                <option value="Clay">{t('yield.clay')}</option>
                <option value="Sandy">{t('yield.sandy')}</option>
                <option value="Black">{t('yield.black')}</option>
                <option value="Red">{t('yield.red')}</option>
              </select>
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-400 mb-1">
                <Sprout className="w-4 h-4 text-farm-green" /> {t('yield.crop')}
              </label>
              <select 
                name="crop_type" value={formData.crop_type} onChange={handleChange}
                className="w-full bg-[#0B1120]/40 border border-gray-700/50 rounded-lg px-4 py-2 focus:outline-none focus:border-farm-green transition-colors text-white appearance-none backdrop-blur-sm"
              >
                <option value="Wheat">{t('yield.wheat')}</option>
                <option value="Rice">{t('yield.rice')}</option>
                <option value="Maize">{t('yield.maize')}</option>
                <option value="Cotton">{t('yield.cotton')}</option>
                <option value="Sugarcane">{t('yield.sugarcane')}</option>
                <option value="Tomato">{t('yield.tomato')}</option>
                <option value="Corn">{t('yield.corn')}</option>
              </select>
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-farm-green to-blue-500 text-white font-bold text-lg py-3 rounded-xl hover:shadow-[0_0_15px_rgba(16,185,129,0.5)] transition-all flex items-center justify-center gap-2"
              >
                {loading ? <span className="animate-pulse">{t('yield.analyzing')}</span> : t('yield.calculate')}
              </button>
            </div>

          </form>
        </motion.div>

        {/* RESULTS PANEL - right column */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:col-span-8"
        >
          {result ? (
            <div className="space-y-6">
              
              {/* Top Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-[#091228]/60 backdrop-blur-md p-5 rounded-2xl border border-farm-green/20 shadow-lg">
                  <p className="text-gray-400 text-sm mb-1 uppercase tracking-wider font-semibold">{t('yield.estimatedYield')}</p>
                  <h3 className="text-3xl font-black text-white">{result.predicted_yield_tons_per_ha} <span className="text-sm font-normal text-farm-green">Tons/Ha</span></h3>
                </div>
                <div className="bg-[#091228]/60 backdrop-blur-md p-5 rounded-2xl border border-farm-green/20 shadow-lg">
                  <p className="text-gray-400 text-sm mb-1 uppercase tracking-wider font-semibold">{t('yield.totalHarvest')}</p>
                  <h3 className="text-3xl font-black text-white">{result.total_expected_yield_tons} <span className="text-sm font-normal text-farm-green">Tons</span></h3>
                </div>
                <div className="bg-[#091228]/60 backdrop-blur-md p-5 rounded-2xl border border-farm-green/20 shadow-lg">
                  <p className="text-gray-400 text-sm mb-1 uppercase tracking-wider font-semibold">{t('yield.currentMarketPrice')}</p>
                  <h3 className="text-3xl font-black text-white">₹{result.market_price_per_quintal?.toLocaleString()} <span className="text-sm font-normal text-blue-400">/Quintal</span></h3>
                </div>
              </div>

              {/* Financial Breakdown */}
              <div className="bg-[#091228]/60 backdrop-blur-md p-6 rounded-2xl border border-farm-green/20 shadow-2xl">
                <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2"><IndianRupee className="w-5 h-5 text-farm-green"/> {t('yield.financialForecast')}</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  <div className="bg-blue-900/20 p-4 rounded-xl border border-blue-500/30">
                    <p className="text-blue-300 text-sm mb-1">{t('yield.estimatedTotalRevenue')}</p>
                    <p className="text-2xl font-bold text-blue-400">₹{result.estimated_revenue?.toLocaleString()}</p>
                  </div>
                  <div className="bg-red-900/20 p-4 rounded-xl border border-red-500/30">
                    <p className="text-red-300 text-sm mb-1">{t('yield.estimatedCost')}</p>
                    <p className="text-2xl font-bold text-red-400">₹{result.estimated_cost?.toLocaleString()}</p>
                  </div>
                  <div className="bg-green-900/20 p-4 rounded-xl border border-green-500/30 shadow-[0_0_15px_rgba(16,185,129,0.15)] relative overflow-hidden">
                    <div className="absolute -right-4 -top-4 bg-green-500/20 w-16 h-16 rounded-full blur-xl"></div>
                    <p className="text-green-300 text-sm mb-1">{t('yield.expectedProfit')}</p>
                    <p className="text-3xl font-black text-green-400">₹{result.expected_profit?.toLocaleString()}</p>
                  </div>
                </div>

                {/* Profit vs Cost Chart */}
                <div className="h-[200px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={profitCostData} layout="vertical" margin={{ top: 0, right: 30, left: 20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" horizontal={false} />
                      <XAxis type="number" stroke="#9CA3AF" axisLine={false} tickLine={false} />
                      <YAxis dataKey="name" type="category" stroke="#9CA3AF" axisLine={false} tickLine={false} width={120} />
                      <RechartsTooltip contentStyle={{ backgroundColor: '#111827', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }} cursor={{fill: 'rgba(255,255,255,0.05)'}}/>
                      <Bar dataKey="amount" radius={[0, 4, 4, 0]} barSize={30}>
                        {profitCostData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* AI Market Decision & Market Trend */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* AI Decision Card */}
                <div className={`p-6 rounded-2xl border flex flex-col justify-between shadow-lg relative overflow-hidden ${
                  result.market_action_type === 'store' ? 'bg-green-900/20 border-green-500/30' : 
                  result.market_action_type === 'urgent_sell' ? 'bg-red-900/20 border-red-500/30' : 
                  'bg-yellow-900/20 border-yellow-500/30'
                }`}>
                  <div className="relative z-10">
                    <p className="text-sm uppercase tracking-widest font-bold mb-4 opacity-70">{t('yield.aiMarketDecision')}</p>
                    <h2 className="text-4xl font-black mb-4 flex items-center gap-3">
                      {result.market_action_type === 'store' ? t('yield.storeWait') : t('yield.sellNow')}
                    </h2>
                    <p className="text-lg opacity-90 mb-4">{result.market_trend_obj?.status === "Price may increase" ? t('yield.priceMayIncrease') : result.market_trend_obj?.status === "Price may decrease" ? t('yield.priceMayDecrease') : result.market_trend_obj?.status}</p>
                    <p className="text-sm opacity-70 border-t border-white/10 pt-4">{result.market_trend}</p>
                  </div>
                  {/* Background Icon */}
                  <div className="absolute -right-8 -bottom-8 opacity-10">
                    {result.market_action_type === 'store' ? <CheckCircle2 className="w-48 h-48" /> : <AlertCircle className="w-48 h-48" />}
                  </div>
                </div>

                {/* Market Price Trend Chart */}
                <div className="bg-[#091228]/60 backdrop-blur-md p-6 rounded-2xl border border-farm-green/20 shadow-lg">
                  <h3 className="text-lg font-bold text-white mb-2">{t('yield.marketPriceTrend')}</h3>
                  <div className="flex items-center gap-2 mb-4">
                    <span className={`font-bold ${result.market_trend_obj?.percentage.startsWith('+') ? 'text-green-400' : 'text-red-400'}`}>
                      {result.market_trend_obj?.percentage}
                    </span>
                    <span className="text-gray-400 text-sm">projected next month</span>
                  </div>
                  <div className="h-[150px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={marketTrendData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
                        <XAxis dataKey="month" stroke="#9CA3AF" axisLine={false} tickLine={false} />
                        <YAxis stroke="#9CA3AF" axisLine={false} tickLine={false} domain={['auto', 'auto']} />
                        <RechartsTooltip contentStyle={{ backgroundColor: '#111827', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }} />
                        <Line type="monotone" dataKey="price" stroke="#3B82F6" strokeWidth={3} dot={{ r: 4, fill: '#3B82F6', strokeWidth: 2, stroke: '#111827' }} activeDot={{ r: 8 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              {/* Weather & Farming Suggestions */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Weather Outlook */}
                <div className="bg-[#091228]/60 backdrop-blur-md p-6 rounded-2xl border border-farm-green/20 shadow-lg">
                  <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2"><Sun className="w-5 h-5 text-yellow-400"/> {t('yield.weatherOutlook')}</h3>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center pb-3 border-b border-gray-700/50">
                      <span className="text-gray-400">Forecast</span>
                      <span className="text-white font-medium">{result.weather_forecast?.outlook}</span>
                    </div>
                    <div className="flex justify-between items-center pb-3 border-b border-gray-700/50">
                      <span className="text-gray-400">Avg Temperature</span>
                      <span className="text-orange-400 font-bold">{result.weather_forecast?.temperature}</span>
                    </div>
                    <div className="flex justify-between items-center pb-3 border-b border-gray-700/50">
                      <span className="text-gray-400">Avg Humidity</span>
                      <span className="text-blue-400 font-bold">{result.weather_forecast?.humidity}</span>
                    </div>
                    <div className="flex justify-between items-center pb-3 border-b border-gray-700/50">
                      <span className="text-gray-400">Rainfall Prob.</span>
                      <span className="text-blue-500 font-bold">{result.weather_forecast?.rainfall_prob}</span>
                    </div>
                    <div className="flex justify-between items-center pb-3 border-b border-gray-700/50">
                      <span className="text-gray-400">Wind Speed</span>
                      <span className="text-gray-200 font-bold">{result.weather_forecast?.wind_speed}</span>
                    </div>
                    <div className="flex justify-between items-center pt-2">
                      <span className="text-gray-400">Crop Impact</span>
                      <span className={`font-bold ${result.weather_forecast?.impact.includes('Good') ? 'text-farm-green' : 'text-red-400'}`}>
                        {result.weather_forecast?.impact}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Smart Farming Suggestions */}
                <div className="bg-[#091228]/60 backdrop-blur-md p-6 rounded-2xl border border-farm-green/20 shadow-lg">
                  <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2"><Sprout className="w-5 h-5 text-farm-green"/> {t('yield.smartFarmingSuggestions')}</h3>
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-blue-900/30 rounded-lg"><Droplets className="w-4 h-4 text-blue-400"/></div>
                      <div>
                        <p className="text-sm font-semibold text-white">{t('yield.watering')}</p>
                        <p className="text-sm text-gray-400">{result.smart_suggestions?.watering}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-orange-900/30 rounded-lg"><Database className="w-4 h-4 text-orange-400"/></div>
                      <div>
                        <p className="text-sm font-semibold text-white">{t('yield.fertilizer')}</p>
                        <p className="text-sm text-gray-400">{result.smart_suggestions?.fertilizer}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-green-900/30 rounded-lg"><Calendar className="w-4 h-4 text-farm-green"/></div>
                      <div>
                        <p className="text-sm font-semibold text-white">{t('yield.harvestTarget')}</p>
                        <p className="text-sm text-gray-400">{result.smart_suggestions?.harvest}</p>
                      </div>
                    </div>
                  </div>
                </div>

              </div>

            </div>
          ) : (
            <div className="bg-[#091228]/60 backdrop-blur-md rounded-2xl p-12 shadow-xl border border-farm-green/20 h-full flex flex-col items-center justify-center text-center">
              <div className="w-24 h-24 bg-[#0B1120]/60 rounded-full flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(16,185,129,0.1)]">
                <BarChart3 className="w-12 h-12 text-farm-green opacity-50" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">{t('yield.waiting')}</h3>
              <p className="text-gray-400 max-w-md">{t('yield.waitingDesc')}</p>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default YieldPrediction;
