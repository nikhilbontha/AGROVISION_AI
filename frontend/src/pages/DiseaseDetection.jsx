import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Upload, Camera, AlertCircle, CheckCircle, BrainCircuit, ShieldAlert, ShieldCheck, Bug, Info, ListTree, Activity } from 'lucide-react';
import api from '../api';
import { useLanguage } from '../context/LanguageContext';
const DiseaseDetection = () => {
  const { t, language } = useLanguage();
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [selectedCrop, setSelectedCrop] = useState("Auto-Detect");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setResult(null);
      setError(null);
    }
  };

  const handlePredict = async () => {
    if (!selectedFile) return;

    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('crop_type', selectedCrop);

    try {
      const token = localStorage.getItem('token') || "mock-token";
      
      const response = await api.post(`/predict/predict-disease?lang=${language}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      setResult(response.data);
    } catch (err) {
      console.error(err);
      if (err.response && err.response.data && err.response.data.detail) {
        setError(`Backend Error: ${err.response.data.detail}`);
      } else if (err.response && err.response.data && err.response.data.traceback) {
        setError(`Server Error. Check console for traceback.`);
        console.error(err.response.data.traceback);
      } else {
        setError("Failed to connect to the AI model. Please ensure the backend server is running.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full py-2 animate-fade-in">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-[#091228]/60 backdrop-blur-md rounded-2xl p-6 md:p-10 shadow-xl border border-farm-green/20 transition-all"
      >
        <div className="text-center mb-10">
          <h2 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-farm-green to-blue-400 mb-2">{t('disease.title')}</h2>
          <p className="text-gray-400 font-medium tracking-wide">{t('disease.uploadLeaf')}</p>
        </div>

        <div className="grid lg:grid-cols-12 gap-10">
          {/* LEFT COLUMN: Input & Actions */}
          <div className="lg:col-span-4 flex flex-col gap-6">
            <div className="flex flex-col items-center justify-center p-2 border border-dashed border-gray-600 rounded-2xl bg-[#0B1120]/40 hover:border-farm-green hover:bg-[#0B1120]/60 transition-all cursor-pointer relative group overflow-hidden h-80 shadow-lg">
              <input 
                type="file" 
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" 
                accept="image/*"
                onChange={handleFileChange}
              />
              {previewUrl ? (
                <img src={previewUrl} alt="Preview" className="w-full h-full object-cover rounded-xl shadow-lg group-hover:scale-105 transition-transform duration-500" />
              ) : (
                <div className="text-center p-6">
                  <Upload className="w-16 h-16 text-gray-400 mx-auto mb-4 group-hover:text-farm-green transition-colors" />
                  <p className="text-xl font-semibold text-gray-200">{t('disease.clickUpload')}</p>
                  <p className="text-sm mt-2 font-medium text-gray-400">{t('disease.fileLimits')}</p>
                </div>
              )}
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-400 mb-1 ml-1">
                <ListTree className="w-4 h-4 text-farm-green" /> {t('disease.cropType')}
              </label>
              <select 
                value={selectedCrop} 
                onChange={(e) => setSelectedCrop(e.target.value)}
                className="w-full bg-[#0B1120]/40 border border-gray-700/50 rounded-xl px-4 py-3 focus:outline-none focus:border-farm-green transition-colors text-white appearance-none shadow-inner backdrop-blur-sm"
              >
                <option value="Auto-Detect">{t('disease.autoDetect')}</option>
                <option value="Rice">{t('disease.rice')}</option>
                <option value="Wheat">{t('disease.wheat')}</option>
                <option value="Soybean">{t('disease.soybean')}</option>
                <option value="Sugarcane">{t('disease.sugarcane')}</option>
                <option value="Tomato">{t('disease.tomato')}</option>
                <option value="Corn">{t('disease.corn')}</option>
                <option value="Potato">{t('disease.potato')}</option>
                <option value="Strawberry">{t('disease.strawberry')}</option>
                <option value="Cotton">{t('disease.cotton')}</option>
                <option value="Maize">{t('disease.maize')}</option>
              </select>
            </div>

            <button
              onClick={handlePredict}
              disabled={!selectedFile || loading}
              className={`w-full flex items-center justify-center gap-3 px-8 py-5 rounded-2xl font-black text-xl transition-all shadow-xl ${
                !selectedFile || loading 
                  ? 'bg-gray-800/50 text-gray-500 cursor-not-allowed border border-gray-700' 
                  : 'bg-gradient-to-r from-farm-green to-blue-500 text-white hover:scale-[1.02] active:scale-[0.98] hover:shadow-[0_0_15px_rgba(16,185,129,0.5)]'
              }`}
            >
              {loading ? (
                <span className="animate-pulse flex items-center gap-2">
                  <BrainCircuit className="w-6 h-6 animate-spin" /> {t('disease.analyzing')}
                </span>
              ) : (
                <>
                  <BrainCircuit className="w-7 h-7" />
                  {t('disease.run')}
                </>
              )}
            </button>
            
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl text-center text-sm font-medium">
                {error}
              </div>
            )}
          </div>

          {/* RIGHT COLUMN: Results */}
          <div className="lg:col-span-8 flex flex-col">
            {result ? (
              result.success === false ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-red-500/10 backdrop-blur-xl p-8 rounded-2xl border border-red-500/50 shadow-2xl relative overflow-hidden flex flex-col items-center text-center gap-4 h-full justify-center min-h-[400px]"
                >
                  <div className="p-6 bg-red-500/20 rounded-full border border-red-500/30">
                    <AlertCircle className="w-16 h-16 text-red-500" />
                  </div>
                  <h3 className="text-3xl font-black text-red-400">Validation Failed</h3>
                  <p className="text-gray-300 text-lg max-w-md">
                    {t('disease.uploadClearLeaf')}
                  </p>
                  <button onClick={() => {setResult(null); setSelectedFile(null); setPreviewUrl(null);}} className="mt-4 px-6 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded-lg transition-colors border border-red-500/30 font-bold">
                    {t('upload_new_image')}
                  </button>
                </motion.div>
              ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-gradient-to-br from-gray-900/80 to-black p-8 rounded-2xl border border-white/10 shadow-2xl relative overflow-hidden flex flex-col gap-6 h-full"
              >
                {/* Decorative background element */}
                <div className="absolute -top-24 -right-24 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl"></div>

                {/* SIDE-BY-SIDE IMAGE COMPARISON */}
                {result.original_image_b64 && result.processed_image_b64 && (
                  <div className="grid grid-cols-2 gap-6 mb-2 relative z-10">
                    <div className="flex flex-col">
                      <p className="text-xs text-gray-400 mb-2 uppercase tracking-wider font-bold">{t('disease.originalImage')}</p>
                      <div className="relative w-full h-48 md:h-64 rounded-xl border border-gray-700 overflow-hidden bg-black/50">
                        <img src={`data:image/png;base64,${result.original_image_b64}`} className="w-full h-full object-cover" alt="Original" />
                      </div>
                    </div>
                    <div className="flex flex-col">
                      <p className="text-xs text-farm-green mb-2 uppercase tracking-wider font-bold flex items-center gap-2">
                        <Activity className="w-4 h-4"/> {t('disease.aiDetectedRegions')}
                      </p>
                      <div className={`relative w-full h-48 md:h-64 rounded-xl border overflow-hidden bg-black/50 ${result.infected_area_count > 0 ? 'border-red-500/50 shadow-[0_0_20px_rgba(239,68,68,0.2)]' : 'border-farm-green/50 shadow-[0_0_20px_rgba(16,185,129,0.2)]'}`}>
                        <img src={`data:image/png;base64,${result.processed_image_b64}`} className="w-full h-full object-cover" alt="Processed" />
                        {result.infected_area_count > 0 && (
                          <div className="absolute top-3 right-3 bg-red-500 text-white text-xs font-black px-3 py-1 rounded-full shadow-lg border border-red-400 animate-pulse">
                            {result.infected_area_count} Spots Detected
                          </div>
                        )}
                        {result.disease.includes("Healthy") && (
                          <div className="absolute top-3 right-3 bg-farm-green text-white text-xs font-black px-3 py-1 rounded-full shadow-lg border border-green-400">
                            100% Healthy
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* HEADER ROW */}
                <div className="flex flex-wrap items-center gap-4 border-b border-gray-800 pb-6 relative z-10 mt-2">
                  {result.disease.includes("Healthy") ? (
                    <div className="p-4 bg-farm-green/20 rounded-xl border border-farm-green/30">
                      <CheckCircle className="w-10 h-10 text-farm-green" />
                    </div>
                  ) : result.is_low_confidence ? (
                     <div className="p-4 bg-orange-500/20 rounded-xl border border-orange-500/30">
                      <AlertCircle className="w-10 h-10 text-orange-500" />
                    </div>
                  ) : (
                    <div className="p-4 bg-red-500/20 rounded-xl border border-red-500/30">
                      <ShieldAlert className="w-10 h-10 text-red-500" />
                    </div>
                  )}
                  
                  <div className="flex-1 min-w-[200px]">
                    <h3 className="text-3xl font-black tracking-tight text-white">{result.disease}</h3>
                    <div className="flex items-center gap-3 mt-2">
                      <div className="w-32 bg-black/50 rounded-full h-2 overflow-hidden border border-gray-700">
                        <div 
                          className={`h-full rounded-full ${result.confidence > 90 ? 'bg-farm-green' : result.confidence > 60 ? 'bg-yellow-500' : 'bg-red-500'}`}
                          style={{ width: `${result.confidence}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-bold text-gray-300">{result.confidence}% {result.confidence > 50 ? t('disease.highConfidence') : t('disease.lowConfidence')}</span>
                    </div>
                  </div>

                  {/* Severity Badge */}
                  <div className="flex flex-col items-end gap-2">
                    <div className={`px-4 py-2 rounded-lg text-sm font-black uppercase tracking-wider flex items-center gap-2 ${
                        result.severity === 'High' ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 
                        result.severity === 'Medium' ? 'bg-yellow-500/20 text-yellow-500 border border-yellow-500/30' : 
                        result.severity === 'Low' && !result.disease.includes("Healthy") ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' :
                        'bg-farm-green/20 text-farm-green border border-farm-green/30'
                      }`}>
                        {result.severity === 'Medium' ? t('disease.severityMedium') : result.severity === 'High' ? t('disease.severityHigh') : result.severity === 'Low' ? t('disease.severityLow') : `Severity: ${result.severity || "None"}`}
                    </div>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6 relative z-10">
                  
                  {/* Left Column in Results */}
                  <div className="space-y-6">
                    {/* Top 3 Predictions */}
                    {result.top_predictions && result.top_predictions.length > 0 && (
                      <div className="bg-black/30 p-5 rounded-xl border border-white/5">
                        <h4 className="flex items-center gap-2 font-semibold text-sm mb-4 text-gray-400 uppercase tracking-wider">
                          <ListTree className="w-4 h-4" /> {t('disease.aiProbabilities')}
                        </h4>
                        <div className="space-y-3">
                          {result.top_predictions.map((pred, idx) => (
                            <div key={idx} className="flex items-center justify-between gap-4">
                               <span className="text-sm text-gray-300 font-medium truncate w-1/2">{pred.disease}</span>
                               <div className="flex-1 bg-gray-800 rounded-full h-1.5 overflow-hidden">
                                  <div 
                                    className={`h-full rounded-full ${idx === 0 ? 'bg-blue-500' : 'bg-gray-600'}`}
                                    style={{ width: `${pred.confidence}%` }}
                                  ></div>
                               </div>
                               <span className="text-xs text-gray-400 font-mono w-12 text-right">{pred.confidence}%</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Visible Symptoms */}
                    {result.visible_symptoms && result.visible_symptoms.length > 0 && (
                      <div className="bg-black/30 p-5 rounded-xl border border-white/5">
                        <h4 className="flex items-center gap-2 font-semibold text-md mb-3 text-blue-400">
                          <Bug className="w-5 h-5" /> {t('disease.keySymptoms')}
                        </h4>
                        <ul className="grid grid-cols-1 gap-2 text-sm text-gray-300">
                          {result.visible_symptoms.map((sym, idx) => (
                            <li key={idx} className="flex items-start gap-2">
                              <span className="text-blue-400 mt-1">•</span>
                              <span>{sym}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>

                  {/* Right Column in Results */}
                  <div className="space-y-6">
                    {/* Treatment */}
                    <div className="bg-farm-green/10 p-5 rounded-xl border border-farm-green/20 h-full">
                      <h4 className="flex items-center gap-2 font-semibold text-md mb-3 text-farm-green">
                        <ShieldCheck className="w-5 h-5" /> {t('disease.recommendedTreatment')}
                      </h4>
                      <p className="text-gray-300 text-sm leading-relaxed">
                        {result.treatment}
                      </p>
                    </div>

                    <div className="bg-yellow-500/10 p-5 rounded-xl border border-yellow-500/20 h-full">
                      <h4 className="flex items-center gap-2 font-semibold text-md mb-3 text-yellow-500">
                        <ShieldAlert className="w-5 h-5" /> {t('disease.preventiveMeasures')}
                      </h4>
                      <p className="text-gray-300 text-sm leading-relaxed">
                        {result.precautions}
                      </p>
                    </div>
                  </div>

                </div>

              </motion.div>
              )
            ) : (
              <div className="flex flex-col items-center justify-center h-full min-h-[400px] bg-[#091228]/60 backdrop-blur-md rounded-2xl p-10 border border-farm-green/20 border-dashed text-center shadow-inner">
                <div className="p-6 bg-[#0B1120]/60 rounded-full mb-6 border border-gray-700/50 shadow-lg">
                  <Camera className="w-16 h-16 text-gray-500" />
                </div>
                <h3 className="text-2xl font-bold text-gray-300 mb-2">{t('disease.waiting')}</h3>
                <p className="text-gray-400 max-w-sm">{t('disease.waitingDesc')}</p>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default DiseaseDetection;
