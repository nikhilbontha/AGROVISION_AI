import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Upload, Camera, AlertCircle, CheckCircle, BrainCircuit,
  ShieldAlert, ShieldCheck, Bug, Activity, Sparkles, RefreshCw,
  Layers, Eye, CheckCircle2, Volume2, Printer, Leaf, Shield,
  Dna, Calendar, Droplets, Wind, FlaskConical, Sprout,
  Lightbulb, AlertTriangle, ArrowRight, BookOpen, ArrowUpRight,
  Zap, Info, X, Image as ImageIcon, Check, Thermometer
} from 'lucide-react';
import api from '../api';
import { useLanguage } from '../context/LanguageContext';
import AdaptiveQuestionnaire from '../components/AdaptiveQuestionnaire';
import {
  getLocalizedDossier,
  getTeluguDiseaseTitle,
  TELUGU_CROPS,
  TELUGU_SEVERITIES
} from '../utils/teluguDiseaseTranslations';

const CROP_SELECTOR_OPTIONS = [
  { id: 'Auto-Detect', labelEn: 'Auto-Detect', labelTe: 'ఆటో-డిటెక్ట్', emoji: '🤖' },
  { id: 'Tomato', labelEn: 'Tomato', labelTe: 'టమాటా', emoji: '🍅' },
  { id: 'Rice', labelEn: 'Rice', labelTe: 'వరి', emoji: '🌾' },
  { id: 'Wheat', labelEn: 'Wheat', labelTe: 'గోధుమ', emoji: '🌾' },
  { id: 'Corn', labelEn: 'Corn', labelTe: 'మొక్కజొన్న', emoji: '🌽' },
  { id: 'Chilli', labelEn: 'Chilli', labelTe: 'మిరప', emoji: '🌶️' },
  { id: 'Cotton', labelEn: 'Cotton', labelTe: 'పత్తి', emoji: '🪵' },
  { id: 'Potato', labelEn: 'Potato', labelTe: 'బంగాళాదుంప', emoji: '🥔' },
  { id: 'Apple', labelEn: 'Apple', labelTe: 'యాపిల్', emoji: '🍎' },
  { id: 'Banana', labelEn: 'Banana', labelTe: 'అరటి', emoji: '🍌' },
  { id: 'Grape', labelEn: 'Grape', labelTe: 'ద్రాక్ష', emoji: '🍇' },
  { id: 'Orange', labelEn: 'Citrus', labelTe: 'సంత్రా', emoji: '🍊' }
];

const PRELOADED_SAMPLES = [
  {
    id: 'sample-tomato',
    name: 'Tomato Late Blight',
    nameTe: 'టమాటా లేట్ బ్లైట్ తెగులు',
    crop: 'Tomato',
    cropTe: 'టమాటా',
    path: '/samples/tomato_blight.jpg',
    filename: 'images (5).jpeg',
    badge: 'Fruit & Leaf Rot',
    badgeTe: 'ఆకు & కాయ కుళ్ళు',
    emoji: '🍅'
  },
  {
    id: 'sample-wheat',
    name: 'Wheat Stripe Rust',
    nameTe: 'గోధుమ పసుపు కుంకుమ తెగులు',
    crop: 'Wheat',
    cropTe: 'గోధుమ',
    path: '/samples/wheat_rust.webp',
    filename: 'Crop-Diseases_-Types-Causes-and-Symptoms-2-min.webp',
    badge: 'Yellow Rust Stripes',
    badgeTe: 'పసుపు చారల తెగులు',
    emoji: '🌾'
  },
  {
    id: 'sample-rice',
    name: 'Rice Blast / Blight',
    nameTe: 'వరి అగ్గి తెగులు / బ్లాస్ట్',
    crop: 'Rice',
    cropTe: 'వరి',
    path: '/samples/rice_blast.jpg',
    filename: 'images (3).jpeg',
    badge: 'Panicle Infection',
    badgeTe: 'వెన్ను ఇన్ఫెక్షన్',
    emoji: '🌾'
  },
  {
    id: 'sample-corn',
    name: 'Corn Ear Damage',
    nameTe: 'మొక్కజొన్న కంకి తెగులు',
    crop: 'Corn',
    cropTe: 'మొక్కజొన్న',
    path: '/samples/corn_rot.jpg',
    filename: 'images (2).jpeg',
    badge: 'Kernel Rot',
    badgeTe: 'గింజల కుళ్ళు తెగులు',
    emoji: '🌽'
  }
];

const DiseaseDetection = () => {
  const { language } = useLanguage();
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [errorPayload, setErrorPayload] = useState(null);
  const [activeTab, setActiveTab] = useState('treatment'); // 'treatment', 'overview', 'cause', 'timeline', 'probabilities'
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [selectedCrop, setSelectedCrop] = useState('Auto-Detect');
  const [workflowMode, setWorkflowMode] = useState('quick'); // 'quick' or 'guided'

  const fileInputRef = useRef(null);
  const videoRef = useRef(null);
  const requestIdRef = useRef(0);

  useEffect(() => {
    return () => {
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
      stopCamera();
    };
  }, []);

  const processFile = (file) => {
    if (!file) return;
    if (!file.type || !file.type.startsWith('image/')) {
      setError(language === 'te' 
        ? "దయచేసి చెల్లుబాటు అయ్యే పంట ఫోటోను ఎంచుకోండి (JPG, PNG, WEBP)."
        : "Please select a valid crop image file (JPG, PNG, WEBP)."
      );
      return;
    }
    if (file.size > 15 * 1024 * 1024) {
      setError(language === 'te'
        ? "ఫోటో పరిమాణం 15MB కంటే తక్కువగా ఉండాలి."
        : "Image file size exceeds maximum allowed limit of 15MB."
      );
      return;
    }
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    setResult(null);
    setError(null);
    setErrorPayload(null);
    stopCamera();
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

  const loadSample = async (sample) => {
    try {
      setSelectedCrop(sample.crop);
      const res = await fetch(sample.path);
      const blob = await res.blob();
      const file = new File([blob], sample.filename, { type: blob.type || 'image/jpeg' });
      processFile(file);
    } catch (err) {
      console.error("Could not load sample:", err);
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
        ? "కెమెరా అనుమతి తిరస్కరించబడింది లేదా అందుబాటులో లేదు." 
        : "Camera access was denied or is unavailable on this device."
      );
      setIsCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject;
      const tracks = stream.getTracks();
      tracks.forEach((track) => track.stop());
    }
    setIsCameraActive(false);
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

  const handlePredict = async () => {
    if (!selectedFile) return;

    setLoading(true);
    setError(null);
    setErrorPayload(null);
    setResult(null);

    const reqId = ++requestIdRef.current;
    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('crop_type', selectedCrop);

    try {
      const response = await api.post(`/predict/predict-disease?lang=${language}`, formData);
      if (reqId !== requestIdRef.current) return;

      if (response.data && response.data.success) {
        setResult(response.data);
        setError(null);
        setErrorPayload(null);
        setActiveTab('overview');
      } else {
        setResult(null);
        setErrorPayload(response.data);
        setError(response.data?.message || (language === 'te' 
          ? "చిత్ర విశ్లేషణ విఫలమైంది. మరో ఫోటో ఉపయోగించండి." 
          : "Failed to analyze crop image. Please try another photo."
        ));
      }
    } catch (err) {
      if (reqId !== requestIdRef.current) return;
      console.error(err);
      setResult(null);
      setErrorPayload(null);
      setError(language === 'te'
        ? "సర్వర్ లోపం ఏర్పడింది. దయచేసి మళ్ళీ ప్రయత్నించండి."
        : (err.response?.data?.message || "Internal diagnosis error. Please try again.")
      );
    } finally {
      if (reqId === requestIdRef.current) {
        setLoading(false);
      }
    }
  };

  const rePredictWithCrop = async (targetCrop) => {
    setSelectedCrop(targetCrop);
    if (!selectedFile) return;

    setLoading(true);
    setError(null);
    setErrorPayload(null);

    const reqId = ++requestIdRef.current;
    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('crop_type', targetCrop);

    try {
      const response = await api.post(`/predict/predict-disease?lang=${language}`, formData);
      if (reqId !== requestIdRef.current) return;

      if (response.data && response.data.success) {
        setResult(response.data);
        setError(null);
        setErrorPayload(null);
      } else {
        setResult(null);
        setErrorPayload(response.data);
        setError(response.data?.message || "Crop target re-analysis failed.");
      }
    } catch (err) {
      if (reqId !== requestIdRef.current) return;
      console.error(err);
    } finally {
      if (reqId === requestIdRef.current) {
        setLoading(false);
      }
    }
  };

  const resetScanner = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setResult(null);
    setError(null);
    setErrorPayload(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
    stopCamera();
  };

  const dossier = result ? getLocalizedDossier(result, language) : null;

  const speakDiagnosisText = () => {
    if (!result || !dossier || !('speechSynthesis' in window)) return;

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    const narration = language === 'te'
      ? `మీ పంట వ్యాధి నిర్ధారణ: ${dossier.disease}. తీవ్రత: ${dossier.severity}. AI నమ్మక స్థాయి: ${result.confidence} శాతం. సూచించిన చికిత్స: ${dossier.organicTreatment}`
      : `Diagnosis: ${result.disease}. Scientific pathogen: ${result.scientific_name || 'Not specified'}. Severity level: ${result.severity || 'Normal'}. AI Confidence: ${result.confidence} percent. Treatment: ${result.organic_treatment || result.treatment || 'No specific treatment required.'}`;
    
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

  return (
    <div className="w-full min-h-screen py-4 sm:py-6 px-3 sm:px-6 max-w-6xl mx-auto space-y-6 text-slate-100 print:py-0 print:bg-white print:text-black">
      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        accept="image/*"
        onChange={handleFileChange}
      />

      {/* Atmospheric Ambient Glow */}
      <div className="fixed top-12 left-1/3 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[180px] pointer-events-none -z-10" />
      <div className="fixed bottom-12 right-1/4 w-[500px] h-[500px] bg-teal-500/10 rounded-full blur-[180px] pointer-events-none -z-10" />

      {/* ==================================================================== */}
      {/* HEADER SECTION */}
      {/* ==================================================================== */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800/80">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-300 border border-emerald-500/25 mb-2">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            <span>{language === 'te' ? 'AI పాథాలజీ స్టూడియో • 72 పంట రకాలు మద్దతు' : 'AI Pathology Studio • 72 Supported Species'}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight flex items-center gap-2.5">
            <Sprout className="w-8 h-8 text-emerald-400" />
            <span>{language === 'te' ? 'పంట వ్యాధి నిర్ధారణ' : 'Crop Disease Detection'}</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl font-normal">
            {language === 'te' 
              ? 'పంట ఆకు ఫోటోను అప్‌లోడ్ చేసి వ్యాధిని, మచ్చలను మరియు నివారణా మందులను తక్షణమే తెలుసుకోండి.' 
              : 'Scan diseased foliage for instant neural pathogen detection, lesion masking, and certified recovery remedies.'}
          </p>
        </div>

        {/* Header Right Actions */}
        <div className="flex items-center gap-2.5 self-start md:self-auto print:hidden">
          {/* Mode Switcher */}
          <div className="p-1 rounded-2xl bg-slate-900/90 border border-slate-800 flex items-center shadow-inner">
            <button
              type="button"
              onClick={() => setWorkflowMode('quick')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                workflowMode === 'quick'
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-400 text-black shadow-md font-black'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Zap className="w-3.5 h-3.5" />
              <span>{language === 'te' ? 'విజన్ స్కాన్' : 'Vision Scan'}</span>
            </button>

            <button
              type="button"
              onClick={() => setWorkflowMode('guided')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                workflowMode === 'guided'
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-400 text-black shadow-md font-black'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{language === 'te' ? 'ప్రశ్నావళి' : 'Questionnaire'}</span>
            </button>
          </div>

          {result && (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={speakDiagnosisText}
                className={`px-3.5 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm ${
                  isSpeaking
                    ? 'bg-emerald-500 text-black border-emerald-400 animate-pulse'
                    : 'bg-slate-900 border-slate-800 text-slate-200 hover:border-emerald-500/50'
                }`}
                title={language === 'te' ? 'వాయిస్ వినండి' : 'Audio Narration'}
              >
                <Volume2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>{isSpeaking ? (language === 'te' ? 'చదువుతోంది...' : 'Speaking...') : (language === 'te' ? 'వినండి' : 'Listen')}</span>
              </button>

              <button
                type="button"
                onClick={handlePrint}
                className="px-3.5 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 hover:text-white text-xs font-bold flex items-center gap-1.5 shadow-sm"
                title={language === 'te' ? 'నివేదిక ముద్రించండి' : 'Print Report'}
              >
                <Printer className="w-3.5 h-3.5 text-slate-400" />
                <span>{language === 'te' ? 'ప్రింట్' : 'Print'}</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ==================================================================== */}
      {/* WORKFLOW VIEW */}
      {/* ==================================================================== */}
      {workflowMode === 'guided' ? (
        <AdaptiveQuestionnaire onResetToQuickScan={() => setWorkflowMode('quick')} />
      ) : (
        <div className="space-y-6">
          {/* CROP SELECTOR HORIZONTAL STRIP */}
          <div className="rounded-2xl bg-slate-900/80 backdrop-blur-xl border border-slate-800/80 p-3.5 shadow-xl space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-slate-400 uppercase tracking-wider px-1">
              <span className="flex items-center gap-1.5 text-emerald-400">
                <Sprout className="w-3.5 h-3.5" />
                <span>{language === 'te' ? 'లక్ష్య పంట రకం' : 'Target Crop Species'}</span>
              </span>
              <span className="text-[11px] text-slate-400 font-medium">
                {selectedCrop === 'Auto-Detect' 
                  ? (language === 'te' ? 'ఆటో-వర్గీకరణ సక్రియంగా ఉంది' : 'Auto-Classification Active') 
                  : (language === 'te' ? `ఎంచుకున్న పంట: ${TELUGU_CROPS[selectedCrop] || selectedCrop}` : `Species Locked: ${selectedCrop}`)}
              </span>
            </div>

            <div className="flex items-center gap-2 overflow-x-auto pb-1 custom-scrollbar-hide">
              {CROP_SELECTOR_OPTIONS.map((c) => {
                const isSelected = selectedCrop === c.id;
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setSelectedCrop(c.id)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap border ${
                      isSelected
                        ? 'bg-gradient-to-r from-emerald-500 to-teal-400 text-black border-emerald-400 shadow-md shadow-emerald-500/20 font-black'
                        : 'bg-slate-950/80 text-slate-300 border-slate-800 hover:border-slate-700 hover:text-white'
                    }`}
                  >
                    <span className="text-sm">{c.emoji}</span>
                    <span>{language === 'te' ? c.labelTe : c.labelEn}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* MAIN DIAGNOSIS WORKSPACE */}
          <div className="space-y-6">
            {/* If no result yet: Centered Hero Upload & Sample Explorer Card */}
            {!result ? (
              <div className="rounded-3xl bg-slate-900/80 backdrop-blur-2xl border border-slate-800/80 p-6 sm:p-8 md:p-10 shadow-2xl space-y-6">
                {/* Active Viewfinder / Dropzone */}
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className={`relative rounded-3xl overflow-hidden border-2 border-dashed transition-all duration-300 flex flex-col items-center justify-center min-h-[340px] p-6 text-center ${
                    previewUrl || isCameraActive
                      ? 'border-slate-800 bg-black'
                      : isDragging
                      ? 'border-emerald-400 bg-emerald-500/10 scale-[1.01]'
                      : 'border-emerald-500/30 hover:border-emerald-400/70 bg-slate-950/70'
                  }`}
                >
                  {/* Camera Active State */}
                  {isCameraActive ? (
                    <div className="relative w-full h-full min-h-[340px] rounded-2xl overflow-hidden bg-black flex flex-col items-center justify-center">
                      <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-4 left-4 px-3.5 py-1.5 rounded-full bg-rose-600/90 text-white text-xs font-bold flex items-center gap-2 shadow">
                        <span className="w-2 h-2 rounded-full bg-white animate-ping" />
                        <span>{language === 'te' ? 'ప్రత్యక్ష కెమెరా ఫీడ్' : 'Live Sensor Stream'}</span>
                      </div>
                      <div className="absolute bottom-5 left-0 right-0 flex items-center justify-center gap-3 px-4 z-20">
                        <button
                          type="button"
                          onClick={captureCameraPhoto}
                          className="px-6 py-2.5 rounded-full bg-gradient-to-r from-emerald-400 to-teal-400 hover:from-emerald-300 hover:to-teal-300 text-black font-black text-xs sm:text-sm shadow-xl flex items-center gap-2"
                        >
                          <Camera className="w-4 h-4" />
                          <span>{language === 'te' ? 'ఫోటో తీయండి' : 'Snap Photo'}</span>
                        </button>
                        <button
                          type="button"
                          onClick={stopCamera}
                          className="px-5 py-2.5 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs"
                        >
                          {language === 'te' ? 'రద్దు చేయి' : 'Cancel'}
                        </button>
                      </div>
                    </div>
                  ) : previewUrl ? (
                    /* Image Loaded State */
                    <div className="relative w-full h-full min-h-[340px] rounded-2xl overflow-hidden bg-black shadow group">
                      <img
                        src={previewUrl}
                        alt="Crop Foliage Preview"
                        className="w-full h-full object-contain max-h-[460px] mx-auto"
                      />

                      {/* Laser Scanner Line Animation */}
                      {loading && (
                        <motion.div
                          initial={{ top: '0%' }}
                          animate={{ top: ['0%', '95%', '0%'] }}
                          transition={{ repeat: Infinity, duration: 1.8, ease: 'easeInOut' }}
                          className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-[0_0_20px_#10b981] z-20"
                        />
                      )}

                      <div className="absolute top-3 right-3 z-20">
                        <button
                          type="button"
                          onClick={resetScanner}
                          className="px-3.5 py-1.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-white text-xs font-bold border border-slate-700 shadow flex items-center gap-1.5 transition-all"
                        >
                          <X className="w-3.5 h-3.5 text-rose-400" />
                          <span>{language === 'te' ? 'ఫోటో మార్చండి' : 'Change Photo'}</span>
                        </button>
                      </div>

                      <div className="absolute bottom-3 left-3 z-20">
                        <span className="px-3 py-1 rounded-lg bg-black/80 backdrop-blur-md text-emerald-400 text-xs font-bold border border-emerald-500/30">
                          {language === 'te' ? `లక్ష్యం: ${TELUGU_CROPS[selectedCrop] || selectedCrop}` : `Target: ${selectedCrop}`}
                        </span>
                      </div>
                    </div>
                  ) : (
                    /* Empty Upload Prompt */
                    <div className="space-y-4 py-8 px-4 flex flex-col items-center justify-center max-w-md mx-auto">
                      <div className="w-20 h-20 rounded-3xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center shadow-lg shadow-emerald-500/5">
                        <Upload className="w-10 h-10" />
                      </div>

                      <div className="space-y-1.5">
                        <h3 className="text-lg sm:text-xl font-bold text-white">
                          {language === 'te' ? 'పంట ఆకు ఫోటోను అప్‌లోడ్ చేయండి' : 'Upload Crop Leaf Photo'}
                        </h3>
                        <p className="text-xs sm:text-sm text-slate-400 leading-relaxed font-normal">
                          {language === 'te'
                            ? 'పంట ఆకు ఫోటోను ఇక్కడ వేయండి, లేదా పరికరం నుండి ఎంచుకోండి (JPG, PNG, WEBP)'
                            : 'Drag and drop leaf image here, or browse from your device (JPG, PNG, WEBP)'}
                        </p>
                      </div>

                      <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-black font-black text-xs sm:text-sm shadow-md flex items-center gap-2"
                        >
                          <ImageIcon className="w-4 h-4" />
                          <span>{language === 'te' ? 'ఫైళ్లను ఎంచుకోండి' : 'Browse Files'}</span>
                        </button>

                        <button
                          type="button"
                          onClick={startCamera}
                          className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 font-bold text-xs sm:text-sm shadow-sm flex items-center gap-2"
                        >
                          <Camera className="w-4 h-4 text-emerald-400" />
                          <span>{language === 'te' ? 'ఫోటో తీయండి' : 'Take Photo'}</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Big Diagnose Trigger Button (When Image Loaded) */}
                {selectedFile && (
                  <button
                    type="button"
                    onClick={handlePredict}
                    disabled={loading}
                    className="w-full py-4 px-6 rounded-2xl font-black text-sm sm:text-base transition-all shadow-xl flex items-center justify-center gap-3 tracking-wide bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 hover:from-emerald-300 hover:to-cyan-300 text-black shadow-emerald-500/20 active:scale-[0.99]"
                  >
                    {loading ? (
                      <div className="flex items-center gap-2.5">
                        <RefreshCw className="w-5 h-5 animate-spin text-black" />
                        <span>{language === 'te' ? 'పంట తెగులు మరియు మచ్చలను విశ్లేషిస్తోంది...' : 'Analyzing Plant Pathology & Lesions...'}</span>
                      </div>
                    ) : (
                      <>
                        <BrainCircuit className="w-6 h-6 text-black" />
                        <span>
                          {language === 'te' 
                            ? `AI వ్యాధి నిర్ధారణ ప్రారంభించండి (${TELUGU_CROPS[selectedCrop] || selectedCrop})` 
                            : `Run AI Disease Diagnosis (${selectedCrop})`}
                        </span>
                        <ArrowRight className="w-5 h-5 text-black" />
                      </>
                    )}
                  </button>
                )}

                {/* 1-Click Test Samples Strip */}
                <div className="pt-2 border-t border-slate-800/80 space-y-3">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-400 uppercase tracking-wider">
                    <span className="flex items-center gap-1.5 text-amber-300">
                      <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                      <span>{language === 'te' ? 'తక్షణ 1-క్లిక్ పరీక్షా నమూనాలు:' : 'Instant 1-Click Test Samples:'}</span>
                    </span>
                    <span className="text-[11px] text-slate-400 lowercase font-normal">
                      {language === 'te' ? 'పరీక్షించడానికి ఏదైనా నమూనాపై క్లిక్ చేయండి' : 'Click any sample to load & diagnose'}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {PRELOADED_SAMPLES.map((sample) => (
                      <button
                        key={sample.id}
                        type="button"
                        onClick={() => loadSample(sample)}
                        disabled={loading}
                        className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800 hover:border-emerald-500/50 hover:bg-slate-900 transition-all text-left space-y-1.5 group shadow"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xl">{sample.emoji}</span>
                          <span className="px-2 py-0.5 rounded-md bg-slate-800 text-[10px] font-bold text-slate-300">
                            {language === 'te' ? sample.cropTe : sample.crop}
                          </span>
                        </div>
                        <div className="text-xs font-bold text-white truncate group-hover:text-emerald-300 transition-colors">
                          {language === 'te' ? sample.nameTe : sample.name}
                        </div>
                        <div className="text-[11px] text-slate-400 truncate">
                          {language === 'te' ? sample.badgeTe : sample.badge}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Error Banner if any */}
                {error && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.96 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="p-4 rounded-2xl bg-rose-950/80 border border-rose-500/40 text-rose-200 shadow-xl space-y-2.5"
                  >
                    <div className="flex items-start gap-3">
                      <ShieldAlert className="w-5 h-5 text-rose-400 flex-shrink-0 mt-0.5" />
                      <div className="space-y-1">
                        <h4 className="font-bold text-white text-sm">
                          {errorPayload?.error_code === 'CROP_MISMATCH'
                            ? (language === 'te' ? 'పంట రకం సరిపోలలేదు' : 'Crop Species Mismatch')
                            : errorPayload?.error_code === 'UNCERTAIN_DIAGNOSIS'
                            ? (language === 'te' ? 'ఖచ్చితత్వం తక్కువగా ఉంది' : 'Low Confidence / Uncertain Scan')
                            : errorPayload?.error_code === 'NON_CROP_IMAGE'
                            ? (language === 'te' ? 'పంట ఆకు గుర్తించబడలేదు' : 'No Crop Leaf Detected')
                            : (language === 'te' ? 'హెచ్చరిక' : 'Diagnostic Alert')}
                        </h4>
                        <p className="text-xs text-rose-200 leading-relaxed font-normal">
                          {error}
                        </p>
                      </div>
                    </div>

                    {errorPayload?.suggestion && (
                      <div className="text-xs text-amber-200 bg-slate-950/80 p-2.5 rounded-xl border border-rose-900/40">
                        💡 <strong>{language === 'te' ? 'సూచన:' : 'Suggestion:'}</strong> {errorPayload.suggestion}
                      </div>
                    )}

                    <div className="flex justify-end gap-2 pt-1">
                      {errorPayload?.error_code === 'CROP_MISMATCH' && errorPayload?.predicted_crop && (
                        <button
                          type="button"
                          onClick={() => rePredictWithCrop(errorPayload.predicted_crop)}
                          className="px-3 py-1.5 rounded-lg bg-cyan-400 hover:bg-cyan-300 text-black font-black text-xs shadow flex items-center gap-1"
                        >
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>
                            {language === 'te' 
                              ? `${TELUGU_CROPS[errorPayload.predicted_crop] || errorPayload.predicted_crop} కు మారండి` 
                              : `Switch to ${errorPayload.predicted_crop}`}
                          </span>
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={resetScanner}
                        className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs border border-slate-700"
                      >
                        {language === 'te' ? 'మరో ఫోటో ప్రయత్నించండి' : 'Try Another Photo'}
                      </button>
                    </div>
                  </motion.div>
                )}
              </div>
            ) : (
              /* ============================================================ */
              /* SUCCESSFUL CLINICAL PATHOLOGY DOSSIER */
              /* ============================================================ */
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-3xl bg-slate-900/90 backdrop-blur-2xl border border-slate-800 p-6 sm:p-8 shadow-2xl space-y-6"
              >
                {/* Hero Pathology Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5 pb-5 border-b border-slate-800">
                  <div className="flex items-start gap-4">
                    <div className={`p-3.5 rounded-2xl border flex-shrink-0 shadow-lg ${
                      result.disease.includes("Healthy") || result.disease.includes("ఆరోగ్యం")
                        ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-400'
                        : result.severity === 'High' || result.severity === 'Critical' || result.severity === 'అధిక'
                        ? 'bg-rose-500/15 border-rose-500/40 text-rose-400'
                        : 'bg-amber-500/15 border-amber-500/40 text-amber-400'
                    }`}>
                      {result.disease.includes("Healthy") || result.disease.includes("ఆరోగ్యం") ? (
                        <CheckCircle2 className="w-9 h-9 text-emerald-400" />
                      ) : (
                        <ShieldAlert className="w-9 h-9 text-rose-400" />
                      )}
                    </div>

                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-md bg-slate-800 border border-slate-700 text-xs font-bold text-slate-300">
                          {language === 'te' ? `ఆతిథ్య పంట: ${dossier.cropName}` : `Host: ${result.crop?.name || selectedCrop}`}
                        </span>
                        {dossier.category && (
                          <span className="px-2.5 py-0.5 rounded-md bg-emerald-500/15 border border-emerald-500/30 text-xs font-semibold text-emerald-300">
                            {dossier.category}
                          </span>
                        )}
                      </div>

                      <h2 className="text-2xl sm:text-3xl font-black text-white">
                        {dossier.disease}
                      </h2>

                      {result.scientific_name && (
                        <p className="text-xs sm:text-sm font-mono text-emerald-300 italic font-medium">
                          {result.scientific_name}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Confidence & Severity Badges */}
                  <div className="flex flex-wrap sm:flex-col items-start sm:items-end gap-2.5">
                    <div className="px-4 py-2 rounded-xl bg-slate-950 border border-emerald-500/30 flex items-center gap-2 shadow">
                      <div className="text-right">
                        <div className="text-[10px] text-slate-400 uppercase font-bold">
                          {language === 'te' ? 'AI నమ్మకం' : 'Neural Confidence'}
                        </div>
                        <div className="text-lg font-black text-emerald-300">{result.confidence}%</div>
                      </div>
                    </div>

                    <span className={`px-3.5 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider border inline-flex items-center gap-1.5 ${
                      result.severity === 'High' || result.severity === 'Critical' || result.severity === 'అధిక'
                        ? 'bg-rose-500/20 text-rose-200 border-rose-500/40'
                        : result.severity === 'Medium' || result.severity === 'మధ్యస్థ'
                        ? 'bg-amber-500/20 text-amber-200 border-amber-500/40'
                        : 'bg-emerald-500/20 text-emerald-200 border-emerald-500/40'
                    }`}>
                      <Activity className="w-3.5 h-3.5" />
                      <span>{language === 'te' ? dossier.severity : `${result.severity || 'Normal'} Severity`}</span>
                    </span>
                  </div>
                </div>

                {/* 1-Click Recalibrate Pill Strip */}
                <div className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800 flex items-center justify-between gap-2 overflow-x-auto print:hidden">
                  <span className="text-xs font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1.5 whitespace-nowrap">
                    <RefreshCw className="w-3.5 h-3.5 text-amber-400" />
                    <span>{language === 'te' ? 'మళ్లీ లెక్కించండి:' : 'Recalibrate:'}</span>
                  </span>
                  <div className="flex items-center gap-1.5 overflow-x-auto custom-scrollbar-hide">
                    {['Tomato', 'Rice', 'Wheat', 'Corn', 'Chilli', 'Cotton', 'Potato', 'Apple'].map((cropName) => {
                      const isActive = (result.crop?.name === cropName || selectedCrop === cropName);
                      return (
                        <button
                          key={cropName}
                          type="button"
                          onClick={() => rePredictWithCrop(cropName)}
                          disabled={loading}
                          className={`px-3 py-1 rounded-xl text-xs font-bold transition-all whitespace-nowrap border ${
                            isActive
                              ? 'bg-emerald-500/25 text-emerald-200 border-emerald-400 shadow-sm font-black'
                              : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                          }`}
                        >
                          <span>{language === 'te' ? (TELUGU_CROPS[cropName] || cropName) : cropName}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* TAB NAVIGATION */}
                <div className="flex items-center gap-2 border-b border-slate-800 pb-2.5 overflow-x-auto custom-scrollbar-hide print:hidden">
                  {[
                    { id: 'overview', label: language === 'te' ? 'పరిశీలన & మచ్చలు' : 'Overview & Masking', icon: Eye },
                    { id: 'treatment', label: language === 'te' ? 'వ్యవసాయ చికిత్స' : 'Agronomy Prescription', icon: ShieldCheck },
                    { id: 'cause', label: language === 'te' ? 'లక్షణాలు & కారణం' : 'Symptoms & Cause', icon: Dna },
                    { id: 'timeline', label: language === 'te' ? '14 రోజుల ప్రణాళిక' : '14-Day Calendar', icon: Calendar },
                    { id: 'probabilities', label: language === 'te' ? 'సంభావ్యత శ్రేణి' : 'Probabilities', icon: Layers }
                  ].map((tab) => {
                    const Icon = tab.icon;
                    const active = activeTab === tab.id;
                    return (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => setActiveTab(tab.id)}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
                          active
                            ? 'bg-gradient-to-r from-emerald-500 to-teal-400 text-black font-black shadow-md'
                            : 'bg-slate-950/60 text-slate-400 hover:text-white hover:bg-slate-900 border border-slate-800'
                        }`}
                      >
                        <Icon className="w-3.5 h-3.5" />
                        <span>{tab.label}</span>
                      </button>
                    );
                  })}
                </div>

                {/* TAB 1: OVERVIEW & LESION MASKING */}
                {(activeTab === 'overview' || window.matchMedia('print').matches) && (
                  <div className="space-y-4">
                    {/* DUAL IMAGE COMPARISON */}
                    {result.original_image_b64 && result.processed_image_b64 && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                            {language === 'te' ? 'అసలు ఆకు ఫోటో' : 'Raw Sensor Leaf Photo'}
                          </span>
                          <div className="w-full h-56 sm:h-64 rounded-2xl overflow-hidden border border-slate-800 bg-black relative shadow-lg">
                            <img
                              src={`data:image/png;base64,${result.original_image_b64}`}
                              alt="Original Leaf"
                              className="w-full h-full object-contain mx-auto"
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                            <Activity className="w-3.5 h-3.5" />
                            <span>{language === 'te' ? 'ఓపెన్‌సీవీ మచ్చల గుర్తింపు (Lesion Masking)' : 'OpenCV Lesion Masking'}</span>
                          </span>
                          <div className={`w-full h-56 sm:h-64 rounded-2xl overflow-hidden border bg-black relative shadow-lg ${
                            result.infected_area_count > 0 ? 'border-rose-500/50' : 'border-emerald-500/50'
                          }`}>
                            <img
                              src={`data:image/png;base64,${result.processed_image_b64}`}
                              alt="Lesion Segmentation Mask"
                              className="w-full h-full object-contain mx-auto"
                            />
                            {result.infected_area_count > 0 ? (
                              <div className="absolute top-3 right-3 bg-rose-600 text-white text-xs font-black px-3 py-1 rounded-full shadow border border-rose-400">
                                {language === 'te' 
                                  ? `${result.infected_area_count} తెగులు మచ్చలు గుర్తించబడ్డాయి` 
                                  : `${result.infected_area_count} Lesion Hotspots Highlighted`}
                              </div>
                            ) : (
                              <div className="absolute top-3 right-3 bg-emerald-500 text-black text-xs font-black px-3 py-1 rounded-full shadow border border-emerald-400">
                                {language === 'te' ? 'ఆకు ఆరోగ్యంగా ఉంది' : 'Foliage Healthy'}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* WEATHER METRICS */}
                    {result.environmental_factors && (
                      <div className="grid grid-cols-3 gap-3.5 pt-2">
                        <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-1 text-center">
                          <div className="text-xs text-slate-400 font-bold uppercase flex items-center justify-center gap-1.5">
                            <Thermometer className="w-4 h-4 text-rose-400" />
                            <span>{language === 'te' ? 'అనుకూల ఉష్ణోగ్రత' : 'Outbreak Temp'}</span>
                          </div>
                          <div className="text-base sm:text-lg font-black text-white">
                            {result.environmental_factors.temperature || '18°C - 28°C'}
                          </div>
                        </div>

                        <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-1 text-center">
                          <div className="text-xs text-slate-400 font-bold uppercase flex items-center justify-center gap-1.5">
                            <Droplets className="w-4 h-4 text-cyan-400" />
                            <span>{language === 'te' ? 'గాలిలో తేమ' : 'Humidity'}</span>
                          </div>
                          <div className="text-base sm:text-lg font-black text-white">
                            {result.environmental_factors.humidity || '80% - 95%'}
                          </div>
                        </div>

                        <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-1 text-center">
                          <div className="text-xs text-slate-400 font-bold uppercase flex items-center justify-center gap-1.5">
                            <Activity className="w-4 h-4 text-emerald-400" />
                            <span>{language === 'te' ? 'ఆకు తేమ సమయం' : 'Leaf Wetness'}</span>
                          </div>
                          <div className="text-base sm:text-lg font-black text-white">
                            {result.environmental_factors.leaf_wetness || '> 6 hours'}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* TAB 2: AGRONOMY PRESCRIPTION (IPM) */}
                {activeTab === 'treatment' && (
                  <div className="space-y-4">
                    {/* Organic Solution */}
                    <div className="p-5 sm:p-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 space-y-2">
                      <h4 className="font-bold text-emerald-300 text-sm sm:text-base flex items-center gap-2">
                        <Sprout className="w-5 h-5 text-emerald-400" />
                        <span>{language === 'te' ? 'సేంద్రీయ & జీవ నియంత్రణ చికిత్స' : 'Organic & Biological Remedy'}</span>
                      </h4>
                      <p className="text-slate-200 text-xs sm:text-sm leading-relaxed font-medium">
                        {dossier.organicTreatment}
                      </p>
                    </div>

                    {/* Chemical Spray */}
                    <div className="p-5 sm:p-6 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 space-y-2">
                      <h4 className="font-bold text-cyan-300 text-sm sm:text-base flex items-center gap-2">
                        <FlaskConical className="w-5 h-5 text-cyan-400" />
                        <span>{language === 'te' ? 'సిఫార్సు చేసిన రసాయన పిచికారీ' : 'Registered Chemical Treatment'}</span>
                      </h4>
                      <p className="text-slate-200 text-xs sm:text-sm leading-relaxed font-medium">
                        {dossier.chemicalTreatment}
                      </p>
                    </div>

                    {/* Field Prevention */}
                    <div className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2">
                      <h4 className="font-bold text-amber-300 text-xs sm:text-sm flex items-center gap-2">
                        <ShieldAlert className="w-4 h-4 text-amber-400" />
                        <span>{language === 'te' ? 'పొలంలో యాజమాన్య పద్ధతులు & పరిశుభ్రత' : 'Cultural Field Sanitation'}</span>
                      </h4>
                      <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
                        {dossier.precautions}
                      </p>
                    </div>

                    {/* Source Citation */}
                    {dossier.source && (
                      <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-400 flex items-center justify-between">
                        <span className="flex items-center gap-2 font-medium">
                          <BookOpen className="w-4 h-4 text-emerald-400" />
                          <span>
                            {language === 'te'
                              ? `అధికారిక వ్యవసాయ మూలం: ${dossier.source}`
                              : `Official Agronomic Source: ${result.authoritative_source || dossier.source}`}
                          </span>
                        </span>
                      </div>
                    )}
                  </div>
                )}

                {/* TAB 3: SYMPTOMS & PATHOGEN SCIENCE */}
                {activeTab === 'cause' && (
                  <div className="space-y-4">
                    {/* Symptoms */}
                    {dossier.visibleSymptoms && dossier.visibleSymptoms.length > 0 && (
                      <div className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-3">
                        <h4 className="font-bold text-amber-300 uppercase tracking-wider text-xs flex items-center gap-2">
                          <Bug className="w-4 h-4 text-amber-400" />
                          <span>{language === 'te' ? 'గమనించిన వ్యాధి లక్షణాలు' : 'Clinical Symptoms Observed'}</span>
                        </h4>
                        <div className="grid sm:grid-cols-2 gap-2.5">
                          {dossier.visibleSymptoms.map((sym, idx) => (
                            <div key={idx} className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-200 font-medium">
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 flex-shrink-0" />
                              <span>{sym}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Exact Cause */}
                    <div className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2">
                      <h4 className="font-bold text-cyan-300 text-xs sm:text-sm flex items-center gap-2">
                        <Dna className="w-4 h-4 text-cyan-400" />
                        <span>{language === 'te' ? 'వ్యాధికి ఖచ్చితమైన శాస్త్రీయ కారణం' : 'Exact Pathological Cause'}</span>
                      </h4>
                      <p className="text-slate-200 text-xs sm:text-sm leading-relaxed">
                        {dossier.exactCause}
                      </p>
                    </div>
                  </div>
                )}

                {/* TAB 4: 14-DAY CALENDAR */}
                {activeTab === 'timeline' && (
                  <div className="space-y-3.5">
                    <h4 className="font-bold text-slate-200 text-xs uppercase tracking-wider flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-emerald-400" />
                      <span>{language === 'te' ? '14 రోజుల వ్యవసాయ రికవరీ ప్రణాళిక' : '14-Day Agronomic Recovery Roadmap'}</span>
                    </h4>

                    {dossier.plan14Day ? (
                      <div className="space-y-3">
                        {[
                          { 
                            day: language === 'te' ? '1–2 రోజులు' : 'Days 1–2', 
                            title: language === 'te' ? 'పరిశుభ్రత' : 'Sanitation', 
                            text: dossier.plan14Day.day_1_2, 
                            color: 'emerald' 
                          },
                          { 
                            day: language === 'te' ? '3–5 రోజులు' : 'Days 3–5', 
                            title: language === 'te' ? 'లక్ష్యిత పిచికారీ' : 'Targeted Spray', 
                            text: dossier.plan14Day.day_3_5, 
                            color: 'cyan' 
                          },
                          { 
                            day: language === 'te' ? '6–8 రోజులు' : 'Days 6–8', 
                            title: language === 'te' ? 'పర్యవేక్షణ' : 'Monitoring', 
                            text: dossier.plan14Day.day_6_8, 
                            color: 'teal' 
                          },
                          { 
                            day: language === 'te' ? '9–11 రోజులు' : 'Days 9–11', 
                            title: language === 'te' ? 'సమీక్ష' : 'Audit', 
                            text: dossier.plan14Day.day_9_11, 
                            color: 'amber' 
                          },
                          { 
                            day: language === 'te' ? '12–14 రోజులు' : 'Days 12–14', 
                            title: language === 'te' ? 'రికవరీ నిర్ధారణ' : 'Clearance', 
                            text: dossier.plan14Day.day_12_14, 
                            color: 'rose' 
                          }
                        ].map((step, idx) => (
                          <div key={idx} className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1">
                            <span className={`px-2.5 py-0.5 rounded-md text-[11px] font-black uppercase inline-block ${
                              step.color === 'emerald' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' :
                              step.color === 'cyan' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' :
                              step.color === 'amber' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' :
                              'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                            }`}>
                              {step.day}: {step.title}
                            </span>
                            <p className="text-slate-200 text-xs sm:text-sm leading-relaxed">
                              {step.text}
                            </p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-slate-300">
                        {language === 'te' ? 'వ్యాధి సోకిన మొక్కలను వేరుచేసి సిఫార్సు చేసిన మందులను పిచికారీ చేయండి.' : (result.action_timeline?.immediate || "Isolate infected plants and spray broad-spectrum protectant.")}
                      </div>
                    )}
                  </div>
                )}

                {/* TAB 5: AI PROBABILITIES */}
                {activeTab === 'probabilities' && (
                  <div className="space-y-3.5">
                    <h4 className="font-bold text-slate-200 text-xs uppercase tracking-wider flex items-center gap-2">
                      <Layers className="w-4 h-4 text-cyan-400" />
                      <span>{language === 'te' ? 'AI అంచనాల పోలిక శ్రేణి' : 'Competing Neural Hypotheses'}</span>
                    </h4>

                    {result.top_predictions && result.top_predictions.length > 0 ? (
                      <div className="space-y-3">
                        {result.top_predictions.map((pred, idx) => (
                          <div key={idx} className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
                            <div className="flex items-center justify-between text-xs sm:text-sm font-bold">
                              <span className="text-white">
                                {language === 'te' ? getTeluguDiseaseTitle(pred.disease) : pred.disease}
                              </span>
                              <span className="text-emerald-300 font-black">{pred.confidence}%</span>
                            </div>
                            <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${pred.confidence}%` }}
                                transition={{ duration: 0.5, delay: idx * 0.1 }}
                                className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-400"
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-slate-300">
                        {language === 'te' ? 'ప్రాథమిక అంచనా:' : 'Primary Prediction:'} <strong className="text-emerald-300">{result.confidence}%</strong>
                      </div>
                    )}
                  </div>
                )}

                {/* Bottom Dossier Action Bar */}
                <div className="pt-4 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3">
                  <button
                    type="button"
                    onClick={resetScanner}
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 text-black font-black text-xs sm:text-sm shadow-md flex items-center gap-2 active:scale-95 transition-all"
                  >
                    <RefreshCw className="w-4 h-4" />
                    <span>{language === 'te' ? 'మరో ఆకును స్కాన్ చేయండి' : 'Scan Another Leaf'}</span>
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={speakDiagnosisText}
                      className="px-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 hover:text-white text-xs font-bold flex items-center gap-2"
                    >
                      <Volume2 className="w-4 h-4 text-emerald-400" />
                      <span>{isSpeaking ? (language === 'te' ? 'ఆపండి' : 'Stop Audio') : (language === 'te' ? 'వాయిస్ వినండి' : 'Audio Narration')}</span>
                    </button>

                    <button
                      type="button"
                      onClick={handlePrint}
                      className="px-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 hover:text-white text-xs font-bold flex items-center gap-2"
                    >
                      <Printer className="w-4 h-4 text-slate-400" />
                      <span>{language === 'te' ? 'నివేదిక ముద్రించండి' : 'Print Dossier'}</span>
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default DiseaseDetection;
