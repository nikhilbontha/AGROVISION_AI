import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Upload, Camera, AlertCircle, CheckCircle2, ArrowRight, ArrowLeft,
  HelpCircle, Leaf, RotateCcw, FileText, Sparkles, ShieldCheck,
  Search, Check, Calendar, MapPin, Activity, Clock, Droplets,
  Sprout, Bug, Shield, AlertTriangle, Layers, Info, CheckCircle,
  ShieldAlert, ChevronRight, ChevronDown, ChevronUp, X, ExternalLink,
  Image as ImageIcon, Compass, Eye, SlidersHorizontal, CheckSquare,
  Zap, Globe, BrainCircuit, Printer
} from 'lucide-react';
import api from '../api';
import { useLanguage } from '../context/LanguageContext';

const MAX_IMAGE_SIZE_BYTES = 15 * 1024 * 1024; // 15MB

// AUTHORITATIVE CROP VISUAL & TAXONOMIC METADATA
const CROP_METADATA = {
  crop_apple: {
    icon: '🍎',
    category: 'fruits',
    categoryLabel: 'Fruit Orchard',
    bgGradient: 'from-rose-500/20 to-red-600/10',
    borderColor: 'border-rose-500/40',
    badgeColor: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
    accentColor: '#f43f5e'
  },
  crop_banana: {
    icon: '🍌',
    category: 'fruits',
    categoryLabel: 'Commercial Fruit',
    bgGradient: 'from-amber-500/20 to-yellow-600/10',
    borderColor: 'border-amber-500/40',
    badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
    accentColor: '#f59e0b'
  },
  crop_chilli: {
    icon: '🌶️',
    category: 'spices',
    categoryLabel: 'Commercial Spice',
    bgGradient: 'from-red-600/20 to-rose-700/10',
    borderColor: 'border-red-500/40',
    badgeColor: 'bg-red-500/20 text-red-300 border-red-500/40',
    accentColor: '#ef4444'
  },
  crop_corn: {
    icon: '🌽',
    category: 'cereals',
    categoryLabel: 'Cereal Grain',
    bgGradient: 'from-amber-400/20 to-yellow-500/10',
    borderColor: 'border-amber-400/40',
    badgeColor: 'bg-amber-400/20 text-amber-300 border-amber-400/40',
    accentColor: '#fbbf24'
  },
  crop_cotton: {
    icon: '☁️',
    category: 'commercial',
    categoryLabel: 'Cash Fiber',
    bgGradient: 'from-cyan-500/20 to-sky-600/10',
    borderColor: 'border-cyan-500/40',
    badgeColor: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40',
    accentColor: '#06b6d4'
  },
  crop_grape: {
    icon: '🍇',
    category: 'fruits',
    categoryLabel: 'Vineyard Fruit',
    bgGradient: 'from-purple-500/20 to-violet-600/10',
    borderColor: 'border-purple-500/40',
    badgeColor: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
    accentColor: '#a855f7'
  },
  crop_mango: {
    icon: '🥭',
    category: 'fruits',
    categoryLabel: 'Orchard King',
    bgGradient: 'from-amber-500/20 to-orange-600/10',
    borderColor: 'border-amber-500/40',
    badgeColor: 'bg-orange-500/20 text-orange-300 border-orange-500/40',
    accentColor: '#f97316'
  },
  crop_oil_palm: {
    icon: '🌴',
    category: 'commercial',
    categoryLabel: 'Oil Plantation',
    bgGradient: 'from-emerald-500/20 to-teal-600/10',
    borderColor: 'border-emerald-500/40',
    badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
    accentColor: '#10b981'
  },
  crop_orange: {
    icon: '🍊',
    category: 'fruits',
    categoryLabel: 'Citrus Orchard',
    bgGradient: 'from-orange-500/20 to-amber-600/10',
    borderColor: 'border-orange-500/40',
    badgeColor: 'bg-orange-500/20 text-orange-300 border-orange-500/40',
    accentColor: '#ea580c'
  },
  crop_pepper_bell: {
    icon: '🫑',
    category: 'vegetables',
    categoryLabel: 'Horticulture',
    bgGradient: 'from-emerald-600/20 to-green-700/10',
    borderColor: 'border-emerald-500/40',
    badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
    accentColor: '#059669'
  },
  crop_potato: {
    icon: '🥔',
    category: 'vegetables',
    categoryLabel: 'Tuber Vegetable',
    bgGradient: 'from-amber-700/20 to-yellow-800/10',
    borderColor: 'border-amber-600/40',
    badgeColor: 'bg-amber-600/20 text-amber-300 border-amber-600/40',
    accentColor: '#d97706'
  },
  crop_rice: {
    icon: '🌾',
    category: 'cereals',
    categoryLabel: 'Staple Cereal',
    bgGradient: 'from-yellow-500/20 to-amber-600/10',
    borderColor: 'border-yellow-500/40',
    badgeColor: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/40',
    accentColor: '#eab308'
  },
  crop_tomato: {
    icon: '🍅',
    category: 'vegetables',
    categoryLabel: 'Vegetable Crop',
    bgGradient: 'from-red-500/20 to-rose-600/10',
    borderColor: 'border-red-500/40',
    badgeColor: 'bg-red-500/20 text-red-300 border-red-500/40',
    accentColor: '#f43f5e'
  },
  crop_turmeric: {
    icon: '🫚',
    category: 'spices',
    categoryLabel: 'Rhizome Spice',
    bgGradient: 'from-yellow-400/20 to-amber-500/10',
    borderColor: 'border-yellow-400/40',
    badgeColor: 'bg-yellow-400/20 text-yellow-300 border-yellow-400/40',
    accentColor: '#facc15'
  },
  crop_wheat: {
    icon: '🌾',
    category: 'cereals',
    categoryLabel: 'Rabi Cereal',
    bgGradient: 'from-amber-300/20 to-yellow-500/10',
    borderColor: 'border-amber-400/40',
    badgeColor: 'bg-amber-400/20 text-amber-300 border-amber-400/40',
    accentColor: '#fbbf24'
  },
  crop_non_plant: {
    icon: '🧱',
    category: 'other',
    categoryLabel: 'Non-Plant / OOD',
    bgGradient: 'from-slate-700/20 to-slate-800/10',
    borderColor: 'border-slate-600/40',
    badgeColor: 'bg-slate-700/40 text-slate-300 border-slate-600/40',
    accentColor: '#64748b'
  },
  crop_unsure: {
    icon: '❓',
    category: 'other',
    categoryLabel: 'Uncertain Crop',
    bgGradient: 'from-teal-500/20 to-cyan-600/10',
    borderColor: 'border-teal-500/40',
    badgeColor: 'bg-teal-500/20 text-teal-300 border-teal-500/40',
    accentColor: '#14b8a6'
  },
  crop_unsupported: {
    icon: '🌿',
    category: 'other',
    categoryLabel: 'Unlisted Species',
    bgGradient: 'from-slate-600/20 to-slate-700/10',
    borderColor: 'border-slate-500/40',
    badgeColor: 'bg-slate-600/30 text-slate-300 border-slate-500/40',
    accentColor: '#94a3b8'
  }
};

const getCropMeta = (crop) => {
  if (!crop) return {
    icon: '🌱',
    category: 'other',
    categoryLabel: 'Plant Species',
    bgGradient: 'from-emerald-500/20 to-teal-600/10',
    borderColor: 'border-emerald-500/40',
    badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
    accentColor: '#10b981'
  };

  if (CROP_METADATA[crop.crop_id]) return CROP_METADATA[crop.crop_id];

  const name = (crop.canonical_name || '').toLowerCase();
  if (name.includes('apple')) return CROP_METADATA.crop_apple;
  if (name.includes('banana')) return CROP_METADATA.crop_banana;
  if (name.includes('chilli') || name.includes('pepper') || name.includes('mirchi')) return CROP_METADATA.crop_chilli;
  if (name.includes('corn') || name.includes('maize')) return CROP_METADATA.crop_corn;
  if (name.includes('cotton')) return CROP_METADATA.crop_cotton;
  if (name.includes('grape')) return CROP_METADATA.crop_grape;
  if (name.includes('mango')) return CROP_METADATA.crop_mango;
  if (name.includes('palm')) return CROP_METADATA.crop_oil_palm;
  if (name.includes('orange') || name.includes('citrus')) return CROP_METADATA.crop_orange;
  if (name.includes('potato')) return CROP_METADATA.crop_potato;
  if (name.includes('rice') || name.includes('paddy')) return CROP_METADATA.crop_rice;
  if (name.includes('tomato')) return CROP_METADATA.crop_tomato;
  if (name.includes('turmeric')) return CROP_METADATA.crop_turmeric;
  if (name.includes('wheat')) return CROP_METADATA.crop_wheat;

  return {
    icon: '🌱',
    category: 'other',
    categoryLabel: 'Crop Species',
    bgGradient: 'from-emerald-500/20 to-teal-600/10',
    borderColor: 'border-emerald-500/40',
    badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
    accentColor: '#10b981'
  };
};

const CROP_CATEGORIES = [
  { id: 'all', label: 'All Crops', icon: '🌐' },
  { id: 'cereals', label: 'Cereals & Grains', icon: '🌾' },
  { id: 'vegetables', label: 'Vegetables', icon: '🍅' },
  { id: 'fruits', label: 'Fruits & Orchards', icon: '🍎' },
  { id: 'spices', label: 'Spices & Commercial', icon: '🌶️' },
  { id: 'other', label: 'Other / Unsure', icon: '❓' }
];

const ORGAN_OPTIONS = [
  { id: 'leaves', label: 'Leaves (Foliage)', icon: '🍃', desc: 'Leaf blade, margins, or veins' },
  { id: 'stems', label: 'Stem / Branches', icon: '🪵', desc: 'Main stem, twigs, or collar region' },
  { id: 'fruits', label: 'Fruit / Berry', icon: '🍎', desc: 'Developing or mature fruit' },
  { id: 'flowers', label: 'Flowers / Blossoms', icon: '🌸', desc: 'Floral buds, petals, or inflorescence' },
  { id: 'ears_cobs', label: 'Ears / Cobs / Tassels', icon: '🌽', desc: 'Grain head, ear, or cob (Maize/Wheat)' },
  { id: 'pods', label: 'Pods / Legumes', icon: '🫘', desc: 'Seed pods or hulls' },
  { id: 'rhizomes_tubers', label: 'Tubers / Rhizomes', icon: '🥔', desc: 'Underground tubers (Potato/Turmeric)' },
  { id: 'bolls', label: 'Bolls', icon: '☁️', desc: 'Cotton bolls or squares' },
  { id: 'roots', label: 'Roots', icon: '🪴', desc: 'Root system or taproot' },
  { id: 'whole_plant', label: 'Whole Plant (Systemic)', icon: '🌳', desc: 'General collapse, wilting, or stunting' },
  { id: 'unsure', label: 'Not Sure / Other Organ', icon: '❓', desc: 'Uncertain of specific plant part' }
];

const SYMPTOM_OPTIONS = [
  { id: 'sym_yellowing', label: 'Yellowing / Chlorosis', icon: '🟡', desc: 'Pale yellow leaves/veins' },
  { id: 'sym_spots', label: 'Brown/Black Spots', icon: '🟤', desc: 'Dark circular/angular spots' },
  { id: 'sym_white_powder', label: 'White Powder', icon: '❄️', desc: 'Fungal powder on leaf' },
  { id: 'sym_water_soaked', label: 'Water-soaked Lesions', icon: '💧', desc: 'Translucent greasy spots' },
  { id: 'sym_wilting', label: 'Wilting / Drooping', icon: '🥀', desc: 'Loss of firmness despite moisture' },
  { id: 'sym_insect_damage', label: 'Holes / Chewed Parts', icon: '🐛', desc: 'Punctures, webbing, frass' },
  { id: 'sym_rot', label: 'Rot / Soft Tissue', icon: '🧫', desc: 'Spongy foul-smelling decay' },
  { id: 'sym_mosaic', label: 'Mosaic / Curling', icon: '🌀', desc: 'Patchy mottle, leaf curl' },
  { id: 'sym_stunted', label: 'Stunted Growth', icon: '📉', desc: 'Severe dwarfism' },
  { id: 'sym_other', label: 'Other Symptoms', icon: '🔍', desc: 'Unlisted signs' },
  { id: 'sym_unsure', label: 'Not Sure', icon: '❓', desc: 'Difficult to tell' }
];

const AP_TG_DISTRICTS = [
  'Guntur', 'Warangal', 'Krishna', 'Khammam', 'Prakasam',
  'Karimnagar', 'Nizamabad', 'Nalgonda', 'Kurnool', 'Chittoor',
  'Rangareddy', 'East Godavari', 'West Godavari', 'Anantapur'
];

class QuestionnaireErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, errorInfo) {
    console.error("Diagnostic dossier render error:", error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="p-8 rounded-3xl bg-slate-900/90 border border-rose-500/40 text-center max-w-2xl mx-auto my-8 space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-rose-500/20 text-rose-400 flex items-center justify-center mx-auto text-2xl font-black">⚠️</div>
          <h3 className="text-xl font-bold text-white">Diagnostic Interface Recovery</h3>
          <p className="text-sm text-slate-300">
            {this.state.error?.message || "An unexpected error occurred rendering the diagnostic assessment."}
          </p>
          <button
            onClick={() => { this.setState({ hasError: false, error: null }); window.location.reload(); }}
            className="px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-sm transition-all shadow-lg"
          >
            Reload Interface
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

function AdaptiveQuestionnaireInner({ onResetToQuickScan }) {
  const { language } = useLanguage();

  // Wizard Step: 1 (Upload), 2 (Crop), 3 (Organ), 4 (Symptoms), 5 (Context), 6 (Review), 7 (Report)
  const [currentStep, setCurrentStep] = useState(1);

  // Form State
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [fileError, setFileError] = useState(null);

  const [availableCrops, setAvailableCrops] = useState([]);
  const [cropSearch, setCropSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedCrop, setSelectedCrop] = useState(null);
  const [cropWarning, setCropWarning] = useState(null);

  const [selectedOrgans, setSelectedOrgans] = useState(['leaves']);
  const [compatibleOrgans, setCompatibleOrgans] = useState([]);

  // Symptoms & Progression
  const [selectedSymptoms, setSelectedSymptoms] = useState([]);
  const [symptomLocation, setSymptomLocation] = useState('loc_multiple_plants');
  const [symptomDuration, setSymptomDuration] = useState('dur_4_to_7_days');
  const [spreadRate, setSpreadRate] = useState('spread_rapid');
  const [growthStage, setGrowthStage] = useState('stage_vegetative');
  const [selectedConditions, setSelectedConditions] = useState(['cond_high_humidity']);
  const [visiblePests, setVisiblePests] = useState('pest_no');
  const [previousTreatment, setPreviousTreatment] = useState('treatment_no');
  const [treatmentDetails, setTreatmentDetails] = useState('');

  // Optional Context
  const [locationState, setLocationState] = useState('');
  const [locationDistrict, setLocationDistrict] = useState('');
  const [sowingDate, setSowingDate] = useState('');
  const [varietyName, setVarietyName] = useState('');
  const [irrigationMethod, setIrrigationMethod] = useState('');
  const [additionalNotes, setAdditionalNotes] = useState('');

  // Submission & Diagnostic Result
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [receipt, setReceipt] = useState(null);
  const [diagnosisResult, setDiagnosisResult] = useState(null);
  const [followUpAnswers, setFollowUpAnswers] = useState({});
  const [showTechnicalDetails, setShowTechnicalDetails] = useState(false);
  const [showAlternatives, setShowAlternatives] = useState(false);
  const [diagnosisTimestamp, setDiagnosisTimestamp] = useState(null);
  const [activeImageView, setActiveImageView] = useState('boxes');

  const fileInputRef = useRef(null);

  // 1. Fetch available crops on mount
  useEffect(() => {
    const fetchCrops = async () => {
      try {
        const res = await api.get('/questionnaire/crops');
        if (res.data && res.data.crops) {
          setAvailableCrops(res.data.crops);
        }
      } catch (err) {
        console.error("Failed to load canonical crops:", err);
      }
    };
    fetchCrops();
  }, []);

  // 2. Filter organs when crop changes
  useEffect(() => {
    if (!selectedCrop) {
      setCompatibleOrgans(ORGAN_OPTIONS);
      return;
    }

    if (selectedCrop.crop_id === 'crop_unsure' || selectedCrop.crop_id === 'crop_unsupported') {
      setCompatibleOrgans(ORGAN_OPTIONS);
      setCropWarning(selectedCrop.crop_id === 'crop_unsupported'
        ? "Automated diagnosis is currently not calibrated for unlisted crops. Evidence will be structured for expert agronomic review."
        : null
      );
      return;
    }

    setCropWarning(null);
    const supportedList = selectedCrop.supported_organs || [];
    const filtered = ORGAN_OPTIONS.filter(o =>
      supportedList.includes(o.id) || o.id === 'unsure' || o.id === 'whole_plant'
    );
    setCompatibleOrgans(filtered.length > 0 ? filtered : ORGAN_OPTIONS);

    setSelectedOrgans(prev => {
      const valid = prev.filter(o => filtered.some(f => f.id === o));
      return valid.length > 0 ? valid : [filtered[0]?.id || 'leaves'];
    });
  }, [selectedCrop]);

  const toggleOrgan = (orgId) => {
    if (orgId === 'unsure') {
      setSelectedOrgans(['unsure']);
      return;
    }
    if (orgId === 'whole_plant') {
      setSelectedOrgans(['whole_plant']);
      return;
    }

    const current = selectedOrgans.filter(o => o !== 'unsure' && o !== 'whole_plant');
    if (current.includes(orgId)) {
      if (current.length > 1) {
        setSelectedOrgans(current.filter(o => o !== orgId));
      }
    } else {
      setSelectedOrgans([...current, orgId]);
    }
  };

  // Handle File Selection
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type || !file.type.startsWith('image/')) {
      setFileError("Please upload a valid image file (JPG, PNG, WEBP).");
      return;
    }
    if (file.size > MAX_IMAGE_SIZE_BYTES) {
      setFileError("File exceeds the maximum limit of 15MB. Please choose a smaller photo.");
      return;
    }

    setFileError(null);
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleClearImage = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setFileError(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const toggleSymptom = (symId) => {
    if (symId === 'sym_unsure') {
      setSelectedSymptoms(['sym_unsure']);
      return;
    }
    const filtered = selectedSymptoms.filter(s => s !== 'sym_unsure');
    if (filtered.includes(symId)) {
      setSelectedSymptoms(filtered.filter(s => s !== symId));
    } else {
      setSelectedSymptoms([...filtered, symId]);
    }
  };

  const toggleCondition = (condId) => {
    if (selectedConditions.includes(condId)) {
      setSelectedConditions(selectedConditions.filter(c => c !== condId));
    } else {
      setSelectedConditions([...selectedConditions, condId]);
    }
  };

  // Submit Evidence Payload & Execute Full Diagnostic Workflow
  const handleSubmitEvidence = async () => {
    setSubmitting(true);
    setSubmitError(null);

    const primaryOrgan = selectedOrgans.includes('whole_plant')
      ? 'whole_plant'
      : (selectedOrgans[0] || 'leaves');

    const payload = {
      questionnaire_version: "2.0.0",
      selected_crop_id: selectedCrop ? selectedCrop.crop_id : "crop_unsure",
      crop_selection_source: selectedCrop ? (selectedCrop.crop_id === 'crop_unsure' ? 'unsure' : 'farmer_manual') : 'unsure',
      affected_organ: primaryOrgan,
      affected_organs: selectedOrgans,
      symptom_ids: selectedSymptoms.length > 0 ? selectedSymptoms : ['sym_unsure'],
      symptom_location: symptomLocation,
      symptom_duration: symptomDuration,
      spread_rate: spreadRate,
      growth_stage: growthStage,
      weather_and_field_conditions: selectedConditions,
      visible_pests: visiblePests,
      previous_treatment: previousTreatment,
      treatment_details: previousTreatment === 'treatment_yes' ? treatmentDetails : null,
      optional_location: (locationState || locationDistrict) ? { state: locationState || null, district: locationDistrict || null } : null,
      sowing_date: sowingDate || null,
      variety_name: varietyName || null,
      irrigation_method: irrigationMethod || null,
      additional_notes: additionalNotes || null,
      image_reference: selectedFile ? {
        filename: selectedFile.name,
        content_type: selectedFile.type,
        size_bytes: selectedFile.size
      } : null
    };

    try {
      const formData = new FormData();
      formData.append('payload_json', JSON.stringify(payload));
      if (selectedFile) {
        formData.append('file', selectedFile);
      }
      formData.append('state', locationState || 'Telangana');
      if (locationDistrict) {
        formData.append('district', locationDistrict);
      }

      const response = await api.post('/diagnosis/v1/full-diagnosis-upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (response.data && response.data.decision_status) {
        setDiagnosisResult(response.data);
        setDiagnosisTimestamp(new Date().toLocaleDateString('en-IN', {
          day: 'numeric',
          month: 'short',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        }));
        setShowTechnicalDetails(false);
        setShowAlternatives(false);
        setCurrentStep(7); // View Full Diagnosis Report
      } else {
        setSubmitError("Server responded without a valid diagnosis decision.");
      }
    } catch (err) {
      console.error("Diagnosis workflow error:", err);
      const detail = err.response?.data?.detail || "Failed to execute diagnostic workflow. Please check your network and retry.";
      setSubmitError(typeof detail === 'string' ? detail : JSON.stringify(detail));
    } finally {
      setSubmitting(false);
    }
  };

  const handleResetForm = () => {
    setCurrentStep(1);
    handleClearImage();
    setSelectedCrop(null);
    setSelectedOrgans(['leaves']);
    setSelectedSymptoms([]);
    setTreatmentDetails('');
    setAdditionalNotes('');
    setReceipt(null);
    setDiagnosisResult(null);
    setFollowUpAnswers({});
    setSubmitError(null);
    setShowTechnicalDetails(false);
    setShowAlternatives(false);
    setDiagnosisTimestamp(null);
  };

  // Filter crops by search query and category tab
  const filteredCrops = availableCrops.filter(c => {
    const meta = getCropMeta(c);
    if (selectedCategory !== 'all' && meta.category !== selectedCategory) {
      return false;
    }

    const q = cropSearch.toLowerCase().trim();
    if (!q) return true;

    const nameMatch = c.canonical_name.toLowerCase().includes(q);
    const aliasMatch = (c.aliases || []).some(a => a.toLowerCase().includes(q));
    const sciMatch = (c.scientific_name || '').toLowerCase().includes(q);
    return nameMatch || aliasMatch || sciMatch;
  });

  const STEPS_CONFIG = [
    { num: 1, label: "1. Photo", icon: Camera },
    { num: 2, label: "2. Crop", icon: Sprout },
    { num: 3, label: "3. Plant Part", icon: Leaf },
    { num: 4, label: "4. Symptoms", icon: Activity },
    { num: 5, label: "5. Context", icon: FileText },
    { num: 6, label: "6. Review", icon: ShieldCheck }
  ];

  return (
    <div className="w-full space-y-6 text-slate-100">
      
      {/* ========================================================= */}
      {/* PROGRESS & HEADER COMMAND PANEL                           */}
      {/* ========================================================= */}
      <div className="relative overflow-hidden bg-slate-900/80 backdrop-blur-xl rounded-3xl p-6 border border-emerald-500/30 shadow-[0_8px_32px_rgba(0,0,0,0.4)] space-y-5">
        <div className="absolute top-0 right-0 w-96 h-32 bg-gradient-to-l from-emerald-500/10 via-cyan-500/5 to-transparent pointer-events-none blur-2xl" />
        
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
              <span>AgroVision AI 2.0 • Multimodal Decision Protocol</span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-black text-white flex items-center gap-3">
              <span className="p-2 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 shadow-inner">
                <Sprout className="w-6 h-6" />
              </span>
              <span>Adaptive Farmer Symptom Questionnaire</span>
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              Bridge laboratory vision AI with farmer field evidence. Follow the 6-step guided protocol to generate verified, uncertainty-aware crop diagnoses.
            </p>
          </div>

          <div className="flex items-center gap-2.5 self-end lg:self-center shrink-0">
            {onResetToQuickScan && (
              <button
                onClick={onResetToQuickScan}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-800/90 hover:bg-slate-700/90 text-slate-200 transition-all border border-slate-700 flex items-center gap-2 shadow-sm hover:border-cyan-500/40"
              >
                <Layers className="w-3.5 h-3.5 text-cyan-400" />
                <span>Switch to Quick Scan</span>
              </button>
            )}
            <button
              onClick={handleResetForm}
              className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-800/60 hover:bg-slate-700 text-slate-400 hover:text-white transition-all border border-slate-700/80 flex items-center gap-1.5"
              title="Reset questionnaire"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          </div>
        </div>

        {/* Progress Bar & Modern Stepper */}
        {currentStep < 7 && (
          <div className="space-y-3 pt-3 border-t border-slate-800/80">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-300 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                Step {currentStep} of 6: <strong className="text-emerald-400 font-extrabold">{STEPS_CONFIG[currentStep - 1]?.label.replace(/^\d+\.\s*/, '')}</strong>
              </span>
              <span className="text-[11px] font-semibold text-slate-400">
                {Math.round(((currentStep - 1) / 5) * 100)}% Complete
              </span>
            </div>

            {/* Stepper Grid */}
            <div className="grid grid-cols-6 gap-2">
              {STEPS_CONFIG.map(s => {
                const StepIcon = s.icon;
                const isCurrent = currentStep === s.num;
                const isCompleted = s.num < currentStep;

                return (
                  <button
                    key={s.num}
                    onClick={() => s.num < currentStep && setCurrentStep(s.num)}
                    disabled={s.num > currentStep}
                    className={`relative py-2.5 px-1.5 rounded-xl text-[11px] font-bold transition-all flex flex-col sm:flex-row items-center justify-center gap-1.5 border overflow-hidden ${
                      isCurrent
                        ? 'bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 border-emerald-300 shadow-[0_0_20px_rgba(16,185,129,0.35)] scale-[1.02]'
                        : isCompleted
                        ? 'bg-emerald-950/40 text-emerald-400 border-emerald-800/60 hover:bg-emerald-900/40 cursor-pointer'
                        : 'bg-slate-800/40 text-slate-500 border-slate-800/80 cursor-not-allowed'
                    }`}
                  >
                    <StepIcon className={`w-3.5 h-3.5 shrink-0 ${isCurrent ? 'text-slate-950' : isCompleted ? 'text-emerald-400' : 'text-slate-500'}`} />
                    <span className="truncate">{s.label}</span>
                    {isCompleted && (
                      <Check className="w-3 h-3 text-emerald-400 hidden sm:inline-block shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* ========================================================= */}
      {/* STEP 1: Upload Photo                                      */}
      {/* ========================================================= */}
      {currentStep === 1 && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          <div className="bg-slate-900/80 backdrop-blur-xl rounded-3xl p-6 sm:p-8 border border-slate-800 space-y-6 shadow-xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h4 className="text-xl font-extrabold text-white flex items-center gap-2.5">
                  <span className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
                    <Camera className="w-5 h-5" />
                  </span>
                  <span>Step 1: Upload a Photo of the Affected Plant</span>
                </h4>
                <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
                  Upload a clear, focused photograph of the crop showing abnormal symptoms. Photos of leaves, stems, fruits, pods, cobs, or roots are welcomed.
                </p>
              </div>

              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-slate-800 text-slate-300 border border-slate-700 hidden sm:inline-block">
                Max Size: 15MB
              </span>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />

            {!previewUrl ? (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="relative border-2 border-dashed border-emerald-500/40 hover:border-emerald-400 rounded-3xl p-10 sm:p-14 text-center cursor-pointer transition-all bg-gradient-to-b from-emerald-950/20 via-slate-900/60 to-slate-900/90 hover:from-emerald-950/30 group flex flex-col items-center justify-center gap-4 overflow-hidden"
              >
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.08)_0,transparent_70%)] pointer-events-none" />

                <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 group-hover:scale-110 group-hover:bg-emerald-500/30 transition-all shadow-[0_0_24px_rgba(16,185,129,0.2)]">
                  <Upload className="w-8 h-8" />
                </div>

                <div className="space-y-1.5 text-center">
                  <p className="text-base font-bold text-white group-hover:text-emerald-300 transition-colors">
                    Click to select or drag and drop plant photo
                  </p>
                  <p className="text-xs text-slate-400">
                    Supported formats: <strong className="text-slate-300">JPG, JPEG, PNG, WEBP</strong>
                  </p>
                </div>

                {/* Photography Guidelines Pill Group */}
                <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
                  <span className="px-3 py-1 rounded-full text-[11px] font-medium bg-slate-800/80 text-slate-300 border border-slate-700/80 flex items-center gap-1.5">
                    <CheckCircle className="w-3 h-3 text-emerald-400" /> Close-up on Lesion
                  </span>
                  <span className="px-3 py-1 rounded-full text-[11px] font-medium bg-slate-800/80 text-slate-300 border border-slate-700/80 flex items-center gap-1.5">
                    <CheckCircle className="w-3 h-3 text-emerald-400" /> Natural Sunlight
                  </span>
                  <span className="px-3 py-1 rounded-full text-[11px] font-medium bg-slate-800/80 text-slate-300 border border-slate-700/80 flex items-center gap-1.5">
                    <CheckCircle className="w-3 h-3 text-emerald-400" /> Sharp Focus
                  </span>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="relative rounded-3xl overflow-hidden border border-emerald-500/40 bg-slate-950/80 max-h-[420px] flex items-center justify-center shadow-2xl">
                  <img
                    src={previewUrl}
                    alt="Uploaded preview"
                    className="max-h-[420px] w-auto object-contain rounded-2xl"
                  />
                  <div className="absolute top-4 right-4 flex items-center gap-2">
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="px-3.5 py-1.5 rounded-xl bg-black/80 hover:bg-black text-white text-xs font-bold backdrop-blur-md border border-white/20 transition-all shadow-lg hover:border-emerald-400"
                    >
                      Replace Photo
                    </button>
                    <button
                      onClick={handleClearImage}
                      className="px-3.5 py-1.5 rounded-xl bg-rose-950/80 hover:bg-rose-900 text-rose-200 text-xs font-bold backdrop-blur-md border border-rose-700/60 transition-all shadow-lg"
                    >
                      Remove
                    </button>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-300 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                    <span>
                      Photo ready for multimodal feature extraction: <strong>{selectedFile?.name}</strong> ({(selectedFile?.size / 1024).toFixed(1)} KB)
                    </span>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                    Validated
                  </span>
                </div>
              </div>
            )}

            {fileError && (
              <div className="p-4 rounded-2xl bg-red-950/40 border border-red-500/40 text-xs text-red-300 flex items-center gap-2.5">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
                <span>{fileError}</span>
              </div>
            )}

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setCurrentStep(2)}
                className="px-6 py-3 rounded-2xl font-bold text-sm bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 flex items-center gap-2.5 transition-all shadow-lg shadow-emerald-500/25 hover:scale-[1.01]"
              >
                <span>Continue to Step 2: Confirm Crop</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* ========================================================= */}
      {/* STEP 2: Select or Confirm the Crop Species (KEY REDESIGN) */}
      {/* ========================================================= */}
      {currentStep === 2 && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          <div className="bg-slate-900/80 backdrop-blur-xl rounded-3xl p-6 sm:p-8 border border-slate-800 space-y-6 shadow-xl">
            
            {/* Step Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-5">
              <div>
                <h4 className="text-xl sm:text-2xl font-black text-white flex items-center gap-3">
                  <span className="p-2.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
                    <Sprout className="w-6 h-6" />
                  </span>
                  <span>Step 2: Select or Confirm the Crop Species</span>
                </h4>
                <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-3xl leading-relaxed">
                  Select the crop from our validated agricultural catalog. Your selection establishes botanical bounds, locks out cross-crop background hallucinations, and dynamically tailors subsequent organ and disease checks.
                </p>
              </div>

              {selectedCrop && (
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-2xl bg-emerald-500/15 border border-emerald-500/40 text-xs font-bold text-emerald-300 self-start sm:self-center shrink-0">
                  <span className="text-base">{getCropMeta(selectedCrop).icon}</span>
                  <span>Selected: <strong>{selectedCrop.canonical_name}</strong></span>
                </div>
              )}
            </div>

            {/* Category Filter Pills */}
            <div className="space-y-2">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Filter by Agricultural Category:
              </span>
              <div className="flex flex-wrap gap-2">
                {CROP_CATEGORIES.map(cat => {
                  const isActive = selectedCategory === cat.id;
                  return (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedCategory(cat.id)}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 border ${
                        isActive
                          ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-md shadow-emerald-500/20 font-black'
                          : 'bg-slate-800/80 hover:bg-slate-700 text-slate-300 border-slate-700'
                      }`}
                    >
                      <span>{cat.icon}</span>
                      <span>{cat.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Search Input with Clear Action */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-4 top-3.5" />
              <input
                type="text"
                placeholder="Search crop by English name, Telugu name, or alias (e.g. Tomato, Mirchi, Paddy, Corn, Mirapa)..."
                value={cropSearch}
                onChange={e => setCropSearch(e.target.value)}
                className="w-full bg-slate-800/90 border border-slate-700 rounded-2xl pl-11 pr-10 py-3 text-xs sm:text-sm text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all"
              />
              {cropSearch && (
                <button
                  onClick={() => setCropSearch('')}
                  className="absolute right-3.5 top-3 p-1 rounded-full text-slate-400 hover:text-white hover:bg-slate-700"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Quick Suggestion Pills */}
            <div className="flex flex-wrap items-center gap-1.5 text-xs">
              <span className="text-[11px] text-slate-400 font-semibold mr-1">Frequent:</span>
              {['Chilli', 'Tomato', 'Rice', 'Cotton', 'Corn', 'Mango', 'Potato', 'Turmeric'].map(name => (
                <button
                  key={name}
                  onClick={() => setCropSearch(name)}
                  className="px-2.5 py-1 rounded-lg bg-slate-800/60 hover:bg-slate-700/80 text-[11px] text-slate-300 border border-slate-700/60 transition-colors"
                >
                  {name}
                </button>
              ))}
            </div>

            {/* Interactive Crop Grid with Icons Beside Every Crop Name */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 max-h-[460px] overflow-y-auto pr-1.5 custom-scrollbar">
              {filteredCrops.length === 0 ? (
                <div className="col-span-full py-12 text-center rounded-2xl bg-slate-800/30 border border-slate-800 text-slate-400">
                  <p className="font-semibold text-white">No matching crops found for "{cropSearch}"</p>
                  <p className="text-xs text-slate-400 mt-1">Try another search term or select "Other Crop (Not in Catalog)".</p>
                </div>
              ) : (
                filteredCrops.map(crop => {
                  const isSelected = selectedCrop?.crop_id === crop.crop_id;
                  const meta = getCropMeta(crop);

                  return (
                    <motion.div
                      key={crop.crop_id}
                      whileHover={{ scale: 1.015 }}
                      whileTap={{ scale: 0.985 }}
                      onClick={() => setSelectedCrop(crop)}
                      className={`relative p-4 rounded-2xl border cursor-pointer transition-all flex items-start gap-3.5 group overflow-hidden ${
                        isSelected
                          ? 'bg-gradient-to-br from-emerald-950/70 via-slate-900/90 to-slate-900 border-emerald-400 ring-2 ring-emerald-400/50 shadow-[0_0_24px_rgba(16,185,129,0.25)]'
                          : 'bg-slate-800/40 hover:bg-slate-800/80 border-slate-700/70 hover:border-slate-600 text-slate-300'
                      }`}
                    >
                      {/* Left Side: Prominent Crop Icon Container */}
                      <div
                        className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shrink-0 transition-transform group-hover:scale-110 shadow-inner border ${
                          isSelected
                            ? 'bg-emerald-500/25 border-emerald-400 ring-2 ring-emerald-400/30'
                            : `bg-gradient-to-br ${meta.bgGradient} ${meta.borderColor}`
                        }`}
                      >
                        <span role="img" aria-label={crop.canonical_name}>
                          {meta.icon}
                        </span>
                      </div>

                      {/* Right Side: Crop Details */}
                      <div className="flex-1 min-w-0 space-y-1">
                        <div className="flex items-center justify-between gap-1">
                          <span className="font-extrabold text-sm sm:text-base text-white truncate group-hover:text-emerald-300 transition-colors">
                            {crop.canonical_name}
                          </span>
                          {isSelected && (
                            <span className="w-5 h-5 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center shrink-0 shadow-md">
                              <Check className="w-3.5 h-3.5 stroke-[3]" />
                            </span>
                          )}
                        </div>

                        {/* Category & Status Badges */}
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold border uppercase tracking-wider ${meta.badgeColor}`}>
                            {meta.categoryLabel}
                          </span>
                          {crop.supported_organs?.length > 0 && (
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-slate-800/90 text-slate-300 border border-slate-700">
                              {crop.supported_organs.length} organs
                            </span>
                          )}
                        </div>

                        {/* Aliases (Telugu, Hindi, common names) */}
                        {crop.aliases && crop.aliases.length > 0 && (
                          <p className="text-[11px] text-slate-400 truncate">
                            <span className="text-slate-500">Aliases:</span> {crop.aliases.join(', ')}
                          </p>
                        )}

                        {/* Scientific Botanical Name */}
                        {crop.scientific_name && (
                          <p className="text-[10px] italic text-slate-500 truncate">
                            {crop.scientific_name}
                          </p>
                        )}
                      </div>
                    </motion.div>
                  );
                })
              )}
            </div>

            {/* Selected Crop Overview Banner */}
            {selectedCrop && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="p-4 rounded-2xl bg-gradient-to-r from-emerald-950/40 via-slate-900/60 to-teal-950/40 border border-emerald-500/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-200"
              >
                <div className="flex items-center gap-3">
                  <span className="text-3xl p-2 rounded-xl bg-emerald-500/20 border border-emerald-500/40">
                    {getCropMeta(selectedCrop).icon}
                  </span>
                  <div>
                    <p className="font-extrabold text-sm text-white">
                      {selectedCrop.canonical_name} <span className="text-emerald-400 font-semibold">• Ready for Step 3</span>
                    </p>
                    <p className="text-[11px] text-slate-400">
                      Biological organ filter initialized: <strong>{compatibleOrgans.length} compatible plant organs</strong> unlocked.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center">
                  <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    Confidence Locked
                  </span>
                </div>
              </motion.div>
            )}

            {cropWarning && (
              <div className="p-4 rounded-2xl bg-amber-950/40 border border-amber-500/40 text-xs text-amber-300 flex items-center gap-2.5">
                <AlertTriangle className="w-4 h-4 shrink-0 text-amber-400" />
                <span>{cropWarning}</span>
              </div>
            )}

            {/* Step Navigation */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-800">
              <button
                onClick={() => setCurrentStep(1)}
                className="px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center gap-2 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Photo</span>
              </button>

              <button
                onClick={() => setCurrentStep(3)}
                className="px-6 py-3 rounded-2xl font-bold text-sm bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 flex items-center gap-2 transition-all shadow-lg shadow-emerald-500/25 hover:scale-[1.01]"
              >
                <span>Continue to Step 3: Plant Part</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

          </div>
        </motion.div>
      )}

      {/* ========================================================= */}
      {/* STEP 3: Affected Plant Part                               */}
      {/* ========================================================= */}
      {currentStep === 3 && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          <div className="bg-slate-900/80 backdrop-blur-xl rounded-3xl p-6 sm:p-8 border border-slate-800 space-y-6 shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-5">
              <div>
                <h4 className="text-xl sm:text-2xl font-black text-white flex items-center gap-3">
                  <span className="p-2.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
                    <Leaf className="w-6 h-6" />
                  </span>
                  <span>Step 3: Identify the Affected Plant Part(s)</span>
                </h4>
                <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-3xl leading-relaxed">
                  Select all plant organs exhibiting signs of disease (<strong className="text-emerald-400">multi-select enabled</strong>; e.g. Leaves + Fruit).
                  Options are dynamically filtered based on the biological morphology of{' '}
                  <strong className="text-emerald-300">
                    {selectedCrop ? `${getCropMeta(selectedCrop).icon} ${selectedCrop.canonical_name}` : 'selected crop'}
                  </strong>.
                </p>
              </div>

              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-2xl bg-emerald-500/15 border border-emerald-500/40 text-xs font-bold text-emerald-300 self-start sm:self-center shrink-0">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>{selectedOrgans.length} Selected</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {compatibleOrgans.map(org => {
                const isSelected = selectedOrgans.includes(org.id);

                return (
                  <motion.div
                    key={org.id}
                    whileHover={{ scale: 1.015 }}
                    whileTap={{ scale: 0.985 }}
                    onClick={() => toggleOrgan(org.id)}
                    className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-start justify-between gap-3 ${
                      isSelected
                        ? 'bg-gradient-to-br from-emerald-950/70 via-slate-900/90 to-slate-900 border-emerald-400 ring-2 ring-emerald-400/50 shadow-[0_0_24px_rgba(16,185,129,0.25)]'
                        : 'bg-slate-800/40 hover:bg-slate-800/80 border-slate-700/70 text-slate-300'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-2xl p-2 rounded-xl bg-slate-800/80 border border-slate-700 shrink-0">
                        {org.icon || '🌱'}
                      </span>
                      <div>
                        <p className="font-extrabold text-sm text-white">{org.label}</p>
                        <p className="text-xs text-slate-400 mt-0.5 leading-snug">{org.desc}</p>
                      </div>
                    </div>

                    <div className={`w-5 h-5 rounded-lg flex items-center justify-center shrink-0 transition-all ${
                      isSelected
                        ? 'bg-emerald-500 text-slate-950 shadow-md ring-2 ring-emerald-400/40'
                        : 'border border-slate-600 bg-slate-800/60'
                    }`}>
                      {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                    </div>
                  </motion.div>
                );
              })}
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-800">
              <button
                onClick={() => setCurrentStep(2)}
                className="px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center gap-2 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Crop</span>
              </button>

              <button
                onClick={() => setCurrentStep(4)}
                className="px-6 py-3 rounded-2xl font-bold text-sm bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 flex items-center gap-2 transition-all shadow-lg shadow-emerald-500/25 hover:scale-[1.01]"
              >
                <span>Continue to Step 4: Symptoms</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* ========================================================= */}
      {/* STEP 4: Symptoms & Field Conditions                       */}
      {/* ========================================================= */}
      {currentStep === 4 && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          <div className="bg-slate-900/80 backdrop-blur-xl rounded-3xl p-6 sm:p-8 border border-slate-800 space-y-7 shadow-xl">
            <div>
              <h4 className="text-xl sm:text-2xl font-black text-white flex items-center gap-3">
                <span className="p-2.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
                  <Activity className="w-6 h-6" />
                </span>
                <span>Step 4: Describe Symptoms and Field Conditions</span>
              </h4>
              <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-3xl leading-relaxed">
                Provide structured epidemiological telemetry. Visual symptoms combine with onset duration and environmental conditions to compute calibrated disease hypotheses.
              </p>
            </div>

            {/* Visual Symptoms Selection */}
            <div className="space-y-3">
              <label className="text-xs sm:text-sm font-extrabold text-white flex items-center gap-1.5">
                <span>1. What visual symptoms do you observe? (Select all that apply)</span>
                <span className="text-emerald-400 font-black">*</span>
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {SYMPTOM_OPTIONS.map(s => {
                  const isChecked = selectedSymptoms.includes(s.id);
                  return (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => toggleSymptom(s.id)}
                      className={`p-3.5 rounded-2xl border text-left transition-all flex items-start gap-3 ${
                        isChecked
                          ? 'bg-gradient-to-br from-emerald-950/70 via-slate-900/90 to-slate-900 border-emerald-400 ring-2 ring-emerald-400/40 text-white shadow-md'
                          : 'bg-slate-800/40 hover:bg-slate-800/80 border-slate-700/70 text-slate-300'
                      }`}
                    >
                      <span className="text-2xl p-2 rounded-xl bg-slate-800/80 border border-slate-700 shrink-0">
                        {s.icon}
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <span className="text-xs font-bold truncate">{s.label}</span>
                          {isChecked && (
                            <span className="w-4 h-4 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center shrink-0">
                              <Check className="w-3 h-3 stroke-[3]" />
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] text-slate-400 mt-0.5 block leading-tight">{s.desc}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Location, Duration, Spread, and Stage Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-800">
              {/* Question 2: Location */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-white flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                  <span>2. Where do symptoms appear?</span>
                </label>
                <select
                  value={symptomLocation}
                  onChange={e => setSymptomLocation(e.target.value)}
                  className="w-full bg-slate-800/90 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/30"
                >
                  <option value="loc_single_part">One leaf or isolated part</option>
                  <option value="loc_multiple_parts_single_plant">Several parts of one plant</option>
                  <option value="loc_multiple_plants">Cluster of neighboring plants</option>
                  <option value="loc_whole_field">Widespread across most of the field</option>
                  <option value="loc_unsure">Not sure / Unchecked</option>
                </select>
              </div>

              {/* Question 3: Duration */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-white flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-emerald-400" />
                  <span>3. When did you first notice it?</span>
                </label>
                <select
                  value={symptomDuration}
                  onChange={e => setSymptomDuration(e.target.value)}
                  className="w-full bg-slate-800/90 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/30"
                >
                  <option value="dur_1_to_3_days">Within last 1 to 3 days (acute onset)</option>
                  <option value="dur_4_to_7_days">4 to 7 days ago (~1 week)</option>
                  <option value="dur_1_to_2_weeks">1 to 2 weeks ago</option>
                  <option value="dur_over_2_weeks">More than 2 weeks ago (chronic progression)</option>
                  <option value="dur_unsure">Not sure</option>
                </select>
              </div>

              {/* Question 4: Spread Speed */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-white flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-emerald-400" />
                  <span>4. How quickly is it spreading?</span>
                </label>
                <select
                  value={spreadRate}
                  onChange={e => setSpreadRate(e.target.value)}
                  className="w-full bg-slate-800/90 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/30"
                >
                  <option value="spread_rapid">Rapidly (multiplying daily)</option>
                  <option value="spread_slow">Slowly (gradual expansion)</option>
                  <option value="spread_none">Not spreading (stationary)</option>
                  <option value="spread_unsure">Not sure</option>
                </select>
              </div>

              {/* Question 5: Growth Stage */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-white flex items-center gap-1.5">
                  <Sprout className="w-3.5 h-3.5 text-emerald-400" />
                  <span>5. Crop Growth Stage</span>
                </label>
                <select
                  value={growthStage}
                  onChange={e => setGrowthStage(e.target.value)}
                  className="w-full bg-slate-800/90 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/30"
                >
                  <option value="stage_seedling">Seedling / Nursery</option>
                  <option value="stage_vegetative">Vegetative Growth / Tillering</option>
                  <option value="stage_flowering">Flowering / Blossom</option>
                  <option value="stage_fruiting">Fruit / Pod / Grain Filling</option>
                  <option value="stage_maturity">Maturity / Ripening</option>
                  <option value="stage_unsure">Not sure</option>
                </select>
              </div>
            </div>

            {/* Question 6: Field & Weather Conditions */}
            <div className="space-y-2.5 pt-4 border-t border-slate-800">
              <label className="text-xs font-bold text-white flex items-center gap-1.5">
                <Droplets className="w-3.5 h-3.5 text-cyan-400" />
                <span>6. Recent Field / Weather Conditions (Select applicable)</span>
              </label>

              <div className="flex flex-wrap gap-2">
                {[
                  { id: 'cond_heavy_rain', label: '🌧️ Heavy Rain' },
                  { id: 'cond_high_humidity', label: '🌫️ High Humidity / Dew' },
                  { id: 'cond_hot_dry', label: '☀️ Hot & Dry' },
                  { id: 'cond_waterlogging', label: '🌊 Waterlogging' },
                  { id: 'cond_recent_irrigation', label: '🚿 Recent Heavy Irrigation' },
                  { id: 'cond_normal', label: '⛅ Normal Weather' },
                  { id: 'cond_unsure', label: '❓ Not Sure' }
                ].map(c => {
                  const isChecked = selectedConditions.includes(c.id);
                  return (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => toggleCondition(c.id)}
                      className={`px-3.5 py-2 rounded-xl text-xs font-bold border transition-all ${
                        isChecked
                          ? 'bg-cyan-500/20 border-cyan-400 text-cyan-200 shadow-sm shadow-cyan-500/10'
                          : 'bg-slate-800/60 border-slate-700 text-slate-400 hover:text-white'
                      }`}
                    >
                      {c.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Pests & Treatment */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-800">
              <div className="space-y-2">
                <label className="text-xs font-bold text-white flex items-center gap-1.5">
                  <Bug className="w-3.5 h-3.5 text-amber-400" />
                  <span>7. Are pests or insects visible?</span>
                </label>
                <div className="flex gap-2">
                  {[
                    { id: 'pest_yes', label: 'Yes' },
                    { id: 'pest_no', label: 'No' },
                    { id: 'pest_unsure', label: 'Not Sure' }
                  ].map(p => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setVisiblePests(p.id)}
                      className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-all ${
                        visiblePests === p.id
                          ? 'bg-amber-500/25 border-amber-400 text-amber-300 shadow-sm'
                          : 'bg-slate-800/60 border-slate-700 text-slate-400'
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-white flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5 text-emerald-400" />
                  <span>8. Have you applied any treatment?</span>
                </label>
                <div className="flex gap-2">
                  {[
                    { id: 'treatment_yes', label: 'Yes' },
                    { id: 'treatment_no', label: 'No' }
                  ].map(t => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setPreviousTreatment(t.id)}
                      className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-all ${
                        previousTreatment === t.id
                          ? 'bg-emerald-500/25 border-emerald-400 text-emerald-300 shadow-sm'
                          : 'bg-slate-800/60 border-slate-700 text-slate-400'
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Conditional Treatment Details */}
            {previousTreatment === 'treatment_yes' && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="space-y-1.5 pt-1">
                <label className="text-xs font-semibold text-slate-200">
                  What treatment was applied? (Fungicide/insecticide trade name or organic spray)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Mancozeb 75% WP, Copper Oxychloride, Neem oil, or 'Do not recall name'"
                  value={treatmentDetails}
                  onChange={e => setTreatmentDetails(e.target.value)}
                  className="w-full bg-slate-800/90 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </motion.div>
            )}

            <div className="flex items-center justify-between pt-3 border-t border-slate-800">
              <button
                onClick={() => setCurrentStep(3)}
                className="px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center gap-2 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Plant Part</span>
              </button>

              <button
                onClick={() => setCurrentStep(5)}
                className="px-6 py-3 rounded-2xl font-bold text-sm bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 flex items-center gap-2 transition-all shadow-lg shadow-emerald-500/25 hover:scale-[1.01]"
              >
                <span>Continue to Step 5: Field Context</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* ========================================================= */}
      {/* STEP 5: Optional Field Context                            */}
      {/* ========================================================= */}
      {currentStep === 5 && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          <div className="bg-slate-900/80 backdrop-blur-xl rounded-3xl p-6 sm:p-8 border border-slate-800 space-y-6 shadow-xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h4 className="text-xl sm:text-2xl font-black text-white flex items-center gap-3">
                  <span className="p-2.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
                    <FileText className="w-6 h-6" />
                  </span>
                  <span>Step 5: Optional Field Context</span>
                </h4>
                <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
                  All fields below are entirely optional and skippable. If unsure, you may proceed directly to Review.
                </p>
              </div>

              <button
                onClick={() => setCurrentStep(6)}
                className="text-xs font-bold text-emerald-400 hover:text-emerald-300 underline px-3 py-1.5 rounded-xl bg-emerald-950/40 border border-emerald-700/50"
              >
                Skip to Review ➔
              </button>
            </div>

            {/* Quick District Chips */}
            <div className="space-y-2 p-3.5 rounded-2xl bg-slate-800/30 border border-slate-800">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <MapPin className="w-3 h-3 text-emerald-400" />
                Quick Presets (Telangana & Andhra Pradesh):
              </span>
              <div className="flex flex-wrap gap-1.5">
                {AP_TG_DISTRICTS.map(dist => (
                  <button
                    key={dist}
                    type="button"
                    onClick={() => setLocationDistrict(dist)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors ${
                      locationDistrict === dist
                        ? 'bg-emerald-500/25 border-emerald-400 text-emerald-300 font-bold'
                        : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:text-white'
                    }`}
                  >
                    {dist}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-200">State (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Telangana, Andhra Pradesh"
                  value={locationState}
                  onChange={e => setLocationState(e.target.value)}
                  className="w-full bg-slate-800/90 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-200">District (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Guntur, Krishna, Warangal, Khammam"
                  value={locationDistrict}
                  onChange={e => setLocationDistrict(e.target.value)}
                  className="w-full bg-slate-800/90 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-200">Sowing / Planting Date (Optional)</label>
                <input
                  type="date"
                  value={sowingDate}
                  onChange={e => setSowingDate(e.target.value)}
                  className="w-full bg-slate-800/90 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-200">Variety / Hybrid Name (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Teja, BPT-5204, G-4, Ganga Kaveri"
                  value={varietyName}
                  onChange={e => setVarietyName(e.target.value)}
                  className="w-full bg-slate-800/90 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-200">Additional Farmer Notes (Optional)</label>
              <textarea
                rows={3}
                placeholder="Mention any specific fertilizer applications, recent water stress, or unique signs..."
                value={additionalNotes}
                onChange={e => setAdditionalNotes(e.target.value)}
                maxLength={1000}
                className="w-full bg-slate-800/90 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-800">
              <button
                onClick={() => setCurrentStep(4)}
                className="px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center gap-2 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Symptoms</span>
              </button>

              <button
                onClick={() => setCurrentStep(6)}
                className="px-6 py-3 rounded-2xl font-bold text-sm bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 flex items-center gap-2 transition-all shadow-lg shadow-emerald-500/25 hover:scale-[1.01]"
              >
                <span>Continue to Step 6: Review</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* ========================================================= */}
      {/* STEP 6: Review & Submit Evidence Payload                  */}
      {/* ========================================================= */}
      {currentStep === 6 && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          <div className="bg-slate-900/80 backdrop-blur-xl rounded-3xl p-6 sm:p-8 border border-slate-800 space-y-6 shadow-xl">
            <div>
              <h4 className="text-xl sm:text-2xl font-black text-white flex items-center gap-3">
                <span className="p-2.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
                  <ShieldCheck className="w-6 h-6" />
                </span>
                <span>Step 6: Review Structured Evidence Dossier</span>
              </h4>
              <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-3xl leading-relaxed">
                Verify your submitted observations. The Phase 8 multimodal diagnostic engine will synthesize visual deep feature embeddings with your structured symptom responses and PJTSAU agronomic rules.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Photo & Crop Summary Card */}
              <div className="p-5 rounded-2xl bg-slate-800/40 border border-slate-700 space-y-3">
                <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Sprout className="w-3.5 h-3.5" />
                  <span>Crop & Morphological Target</span>
                </span>
                <div className="flex items-center gap-4">
                  {previewUrl ? (
                    <img src={previewUrl} alt="Thumbnail" className="w-20 h-20 rounded-xl object-cover border border-slate-600 shrink-0 shadow-md" />
                  ) : (
                    <div className="w-20 h-20 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-500 text-xs shrink-0">
                      No Photo
                    </div>
                  )}
                    <div className="space-y-1.5">
                      <p className="font-extrabold text-base text-white flex items-center gap-2">
                        <span className="text-xl">{selectedCrop ? getCropMeta(selectedCrop).icon : '🌱'}</span>
                        <span>{selectedCrop?.canonical_name || "Unidentified Crop"}</span>
                      </p>
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="text-xs text-slate-300">Target Plant Parts:</span>
                        {selectedOrgans.map(orgId => {
                          const orgObj = ORGAN_OPTIONS.find(o => o.id === orgId);
                          return (
                            <span key={orgId} className="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1">
                              <span>{orgObj?.icon || '🌱'}</span>
                              <span>{orgObj?.label || orgId}</span>
                            </span>
                          );
                        })}
                      </div>
                      <p className="text-[11px] text-slate-400">
                        Photo: {selectedFile ? selectedFile.name : "Optional (Proceeding with questionnaire evidence)"}
                      </p>
                    </div>
                </div>
              </div>

              {/* Symptoms & Conditions Card */}
              <div className="p-5 rounded-2xl bg-slate-800/40 border border-slate-700 space-y-3">
                <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5" />
                  <span>Reported Symptoms & Progression</span>
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {selectedSymptoms.length > 0 ? (
                    selectedSymptoms.map(sym => (
                      <span key={sym} className="px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-950/60 text-emerald-300 border border-emerald-800/60">
                        {sym.replace(/^sym_/, '').replace(/_/g, ' ')}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-slate-400 italic">No specific symptoms selected (Unsure)</span>
                  )}
                </div>
                <div className="text-[11px] text-slate-400 space-y-1 pt-1 border-t border-slate-700/60">
                  <p>Onset: <strong className="text-slate-200">{symptomDuration}</strong> • Spread: <strong className="text-slate-200">{spreadRate}</strong></p>
                  <p>Region: <strong className="text-slate-200">{locationDistrict || locationState || 'Telangana / AP'}</strong> • Stage: <strong className="text-slate-200">{growthStage}</strong></p>
                </div>
              </div>
            </div>

            {submitError && (
              <div className="p-4 rounded-2xl bg-red-950/40 border border-red-500/40 text-xs text-red-300 flex items-center gap-2.5">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
                <span>{submitError}</span>
              </div>
            )}

            <div className="flex items-center justify-between pt-3 border-t border-slate-800">
              <button
                onClick={() => setCurrentStep(5)}
                disabled={submitting}
                className="px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center gap-2 transition-colors disabled:opacity-50"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>

              <button
                onClick={handleSubmitEvidence}
                disabled={submitting}
                className="px-8 py-3.5 rounded-2xl font-black text-sm bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 flex items-center gap-3 transition-all shadow-xl shadow-emerald-500/30 hover:scale-[1.02] disabled:opacity-50 disabled:scale-100"
              >
                {submitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                    <span>Synthesizing Multimodal Decision Evidence...</span>
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4 fill-slate-950" />
                    <span>Launch Multimodal Diagnostic Engine</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* ========================================================= */}
      {/* STEP 7: Professional Agricultural Diagnosis Report        */}
      {/* ========================================================= */}
      {currentStep === 7 && diagnosisResult && (() => {
        const decisionStatus = diagnosisResult.decision_status || 'uncertain';
        const isConfirmed = decisionStatus === 'single_candidate_confirmed' || decisionStatus === 'diagnosis_supported';
        const isMismatch = decisionStatus === 'crop_mismatch' ||
          diagnosisResult.crop_selection_status === 'crop_mismatch_detected' ||
          diagnosisResult.crop_selection_status === 'CROP_MISMATCH' ||
          decisionStatus === 'organ_mismatch';

        const statusMeta = (() => {
          if (isMismatch) {
            return {
              title: 'Crop Mismatch',
              badgeClass: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
              icon: AlertTriangle
            };
          }
          if (isConfirmed) {
            return {
              title: 'Likely Diagnosis',
              badgeClass: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
              icon: CheckCircle2
            };
          }
          if (decisionStatus === 'multiple_candidates') {
            return {
              title: 'Differential Diagnosis',
              badgeClass: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
              icon: AlertCircle
            };
          }
          if (decisionStatus === 'insufficient_evidence') {
            return {
              title: 'Uncertain — More Evidence Needed',
              badgeClass: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
              icon: AlertCircle
            };
          }
          return {
            title: 'Expert Review Recommended',
            badgeClass: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
            icon: HelpCircle
          };
        })();

        const candidateDiagnoses = diagnosisResult.candidate_diagnoses || [];
        const leadingCandidate = candidateDiagnoses.length > 0 ? candidateDiagnoses[0] : null;

        // Evidence justifies leading candidate if confirmed OR differential multiple candidates with leading score >= 0.35
        const hasConfidentDiagnosis = (isConfirmed || decisionStatus === 'multiple_candidates') &&
          leadingCandidate &&
          (leadingCandidate.evidence_score >= 0.35) &&
          !isMismatch &&
          decisionStatus !== 'unsupported_crop';

        // Alternative candidates: at most 2 plausible candidates (rank 2 and 3)
        const alternativeCandidates = candidateDiagnoses
          .slice(1, 3)
          .filter(cand => cand && cand.evidence_score >= 0.05);

        const evidenceLedger = diagnosisResult.evidence_ledger || [];
        const leadingLedger = leadingCandidate
          ? (evidenceLedger.find(e => e.canonical_disease_id === leadingCandidate.canonical_disease_id) || evidenceLedger[0] || null)
          : (evidenceLedger[0] || null);

        const recommendations = diagnosisResult.recommendations || {};
        const cropDisplayName = selectedCrop?.name || String(diagnosisResult.selected_crop_id || '').replace('crop_', '');

        return (
          <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="space-y-6">
            <div className="bg-slate-900/95 backdrop-blur-xl rounded-3xl p-6 sm:p-8 border border-emerald-500/30 shadow-2xl space-y-6">

              {/* --------------------------------------------------------- */}
              {/* SECTION A — Compact Diagnosis Header                     */}
              {/* --------------------------------------------------------- */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <h3 className="text-2xl font-black text-white tracking-tight">Diagnosis Report</h3>
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-800 text-slate-300 border border-slate-700">
                      Crop Health Assessment
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-400">
                    <span className="flex items-center gap-1.5 text-slate-200">
                      <Leaf className="w-3.5 h-3.5 text-emerald-400" />
                      Selected Crop: <strong className="text-white capitalize">{cropDisplayName}</strong>
                    </span>
                    {diagnosisResult.affected_organ && (
                      <span className="flex items-center gap-1 text-slate-300">
                        • Plant Part: <span className="capitalize text-slate-200">{diagnosisResult.affected_organ.replace(/_/g, ' ')}</span>
                      </span>
                    )}
                    {diagnosisTimestamp && (
                      <span className="flex items-center gap-1 text-slate-400">
                        • <Clock className="w-3 h-3" /> {diagnosisTimestamp}
                      </span>
                    )}
                  </div>
                </div>

                {/* Plain-Language Status Badge */}
                <div className="flex items-center gap-3">
                  <div className={`px-4 py-2 rounded-2xl border text-xs sm:text-sm font-black flex items-center gap-2.5 shadow-lg ${statusMeta.badgeClass}`}>
                    <statusMeta.icon className="w-4 h-4 shrink-0" />
                    <span className="uppercase tracking-wide">{statusMeta.title}</span>
                  </div>
                </div>
              </div>

              {/* --------------------------------------------------------- */}
              {/* SECTION A.5 — Visual Lesion Inspection & Bounding Boxes  */}
              {/* --------------------------------------------------------- */}
              {(previewUrl || diagnosisResult.processed_image) && (
                <div className="p-5 sm:p-6 rounded-3xl bg-slate-800/60 border border-slate-700/80 shadow-xl space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-700/60">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <Eye className="w-4 h-4 text-emerald-400" />
                        <h4 className="text-base sm:text-lg font-black text-white">
                          Foliage Inspection & Lesion Localization
                        </h4>
                      </div>
                      <p className="text-xs text-slate-400">
                        OpenCV morphological contour detection & neural feature bounding boxes
                      </p>
                    </div>

                    {/* View Mode Toggle */}
                    <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-900/90 border border-slate-700 self-start sm:self-auto">
                      <button
                        type="button"
                        onClick={() => setActiveImageView('boxes')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                          activeImageView === 'boxes'
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
                            : 'text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                        <span>AI Detection Boxes</span>
                        {diagnosisResult.lesion_count !== undefined && diagnosisResult.lesion_count !== null && (
                          <span className="px-1.5 py-0.2 rounded-full bg-emerald-500/30 text-[10px] text-emerald-200 font-extrabold">
                            {diagnosisResult.lesion_count}
                          </span>
                        )}
                      </button>

                      {previewUrl && (
                        <button
                          type="button"
                          onClick={() => setActiveImageView('original')}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                            activeImageView === 'original'
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
                              : 'text-slate-400 hover:text-slate-200'
                          }`}
                        >
                          <ImageIcon className="w-3.5 h-3.5" />
                          <span>Clean Photo</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Image Display Container */}
                  <div className="relative rounded-2xl overflow-hidden bg-slate-950 border border-slate-700/80 flex items-center justify-center min-h-[260px] max-h-[460px]">
                    <img
                      src={
                        activeImageView === 'boxes' && diagnosisResult.processed_image
                          ? (diagnosisResult.processed_image.startsWith('data:')
                              ? diagnosisResult.processed_image
                              : `data:image/png;base64,${diagnosisResult.processed_image}`)
                          : (previewUrl || diagnosisResult.processed_image)
                      }
                      alt="Crop Foliage Lesion Inspection"
                      className="w-full h-auto max-h-[460px] object-contain mx-auto"
                    />

                    {/* Floating Corner Badges */}
                    <div className="absolute top-3 left-3 flex items-center gap-2">
                      <span className="px-2.5 py-1 rounded-lg text-[10px] font-extrabold bg-slate-900/90 text-slate-200 border border-slate-700/80 backdrop-blur-md shadow-md flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                        {activeImageView === 'boxes' ? 'AI Bounding Boxes Active' : 'Original Field Photograph'}
                      </span>
                    </div>

                    <div className="absolute bottom-3 right-3 flex items-center gap-2">
                      {diagnosisResult.severity && (
                        <span className={`px-2.5 py-1 rounded-lg text-[10px] font-extrabold backdrop-blur-md shadow-md border ${
                          diagnosisResult.severity === 'High'
                            ? 'bg-rose-950/80 text-rose-300 border-rose-500/50'
                            : diagnosisResult.severity === 'Medium'
                            ? 'bg-amber-950/80 text-amber-300 border-amber-500/50'
                            : diagnosisResult.severity === 'Healthy'
                            ? 'bg-emerald-950/80 text-emerald-300 border-emerald-500/50'
                            : 'bg-cyan-950/80 text-cyan-300 border-cyan-500/50'
                        }`}>
                          Severity: {diagnosisResult.severity}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Summary Metric Stats */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1 text-xs">
                    <div className="p-3 rounded-xl bg-slate-900/70 border border-slate-800">
                      <div className="text-[11px] text-slate-400 font-medium">Lesion Spots</div>
                      <div className="text-lg font-black text-amber-400 mt-0.5">
                        {diagnosisResult.lesion_count !== undefined && diagnosisResult.lesion_count !== null
                          ? diagnosisResult.lesion_count
                          : 0}
                      </div>
                      <div className="text-[10px] text-slate-500">Bounding boxes</div>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-900/70 border border-slate-800">
                      <div className="text-[11px] text-slate-400 font-medium">Foliage Severity</div>
                      <div className={`text-lg font-black mt-0.5 ${
                        diagnosisResult.severity === 'High'
                          ? 'text-rose-400'
                          : diagnosisResult.severity === 'Medium'
                          ? 'text-amber-400'
                          : diagnosisResult.severity === 'Healthy'
                          ? 'text-emerald-400'
                          : 'text-cyan-400'
                      }`}>
                        {diagnosisResult.severity || 'Low'}
                      </div>
                      <div className="text-[10px] text-slate-500">Surface distribution</div>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-900/70 border border-slate-800">
                      <div className="text-[11px] text-slate-400 font-medium">Inspected Part</div>
                      <div className="text-lg font-black text-white capitalize mt-0.5">
                        {String(diagnosisResult.affected_organ || selectedOrgans[0] || 'Leaves').replace(/_/g, ' ')}
                      </div>
                      <div className="text-[10px] text-slate-500">Target organ</div>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-900/70 border border-slate-800">
                      <div className="text-[11px] text-slate-400 font-medium">Vision Engine</div>
                      <div className="text-lg font-black text-emerald-400 mt-0.5">
                        OpenCV + CNN
                      </div>
                      <div className="text-[10px] text-slate-500">Hybrid verification</div>
                    </div>
                  </div>
                </div>
              )}

              {/* --------------------------------------------------------- */}
              {/* SECTION B — Main Result Card                              */}
              {/* --------------------------------------------------------- */}
              {hasConfidentDiagnosis ? (
                <div className="p-6 rounded-3xl bg-slate-800/60 border border-emerald-500/40 shadow-xl space-y-5">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    <div className="space-y-1">
                      <div className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[10px] font-extrabold uppercase tracking-wider border ${
                        decisionStatus === 'multiple_candidates'
                          ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                          : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                      }`}>
                        {decisionStatus === 'multiple_candidates' ? (
                          <>
                            <AlertCircle className="w-3 h-3" />
                            Leading Suspect (Differential Diagnosis)
                          </>
                        ) : (
                          <>
                            <CheckCircle2 className="w-3 h-3" />
                            Primary Suspected Disease
                          </>
                        )}
                      </div>
                      <h4 className="text-2xl sm:text-3xl font-black text-white">{leadingCandidate.canonical_name}</h4>
                      {leadingCandidate.scientific_name && (
                        <p className="text-xs sm:text-sm text-slate-400 italic">
                          Scientific name: {leadingCandidate.scientific_name}
                        </p>
                      )}
                    </div>

                    {/* Clearly labelled evidence score */}
                    <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-700/80 text-right sm:min-w-[180px] shrink-0">
                      <div className="text-xs text-slate-400 font-medium">Evidence Score</div>
                      <div className={`text-2xl sm:text-3xl font-black ${
                        decisionStatus === 'multiple_candidates' ? 'text-amber-400' : 'text-emerald-400'
                      }`}>
                        {(leadingCandidate.evidence_score * 100).toFixed(0)}%
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5 leading-tight">
                        Multimodal symptom match
                      </div>
                    </div>
                  </div>

                  {decisionStatus === 'multiple_candidates' && (
                    <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-200 flex items-start gap-2.5">
                      <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                      <span>
                        Multiple plausible candidate conditions identified for <strong>{cropDisplayName}</strong>. While <strong>{leadingCandidate.canonical_name}</strong> is the leading match ({(leadingCandidate.evidence_score * 100).toFixed(0)}%), inspect the differential candidate conditions in Section F below before applying chemical sprays.
                      </span>
                    </div>
                  )}

                  {/* Short plain-language description */}
                  <div className="text-sm text-slate-200 leading-relaxed bg-slate-900/60 p-4 rounded-2xl border border-slate-800">
                    <p>
                      {recommendations.what_may_be_happening || leadingCandidate.decision_rationale}
                    </p>
                  </div>

                  {/* 2 or 3 verified reasons supporting diagnosis */}
                  <div className="space-y-2">
                    <div className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-emerald-400" />
                      <span>Verified Supporting Factors</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {leadingLedger?.supporting_evidence && leadingLedger.supporting_evidence.length > 0 ? (
                        leadingLedger.supporting_evidence.slice(0, 3).map((item, idx) => (
                          <div key={idx} className="flex items-start gap-2 p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-200">
                            <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                            <span>{item}</span>
                          </div>
                        ))
                      ) : (
                        <div className="flex items-start gap-2 p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-200">
                          <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                          <span>{leadingCandidate.decision_rationale}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Accurate note on uncalibrated score */}
                  <div className="text-[11px] text-slate-400 flex items-center gap-1.5 pt-1">
                    <Info className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>Evidence score reflects heuristic fusion of photo patterns and reported symptoms (not a calibrated probability).</span>
                  </div>
                </div>
              ) : (
                /* Unforced Inconclusive State */
                <div className="p-6 rounded-3xl bg-slate-800/50 border border-amber-500/40 shadow-xl space-y-4">
                  <div className="flex items-start gap-3.5">
                    <div className="p-3 rounded-2xl bg-amber-500/20 text-amber-300 border border-amber-500/40 shrink-0">
                      <AlertCircle className="w-6 h-6" />
                    </div>
                    <div className="space-y-1.5">
                      <h4 className="text-xl sm:text-2xl font-bold text-white">
                        We could not confidently identify the disease from this image.
                      </h4>
                      <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                        {diagnosisResult.uncertainty_reasons?.[0] ||
                         diagnosisResult.recommended_next_step ||
                         "The photo patterns or reported symptoms do not reach the required certainty threshold to recommend specific treatment safely."}
                      </p>
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2">
                    <div className="text-xs font-bold text-amber-300 uppercase tracking-wide">
                      Next Useful Action
                    </div>
                    <ul className="text-xs text-slate-300 space-y-1.5 list-disc list-inside">
                      <li>Upload a sharper, well-lit photo focusing closely on the damaged leaf or stem.</li>
                      <li>Verify that the selected crop matches the plant in the field.</li>
                      <li>Confirm the specific plant organ showing the most pronounced spots or wilting.</li>
                    </ul>
                  </div>
                </div>
              )}

              {/* --------------------------------------------------------- */}
              {/* SECTION C — Crop Mismatch & Uncertainty Notice            */}
              {/* --------------------------------------------------------- */}
              {isMismatch && (
                <div className="p-5 rounded-3xl bg-rose-950/30 border border-rose-500/50 shadow-xl space-y-4">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                    <div className="space-y-1">
                      <h4 className="text-base font-bold text-rose-200">
                        Crop Mismatch Detected — Result Is Uncertain
                      </h4>
                      <p className="text-xs sm:text-sm text-rose-100/90 leading-relaxed">
                        The visual features extracted from the photo most closely resemble a different crop species than the one you selected. Because plant disease treatments and pathogen behaviors are crop-specific, this diagnosis cannot be confirmed reliably.
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1">
                      <div className="text-slate-400 text-[11px] font-semibold uppercase">Farmer Selected Crop</div>
                      <div className="text-base font-bold text-white capitalize">
                        {String(diagnosisResult.selected_crop_id || '').replace('crop_', '')}
                      </div>
                      <div className="text-[11px] text-emerald-400 font-medium">Restricts candidate hypothesis search</div>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1">
                      <div className="text-slate-400 text-[11px] font-semibold uppercase">Vision AI Detected Features</div>
                      <div className="text-base font-bold text-white capitalize">
                        {String(diagnosisResult.visually_predicted_crop_id || 'Unknown').replace('crop_', '')}
                        {diagnosisResult.visual_crop_confidence ? ` (${(diagnosisResult.visual_crop_confidence * 100).toFixed(1)}% feature mass)` : ''}
                      </div>
                      <div className="text-[11px] text-amber-300 font-medium">Raw visual neural activation</div>
                    </div>
                  </div>

                  <div className="text-xs text-rose-200 bg-rose-900/20 p-3 rounded-xl border border-rose-800/40">
                    <strong>Safety Guardrail:</strong> Chemical pesticide advice is withheld to prevent crop injury. A farmer-selected crop restricts eligible disease candidates, but this is not independent visual confirmation.
                  </div>
                </div>
              )}

              {/* --------------------------------------------------------- */}
              {/* SECTION D — Symptoms and Possible Causes                 */}
              {/* --------------------------------------------------------- */}
              <div className="p-6 rounded-3xl bg-slate-800/40 border border-slate-700/70 space-y-5">
                <div className="flex items-center justify-between">
                  <h4 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                    <Activity className="w-5 h-5 text-teal-400" />
                    <span>Symptoms and Possible Causes</span>
                  </h4>
                  <span className="text-xs text-slate-400">Clinical Observations & Conditions</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Reported & Detected Symptoms */}
                  <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-3">
                    <div className="text-xs font-bold text-emerald-400 uppercase tracking-wide flex items-center gap-1.5">
                      <Leaf className="w-4 h-4" />
                      <span>Farmer-Reported & Observed Symptoms</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedSymptoms.map(symId => {
                        const symObj = SYMPTOM_OPTIONS.find(s => s.id === symId);
                        return (
                          <span key={symId} className="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-200 border border-slate-700 text-xs flex items-center gap-1.5">
                            <span>{symObj?.icon || '•'}</span>
                            <span>{symObj?.label || symId.replace('sym_', '').replace(/_/g, ' ')}</span>
                          </span>
                        );
                      })}
                      {selectedSymptoms.length === 0 && (
                        <span className="text-xs text-slate-400 italic">No specific symptoms recorded</span>
                      )}
                    </div>

                    {leadingLedger?.supporting_evidence && leadingLedger.supporting_evidence.length > 0 && (
                      <div className="pt-2 border-t border-slate-800 text-xs text-slate-300 space-y-1">
                        <span className="font-semibold text-slate-400 text-[11px] uppercase">Image Consistency:</span>
                        <p className="leading-relaxed">{leadingLedger.supporting_evidence[0]}</p>
                      </div>
                    )}
                  </div>

                  {/* Environmental & Risk Context */}
                  <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-3">
                    <div className="text-xs font-bold text-teal-400 uppercase tracking-wide flex items-center gap-1.5">
                      <Droplets className="w-4 h-4" />
                      <span>Environmental Risk Conditions</span>
                    </div>
                    <div className="space-y-1.5 text-xs text-slate-300">
                      <div className="flex items-center justify-between py-1 border-b border-slate-800/80">
                        <span className="text-slate-400">Weather Condition:</span>
                        <span className="font-semibold text-slate-200 capitalize">
                          {selectedConditions.map(c => c.replace('cond_', '').replace(/_/g, ' ')).join(', ') || 'Normal'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between py-1 border-b border-slate-800/80">
                        <span className="text-slate-400">Plant Growth Stage:</span>
                        <span className="font-semibold text-slate-200 capitalize">
                          {growthStage.replace('stage_', '').replace(/_/g, ' ')}
                        </span>
                      </div>
                      <div className="flex items-center justify-between py-1">
                        <span className="text-slate-400">Symptom Spread:</span>
                        <span className="font-semibold text-slate-200 capitalize">
                          {spreadRate.replace('spread_', '').replace(/_/g, ' ')}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Evidence Rationale & Contradictions (if any) */}
                {leadingLedger && (
                  <div className="text-xs text-slate-300 bg-slate-900/60 p-3.5 rounded-xl border border-slate-800 leading-relaxed space-y-1">
                    <div>
                      <strong className="text-slate-200">Evidence Assessment:</strong> {leadingLedger.ranking_reason || leadingCandidate?.decision_rationale}
                    </div>
                    {leadingLedger.contradictions && leadingLedger.contradictions.length > 0 && (
                      <div className="text-rose-300 pt-1">
                        <strong>Conflicting Observation:</strong> {leadingLedger.contradictions.join('; ')}
                      </div>
                    )}
                  </div>
                )}

                {/* Observed vs Inferred Distinction Note */}
                <div className="p-3 rounded-xl bg-slate-900/40 border border-slate-800 text-[11px] text-slate-400 leading-relaxed flex items-center gap-2">
                  <Info className="w-4 h-4 text-slate-400 shrink-0" />
                  <span>
                    <strong>Clinical Distinction:</strong> Visible discoloration and lesions are directly observed from your image. Pathogen identification and environmental drivers are inferred hypotheses based on the PJTSAU agricultural knowledge base.
                  </span>
                </div>
              </div>

              {/* --------------------------------------------------------- */}
              {/* SECTION E — Recommended Actions (Prioritized 4 Steps)    */}
              {/* --------------------------------------------------------- */}
              <div className="p-6 rounded-3xl bg-slate-800/50 border border-slate-700/80 space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h4 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                      <Shield className="w-5 h-5 text-emerald-400" />
                      <span>Recommended Actions & Next Steps</span>
                    </h4>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Curated PJTSAU Vyavasaya Panchangam & CIBRC Integrated Pest Management
                    </p>
                  </div>

                  {/* Treatment Status Tag */}
                  <span className={`px-3 py-1 rounded-full text-xs font-bold border self-start sm:self-auto ${
                    recommendations.guidance_permitted
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                      : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                  }`}>
                    {recommendations.guidance_permitted ? 'Standard Treatment Permitted' : 'Chemical Advice Withheld'}
                  </span>
                </div>

                {/* Prioritized 4-Step Action Protocol */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {/* 1. Do Now */}
                  <div className="p-4 rounded-2xl bg-slate-900/80 border border-emerald-500/30 space-y-2">
                    <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 uppercase tracking-wide">
                      <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-[11px] font-black">1</span>
                      <span>Do Now (Immediate Action)</span>
                    </div>
                    <p className="text-xs text-slate-200 leading-relaxed">
                      {recommendations.what_to_do_now?.[0] ||
                       "Inspect surrounding plants immediately. Prune and safely bag heavily spotted lower leaves to halt primary spore spread."}
                    </p>
                  </div>

                  {/* 2. Prevent Spread */}
                  <div className="p-4 rounded-2xl bg-slate-900/80 border border-teal-500/30 space-y-2">
                    <div className="flex items-center gap-2 text-xs font-bold text-teal-400 uppercase tracking-wide">
                      <span className="w-5 h-5 rounded-full bg-teal-500/20 text-teal-400 flex items-center justify-center text-[11px] font-black">2</span>
                      <span>Prevent Spread (Field Management)</span>
                    </div>
                    <p className="text-xs text-slate-200 leading-relaxed">
                      {recommendations.cultural_preventative_measures?.[0] ||
                       recommendations.biological_controls?.[0] ||
                       "Avoid overhead sprinkler irrigation in late afternoon; ensure good row spacing to improve canopy ventilation and reduce leaf wetness."}
                    </p>
                  </div>

                  {/* 3. Monitor */}
                  <div className="p-4 rounded-2xl bg-slate-900/80 border border-sky-500/30 space-y-2">
                    <div className="flex items-center gap-2 text-xs font-bold text-sky-400 uppercase tracking-wide">
                      <span className="w-5 h-5 rounded-full bg-sky-500/20 text-sky-400 flex items-center justify-center text-[11px] font-black">3</span>
                      <span>Monitor (Check Symptoms)</span>
                    </div>
                    <p className="text-xs text-slate-200 leading-relaxed">
                      {recommendations.symptoms_to_check?.[0] ||
                       recommendations.prevention_and_monitoring?.[0] ||
                       "Re-inspect the field every 3 to 4 days. Watch for rapid lesion expansion, dark concentric rings, or yellow haloes on younger leaves."}
                    </p>
                  </div>

                  {/* 4. Seek Expert Advice */}
                  <div className="p-4 rounded-2xl bg-slate-900/80 border border-purple-500/30 space-y-2">
                    <div className="flex items-center gap-2 text-xs font-bold text-purple-400 uppercase tracking-wide">
                      <span className="w-5 h-5 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center text-[11px] font-black">4</span>
                      <span>Seek Expert Help</span>
                    </div>
                    <p className="text-xs text-slate-200 leading-relaxed">
                      {recommendations.when_to_seek_expert_help?.[0] ||
                       "If leaf spotting spreads across more than 20% of your crop or does not improve within a week, contact your local Agricultural Extension Officer (AEO) or PJTSAU Krishi Vigyan Kendra (KVK)."}
                    </p>
                  </div>
                </div>

                {/* Verified Chemical Formulations (Strictly gated) */}
                {recommendations.guidance_permitted && recommendations.verified_chemical_treatments?.length > 0 ? (
                  <div className="p-4 rounded-2xl bg-slate-900/80 border border-cyan-800/60 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="text-xs font-bold text-cyan-300 uppercase tracking-wide flex items-center gap-2">
                        <ShieldAlert className="w-4 h-4 text-cyan-400" />
                        <span>CIBRC Registered Chemical Formulations</span>
                      </div>
                      <span className="text-[11px] text-amber-300 font-semibold">Wear protective gear before spraying</span>
                    </div>

                    <div className="space-y-2">
                      {recommendations.verified_chemical_treatments.slice(0, 2).map((chem, idx) => (
                        <div key={idx} className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                          <div>
                            <div className="font-bold text-white text-sm">
                              {chem.chemical_name || chem.active_ingredient}
                              <span className="ml-2 text-[10px] px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">CIBRC</span>
                            </div>
                            <div className="text-slate-300 mt-0.5">
                              Dosage: <strong className="text-emerald-300">{chem.dosage || chem.dosage_per_liter}</strong>
                            </div>
                          </div>
                          <div className="sm:text-right text-[11px] text-slate-400">
                            Safe Waiting Period (PHI): <strong className="text-amber-300">{chem.safe_waiting_period_days || chem.pre_harvest_interval_days || 14} days</strong>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800 text-xs text-slate-400 leading-relaxed flex items-center gap-2.5">
                    <Info className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>
                      {recommendations.status_banner ||
                       "Chemical recommendations are withheld to prevent crop injury because diagnosis certainty is below safety thresholds or crop confirmation is required."}
                    </span>
                  </div>
                )}
              </div>

              {/* --------------------------------------------------------- */}
              {/* SECTION F — Alternative Diagnoses (Max 2 Plausible)       */}
              {/* --------------------------------------------------------- */}
              {alternativeCandidates.length > 0 && (
                <div className="rounded-2xl border border-slate-800 bg-slate-900/40 overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setShowAlternatives(!showAlternatives)}
                    className="w-full p-4 flex items-center justify-between text-left hover:bg-slate-800/40 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-amber-400" />
                      <span className="text-sm font-bold text-white">Other Possible Causes ({alternativeCandidates.length})</span>
                      <span className="text-xs text-slate-400 hidden sm:inline">— Plausible alternative conditions</span>
                    </div>
                    {showAlternatives ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                  </button>

                  {showAlternatives && (
                    <div className="p-4 pt-0 space-y-3 border-t border-slate-800/80">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3">
                        {alternativeCandidates.map(cand => {
                          const lookAlike = recommendations.look_alikes?.find(l =>
                            typeof l === 'object' && l.disease_name && cand.canonical_name.toLowerCase().includes(l.disease_name.toLowerCase())
                          );
                          const distinguishingNote = lookAlike
                            ? (typeof lookAlike === 'object' ? lookAlike.distinguishing_symptom : lookAlike)
                            : cand.decision_rationale;

                          return (
                            <div key={cand.canonical_disease_id} className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-2 text-xs">
                              <div className="flex items-start justify-between gap-2">
                                <div>
                                  <span className="font-bold text-white text-sm">{cand.canonical_name}</span>
                                  {cand.scientific_name && (
                                    <p className="text-[11px] text-slate-400 italic">{cand.scientific_name}</p>
                                  )}
                                </div>
                                <span className="text-xs font-black text-amber-400">
                                  {(cand.evidence_score * 100).toFixed(0)}%
                                </span>
                              </div>
                              <div className="text-[11px] text-slate-300 bg-slate-950 p-2 rounded-lg border border-slate-800/60 leading-relaxed">
                                <strong className="text-slate-400">Distinguishing note:</strong> {distinguishingNote}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Clarification Diagnostic Questions (if any from engine) */}
              {diagnosisResult.follow_up_questions?.length > 0 && (
                <div className="p-4 rounded-2xl bg-indigo-950/30 border border-indigo-700/40 space-y-3">
                  <div className="flex items-center justify-between">
                    <h5 className="text-xs font-bold text-indigo-300 uppercase tracking-wide flex items-center gap-2">
                      <HelpCircle className="w-4 h-4 text-indigo-400" />
                      <span>Clarification Diagnostic Questions</span>
                    </h5>
                    <span className="text-[10px] text-indigo-200">Helps refine field differential diagnosis</span>
                  </div>
                  <div className="space-y-2">
                    {diagnosisResult.follow_up_questions.map((q) => (
                      <div key={q.question_id} className="p-3 rounded-xl bg-slate-900/60 border border-indigo-900/60 space-y-2 text-xs">
                        <p className="font-semibold text-white">{q.question_text}</p>
                        <div className="flex flex-wrap gap-2 pt-0.5">
                          {q.allowed_options?.map((opt, oIdx) => {
                            const optLabel = opt.label || opt.text || (typeof opt === 'string' ? opt : JSON.stringify(opt));
                            return (
                              <button
                                key={oIdx}
                                type="button"
                                onClick={() => setFollowUpAnswers(prev => ({ ...prev, [q.question_id]: optLabel }))}
                                className={`px-2.5 py-1 rounded-lg border text-xs transition-all ${
                                  followUpAnswers[q.question_id] === optLabel
                                    ? 'bg-indigo-600 border-indigo-400 text-white font-bold'
                                    : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:border-indigo-500'
                                }`}
                              >
                                {optLabel}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* --------------------------------------------------------- */}
              {/* SECTION G — Expandable Technical Details & Trace          */}
              {/* --------------------------------------------------------- */}
              <div className="rounded-2xl border border-slate-800 bg-slate-900/40 overflow-hidden">
                <button
                  type="button"
                  onClick={() => setShowTechnicalDetails(!showTechnicalDetails)}
                  className="w-full p-4 flex items-center justify-between text-left hover:bg-slate-800/40 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <BrainCircuit className="w-4 h-4 text-cyan-400" />
                    <span className="text-sm font-bold text-slate-200">Technical Details & Clinical Trace</span>
                    <span className="text-xs text-slate-500 hidden sm:inline">— Model versions, candidate scoring, and citations</span>
                  </div>
                  {showTechnicalDetails ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                </button>

                {showTechnicalDetails && (
                  <div className="p-5 pt-0 space-y-5 text-xs text-slate-300 border-t border-slate-800">
                    {/* Model & Engine Architecture */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-4">
                      <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                        <span className="text-[10px] text-slate-500 uppercase block">Engine Version</span>
                        <span className="font-mono text-white font-semibold">v{diagnosisResult.diagnosis_engine_version}</span>
                      </div>
                      <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                        <span className="text-[10px] text-slate-500 uppercase block">Neural Model</span>
                        <span className="font-mono text-white font-semibold">{diagnosisResult.model_version}</span>
                      </div>
                      <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                        <span className="text-[10px] text-slate-500 uppercase block">Routing Mode</span>
                        <span className="font-mono text-cyan-300 font-semibold">{diagnosisResult.crop_routing_mode}</span>
                      </div>
                      <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                        <span className="text-[10px] text-slate-500 uppercase block">Calibration</span>
                        <span className="font-mono text-emerald-300 font-semibold">{diagnosisResult.calibration_status}</span>
                      </div>
                    </div>

                    {/* Raw Model Top 5 Predictions */}
                    {diagnosisResult.raw_model_scores && diagnosisResult.raw_model_scores.length > 0 && (
                      <div className="space-y-2">
                        <span className="font-bold text-slate-300 uppercase text-[11px]">Raw Model Predictions (Softmax Top 5)</span>
                        <div className="space-y-1 font-mono text-[11px]">
                          {diagnosisResult.raw_model_scores.slice(0, 5).map((raw, idx) => (
                            <div key={idx} className="flex items-center justify-between p-2 rounded-lg bg-slate-950 border border-slate-800/80">
                              <span className="text-slate-300">{raw.class_label}</span>
                              <span className="text-cyan-400 font-bold">{(raw.score * 100).toFixed(2)}%</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Host / Organ Compatibility & Contradictions */}
                    {leadingLedger && (
                      <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5 text-xs">
                        <span className="font-bold text-slate-300 uppercase text-[11px]">Ledger Diagnostic Trace</span>
                        <p><span className="text-slate-400">Compatibility:</span> <strong className="text-emerald-300">{leadingLedger.organ_compatibility}</strong></p>
                        <p><span className="text-slate-400">Ranking Reason:</span> {leadingLedger.ranking_reason}</p>
                        {leadingLedger.contradictions?.length > 0 && (
                          <p className="text-rose-300"><span className="text-rose-400">Contradictions:</span> {leadingLedger.contradictions.join('; ')}</p>
                        )}
                      </div>
                    )}

                    {/* Citations & Disclaimers */}
                    <div className="space-y-1 text-[11px] text-slate-400 pt-2 border-t border-slate-800">
                      <p className="leading-relaxed">
                        {recommendations.disclaimer || diagnosisResult.limitations_and_disclaimer ||
                          "Recommendations synthesized from PJTSAU Vyavasaya Panchangam and CIBRC crop protection guidelines. Field-verify with local Agricultural Extension Officer (AEO) before applying restricted chemical pesticides."}
                      </p>
                      {diagnosisResult.knowledge_references?.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          <span className="font-semibold text-slate-300">References:</span>
                          {diagnosisResult.knowledge_references.map((ref, idx) => (
                            <span key={idx} className="px-1.5 py-0.5 rounded bg-slate-950 border border-slate-800 text-slate-400">
                              {ref}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* --------------------------------------------------------- */}
              {/* ACTION BUTTONS                                            */}
              {/* --------------------------------------------------------- */}
              <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-slate-800 print:hidden">
                <button
                  type="button"
                  onClick={handleResetForm}
                  className="px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 flex items-center gap-2 transition-all"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Start New Diagnosis</span>
                </button>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => window.print()}
                    className="px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center gap-2 transition-all"
                  >
                    <Printer className="w-4 h-4 text-emerald-400" />
                    <span>Print Diagnostic Report</span>
                  </button>

                  {onResetToQuickScan && (
                    <button
                      type="button"
                      onClick={onResetToQuickScan}
                      className="px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-black flex items-center gap-2 transition-all shadow-lg shadow-emerald-500/20"
                    >
                      <Layers className="w-4 h-4" />
                      <span>Return to Quick Scan</span>
                    </button>
                  )}
                </div>
              </div>

            </div>
          </motion.div>
        );
      })()}
    </div>
  );
}

export default function AdaptiveQuestionnaire(props) {
  return (
    <QuestionnaireErrorBoundary>
      <AdaptiveQuestionnaireInner {...props} />
    </QuestionnaireErrorBoundary>
  );
}
