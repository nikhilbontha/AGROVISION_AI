/**
 * Comprehensive Telugu Agricultural & Pathological Translation Library
 * Calibrated against PJTSAU (Professor Jayashankar Telangana State Agricultural University)
 * and ICAR Telangana Agricultural Extension Handbooks.
 */

export const TELUGU_CROPS = {
  'Tomato': 'టమాటా',
  'Rice': 'వరి',
  'Wheat': 'గోధుమ',
  'Corn': 'మొక్కజొన్న',
  'Chilli': 'మిరప',
  'Cotton': 'పత్తి',
  'Potato': 'బంగాళాదుంప',
  'Apple': 'యాపిల్',
  'Banana': 'అరటి',
  'Grape': 'ద్రాక్ష',
  'Orange': 'సంత్రా',
  'Citrus': 'సంత్రా / నిమ్మ',
  'Mango': 'మామిడి',
  'Pepper': 'మిరప',
  'Blueberry': 'బ్లూబెర్రీ',
  'Cherry': 'చెర్రీ',
  'Peach': 'పీచ్',
  'Raspberry': 'రాస్ప్‌బెర్రీ',
  'Soybean': 'సోయాబీన్',
  'Squash': 'గుమ్మడి',
  'Strawberry': 'స్ట్రాబెర్రీ',
  'Turmeric': 'పసుపు',
  'Oil Palm': 'పామాయిల్',
  'Auto-Detect': 'ఆటో-డిటెక్ట్'
};

export const TELUGU_CATEGORIES = {
  'Water Mold / Oomycete': 'నీటి బూజు / ఊమైసీట్ (Oomycete)',
  'Fungal Pathogen': 'శిలీంధ్ర తెగులు (Fungal Pathogen)',
  'Fungal / Oomycete Pathogen': 'శిలీంధ్ర / ఊమైసీట్ తెగులు',
  'Bacterial Pathogen': 'బాక్టీరియల్ తెగులు (Bacterial Pathogen)',
  'Bacterial Infection': 'బాక్టీరియల్ సంక్రమణ (Bacterial Infection)',
  'Viral Pathogen': 'వైరల్ తెగులు (Viral Pathogen)',
  'Healthy Foliage': 'ఆరోగ్యవంతమైన ఆకు (Healthy Foliage)',
  'Healthy State': 'ఆరోగ్యవంతమైన పంట',
  'Agronomic Condition': 'వ్యవసాయ పరిస్థితి',
  'Foliar Diagnostic': 'ఆకు వ్యాధి నిర్ధారణ'
};

export const TELUGU_SEVERITIES = {
  'High': 'అధిక తీవ్రత',
  'Critical': 'అత్యంత తీవ్రం',
  'Medium': 'మధ్యస్థ తీవ్రత',
  'Moderate': 'మధ్యస్థ తీవ్రత',
  'Low': 'తక్కువ తీవ్రత',
  'Normal': 'సాధారణం',
  'None': 'తీవ్రత లేదు',
  'Healthy': 'ఆరోగ్యకరం'
};

export const TELUGU_DISEASE_TITLES = {
  // Tomato
  'Tomato Late Blight': 'టమాటా లేట్ బ్లైట్ తెగులు (Late Blight)',
  'Tomato Early Blight': 'టమాటా ఆర్లీ బ్లైట్ తెగులు (Early Blight)',
  'Tomato Yellow Leaf Curl Virus': 'టమాటా ఆకు ముడత వైరస్ (Leaf Curl Virus)',
  'Tomato Bacterial Spot': 'టమాటా బాక్టీరియల్ మచ్చ తెగులు (Bacterial Spot)',
  'Tomato Septoria Leaf Spot': 'టమాటా సెప్టోరియా ఆకు మచ్చ తెగులు (Septoria Leaf Spot)',
  'Tomato Spider Mites': 'టమాటా ఎర్ర నల్లి / మైట్స్ (Spider Mites)',
  'Tomato Spider Mites Two-spotted spider mite': 'టమాటా ఎర్ర నల్లి / మైట్స్ (Spider Mites)',
  'Tomato Target Spot': 'టమాటా టార్గెట్ స్పాట్ తెగులు (Target Spot)',
  'Tomato Leaf Mold': 'టమాటా ఆకు బూజు తెగులు (Leaf Mold)',
  'Tomato Mosaic Virus': 'టమాటా మొజాయిక్ వైరస్ (Mosaic Virus)',
  'Tomato Healthy': 'టమాటా పంట ఆరోగ్యంగా ఉంది (Healthy)',
  'Tomato healthy': 'టమాటా పంట ఆరోగ్యంగా ఉంది (Healthy)',

  // Wheat
  'Wheat Stripe Rust': 'గోధుమ పసుపు కుంకుమ తెగులు (Stripe Rust)',
  'Wheat Leaf Rust': 'గోధుమ ఆకు కుంకుమ తెగులు (Leaf Rust)',
  'Wheat Powdery Mildew': 'గోధుమ బూడిద తెగులు (Powdery Mildew)',
  'Wheat Healthy': 'గోధుమ పంట ఆరోగ్యంగా ఉంది (Healthy)',
  'Wheat healthy': 'గోధుమ పంట ఆరోగ్యంగా ఉంది (Healthy)',

  // Rice
  'Rice Blast': 'వరి అగ్గి / బ్లాస్ట్ తెగులు (Rice Blast)',
  'Rice Blast / Blight': 'వరి అగ్గి తెగులు / బ్లాస్ట్ (Rice Blast)',
  'Rice Bacterial Leaf Blight': 'వరి బాక్టీరియల్ ఎండ తెగులు (Bacterial Leaf Blight)',
  'Rice Healthy': 'వరి పంట ఆరోగ్యంగా ఉంది (Healthy)',
  'Rice healthy': 'వరి పంట ఆరోగ్యంగా ఉంది (Healthy)',

  // Corn
  'Corn Common Rust': 'మొక్కజొన్న కుంకుమ తెగులు (Common Rust)',
  'Corn Northern Leaf Blight': 'మొక్కజొన్న ఉత్తర ఆకు ఎండ తెగులు (Northern Leaf Blight)',
  'Corn Cercospora Gray Leaf Spot': 'మొక్కజొన్న బూడిద రంగు మచ్చ తెగులు (Gray Leaf Spot)',
  'Corn Cercospora leaf spot Gray leaf spot': 'మొక్కజొన్న బూడిద రంగు మచ్చ తెగులు (Gray Leaf Spot)',
  'Corn Ear Damage': 'మొక్కజొన్న కంకి తెగులు (Corn Ear Damage)',
  'Corn Healthy': 'మొక్కజొన్న పంట ఆరోగ్యంగా ఉంది (Healthy)',
  'Corn healthy': 'మొక్కజొన్న పంట ఆరోగ్యంగా ఉంది (Healthy)',

  // Potato
  'Potato Late Blight': 'బంగాళాదుంప లేట్ బ్లైట్ తెగులు (Late Blight)',
  'Potato Early Blight': 'బంగాళాదుంప ఆర్లీ బ్లైట్ తెగులు (Early Blight)',
  'Potato Healthy': 'బంగాళాదుంప పంట ఆరోగ్యంగా ఉంది (Healthy)',
  'Potato healthy': 'బంగాళాదుంప పంట ఆరోగ్యంగా ఉంది (Healthy)',

  // Apple
  'Apple Apple Scab': 'యాపిల్ స్కాబ్ తెగులు (Apple Scab)',
  'Apple Scab': 'యాపిల్ స్కాబ్ తెగులు (Apple Scab)',
  'Apple Black Rot': 'యాపిల్ నల్ల కుళ్ళు తెగులు (Black Rot)',
  'Apple Cedar Apple Rust': 'యాపిల్ రస్ట్ తెగులు (Cedar Rust)',
  'Apple Healthy': 'యాపిల్ ఆరోగ్యంగా ఉంది (Healthy)',
  'Apple healthy': 'యాపిల్ ఆరోగ్యంగా ఉంది (Healthy)',

  // Grape
  'Grape Black Rot': 'ద్రాక్ష నల్ల కుళ్ళు తెగులు (Black Rot)',
  'Grape Esca (Black Measles)': 'ద్రాక్ష ఎస్కా మచ్చ తెగులు (Black Measles)',
  'Grape Leaf Blight (Isariopsis Leaf Spot)': 'ద్రాక్ష ఆకు మచ్చ తెగులు (Leaf Blight)',
  'Grape Leaf Blight (Isariopsis Spot)': 'ద్రాక్ష ఆకు మచ్చ తెగులు (Leaf Blight)',
  'Grape Healthy': 'ద్రాక్ష ఆరోగ్యంగా ఉంది (Healthy)',
  'Grape healthy': 'ద్రాక్ష ఆరోగ్యంగా ఉంది (Healthy)',

  // Cotton
  'Cotton Bacterial Blight': 'పత్తి బాక్టీరియల్ ఎండ తెగులు (Bacterial Blight)',
  'Cotton Healthy': 'పత్తి ఆరోగ్యంగా ఉంది (Healthy)',
  'Cotton healthy': 'పత్తి ఆరోగ్యంగా ఉంది (Healthy)',

  // Chilli / Pepper
  'Chilli Leaf Curl Virus': 'మిరప ఆకు ముడత తెగులు (Leaf Curl)',
  'Chilli Bacterial Spot': 'మిరప బాక్టీరియల్ మచ్చ తెగులు (Bacterial Spot)',
  'Pepper Bacterial Spot': 'మిరప బాక్టీరియల్ మచ్చ తెగులు (Bacterial Spot)',
  'Pepper Healthy': 'మిరప ఆరోగ్యంగా ఉంది (Healthy)',
  'Pepper healthy': 'మిరప ఆరోగ్యంగా ఉంది (Healthy)',

  // Others
  'Orange Citrus Greening': 'సంత్రా గ్రీనింగ్ వ్యాధి (Citrus Greening)',
  'Strawberry Leaf Scorch': 'స్ట్రాబెర్రీ ఆకు ఎండ తెగులు (Leaf Scorch)',
  'Strawberry Healthy': 'స్ట్రాబెర్రీ ఆరోగ్యంగా ఉంది (Healthy)',
  'Strawberry healthy': 'స్ట్రాబెర్రీ ఆరోగ్యంగా ఉంది (Healthy)'
};

export const TELUGU_KNOWLEDGE_BASE = {
  'tomato late blight': {
    title: 'టమాటా లేట్ బ్లైట్ తెగులు (Tomato Late Blight)',
    organic: 'బోర్డో మిశ్రమం (1%) లేదా కాపర్ ఆక్సీక్లోరైడ్ 3 గ్రా/లీటర్ నీటిలో కలిపి పిచికారీ చేయండి. తీవ్రంగా తెగులు సోకిన మొక్కలను మరియు కుళ్ళిన ఆకులను వెంటనే తొలగించి నాశనం చేయండి.',
    chemical: 'మెటలాక్సిల్ 8% + మాంకోజెబ్ 64% WP @ 2.5 గ్రా/లీ లేదా డైమెథోమార్ఫ్ 50% WP @ 1 గ్రా/లీటర్ నీటిలో కలిపి పిచికారీ చేయండి. అవసరమైతే 10 రోజుల తర్వాత మళ్లీ పిచికారీ చేయండి.',
    precautions: 'ఆకులు త్వరగా ఆరిపోయేలా మొక్కల మధ్య తగిన దూరం ఉంచండి. పొలంలో నీరు నిల్వ ఉండకుండా చూడండి మరియు పొలం గట్లపై కలుపు మొక్కలను తొలగించండి. నేల మల్చింగ్ పాటించండి.',
    exact_cause: 'చల్లని, అధిక తేమ (85-100%) మరియు పొగమంచుతో కూడిన వాతావరణంలో గాలి మరియు వర్షపు జల్లుల ద్వారా ఫైటోఫ్తోరా ఇన్ఫెస్టాన్స్ (Phytophthora infestans) ఊమైసీట్ బీజాలు వేగంగా వ్యాపిస్తాయి.',
    symptoms: [
      'ఆకులు మరియు కాండంపై పెద్ద, క్రమరహిత ముదురు గోధుమ రంగు తడి మచ్చలు',
      'తేమతో కూడిన వాతావరణంలో సోకిన ఆకుల అడుగుభాగంలో సున్నితమైన తెల్లటి బూజు లాంటి శిలీంధ్ర పెరుగుదల',
      'పచ్చి టమాటాలపై గట్టి, గోధుమ రంగు, జిడ్డుగా కనిపించే మచ్చలు',
      'మొత్తం టమాటా తీగలు త్వరగా కుళ్ళిపోవడం మరియు నేలకొరగడం'
    ],
    plan_14_day: {
      day_1_2: 'ప్రారంభ తనిఖీ & పరిశుభ్రత: తెగులు సోకిన భాగాలను గుర్తించి, తీవ్రంగా పాడైన మొక్కలను వేరుచేసి, ఎండిన ఆకులను కత్తిరించండి.',
      day_3_5: 'లక్ష్యిత పిచికారీ: సిఫార్సు చేసిన కాపర్ ఆక్సీక్లోరైడ్ లేదా మెటలాక్సిల్ + మాంకోజెబ్ మందును రక్షణ దుస్తులు ధరించి పిచికారీ చేయండి.',
      day_6_8: 'మధ్యంతర పర్యవేక్షణ: కొత్త బీజాంశాల కోసం ఆకుల అడుగుభాగాన్ని తనిఖీ చేయండి. పైనుండి నీరు పోయడం నివారించండి.',
      day_9_11: 'ఫాలో-అప్ పరిశీలన: మచ్చల తగ్గుదలను అంచనా వేయండి. లక్షణాలు కొనసాగితే రెండవ స్పాట్ స్ప్రే సిద్ధం చేయండి.',
      day_12_14: 'చివరి సమీక్ష: పంట మొత్తం కోలుకున్నట్లు నిర్ధారించడానికి సమగ్ర తనిఖీ నిర్వహించండి.'
    }
  },

  'wheat stripe rust': {
    title: 'గోధుమ పసుపు కుంకుమ తెగులు (Wheat Stripe Rust)',
    organic: 'వేప నూనె (5 మి.లీ/లీటర్) లేదా ట్రైకోడెర్మా హార్జియానమ్ జీవ శిలీంధ్ర నాశినిని మొదటి లక్షణాలు కనిపించగానే పిచికారీ చేయండి.',
    chemical: 'ప్రొపికోనజోల్ 25% EC @ 1 మి.లీ/లీటర్ లేదా టెబుకొనజోల్ 25.9% EC @ 1.5 మి.లీ/లీటర్ నీటిలో కలిపి పిచికారీ చేయండి.',
    precautions: 'తుప్పు తెగులును తట్టుకునే రకాలను నాటండి. అధిక నత్రజని ఎరువుల వాడకాన్ని తగ్గించండి, ఇది ఆకులపై తెగులు తీవ్రతను పెంచుతుంది.',
    exact_cause: 'చల్లని ఉష్ణోగ్రతలు (10°C - 15°C) మరియు గాలిలో అధిక తేమ ఉన్నప్పుడు గాలి ద్వారా వ్యాపించే యురిడినియోస్పోర్స్ అనే శిలీంధ్ర బీజాల వల్ల వ్యాపిస్తుంది.',
    symptoms: [
      'ఆకులపై ఈనెల వెంబడి పొడవైన పసుపు లేదా నారింజ రంగు చారల బొబ్బలు',
      'చారల చుట్టూ ఆకులు పసుపు రంగులోకి మారడం',
      'సోకిన గోధుమ ఆకులు త్వరగా ఎండిపోవడం మరియు రాలిపోవడం',
      'కంకులు బలహీనపడటం మరియు గింజలు సరిగ్గా పాలుపోయకపోవడం'
    ],
    plan_14_day: {
      day_1_2: 'పొలంలో పసుపు చారలు ఉన్న ప్రాంతాలను గుర్తించి గమనించండి.',
      day_3_5: 'ప్రొపికోనజోల్ 25% EC ని తెల్లవారుజామున ఆకులపై సమానంగా పిచికారీ చేయండి.',
      day_6_8: 'కొత్త ఆకులపై తెగులు విస్తరిస్తుందో లేదో తనిఖీ చేయండి.',
      day_9_11: 'అవసరమైతే 14 రోజుల వ్యవధి తర్వాత రెండవసారి పిచికారీ చేయండి.',
      day_12_14: 'పంట పునరుద్ధరణను మరియు గింజల నాణ్యతను సమీక్షించండి.'
    }
  },

  'rice blast': {
    title: 'వరి అగ్గి / బ్లాస్ట్ తెగులు (Rice Blast)',
    organic: 'సూడోమోనాస్ ఫ్లోరోసెన్స్ @ 10 గ్రా/లీటర్ లేదా తాజా ఆవు పేడ నీటి సారాన్ని (20%) మొదటి దశలో పిచికారీ చేయండి.',
    chemical: 'ట్రైసైక్లాజోల్ 75% WP @ 0.6 గ్రా/లీటర్ లేదా ఐసోప్రోథియోలేన్ 40% EC @ 1.5 మి.లీ/లీటర్ నీటిలో కలిపి పిచికారీ చేయండి.',
    precautions: 'అధిక నత్రజని వాడకాన్ని నివారించండి. పొలంలో నిరంతరం నీరు నిల్వ ఉండేలా చూసుకోండి (ఆరబెట్టవద్దు). తెగులును తట్టుకునే రకాలను ఎంచుకోండి.',
    exact_cause: 'మాగ్నాపోర్తే ఒరైజే (Magnaporthe oryzae) అనే శిలీంధ్రం అధిక గాలి తేమ మరియు రాత్రి ఉష్ణోగ్రత తక్కువగా ఉన్నప్పుడు గాలి ద్వారా వ్యాపిస్తుంది.',
    symptoms: [
      'ఆకులపై కంటి లేదా పడవ ఆకారంలో మధ్య బూడిద రంగు మరియు గోధుమ అంచులు గల మచ్చలు',
      'వెన్ను భాగం వద్ద నల్లటి మచ్చలు ఏర్పడి వెన్ను విరిగిపోవడం (నెక్ బ్లాస్ట్)',
      'ఆకులు పూర్తిగా ఎండిపోయి అగ్ని తగిలినట్లు మాడిపోవడం',
      'గింజలు తాలుగా మారడం'
    ],
    plan_14_day: {
      day_1_2: 'నత్రజని ఎరువుల వాడకాన్ని వెంటనే నిలిపివేయండి.',
      day_3_5: 'ట్రైసైక్లాజోల్ 75% WP @ 0.6 గ్రా/లీటర్ నీటిలో కలిపి సమగ్రంగా పిచికారీ చేయండి.',
      day_6_8: 'పొలంలో తగినంత నీటి మట్టాన్ని నిర్వహించండి మరియు వెన్ను భాగాలను తనిఖీ చేయండి.',
      day_9_11: 'మచ్చలు ఆరిపోయాయో లేదో పరిశీలించండి.',
      day_12_14: 'పంట తిరిగి పచ్చదనం సంతరించుకోవడాన్ని నిర్ధారించండి.'
    }
  },

  'corn common rust': {
    title: 'మొక్కజొన్న కుంకుమ తెగులు (Corn Common Rust)',
    organic: 'వేప నూనె 5 మి.లీ/లీటర్ లేదా సల్ఫర్ 80% WP @ 3 గ్రా/లీటర్ పిచికారీ చేయండి.',
    chemical: 'మాంకోజెబ్ 75% WP @ 2.5 గ్రా/లీ లేదా అజోక్సిస్ట్రోబిన్ 23% SC @ 1 మి.లీ/లీటర్ నీటిలో కలిపి పిచికారీ చేయండి.',
    precautions: 'మొక్కజొన్న పంటలో తగిన గాలి ప్రసరణ ఉండేలా మొక్కల మధ్య దూరం పాటించండి. పొలం గట్లపై కలుపు తీయండి.',
    exact_cause: 'ప్యూసీనియా సోర్గి (Puccinia sorghi) శిలీంధ్ర బీజాలు అధిక గాలి తేమలో ఆకుల ఉపరితలంపై ప్రవేశించి ఇన్ఫెక్షన్ కలిగిస్తాయి.',
    symptoms: [
      'ఆకు పైభాగం మరియు అడుగుభాగంలో ఎర్రటి లేదా గోధుమ రంగు చిన్న బొబ్బలు',
      'బొబ్బలు పగిలి ఇటుక పొడి వంటి బీజాలు బయటకు రావడం',
      'ఆకులు పసుపు రంగులోకి మారి అకాలంగా ఎండిపోవడం'
    ],
    plan_14_day: {
      day_1_2: 'ఆకులపై ఉన్న కుంకుమ మచ్చలను గుర్తించండి.',
      day_3_5: 'మాంకోజెబ్ లేదా అజోక్సిస్ట్రోబిన్ పిచికారీ చేయండి.',
      day_6_8: 'కొత్తగా వచ్చే పై ఆకులపై బొబ్బలు రాకుండా చూసుకోండి.',
      day_9_11: 'మట్టిలో తేమను సరిగ్గా నిర్వహించండి.',
      day_12_14: 'కంకి ఎదుగుదల మరియు పంట ఆరోగ్యాన్ని నిర్ధారించండి.'
    }
  },

  'potato late blight': {
    title: 'బంగాళాదుంప లేట్ బ్లైట్ తెగులు (Potato Late Blight)',
    organic: 'కాపర్ ఆక్సీక్లోరైడ్ 3 గ్రా/లీటర్ లేదా ట్రైకోడెర్మా విరిడే పిచికారీ చేయండి. తెగులు సోకిన తీగలను పీకి నాశనం చేయండి.',
    chemical: 'సైమోక్సానిల్ 8% + మాంకోజెబ్ 64% WP @ 3 గ్రా/లీ లేదా మెటలాక్సిల్ 8% + మాంకోజెబ్ 64% @ 2.5 గ్రా/లీటర్ పిచికారీ చేయండి.',
    precautions: 'ధృవీకరించబడిన ఆరోగ్యకరమైన బంగాళాదుంప విత్తనాలను మాత్రమే వాడండి. మట్టిని పిలకల చుట్టూ ఎగదోయండి.',
    exact_cause: 'ఫైటోఫ్తోరా ఇన్ఫెస్టాన్స్ అనే నీటి బూజు చల్లని, తడి వాతావరణంలో దుంపలకు మరియు ఆకులకు వేగంగా సోకుతుంది.',
    symptoms: [
      'ఆకుల అంచుల వద్ద ముదురు గోధుమ లేదా నలుపు రంగు నీటి మచ్చలు',
      'తేమ ఉన్నప్పుడు ఆకుల క్రింద తెల్లటి బూజు కనిపించడం',
      'దుంపల పైభాగం కుళ్ళిపోయి దుర్వాసన రావడం'
    ],
    plan_14_day: {
      day_1_2: 'తీవ్రంగా తెగులు సోకిన కొమ్మలను కత్తిరించి పొలం బయట కాల్చివేయండి.',
      day_3_5: 'సైమోక్సానిల్ + మాంకోజెబ్ మందును ఆకుల అడుగుభాగం కూడా తడిసేలా పిచికారీ చేయండి.',
      day_6_8: 'భూమిలో నీరు నిల్వ లేకుండా డ్రైనేజీని సరిచేయండి.',
      day_9_11: 'దుంపల ఎదుగుదలను మరియు తెగులు వ్యాప్తిని తనిఖీ చేయండి.',
      day_12_14: 'పంట రక్షణను ధృవీకరించండి.'
    }
  },

  'healthy': {
    title: 'పంట ఆరోగ్యంగా ఉంది (Healthy Crop Foliage)',
    organic: 'ఎటువంటి చికిత్స అవసరం లేదు. సేంద్రీయ ఎరువులు, కంపోస్ట్ మరియు క్రమబద్ధమైన నీటి యాజమాన్యం కొనసాగించండి.',
    chemical: 'ఎటువంటి రసాయన మందులు పిచికారీ చేయవలసిన అవసరం లేదు.',
    precautions: 'రైతు సోదరులు పంట ఆరోగ్యాన్ని కాపాడుకోవడానికి ఎప్పటికప్పుడు పొలాన్ని పరిశీలిస్తూ సమతుల్య ఎరువులను అందించండి.',
    exact_cause: 'సమతుల్య పోషకాలు, మేలైన విత్తన రకం మరియు సక్రమమైన నీటి యాజమాన్యం వల్ల పంట ఆరోగ్యంగా ఉంది.',
    symptoms: [
      'ఆకులు సహజమైన ముదురు ఆకుపచ్చ రంగులో ఉన్నాయి',
      'ఎటువంటి తెగులు మచ్చలు లేదా రంధ్రాలు లేవు',
      'పంట బలంగా మరియు ఏపుగా పెరుగుతోంది'
    ],
    plan_14_day: {
      day_1_2: 'పొలంలో కలుపు లేకుండా శుభ్రంగా ఉంచుకోండి.',
      day_3_5: 'నేలలో తేమను బట్టి క్రమబద్ధంగా నీటి తడులు అందించండి.',
      day_6_8: 'సహజ వేప కషాయం పిచికారీ చేసి ముందస్తు రక్షణ కల్పించండి.',
      day_9_11: 'సిఫార్సు చేసిన సమతుల్య పోషకాలను అందించండి.',
      day_12_14: 'పంట ఏపుగా పెరగడాన్ని మరియు పూత/కాత దశను గమనించండి.'
    }
  }
};

/**
 * Returns localized Telugu disease name
 */
export function getTeluguDiseaseTitle(diseaseName, cropName) {
  if (!diseaseName) return 'వ్యాధి సమాచారం లభ్యం కాలేదు';
  if (TELUGU_DISEASE_TITLES[diseaseName]) {
    return TELUGU_DISEASE_TITLES[diseaseName];
  }

  // Check case-insensitive
  const lower = diseaseName.toLowerCase();
  for (const [key, val] of Object.entries(TELUGU_DISEASE_TITLES)) {
    if (lower === key.toLowerCase()) return val;
  }

  // Pattern match keywords
  const cropTe = TELUGU_CROPS[cropName] || cropName || '';
  if (lower.includes('healthy') || lower.includes('ఆరోగ్య')) {
    return `${cropTe} పంట ఆరోగ్యంగా ఉంది (Healthy)`;
  }
  if (lower.includes('late blight')) {
    return `${cropTe} లేట్ బ్లైట్ తెగులు (Late Blight)`;
  }
  if (lower.includes('early blight')) {
    return `${cropTe} ఆర్లీ బ్లైట్ తెగులు (Early Blight)`;
  }
  if (lower.includes('leaf curl')) {
    return `${cropTe} ఆకు ముడత తెగులు (Leaf Curl)`;
  }
  if (lower.includes('rust')) {
    return `${cropTe} కుంకుమ తెగులు (Rust)`;
  }
  if (lower.includes('blast')) {
    return `${cropTe} అగ్గి తెగులు / బ్లాస్ట్ (Blast)`;
  }
  if (lower.includes('bacterial')) {
    return `${cropTe} బాక్టీరియల్ మచ్చ తెగులు (Bacterial)`;
  }
  if (lower.includes('scab')) {
    return `${cropTe} స్కాబ్ తెగులు (Scab)`;
  }
  if (lower.includes('black rot')) {
    return `${cropTe} నల్ల కుళ్ళు తెగులు (Black Rot)`;
  }
  if (lower.includes('powdery mildew')) {
    return `${cropTe} బూడిద తెగులు (Powdery Mildew)`;
  }

  return `${cropTe} ${diseaseName}`;
}

/**
 * Resolves localized values for a complete diagnosis dossier
 */
export function getLocalizedDossier(result, language) {
  if (!result || language !== 'te') {
    return {
      cropName: result?.crop?.name || '',
      category: result?.category || '',
      disease: result?.disease || '',
      severity: result?.severity || 'Normal',
      organicTreatment: result?.treatment_options?.organic || result?.organic_treatment || result?.treatment || 'Apply organic bio-fungicide or neem oil solution.',
      chemicalTreatment: result?.treatment_options?.chemical || result?.chemical_treatment || result?.treatment || 'Foliar spray of registered systemic protectant as per approved label.',
      precautions: result?.precautions || 'Maintain drip irrigation, crop rotation, and remove heavily infected leaf debris.',
      exactCause: result?.exact_cause || result?.explanation || 'Detailed biological cause and transmission pathology.',
      visibleSymptoms: result?.visible_symptoms || [],
      plan14Day: result?.plan_14_day || null,
      source: result?.authoritative_source || 'ICAR & State Agricultural Extension'
    };
  }

  // Telugu Localization Resolution
  const rawCrop = result.crop?.name || '';
  const cropNameTe = TELUGU_CROPS[rawCrop] || rawCrop;

  const rawCat = result.category || '';
  const categoryTe = TELUGU_CATEGORIES[rawCat] || rawCat;

  const rawSev = result.severity || 'Normal';
  const severityTe = TELUGU_SEVERITIES[rawSev] || rawSev;

  const diseaseTe = getTeluguDiseaseTitle(result.disease, rawCrop);

  // Match knowledge base
  const lowerDisease = (result.disease || '').toLowerCase();
  let matchedKb = null;

  if (lowerDisease.includes('healthy') || lowerDisease.includes('ఆరోగ్య')) {
    matchedKb = TELUGU_KNOWLEDGE_BASE['healthy'];
  } else if (lowerDisease.includes('tomato') && lowerDisease.includes('late blight')) {
    matchedKb = TELUGU_KNOWLEDGE_BASE['tomato late blight'];
  } else if (lowerDisease.includes('late blight')) {
    matchedKb = lowerDisease.includes('potato') 
      ? TELUGU_KNOWLEDGE_BASE['potato late blight']
      : TELUGU_KNOWLEDGE_BASE['tomato late blight'];
  } else if (lowerDisease.includes('stripe rust')) {
    matchedKb = TELUGU_KNOWLEDGE_BASE['wheat stripe rust'];
  } else if (lowerDisease.includes('rice') || lowerDisease.includes('blast')) {
    matchedKb = TELUGU_KNOWLEDGE_BASE['rice blast'];
  } else if (lowerDisease.includes('corn') && lowerDisease.includes('rust')) {
    matchedKb = TELUGU_KNOWLEDGE_BASE['corn common rust'];
  }

  const organicTreatment = matchedKb?.organic || 
    (result.organic_treatment ? `సేంద్రీయ చికిత్స: ${result.organic_treatment}` : 'వేప నూనె (5 మి.లీ/లీ) లేదా సేంద్రీయ ట్రైకోడెర్మా జీవ శిలీంధ్ర సంహారిణిని పిచికారీ చేయండి.');

  const chemicalTreatment = matchedKb?.chemical || 
    (result.chemical_treatment ? `రసాయన పిచికారీ: ${result.chemical_treatment}` : 'సిఫార్సు చేసిన కాపర్ ఆక్సీక్లోరైడ్ లేదా మాంకోజెబ్ మందును లేబుల్ సూచనల ప్రకారం పిచికారీ చేయండి.');

  const precautions = matchedKb?.precautions || 
    (result.precautions ? `ముందస్తు జాగ్రత్తలు: ${result.precautions}` : 'పొలంలో నీరు నిల్వ లేకుండా చూడండి, వ్యాధి సోకిన ఆకులను తొలగించి పొలం పరిశుభ్రతను పాటించండి.');

  const exactCause = matchedKb?.exact_cause || 
    (result.exact_cause ? `వ్యాధికారక కారణం: ${result.exact_cause}` : 'అనుకూలమైన అధిక తేమ మరియు ఉష్ణోగ్రతలలో గాలి లేదా వర్షపు నీటి ద్వారా వ్యాపించే సూక్ష్మజీవుల సంక్రమణ.');

  const visibleSymptoms = matchedKb?.symptoms || 
    (result.visible_symptoms && result.visible_symptoms.length > 0
      ? result.visible_symptoms.map(s => `ఆకులపై తెగులు లక్షణాలు: ${s}`)
      : ['ఆకులపై మచ్చలు మరియు రంగు మారడం', 'ఎండిపోవడం లేదా వాడిపోవడం']);

  const plan14Day = matchedKb?.plan_14_day || result.plan_14_day || {
    day_1_2: 'ప్రారంభ తనిఖీ & పరిశుభ్రత: తెగులు సోకిన భాగాలను గుర్తించి ఎండిన ఆకులను కత్తిరించండి.',
    day_3_5: 'లక్ష్యిత పిచికారీ: సిఫార్సు చేసిన జీవ ఏజెంట్ లేదా ఆమోదిత మందును పిచికారీ చేయండి.',
    day_6_8: 'మధ్యంతర పర్యవేక్షణ: కొత్త మచ్చలు రాకుండా పరిశీలించండి.',
    day_9_11: 'ఫాలో-అప్ పరిశీలన: వ్యాధి తగ్గుదలను అంచనా వేయండి.',
    day_12_14: 'చివరి సమీక్ష: పంట మొత్తం కోలుకున్నట్లు నిర్ధారించండి.'
  };

  const source = 'ప్రొఫెసర్ జయశంకర్ తెలంగాణ రాష్ట్ర వ్యవసాయ విశ్వవిద్యాలయం (PJTSAU) వ్యవసాయ పంచాంగం / ICAR 2024';

  return {
    cropName: cropNameTe,
    category: categoryTe,
    disease: diseaseTe,
    severity: severityTe,
    organicTreatment,
    chemicalTreatment,
    precautions,
    exactCause,
    visibleSymptoms,
    plan14Day,
    source
  };
}
