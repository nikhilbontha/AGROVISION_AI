import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Upload, Camera, AlertCircle, CheckCircle, BrainCircuit,
  ShieldAlert, ShieldCheck, Bug, Activity, Sparkles, RefreshCw,
  Layers, FileImage, Cpu, ArrowRight, Eye, CheckCircle2,
  Volume2, VolumeX, Download, ZoomIn, Info, Zap, Stethoscope,
  ChevronRight, Play, Square, Crosshair, Check, Sparkle,
  Thermometer, AlertTriangle, Lightbulb, Share2, Printer,
  Sun, Compass, HelpCircle, BookOpen, Leaf, Shield, FolderPlus,
  Dna, Calendar, Droplets, Wind, FlaskConical, Sprout
} from 'lucide-react';
import api from '../api';
import { useLanguage } from '../context/LanguageContext';

const FEATURED_DISEASES_EN = [
  { name: 'Wheat Stripe Rust', severity: 'High', crop: 'Wheat', remedy: 'Propiconazole or Tebuconazole fungicide spray' },
  { name: 'Tomato Late Blight', severity: 'High', crop: 'Tomato & Potato', remedy: 'Metalaxyl + Mancozeb or Copper spray' },
  { name: 'Corn Common Rust', severity: 'Medium', crop: 'Corn / Maize', remedy: 'Mancozeb 75% WP or Propiconazole spray' },
  { name: 'Rice Blast', severity: 'High', crop: 'Paddy Rice', remedy: 'Tricyclazole 75% WP or Isoprothiolane' },
  { name: 'Apple Scab', severity: 'High', crop: 'Apple', remedy: 'Captan or Myclobutanil early spray' },
  { name: 'Citrus Greening', severity: 'Critical', crop: 'Orange / Citrus', remedy: 'Remove infected trees; spray Imidacloprid for psyllids' }
];

const FEATURED_DISEASES_TE = [
  { name: 'గోధుమ పసుపు కుంకుమ తెగులు (Wheat Stripe Rust)', severity: 'అధిక', crop: 'గోధుమ', remedy: 'ప్రొపికోనజోల్ లేదా టెబుకోనజోల్ పిచికారీ' },
  { name: 'టమాటా లేట్ బ్లైట్ (Tomato Late Blight)', severity: 'అధిక', crop: 'టమాటా & బంగాళాదుంప', remedy: 'మెటలాక్సిల్ + మ్యాంకోజెబ్ లేదా కాపర్ మందు' },
  { name: 'మొక్కజొన్న కుంకుమ తెగులు (Corn Rust)', severity: 'మధ్యస్థ', crop: 'మొక్కజొన్న', remedy: 'మ్యాంకోజెబ్ 75% WP పిచికారీ' },
  { name: 'వరి అగ్గి తెగులు (Rice Blast)', severity: 'అధిక', crop: 'వరి', remedy: 'ట్రైసైక్లాజోల్ 75% WP లేదా ఐసోప్రోతియోలేన్' },
  { name: 'యాపిల్ స్కాబ్ తెగులు (Apple Scab)', severity: 'అధిక', crop: 'యాపిల్', remedy: 'క్యాప్టాన్ లేదా మైక్లోబుటానిల్ పిచికారీ' },
  { name: 'సంత్రా గ్రీనింగ్ తెగులు (Citrus Greening)', severity: 'క్లిష్టమైన', crop: 'సంత్రా / నిమ్మ', remedy: 'వ్యాధి సోకిన చెట్లను తొలగించి ఇమిడాక్లోప్రిడ్ పిచికారీ' }
];

const DiseaseDetection = () => {
  const { t, language } = useLanguage();
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview'); // overview, cause, treatment, timeline, probabilities
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [selectedCrop, setSelectedCrop] = useState('Auto-Detect');

  const fileInputRef = useRef(null);
  const videoRef = useRef(null);

  useEffect(() => {
    return () => {
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
      stopCamera();
    };
  }, []);

  const processFile = (file) => {
    if (file && file.type.startsWith('image/')) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setResult(null);
      setError(null);
      stopCamera();
    } else {
      setError(language === 'te' 
        ? "దయచేసి చెల్లుబాటు అయ్యే పంట చిత్రం ఫైల్‌ను ఎంచుకోండి (JPG, PNG, WEBP)."
        : "Please select a valid crop image file (JPG, PNG, WEBP)."
      );
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const startCamera = async () => {
    setError(null);
    try {
      setIsCameraActive(true);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } }
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error("Camera error:", err);
      setError(language === 'te' 
        ? "కెమెరా అనుమతి తిరస్కరించబడింది లేదా పరికరంలో అందుబాటులో లేదు." 
        : "Camera access was denied or is unavailable on this device."
      );
      setIsCameraActive(false);
    }
  };

  const captureCameraPhoto = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth || 640;
    canvas.height = videoRef.current.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
    canvas.toBlob((blob) => {
      if (blob) {
        const file = new File([blob], 'camera_crop_scan.jpg', { type: 'image/jpeg' });
        processFile(file);
      }
    }, 'image/jpeg');
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject;
      const tracks = stream.getTracks();
      tracks.forEach((track) => track.stop());
    }
    setIsCameraActive(false);
  };

  const handlePredict = async () => {
    if (!selectedFile) return;

    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('crop_type', selectedCrop);

    try {
      const response = await api.post(`/predict/predict-disease?lang=${language}`, formData);
      if (response.data && response.data.success) {
        setResult(response.data);
        setActiveTab('overview');
      } else {
        setError(response.data?.message || (language === 'te' ? "చిత్ర విశ్లేషణ విఫలమైంది. మరో ఫోటో ఉపయోగించండి." : "Failed to analyze crop image. Please try another photo."));
      }
    } catch (err) {
      console.error(err);
      setError(language === 'te'
        ? "AI సర్వర్‌కు కనెక్ట్ చేయడం వీలుకావడం లేదు. బ్యాకెండ్ రన్ అవుతుందో లేదో సరిచూసుకోండి."
        : "Unable to connect to AI server. Please make sure backend is running."
      );
    } finally {
      setLoading(false);
    }
  };

  const rePredictWithCrop = async (targetCrop) => {
    setSelectedCrop(targetCrop);
    if (!selectedFile) return;

    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('crop_type', targetCrop);

    try {
      const response = await api.post(`/predict/predict-disease?lang=${language}`, formData);
      if (response.data && response.data.success) {
        setResult(response.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const resetScanner = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setResult(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
    stopCamera();
  };

  const speakDiagnosisText = () => {
    if (!result || !('speechSynthesis' in window)) return;

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    const narration = language === 'te'
      ? `మీ పంట వ్యాధి నిర్ధారణ ఫలితం: ${result.disease}. శాస్త్రీయ నామం: ${result.scientific_name || 'తెలియదు'}. తీవ్రత: ${result.severity || 'సాధారణం'}. AI నమ్మక స్థాయి: ${result.confidence} శాతం. సూచించిన చికిత్స: ${result.organic_treatment || result.treatment || 'ప్రత్యేక చికిత్స అవసరం లేదు.'}`
      : `Diagnostic result for your crop: ${result.disease}. Scientific pathogen: ${result.scientific_name || 'Not specified'}. Category: ${result.category || 'Pathogen'}. Severity level: ${result.severity || 'Normal'}. AI Confidence: ${result.confidence} percent. Recommended treatment: ${result.organic_treatment || result.treatment || 'No specific treatment required.'}`;
    
    const utterance = new SpeechSynthesisUtterance(narration);
    utterance.rate = 0.95;
    if (language === 'te') {
      utterance.lang = 'te-IN';
    }
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  const handlePrint = () => {
    window.print();
  };

  const featuredDiseases = language === 'te' ? FEATURED_DISEASES_TE : FEATURED_DISEASES_EN;

  return (
    <div className="w-full py-2 animate-fade-in relative text-slate-100 print:py-0 print:bg-white print:text-black">
      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        accept="image/*"
        onChange={handleFileChange}
      />

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
              <span>{t('disease.heroBadge')}</span>
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight flex items-center gap-3 print:text-black">
              <Stethoscope className="w-7 h-7 sm:w-9 sm:h-9 text-emerald-400 print:text-emerald-700" />
              {t('disease.heroTitle')}
            </h2>
            <p className="text-slate-300 text-xs sm:text-sm mt-1.5 max-w-2xl print:text-slate-700 leading-relaxed font-normal">
              {t('disease.heroDesc')}
            </p>
          </div>

          {/* Telemetry Status Pills */}
          <div className="flex flex-wrap items-center gap-2.5 print:hidden">
            <div className="px-3.5 py-2 rounded-xl bg-slate-900/50 backdrop-blur-sm border border-slate-800/80 text-xs sm:text-sm text-slate-200 flex items-center gap-2 shadow-lg font-medium">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>{t('disease.aiEngine')}: <strong className="text-emerald-300 font-bold">{t('disease.active')}</strong></span>
            </div>

            <div className="px-3.5 py-2 rounded-xl bg-slate-900/50 backdrop-blur-sm border border-slate-800/80 text-xs sm:text-sm text-slate-200 flex items-center gap-2 shadow-lg font-medium">
              <Cpu className="w-3.5 h-3.5 text-cyan-400" />
              <span>{t('disease.precision')}: <strong className="text-cyan-300 font-bold">99.1%</strong></span>
            </div>

            {result && (
              <div className="flex items-center gap-2">
                <button
                  onClick={speakDiagnosisText}
                  className={`p-2.5 rounded-xl border transition-all duration-300 ${
                    isSpeaking
                      ? 'bg-emerald-500 text-black border-emerald-400 shadow-[0_0_20px_rgba(34,197,94,0.6)] animate-pulse font-bold'
                      : 'bg-slate-900/50 backdrop-blur-sm border-slate-800/80 text-slate-200 hover:text-emerald-400 hover:border-emerald-500/50'
                  }`}
                  title="Audio Narration"
                >
                  {isSpeaking ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                </button>
                <button
                  onClick={handlePrint}
                  className="px-3.5 py-2 rounded-xl bg-slate-900/50 backdrop-blur-sm border border-slate-800/80 text-slate-200 hover:text-emerald-300 hover:border-emerald-500/50 transition-colors text-xs font-bold flex items-center gap-1.5 shadow-lg"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>{t('disease.printReport')}</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* MAIN WORKSPACE GRID */}
        <div className="grid lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT COLUMN: Input Workspace */}
          <div className="lg:col-span-5 flex flex-col gap-6 print:hidden">
            
            {/* Viewport Dropzone Container */}
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`relative group rounded-3xl overflow-hidden border-2 border-dashed transition-all duration-300 shadow-2xl flex flex-col items-center justify-center min-h-[340px] sm:min-h-[380px] p-4 text-center backdrop-blur-sm ${
                previewUrl || isCameraActive
                  ? 'border-slate-800/80 bg-slate-950/35'
                  : isDragging
                  ? 'border-emerald-400 bg-emerald-500/15 scale-[1.01]'
                  : 'border-emerald-500/40 hover:border-emerald-400 bg-slate-950/35'
              }`}
            >
              {/* Live Web Camera View */}
              {isCameraActive ? (
                <div className="relative w-full h-full min-h-[350px] rounded-2xl overflow-hidden bg-black flex flex-col items-center justify-center border border-emerald-500/50 shadow-2xl">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    className="w-full h-full object-cover"
                  />
                  {/* Reticle Overlay */}
                  <div className="absolute inset-0 border-2 border-emerald-400/40 rounded-2xl pointer-events-none flex items-center justify-center">
                    <Crosshair className="w-16 h-16 text-emerald-400/70 animate-ping" />
                  </div>
                  <div className="absolute top-3 left-3 px-3.5 py-1.5 rounded-full bg-rose-600 text-white text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-lg animate-pulse">
                    <span className="w-2.5 h-2.5 rounded-full bg-white" /> {language === 'te' ? 'లైవ్ కెమెరా స్ట్రీమ్' : 'Live Camera Stream'}
                  </div>
                  <div className="absolute bottom-4 left-0 right-0 flex items-center justify-center gap-3 px-4 z-30">
                    <button
                      type="button"
                      onClick={captureCameraPhoto}
                      className="px-6 py-2.5 rounded-full bg-gradient-to-r from-emerald-400 to-teal-400 hover:from-emerald-300 hover:to-teal-300 text-black font-black text-xs sm:text-sm shadow-xl flex items-center gap-2 transform active:scale-95 transition-all"
                    >
                      <Camera className="w-4 h-4" /> {t('disease.capturePhoto')}
                    </button>
                    <button
                      type="button"
                      onClick={stopCamera}
                      className="px-4 py-2.5 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs sm:text-sm shadow-lg"
                    >
                      {t('disease.cancel')}
                    </button>
                  </div>
                </div>
              ) : previewUrl ? (
                /* Loaded Image Preview State */
                <div className="relative w-full h-full min-h-[340px] rounded-2xl overflow-hidden border border-slate-800 group-hover:border-emerald-500/40 transition-colors bg-black shadow-2xl">
                  <img
                    src={previewUrl}
                    alt="Target Crop Leaf"
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  
                  {/* Laser Scan Beam effect during processing */}
                  {loading && (
                    <motion.div
                      initial={{ top: '0%' }}
                      animate={{ top: ['0%', '95%', '0%'] }}
                      transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
                      className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-[0_0_20px_#10b981] z-20"
                    />
                  )}

                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-black/30 pointer-events-none" />

                  <div className="absolute top-3 right-3 z-30 flex items-center gap-2">
                    <span className="px-3.5 py-1.5 rounded-full bg-emerald-400 text-black text-xs font-bold shadow-lg flex items-center gap-1.5 backdrop-blur-md">
                      <FileImage className="w-4 h-4" /> {t('disease.leafLoaded')}
                    </span>
                  </div>

                  <div className="absolute bottom-3 left-3 right-3 z-30 flex items-center justify-between text-xs text-slate-200">
                    <span className="truncate max-w-[200px] font-semibold bg-black/80 px-3 py-1.5 rounded-xl border border-slate-700 text-xs text-slate-100">
                      {selectedFile?.name || 'crop_leaf.jpg'}
                    </span>
                    <button
                      type="button"
                      onClick={resetScanner}
                      className="px-3.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs transition-colors shadow-lg pointer-events-auto"
                    >
                      {t('disease.changePhoto')}
                    </button>
                  </div>
                </div>
              ) : (
                /* Drag & Drop Initial State */
                <div className="p-5 space-y-3 pointer-events-none">
                  <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-emerald-500/20 to-teal-500/10 border border-emerald-500/40 text-emerald-400 flex items-center justify-center group-hover:scale-105 group-hover:bg-emerald-500/30 transition-all duration-300 shadow-lg shadow-emerald-500/10">
                    <Upload className="w-8 h-8" />
                  </div>
                  <div>
                    <h4 className="text-lg sm:text-xl font-extrabold text-white group-hover:text-emerald-300 transition-colors">
                      {t('disease.uploadTitle')}
                    </h4>
                    <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xs mx-auto leading-relaxed font-normal">
                      {t('disease.uploadSubtext')}
                    </p>
                  </div>
                  
                  <div className="pt-1 flex flex-wrap items-center justify-center gap-2.5 pointer-events-auto">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black text-xs sm:text-sm font-extrabold flex items-center gap-1.5 transition-all shadow-md active:scale-95"
                    >
                      <FolderPlus className="w-4 h-4" /> {t('disease.browseFiles')}
                    </button>

                    <button
                      type="button"
                      onClick={startCamera}
                      className="px-4 py-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/40 hover:bg-emerald-500/20 text-emerald-300 text-xs sm:text-sm font-bold flex items-center gap-1.5 transition-all shadow-md active:scale-95"
                    >
                      <Camera className="w-4 h-4" /> {t('disease.openCamera')}
                    </button>
                  </div>
                </div>
              )}
            </div>



            {/* Run Diagnostics Primary Trigger Button */}
            <button
              type="button"
              onClick={handlePredict}
              disabled={!selectedFile || loading}
              className={`w-full py-3.5 px-5 rounded-2xl font-extrabold text-sm sm:text-base transition-all duration-300 shadow-xl flex items-center justify-center gap-2.5 tracking-wide ${
                !selectedFile || loading
                  ? 'bg-slate-800/60 text-slate-400 cursor-not-allowed border border-slate-800'
                  : 'bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-500 hover:from-emerald-300 hover:to-cyan-400 text-black shadow-emerald-500/30 active:scale-[0.99] hover:shadow-[0_0_25px_rgba(46,204,113,0.4)]'
              }`}
            >
              {loading ? (
                <div className="flex items-center gap-2.5">
                  <RefreshCw className="w-5 h-5 animate-spin text-black" />
                  <span>{t('disease.analyzingText')}</span>
                </div>
              ) : (
                <>
                  <BrainCircuit className="w-6 h-6" />
                  <span>{t('disease.runDiagnostics')}</span>
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>

            {/* AI Scan Guidelines & Engine Capabilities Card (Compact Size) */}
            <div className="bg-slate-950/40 backdrop-blur-sm rounded-xl p-3 border border-slate-800/80 space-y-2 shadow-sm">
              <div className="flex items-center justify-between border-b border-slate-800/80 pb-1.5">
                <span className="flex items-center gap-1.5 text-[11px] font-extrabold text-emerald-300 uppercase tracking-wider">
                  <Sparkles className="w-3 h-3 text-emerald-400" />
                  {language === 'te' ? 'AI స్కాన్ నిబంధనలు' : 'AI Scan Guidelines'}
                </span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-[9px] font-bold text-emerald-400">
                  {language === 'te' ? 'స్మార్ట్ విజన్' : 'Smart Vision v2.4'}
                </span>
              </div>

              <div className="grid grid-cols-1 gap-1.5 text-[11px]">
                <div className="flex items-start gap-2 p-1.5 rounded-lg bg-slate-900/60 border border-slate-800/60 hover:border-emerald-500/30 transition-all">
                  <div className="p-1 rounded bg-cyan-500/10 text-cyan-400 flex-shrink-0 mt-0.5">
                    <Crosshair className="w-3 h-3" />
                  </div>
                  <div>
                    <h5 className="font-bold text-white text-[11px] leading-tight">
                      {language === 'te' ? 'మాక్రో ఫోకస్' : 'Macro Leaf Focus'}
                    </h5>
                    <p className="text-slate-300 text-[10px] leading-tight font-normal">
                      {language === 'te' ? 'తెగులు మచ్చలను 10-20 సెం.మీ దగ్గర నుండి స్పష్టంగా ఫోటో తీయండి.' : 'Capture close-up (10-20 cm) centered on affected leaf surface.'}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-2 p-1.5 rounded-lg bg-slate-900/60 border border-slate-800/60 hover:border-emerald-500/30 transition-all">
                  <div className="p-1 rounded bg-amber-500/10 text-amber-400 flex-shrink-0 mt-0.5">
                    <Sun className="w-3 h-3" />
                  </div>
                  <div>
                    <h5 className="font-bold text-white text-[11px] leading-tight">
                      {language === 'te' ? 'సహజ కాంతి' : 'Natural Daylight'}
                    </h5>
                    <p className="text-slate-300 text-[10px] leading-tight font-normal">
                      {language === 'te' ? 'నీడలు మరియు వెలుతురు మెరుపులు లేకుండా తీయండి.' : 'Avoid harsh camera flash reflections or dark indoor shadows.'}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-2 p-1.5 rounded-lg bg-slate-900/60 border border-slate-800/60 hover:border-emerald-500/30 transition-all">
                  <div className="p-1 rounded bg-emerald-500/10 text-emerald-400 flex-shrink-0 mt-0.5">
                    <Activity className="w-3 h-3" />
                  </div>
                  <div>
                    <h5 className="font-bold text-white text-[11px] leading-tight">
                      {language === 'te' ? 'HSV ఆటో-మాస్కింగ్' : 'HSV Lesion Segmentation'}
                    </h5>
                    <p className="text-slate-300 text-[10px] leading-tight font-normal">
                      {language === 'te' ? 'AI ఆటోమాటిక్‌గా తెగులు మచ్చలను లెక్కిస్తుంది.' : 'Real-time OpenCV vegetation channel analysis counts pathogen spots.'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-0.5 flex items-center justify-between text-[10px] text-slate-400 font-medium border-t border-slate-800/60">
                <span className="flex items-center gap-1 text-slate-300 font-semibold">
                  <FileImage className="w-3 h-3 text-emerald-400" />
                  {language === 'te' ? 'JPG, PNG, WEBP' : 'Supported: JPG, PNG, WEBP'}
                </span>
                <span className="text-slate-400 font-medium">{language === 'te' ? '15MB వరకు' : 'Max 15MB'}</span>
              </div>
            </div>

            {/* Error Container */}
            {error && (
              <div className="p-4 rounded-2xl bg-rose-950/80 border border-rose-500/40 text-rose-200 text-xs sm:text-sm font-medium flex items-center gap-3 shadow-xl animate-in fade-in">
                <AlertCircle className="w-5 h-5 text-rose-400 flex-shrink-0" />
                <span className="leading-relaxed">{error}</span>
              </div>
            )}
          </div>

          {/* RIGHT COLUMN: Output Dashboard OR Awaiting View */}
          <div className="lg:col-span-7 flex flex-col justify-between h-full">
            {result ? (
              /* Successful AI Diagnostic Output Dashboard */
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-slate-950/40 backdrop-blur-sm p-6 sm:p-8 rounded-3xl border border-slate-800/80 shadow-2xl space-y-6 flex flex-col justify-between h-full relative overflow-hidden print:bg-white print:border-none print:shadow-none"
              >
                {/* Subtle Glow */}
                <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none print:hidden" />

                {/* Header Title & Severity Gauge */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-5 relative z-10 print:border-slate-300">
                  <div className="flex items-center gap-3.5">
                    <div className={`p-4 rounded-2xl border ${
                      result.disease.includes("Healthy") || result.disease.includes("ఆరోగ్యం")
                        ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 shadow-emerald-500/10'
                        : result.severity === 'High' || result.severity === 'Critical' || result.severity === 'అధిక'
                        ? 'bg-rose-500/10 border-rose-500/30 text-rose-400 shadow-rose-500/10'
                        : 'bg-amber-500/10 border-amber-500/30 text-amber-400 shadow-amber-500/10'
                    } shadow-xl`}>
                      {result.disease.includes("Healthy") || result.disease.includes("ఆరోగ్యం") ? (
                        <CheckCircle2 className="w-9 h-9 text-emerald-400" />
                      ) : (
                        <ShieldAlert className="w-9 h-9 text-rose-400" />
                      )}
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-300 uppercase tracking-wider block print:text-slate-600">
                          {t('disease.identifiedCondition')}
                        </span>
                        {result.category && (
                          <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-xs font-bold text-emerald-300">
                            {result.category}
                          </span>
                        )}
                      </div>
                      <h3 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-white leading-tight print:text-black">
                        {result.disease}
                      </h3>
                      {result.scientific_name && (
                        <p className="text-xs sm:text-sm text-emerald-300 italic font-bold mt-0.5 print:text-emerald-800">
                          {result.scientific_name}
                        </p>
                      )}
                      <p className="text-xs sm:text-sm text-slate-200 mt-1 font-semibold flex items-center gap-2 print:text-slate-700">
                        {t('disease.aiConfidence')}: <strong className="text-emerald-300 font-extrabold print:text-emerald-700">{result.confidence}%</strong>
                        <span className="text-slate-600">•</span>
                        <span>{language === 'te' ? (result.confidence >= 85 ? 'అధిక ఖచ్చితత్వం' : 'మధ్యస్థ ఖచ్చితత్వం') : `${result.certainty || 'High'} Certainty`}</span>
                      </p>
                    </div>
                  </div>

                  {/* Severity Pill Gauge */}
                  <div className="flex items-center gap-2 print:hidden">
                    <span className={`px-3.5 py-2 rounded-xl text-xs font-extrabold uppercase tracking-wider border inline-flex items-center gap-1.5 shadow-md ${
                      result.severity === 'High' || result.severity === 'Critical' || result.severity === 'అధిక'
                        ? 'bg-rose-500/20 text-rose-200 border-rose-500/40 shadow-rose-500/10'
                        : result.severity === 'Medium' || result.severity === 'మధ్యస్థ'
                        ? 'bg-amber-500/20 text-amber-200 border-amber-500/40 shadow-amber-500/10'
                        : 'bg-emerald-500/20 text-emerald-200 border-emerald-500/40 shadow-emerald-500/10'
                    }`}>
                      <Activity className="w-3.5 h-3.5" />
                      {language === 'te' 
                        ? (result.severity === 'High' ? 'అధిక తీవ్రత' : result.severity === 'Critical' ? 'క్లిష్ట తీవ్రత' : result.severity === 'Medium' ? 'మధ్యస్థ తీవ్రత' : 'సాధారణం')
                        : `${t('disease.severityLabel')}: ${result.severity || "None"}`}
                    </span>
                  </div>
                </div>

                {/* 1-Click Target Crop Switcher Bar */}
                <div className="bg-slate-950/60 backdrop-blur-sm p-3 rounded-xl border border-slate-800/80 space-y-2 print:hidden">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-200">
                    <span className="flex items-center gap-1.5 text-amber-300 uppercase tracking-wider font-bold text-xs">
                      <RefreshCw className="w-3.5 h-3.5 text-amber-300" /> {t('disease.switchTargetCrop')}
                    </span>
                    <span className="text-xs text-slate-300 font-medium">{t('disease.currentCropLabel')} <strong className="text-emerald-300 font-bold">{result.crop?.name || selectedCrop}</strong></span>
                  </div>
                  <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                    {[
                      { name: 'Wheat', label: language === 'te' ? '🌾 గోధుమ' : '🌾 Wheat' },
                      { name: 'Rice', label: language === 'te' ? '🌾 వరి' : '🌾 Rice' },
                      { name: 'Corn', label: language === 'te' ? '🌽 మొక్కజొన్న' : '🌽 Corn' },
                      { name: 'Tomato', label: language === 'te' ? '🍅 టమాటా' : '🍅 Tomato' },
                      { name: 'Potato', label: language === 'te' ? '🥔 బంగాళాదుంప' : '🥔 Potato' },
                      { name: 'Apple', label: language === 'te' ? '🍎 యాపిల్' : '🍎 Apple' },
                      { name: 'Grape', label: language === 'te' ? '🍇 ద్రాక్ష' : '🍇 Grape' },
                      { name: 'Pepper', label: language === 'te' ? '🫑 మిరప' : '🫑 Pepper' },
                      { name: 'Cotton', label: language === 'te' ? '🪵 పత్తి' : '🪵 Cotton' },
                      { name: 'Orange', label: language === 'te' ? '🍊 సంత్రా' : '🍊 Orange' }
                    ].map((c) => {
                      const active = (result.crop?.name === c.name || selectedCrop === c.name);
                      return (
                        <button
                          key={c.name}
                          type="button"
                          onClick={() => rePredictWithCrop(c.name)}
                          disabled={loading}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 whitespace-nowrap border ${
                            active
                              ? 'bg-emerald-500/30 text-emerald-200 border-emerald-400 shadow-md font-bold ring-1 ring-emerald-400/40'
                              : 'bg-slate-900 text-slate-300 border-slate-800 hover:text-white hover:border-slate-700'
                          }`}
                        >
                          <span>{c.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Tab Navigation */}
                <div className="flex items-center gap-2 border-b border-slate-800/80 pb-2 overflow-x-auto print:hidden">
                  {[
                    { id: 'overview', label: t('disease.tabOverview'), icon: Eye },
                    { id: 'cause', label: t('disease.tabCause'), icon: Dna },
                    { id: 'treatment', label: t('disease.tabTreatment'), icon: ShieldCheck },
                    { id: 'timeline', label: t('disease.tabTimeline'), icon: Calendar },
                    { id: 'probabilities', label: t('disease.tabProbabilities'), icon: Layers }
                  ].map((tab) => {
                    const Icon = tab.icon;
                    const active = activeTab === tab.id;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
                          active
                            ? 'bg-emerald-500 text-black shadow-md shadow-emerald-500/20 font-bold'
                            : 'bg-slate-900/80 text-slate-300 hover:text-white hover:bg-slate-800'
                        }`}
                      >
                        <Icon className="w-3.5 h-3.5" />
                        <span>{tab.label}</span>
                      </button>
                    );
                  })}
                </div>

                {/* TAB 1: OVERVIEW & OPENCV LESION MASKING */}
                {(activeTab === 'overview' || window.matchMedia('print').matches) && (
                  <div className="space-y-5 relative z-10">
                    {/* Dual Image Comparison Container */}
                    {result.original_image_b64 && result.processed_image_b64 && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <span className="text-sm sm:text-base font-bold text-slate-100 uppercase tracking-wider block print:text-slate-700">
                            {t('disease.originalLeafPhoto')}
                          </span>
                          <div className="w-full h-44 sm:h-56 rounded-2xl overflow-hidden border border-slate-800 bg-black relative shadow-lg">
                            <img
                              src={`data:image/png;base64,${result.original_image_b64}`}
                              alt="Original scan"
                              className="w-full h-full object-cover"
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <span className="text-sm sm:text-base font-extrabold text-emerald-300 uppercase tracking-wider flex items-center gap-2 print:text-emerald-800">
                            <Activity className="w-4.5 h-4.5" /> {t('disease.lesionMaskingTitle')}
                          </span>
                          <div className={`w-full h-44 sm:h-56 rounded-2xl overflow-hidden border bg-black relative shadow-lg ${
                            result.infected_area_count > 0 ? 'border-rose-500/50 shadow-[0_0_20px_rgba(244,63,94,0.15)]' : 'border-emerald-500/50 shadow-[0_0_20px_rgba(34,197,94,0.15)]'
                          }`}>
                            <img
                              src={`data:image/png;base64,${result.processed_image_b64}`}
                              alt="AI Processed"
                              className="w-full h-full object-cover"
                            />
                            {result.infected_area_count > 0 ? (
                              <div className="absolute top-2.5 right-2.5 bg-rose-600 text-white text-xs sm:text-sm font-extrabold px-3.5 py-1.5 rounded-full shadow-lg border border-rose-400 animate-pulse">
                                {result.infected_area_count} {t('disease.spotsHighlighted')}
                              </div>
                            ) : (
                              <div className="absolute top-2.5 right-2.5 bg-emerald-500 text-black text-xs sm:text-sm font-extrabold px-3.5 py-1.5 rounded-full shadow-lg border border-emerald-400">
                                {t('disease.foliageHealthy')}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Environmental Factors Pill Grid */}
                    {result.environmental_factors && (
                      <div className="grid grid-cols-3 gap-3.5">
                        <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-1 shadow-md">
                          <div className="text-xs sm:text-sm text-slate-200 font-bold uppercase flex items-center gap-1.5">
                            <Thermometer className="w-4 h-4 text-rose-400" /> {t('disease.outbreakTemp')}
                          </div>
                          <div className="text-sm sm:text-base font-extrabold text-white">
                            {result.environmental_factors.temperature || '18°C - 28°C'}
                          </div>
                        </div>

                        <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-1 shadow-md">
                          <div className="text-xs sm:text-sm text-slate-200 font-bold uppercase flex items-center gap-1.5">
                            <Droplets className="w-4 h-4 text-cyan-400" /> {t('disease.humidityRisk')}
                          </div>
                          <div className="text-sm sm:text-base font-extrabold text-white">
                            {result.environmental_factors.humidity || '80% - 95%'}
                          </div>
                        </div>

                        <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-1 shadow-md">
                          <div className="text-xs sm:text-sm text-slate-200 font-bold uppercase flex items-center gap-1.5">
                            <Wind className="w-4 h-4 text-emerald-400" /> {t('disease.leafWetness')}
                          </div>
                          <div className="text-sm sm:text-base font-extrabold text-white">
                            {result.environmental_factors.leaf_wetness || '> 6 hours'}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Visible Diagnostic Symptoms */}
                    {result.visible_symptoms && result.visible_symptoms.length > 0 && (
                      <div className="p-5 sm:p-6 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-3.5 print:bg-slate-100 print:border-slate-300 shadow-md">
                        <h4 className="font-extrabold text-amber-300 uppercase tracking-wider text-xs sm:text-sm flex items-center gap-2 print:text-amber-800">
                          <Bug className="w-4.5 h-4.5" /> {t('disease.identifiedSymptoms')}
                        </h4>
                        <ul className="grid sm:grid-cols-2 gap-3 text-slate-100 text-sm sm:text-base leading-relaxed print:text-black">
                          {result.visible_symptoms.map((sym, idx) => (
                            <li key={idx} className="flex items-start gap-2.5 bg-slate-900/90 p-3 rounded-xl border border-slate-800 print:bg-white print:border-slate-300 font-semibold">
                              <span className="text-amber-400 font-bold text-base">•</span>
                              <span>{sym}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}

                {/* TAB 2: EXACT CAUSE & PATHOGEN SCIENCE */}
                {activeTab === 'cause' && (
                  <div className="space-y-4 relative z-10 animate-fade-in">
                    <div className="p-5 sm:p-6 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2.5 shadow-md">
                      <h5 className="font-extrabold text-cyan-300 text-base sm:text-lg flex items-center gap-2">
                        <Dna className="w-5 h-5 text-cyan-400" />
                        {t('disease.exactCauseTitle')}
                      </h5>
                      <p className="text-slate-100 text-sm sm:text-base leading-relaxed font-normal">
                        {result.exact_cause || result.explanation || (language === 'te' ? "ఈ పంట తెగులు యొక్క పూర్తి వివరాలు." : "Detailed cause science for this crop pathogen.")}
                      </p>
                    </div>

                    <div className="p-5 sm:p-6 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2.5 shadow-md">
                      <h5 className="font-extrabold text-slate-100 text-base sm:text-lg flex items-center gap-2">
                        <Info className="w-5 h-5 text-emerald-400" />
                        {t('disease.explanationTitle')}
                      </h5>
                      <p className="text-slate-100 text-sm sm:text-base leading-relaxed font-normal">
                        {result.explanation}
                      </p>
                    </div>

                    {/* Similar Lookalike Diseases to Rule Out */}
                    {result.similar_diseases && result.similar_diseases.length > 0 && (
                      <div className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2.5 shadow-md">
                        <span className="text-xs sm:text-sm font-extrabold text-amber-300 uppercase tracking-wider block">
                          {t('disease.lookalikeTitle')}
                        </span>
                        <div className="flex flex-wrap gap-2.5 pt-1">
                          {result.similar_diseases.map((sim, idx) => (
                            <span key={idx} className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 text-sm font-bold shadow">
                              {sim}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* TAB 3: AGRONOMY PRESCRIPTION & REMEDIES */}
                {activeTab === 'treatment' && (
                  <div className="space-y-4 relative z-10 animate-fade-in">
                    {/* Organic / Biological Remedies */}
                    <div className="p-5 sm:p-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 space-y-2.5 shadow-md">
                      <h5 className="font-extrabold text-emerald-300 text-base sm:text-lg flex items-center gap-2">
                        <Sprout className="w-5.5 h-5.5 text-emerald-400" />
                        {t('disease.organicTitle')}
                      </h5>
                      <p className="text-slate-100 text-sm sm:text-base leading-relaxed font-medium">
                        {result.organic_treatment || result.treatment || (language === 'te' ? "వేప నూనె (5 ml/లీటర్) లేదా రాగి బయో-ఫంగిసైడ్ ఉపయోగించండి." : "Apply neem oil (5 ml/L) or copper soap bio-fungicide.")}
                      </p>
                    </div>

                    {/* Chemical Fungicide / Bactericide */}
                    <div className="p-5 sm:p-6 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 space-y-2.5 shadow-md">
                      <h5 className="font-extrabold text-cyan-300 text-base sm:text-lg flex items-center gap-2">
                        <FlaskConical className="w-5.5 h-5.5 text-cyan-400" />
                        {t('disease.chemicalTitle')}
                      </h5>
                      <p className="text-slate-100 text-sm sm:text-base leading-relaxed font-medium">
                        {result.chemical_treatment || result.treatment || (language === 'te' ? "పరిమాణం ప్రకారం శిలీంధ్ర నాశిని మందును పిచికారీ చేయండి." : "Foliar spray of broad spectrum protectant fungicide as per dosage.")}
                      </p>
                    </div>

                    {/* Cultural Field Precautions */}
                    <div className="p-5 sm:p-6 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-2.5 shadow-md">
                      <h5 className="font-extrabold text-amber-300 text-base sm:text-lg flex items-center gap-2">
                        <ShieldAlert className="w-5.5 h-5.5 text-amber-400" />
                        {t('disease.culturalTitle')}
                      </h5>
                      <p className="text-slate-100 text-sm sm:text-base leading-relaxed font-medium">
                        {result.precautions || (language === 'te' ? "డ్రిప్ సేద్యం, పంట మార్పిడి మరియు పొలంలో శుభ్రతను పాటించండి." : "Maintain drip irrigation, crop rotation, and field leaf sanitation.")}
                      </p>
                    </div>
                  </div>
                )}

                {/* TAB 4: ACTION TIMELINE CHECKLIST */}
                {activeTab === 'timeline' && (
                  <div className="space-y-4 relative z-10 animate-fade-in">
                    <h4 className="font-extrabold text-slate-100 uppercase tracking-wider text-xs sm:text-sm flex items-center gap-2">
                      <Calendar className="w-4.5 h-4.5 text-emerald-400" /> {t('disease.actionScheduleTitle')}
                    </h4>

                    <div className="space-y-3.5">
                      <div className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2 shadow-md">
                        <span className="px-3.5 py-1.5 rounded-lg bg-emerald-500/20 text-emerald-300 font-extrabold text-xs sm:text-sm border border-emerald-500/40 inline-block">
                          {t('disease.step1Title')}
                        </span>
                        <p className="text-slate-100 text-sm sm:text-base leading-relaxed font-medium">
                          {result.action_timeline?.immediate || (language === 'te' ? "తెగులు సోకిన పంట భాగాలను తొలగించి గాలి ద్వారా వ్యాప్తి నిరోధించండి." : "Isolate infected crop sector and prune heavily blighted leaves to stop airborne spore drift.")}
                        </p>
                      </div>

                      <div className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2 shadow-md">
                        <span className="px-3.5 py-1.5 rounded-lg bg-cyan-500/20 text-cyan-300 font-extrabold text-xs sm:text-sm border border-cyan-500/40 inline-block">
                          {t('disease.step2Title')}
                        </span>
                        <p className="text-slate-100 text-sm sm:text-base leading-relaxed font-medium">
                          {result.action_timeline?.day_2_3 || (language === 'te' ? "ఉదయం పూట సూచించిన శిలీంధ్ర నాశిని మందును పిచికారీ చేయండి." : "Apply prescribed organic neem or chemical fungicide foliar spray in early morning.")}
                        </p>
                      </div>

                      <div className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2 shadow-md">
                        <span className="px-3.5 py-1.5 rounded-lg bg-amber-500/20 text-amber-300 font-extrabold text-xs sm:text-sm border border-amber-500/40 inline-block">
                          {t('disease.step3Title')}
                        </span>
                        <p className="text-slate-100 text-sm sm:text-base leading-relaxed font-medium">
                          {result.action_timeline?.day_7 || (language === 'te' ? "పంటను మళ్లీ తనిఖీ చేసి తెగులు తగ్గుముఖం పట్టిందో లేదో చూడండి." : "Re-examine plant canopy and perform spot scan with AI to confirm symptom regression.")}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB 5: AI PROBABILITIES MATRIX */}
                {activeTab === 'probabilities' && (
                  <div className="space-y-4 relative z-10 animate-fade-in">
                    <h4 className="font-extrabold text-slate-100 uppercase tracking-wider text-xs sm:text-sm flex items-center gap-2">
                      <Layers className="w-4.5 h-4.5 text-cyan-400" /> {t('disease.confidenceMatrixTitle')}
                    </h4>

                    {result.top_predictions && result.top_predictions.length > 0 ? (
                      <div className="space-y-3.5">
                        {result.top_predictions.map((pred, idx) => (
                          <div key={idx} className="p-4 sm:p-5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2 shadow-md">
                            <div className="flex items-center justify-between text-sm sm:text-base">
                              <span className="text-white font-bold">{pred.disease}</span>
                              <span className="text-emerald-300 font-extrabold text-base sm:text-lg">{pred.confidence}%</span>
                            </div>
                            <div className="w-full h-3 rounded-full bg-slate-800 overflow-hidden">
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${pred.confidence}%` }}
                                transition={{ duration: 0.6, delay: idx * 0.1 }}
                                className={`h-full rounded-full ${
                                  idx === 0 ? 'bg-gradient-to-r from-emerald-500 to-teal-400' : 'bg-slate-700'
                                }`}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800 text-sm sm:text-base text-slate-100 shadow-md">
                        {language === 'te' ? 'ప్రధాన అంచనా నమ్మక స్థాయి:' : 'Primary Prediction Confidence:'} <strong className="text-emerald-300 font-extrabold">{result.confidence}%</strong>
                      </div>
                    )}
                  </div>
                )}
              </motion.div>
            ) : (
              /* IDLE STATE: Diagnostic Guidelines & Crop Disease Library */
              <div className="bg-slate-950/40 backdrop-blur-sm p-5 sm:p-6 rounded-3xl border border-slate-800/80 shadow-2xl flex flex-col justify-between space-y-5 min-h-[460px]">
                <div>
                  <div className="flex items-center justify-between border-b border-slate-800/80 pb-3.5 mb-5">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 shadow-md">
                        <BookOpen className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="text-lg sm:text-xl font-bold text-white tracking-wide">{t('disease.libraryTitle')}</h3>
                        <p className="text-xs text-slate-300 font-normal mt-0.5">{t('disease.librarySubtitle')}</p>
                      </div>
                    </div>
                    <span className="hidden sm:inline-flex px-3 py-1 rounded-full bg-slate-800/70 border border-slate-700 text-xs text-slate-300 font-bold shadow">
                      {t('disease.awaitingScan')}
                    </span>
                  </div>

                  {/* Photo Capture Rules */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5">
                    {[
                      { icon: Sun, title: t('disease.tip1Title'), desc: t('disease.tip1Desc') },
                      { icon: Compass, title: t('disease.tip2Title'), desc: t('disease.tip2Desc') },
                      { icon: Leaf, title: t('disease.tip3Title'), desc: t('disease.tip3Desc') }
                    ].map((tip, idx) => {
                      const Icon = tip.icon;
                      return (
                        <div key={idx} className="p-3.5 rounded-xl bg-slate-950/50 backdrop-blur-sm border border-slate-800/80 space-y-1.5 hover:border-emerald-500/40 hover:bg-slate-900/50 transition-all shadow-md">
                          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                            <Icon className="w-4 h-4" />
                          </div>
                          <div className="text-xs sm:text-sm font-bold text-white">{tip.title}</div>
                          <p className="text-xs text-slate-300 leading-relaxed font-normal">{tip.desc}</p>
                        </div>
                      );
                    })}
                  </div>

                  {/* Common Crop Diseases Database */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-xs font-bold text-slate-200">
                      <span className="uppercase tracking-wider flex items-center gap-1.5 text-xs text-cyan-300 font-bold">
                        <Shield className="w-3.5 h-3.5 text-cyan-400" /> {t('disease.supportedDiseasesHeader')}
                      </span>
                      <span className="text-[11px] text-slate-400 font-medium">{t('disease.supportedDiseasesSub')}</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {featuredDiseases.map((dis, idx) => (
                        <div key={idx} className="p-3.5 rounded-xl bg-slate-950/50 backdrop-blur-sm border border-slate-800/80 space-y-1.5 hover:border-emerald-500/40 hover:bg-slate-900/50 transition-all shadow-md">
                          <div className="flex items-center justify-between text-xs sm:text-sm">
                            <span className="font-bold text-white text-xs sm:text-sm">{dis.name}</span>
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                              dis.severity === 'High' || dis.severity === 'Critical' || dis.severity === 'అధిక' || dis.severity === 'క్లిష్టమైన'
                                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                                : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                            }`}>
                              {dis.severity} {language === 'te' ? 'తీవ్రత' : 'Severity'}
                            </span>
                          </div>
                          <div className="text-xs text-slate-300 font-normal">{t('disease.hostCropLabel')} <strong className="text-slate-100 font-semibold">{dis.crop}</strong></div>
                          <div className="text-xs font-medium text-emerald-300 leading-snug mt-0.5">{t('disease.remedyLabel')} {dis.remedy}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Bottom Footer Telemetry */}
                <div className="pt-3 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-1.5 font-normal">
                  <div className="flex items-center gap-1.5">
                    <Info className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{language === 'te' ? 'మల్టీ-స్పెక్ట్రల్ విజన్ ఇంజిన్ ద్వారా HSV సెగ్మెంటేషన్ మరియు న్యూరల్ నెట్‌వర్క్ విశ్లేషణ' : 'Multi-Spectral Vision processes HSV vegetation segmentation and neural classification'}</span>
                  </div>
                  <div className="text-xs font-semibold text-slate-400">
                    ResNet-50 / PyTorch / OpenCV Engine
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

export default DiseaseDetection;
