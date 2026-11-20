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
  { id: 'spices', label: 'Spices', icon: '🌶️' },
  { id: 'other', label: 'Fiber & Others', icon: '🌱' }
];

const CROP_IMAGES = {
  crop_apple: '/crops/apple.jpg?v=3',
  crop_banana: '/crops/banana.jpg?v=3',
  crop_chilli: '/crops/chilli.jpg?v=3',
  crop_corn: '/crops/corn.jpg?v=3',
  crop_cotton: '/crops/cotton.jpg?v=3',
  crop_grape: '/crops/grape.jpg?v=3',
  crop_mango: '/crops/mango.jpg?v=3',
  crop_oil_palm: '/crops/oil_palm.jpg?v=3',
  crop_orange: '/crops/orange.jpg?v=3',
  crop_pepper_bell: '/crops/pepper_bell.jpg?v=3',
  crop_potato: '/crops/potato.jpg?v=3',
  crop_rice: '/crops/rice.jpg?v=3',
  crop_tomato: '/crops/tomato.jpg?v=3',
  crop_turmeric: '/crops/turmeric.jpg?v=3',
  crop_wheat: '/crops/wheat.jpg?v=3',
  crop_unsure: '/crops/crop_unsure.jpg?v=3',
  crop_unsupported: '/crops/crop_unsupported.jpg?v=3',
  crop_non_plant: '/crops/crop_unsure.jpg?v=3',
  apple: '/crops/apple.jpg?v=3',
  banana: '/crops/banana.jpg?v=3',
  chilli: '/crops/chilli.jpg?v=3',
  corn: '/crops/corn.jpg?v=3',
  cotton: '/crops/cotton.jpg?v=3',
  grape: '/crops/grape.jpg?v=3',
  mango: '/crops/mango.jpg?v=3',
  'oil palm': '/crops/oil_palm.jpg?v=3',
  orange: '/crops/orange.jpg?v=3',
  'pepper (bell)': '/crops/pepper_bell.jpg?v=3',
  potato: '/crops/potato.jpg?v=3',
  rice: '/crops/rice.jpg?v=3',
  tomato: '/crops/tomato.jpg?v=3',
  turmeric: '/crops/turmeric.jpg?v=3',
  wheat: '/crops/wheat.jpg?v=3'
};

const getCropImage = (crop) => {
  if (!crop) return '/crops/tomato.jpg?v=3';
  if (CROP_IMAGES[crop.crop_id]) return CROP_IMAGES[crop.crop_id];
  const name = (crop.canonical_name || crop.name || '').toLowerCase().trim();
  if (CROP_IMAGES[name]) return CROP_IMAGES[name];
  if (name.includes('apple')) return '/crops/apple.jpg?v=3';
  if (name.includes('banana')) return '/crops/banana.jpg?v=3';
  if (name.includes('chilli') || name.includes('mirchi')) return '/crops/chilli.jpg?v=3';
  if (name.includes('corn') || name.includes('maize')) return '/crops/corn.jpg?v=3';
  if (name.includes('cotton') || name.includes('prathi')) return '/crops/cotton.jpg?v=3';
  if (name.includes('grape')) return '/crops/grape.jpg?v=3';
  if (name.includes('mango') || name.includes('mamidi')) return '/crops/mango.jpg?v=3';
  if (name.includes('palm')) return '/crops/oil_palm.jpg?v=3';
  if (name.includes('orange') || name.includes('citrus')) return '/crops/orange.jpg?v=3';
  if (name.includes('pepper') || name.includes('capsicum')) return '/crops/pepper_bell.jpg?v=3';
  if (name.includes('potato') || name.includes('bangaladumpa')) return '/crops/potato.jpg?v=3';
  if (name.includes('rice') || name.includes('paddy') || name.includes('vari')) return '/crops/rice.jpg?v=3';
  if (name.includes('tomato')) return '/crops/tomato.jpg?v=3';
  if (name.includes('turmeric') || name.includes('pasupu')) return '/crops/turmeric.jpg?v=3';
  if (name.includes('wheat') || name.includes('godhuma')) return '/crops/wheat.jpg?v=3';
  if (name.includes('unsure') || name.includes('unidentified')) return '/crops/crop_unsure.jpg?v=3';
  return '/crops/crop_unsupported.jpg?v=3';
};

const ORGAN_OPTIONS = [
  { id: 'leaves', label: 'Leaves (Foliage)', labelTe: 'ఆకులు', icon: '🍃', image: '/organs/leaves.jpg?v=3', desc: 'Leaf blade, margins, or veins', descTe: 'ఆకు భాగం, అంచులు లేదా ఈనెలు' },
  { id: 'stems', label: 'Stem / Branches', labelTe: 'కాండం / కొమ్మలు', icon: '🪵', image: '/organs/stems.jpg?v=3', desc: 'Main stem, twigs, or collar region', descTe: 'ప్రధాన కాండం లేదా కొమ్మలు' },
  { id: 'flowers', label: 'Flower / Blossoms', labelTe: 'పూలు / మొగ్గలు', icon: '🌸', image: '/organs/flowers.jpg?v=3', desc: 'Floral buds, petals, or inflorescence', descTe: 'మొగ్గలు, రేకులు లేదా పూలు' },
  { id: 'fruits', label: 'Fruit / Berry', labelTe: 'కాయ / పండు', icon: '🍎', image: '/organs/fruits.jpg?v=3', desc: 'Developing or mature fruit', descTe: 'ఎదిగే లేదా పండిన కాయ' },
  { id: 'pods', label: 'Pod / Capsules', labelTe: 'కాయలు / కంకులు', icon: '🫘', image: '/organs/pods.jpg?v=3', desc: 'Seed pods, ears, cobs or bolls', descTe: 'విత్తన కాయలు లేదా కంకులు' },
  { id: 'roots', label: 'Roots', labelTe: 'వేర్లు / దుంపలు', icon: '🪴', image: '/organs/roots.jpg?v=3', desc: 'Root system or underground tubers', descTe: 'వేరు వ్యవస్థ లేదా భూగర్భ దుంపలు' },
  { id: 'whole_plant', label: 'Whole Plant', labelTe: 'మొత్తం మొక్క', icon: '🌳', image: '/organs/whole_plant.jpg?v=3', desc: 'General collapse, wilting, or stunting', descTe: 'మొక్క మొత్తం వాడిపోవడం' },
  { id: 'unsure', label: 'Not Sure / Other', labelTe: 'ఖచ్చితంగా తెలియదు', icon: '❓', image: '/organs/unsure.jpg?v=3', desc: 'Uncertain of specific plant part', descTe: 'మొక్క భాగం ఖచ్చితంగా తెలియదు' }
];

const SYMPTOM_OPTIONS = [
  { id: 'sym_yellowing', label: 'Yellowing / Chlorosis', labelTe: 'పసుపు రంగు / క్లోరోసిస్', icon: '🟡', image: '/symptoms/sym_yellowing.jpg?v=3', desc: 'Pale yellow leaves/veins', descTe: 'పసుపు మారిన ఆకులు / ఈనెలు' },
  { id: 'sym_spots', label: 'Brown / Black Spots', labelTe: 'గోధుమ / నల్లటి మచ్చలు', icon: '🟤', image: '/symptoms/sym_spots.jpg?v=3', desc: 'Dark circular/angular spots', descTe: 'గుండ్రని లేదా నల్లటి మచ్చలు' },
  { id: 'sym_white_powder', label: 'White Powder', labelTe: 'బూడిద తెగులు (వైట్ పౌడర్)', icon: '❄️', image: '/symptoms/sym_white_powder.jpg?v=3', desc: 'Fungal powder on leaf', descTe: 'ఆకులపై తెల్లటి బూడిద పొడి' },
  { id: 'sym_water_soaked', label: 'Water-soaked Lesions', labelTe: 'నీటి మచ్చలు / పుండ్లు', icon: '💧', image: '/symptoms/sym_water_soaked.jpg?v=3', desc: 'Translucent greasy spots', descTe: 'జిడ్డుగల తడి మచ్చలు' },
  { id: 'sym_wilting', label: 'Wilting / Drooping', labelTe: 'వాడిపోవడం / వాలడం', icon: '🥀', image: '/symptoms/sym_wilting.jpg?v=3', desc: 'Loss of firmness despite moisture', descTe: 'నీరున్నా మొక్క వాలిపోవడం' },
  { id: 'sym_insect_damage', label: 'Holes / Chewed Parts', labelTe: 'రంధ్రాలు / పురుగు తిన్న భాగాలు', icon: '🐛', image: '/symptoms/sym_insect_damage.jpg?v=3', desc: 'Punctures, webbing, frass', descTe: 'ఆకులలో రంధ్రాలు లేదా కొరికిన గుర్తులు' },
  { id: 'sym_rot', label: 'Rot / Soft Tissue', labelTe: 'కుళ్లు తెగులు', icon: '🧫', image: '/symptoms/sym_rot.jpg?v=3', desc: 'Spongy foul-smelling decay', descTe: 'మెత్తబడి కుళ్ళిపోయిన కణజాలం' },
  { id: 'sym_mosaic', label: 'Mosaic / Curling', labelTe: 'ఆకు ముడత / మొజాయిక్', icon: '🌀', image: '/symptoms/sym_mosaic.jpg?v=3', desc: 'Patchy mottle, leaf curl', descTe: 'మచ్చల ముడత, ముడుచుకున్న ఆకులు' },
  { id: 'sym_stunted', label: 'Stunted Growth', labelTe: 'ఎదగకపోవడం (మరుగుజ్జు)', icon: '📉', image: '/symptoms/sym_stunted.jpg?v=3', desc: 'Severe dwarfism', descTe: 'తీవ్రంగా ఎదుగుదల లోపించడం' }
];

const DEFAULT_CANONICAL_CROPS = [
  { crop_id: 'crop_tomato', canonical_name: 'Tomato', supported_organs: ['leaves', 'fruits', 'stems', 'whole_plant'] },
  { crop_id: 'crop_rice', canonical_name: 'Rice', supported_organs: ['leaves', 'stems', 'whole_plant'] },
  { crop_id: 'crop_wheat', canonical_name: 'Wheat', supported_organs: ['leaves', 'stems'] },
  { crop_id: 'crop_corn', canonical_name: 'Corn', supported_organs: ['leaves', 'stems'] },
  { crop_id: 'crop_cotton', canonical_name: 'Cotton', supported_organs: ['leaves', 'stems', 'roots', 'whole_plant'] },
  { crop_id: 'crop_chilli', canonical_name: 'Chilli', supported_organs: ['leaves', 'fruits', 'stems', 'roots', 'whole_plant'] },
  { crop_id: 'crop_banana', canonical_name: 'Banana', supported_organs: ['leaves', 'stems', 'fruits', 'whole_plant'] },
  { crop_id: 'crop_potato', canonical_name: 'Potato', supported_organs: ['leaves', 'stems', 'whole_plant'] },
  { crop_id: 'crop_apple', canonical_name: 'Apple', supported_organs: ['leaves', 'fruits', 'stems'] },
  { crop_id: 'crop_grape', canonical_name: 'Grape', supported_organs: ['leaves', 'fruits', 'stems'] },
  { crop_id: 'crop_mango', canonical_name: 'Mango', supported_organs: ['leaves', 'fruits', 'flowers', 'stems'] },
  { crop_id: 'crop_orange', canonical_name: 'Orange', supported_organs: ['leaves', 'fruits', 'stems', 'whole_plant'] },
  { crop_id: 'crop_pepper_bell', canonical_name: 'Pepper (Bell)', supported_organs: ['leaves', 'fruits', 'stems'] },
  { crop_id: 'crop_turmeric', canonical_name: 'Turmeric', supported_organs: ['leaves', 'stems', 'whole_plant'] },
  { crop_id: 'crop_oil_palm', canonical_name: 'Oil Palm', supported_organs: ['leaves', 'fruits', 'stems'] },
  { crop_id: 'crop_unsure', canonical_name: 'I am not sure / Unidentified Crop', supported_organs: ['leaves', 'stems', 'roots', 'flowers', 'fruits', 'whole_plant', 'unsure'] },
  { crop_id: 'crop_unsupported', canonical_name: 'Other Crop (Not in Catalog)', supported_organs: ['leaves', 'stems', 'roots', 'flowers', 'fruits', 'whole_plant', 'unsure'] }
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

  const [availableCrops, setAvailableCrops] = useState(DEFAULT_CANONICAL_CROPS);
  const [cropSearch, setCropSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedCrop, setSelectedCrop] = useState(null);
  const [cropWarning, setCropWarning] = useState(null);

  const [selectedOrgans, setSelectedOrgans] = useState(['leaves']);
  const [compatibleOrgans, setCompatibleOrgans] = useState(ORGAN_OPTIONS);

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
  const [isCameraActive, setIsCameraActive] = useState(false);
  const videoRef = useRef(null);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } }
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setIsCameraActive(true);
    } catch (err) {
      console.error("Camera access failed:", err);
      setFileError("Unable to access camera device.");
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject;
      const tracks = stream.getTracks();
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
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
    canvas.toBlob(blob => {
      if (blob) {
        const file = new File([blob], `camera_leaf_${Date.now()}.jpg`, { type: 'image/jpeg' });
        setSelectedFile(file);
        setPreviewUrl(URL.createObjectURL(file));
        setFileError(null);
        stopCamera();
      }
    }, 'image/jpeg', 0.95);
  };

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  // 1. Fetch available crops on mount
  useEffect(() => {
    const fetchCrops = async () => {
      try {
        const res = await api.get('/questionnaire/crops');
        if (res.data && res.data.crops) {
          const valid = res.data.crops.filter(
            c => c.crop_id !== 'crop_non_plant' && c.canonical_name?.toLowerCase() !== 'non-plant'
          );
          setAvailableCrops(valid.length > 0 ? valid : DEFAULT_CANONICAL_CROPS);
        }
      } catch (err) {
        console.error("Failed to load canonical crops, using defaults:", err);
        setAvailableCrops(DEFAULT_CANONICAL_CROPS);
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
    setCompatibleOrgans(ORGAN_OPTIONS);
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
    if (c.crop_id === 'crop_non_plant' || c.canonical_name?.toLowerCase() === 'non-plant') {
      return false;
    }
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
    { num: 1, label: "1. Photo", title: "Photo", desc: "Upload a plant image", icon: Camera },
    { num: 2, label: "2. Crop", title: "Crop", desc: "Select or confirm crop species", icon: Sprout },
    { num: 3, label: "3. Plant Part", title: "Plant Part", desc: "Choose the affected plant part", icon: Leaf },
    { num: 4, label: "4. Symptoms", title: "Symptoms", desc: "Describe visible symptoms", icon: Activity },
    { num: 5, label: "5. Context", title: "Context", desc: "Add field & environmental details", icon: FileText },
    { num: 6, label: "6. Review", title: "Review", desc: "Confirm and get diagnosis", icon: ShieldCheck }
  ];

  const STEP_DESCRIPTIONS = {
    1: "Upload plant photo to begin diagnosis.",
    2: "Select or confirm crop species.",
    3: "Choose the affected plant part.",
    4: "Describe visible symptoms.",
    5: "Add field & environmental details.",
    6: "Confirm and get diagnosis."
  };

  return (
    <div id="tour-questionnaire-root" className="w-full text-slate-100">
      {currentStep < 7 ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5 sm:gap-4 items-start w-full">
          {/* LEFT COLUMN: MAIN QUESTIONNAIRE CARD */}
          <div className="lg:col-span-8 flex flex-col gap-3.5">
            <div className="relative overflow-hidden bg-[#061c15]/90 backdrop-blur-2xl rounded-2xl p-4 sm:p-5 border border-emerald-500/30 shadow-[0_8px_32px_rgba(0,0,0,0.5)] space-y-4">
              
              {/* Header: Title + Switch to Vision Scan & Reset */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-emerald-500/20">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-emerald-500/15 border border-emerald-500/40 text-[#2eed92] flex items-center justify-center shrink-0 shadow-[0_0_12px_rgba(46,237,146,0.25)]">
                    <Sprout className="w-5 h-5 text-[#2eed92]" />
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-black text-white tracking-tight">
                      {language === 'te' ? 'రైతు లక్షణాల ప్రశ్నావళి' : 'Adaptive Farmer Symptom Questionnaire'}
                    </h3>
                    <p className="text-[11px] text-slate-300 font-normal">
                      {language === 'te'
                        ? 'ఖచ్చితమైన రోగనిర్ధారణ కోసం 6-దశల మార్గదర్శక విధానాన్ని అనుసరించండి.'
                        : 'Follow the 6-step guided protocol to generate a verified, uncertainty-aware crop diagnosis.'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                  {onResetToQuickScan && (
                    <button
                      type="button"
                      onClick={onResetToQuickScan}
                      className="px-3 py-1.5 rounded-xl text-xs font-bold bg-[#07241a]/90 hover:bg-[#0c3929] text-[#2eed92] border border-emerald-500/40 flex items-center gap-1.5 shadow-sm transition-all"
                    >
                      <Zap className="w-3.5 h-3.5" />
                      <span>{language === 'te' ? 'విజన్ స్కాన్ కు మారండి' : 'Switch to Vision Scan'}</span>
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={handleResetForm}
                    className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-slate-700 flex items-center gap-1.5 transition-all"
                    title="Reset questionnaire"
                  >
                    <RotateCcw className="w-3 h-3 text-slate-300" />
                    <span>{language === 'te' ? 'రీసెట్' : 'Reset'}</span>
                  </button>
                </div>
              </div>

              {/* Connected Horizontal Stepper */}
              <div id="tour-questionnaire-stepper" className="relative pt-0.5 pb-1">
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5 relative z-10">
                  {STEPS_CONFIG.map(s => {
                    const StepIcon = s.icon;
                    const isCurrent = currentStep === s.num;
                    const isCompleted = s.num < currentStep;

                    return (
                      <button
                        key={s.num}
                        type="button"
                        onClick={() => isCompleted && setCurrentStep(s.num)}
                        disabled={!isCompleted && !isCurrent}
                        className={`relative py-1.5 px-2 rounded-xl text-[11px] font-bold transition-all flex items-center justify-center gap-1.5 border overflow-hidden ${
                          isCurrent
                            ? 'bg-[#2eed92] text-slate-950 border-[#2eed92] shadow-[0_0_12px_rgba(46,237,146,0.45)] font-black scale-[1.02]'
                            : isCompleted
                            ? 'bg-[#07241a] text-emerald-300 border-emerald-500/35 hover:border-emerald-400 cursor-pointer'
                            : 'bg-[#051811]/60 text-slate-500 border-slate-800/80 cursor-not-allowed'
                        }`}
                      >
                        <StepIcon className={`w-3.5 h-3.5 shrink-0 ${isCurrent ? 'text-slate-950' : isCompleted ? 'text-[#2eed92]' : 'text-slate-500'}`} />
                        <span className="truncate">{s.label}</span>
                        {isCompleted && (
                          <Check className="w-3 h-3 text-[#2eed92] stroke-[3] hidden md:inline-block shrink-0" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Hidden File Input */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
              />

              {/* STEP 1: Upload Photo */}
              {currentStep === 1 && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4 pt-1">
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5 items-stretch">
                    {/* Left: Upload Box */}
                    <div className="lg:col-span-8 rounded-xl bg-[#051811]/70 border border-emerald-500/25 p-3.5 sm:p-4 flex flex-col justify-between space-y-3">
                      <div className="flex items-start gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-[#2eed92] flex items-center justify-center shrink-0">
                          <Camera className="w-4 h-4" />
                        </div>
                        <div>
                          <h4 className="text-sm sm:text-base font-black text-white">
                            {language === 'te' ? 'దశ 1 / 6: పంట ఆకు ఫోటోను అప్‌లోడ్ చేయండి' : 'Step 1 of 6: Upload a Photo of the Affected Plant'}
                          </h4>
                          <p className="text-[11px] text-slate-300 mt-0.5 leading-relaxed">
                            {language === 'te'
                              ? 'వ్యాధి లక్షణాలు కనిపించే మొక్క భాగం (ఆకులు, కాండం, పండ్లు లేదా వేర్లు) స్పష్టమైన ఫోటో తీయండి.'
                              : 'Upload a clear, focused photo of the crop showing abnormal symptoms. Photos of leaves, stems, fruits, pods, cobs, or roots are welcome.'}
                          </p>
                        </div>
                      </div>

                      {/* Dropzone / Camera / Preview Container */}
                      <div className="relative min-h-[175px] rounded-xl overflow-hidden flex flex-col items-center justify-center">
                        {isCameraActive ? (
                          <div className="relative w-full h-[220px] rounded-xl overflow-hidden bg-black flex flex-col items-center justify-center">
                            <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover rounded-lg" />
                            <div className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-rose-600/90 text-white text-[10px] font-bold flex items-center gap-1 shadow-md">
                              <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                              <span>Live Camera</span>
                            </div>
                            <div className="absolute inset-4 border border-emerald-400/40 rounded-lg pointer-events-none">
                              <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-[#2eed92]" />
                              <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-[#2eed92]" />
                              <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-[#2eed92]" />
                              <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-[#2eed92]" />
                            </div>
                            <div className="absolute bottom-2.5 left-0 right-0 flex items-center justify-center gap-2 z-20">
                              <button
                                type="button"
                                onClick={captureCameraPhoto}
                                className="px-4 py-1.5 rounded-full bg-gradient-to-r from-[#2eed92] to-[#10b981] text-slate-950 font-black text-xs shadow-lg flex items-center gap-1.5"
                              >
                                <Camera className="w-3.5 h-3.5" />
                                <span>Snap Photo</span>
                              </button>
                              <button
                                type="button"
                                onClick={stopCamera}
                                className="px-3 py-1.5 rounded-full bg-black/80 text-white text-xs font-bold border border-slate-700"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : previewUrl ? (
                          <div className="relative w-full rounded-xl overflow-hidden bg-black/80 p-2 flex flex-col items-center justify-center space-y-2 border border-emerald-500/30">
                            <div className="relative max-h-[190px] w-full flex items-center justify-center overflow-hidden rounded-lg bg-[#04100c]">
                              <img src={previewUrl} alt="Preview" className="max-h-[190px] w-auto object-contain rounded" />
                              <div className="absolute top-1 left-1 w-2.5 h-2.5 border-t-2 border-l-2 border-[#2eed92]" />
                              <div className="absolute top-1 right-1 w-2.5 h-2.5 border-t-2 border-r-2 border-[#2eed92]" />
                              <div className="absolute bottom-1 left-1 w-2.5 h-2.5 border-b-2 border-l-2 border-[#2eed92]" />
                              <div className="absolute bottom-1 right-1 w-2.5 h-2.5 border-b-2 border-r-2 border-[#2eed92]" />
                            </div>
                            <div className="flex items-center gap-2 pt-1">
                              <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                className="px-3 py-1 rounded-lg bg-[#07241a] text-slate-200 hover:text-white border border-emerald-500/30 text-xs font-bold transition-colors"
                              >
                                Replace Photo
                              </button>
                              <button
                                type="button"
                                onClick={handleClearImage}
                                className="px-3 py-1 rounded-lg bg-rose-950/70 text-rose-300 hover:text-white border border-rose-800/40 text-xs font-bold transition-colors"
                              >
                                Remove
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div
                            onClick={() => fileInputRef.current?.click()}
                            className="w-full relative border-2 border-dashed border-emerald-500/35 hover:border-[#2eed92] rounded-xl p-5 sm:p-7 text-center cursor-pointer transition-all bg-[#04130d]/80 hover:bg-[#07241a]/40 flex flex-col items-center justify-center gap-2.5"
                          >
                            <div className="w-11 h-11 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-[#2eed92] shadow-[0_0_12px_rgba(46,237,146,0.25)]">
                              <Upload className="w-5 h-5 text-[#2eed92]" />
                            </div>
                            <div className="space-y-0.5">
                              <p className="text-xs sm:text-sm font-bold text-white">
                                {language === 'te' ? 'చిత్రాన్ని ఇక్కడ డ్రాగ్ చేయండి లేదా ఎంచుకోండి' : 'Drag & drop your plant photo here'}
                              </p>
                              <p className="text-[10px] text-slate-400">
                                {language === 'te' ? 'క్లిక్ చేసి ఎంచుకోండి (JPG, PNG, WEBP • Max 15 MB)' : 'or click to browse (JPG, PNG, WEBP • Max 15 MB)'}
                              </p>
                            </div>
                            <div className="flex items-center gap-2 pt-1">
                              <button
                                type="button"
                                onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
                                className="px-3.5 py-1.5 rounded-full bg-gradient-to-r from-[#2eed92] to-[#10b981] hover:from-[#3ff29f] text-slate-950 font-black text-xs shadow-md flex items-center gap-1.5 transition-all"
                              >
                                <ImageIcon className="w-3.5 h-3.5" />
                                <span>{language === 'te' ? 'ఫైళ్లను ఎంచుకోండి' : 'Browse Files'}</span>
                              </button>
                              <button
                                type="button"
                                onClick={(e) => { e.stopPropagation(); startCamera(); }}
                                className="px-3.5 py-1.5 rounded-full bg-[#07241a] hover:bg-[#0c3929] text-slate-200 border border-emerald-500/40 font-bold text-xs flex items-center gap-1.5 transition-all"
                              >
                                <Camera className="w-3.5 h-3.5 text-[#2eed92]" />
                                <span>{language === 'te' ? 'ఫోటో తీయండి' : 'Take Photo'}</span>
                              </button>
                            </div>
                          </div>
                        )}
                      </div>

                      {fileError && (
                        <div className="p-2.5 rounded-xl bg-rose-950/70 border border-rose-500/40 text-xs text-rose-200 flex items-center gap-2">
                          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                          <span>{fileError}</span>
                        </div>
                      )}
                    </div>

                    {/* Right: Upload Guidelines */}
                    <div className="lg:col-span-4 rounded-xl bg-[#051811]/70 border border-emerald-500/25 p-3.5 sm:p-4 flex flex-col justify-between space-y-2.5">
                      <div className="flex items-center gap-1.5 pb-2 border-b border-emerald-500/20 text-xs font-black text-white">
                        <Sparkles className="w-3.5 h-3.5 text-[#2eed92]" />
                        <span>{language === 'te' ? 'ఫోటో మార్గదర్శకాలు' : 'Upload Guidelines'}</span>
                      </div>

                      <div className="space-y-2">
                        {/* Guideline 1 */}
                        <div className="flex items-center gap-2.5 p-2 rounded-lg bg-[#07241a]/60 border border-emerald-500/20">
                          <img
                            src="/organs/leaves.jpg"
                            alt="Clear Leaf"
                            className="w-12 h-12 rounded-lg object-cover flex-shrink-0 border border-emerald-500/40"
                          />
                          <div className="text-[11px] min-w-0">
                            <span className="text-[#2eed92] font-black block truncate">
                              ✓ {language === 'te' ? 'స్పష్టమైన & ఫోకస్డ్' : 'Clear & Focused'}
                            </span>
                            <span className="text-slate-300 text-[10px] block leading-tight truncate">
                              {language === 'te' ? 'ఆకు భాగం స్పష్టంగా కనిపిస్తుంది' : 'Leaf area is clearly visible'}
                            </span>
                          </div>
                        </div>

                        {/* Guideline 2 */}
                        <div className="flex items-center gap-2.5 p-2 rounded-lg bg-[#07241a]/60 border border-rose-500/20">
                          <img
                            src="/organs/leaves.jpg"
                            alt="Blurry Leaf"
                            className="w-12 h-12 rounded-lg object-cover flex-shrink-0 border border-rose-500/40 filter blur-[2px]"
                          />
                          <div className="text-[11px] min-w-0">
                            <span className="text-rose-400 font-black block truncate">
                              ✗ {language === 'te' ? 'మసకగా ఉండకూడదు' : 'Avoid Blurry Images'}
                            </span>
                            <span className="text-slate-300 text-[10px] block leading-tight truncate">
                              {language === 'te' ? 'కెమెరా కదలకుండా ఉంచండి' : 'Keep the photo steady'}
                            </span>
                          </div>
                        </div>

                        {/* Guideline 3 */}
                        <div className="flex items-center gap-2.5 p-2 rounded-lg bg-[#07241a]/60 border border-rose-500/20">
                          <img
                            src="/organs/leaves.jpg"
                            alt="Dark Leaf"
                            className="w-12 h-12 rounded-lg object-cover flex-shrink-0 border border-rose-500/40 filter brightness-40"
                          />
                          <div className="text-[11px] min-w-0">
                            <span className="text-rose-400 font-black block truncate">
                              ✗ {language === 'te' ? 'చీకటిగా ఉండకూడదు' : 'Avoid Poor Lighting'}
                            </span>
                            <span className="text-slate-300 text-[10px] block leading-tight truncate">
                              {language === 'te' ? 'సహజ వెలుతురు వాడండి' : 'Use natural or good light'}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="text-[10px] text-emerald-400/80 pt-1 border-t border-emerald-500/15 flex items-center gap-1">
                        <CheckCircle className="w-3 h-3 text-[#2eed92] shrink-0" />
                        <span>{language === 'te' ? 'మంచి ఫోటో ఖచ్చితత్వాన్ని పెంచుతుంది' : 'Good photos increase diagnosis accuracy'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Step 1 Bottom Navigation */}
                  <div className="flex items-center justify-between pt-3 border-t border-emerald-500/20">
                    <button
                      type="button"
                      disabled
                      className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-slate-800/40 text-slate-600 border border-slate-800 cursor-not-allowed"
                    >
                      ← {language === 'te' ? 'వెనుకకు' : 'Back'}
                    </button>

                    <button
                      type="button"
                      onClick={() => setCurrentStep(2)}
                      className="px-5 py-2 rounded-xl text-xs sm:text-sm font-black bg-gradient-to-r from-[#2eed92] to-[#10b981] hover:from-[#3ff29f] text-slate-950 flex items-center gap-2 shadow-[0_0_12px_rgba(46,237,146,0.35)] transition-all active:scale-95"
                    >
                      <span>{selectedFile ? (language === 'te' ? 'దశ 2 కు కొనసాగండి: పంట ఎంపిక' : 'Continue to Step 2: Select Crop') : (language === 'te' ? 'దాటవేసి దశ 2 కు వెళ్లండి' : 'Skip & Continue to Step 2')}</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              )}

      {/* ========================================================= */}
      {/* STEP 2: Select or Confirm the Crop Species                */}
      {/* ========================================================= */}
      {currentStep === 2 && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-3.5 pt-1">
          {/* Step Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
            <div className="flex items-start gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-[#2eed92] flex items-center justify-center shrink-0">
                <Sprout className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-sm sm:text-base font-black text-white">
                  {language === 'te' ? 'దశ 2 / 6: పంట జాతిని ఎంచుకోండి లేదా నిర్ధారించండి' : 'Step 2 of 6: Select or Confirm the Crop Species'}
                </h4>
                <p className="text-[11px] text-slate-300 mt-0.5 leading-relaxed">
                  {language === 'te' ? 'మా కేటలాగ్ నుండి పంటను ఎంచుకోండి లేదా శోధించండి.' : 'Choose the crop from our catalog or search for it.'}
                </p>
              </div>
            </div>

            {selectedCrop && (
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-emerald-500/15 border border-emerald-500/40 text-xs font-bold text-[#2eed92] self-start sm:self-center shrink-0">
                <span>{getCropMeta(selectedCrop).icon}</span>
                <span>{selectedCrop.canonical_name}</span>
              </div>
            )}
          </div>

          {/* Search Input */}
          <div className="relative">
            <Search className="w-4 h-4 text-emerald-400/70 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder={language === 'te' ? 'పంట పేరుతో శోధించండి (ఉదా. టమాటా, వరి, మిర్చి...)' : 'Search crop (e.g., Tomato, Rice, Maize, Chilli, Cotton)...'}
              value={cropSearch}
              onChange={e => setCropSearch(e.target.value)}
              className="w-full bg-[#051811]/90 border border-emerald-500/25 rounded-xl pl-10 pr-9 py-2 text-xs sm:text-sm text-white placeholder-slate-400 focus:outline-none focus:border-[#2eed92] focus:ring-1 focus:ring-[#2eed92]/30 transition-all"
            />
            {cropSearch && (
              <button
                type="button"
                onClick={() => setCropSearch('')}
                className="absolute right-3 top-2.5 p-0.5 rounded-full text-slate-400 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Category Filter Pills */}
          <div className="flex flex-wrap gap-1.5">
            {CROP_CATEGORIES.map(cat => {
              const isActive = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 border ${
                    isActive
                      ? 'bg-[#2eed92] text-slate-950 border-[#2eed92] shadow-[0_0_10px_rgba(46,237,146,0.35)] font-black'
                      : 'bg-[#07241a]/60 hover:bg-[#0c3929] text-slate-300 border-emerald-500/20'
                  }`}
                >
                  <span className="text-xs">{cat.icon}</span>
                  <span>{cat.label}</span>
                </button>
              );
            })}
          </div>

          {/* 4-Column Crop Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 max-h-[340px] overflow-y-auto pr-1 custom-scrollbar">
            {filteredCrops.length === 0 ? (
              <div className="col-span-full py-8 text-center rounded-xl bg-[#051811]/60 border border-emerald-500/20 text-slate-400">
                <p className="font-semibold text-white text-xs">No matching crops found for "{cropSearch}"</p>
                <p className="text-[11px] text-slate-400 mt-1">Try another search term or clear the filter.</p>
              </div>
            ) : (
              filteredCrops.map(crop => {
                const isSelected = selectedCrop?.crop_id === crop.crop_id;
                const meta = getCropMeta(crop);
                const cropImg = getCropImage(crop);

                return (
                  <div
                    key={crop.crop_id}
                    onClick={() => setSelectedCrop(crop)}
                    className={`relative rounded-xl border p-2 flex flex-col items-center gap-1.5 cursor-pointer transition-all group overflow-hidden ${
                      isSelected
                        ? 'bg-gradient-to-br from-emerald-950/90 to-[#07241a] border-[#2eed92] ring-1 ring-[#2eed92]/50 shadow-[0_0_16px_rgba(46,237,146,0.25)]'
                        : 'bg-[#051811]/70 hover:bg-[#07241a]/90 border-emerald-500/20 hover:border-emerald-500/40'
                    }`}
                  >
                    <div className="relative w-full h-20 sm:h-22 rounded-lg overflow-hidden bg-slate-900 border border-emerald-500/20">
                      <img
                        src={cropImg}
                        alt={crop.canonical_name}
                        className="w-full h-full object-cover transition-transform group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                      
                      {/* Checkbox in top right */}
                      <div className={`absolute top-1.5 right-1.5 w-4 h-4 rounded flex items-center justify-center border transition-all ${
                        isSelected
                          ? 'bg-[#2eed92] border-[#2eed92] text-slate-950 shadow'
                          : 'border-white/50 bg-black/40 backdrop-blur-sm'
                      }`}>
                        {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                      </div>
                    </div>

                    <div className="w-full text-center min-w-0">
                      <span className="font-bold text-xs text-white block truncate group-hover:text-[#2eed92] transition-colors">
                        {crop.canonical_name}
                      </span>
                      <span className="text-[10px] text-emerald-400/80 block truncate">
                        {meta.categoryLabel || 'Crop'}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {cropWarning && (
            <div className="p-3 rounded-xl bg-amber-950/40 border border-amber-500/40 text-[11px] text-amber-300 flex items-center gap-2">
              <AlertTriangle className="w-3.5 h-3.5 shrink-0 text-amber-400" />
              <span>{cropWarning}</span>
            </div>
          )}

          {/* Navigation */}
          <div className="flex items-center justify-between pt-3 border-t border-emerald-500/20">
            <button
              type="button"
              onClick={() => setCurrentStep(1)}
              className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-slate-700 flex items-center gap-1.5 transition-all"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>{language === 'te' ? 'ఫోటో కు వెళ్లండి' : 'Back to Photo'}</span>
            </button>

            <button
              type="button"
              onClick={() => setCurrentStep(3)}
              className="px-5 py-2 rounded-xl text-xs sm:text-sm font-black bg-gradient-to-r from-[#2eed92] to-[#10b981] hover:from-[#3ff29f] text-slate-950 flex items-center gap-2 shadow-[0_0_12px_rgba(46,237,146,0.35)] transition-all active:scale-95"
            >
              <span>{language === 'te' ? 'దశ 3 కు కొనసాగండి: మొక్క భాగం' : 'Continue to Step 3: Plant Part'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      )}

      {/* ========================================================= */}
      {/* STEP 3: Identify the Affected Plant Part(s)               */}
      {/* ========================================================= */}
      {currentStep === 3 && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-3.5 pt-1">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
            <div className="flex items-start gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-[#2eed92] flex items-center justify-center shrink-0">
                <Leaf className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-sm sm:text-base font-black text-white">
                  {language === 'te' ? 'దశ 3 / 6: ప్రభావితమైన మొక్క భాగాలను గుర్తించండి' : 'Step 3 of 6: Identify the Affected Plant Part(s)'}
                </h4>
                <p className="text-[11px] text-slate-300 mt-0.5 leading-relaxed">
                  {language === 'te'
                    ? 'సమస్య సంకేతాలు కనిపించే మొక్క భాగాలను ఎంచుకోండి. బహుళ ఎంపికలు సాధ్యమే.'
                    : 'Select the plant part where you observe signs of the problem. You can choose multiple options.'}
                </p>
              </div>
            </div>

            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-emerald-500/15 border border-emerald-500/40 text-xs font-bold text-[#2eed92] self-start sm:self-center shrink-0">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#2eed92]" />
              <span>{selectedOrgans.length} {language === 'te' ? 'ఎంపిక చేయబడ్డాయి' : 'Selected'}</span>
            </div>
          </div>

          {/* 4-Column Grid (8 visual cards) */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {compatibleOrgans.map(org => {
              const isSelected = selectedOrgans.includes(org.id);

              return (
                <div
                  key={org.id}
                  onClick={() => toggleOrgan(org.id)}
                  className={`relative rounded-xl border p-2 flex flex-col items-center gap-1.5 cursor-pointer transition-all group overflow-hidden ${
                    isSelected
                      ? 'bg-gradient-to-br from-emerald-950/90 to-[#07241a] border-[#2eed92] ring-1 ring-[#2eed92]/50 shadow-[0_0_16px_rgba(46,237,146,0.25)]'
                      : 'bg-[#051811]/70 hover:bg-[#07241a]/90 border-emerald-500/20 hover:border-emerald-500/40'
                  }`}
                >
                  <div className="relative w-full h-20 sm:h-22 rounded-lg overflow-hidden bg-slate-900 border border-emerald-500/20 flex items-center justify-center">
                    {org.image ? (
                      <img
                        src={org.image}
                        alt={org.label}
                        className="w-full h-full object-cover transition-transform group-hover:scale-105"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center bg-[#07241a]/60 text-2xl">
                        <span>{org.icon}</span>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                    {/* Top right checkbox */}
                    <div className={`absolute top-1.5 right-1.5 w-4 h-4 rounded flex items-center justify-center border transition-all ${
                      isSelected
                        ? 'bg-[#2eed92] border-[#2eed92] text-slate-950 shadow'
                        : 'border-white/50 bg-black/40 backdrop-blur-sm'
                    }`}>
                      {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                    </div>
                  </div>

                  <div className="w-full text-center min-w-0">
                    <span className="font-bold text-xs text-white block truncate group-hover:text-[#2eed92] transition-colors">
                      {language === 'te' && org.labelTe ? org.labelTe : org.label}
                    </span>
                    <span className="text-[10px] text-slate-400 block truncate">
                      {language === 'te' && org.descTe ? org.descTe : org.desc}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between pt-3 border-t border-emerald-500/20">
            <button
              type="button"
              onClick={() => setCurrentStep(2)}
              className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-slate-700 flex items-center gap-1.5 transition-all"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>{language === 'te' ? 'పంట కు వెళ్లండి' : 'Back to Crop'}</span>
            </button>

            <button
              type="button"
              onClick={() => setCurrentStep(4)}
              className="px-5 py-2 rounded-xl text-xs sm:text-sm font-black bg-gradient-to-r from-[#2eed92] to-[#10b981] hover:from-[#3ff29f] text-slate-950 flex items-center gap-2 shadow-[0_0_12px_rgba(46,237,146,0.35)] transition-all active:scale-95"
            >
              <span>{language === 'te' ? 'దశ 4 కు కొనసాగండి: లక్షణాలు' : 'Continue to Step 4: Symptoms'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      )}

      {/* ========================================================= */}
      {/* STEP 4: Describe the Observed Symptoms                    */}
      {/* ========================================================= */}
      {currentStep === 4 && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-3.5 pt-1">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
            <div className="flex items-start gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-[#2eed92] flex items-center justify-center shrink-0">
                <Activity className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-sm sm:text-base font-black text-white">
                  {language === 'te' ? 'దశ 4 / 6: గమనించిన లక్షణాలను వివరించండి' : 'Step 4 of 6: Describe the Observed Symptoms'}
                </h4>
                <p className="text-[11px] text-slate-300 mt-0.5 leading-relaxed">
                  {language === 'te' ? 'మొక్కపై కనిపించే అన్ని లక్షణాలను ఎంచుకోండి.' : 'Select all visible symptoms on the affected plant.'}
                </p>
              </div>
            </div>

            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-emerald-500/15 border border-emerald-500/40 text-xs font-bold text-[#2eed92] self-start sm:self-center shrink-0">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#2eed92]" />
              <span>{selectedSymptoms.length} {language === 'te' ? 'ఎంపిక చేయబడ్డాయి' : 'Selected'}</span>
            </div>
          </div>

          {/* 3-Column Grid (9 visual symptom cards) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {SYMPTOM_OPTIONS.map(s => {
              const isChecked = selectedSymptoms.includes(s.id);
              return (
                <div
                  key={s.id}
                  onClick={() => toggleSymptom(s.id)}
                  className={`relative rounded-xl border p-2.5 flex items-center gap-3 cursor-pointer transition-all group overflow-hidden ${
                    isChecked
                      ? 'bg-gradient-to-br from-emerald-950/90 to-[#07241a] border-[#2eed92] ring-1 ring-[#2eed92]/50 shadow-[0_0_16px_rgba(46,237,146,0.25)]'
                      : 'bg-[#051811]/70 hover:bg-[#07241a]/90 border-emerald-500/20 hover:border-emerald-500/40'
                  }`}
                >
                  <img
                    src={s.image || '/samples/tomato_blight.jpg'}
                    alt={s.label}
                    className="w-12 h-12 rounded-lg object-cover flex-shrink-0 border border-emerald-500/20 group-hover:scale-105 transition-transform"
                  />

                  <div className="flex-1 min-w-0 pr-5">
                    <span className="font-bold text-xs text-white block truncate group-hover:text-[#2eed92] transition-colors">
                      {language === 'te' && s.labelTe ? s.labelTe : s.label}
                    </span>
                    <span className="text-[10px] text-slate-300 block truncate leading-tight mt-0.5">
                      {language === 'te' && s.descTe ? s.descTe : s.desc}
                    </span>
                  </div>

                  {/* Top right checkbox */}
                  <div className={`absolute top-2.5 right-2.5 w-4 h-4 rounded flex items-center justify-center border transition-all ${
                    isChecked
                      ? 'bg-[#2eed92] border-[#2eed92] text-slate-950 shadow'
                      : 'border-slate-500/50 bg-slate-900/60'
                  }`}>
                    {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between pt-3 border-t border-emerald-500/20">
            <button
              type="button"
              onClick={() => setCurrentStep(3)}
              className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-slate-700 flex items-center gap-1.5 transition-all"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>{language === 'te' ? 'మొక్క భాగం కు వెళ్లండి' : 'Back to Plant Part'}</span>
            </button>

            <button
              type="button"
              onClick={() => setCurrentStep(5)}
              className="px-5 py-2 rounded-xl text-xs sm:text-sm font-black bg-gradient-to-r from-[#2eed92] to-[#10b981] hover:from-[#3ff29f] text-slate-950 flex items-center gap-2 shadow-[0_0_12px_rgba(46,237,146,0.35)] transition-all active:scale-95"
            >
              <span>{language === 'te' ? 'దశ 5 కు కొనసాగండి: సందర్భం' : 'Continue to Step 5: Context'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      )}

      {/* ========================================================= */}
      {/* STEP 5: Provide Field & Environmental Context              */}
      {/* ========================================================= */}
      {currentStep === 5 && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-3.5 pt-1">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
            <div className="flex items-start gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-[#2eed92] flex items-center justify-center shrink-0">
                <FileText className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-sm sm:text-base font-black text-white">
                  {language === 'te' ? 'దశ 5 / 6: పొలం మరియు పర్యావరణ సందర్భాన్ని అందించండి' : 'Step 5 of 6: Provide Field & Environmental Context'}
                </h4>
                <p className="text-[11px] text-slate-300 mt-0.5 leading-relaxed">
                  {language === 'te'
                    ? 'మరింత ఖచ్చితమైన రోగ నిర్ధారణ కోసం అదనపు పొలం పరిస్థితులను తెలపండి.'
                    : 'Help the AI with additional field conditions for a more accurate diagnosis.'}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setCurrentStep(6)}
              className="text-xs font-bold text-[#2eed92] hover:underline px-2.5 py-1 rounded-lg bg-[#07241a] border border-emerald-500/30 self-start sm:self-center"
            >
              {language === 'te' ? 'దాటవేసి సమీక్షకు వెళ్లండి ➔' : 'Skip to Review ➔'}
            </button>
          </div>

          {/* 4 Context Dropdowns (2x2 Grid) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {/* 1. Location */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-white flex items-center gap-1">
                <MapPin className="w-3 h-3 text-[#2eed92]" />
                <span>1. {language === 'te' ? 'లక్షణాలు ఎక్కడ కనిపిస్తున్నాయి?' : 'Where do symptoms appear?'}</span>
              </label>
              <select
                value={symptomLocation}
                onChange={e => setSymptomLocation(e.target.value)}
                className="w-full bg-[#051811]/90 border border-emerald-500/25 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#2eed92]"
              >
                <option value="loc_whole_field">Across the whole field</option>
                <option value="loc_multiple_plants">Cluster of neighboring plants</option>
                <option value="loc_multiple_parts_single_plant">Several parts of one plant</option>
                <option value="loc_single_part">One leaf or isolated part</option>
                <option value="loc_unsure">Not sure / Unchecked</option>
              </select>
            </div>

            {/* 2. Duration */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-white flex items-center gap-1">
                <Clock className="w-3 h-3 text-[#2eed92]" />
                <span>2. {language === 'te' ? 'మొదటిసారి ఎప్పుడు గమనించారు?' : 'When did you first notice it?'}</span>
              </label>
              <select
                value={symptomDuration}
                onChange={e => setSymptomDuration(e.target.value)}
                className="w-full bg-[#051811]/90 border border-emerald-500/25 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#2eed92]"
              >
                <option value="dur_4_to_7_days">4 to 7 days ago (~1 week)</option>
                <option value="dur_1_to_3_days">Within last 1 to 3 days (acute onset)</option>
                <option value="dur_1_to_2_weeks">1 to 2 weeks ago</option>
                <option value="dur_over_2_weeks">More than 2 weeks ago (chronic progression)</option>
                <option value="dur_unsure">Not sure</option>
              </select>
            </div>

            {/* 3. Spread Speed */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-white flex items-center gap-1">
                <Activity className="w-3 h-3 text-[#2eed92]" />
                <span>3. {language === 'te' ? 'ఎంత వేగంగా వ్యాపిస్తోంది?' : 'How quickly is it spreading?'}</span>
              </label>
              <select
                value={spreadRate}
                onChange={e => setSpreadRate(e.target.value)}
                className="w-full bg-[#051811]/90 border border-emerald-500/25 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#2eed92]"
              >
                <option value="spread_rapid">Rapidly (multiplying daily)</option>
                <option value="spread_slow">Slowly (gradual expansion)</option>
                <option value="spread_none">Not spreading (stationary)</option>
                <option value="spread_unsure">Not sure</option>
              </select>
            </div>

            {/* 4. Growth Stage */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-white flex items-center gap-1">
                <Sprout className="w-3 h-3 text-[#2eed92]" />
                <span>4. {language === 'te' ? 'పంట పెరుగుదల దశ' : 'Crop Growth Stage'}</span>
              </label>
              <select
                value={growthStage}
                onChange={e => setGrowthStage(e.target.value)}
                className="w-full bg-[#051811]/90 border border-emerald-500/25 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#2eed92]"
              >
                <option value="stage_vegetative">Vegetative Growth / Tillering</option>
                <option value="stage_seedling">Seedling / Nursery</option>
                <option value="stage_flowering">Flowering / Blossom</option>
                <option value="stage_fruiting">Fruit / Pod / Grain Filling</option>
                <option value="stage_maturity">Maturity / Ripening</option>
                <option value="stage_unsure">Not sure</option>
              </select>
            </div>
          </div>

          {/* 5. Weather / Field Conditions */}
          <div className="space-y-1.5 pt-1">
            <label className="text-[11px] font-bold text-white flex items-center gap-1">
              <Droplets className="w-3 h-3 text-cyan-400" />
              <span>5. {language === 'te' ? 'వాతావరణం / క్షేత్ర పరిస్థితులు' : 'Weather / Field Conditions (Select applicable)'}</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {[
                { id: 'cond_heavy_rain', label: 'Heavy Rain', icon: '🌧️' },
                { id: 'cond_high_humidity', label: 'High Humidity', icon: '🌫️' },
                { id: 'cond_hot_dry', label: 'Hot & Dry', icon: '☀️' },
                { id: 'cond_waterlogging', label: 'Waterlogging', icon: '🌊' },
                { id: 'cond_normal', label: 'Normal Weather', icon: '⛅' }
              ].map(c => {
                const isChecked = selectedConditions.includes(c.id);
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => toggleCondition(c.id)}
                    className={`p-2 rounded-xl text-xs font-bold border transition-all flex flex-col items-center gap-1 ${
                      isChecked
                        ? 'bg-emerald-500/20 border-[#2eed92] text-[#2eed92] shadow-sm'
                        : 'bg-[#051811]/70 border-emerald-500/20 text-slate-300 hover:border-emerald-500/40'
                    }`}
                  >
                    <span className="text-base">{c.icon}</span>
                    <span className="text-[11px] truncate w-full text-center">{c.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 6. Pests & 7. Treatment */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-white flex items-center gap-1">
                <Bug className="w-3 h-3 text-amber-400" />
                <span>6. {language === 'te' ? 'పురుగులు లేదా కీటకాలు కనిపిస్తున్నాయా?' : 'Are pests or insects visible?'}</span>
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
                    className={`flex-1 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                      visiblePests === p.id
                        ? 'bg-amber-500/25 border-amber-400 text-amber-300 shadow-sm'
                        : 'bg-[#051811]/70 border-emerald-500/20 text-slate-400 hover:text-white'
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-bold text-white flex items-center gap-1">
                <Shield className="w-3 h-3 text-[#2eed92]" />
                <span>7. {language === 'te' ? 'ఏదైనా మందు లేదా చికిత్స చేశారా?' : 'Have you applied any treatment?'}</span>
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
                    className={`flex-1 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                      previousTreatment === t.id
                        ? 'bg-emerald-500/25 border-[#2eed92] text-[#2eed92] shadow-sm'
                        : 'bg-[#051811]/70 border-emerald-500/20 text-slate-400 hover:text-white'
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
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="space-y-1 pt-1">
              <label className="text-[11px] font-semibold text-slate-300">
                {language === 'te' ? 'ఏ మందు వాడారు? (ఫంగిసైడ్/పురుగుల మందు లేదా కషాయం)' : 'What treatment was applied? (Fungicide/insecticide trade name or organic spray)'}
              </label>
              <input
                type="text"
                placeholder="e.g. Mancozeb, Copper Oxychloride, Neem oil, or 'Do not recall name'"
                value={treatmentDetails}
                onChange={e => setTreatmentDetails(e.target.value)}
                className="w-full bg-[#051811]/90 border border-emerald-500/25 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#2eed92]"
              />
            </motion.div>
          )}

          {/* Navigation */}
          <div className="flex items-center justify-between pt-3 border-t border-emerald-500/20">
            <button
              type="button"
              onClick={() => setCurrentStep(4)}
              className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-slate-700 flex items-center gap-1.5 transition-all"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>{language === 'te' ? 'లక్షణాలు కు వెళ్లండి' : 'Back to Symptoms'}</span>
            </button>

            <button
              type="button"
              onClick={() => setCurrentStep(6)}
              className="px-5 py-2 rounded-xl text-xs sm:text-sm font-black bg-gradient-to-r from-[#2eed92] to-[#10b981] hover:from-[#3ff29f] text-slate-950 flex items-center gap-2 shadow-[0_0_12px_rgba(46,237,146,0.35)] transition-all active:scale-95"
            >
              <span>{language === 'te' ? 'దశ 6 కు కొనసాగండి: సమీక్ష' : 'Continue to Step 6: Review'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      )}

      {/* ========================================================= */}
      {/* STEP 6: Review Your Inputs                                */}
      {/* ========================================================= */}
      {currentStep === 6 && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-3.5 pt-1">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
            <div className="flex items-start gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-[#2eed92] flex items-center justify-center shrink-0">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-sm sm:text-base font-black text-white">
                  {language === 'te' ? 'దశ 6 / 6: మీ వివరాలను సమీక్షించండి' : 'Step 6 of 6: Review Your Inputs'}
                </h4>
                <p className="text-[11px] text-slate-300 mt-0.5 leading-relaxed">
                  {language === 'te'
                    ? 'రోగనిర్ధారణను రూపొందించే ముందు అందించిన వివరాలను ధృవీకరించండి.'
                    : 'Verify the details you provided before generating the diagnosis.'}
                </p>
              </div>
            </div>
          </div>

          {/* Structured Review Rows */}
          <div className="space-y-2 rounded-xl bg-[#051811]/70 border border-emerald-500/25 p-3">
            {/* 1. Uploaded Photo */}
            <div className="flex items-center justify-between p-2 rounded-lg bg-[#07241a]/60 border border-emerald-500/20">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-[#2eed92] flex items-center justify-center shrink-0">
                  <Camera className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs font-bold text-white block">{language === 'te' ? 'అప్‌లోడ్ చేసిన ఫోటో' : 'Uploaded Photo'}</span>
                  <span className="text-[11px] text-slate-400 block truncate max-w-[200px] sm:max-w-xs">
                    {selectedFile ? selectedFile.name : (language === 'te' ? 'ఫోటో లేదు (ప్రశ్నావళి ఆధారిత)' : 'No photo uploaded (Questionnaire Mode)')}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {previewUrl && (
                  <img src={previewUrl} alt="Thumbnail" className="w-9 h-9 rounded-lg object-cover border border-emerald-500/40" />
                )}
                <button
                  type="button"
                  onClick={() => setCurrentStep(1)}
                  className="px-2.5 py-1 rounded-lg text-xs font-bold text-[#2eed92] hover:bg-emerald-500/20 transition-colors"
                >
                  {language === 'te' ? 'సవరించు' : 'Edit'}
                </button>
              </div>
            </div>

            {/* 2. Selected Crop */}
            <div className="flex items-center justify-between p-2 rounded-lg bg-[#07241a]/60 border border-emerald-500/20">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-[#2eed92] flex items-center justify-center shrink-0 text-base">
                  {selectedCrop ? getCropMeta(selectedCrop).icon : '🌱'}
                </div>
                <div>
                  <span className="text-xs font-bold text-white block">{language === 'te' ? 'ఎంచుకున్న పంట' : 'Selected Crop'}</span>
                  <span className="text-[11px] text-emerald-300 font-semibold block">
                    {selectedCrop?.canonical_name || (language === 'te' ? 'గుర్తించబడలేదు' : 'Not Selected')}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setCurrentStep(2)}
                className="px-2.5 py-1 rounded-lg text-xs font-bold text-[#2eed92] hover:bg-emerald-500/20 transition-colors"
              >
                {language === 'te' ? 'సవరించు' : 'Edit'}
              </button>
            </div>

            {/* 3. Affected Plant Parts */}
            <div className="flex items-center justify-between p-2 rounded-lg bg-[#07241a]/60 border border-emerald-500/20">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-[#2eed92] flex items-center justify-center shrink-0">
                  <Leaf className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs font-bold text-white block">{language === 'te' ? 'ప్రభావిత మొక్క భాగాలు' : 'Affected Plant Part(s)'}</span>
                  <div className="flex flex-wrap gap-1 mt-0.5">
                    {selectedOrgans.map(orgId => {
                      const orgObj = ORGAN_OPTIONS.find(o => o.id === orgId);
                      return (
                        <span key={orgId} className="px-2 py-0.2 rounded text-[10px] font-bold bg-emerald-500/20 text-[#2eed92] border border-emerald-500/40">
                          {orgObj?.label || orgId}
                        </span>
                      );
                    })}
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setCurrentStep(3)}
                className="px-2.5 py-1 rounded-lg text-xs font-bold text-[#2eed92] hover:bg-emerald-500/20 transition-colors"
              >
                {language === 'te' ? 'సవరించు' : 'Edit'}
              </button>
            </div>

            {/* 4. Observed Symptoms */}
            <div className="flex items-center justify-between p-2 rounded-lg bg-[#07241a]/60 border border-emerald-500/20">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-[#2eed92] flex items-center justify-center shrink-0">
                  <Activity className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs font-bold text-white block">{language === 'te' ? 'గమనించిన లక్షణాలు' : 'Observed Symptoms'}</span>
                  <div className="flex flex-wrap gap-1 mt-0.5">
                    {selectedSymptoms.length > 0 ? (
                      selectedSymptoms.map(symId => {
                        const symObj = SYMPTOM_OPTIONS.find(s => s.id === symId);
                        return (
                          <span key={symId} className="px-2 py-0.2 rounded text-[10px] font-semibold bg-emerald-950/80 text-emerald-300 border border-emerald-700/60">
                            {(language === 'te' && symObj?.labelTe) ? symObj.labelTe : (symObj?.label || symId.replace(/^sym_/, ''))}
                          </span>
                        );
                      })
                    ) : (
                      <span className="text-[11px] text-slate-400 italic">None selected</span>
                    )}
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setCurrentStep(4)}
                className="px-2.5 py-1 rounded-lg text-xs font-bold text-[#2eed92] hover:bg-emerald-500/20 transition-colors"
              >
                {language === 'te' ? 'సవరించు' : 'Edit'}
              </button>
            </div>

            {/* 5. Field Context */}
            <div className="flex items-center justify-between p-2 rounded-lg bg-[#07241a]/60 border border-emerald-500/20">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-[#2eed92] flex items-center justify-center shrink-0">
                  <FileText className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs font-bold text-white block">{language === 'te' ? 'పొలం & వాతావరణ సందర్భం' : 'Field Context'}</span>
                  <p className="text-[11px] text-slate-300 mt-0.5">
                    {selectedConditions.length > 0 ? selectedConditions.map(c => c.replace('cond_', '').replace(/_/g, ' ')).join(', ') : 'Normal conditions'}, Spread: {spreadRate.replace('spread_', '')}, Stage: {growthStage.replace('stage_', '')}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setCurrentStep(5)}
                className="px-2.5 py-1 rounded-lg text-xs font-bold text-[#2eed92] hover:bg-emerald-500/20 transition-colors"
              >
                {language === 'te' ? 'సవరించు' : 'Edit'}
              </button>
            </div>
          </div>

          {submitError && (
            <div className="p-3 rounded-xl bg-red-950/40 border border-red-500/40 text-xs text-red-300 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
              <span>{submitError}</span>
            </div>
          )}

          {/* Navigation */}
          <div className="flex items-center justify-between pt-3 border-t border-emerald-500/20">
            <button
              type="button"
              onClick={() => setCurrentStep(5)}
              disabled={submitting}
              className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-slate-700 flex items-center gap-1.5 transition-all disabled:opacity-50"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>{language === 'te' ? 'సందర్భం కు వెళ్లండి' : 'Back to Context'}</span>
            </button>

            <button
              type="button"
              onClick={handleSubmitEvidence}
              disabled={submitting}
              className="px-6 py-2.5 rounded-xl text-xs sm:text-sm font-black bg-gradient-to-r from-[#2eed92] via-[#10b981] to-teal-400 hover:from-[#3ff29f] hover:to-teal-300 text-slate-950 flex items-center gap-2 shadow-[0_0_16px_rgba(46,237,146,0.4)] transition-all active:scale-95 disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                  <span>{language === 'te' ? 'విశ్లేషిస్తోంది...' : 'Generating Diagnosis Report...'}</span>
                </>
              ) : (
                <>
                  <span>{language === 'te' ? 'రోగనిర్ధారణ నివేదికను రూపొందించండి' : 'Generate Diagnosis Report'}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </motion.div>
      )}

            </div>
          </div>

          {/* RIGHT COLUMN: QUESTIONNAIRE PROGRESS SIDEBAR */}
          <div className="lg:col-span-4 flex flex-col gap-3.5">
            <div className="relative overflow-hidden bg-[#061c15]/90 backdrop-blur-2xl rounded-2xl p-4 sm:p-5 border border-emerald-500/30 shadow-[0_8px_32px_rgba(0,0,0,0.5)] space-y-4">
              
              {/* Sidebar Header */}
              <div className="flex items-center gap-2 pb-3 border-b border-emerald-500/20">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-[#2eed92] flex items-center justify-center shrink-0">
                  <Activity className="w-4 h-4" />
                </div>
                <h4 className="text-sm font-black text-white">
                  {language === 'te' ? 'ప్రశ్నావళి పురోగతి' : 'Questionnaire Progress'}
                </h4>
              </div>

              {/* Circular Gauge + Step Description */}
              <div className="flex items-center gap-4 p-3 rounded-xl bg-[#051811]/70 border border-emerald-500/20">
                {/* Circular Gauge */}
                {(() => {
                  const pct = currentStep === 1 ? 0 : currentStep === 2 ? 20 : currentStep === 3 ? 40 : currentStep === 4 ? 60 : currentStep === 5 ? 80 : 100;
                  const radius = 24;
                  const circumference = 2 * Math.PI * radius;
                  const strokeDashoffset = circumference - (pct / 100) * circumference;

                  return (
                    <div className="relative w-16 h-16 shrink-0 flex items-center justify-center">
                      <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 60 60">
                        {/* Background track */}
                        <circle
                          cx="30"
                          cy="30"
                          r={radius}
                          stroke="#07241a"
                          strokeWidth="5"
                          fill="none"
                        />
                        {/* Animated progress stroke */}
                        <circle
                          cx="30"
                          cy="30"
                          r={radius}
                          stroke="#2eed92"
                          strokeWidth="5"
                          fill="none"
                          strokeDasharray={circumference}
                          strokeDashoffset={strokeDashoffset}
                          strokeLinecap="round"
                          className="transition-all duration-500 ease-out"
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center text-xs font-black text-white">
                        {pct}%
                      </div>
                    </div>
                  );
                })()}

                <div className="min-w-0">
                  <span className="text-xs font-black text-[#2eed92] block">
                    {language === 'te' ? `దశ ${currentStep} / 6` : `Step ${currentStep} of 6`}
                  </span>
                  <p className="text-[11px] text-slate-300 mt-0.5 leading-snug">
                    {STEP_DESCRIPTIONS[currentStep]}
                  </p>
                </div>
              </div>

              {/* Vertical Steps Checklist */}
              <div className="space-y-1.5">
                {STEPS_CONFIG.map(s => {
                  const isCurrent = currentStep === s.num;
                  const isCompleted = s.num < currentStep;

                  return (
                    <button
                      key={s.num}
                      type="button"
                      onClick={() => isCompleted && setCurrentStep(s.num)}
                      disabled={!isCompleted && !isCurrent}
                      className={`w-full text-left p-2.5 rounded-xl border transition-all flex items-center gap-3 ${
                        isCurrent
                          ? 'bg-gradient-to-r from-emerald-500/25 to-teal-500/10 border-[#2eed92] text-white shadow-sm ring-1 ring-[#2eed92]/30'
                          : isCompleted
                          ? 'bg-[#07241a]/40 border-emerald-500/20 text-emerald-300 hover:border-emerald-400 cursor-pointer'
                          : 'bg-[#051811]/30 border-slate-800/80 text-slate-500 cursor-not-allowed'
                      }`}
                    >
                      {/* Step Number or Check */}
                      <div className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-black shrink-0 ${
                        isCurrent
                          ? 'bg-[#2eed92] text-slate-950 shadow-[0_0_8px_rgba(46,237,146,0.5)]'
                          : isCompleted
                          ? 'bg-emerald-500/20 text-[#2eed92] border border-emerald-500/40'
                          : 'bg-slate-800 text-slate-500'
                      }`}>
                        {isCompleted ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : s.num}
                      </div>

                      <div className="flex-1 min-w-0">
                        <span className={`text-xs font-bold block truncate ${isCurrent ? 'text-white' : isCompleted ? 'text-emerald-300' : 'text-slate-400'}`}>
                          {s.title}
                        </span>
                        <span className="text-[10px] text-slate-400 block truncate">
                          {s.desc}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>

            </div>
          </div>
        </div>
      ) : currentStep === 7 && diagnosisResult ? (
        (() => {
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
                            <span>{(language === 'te' && symObj?.labelTe) ? symObj.labelTe : (symObj?.label || symId.replace('sym_', '').replace(/_/g, ' '))}</span>
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
      })()
    ) : null}
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
