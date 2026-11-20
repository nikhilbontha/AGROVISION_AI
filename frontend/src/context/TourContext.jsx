import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const TourContext = createContext();

export const TOUR_STEPS = [
  // ── STEP 1: HOME — DISEASE DETECTION CARD ────────────────────────────────
  {
    id: 'home_disease',
    stepNumber: 1,
    page: '/',
    target: '#tour-home-disease',
    fallbackTarget: null,
    category: 'Core Capability 1',
    categoryTe: 'ప్రధాన సామర్థ్యం 1',
    title: 'Crop Disease Detection',
    titleTe: 'పంట తెగుళ్ల గుర్తింపు',
    iconType: 'leaf',
    desc: 'Identify crop diseases using AI with a crop/leaf image or by answering a few guided questions. Get diagnosis, causes, treatment, and a 14-day action plan.',
    descTe: 'ఆకుల ఫోటోతో లేదా కొన్ని ప్రశ్నలకు సమాధానమివ్వడం ద్వారా పంట తెగుళ్లను గుర్తించండి. తక్షణ రోగనిర్ధారణ, కారణాలు, చికిత్స మరియు 14 రోజుల ప్రణాళికను పొందండి.',
    chips: ['📷 Vision Scan', '📋 Questionnaire', '📊 Detailed Insights'],
    chipsTe: ['📷 విజన్ స్కాన్', '📋 ప్రశ్నావళి', '📊 సమగ్ర విశ్లేషణ'],
    clickText: 'Click here to open Disease Detection',
    clickTextTe: 'వ్యాధి నిర్ధారణ తెరవడానికి ఇక్కడ క్లిక్ చేయండి',
    actionText: 'Next: Yield Prediction →',
    actionTextTe: 'తరువాత: దిగుబడి అంచనా →'
  },

  // ── STEP 2: HOME — YIELD PREDICTION CARD ──────────────────────────────────
  {
    id: 'home_yield',
    stepNumber: 2,
    page: '/',
    target: '#tour-home-yield',
    fallbackTarget: null,
    category: 'Core Capability 2',
    categoryTe: 'ప్రధాన సామర్థ్యం 2',
    title: 'AI Yield Prediction',
    titleTe: 'AI పంట దిగుబడి అంచనా',
    iconType: 'chart',
    desc: 'Estimate expected crop harvest using 5 dimensions of agricultural data: farm location, crop phenology, soil nutrients (NPK), rainfall/weather, and farm economics.',
    descTe: 'భూమి వివరాలు, పంట రకం, నేల పోషకాలు (NPK), వర్షపాతం మరియు ఆర్థిక ఖర్చుల ఆధారంగా ఆశించిన దిగుబడి మరియు నికర లాభాలను అంచనా వేయండి.',
    chips: ['🌾 5-Step Pipeline', '📈 Mandi Sync', '💰 Profit & ROI'],
    chipsTe: ['🌾 5-దశల నమూనా', '📈 మార్కెట్ ధరలు', '💰 లాభం & ROI'],
    clickText: 'Click here to explore Disease Detection',
    clickTextTe: 'వ్యాధి నిర్ధారణలోకి వెళ్లడానికి క్లిక్ చేయండి',
    actionText: 'Enter Disease Detection →',
    actionTextTe: 'వ్యాధి నిర్ధారణలోకి వెళ్లండి →'
  },

  // ── STEP 3: DISEASE DETECTION — DUAL MODES ────────────────────────────────
  {
    id: 'disease_modes',
    stepNumber: 3,
    page: '/disease-detection',
    diseaseMode: 'quick',
    target: '#tour-disease-modes',
    fallbackTarget: '#tour-vision-scan-btn',
    category: 'Disease Detection',
    categoryTe: 'వ్యాధి నిర్ధారణ',
    title: 'Two Diagnostic Pathways',
    titleTe: 'రెండు రోగనిర్ధారణ పద్ధతులు',
    iconType: 'modes',
    desc: 'Choose how you want AgroVision AI to analyze your crop: Vision Scan for instant neural image analysis, or Questionnaire for clinical symptom assessment.',
    descTe: 'మీ పంటను ఎలా విశ్లేషించాలో ఎంచుకోండి: ఫోటోల ద్వారా తక్షణ విజన్ స్కాన్ లేదా లక్షణాల ఆధారంగా గైడెడ్ ప్రశ్నావళి.',
    chips: ['👁️ Vision Scan', '📋 Questionnaire', '🌱 Multi-Crop (17 Crops)'],
    chipsTe: ['👁️ విజన్ స్కాన్', '📋 ప్రశ్నావళి', '🌱 17 పంటల మద్దతు'],
    clickText: 'Select Vision Scan or Questionnaire',
    clickTextTe: 'విజన్ స్కాన్ లేదా ప్రశ్నావళిని ఎంచుకోండి',
    actionText: 'Next: Image Upload & Camera →',
    actionTextTe: 'తరువాత: ఫోటో అప్‌లోడ్ & కెమెరా →'
  },

  // ── STEP 4: DISEASE DETECTION — IMAGE UPLOAD & CAMERA ─────────────────────
  {
    id: 'vision_upload',
    stepNumber: 4,
    page: '/disease-detection',
    diseaseMode: 'quick',
    target: '#tour-upload-dropzone',
    fallbackTarget: null,
    category: 'Vision Scan',
    categoryTe: 'విజన్ స్కాన్',
    title: 'Image Upload & Live Camera Options',
    titleTe: 'ఫోటో అప్‌లోడ్ & లైవ్ కెమెరా',
    iconType: 'camera',
    desc: 'Upload a clear leaf photo with "Browse Files" or capture live with "Take Photo". Ensure good daylight, sharp focus, and visible disease symptoms.',
    descTe: 'గ్యాలరీ నుండి ఫోటోను ఎంచుకోవడానికి "Browse Files" లేదా కెమెరాతో నేరుగా ఫోటో తీయడానికి "Take Photo" ఉపయోగించండి. మంచి వెలుతురులో స్పష్టమైన ఫోటో తీయండి.',
    chips: ['📁 Browse Image', '📸 Live Camera', '✓ Clear Daylight Focus'],
    chipsTe: ['📁 ఫైల్ ఎంచుకోండి', '📸 ప్రత్యక్ష కెమెరా', '✓ స్పష్టమైన వెలుతురు'],
    clickText: 'Click Browse Files or Take Photo',
    clickTextTe: 'ఫైళ్లను ఎంచుకోండి లేదా ఫోటో తీయండి',
    actionText: 'Next: 1-Click Field Samples →',
    actionTextTe: 'తరువాత: నమూనా ఆకులతో పరీక్షించండి →'
  },

  // ── STEP 5: DISEASE DETECTION — 1-CLICK SAMPLE LEAVES ─────────────────────
  {
    id: 'vision_samples',
    stepNumber: 5,
    page: '/disease-detection',
    diseaseMode: 'quick',
    target: '#tour-sample-leaves',
    fallbackTarget: '#tour-upload-dropzone',
    category: 'Instant Testing',
    categoryTe: 'తక్షణ పరీక్ష',
    title: 'Test with Real Field Leaf Samples',
    titleTe: 'నమూనా ఆకులతో పరీక్షించండి',
    iconType: 'samples',
    desc: 'Don’t have a leaf image right now? Click any of the pre-loaded field sample cards to test the computer vision pathology model with 1 click!',
    descTe: 'ప్రస్తుతం మీ వద్ద ఫోటో లేదా? టమాటా, గోధుమ, వరి లేదా పత్తి నమూనా ఆకులపై క్లిక్ చేసి తక్షణ AI రోగనిర్ధారణను పరీక్షించండి!',
    chips: ['🍅 Tomato Late Blight', '🌾 Wheat Rust', '🌱 Rice Blast', '🌸 Cotton Blight'],
    chipsTe: ['🍅 టమాటా తెగులు', '🌾 గోధుమ కుంకుమ', '🌱 వరి అగ్గి తెగులు', '🌸 పత్తి'],
    clickText: 'Click any sample to test AI instantly',
    clickTextTe: 'పరీక్షించడానికి ఏదైనా నమూనాపై క్లిక్ చేయండి',
    actionText: 'Next: 5-Part Analysis Dossier →',
    actionTextTe: 'తరువాత: 5 విశ్లేషణ విభాగాలను చూడండి →'
  },

  // ── STEP 6: DISEASE DETECTION — 5-PART CLINICAL DOSSIER ───────────────────
  {
    id: 'vision_dossier',
    stepNumber: 6,
    page: '/disease-detection',
    diseaseMode: 'quick',
    loadSample: true,
    target: '#tour-dossier-tabs',
    fallbackTarget: '#tour-sample-leaves',
    category: 'Clinical Analysis',
    categoryTe: 'సమగ్ర నివేదిక',
    title: '5-Tab Comprehensive Pathology Dossier',
    titleTe: '5 విభాగాల వ్యాధి నివేదిక',
    iconType: 'dossier',
    desc: 'Every scan produces: 1. Overview & OpenCV lesion masking, 2. Agronomy Prescription (dosage & spray), 3. Symptoms & Cause, 4. 14-Day Calendar, 5. Neural Probabilities.',
    descTe: 'ప్రతి స్కాన్‌కు 5 విభాగాలు లభిస్తాయి: 1. పరిశీలన & మచ్చల మ్యాపింగ్, 2. వ్యవసాయ చికిత్స & మోతాదు, 3. లక్షణాలు & కారణాలు, 4. 14 రోజుల ప్రణాళిక, 5. ఖచ్చితత్వ శాతాలు.',
    chips: ['1. Masking', '2. Agronomy Rx', '3. Cause', '4. 14-Day Plan', '5. Confidence'],
    chipsTe: ['1. మ్యాపింగ్', '2. మందుల మోతాదు', '3. కారణాలు', '4. 14 రోజుల ప్లాన్', '5. ఖచ్చితత్వం'],
    clickText: 'Switch tabs to review full diagnosis',
    clickTextTe: 'విభాగాన్ని మార్చడానికి ట్యాబ్ పై క్లిక్ చేయండి',
    actionText: 'Next: Explore Questionnaire →',
    actionTextTe: 'తరువాత: ప్రశ్నావళి మోడ్ ను చూద్దాం →'
  },

  // ── STEP 7: DISEASE DETECTION — ADAPTIVE QUESTIONNAIRE ────────────────────
  {
    id: 'questionnaire_mode',
    stepNumber: 7,
    page: '/disease-detection',
    diseaseMode: 'guided',
    target: '#tour-questionnaire-stepper',
    fallbackTarget: '#tour-questionnaire-root',
    category: 'Clinical Protocol',
    categoryTe: 'లక్షణాల ప్రశ్నావళి',
    title: 'Adaptive Farmer Questionnaire',
    titleTe: 'అడాప్టివ్ రైతు ప్రశ్నావళి',
    iconType: 'questionnaire',
    desc: 'No leaf photo? Follow 6 guided steps: 1. Optional Photo, 2. Crop Selection, 3. Plant Part, 4. 9 Visual Symptoms, 5. Field Context, 6. Uncertainty-Aware Diagnosis.',
    descTe: 'ఫోటో లేనప్పుడు 6 దశల ప్రశ్నావళి ఉపయోగపడుతుంది: పంట, మొక్క భాగం, 9 ప్రధాన లక్షణాలు మరియు వాతావరణాన్ని ఎంచుకుని ఖచ్చితమైన నిర్ధారణ పొందండి.',
    chips: ['🌾 17 Regional Crops', '🪴 8 Plant Parts', '🟡 9 Visual Symptoms', '🌦️ Climate Context'],
    chipsTe: ['🌾 17 రకాల పంటలు', '🪴 8 మొక్క భాగాలు', '🟡 9 రకాల లక్షణాలు', '🌦️ వాతావరణం'],
    clickText: 'Follow the 6 diagnostic steps',
    clickTextTe: '6 రోగనిర్ధారణ దశలను అనుసరించండి',
    actionText: 'Open Yield Prediction Page →',
    actionTextTe: 'దిగుబడి అంచనా పేజీకి వెళ్లండి →'
  },

  // ── STEP 8: YIELD PREDICTION — 5-STEP PIPELINE ───────────────────────────
  {
    id: 'yield_steps',
    stepNumber: 8,
    page: '/yield-prediction',
    yieldStep: 1,
    target: '#tour-yield-stepper',
    fallbackTarget: '#tour-yield-header',
    category: 'Yield Prediction',
    categoryTe: 'దిగుబడి అంచనా',
    title: '5-Step Predictive Yield Engine',
    titleTe: '5-దశల దిగుబడి అంచనా ఇంజిన్',
    iconType: 'pipeline',
    desc: 'Estimates crop harvest: Step 1 (Farm Profile & Soil NPK), Step 2 (Crop Variety & Sowing), Step 3 (Crop Management), Step 4 (Weather), Step 5 (Economics & Mandi Prices).',
    descTe: '5 దశలలో పంట దిగుబడి అంచనా: దశ 1 (భూమి & నేల పోషకాలు), దశ 2 (పంట రకం & విత్తిన తేదీ), దశ 3 (ఎరువుల యాజమాన్యం), దశ 4 (వర్షపాతం), దశ 5 (ఖర్చులు & మార్కెట్ ధర).',
    chips: ['1. Farm Profile', '2. Crop Variety', '3. Inputs', '4. Weather', '5. Economics'],
    chipsTe: ['1. పొలం వివరాలు', '2. పంట రకం', '3. ఎరువులు', '4. వాతావరణం', '5. ఖర్చులు'],
    clickText: 'Navigate through the 5 prediction steps',
    clickTextTe: '5 దశల గుండా ముందుకు సాగండి',
    actionText: 'Next: Yield & Profitability Output →',
    actionTextTe: 'తరువాత: దిగుబడి ఫలితాల నివేదిక →'
  },

  // ── STEP 9: YIELD PREDICTION — CALCULATION & OUTPUT ───────────────────────
  {
    id: 'yield_result',
    stepNumber: 9,
    page: '/yield-prediction',
    yieldStep: 5,
    target: '#tour-yield-predict-btn',
    fallbackTarget: '#tour-yield-stepper',
    category: 'Decision Engine',
    categoryTe: 'లాభాల విశ్లేషణ',
    title: 'Harvest Yield & Profitability Forecast',
    titleTe: 'అంచనా దిగుబడి & లాభాల విశ్లేషణ',
    iconType: 'calculate',
    desc: 'Calculating generates projected harvest (Quintals/Acre & metric tonnes), confidence range, gross mandi revenue, net profit, break-even price, and agronomic risk advisory.',
    descTe: 'ఫలితాలలో ఎకరానికి దిగుబడి (క్వింటాళ్లలో), మొత్తం మెట్రిక్ టన్నులు, స్థూల మార్కెట్ ఆదాయం, నికర లాభం మరియు వ్యవసాయ నిపుణుల సలహాలు లభిస్తాయి.',
    chips: ['⚖️ Quintals/Acre', '💰 Net Farm Profit', '📈 APMC Mandi Price', '🛡️ Risk Advisory'],
    chipsTe: ['⚖️ క్వింటాళ్లు/ఎకరా', '💰 నికర లాభం', '📈 మార్కెట్ ధర', '🛡️ రిస్క్ సలహాలు'],
    clickText: 'Click to calculate yield and decision engine',
    clickTextTe: 'దిగుబడిని లెక్కించడానికి ఇక్కడ క్లిక్ చేయండి',
    actionText: 'Open Farm Management Dashboard →',
    actionTextTe: 'మేనేజ్‌మెంట్ డ్యాష్‌బోర్డ్‌ను తెరవండి →'
  },

  // ── STEP 10: DASHBOARD — COMMAND CENTER OVERVIEW ─────────────────────────
  {
    id: 'dash_overview',
    stepNumber: 10,
    page: '/dashboard',
    dashboardTab: 'Dashboard',
    target: '#tour-dashboard-overview',
    fallbackTarget: '#tour-tab-dashboard',
    category: 'Command Center',
    categoryTe: 'డ్యాష్‌బోర్డ్',
    title: 'Farm Command Center & KPI Metrics',
    titleTe: 'వ్యవసాయ కమాండ్ సెంటర్ & కొలమానాలు',
    iconType: 'dashboard',
    desc: 'Your central farm command center: real-time profit & loss financials, scan records, AI yield prediction activity, and overall field vegetation health index.',
    descTe: 'డ్యాష్‌బోర్డ్ మీ మొత్తం పొలం స్థితిని ఒకే చోట చూపుతుంది: నికర లాభాలు, స్కాన్ రికార్డులు, దిగుబడి అంచనాలు మరియు క్షేత్ర ఆరోగ్యం.',
    chips: ['💰 Profit & Loss', '📋 Scan Records', '📈 Yield Predictions', '🌱 Health Index (86/100)'],
    chipsTe: ['💰 లాభనష్టాలు', '📋 స్కాన్ చరిత్ర', '📈 దిగుబడి అంచనాలు', '🌱 క్షేత్ర ఆరోగ్యం'],
    clickText: 'Explore your central farm command metrics',
    clickTextTe: 'కేంద్ర వ్యవసాయ గణాంకాలను పరిశీలించండి',
    actionText: 'Next: 9 Farm Management Suites →',
    actionTextTe: 'తరువాత: 9 వ్యవసాయ నిర్వహణ సాధనాలు →'
  },

  // ── STEP 11: DASHBOARD — 9 MANAGEMENT SUITES ──────────────────────────────
  {
    id: 'dash_modules',
    stepNumber: 11,
    page: '/dashboard',
    dashboardTab: 'Crop Management',
    target: '#tour-dashboard-nav',
    fallbackTarget: '#tour-tab-crop',
    category: 'Management Suites',
    categoryTe: 'నిర్వహణ సాధనాలు',
    title: '9 Integrated Farm Management Modules',
    titleTe: '9 సమగ్ర వ్యవసాయ నిర్వహణ విభాగాలు',
    iconType: 'modules',
    desc: 'Complete farm operations in one place: Crop Management, Field Monitoring, Soil Health (NPK), Weather & Forecasts, Smart Irrigation, Equipment, Reports, Alerts, and Settings.',
    descTe: 'పూర్తి వ్యవసాయ నిర్వహణ: పంటలు, పొలం పర్యవేక్షణ, నేల ఆరోగ్యం (NPK), వాతావరణం, స్మార్ట్ నీటి పారుదల, పరికరాలు, నివేదికలు, హెచ్చరికలు మరియు సెట్టింగ్‌లు.',
    chips: ['🌾 Crop', '🛰️ Field', '🌱 Soil', '🌦️ Weather', '💧 Irrigation', '🚜 Equipment', '📊 Reports', '🔔 Alerts', '⚙️ Settings'],
    chipsTe: ['🌾 పంట', '🛰️ పొలం', '🌱 నేల', '🌦️ వాతావరణం', '💧 నీరు', '🚜 పరికరాలు', '📊 నివేదికలు', '🔔 హెచ్చరికలు', '⚙️ సెట్టింగ్‌లు'],
    clickText: 'Click any module in the sidebar to open',
    clickTextTe: 'తెరవడానికి సైడ్‌బార్‌లోని ఏదైనా విభాగాన్ని క్లిక్ చేయండి',
    actionText: 'Complete Tour & View System Map 🚀',
    actionTextTe: 'టూర్ పూర్తి చేసి సిస్టమ్ మ్యాప్ చూడండి 🚀'
  }
];

export const TourProvider = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const [isTourActive, setIsTourActive] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);
  const [showCompletionModal, setShowCompletionModal] = useState(false);

  // Resume support: load saved tour state from localStorage if available
  useEffect(() => {
    const tourCompleted = localStorage.getItem('agrovision_tour_completed') === 'true';
    const justLoggedIn = localStorage.getItem('agrovision_just_logged_in') === 'true';

    // Trigger welcome modal on Home page if user just logged in or is first time
    if (location.pathname === '/' && (!tourCompleted || justLoggedIn)) {
      setShowWelcomeModal(true);
      if (justLoggedIn) {
        localStorage.removeItem('agrovision_just_logged_in');
      }
    }
  }, [location.pathname]);

  // Apply page navigation and sub-view / tab switches for any step
  const applyStepState = useCallback((stepObj) => {
    if (!stepObj) return;

    // 1. Navigate to target page if different
    if (location.pathname !== stepObj.page) {
      navigate(stepObj.page);
    }

    // 2. Dispatch events for sub-views after small delay so page is mounted
    setTimeout(() => {
      if (stepObj.diseaseMode) {
        window.dispatchEvent(new CustomEvent('agrovision-switch-disease-mode', {
          detail: {
            mode: stepObj.diseaseMode,
            loadSample: Boolean(stepObj.loadSample)
          }
        }));
      }
      if (stepObj.yieldStep) {
        window.dispatchEvent(new CustomEvent('agrovision-switch-yield-step', { detail: { step: stepObj.yieldStep } }));
      }
      if (stepObj.dashboardTab) {
        window.dispatchEvent(new CustomEvent('agrovision-switch-tab', { detail: { tab: stepObj.dashboardTab } }));
      }
    }, 150);
  }, [location.pathname, navigate]);

  const startTour = () => {
    setShowWelcomeModal(false);
    setShowCompletionModal(false);
    setCurrentStepIndex(0);
    setIsTourActive(true);
    applyStepState(TOUR_STEPS[0]);
  };

  const nextStep = () => {
    if (currentStepIndex < TOUR_STEPS.length - 1) {
      const nextIndex = currentStepIndex + 1;
      const nextStepObj = TOUR_STEPS[nextIndex];
      setCurrentStepIndex(nextIndex);
      applyStepState(nextStepObj);
    } else {
      // Completed all steps!
      setIsTourActive(false);
      setShowCompletionModal(true);
      localStorage.setItem('agrovision_tour_completed', 'true');
    }
  };

  const prevStep = () => {
    if (currentStepIndex > 0) {
      const prevIndex = currentStepIndex - 1;
      const prevStepObj = TOUR_STEPS[prevIndex];
      setCurrentStepIndex(prevIndex);
      applyStepState(prevStepObj);
    }
  };

  const skipTour = () => {
    setIsTourActive(false);
    setShowWelcomeModal(false);
    setShowCompletionModal(false);
    localStorage.setItem('agrovision_tour_completed', 'true');
  };

  const currentStep = TOUR_STEPS[currentStepIndex] || TOUR_STEPS[0];

  return (
    <TourContext.Provider
      value={{
        isTourActive,
        currentStepIndex,
        currentStep,
        totalSteps: TOUR_STEPS.length,
        showWelcomeModal,
        showCompletionModal,
        setShowWelcomeModal,
        setShowCompletionModal,
        startTour,
        nextStep,
        prevStep,
        skipTour,
        applyStepState
      }}
    >
      {children}
    </TourContext.Provider>
  );
};

export const useTour = () => useContext(TourContext);
