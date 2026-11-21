import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Upload, Camera, AlertCircle, CheckCircle, BrainCircuit,
  ShieldAlert, ShieldCheck, Bug, Activity, Sparkles, RefreshCw,
  Layers, Eye, CheckCircle2, Volume2, Printer, Leaf, Shield,
  Dna, Calendar, Droplets, Wind, FlaskConical, Sprout,
  Lightbulb, AlertTriangle, ArrowRight, BookOpen, ArrowUpRight,
  Zap, Info, X, Image as ImageIcon, Check, Thermometer,
  ChevronDown, ChevronUp, Cpu, HeartHandshake, CloudUpload,
  Crosshair, FileText, ChevronRight
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

const PRIMARY_CROPS = [
  { id: 'Auto-Detect', labelEn: 'Auto Detect', labelTe: 'ఆటో-డిటెక్ట్', emoji: '🎯', isAuto: true },
  { id: 'Tomato', labelEn: 'Tomato', labelTe: 'టమాటా', emoji: '🍅' },
  { id: 'Rice', labelEn: 'Rice', labelTe: 'వరి', emoji: '🌾' },
  { id: 'Wheat', labelEn: 'Wheat', labelTe: 'గోధుమ', emoji: '🌾' },
  { id: 'Corn', labelEn: 'Maize', labelTe: 'మొక్కజొన్న', emoji: '🌽' },
  { id: 'Cotton', labelEn: 'Cotton', labelTe: 'పత్తి', emoji: '🪵' },
  { id: 'Chilli', labelEn: 'Chilli', labelTe: 'మిరప', emoji: '🌶️' },
  { id: 'Potato', labelEn: 'Potato', labelTe: 'బంగాళాదుంప', emoji: '🥔' },
  { id: 'Apple', labelEn: 'Apple', labelTe: 'యాపిల్', emoji: '🍎' },
  { id: 'Banana', labelEn: 'Banana', labelTe: 'అరటి', emoji: '🍌' },
];

const EXTRA_CROPS = [
  { id: 'Grape', labelEn: 'Grape', labelTe: 'ద్రాక్ష', emoji: '🍇' },
  { id: 'Orange', labelEn: 'Citrus', labelTe: 'సంత్రా', emoji: '🍊' },
  { id: 'Peach', labelEn: 'Peach', labelTe: 'పీచ్', emoji: '🍑' },
  { id: 'Pepper', labelEn: 'Bell Pepper', labelTe: 'బెల్ పెప్పర్', emoji: '🫑' },
  { id: 'Strawberry', labelEn: 'Strawberry', labelTe: 'స్ట్రాబెర్రీ', emoji: '🍓' },
  { id: 'Soybean', labelEn: 'Soybean', labelTe: 'సోయాబీన్', emoji: '🌱' },
  { id: 'Blueberry', labelEn: 'Blueberry', labelTe: 'బ్లూబెర్రీ', emoji: '🫐' },
  { id: 'Cherry', labelEn: 'Cherry', labelTe: 'చెర్రీ', emoji: '🍒' },
  { id: 'Squash', labelEn: 'Squash', labelTe: 'గుమ్మడి', emoji: '🎃' },
];

const PRIMARY_SAMPLES = [
  {
    id: 'sample-tomato',
    name: 'Tomato - Late Blight',
    nameTe: 'టమాటా - లేట్ బ్లైట్',
    crop: 'Tomato',
    cropTe: 'టమాటా',
    path: '/samples/tomato_blight.jpg',
    filename: 'tomato_blight.jpg',
    badge: 'Fruit & Leaf Rot',
    badgeTe: 'ఆకు & కాయ కుళ్ళు',
    emoji: '🍅'
  },
  {
    id: 'sample-wheat',
    name: 'Wheat - Rust',
    nameTe: 'గోధుమ - కుంకుమ తెగులు',
    crop: 'Wheat',
    cropTe: 'గోధుమ',
    path: '/samples/wheat_rust.webp',
    filename: 'wheat_rust.webp',
    badge: 'Stripe Rust Spores',
    badgeTe: 'పసుపు చారల తెగులు',
    emoji: '🌾'
  },
  {
    id: 'sample-rice',
    name: 'Rice - Leaf Blast',
    nameTe: 'వరి - అగ్గి తెగులు',
    crop: 'Rice',
    cropTe: 'వరి',
    path: '/samples/rice_blast.jpg',
    filename: 'rice_blast.jpg',
    badge: 'Panicle Blast',
    badgeTe: 'ఆకు మచ్చ & బ్లాస్ట్',
    emoji: '🌾'
  },
  {
    id: 'sample-corn',
    name: 'Maize - Leaf Spot',
    nameTe: 'మొక్కజొన్న - ఆకు మచ్చ',
    crop: 'Corn',
    cropTe: 'మొక్కజొన్న',
    path: '/samples/maize_leaf_spot.jpg',
    filename: 'maize_leaf_spot.jpg',
    badge: 'Cercospora Lesions',
    badgeTe: 'బూడిద రంగు మచ్చలు',
    emoji: '🌽'
  },
  {
    id: 'sample-cotton',
    name: 'Cotton - Leaf Curl',
    nameTe: 'పత్తి - ఆకు ముడత / తెగులు',
    crop: 'Cotton',
    cropTe: 'పత్తి',
    path: '/samples/cotton_leaf_blight.jpg',
    filename: 'cotton_leaf_blight.jpg',
    badge: 'Bacterial Blight',
    badgeTe: 'బాక్టీరియల్ బ్లైట్',
    emoji: '🪵'
  }
];

const MORE_SAMPLES = [
  {
    id: 'sample-potato',
    name: 'Potato - Late Blight',
    nameTe: 'బంగాళాదుంప - లేట్ బ్లైట్',
    crop: 'Potato',
    cropTe: 'బంగాళాదుంప',
    path: '/samples/potato_late_blight.jpg',
    filename: 'potato_late_blight.jpg',
    badge: 'Tuber Blight Lesion',
    badgeTe: 'దుంప కుళ్ళు తెగులు',
    emoji: '🥔'
  },
  {
    id: 'sample-apple',
    name: 'Apple - Apple Scab',
    nameTe: 'యాపిల్ - స్కాబ్ తెగులు',
    crop: 'Apple',
    cropTe: 'యాపిల్',
    path: '/samples/apple_scab.jpg',
    filename: 'apple_scab.jpg',
    badge: 'Fungal Lesion',
    badgeTe: 'శిలీంధ్ర మచ్చలు',
    emoji: '🍎'
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
  const [activeTab, setActiveTab] = useState('overview'); // 'overview', 'treatment', 'cause', 'timeline', 'probabilities'
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [selectedCrop, setSelectedCrop] = useState('Auto-Detect');
  const [showAllCrops, setShowAllCrops] = useState(false);
  const [showMoreSamples, setShowMoreSamples] = useState(false);
  const [workflowMode, setWorkflowMode] = useState('quick'); // 'quick' or 'guided'

  const fileInputRef = useRef(null);
  const videoRef = useRef(null);
  const requestIdRef = useRef(0);
  const resultsRef = useRef(null);

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
        ? "దయచేసి చెల్లుబాటు అయ్యే పంట ఆకు ఫోటోను ఎంచుకోండి (JPG, PNG, WEBP)."
        : "Please select a valid crop leaf image file (JPG, PNG, WEBP)."
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

  const runPredictionWithFile = async (file, crop) => {
    if (!file) return;
    setLoading(true);
    setError(null);
    setErrorPayload(null);
    setResult(null);

    const reqId = ++requestIdRef.current;
    const formData = new FormData();
    formData.append('file', file);
    formData.append('crop_type', crop || selectedCrop || 'Auto-Detect');

    try {
      const response = await api.post(`/predict/predict-disease?lang=${language}`, formData);
      if (reqId !== requestIdRef.current) return;

      if (response.data && response.data.success) {
        setResult(response.data);
        setError(null);
        setErrorPayload(null);
        setActiveTab('overview');
      }
    } catch (err) {
      console.error("Auto sample predict error:", err);
    } finally {
      if (reqId === requestIdRef.current) {
        setLoading(false);
      }
    }
  };

  const loadSample = async (sample, autoPredict = true) => {
    try {
      setSelectedCrop(sample.crop);
      const res = await fetch(sample.path);
      const blob = await res.blob();
      const file = new File([blob], sample.filename, { type: blob.type || 'image/jpeg' });
      processFile(file);
      if (autoPredict) {
        runPredictionWithFile(file, sample.crop);
      }
    } catch (err) {
      console.error("Could not load sample:", err);
    }
  };

  // Listen for programmatic mode switches and sample loading (from Guided Tour)
  useEffect(() => {
    const handleSwitchMode = (e) => {
      if (e.detail?.mode) {
        setWorkflowMode(e.detail.mode);
      }
      if (e.detail?.loadSample && !result) {
        loadSample(PRIMARY_SAMPLES[0], true);
      }
    };
    window.addEventListener('agrovision-switch-disease-mode', handleSwitchMode);
    return () => window.removeEventListener('agrovision-switch-disease-mode', handleSwitchMode);
  }, [result]);

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
      setErrorPayload(err.response?.data || null);
      const serverMsg = err.response?.data?.message || err.response?.data?.detail;
      const timeoutMsg = err.code === 'ECONNABORTED' ? "The AI diagnosis server is waking up. Please retry in a moment." : null;
      setError(language === 'te'
        ? (serverMsg || "సర్వర్ లోపం ఏర్పడింది. దయచేసి మళ్ళీ ప్రయత్నించండి.")
        : (serverMsg || timeoutMsg || err.message || "Internal diagnosis error. Please try again.")
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
    <div className="w-full max-w-[96rem] mx-auto text-slate-100 print:py-0 print:bg-white print:text-black flex-1 flex flex-col justify-between min-h-0 py-1 sm:py-2 px-2 sm:px-4">
      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        accept="image/*"
        onChange={handleFileChange}
      />

      {/* Atmospheric Ambient Glows */}
      <div className="fixed top-4 left-1/4 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[200px] pointer-events-none -z-10" />
      <div className="fixed top-1/3 right-1/4 w-[450px] h-[450px] bg-teal-400/10 rounded-full blur-[180px] pointer-events-none -z-10" />

      {/* ==================================================================== */}
      {/* HEADER SECTION (VISIBLE ONLY BEFORE SCAN / WHEN NO RESULTS ARE DISPLAYED) */}
      {/* ==================================================================== */}
      {!result && (
        <div className="relative pt-0 pb-1 flex-shrink-0 space-y-2">
          {/* Top Banner Row: Left Title & Right "Two Ways to Diagnose" HUD */}
          <div className="flex flex-col lg:flex-row items-center justify-between gap-3 text-center lg:text-left">
            {/* Left Title & Description */}
            <div className="flex flex-col items-center lg:items-start max-w-2xl">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#07241a]/90 text-emerald-300 border border-emerald-400/30 backdrop-blur-md shadow-[0_0_12px_rgba(46,237,146,0.15)] mb-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#2eed92] animate-pulse shadow-[0_0_6px_#2eed92]" />
                <span>{language === 'te' ? 'AI ఆధారిత పంట ఆరోగ్య విశ్లేషణ' : 'AI-Powered Crop Health Analysis'}</span>
              </div>

              <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-white tracking-tight leading-tight">
                <span>Crop Disease </span>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#2eed92] via-[#34d399] to-[#10b981] drop-shadow-[0_0_20px_rgba(46,237,146,0.55)]">
                  {language === 'te' ? 'నిర్ధారణ' : 'Detection'}
                </span>
              </h1>

              <p className="text-xs sm:text-sm text-slate-300 mt-1 font-normal leading-relaxed">
                {language === 'te'
                  ? 'పంట ఆకు ఫోటోను అప్‌లోడ్ చేసి పంటను గుర్తించండి, వ్యాధులను కనుగొనండి లేదా మార్గదర్శక ప్రశ్నలకు సమాధానమివ్వండి.'
                  : 'Detect crop diseases using AI image analysis or answer a few questions for expert diagnosis and treatment guidance.'}
              </p>
            </div>

            {/* Right: "Two Ways to Diagnose" Glass HUD Badge (Desktop) */}
            <div className="hidden lg:flex items-center gap-3 p-2.5 rounded-2xl bg-[#061d15]/80 border border-emerald-500/30 backdrop-blur-xl shadow-lg">
              {/* Reticle Leaf Preview */}
              <div className="relative w-12 h-12 rounded-xl bg-black/60 border border-emerald-500/40 flex items-center justify-center overflow-hidden flex-shrink-0">
                <Leaf className="w-6 h-6 text-[#2eed92]" />
                <div className="absolute top-1 left-1 w-2 h-2 border-t-2 border-l-2 border-[#2eed92]" />
                <div className="absolute top-1 right-1 w-2 h-2 border-t-2 border-r-2 border-[#2eed92]" />
                <div className="absolute bottom-1 left-1 w-2 h-2 border-b-2 border-l-2 border-[#2eed92]" />
                <div className="absolute bottom-1 right-1 w-2 h-2 border-b-2 border-r-2 border-[#2eed92]" />
              </div>

              <div className="text-left space-y-1 pr-2">
                <div className="text-xs font-black text-white flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#2eed92]" />
                  <span>{language === 'te' ? 'రెండు రోగనిర్ధారణ పద్ధతులు' : 'Two Ways to Diagnose'}</span>
                </div>
                <div className="text-[11px] text-slate-300 space-y-0.5">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[#2eed92] font-bold">✓</span>
                    <span><strong>Vision Scan</strong> – {language === 'te' ? 'ఆకు ఫోటో అప్‌లోడ్' : 'Upload a leaf image'}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[#2eed92] font-bold">✓</span>
                    <span><strong>Questionnaire</strong> – {language === 'te' ? 'మార్గదర్శక ప్రశ్నలు' : 'Answer guided questions'}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Mode Switcher Pills: Dual-Tier with Action Subtext */}
          <div className="flex items-center justify-center pt-1 print:hidden">
            <div id="tour-disease-modes" className="p-1 rounded-2xl bg-[#061c14]/90 border border-emerald-500/30 backdrop-blur-xl flex items-center gap-1 shadow-xl">
              <button
                id="tour-vision-scan-btn"
                type="button"
                onClick={() => setWorkflowMode('quick')}
                className={`px-5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2.5 ${workflowMode === 'quick'
                  ? 'bg-gradient-to-r from-[#2eed92] to-[#10b981] text-slate-950 font-black shadow-[0_0_15px_rgba(46,237,146,0.4)]'
                  : 'text-slate-300 hover:text-white hover:bg-emerald-950/40'
                  }`}
              >
                <Zap className={`w-4 h-4 ${workflowMode === 'quick' ? 'text-slate-950' : 'text-[#2eed92]'}`} />
                <div className="text-left">
                  <span className="block leading-tight">{language === 'te' ? 'విజన్ స్కాన్' : 'Vision Scan'}</span>
                  <span className={`text-[10px] block font-normal leading-tight ${workflowMode === 'quick' ? 'text-slate-900/80 font-semibold' : 'text-slate-400'}`}>
                    {language === 'te' ? 'AI చిత్ర విశ్లేషణ' : 'AI Image Analysis'}
                  </span>
                </div>
              </button>

              <button
                id="tour-questionnaire-btn"
                type="button"
                onClick={() => setWorkflowMode('guided')}
                className={`px-5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2.5 ${workflowMode === 'guided'
                  ? 'bg-gradient-to-r from-[#2eed92] to-[#10b981] text-slate-950 font-black shadow-[0_0_15px_rgba(46,237,146,0.4)]'
                  : 'text-slate-300 hover:text-white hover:bg-emerald-950/40'
                  }`}
              >
                <Sparkles className={`w-4 h-4 ${workflowMode === 'guided' ? 'text-slate-950' : 'text-[#2eed92]'}`} />
                <div className="text-left">
                  <span className="block leading-tight">{language === 'te' ? 'ప్రశ్నావళి' : 'Questionnaire'}</span>
                  <span className={`text-[10px] block font-normal leading-tight ${workflowMode === 'guided' ? 'text-slate-900/80 font-semibold' : 'text-slate-400'}`}>
                    {language === 'te' ? 'లక్షణాల ఆధారిత రోగనిర్ధారణ' : 'Symptom-Based Diagnosis'}
                  </span>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* WORKFLOW VIEW: QUICK SCAN OR GUIDED */}
      {/* ==================================================================== */}
      {workflowMode === 'guided' ? (
        <AdaptiveQuestionnaire onResetToQuickScan={() => setWorkflowMode('quick')} />
      ) : (
        <div className={result ? "flex-1 flex flex-col min-h-0 h-full justify-between" : "flex-1 flex flex-col justify-between min-h-0 gap-2.5 sm:gap-3"}>
          {/* ==================================================================== */}
          {/* STATE A: NO RESULT YET -> SHOW UPLOAD BOX + CROP SELECTOR + SAMPLES */}
          {/* ==================================================================== */}
          {!result && (
            <>
              {/* MAIN HERO UPLOAD BOX + HOW IT WORKS GRID */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-2.5 sm:gap-3 items-stretch flex-shrink-0">
                {/* LEFT: HERO UPLOAD CARD */}
                <div id="tour-upload-dropzone" className="lg:col-span-8 rounded-2xl bg-[#061c15]/80 backdrop-blur-2xl border border-emerald-500/30 p-3 sm:p-3.5 shadow-[0_8px_32px_rgba(0,0,0,0.5)] flex flex-col justify-between relative overflow-hidden group hover:border-emerald-400/50 transition-all duration-300">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-[90px] pointer-events-none" />

                  {/* Dropzone Container */}
                  <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    className={`relative w-full rounded-xl transition-all duration-300 flex flex-col items-center justify-center min-h-[175px] sm:min-h-[190px] md:min-h-[200px] ${previewUrl || isCameraActive
                      ? 'border border-emerald-500/30 bg-black/60 p-2.5'
                      : isDragging
                        ? 'border-2 border-[#2eed92] bg-emerald-500/15 scale-[1.01] p-3'
                        : 'border-2 border-dashed border-emerald-500/30 hover:border-emerald-400/60 bg-[#051811]/60 p-3'
                      }`}
                  >
                    {/* Camera Active State */}
                    {isCameraActive ? (
                      <div className="relative w-full h-full min-h-[220px] rounded-xl overflow-hidden bg-black flex flex-col items-center justify-center">
                        <video
                          ref={videoRef}
                          autoPlay
                          playsInline
                          className="w-full h-full object-cover rounded-lg"
                        />
                        <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-rose-600/90 text-white text-[11px] font-bold flex items-center gap-1.5 shadow-lg backdrop-blur-md">
                          <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                          <span>{language === 'te' ? 'ప్రత్యక్ష కెమెరా' : 'Live Camera'}</span>
                        </div>

                        {/* Viewfinder Reticle */}
                        <div className="absolute inset-6 border border-emerald-400/40 rounded-xl pointer-events-none">
                          <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-[#2eed92]" />
                          <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-[#2eed92]" />
                          <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-[#2eed92]" />
                          <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-[#2eed92]" />
                        </div>

                        <div className="absolute bottom-3 left-0 right-0 flex items-center justify-center gap-2.5 px-4 z-20">
                          <button
                            type="button"
                            onClick={captureCameraPhoto}
                            className="px-4 py-1.5 rounded-full bg-gradient-to-r from-[#2eed92] to-[#10b981] hover:from-[#3ff29f] hover:to-[#18cc90] text-slate-950 font-black text-xs shadow-[0_0_15px_rgba(46,237,146,0.4)] flex items-center gap-1.5 active:scale-95 transition-all"
                          >
                            <Camera className="w-3.5 h-3.5" />
                            <span>{language === 'te' ? 'ఫోటో తీయండి' : 'Snap Photo'}</span>
                          </button>
                          <button
                            type="button"
                            onClick={stopCamera}
                            className="px-3.5 py-1.5 rounded-full bg-[#0a2318]/90 hover:bg-[#0e2e20] text-slate-200 border border-slate-700 font-bold text-xs active:scale-95 transition-all"
                          >
                            {language === 'te' ? 'రద్దు చేయి' : 'Cancel'}
                          </button>
                        </div>
                      </div>
                    ) : previewUrl ? (
                      /* Image Loaded in High-Tech HUD Viewfinder */
                      <div className="relative w-full h-full min-h-[200px] rounded-xl overflow-hidden bg-black/80 flex flex-col items-center justify-center group p-1.5">
                        <div className="relative max-h-[220px] w-full flex items-center justify-center overflow-hidden rounded-lg border border-emerald-500/30 bg-[#04100c]">
                          <img
                            src={previewUrl}
                            alt="Loaded Leaf Preview"
                            className="w-full h-full max-h-[220px] object-contain mx-auto"
                          />

                          {/* Sci-Fi Corner Brackets */}
                          <div className="absolute top-2 left-2 w-3.5 h-3.5 border-t-2 border-l-2 border-[#2eed92]" />
                          <div className="absolute top-2 right-2 w-3.5 h-3.5 border-t-2 border-r-2 border-[#2eed92]" />
                          <div className="absolute bottom-2 left-2 w-3.5 h-3.5 border-b-2 border-l-2 border-[#2eed92]" />
                          <div className="absolute bottom-2 right-2 w-3.5 h-3.5 border-b-2 border-r-2 border-[#2eed92]" />

                          {/* Animated Laser Scanning Line */}
                          {loading && (
                            <motion.div
                              initial={{ top: '0%' }}
                              animate={{ top: ['0%', '95%', '0%'] }}
                              transition={{ repeat: Infinity, duration: 2.0, ease: 'easeInOut' }}
                              className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#2eed92] to-transparent shadow-[0_0_20px_#2eed92] z-20"
                            />
                          )}
                        </div>

                        {/* Controls bar */}
                        <div className="w-full flex items-center justify-between gap-2 pt-2 px-1">
                          <span className="px-2 py-0.5 rounded-lg bg-[#07241a]/90 text-emerald-400 text-xs font-bold border border-emerald-500/30 flex items-center gap-1.5 shadow-sm">
                            <Sprout className="w-3.5 h-3.5" />
                            <span>
                              {language === 'te'
                                ? `లక్ష్యం: ${TELUGU_CROPS[selectedCrop] || selectedCrop}`
                                : `Target: ${selectedCrop}`}
                            </span>
                          </span>

                          <button
                            type="button"
                            onClick={resetScanner}
                            className="px-2.5 py-0.5 rounded-lg bg-[#092218]/90 hover:bg-[#0d2d20] text-slate-200 hover:text-white text-xs font-bold border border-emerald-500/30 shadow flex items-center gap-1.5 transition-all"
                          >
                            <X className="w-3 h-3 text-rose-400" />
                            <span>{language === 'te' ? 'ఫోటో మార్చండి' : 'Change Photo'}</span>
                          </button>
                        </div>
                      </div>
                    ) : (
                      /* Default Upload Prompt with Fanned Cards Graphic */
                      <div className="w-full py-1.5 px-1.5 flex flex-col sm:flex-row items-center justify-between gap-4">
                        {/* Fanned Leaf Cards Graphic */}
                        <div className="relative w-32 h-26 flex-shrink-0 hidden sm:flex items-center justify-center">
                          <div className="absolute w-22 h-26 rounded-xl bg-[#06241a]/60 border border-emerald-500/30 shadow-lg -rotate-12 -translate-x-3.5 scale-90 overflow-hidden opacity-50">
                            <img
                              src="/samples/rice_blast.jpg"
                              alt="Leaf Preview 1"
                              className="w-full h-full object-cover filter brightness-75"
                            />
                          </div>
                          <div className="absolute w-22 h-26 rounded-xl bg-[#072a1e]/80 border border-emerald-500/40 shadow-xl -rotate-6 -translate-x-1 scale-95 overflow-hidden opacity-75">
                            <img
                              src="/samples/wheat_rust.webp"
                              alt="Leaf Preview 2"
                              className="w-full h-full object-cover filter brightness-90"
                            />
                          </div>
                          <div className="relative w-22 h-26 rounded-xl bg-[#083022] border-2 border-[#2eed92]/70 shadow-[0_0_15px_rgba(46,237,146,0.4)] overflow-hidden">
                            <img
                              src="/samples/tomato_blight.jpg"
                              alt="Leaf Preview 3"
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute top-1 left-1 w-2.5 h-2.5 border-t-2 border-l-2 border-[#2eed92]" />
                            <div className="absolute top-1 right-1 w-2.5 h-2.5 border-t-2 border-r-2 border-[#2eed92]" />
                            <div className="absolute bottom-1 left-1 w-2.5 h-2.5 border-b-2 border-l-2 border-[#2eed92]" />
                            <div className="absolute bottom-1 right-1 w-2.5 h-2.5 border-b-2 border-r-2 border-[#2eed92]" />
                          </div>
                        </div>

                        {/* Upload Controls */}
                        <div className="flex-1 flex flex-col items-center sm:items-start text-center sm:text-left space-y-2">
                          <div className="w-10 h-10 rounded-xl bg-[#082a1f]/80 border border-emerald-400/40 text-[#2eed92] flex items-center justify-center shadow-[0_0_12px_rgba(46,237,146,0.25)]">
                            <CloudUpload className="w-5 h-5 text-[#2eed92]" />
                          </div>

                          <div className="space-y-0.5">
                            <h3 className="text-base sm:text-lg font-black text-white tracking-tight">
                              {language === 'te' ? 'పంట ఆకు ఫోటోను అప్‌లోడ్ చేయండి' : 'Upload a Crop Leaf Photo'}
                            </h3>
                            <p className="text-xs text-slate-300 font-normal">
                              {language === 'te'
                                ? 'చిత్రాన్ని ఇక్కడ డ్రాగ్ చేయండి లేదా ఎంచుకోండి (JPG, PNG, WEBP • Max 10 MB)'
                                : 'Drag and drop an image here, or click to browse (JPG, PNG, WEBP • Max 10 MB)'}
                            </p>
                          </div>

                          {/* Action Buttons with Curved Accent Arrow */}
                          <div className="relative flex flex-wrap items-center gap-2 pt-0.5">
                            <button
                              type="button"
                              onClick={() => fileInputRef.current?.click()}
                              className="px-4 py-2 rounded-full bg-gradient-to-r from-[#2eed92] via-[#34d399] to-[#10b981] hover:from-[#3ff29f] hover:to-[#18cc90] text-slate-950 font-black text-xs shadow-[0_0_12px_rgba(46,237,146,0.35)] flex items-center gap-1.5 active:scale-95 transition-all"
                            >
                              <ImageIcon className="w-3.5 h-3.5 text-slate-950" />
                              <span>{language === 'te' ? 'ఫైళ్లను ఎంచుకోండి' : 'Browse Files'}</span>
                            </button>

                            <button
                              type="button"
                              onClick={startCamera}
                              className="px-4 py-2 rounded-full bg-[#07241a]/90 hover:bg-[#0b3325] text-slate-200 border border-emerald-500/40 text-xs font-bold flex items-center gap-1.5 active:scale-95 transition-all shadow-sm"
                            >
                              <Camera className="w-3.5 h-3.5 text-[#2eed92]" />
                              <span>{language === 'te' ? 'ఫోటో తీయండి' : 'Take Photo'}</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Big Diagnose CTA Button (When File Loaded) */}
                  {selectedFile && (
                    <div className="pt-2">
                      <button
                        type="button"
                        onClick={handlePredict}
                        disabled={loading}
                        className="w-full py-2.5 px-4 rounded-xl font-black text-xs sm:text-sm transition-all shadow-[0_0_15px_rgba(46,237,146,0.35)] flex items-center justify-center gap-2 tracking-wide bg-gradient-to-r from-[#2eed92] via-[#34d399] to-[#06b6d4] hover:from-[#3ff29f] hover:to-[#22d3ee] text-slate-950 active:scale-[0.99]"
                      >
                        {loading ? (
                          <div className="flex items-center gap-2">
                            <RefreshCw className="w-3.5 h-3.5 animate-spin text-slate-950" />
                            <span>
                              {language === 'te'
                                ? 'పంట తెగులు మరియు మచ్చలను విశ్లేషిస్తోంది...'
                                : 'Analyzing Plant Pathology & Lesions...'}
                            </span>
                          </div>
                        ) : (
                          <>
                            <BrainCircuit className="w-3.5 h-3.5 text-slate-950" />
                            <span>
                              {language === 'te'
                                ? `AI వ్యాధి నిర్ధారణ ప్రారంభించండి (${TELUGU_CROPS[selectedCrop] || selectedCrop})`
                                : `Run AI Disease Diagnosis (${selectedCrop})`}
                            </span>
                            <ArrowRight className="w-3.5 h-3.5 text-slate-950" />
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>

                {/* RIGHT: HOW IT WORKS CARD */}
                <div className="lg:col-span-4 rounded-2xl bg-[#061c15]/80 backdrop-blur-2xl border border-emerald-500/30 p-3.5 sm:p-4 shadow-[0_8px_32px_rgba(0,0,0,0.5)] flex flex-col justify-between hover:border-emerald-400/50 transition-all duration-300">
                  <div>
                    {/* Header */}
                    <div className="flex items-center gap-2 text-white font-black text-sm pb-2.5 border-b border-emerald-500/20">
                      <Leaf className="w-4 h-4 text-[#2eed92]" />
                      <span>{language === 'te' ? 'ఇది ఎలా పనిచేస్తుంది?' : 'How It Works?'}</span>
                    </div>

                    {/* 3 Steps */}
                    <div className="space-y-3 pt-3">
                      {/* Step 1 */}
                      <div className="flex items-start gap-2.5">
                        <div className="w-6 h-6 rounded-full bg-[#082a1f] border border-[#2eed92]/50 text-[#2eed92] font-black text-xs flex items-center justify-center flex-shrink-0 shadow-[0_0_8px_rgba(46,237,146,0.25)]">
                          1
                        </div>
                        <div className="space-y-0.5">
                          <div className="text-xs font-bold text-white flex items-center gap-1.5">
                            <Upload className="w-3.5 h-3.5 text-[#2eed92]" />
                            <span>{language === 'te' ? 'ఆకు ఫోటోను అప్‌లోడ్ చేయండి' : 'Upload Leaf Image'}</span>
                          </div>
                          <p className="text-[11px] text-slate-300 font-normal leading-tight">
                            {language === 'te' ? 'వ్యాధి సోకిన పంట ఆకు స్పష్టమైన ఫోటోను ఎంచుకోండి.' : 'Choose a clear photo of the affected leaf.'}
                          </p>
                        </div>
                      </div>

                      {/* Step 2 */}
                      <div className="flex items-start gap-2.5">
                        <div className="w-6 h-6 rounded-full bg-[#082a1f] border border-[#2eed92]/50 text-[#2eed92] font-black text-xs flex items-center justify-center flex-shrink-0 shadow-[0_0_8px_rgba(46,237,146,0.25)]">
                          2
                        </div>
                        <div className="space-y-0.5">
                          <div className="text-xs font-bold text-white flex items-center gap-1.5">
                            <Cpu className="w-3.5 h-3.5 text-[#2eed92]" />
                            <span>{language === 'te' ? 'AI విశ్లేషణ' : 'AI Analysis'}</span>
                          </div>
                          <p className="text-[11px] text-slate-300 font-normal leading-tight">
                            {language === 'te' ? 'మా అధునాతన మోడల్ పంట మరియు తెగులును గుర్తిస్తుంది.' : 'Our model identifies crop & disease accurately.'}
                          </p>
                        </div>
                      </div>

                      {/* Step 3 */}
                      <div className="flex items-start gap-2.5">
                        <div className="w-6 h-6 rounded-full bg-[#082a1f] border border-[#2eed92]/50 text-[#2eed92] font-black text-xs flex items-center justify-center flex-shrink-0 shadow-[0_0_8px_rgba(46,237,146,0.25)]">
                          3
                        </div>
                        <div className="space-y-0.5">
                          <div className="text-xs font-bold text-white flex items-center gap-1.5">
                            <FileText className="w-3.5 h-3.5 text-[#2eed92]" />
                            <span>{language === 'te' ? 'ఫలితాలు & చికిత్స' : 'Get Results'}</span>
                          </div>
                          <p className="text-[11px] text-slate-300 font-normal leading-tight">
                            {language === 'te' ? 'వ్యాధి వివరాలు, సేంద్రీయ మరియు రసాయన చికిత్సను పొందండి.' : 'View disease details, treatment & prevention.'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Footer Badge */}
                  <div className="mt-3 pt-2.5 border-t border-emerald-500/20 text-xs text-emerald-300/90 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-[#2eed92] flex-shrink-0" />
                    <span>{language === 'te' ? '72 పంట వ్యాధి తరగతులకు సమగ్ర మద్దతు.' : '72 Foliar Pathogen Species Supported'}</span>
                  </div>
                </div>
              </div>

              {/* ==================================================================== */}
              {/* DIAGNOSTIC ERROR BANNER (IMMEDIATELY BELOW UPLOAD BOX!) */}
              {/* ==================================================================== */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.98 }}
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

                  <div className="flex flex-wrap justify-end gap-2 pt-1">
                    {errorPayload?.error_code === 'CROP_MISMATCH' && errorPayload?.predicted_crop && (
                      <button
                        type="button"
                        onClick={() => rePredictWithCrop(errorPayload.predicted_crop)}
                        className="px-3.5 py-1.5 rounded-lg bg-[#2eed92] hover:bg-[#3ff29f] text-slate-950 font-black text-xs shadow-[0_0_12px_rgba(46,237,146,0.4)] flex items-center gap-1.5"
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
                      className="px-3.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs border border-slate-700"
                    >
                      {language === 'te' ? 'మరో ఫోటో ప్రయత్నించండి' : 'Try Another Photo'}
                    </button>
                  </div>
                </motion.div>
              )}

              {/* ==================================================================== */}
              {/* SELECT CROP (OPTIONAL) & SAMPLES: ONLY SHOWN WHEN NO FILE & NO ERROR */}
              {/* ==================================================================== */}
              {!selectedFile && !error && (
                <>
                  {/* SELECT CROP (OPTIONAL) ROW */}
                  <div className="rounded-xl bg-[#061c15]/80 backdrop-blur-xl border border-emerald-500/30 py-2.5 px-3.5 sm:px-4 shadow-md space-y-2 flex-shrink-0">
                    <div className="flex items-center justify-between text-xs font-bold text-slate-300 px-0.5">
                      <span className="flex items-center gap-1.5 text-white">
                        <Leaf className="w-3.5 h-3.5 text-[#2eed92]" />
                        <span>{language === 'te' ? 'పంట రకాన్ని ఎంచుకోండి (ఐచ్ఛికం)' : 'Select Crop (Optional)'}</span>
                      </span>
                      <span className="text-[11px] text-emerald-400 font-semibold">
                        {selectedCrop === 'Auto-Detect'
                          ? (language === 'te' ? 'ఆటో-డిటెక్ట్ సక్రియంగా ఉంది' : 'Auto Detect Active')
                          : (language === 'te' ? `ఎంచుకున్న పంట: ${TELUGU_CROPS[selectedCrop] || selectedCrop}` : `Locked to: ${selectedCrop}`)}
                      </span>
                    </div>

                    {/* Horizontal Pill Strip */}
                    <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 custom-scrollbar-hide">
                      {PRIMARY_CROPS.map((c) => {
                        const isSelected = selectedCrop === c.id;
                        return (
                          <button
                            key={c.id}
                            type="button"
                            onClick={() => setSelectedCrop(c.id)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap border ${isSelected
                              ? 'bg-[#2eed92] text-slate-950 border-[#2eed92] shadow-[0_0_10px_rgba(46,237,146,0.4)] font-black'
                              : 'bg-[#07241a]/70 text-slate-300 border-emerald-500/25 hover:border-emerald-400/50 hover:text-white'
                              }`}
                          >
                            {c.isAuto ? (
                              <Crosshair className={`w-3.5 h-3.5 ${isSelected ? 'text-slate-950' : 'text-[#2eed92]'}`} />
                            ) : (
                              <span className="text-xs">{c.emoji}</span>
                            )}
                            <span>{language === 'te' ? c.labelTe : c.labelEn}</span>
                          </button>
                        );
                      })}

                      <button
                        type="button"
                        onClick={() => setShowAllCrops(!showAllCrops)}
                        className="px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 whitespace-nowrap border bg-[#07241a]/70 text-slate-300 border-emerald-500/25 hover:border-emerald-400/50 hover:text-white"
                      >
                        <span>{language === 'te' ? 'అన్నీ' : 'View All'}</span>
                        {showAllCrops ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                      </button>
                    </div>

                    {/* Extra crops expanded */}
                    <AnimatePresence>
                      {showAllCrops && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="pt-1.5 border-t border-emerald-500/20 flex flex-wrap items-center gap-1.5 overflow-hidden"
                        >
                          {EXTRA_CROPS.map((c) => {
                            const isSelected = selectedCrop === c.id;
                            return (
                              <button
                                key={c.id}
                                type="button"
                                onClick={() => setSelectedCrop(c.id)}
                                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all flex items-center gap-1 whitespace-nowrap border ${isSelected
                                  ? 'bg-[#2eed92] text-slate-950 border-[#2eed92] font-black'
                                  : 'bg-[#051a13] text-slate-300 border-emerald-500/20 hover:text-white'
                                  }`}
                              >
                                <span className="text-xs">{c.emoji}</span>
                                <span>{language === 'te' ? c.labelTe : c.labelEn}</span>
                              </button>
                            );
                          })}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* TRY WITH SAMPLE LEAF IMAGES ROW */}
                  <div id="tour-sample-leaves" className="rounded-xl bg-[#061c15]/80 backdrop-blur-xl border border-emerald-500/25 py-2 px-3 sm:px-4 shadow-md space-y-2 flex-shrink-0">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <ImageIcon className="w-3.5 h-3.5 text-[#2eed92]" />
                        <span className="text-xs font-black text-white">
                          {language === 'te' ? 'నమూనా ఆకులతో పరీక్షించండి' : 'Try with Sample Leaf Images'}
                        </span>
                        <span className="text-[11px] text-slate-400 font-normal hidden sm:inline">
                          ({language === 'te' ? 'పరీక్షించడానికి ఏదైనా నమూనాపై క్లిక్ చేయండి' : 'Click any sample to test'})
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() => setShowMoreSamples(!showMoreSamples)}
                        className="text-xs font-bold text-emerald-400 hover:text-[#2eed92] flex items-center gap-1 transition-colors"
                      >
                        <span>{showMoreSamples ? (language === 'te' ? 'తక్కువ చూపించు' : 'Show Less') : (language === 'te' ? 'మరిన్ని నమూనాలు →' : 'See More Samples →')}</span>
                      </button>
                    </div>

                    {/* 5 Primary Sample Cards */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 sm:gap-2.5">
                      {PRIMARY_SAMPLES.map((sample) => (
                        <button
                          key={sample.id}
                          type="button"
                          onClick={() => loadSample(sample)}
                          disabled={loading}
                          className="group relative rounded-xl overflow-hidden border border-emerald-500/25 hover:border-[#2eed92] bg-[#07241a]/60 hover:bg-[#07241a]/95 p-1.5 text-center transition-all duration-200 hover:shadow-[0_0_15px_rgba(46,237,146,0.3)] hover:-translate-y-0.5 flex flex-col justify-between"
                        >
                          <div className="w-full h-20 sm:h-22 md:h-24 rounded-lg overflow-hidden bg-black/60 relative">
                            {/* Floating Crop Badge */}
                            <div className="absolute top-1.5 left-1.5 px-2 py-0.5 rounded-md bg-black/75 backdrop-blur-md text-[10px] font-bold text-white border border-white/10 flex items-center gap-1 shadow-sm z-10">
                              <span>{sample.emoji}</span>
                              <span>{language === 'te' ? sample.cropTe : sample.crop}</span>
                            </div>

                            <img
                              src={sample.path}
                              alt={sample.name}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-80 group-hover:opacity-40 transition-opacity" />
                          </div>

                          <div className="py-1.5 px-1 text-center">
                            <div className="text-xs font-bold text-slate-200 group-hover:text-[#2eed92] transition-colors truncate">
                              {language === 'te' ? sample.nameTe : sample.name}
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>

                    {/* Extra samples expanded */}
                    <AnimatePresence>
                      {showMoreSamples && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="pt-2 border-t border-emerald-500/20 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 overflow-hidden"
                        >
                          {MORE_SAMPLES.map((sample) => (
                            <button
                              key={sample.id}
                              type="button"
                              onClick={() => loadSample(sample)}
                              disabled={loading}
                              className="group relative rounded-xl overflow-hidden border border-emerald-500/25 hover:border-[#2eed92] bg-[#07241a]/60 hover:bg-[#07241a]/95 p-1.5 text-center transition-all duration-200 hover:shadow-[0_0_15px_rgba(46,237,146,0.3)] hover:-translate-y-0.5 flex flex-col justify-between"
                            >
                              <div className="w-full h-20 sm:h-22 rounded-lg overflow-hidden bg-black/60 relative">
                                <div className="absolute top-1.5 left-1.5 px-2 py-0.5 rounded-md bg-black/75 backdrop-blur-md text-[10px] font-bold text-white border border-white/10 flex items-center gap-1 shadow-sm z-10">
                                  <span>{sample.emoji}</span>
                                  <span>{language === 'te' ? sample.cropTe : sample.crop}</span>
                                </div>
                                <img
                                  src={sample.path}
                                  alt={sample.name}
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-80 group-hover:opacity-40 transition-opacity" />
                              </div>
                              <div className="py-1.5 px-1 text-center">
                                <div className="text-xs font-bold text-slate-200 group-hover:text-[#2eed92] transition-colors truncate">
                                  {language === 'te' ? sample.nameTe : sample.name}
                                </div>
                              </div>
                            </button>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </>
              )}
            </>
          )}

          {/* ==================================================================== */}
          {/* STATE B: RESULT EXISTS -> DISPLAY PATHOLOGY DOSSIER IMMEDIATELY AT TOP */}
          {/* (NO SELECT CROP OR SAMPLES PUSHING IT DOWN!) */}
          {/* ==================================================================== */}
          {result && (
            <motion.div
              ref={resultsRef}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl bg-[#061c15]/90 backdrop-blur-2xl border border-emerald-500/40 p-3 sm:p-4 shadow-[0_8px_32px_rgba(0,0,0,0.6)] flex flex-col justify-between h-full min-h-0 overflow-hidden flex-1"
            >
              {/* Hero Pathology Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2.5 border-b border-emerald-500/20 flex-shrink-0">
                <div className="flex items-center gap-3">
                  <div className={`p-2 sm:p-2.5 rounded-xl border flex-shrink-0 shadow-md ${result.disease.includes("Healthy") || result.disease.includes("ఆరోగ్యం")
                    ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.3)]'
                    : result.severity === 'High' || result.severity === 'Critical' || result.severity === 'అధిక'
                      ? 'bg-rose-500/15 border-rose-500/40 text-rose-400 shadow-[0_0_12px_rgba(244,63,94,0.3)]'
                      : 'bg-amber-500/15 border-amber-500/40 text-amber-400 shadow-[0_0_12px_rgba(245,158,11,0.3)]'
                    }`}>
                    {result.disease.includes("Healthy") || result.disease.includes("ఆరోగ్యం") ? (
                      <CheckCircle2 className="w-6 h-6 sm:w-7 sm:h-7 text-emerald-400" />
                    ) : (
                      <ShieldAlert className="w-6 h-6 sm:w-7 sm:h-7 text-rose-400" />
                    )}
                  </div>

                  <div className="space-y-0.5">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="px-2 py-0.5 rounded bg-[#07241a] border border-emerald-500/30 text-[11px] font-bold text-slate-200">
                        {language === 'te' ? `ఆతిథ్య పంట: ${dossier.cropName}` : `Host: ${result.crop?.name || selectedCrop}`}
                      </span>
                      {dossier.category && (
                        <span className="px-2 py-0.5 rounded bg-[#2eed92]/15 border border-[#2eed92]/30 text-[11px] font-semibold text-emerald-300">
                          {dossier.category}
                        </span>
                      )}
                      {result.scientific_name && (
                        <span className="text-[11px] font-mono text-[#2eed92] italic font-medium hidden md:inline ml-1">
                          ({result.scientific_name})
                        </span>
                      )}
                    </div>

                    <h2 className="text-lg sm:text-xl md:text-2xl font-black text-white tracking-tight leading-tight">
                      {dossier.disease}
                    </h2>

                    {result.scientific_name && (
                      <p className="text-[11px] font-mono text-[#2eed92] italic font-medium md:hidden">
                        {result.scientific_name}
                      </p>
                    )}
                  </div>
                </div>

                {/* Confidence & Severity Badges */}
                <div className="flex items-center gap-2 flex-shrink-0 self-start sm:self-center">
                  <div className="px-3 py-1 rounded-lg bg-[#04140e] border border-emerald-500/40 flex items-center gap-2 shadow-[0_0_10px_rgba(16,185,129,0.15)]">
                    <div className="text-right">
                      <div className="text-[9px] text-slate-400 uppercase font-bold tracking-wider leading-none">
                        {language === 'te' ? 'AI నమ్మకం' : 'Neural Confidence'}
                      </div>
                      <div className="text-base sm:text-lg font-black text-[#2eed92] leading-tight">{result.confidence}%</div>
                    </div>
                  </div>

                  <span className={`px-2.5 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider border inline-flex items-center gap-1.5 ${result.severity === 'High' || result.severity === 'Critical' || result.severity === 'అధిక'
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

              {/* 1-Click Recalibrate Strip */}
              <div className="px-2.5 py-1 rounded-xl bg-[#04140e]/90 border border-emerald-500/20 flex items-center justify-between gap-2 overflow-x-auto print:hidden flex-shrink-0 my-1">
                <span className="text-[11px] font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1.5 whitespace-nowrap pl-1">
                  <RefreshCw className="w-3 h-3 text-amber-400" />
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
                        className={`px-2.5 py-0.5 rounded-md text-xs font-bold transition-all whitespace-nowrap border ${isActive
                          ? 'bg-[#2eed92]/25 text-[#2eed92] border-[#2eed92] font-black'
                          : 'bg-[#07241a]/60 text-slate-400 border-emerald-500/20 hover:text-white'
                          }`}
                      >
                        <span>{language === 'te' ? (TELUGU_CROPS[cropName] || cropName) : cropName}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* TAB NAVIGATION */}
              <div id="tour-dossier-tabs" className="flex items-center gap-1.5 border-b border-emerald-500/20 pb-1.5 overflow-x-auto custom-scrollbar-hide print:hidden flex-shrink-0">
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
                      className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${active
                        ? 'bg-gradient-to-r from-[#2eed92] to-[#10b981] text-slate-950 font-black shadow-[0_0_12px_rgba(46,237,146,0.35)]'
                        : 'bg-[#04140e]/60 text-slate-400 hover:text-white hover:bg-[#07241a] border border-emerald-500/20'
                        }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      <span>{tab.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* TAB CONTENT AREA (FLEX-1 WITH INTERNAL SMOOTH SCROLL IF NEEDED) */}
              <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar my-1 pr-0.5">
                {/* TAB 1: OVERVIEW & LESION MASKING */}
                {(activeTab === 'overview' || window.matchMedia('print').matches) && (
                  <div className="space-y-2">
                    {/* Dual Image Comparison */}
                    {result.original_image_b64 && result.processed_image_b64 && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        <div className="space-y-1">
                          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                            {language === 'te' ? 'అసలు ఆకు ఫోటో' : 'Raw Sensor Leaf Photo'}
                          </span>
                          <div className="w-full h-36 sm:h-44 md:h-48 lg:h-52 max-h-[35vh] rounded-xl overflow-hidden border border-emerald-500/30 bg-black/70 relative shadow-lg flex items-center justify-center">
                            <img
                              src={`data:image/png;base64,${result.original_image_b64}`}
                              alt="Original Leaf"
                              className="w-full h-full object-contain mx-auto"
                            />
                          </div>
                        </div>

                        <div className="space-y-1">
                          <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                            <Activity className="w-3 h-3" />
                            <span>{language === 'te' ? 'ఓపెన్‌సీవీ మచ్చల గుర్తింపు (Lesion Masking)' : 'OpenCV Lesion Masking'}</span>
                          </span>
                          <div className={`w-full h-36 sm:h-44 md:h-48 lg:h-52 max-h-[35vh] rounded-xl overflow-hidden border bg-black/70 relative shadow-lg flex items-center justify-center ${result.infected_area_count > 0 ? 'border-rose-500/50 shadow-[0_0_15px_rgba(244,63,94,0.2)]' : 'border-emerald-500/50 shadow-[0_0_15px_rgba(16,185,129,0.2)]'
                            }`}>
                            <img
                              src={`data:image/png;base64,${result.processed_image_b64}`}
                              alt="Lesion Segmentation Mask"
                              className="w-full h-full object-contain mx-auto"
                            />
                            {result.infected_area_count > 0 ? (
                              <div className="absolute top-2 right-2 bg-rose-600 text-white text-[10px] font-black px-2 py-0.5 rounded-full shadow border border-rose-400">
                                {language === 'te'
                                  ? `${result.infected_area_count} తెగులు మచ్చలు గుర్తించబడ్డాయి`
                                  : `${result.infected_area_count} Lesion Hotspots Highlighted`}
                              </div>
                            ) : (
                              <div className="absolute top-2 right-2 bg-[#2eed92] text-slate-950 text-[10px] font-black px-2 py-0.5 rounded-full shadow border border-emerald-400">
                                {language === 'te' ? 'ఆకు ఆరోగ్యంగా ఉంది' : 'Foliage Healthy'}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Weather Metrics */}
                    {result.environmental_factors && (
                      <div className="grid grid-cols-3 gap-2.5 pt-0.5">
                        <div className="py-1.5 px-3 rounded-lg bg-[#04140e]/90 border border-emerald-500/25 space-y-0.5 text-center shadow-sm">
                          <div className="text-[10px] text-slate-400 font-bold uppercase flex items-center justify-center gap-1">
                            <Thermometer className="w-3 h-3 text-rose-400" />
                            <span>{language === 'te' ? 'అనుకూల ఉష్ణోగ్రత' : 'Outbreak Temp'}</span>
                          </div>
                          <div className="text-xs sm:text-sm font-black text-white">
                            {result.environmental_factors.temperature || '18°C - 28°C'}
                          </div>
                        </div>

                        <div className="py-1.5 px-3 rounded-lg bg-[#04140e]/90 border border-emerald-500/25 space-y-0.5 text-center shadow-sm">
                          <div className="text-[10px] text-slate-400 font-bold uppercase flex items-center justify-center gap-1">
                            <Droplets className="w-3 h-3 text-cyan-400" />
                            <span>{language === 'te' ? 'గాలిలో తేమ' : 'Humidity'}</span>
                          </div>
                          <div className="text-xs sm:text-sm font-black text-white">
                            {result.environmental_factors.humidity || '80% - 95%'}
                          </div>
                        </div>

                        <div className="py-1.5 px-3 rounded-lg bg-[#04140e]/90 border border-emerald-500/25 space-y-0.5 text-center shadow-sm">
                          <div className="text-[10px] text-slate-400 font-bold uppercase flex items-center justify-center gap-1">
                            <Activity className="w-3 h-3 text-emerald-400" />
                            <span>{language === 'te' ? 'ఆకు తేమ సమయం' : 'Leaf Wetness'}</span>
                          </div>
                          <div className="text-xs sm:text-sm font-black text-white">
                            {result.environmental_factors.leaf_wetness || '> 6 hours'}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* TAB 2: AGRONOMY PRESCRIPTION */}
                {activeTab === 'treatment' && (
                  <div className="space-y-2.5">
                    <div className="p-3 sm:p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 space-y-1 shadow-sm">
                      <h4 className="font-bold text-[#2eed92] text-xs sm:text-sm flex items-center gap-2">
                        <Sprout className="w-4 h-4 text-[#2eed92]" />
                        <span>{language === 'te' ? 'సేంద్రీయ & జీవ నియంత్రణ చికిత్స' : 'Organic & Biological Remedy'}</span>
                      </h4>
                      <p className="text-slate-200 text-xs leading-relaxed font-medium">
                        {dossier.organicTreatment}
                      </p>
                    </div>

                    <div className="p-3 sm:p-3.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 space-y-1 shadow-sm">
                      <h4 className="font-bold text-cyan-300 text-xs sm:text-sm flex items-center gap-2">
                        <FlaskConical className="w-4 h-4 text-cyan-400" />
                        <span>{language === 'te' ? 'సిఫార్సు చేసిన రసాయన పిచికారీ' : 'Registered Chemical Treatment'}</span>
                      </h4>
                      <p className="text-slate-200 text-xs leading-relaxed font-medium">
                        {dossier.chemicalTreatment}
                      </p>
                    </div>

                    <div className="p-3 rounded-xl bg-[#04140e]/90 border border-emerald-500/25 space-y-1 shadow-sm">
                      <h4 className="font-bold text-amber-300 text-xs flex items-center gap-2">
                        <ShieldAlert className="w-4 h-4 text-amber-400" />
                        <span>{language === 'te' ? 'పొలంలో యాజమాన్య పద్ధతులు & పరిశుభ్రత' : 'Cultural Field Sanitation'}</span>
                      </h4>
                      <p className="text-slate-300 text-xs leading-relaxed">
                        {dossier.precautions}
                      </p>
                    </div>

                    {dossier.source && (
                      <div className="p-2.5 rounded-lg bg-[#04140e] border border-emerald-500/20 text-xs text-slate-400 flex items-center justify-between">
                        <span className="flex items-center gap-1.5 font-medium">
                          <BookOpen className="w-3.5 h-3.5 text-[#2eed92]" />
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

                {/* TAB 3: SYMPTOMS & CAUSE */}
                {activeTab === 'cause' && (
                  <div className="space-y-2.5">
                    {dossier.visibleSymptoms && dossier.visibleSymptoms.length > 0 && (
                      <div className="p-3 rounded-xl bg-[#04140e]/90 border border-emerald-500/25 space-y-2">
                        <h4 className="font-bold text-amber-300 uppercase tracking-wider text-xs flex items-center gap-2">
                          <Bug className="w-3.5 h-3.5 text-amber-400" />
                          <span>{language === 'te' ? 'గమనించిన వ్యాధి లక్షణాలు' : 'Clinical Symptoms Observed'}</span>
                        </h4>
                        <div className="grid sm:grid-cols-2 gap-2">
                          {dossier.visibleSymptoms.map((sym, idx) => (
                            <div key={idx} className="flex items-start gap-2 p-2 rounded-lg bg-[#07241a]/60 border border-emerald-500/20 text-xs text-slate-200 font-medium">
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1 flex-shrink-0" />
                              <span>{sym}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="p-3 rounded-xl bg-[#04140e]/90 border border-emerald-500/25 space-y-1">
                      <h4 className="font-bold text-cyan-300 text-xs flex items-center gap-2">
                        <Dna className="w-3.5 h-3.5 text-cyan-400" />
                        <span>{language === 'te' ? 'వ్యాధికి ఖచ్చితమైన శాస్త్రీయ కారణం' : 'Exact Pathological Cause'}</span>
                      </h4>
                      <p className="text-slate-200 text-xs leading-relaxed">
                        {dossier.exactCause}
                      </p>
                    </div>
                  </div>
                )}

                {/* TAB 4: 14-DAY CALENDAR */}
                {activeTab === 'timeline' && (
                  <div className="space-y-2">
                    <h4 className="font-bold text-slate-200 text-xs uppercase tracking-wider flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5 text-[#2eed92]" />
                      <span>{language === 'te' ? '14 రోజుల వ్యవసాయ రికవరీ ప్రణాళిక' : '14-Day Agronomic Recovery Roadmap'}</span>
                    </h4>

                    {dossier.plan14Day ? (
                      <div className="space-y-2">
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
                          <div key={idx} className="p-2.5 rounded-lg bg-[#04140e]/90 border border-emerald-500/25 space-y-0.5">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase inline-block ${step.color === 'emerald' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' :
                              step.color === 'cyan' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' :
                                step.color === 'amber' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' :
                                  'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                              }`}>
                              {step.day}: {step.title}
                            </span>
                            <p className="text-slate-200 text-xs leading-relaxed">
                              {step.text}
                            </p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-3 rounded-lg bg-[#04140e]/90 border border-emerald-500/25 text-xs text-slate-300">
                        {language === 'te'
                          ? 'వ్యాధి సోకిన మొక్కలను వేరుచేసి సిఫార్సు చేసిన మందులను పిచికారీ చేయండి.'
                          : (result.action_timeline?.immediate || "Isolate infected plants and spray broad-spectrum protectant.")}
                      </div>
                    )}
                  </div>
                )}

                {/* TAB 5: AI PROBABILITIES */}
                {activeTab === 'probabilities' && (
                  <div className="space-y-2">
                    <h4 className="font-bold text-slate-200 text-xs uppercase tracking-wider flex items-center gap-2">
                      <Layers className="w-3.5 h-3.5 text-cyan-400" />
                      <span>{language === 'te' ? 'AI అంచనాల పోలిక శ్రేణి' : 'Competing Neural Hypotheses'}</span>
                    </h4>

                    {result.top_predictions && result.top_predictions.length > 0 ? (
                      <div className="space-y-2">
                        {result.top_predictions.map((pred, idx) => (
                          <div key={idx} className="p-2.5 rounded-lg bg-[#04140e]/90 border border-emerald-500/25 space-y-1">
                            <div className="flex items-center justify-between text-xs font-bold">
                              <span className="text-white">
                                {language === 'te' ? getTeluguDiseaseTitle(pred.disease) : pred.disease}
                              </span>
                              <span className="text-[#2eed92] font-black">{pred.confidence}%</span>
                            </div>
                            <div className="w-full h-1.5 rounded-full bg-slate-900 overflow-hidden">
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${pred.confidence}%` }}
                                transition={{ duration: 0.5, delay: idx * 0.1 }}
                                className="h-full rounded-full bg-gradient-to-r from-[#2eed92] to-[#10b981]"
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-3 rounded-lg bg-[#04140e]/90 border border-emerald-500/25 text-xs text-slate-300">
                        {language === 'te' ? 'ప్రాథమిక అంచనా:' : 'Primary Prediction:'} <strong className="text-[#2eed92]">{result.confidence}%</strong>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Bottom Dossier Action Bar */}
              <div className="pt-2 border-t border-emerald-500/20 flex flex-wrap items-center justify-between gap-2 flex-shrink-0">
                <button
                  type="button"
                  onClick={resetScanner}
                  className="px-4 py-1.5 rounded-full bg-gradient-to-r from-[#2eed92] via-[#34d399] to-[#10b981] text-slate-950 font-black text-xs shadow-[0_0_12px_rgba(46,237,146,0.3)] flex items-center gap-1.5 active:scale-95 transition-all"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>{language === 'te' ? 'మరో ఆకును స్కాన్ చేయండి' : 'Scan Another Leaf'}</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={speakDiagnosisText}
                    className="px-3 py-1.5 rounded-lg bg-[#04140e] border border-emerald-500/30 text-slate-200 hover:text-white text-xs font-bold flex items-center gap-1.5"
                  >
                    <Volume2 className="w-3.5 h-3.5 text-[#2eed92]" />
                    <span>{isSpeaking ? (language === 'te' ? 'ఆపండి' : 'Stop Audio') : (language === 'te' ? 'వాయిస్ వినండి' : 'Audio Narration')}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handlePrint}
                    className="px-3 py-1.5 rounded-lg bg-[#04140e] border border-emerald-500/30 text-slate-200 hover:text-white text-xs font-bold flex items-center gap-1.5"
                  >
                    <Printer className="w-3.5 h-3.5 text-slate-400" />
                    <span>{language === 'te' ? 'నివేదిక ముద్రించండి' : 'Print Dossier'}</span>
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      )}
    </div>
  );
};

export default DiseaseDetection;