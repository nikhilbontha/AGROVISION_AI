"""
Comprehensive Crop Disease Knowledge Base & Agronomic Diagnostic Library.
Contains detailed pathogen science, exact causes, visible symptoms, organic remedies,
chemical treatments, preventive precautions, and environmental risk factors.
"""

DISEASE_INFO = {
    # -------------------------------------------------------------------------
    # WHEAT DISEASES
    # -------------------------------------------------------------------------
    "Wheat___Stripe_rust": {
        "scientific_name": "Puccinia striiformis f. sp. tritici",
        "category": "Fungal Pathogen",
        "explanation": "Wheat Stripe Rust (Yellow Rust) is a destructive fungal disease that attacks wheat foliage. It forms distinct yellow-orange pustules arranged in long stripes along leaf veins, depriving grains of essential nutrients and causing up to 70% yield loss if untreated.",
        "exact_cause": "Airborne fungal spores (urediniospores) blown by wind over long distances. Favored by cool temperatures (10°C to 15°C) and prolonged leaf wetness or high dew.",
        "environmental_factors": {
            "temperature": "10°C - 18°C",
            "humidity": "85% - 100%",
            "leaf_wetness": "> 3 hours"
        },
        "visible_symptoms": [
            "Bright yellow to orange pustules arranged in narrow linear stripes on leaves",
            "Chlorotic yellowing surrounding the pustule stripes",
            "Premature drying and shriveling of affected wheat leaves",
            "Stunted grain heads with light, shriveled kernels"
        ],
        "similar_diseases": ["Wheat Leaf Rust", "Wheat Stem Rust", "Physiological Leaf Spot"],
        "organic_treatment": "Spray Neem oil (5 ml/L) or Garlic extract (20 ml/L) at first symptom appearance. Apply Trichoderma harzianum bio-fungicide to strengthen plant defense.",
        "chemical_treatment": "Foliar spray of Propiconazole 25% EC @ 1 ml/L or Tebuconazole 25.9% EC @ 1.5 ml/L of water. Repeat spray after 14 days if rust pressure persists.",
        "treatment": "Apply systemic triazole fungicides (Propiconazole/Tebuconazole) immediately. Integrate organic neem oil sprays for preventative maintenance.",
        "precautions": "Plant rust-resistant wheat varieties (e.g., HD-2967, DBW-187). Avoid excessive nitrogen fertilization which increases foliage susceptibility.",
        "action_timeline": {
            "immediate": "Flag infected field sectors and restrict machinery movement to prevent spore dispersal.",
            "day_2_3": "Apply prescribed Propiconazole or Tebuconazole fungicide spray in early morning.",
            "day_7": "Re-examine wheat canopy; perform follow-up spot treatment if new yellow pustule stripes appear."
        }
    },

    "Wheat___Leaf_rust": {
        "scientific_name": "Puccinia triticina",
        "category": "Fungal Pathogen",
        "explanation": "Wheat Leaf Rust (Brown Rust) causes small, round, reddish-brown pustules scattered randomly across upper leaf surfaces. It severely reduces leaf photosynthetic area and grain weight.",
        "exact_cause": "Fungal infection spread by wind-borne urediniospores in warmer temperatures (15°C to 25°C) with humid conditions.",
        "environmental_factors": {
            "temperature": "15°C - 25°C",
            "humidity": "80% - 95%",
            "leaf_wetness": "> 6 hours"
        },
        "visible_symptoms": [
            "Small round to oval reddish-brown pustules scattered randomly on leaf blades",
            "Pustules rupture leaf epidermis revealing dusty brown spores",
            "Yellow halo around mature rust spots",
            "Accelerated leaf senescence and reduced kernel filling"
        ],
        "similar_diseases": ["Wheat Stripe Rust", "Tan Spot", "Septoria Tritici Blotch"],
        "organic_treatment": "Foliar application of Copper Soap or Sulfur powder (2 g/L). Spray bio-agents like Bacillus subtilis.",
        "chemical_treatment": "Mancozeb 75% WP @ 2 g/L or Azoxystrobin + Difenoconazole @ 1 ml/L of water.",
        "treatment": "Spray Mancozeb or Difenoconazole fungicide upon initial detection of leaf spots.",
        "precautions": "Destroy volunteer wheat plants in field margins. Practice early sowing to escape late-season rust flares.",
        "action_timeline": {
            "immediate": "Inspect lower and middle canopy leaves for reddish-brown pustules.",
            "day_2_3": "Spray Mancozeb 75% WP @ 2 g/L evenly over the crop canopy.",
            "day_7": "Evaluate rust containment and maintain optimal soil moisture."
        }
    },

    "Wheat___Powdery_mildew": {
        "scientific_name": "Blumeria graminis f. sp. tritici",
        "category": "Fungal Pathogen",
        "explanation": "Powdery Mildew appears as white, fluffy, cotton-like fungal patches on wheat leaves and stems. As the disease advances, patches turn gray-brown with tiny black specks.",
        "exact_cause": "Airborne ascospores and conidia thriving in dense, highly fertilized wheat fields with high humidity and moderate shading.",
        "environmental_factors": {
            "temperature": "15°C - 22°C",
            "humidity": "70% - 90%",
            "leaf_wetness": "High relative humidity (no free water needed)"
        },
        "visible_symptoms": [
            "White to grayish-white powdery fungal growth on upper leaf surfaces",
            "Chlorotic yellow spots beneath fungal mats",
            "Tiny black fruiting bodies (cleistothecia) embedding in aging fungal mats",
            "Withered, premature leaf death from base upwards"
        ],
        "similar_diseases": ["Dust/Chemical Residue", "Downy Mildew"],
        "organic_treatment": "Spray Potassium Bicarbonate (5 g/L) or Wettable Sulfur (3 g/L) or 10% Milk whey solution.",
        "chemical_treatment": "Hexaconazole 5% EC @ 1 ml/L or Triadimefon 25% WP @ 1 g/L of water.",
        "treatment": "Spray sulfur or hexaconazole fungicide. Thin out dense canopy to boost sunlight penetration.",
        "precautions": "Avoid over-applying nitrogenous fertilizers. Maintain recommended seed rate during sowing.",
        "action_timeline": {
            "immediate": "Increase field ventilation and prune dense border growth if applicable.",
            "day_2_3": "Apply Wettable Sulfur or Hexaconazole foliar spray.",
            "day_7": "Verify regression of white powdery mats."
        }
    },

    "Wheat___healthy": {
        "scientific_name": "Triticum aestivum",
        "category": "Healthy Foliage",
        "explanation": "The wheat crop foliage is completely healthy, displaying vibrant green chlorophyll content, strong stem turgidity, and zero signs of rust pustules or leaf spots.",
        "exact_cause": "Optimal soil nutrients, good seed quality, balanced irrigation, and healthy growing conditions.",
        "environmental_factors": {
            "temperature": "15°C - 25°C",
            "humidity": "40% - 70%",
            "leaf_wetness": "Normal"
        },
        "visible_symptoms": [
            "Uniform green leaf blade without spots, stripes, or lesions",
            "Clean leaf sheath and erect tillers",
            "Vibrant, undamaged spikelets"
        ],
        "similar_diseases": ["None"],
        "organic_treatment": "No disease treatment required. Apply compost tea or balanced NPK organic bio-fertilizer.",
        "chemical_treatment": "No chemical fungicide required.",
        "treatment": "Maintain routine agronomic management, weeding, and balanced irrigation schedules.",
        "precautions": "Continue regular field scouting and maintain recommended soil fertility.",
        "action_timeline": {
            "immediate": "Continue standard crop maintenance.",
            "day_2_3": "Monitor soil moisture level.",
            "day_7": "Schedule routine weekly health check."
        }
    },

    # -------------------------------------------------------------------------
    # RICE DISEASES
    # -------------------------------------------------------------------------
    "Rice___Blast": {
        "scientific_name": "Magnaporthe oryzae (Pyricularia oryzae)",
        "category": "Fungal Pathogen",
        "explanation": "Rice Blast is one of the most severe diseases of paddy rice. It causes spindle-shaped (cigar-like) lesions with gray/white centers and reddish-brown borders on leaves, nodes, and panicles.",
        "exact_cause": "Spore dispersal via wind and rain splashes. Promoted by high humidity (>90%), cool night temperatures, and excess nitrogen.",
        "environmental_factors": {
            "temperature": "20°C - 28°C",
            "humidity": "90% - 100%",
            "leaf_wetness": "> 10 hours"
        },
        "visible_symptoms": [
            "Eye-shaped or spindle-shaped lesions on leaves with point ends",
            "Lesions have gray to whitish centers surrounded by dark reddish-brown margins",
            "Rotting of panicle neck ('Neck Blast'), causing white, empty grain heads",
            "Nodal blackening and stem breakage"
        ],
        "similar_diseases": ["Rice Brown Spot", "Narrow Brown Leaf Spot"],
        "organic_treatment": "Foliar spray of Pseudomonas fluorescens @ 10 g/L or Neem cake extract (5%).",
        "chemical_treatment": "Tricyclazole 75% WP @ 0.6 g/L or Isoprothiolane 40% EC @ 1.5 ml/L of water.",
        "treatment": "Apply Tricyclazole 75% WP or Kasugamycin immediately upon detecting leaf eye-spots.",
        "precautions": "Avoid excessive nitrogen application; split N doses into 3-4 applications. Maintain standing water level in paddy field.",
        "action_timeline": {
            "immediate": "Drain standing water temporarily if nitrogen level is excessive, then re-flood.",
            "day_2_3": "Spray Tricyclazole 75% WP @ 0.6 g/L across affected paddy acres.",
            "day_7": "Check neck nodes and new leaves for blast lesion containment."
        }
    },

    "Rice___Bacterial_leaf_blight": {
        "scientific_name": "Xanthomonas oryzae pv. oryzae",
        "category": "Bacterial Infection",
        "explanation": "Bacterial Leaf Blight (BLB) of rice causes yellowing and drying of leaves starting from the tips and margins, progressing into wavy, bleached, straw-colored blighted strips.",
        "exact_cause": "Vascular bacterial invasion entering through natural openings (hydathodes) or mechanical wounds. Accelerated by heavy rains, winds, and warm humid weather.",
        "environmental_factors": {
            "temperature": "25°C - 34°C",
            "humidity": "85% - 100%",
            "leaf_wetness": "High moisture & rain splashes"
        },
        "visible_symptoms": [
            "Water-soaked translucent streaks starting at leaf margins and tips",
            "Lesions turn yellow to straw-colored with characteristic wavy margins",
            "Milky bacterial ooze droplets visible on young lesions during early morning",
            "Entire leaf dries up into a bleached white paper-like blade"
        ],
        "similar_diseases": ["Rice Glume Blight", "Zinc Deficiency", "Kresek phase of BLB"],
        "organic_treatment": "Spray Fresh Cow dung extract (20%) supernatant liquid or Panchagavya (3%).",
        "chemical_treatment": "Streptocycline (Streptomycin + Tetracycline) @ 1 g / 10 L mixed with Copper Oxychloride 50% WP @ 2.5 g/L.",
        "treatment": "Spray Streptocycline bactericide combined with Copper Oxychloride. Avoid handling wet plants.",
        "precautions": "Plant resistant rice varieties (e.g., Improved Samba Mahsuri). Avoid clipping seedling tips before transplanting.",
        "action_timeline": {
            "immediate": "Stop nitrogenous fertilizer application immediately.",
            "day_2_3": "Spray Streptocycline @ 1 g/10L + Copper Oxychloride @ 2.5 g/L.",
            "day_7": "Inspect field margins for cessation of wavy margin drying."
        }
    },

    "Rice___healthy": {
        "scientific_name": "Oryza sativa",
        "category": "Healthy Foliage",
        "explanation": "The rice paddy crop is healthy, showing bright green leaf blades, robust tillering, and clean leaf sheaths.",
        "exact_cause": "Good soil aeration, balanced fertilization, optimal water depth, and disease-free seeds.",
        "environmental_factors": {
            "temperature": "22°C - 32°C",
            "humidity": "60% - 80%",
            "leaf_wetness": "Normal"
        },
        "visible_symptoms": [
            "Deep green erect leaves",
            "No spindle spots, bacterial streaks, or brown lesions",
            "Healthy root system and sturdy stems"
        ],
        "similar_diseases": ["None"],
        "organic_treatment": "No treatment needed. Continue organic green manure or bio-fertilizer schedule.",
        "chemical_treatment": "No chemical treatment required.",
        "treatment": "Maintain optimal 2-5 cm water depth in paddy field.",
        "precautions": "Monitor water quality and perform routine weeding.",
        "action_timeline": {
            "immediate": "Maintain current water depth.",
            "day_2_3": "Apply scheduled top-dressing if due.",
            "day_7": "Routine crop field walk."
        }
    },

    # -------------------------------------------------------------------------
    # CORN / MAIZE DISEASES
    # -------------------------------------------------------------------------
    "Corn___Cercospora_leaf_spot Gray_leaf_spot": {
        "scientific_name": "Cercospora zeae-maydis",
        "category": "Fungal Pathogen",
        "explanation": "Gray Leaf Spot is a high-impact fungal disease of corn. It creates distinct rectangular tan-to-gray spots bounded strictly by leaf veins. Severe infections cause total leaf blighting and grain loss.",
        "exact_cause": "Fungal spores overwintering in corn crop residue. Favored by high humidity, overcast conditions, and continuous corn cropping.",
        "environmental_factors": {
            "temperature": "22°C - 30°C",
            "humidity": "90% - 100%",
            "leaf_wetness": "> 12 hours"
        },
        "visible_symptoms": [
            "Small tan spots with yellow halos expanding into long rectangular lesions",
            "Lesions strictly bounded by parallel leaf veins, giving a blocky rectangular shape",
            "Lesions turn opaque gray when spores form",
            "Extensive foliar blight and stalk weakening"
        ],
        "similar_diseases": ["Northern Corn Leaf Blight", "Stewart's Wilt", "Diplodia Leaf Streak"],
        "organic_treatment": "Foliar spray of Neem oil (5 ml/L) or copper soap bio-fungicides.",
        "chemical_treatment": "Azoxystrobin 23% SC @ 1 ml/L or Pyraclostrobin + Metconazole @ 1.5 ml/L of water.",
        "treatment": "Apply strobilurin or triazole fungicides before silking stage.",
        "precautions": "Rotate field away from corn for at least 1-2 years. Implement deep tillage to bury crop debris.",
        "action_timeline": {
            "immediate": "Scout lower leaves before tassel emergence.",
            "day_2_3": "Apply Pyraclostrobin or Azoxystrobin fungicide spray.",
            "day_7": "Evaluate upper canopy leaves for lesion containment."
        }
    },

    "Corn___Common_rust": {
        "scientific_name": "Puccinia sorghi",
        "category": "Fungal Pathogen",
        "explanation": "Common Rust forms cinnamon-brown, raised oval pustules on both upper and lower leaf surfaces of corn. When pustules rupture, they release powdery reddish spores that infect adjacent plants.",
        "exact_cause": "Windborne fungal urediniospores blown from southern warmer regions. Favored by moderate temperatures (16°C - 24°C) and heavy dew.",
        "environmental_factors": {
            "temperature": "16°C - 24°C",
            "humidity": "85% - 100%",
            "leaf_wetness": "> 6 hours"
        },
        "visible_symptoms": [
            "Cinnamon-brown to golden-red oval pustules scattered over both leaf surfaces",
            "Pustules rupture powdery spores leaving ragged leaf epidermis",
            "Yellow chlorotic rings surrounding pustules",
            "Leaf leaf drying when pustule density is high"
        ],
        "similar_diseases": ["Southern Corn Rust", "Physoderma Brown Spot"],
        "organic_treatment": "Dust Wettable Sulfur (3 g/L) or spray bio-fungicide Bacillus amyloliquefaciens.",
        "chemical_treatment": "Mancozeb 75% WP @ 2 g/L or Propiconazole 25% EC @ 1 ml/L.",
        "treatment": "Spray Mancozeb or Propiconazole if rust appears prior to flowering/silking stage.",
        "precautions": "Plant rust-resistant corn hybrids. Plant early in the season to mature before rust pressure peaks.",
        "action_timeline": {
            "immediate": "Check both sides of middle leaves for raised brown pustules.",
            "day_2_3": "Spray Propiconazole 25% EC @ 1 ml/L of water.",
            "day_7": "Re-check rust spreading toward ear leaf."
        }
    },

    "Corn___Northern_Leaf_Blight": {
        "scientific_name": "Exserohilum turcicum (Setosphaeria turcica)",
        "category": "Fungal Pathogen",
        "explanation": "Northern Corn Leaf Blight produces large, characteristic cigar-shaped (elliptical) grayish-green or tan lesions measuring 2.5 to 15 cm long on corn leaves.",
        "exact_cause": "Fungal spores surviving in crop residue, spread by rain splashes and wind. Promoted by moderate temperatures (18°C - 27°C) and wet weather.",
        "environmental_factors": {
            "temperature": "18°C - 27°C",
            "humidity": "80% - 100%",
            "leaf_wetness": "> 6 hours"
        },
        "visible_symptoms": [
            "Long, elliptical, cigar-shaped grayish-tan lesions (2.5 to 15 cm long)",
            "Dark olive-green fuzzy spore zones inside lesions during humid mornings",
            "Lesions coalesce, blighting large areas of the leaf",
            "Premature plant death and reduced grain filling"
        ],
        "similar_diseases": ["Southern Corn Leaf Blight", "Goss's Wilt"],
        "organic_treatment": "Spray Trichoderma harzianum or Neem oil formulation.",
        "chemical_treatment": "Mancozeb 75% WP @ 2.5 g/L or Azoxystrobin + Difenoconazole @ 1 ml/L.",
        "treatment": "Foliar application of Difenoconazole or Mancozeb before tassels emerge.",
        "precautions": "Select resistant corn hybrids (Ht genes). Practice crop rotation and bury crop residue.",
        "action_timeline": {
            "immediate": "Identify cigar-shaped lesions on lower leaves.",
            "day_2_3": "Apply Mancozeb or Difenoconazole spray.",
            "day_7": "Verify leaf blight suppression."
        }
    },

    "Corn___healthy": {
        "scientific_name": "Zea mays",
        "category": "Healthy Foliage",
        "explanation": "The corn foliage is in peak health, showing lush dark green leaves, sturdy stalk diameter, and robust ear development.",
        "exact_cause": "Optimal nitrogen management, adequate soil moisture, and effective weed control.",
        "environmental_factors": {
            "temperature": "20°C - 30°C",
            "humidity": "50% - 75%",
            "leaf_wetness": "Normal"
        },
        "visible_symptoms": [
            "Broad, rich green leaves with smooth margins",
            "No cigar-shaped lesions, rectangular gray spots, or brown rust pustules",
            "Strong central midrib and healthy silk emergence"
        ],
        "similar_diseases": ["None"],
        "organic_treatment": "No disease treatment required. Apply organic compost or bio-fertilizer as needed.",
        "chemical_treatment": "No chemical treatment required.",
        "treatment": "Maintain regular weeding and irrigation during tasseling and silking stages.",
        "precautions": "Ensure balanced potassium and nitrogen soil nourishment.",
        "action_timeline": {
            "immediate": "Continue standard field management.",
            "day_2_3": "Monitor irrigation scheduling.",
            "day_7": "Routine crop check."
        }
    },

    # -------------------------------------------------------------------------
    # TOMATO DISEASES
    # -------------------------------------------------------------------------
    "Tomato___Early_blight": {
        "scientific_name": "Alternaria solani",
        "category": "Fungal Pathogen",
        "explanation": "Early Blight is a common fungal disease of tomatoes characterized by distinctive concentric rings ('target board' / 'bullseye' pattern) on older lower leaves, causing leaves to yellow and drop.",
        "exact_cause": "Fungal spores (Alternaria) spread by splash irrigation, wind, and contaminated tools under warm, humid conditions.",
        "environmental_factors": {
            "temperature": "24°C - 29°C",
            "humidity": "80% - 95%",
            "leaf_wetness": "> 4 hours"
        },
        "visible_symptoms": [
            "Dark brown circular spots with target-like concentric rings ('bullseye')",
            "Yellow halo surrounding the brown lesions",
            "Defoliation starting from oldest bottom leaves progressing upward",
            "Sunken dark lesions at the stem base or fruit stem end"
        ],
        "similar_diseases": ["Tomato Septoria Leaf Spot", "Tomato Late Blight", "Target Spot"],
        "organic_treatment": "Prune infected bottom leaves. Spray Copper Octanoate (Soap) or Neem oil (5 ml/L) weekly.",
        "chemical_treatment": "Chlorothalonil 75% WP @ 2 g/L or Mancozeb 75% WP @ 2.5 g/L or Difenoconazole @ 1 ml/L.",
        "treatment": "Prune affected lower foliage and spray Chlorothalonil or Mancozeb.",
        "precautions": "Mulch the base of tomato plants to prevent soil splashing onto leaves. Avoid overhead watering.",
        "action_timeline": {
            "immediate": "Prune and dispose of infected lower leaves showing bullseye spots.",
            "day_2_3": "Apply Chlorothalonil or Copper fungicide spray.",
            "day_7": "Check upper canopy leaves for clean growth."
        }
    },

    "Tomato___Late_blight": {
        "scientific_name": "Phytophthora infestans",
        "category": "Water Mold / Oomycete",
        "explanation": "Late Blight is an aggressive, water-mold disease capable of destroying entire tomato crops within days. It causes large, dark, water-soaked patches on leaves and white cottony growth under humid conditions.",
        "exact_cause": "Oomycete sporangia spread rapidly by wind and rain in cool, wet, foggy weather.",
        "environmental_factors": {
            "temperature": "15°C - 22°C",
            "humidity": "90% - 100%",
            "leaf_wetness": "> 8 hours"
        },
        "visible_symptoms": [
            "Large, irregular dark brown water-soaked patches on leaves and stems",
            "Delicate white downy fungal growth on the underside of infected leaves in moist weather",
            "Firm, brown, greasy-looking lesions on green tomato fruits",
            "Rapid collapse and rotting of entire tomato vines"
        ],
        "similar_diseases": ["Tomato Early Blight", "Frost Injury", "Bacterial Spot"],
        "organic_treatment": "Bordeaux mixture (1%) or Copper Oxychloride spray @ 3 g/L. Remove severely blighted plants.",
        "chemical_treatment": "Metalaxyl 8% + Mancozeb 64% WP @ 2.5 g/L or Dimethomorph 50% WP @ 1 g/L of water.",
        "treatment": "Immediate spray of systemic fungicide (Metalaxyl + Mancozeb). Destroy heavily infected vines.",
        "precautions": "Ensure wide plant spacing for rapid foliage drying. Destroy volunteer potato and tomato plants.",
        "action_timeline": {
            "immediate": "Bag and burn heavily infected tomato plants immediately.",
            "day_2_3": "Spray Metalaxyl + Mancozeb across all surrounding tomato rows.",
            "day_7": "Daily inspection of leaf margins for new water-soaked spots."
        }
    },

    "Tomato___Bacterial_spot": {
        "scientific_name": "Xanthomonas perforans / X. vesicatoria",
        "category": "Bacterial Infection",
        "explanation": "Bacterial Spot causes small, dark, water-soaked spots on tomato leaves that turn greasy black with yellow halos. Spots can merge, leading to severe leaf drop and scabby fruit spots.",
        "exact_cause": "Seed-borne or rain-splashed bacteria entering through stomata or plant wounds in warm wet conditions.",
        "environmental_factors": {
            "temperature": "25°C - 30°C",
            "humidity": "85% - 100%",
            "leaf_wetness": "Rain splash & dew"
        },
        "visible_symptoms": [
            "Small (2-3 mm) dark brown/black water-soaked circular spots",
            "Yellowing around leaf spots giving a speckled appearance",
            "Centers of old spots may dry up and fall out",
            "Raised, black, scabby, rough spots on green tomato fruits"
        ],
        "similar_diseases": ["Tomato Septoria Leaf Spot", "Bacterial Speck"],
        "organic_treatment": "Spray Liquid Copper Soap or Bacteriophage formulations. Apply Neem leaf extract.",
        "chemical_treatment": "Copper Hydroxide 77% WP @ 2 g/L mixed with Streptocycline @ 0.5 g/10L.",
        "treatment": "Spray Copper Hydroxide combined with Streptocycline. Do not work in wet tomato fields.",
        "precautions": "Use certified disease-free seeds. Avoid overhead sprinkler irrigation.",
        "action_timeline": {
            "immediate": "Disinfect pruning shears and hands with alcohol solution.",
            "day_2_3": "Spray Copper Hydroxide + Streptocycline.",
            "day_7": "Monitor new leaf flushes."
        }
    },

    "Tomato___Leaf_Mold": {
        "scientific_name": "Passalora fulva (Cladosporium fulvum)",
        "category": "Fungal Pathogen",
        "explanation": "Tomato Leaf Mold is a major fungal problem in greenhouses and tunnels. It creates pale yellow spots on upper leaf surfaces and velvety olive-green to brown mold underneath.",
        "exact_cause": "Fungal conidia thriving in stagnant, high-humidity (>85%) environments with poor air exchange.",
        "environmental_factors": {
            "temperature": "20°C - 25°C",
            "humidity": "85% - 100%",
            "leaf_wetness": "High relative humidity"
        },
        "visible_symptoms": [
            "Pale greenish-yellow spots on upper leaf surfaces",
            "Olive-green to dark brown velvety mold coating on underside of leaves",
            "Infected leaves curl, wither, and drop prematurely",
            "Fruit blossoms may drop"
        ],
        "similar_diseases": ["Powdery Mildew", "Tomato Late Blight"],
        "organic_treatment": "Increase greenhouse ventilation. Spray Sulfur dust (3 g/L) or potassium bicarbonate.",
        "chemical_treatment": "Chlorothalonil 75% WP @ 2 g/L or Difenoconazole @ 1 ml/L.",
        "treatment": "Boost air exchange immediately. Spray Difenoconazole or Chlorothalonil.",
        "precautions": "Keep greenhouse humidity below 85%. Prune lower suckers to open up canopy airflow.",
        "action_timeline": {
            "immediate": "Open greenhouse side vents and turn on circulation fans.",
            "day_2_3": "Apply Difenoconazole foliar spray.",
            "day_7": "Re-check leaf undersides for velvety mold."
        }
    },

    "Tomato___Septoria_leaf_spot": {
        "scientific_name": "Septoria lycopersici",
        "category": "Fungal Pathogen",
        "explanation": "Septoria Leaf Spot produces hundreds of small, circular spots with gray or white centers and dark brown margins. Tiny black specks (pycnidia) appear inside the gray centers.",
        "exact_cause": "Soil-borne and splash-dispersed fungal spores under warm, wet conditions.",
        "environmental_factors": {
            "temperature": "20°C - 26°C",
            "humidity": "80% - 95%",
            "leaf_wetness": "> 6 hours"
        },
        "visible_symptoms": [
            "Numerous small, round spots (1.5-3 mm) with ash-gray centers and dark borders",
            "Pinpoint black specks (fruiting bodies) inside gray spot centers",
            "Leaves turn yellow, dry up, and drop from base of plant upward",
            "Sunscald on exposed fruit due to defoliation"
        ],
        "similar_diseases": ["Tomato Early Blight", "Bacterial Spot"],
        "organic_treatment": "Prune affected lower leaves. Spray Copper soap or Bacillus subtilis.",
        "chemical_treatment": "Mancozeb 75% WP @ 2 g/L or Chlorothalonil @ 2 g/L.",
        "treatment": "Remove lower infected foliage and apply Mancozeb or Chlorothalonil.",
        "precautions": "Mulch plants with straw or plastic. Practice a 3-year crop rotation.",
        "action_timeline": {
            "immediate": "Prune off heavily spotted bottom leaves.",
            "day_2_3": "Spray Mancozeb 75% WP @ 2 g/L.",
            "day_7": "Verify leaf drop stopping."
        }
    },

    "Tomato___Spider_mites Two-spotted_spider_mite": {
        "scientific_name": "Tetranychus urticae",
        "category": "Acarid Pest Infestation",
        "explanation": "Two-Spotted Spider Mites are microscopic sap-sucking pests. They feed on leaf undersides, producing yellow stippling (speckling), bronze leaf drying, and fine silken webbing.",
        "exact_cause": "Rapid pest multiplication during hot, dry, dusty weather conditions.",
        "environmental_factors": {
            "temperature": "27°C - 38°C",
            "humidity": "< 50%",
            "leaf_wetness": "Dry & dusty"
        },
        "visible_symptoms": [
            "Fine white to yellow stippling/dots on upper leaf surface",
            "Fine silk webbing under leaves and on shoot tips",
            "Leaves turn bronze, dry out, and take on a burnt paper texture",
            "Tiny moving yellow-green mites visible with magnifying glass under leaves"
        ],
        "similar_diseases": ["Thrips Damage", "Nutrient Deficiency"],
        "organic_treatment": "Spray Neem oil 10,000 ppm @ 3 ml/L or Insecticidal soap. Blast under-sides of leaves with strong water spray.",
        "chemical_treatment": "Abamectin 1.9% EC @ 0.5 ml/L or Spiromesifen 22.9% SC @ 1 ml/L of water.",
        "treatment": "Spray Abamectin or Spiromesifen targeting undersides of foliage.",
        "precautions": "Keep field dust down by watering access roads. Avoid broad-spectrum insecticides that kill natural mite predators.",
        "action_timeline": {
            "immediate": "Hose down foliage with water spray to disrupt web structures.",
            "day_2_3": "Spray Abamectin or Spiromesifen under leaves.",
            "day_7": "Inspect leaf undersides with lens for live mites."
        }
    },

    "Tomato___Target_Spot": {
        "scientific_name": "Corynespora cassiicola",
        "category": "Fungal Pathogen",
        "explanation": "Target Spot causes pin-point brown spots that expand into circular lesions with light brown centers and dark concentric rings on tomato leaves and pitted fruit spots.",
        "exact_cause": "Fungal spores spread by air currents and rain splash in warm humid environments.",
        "environmental_factors": {
            "temperature": "20°C - 32°C",
            "humidity": "85% - 100%",
            "leaf_wetness": "> 8 hours"
        },
        "visible_symptoms": [
            "Small brown leaf spots expanding into circular target-like lesions",
            "Light brown centers with dark concentric rings and yellow halos",
            "Sunken circular lesions on green and ripe tomato fruits",
            "Canopy defoliation"
        ],
        "similar_diseases": ["Tomato Early Blight", "Septoria Spot"],
        "organic_treatment": "Apply Copper Octanoate or Bio-fungicide Trichoderma.",
        "chemical_treatment": "Chlorothalonil @ 2 g/L or Azoxystrobin @ 1 ml/L.",
        "treatment": "Spray Chlorothalonil or Azoxystrobin fungicide.",
        "precautions": "Improve plant spacing and prune interior suckers for ventilation.",
        "action_timeline": {
            "immediate": "Prune dense inner foliage.",
            "day_2_3": "Spray Chlorothalonil @ 2 g/L.",
            "day_7": "Check fruit cluster health."
        }
    },

    "Tomato___Tomato_Yellow_Leaf_Curl_Virus": {
        "scientific_name": "Tomato Yellow Leaf Curl Virus (TYLCV)",
        "category": "Viral Pathogen",
        "explanation": "TYLCV is a severe viral disease transmitted by whiteflies (Bemisia tabaci). It causes dramatic upward leaf curling, yellow leaf margins, extreme plant stunting, and flower drop.",
        "exact_cause": "Viral transmission by Silverleaf Whitefly vectors feeding on plant sap.",
        "environmental_factors": {
            "temperature": "25°C - 35°C",
            "humidity": "Variable",
            "leaf_wetness": "High whitefly populations"
        },
        "visible_symptoms": [
            "Severe upward cupping and curling of leaf margins ('cup-shaped leaves')",
            "Yellowing (chlorosis) along leaf edges and between veins",
            "Stunted, bushy plant habit with small leathery leaves",
            "Failure to set fruit due to blossom drop"
        ],
        "similar_diseases": ["Tomato Mosaic Virus", "Herbicide Damage"],
        "organic_treatment": "No cure for viral infection. Spray Neem oil (5 ml/L) or install Yellow Sticky Traps (15 traps/acre) to catch whiteflies.",
        "chemical_treatment": "Control vector whiteflies with Imidacloprid 17.8% SL @ 0.5 ml/L or Thiamethoxam 25% WG @ 0.3 g/L.",
        "treatment": "Remove and destroy infected virus-positive plants. Spray Imidacloprid to suppress vector whiteflies.",
        "precautions": "Use TYLCV-resistant tomato hybrids (e.g., Ansal, Abhinav). Install 40-mesh insect netting in greenhouses.",
        "action_timeline": {
            "immediate": "Pull out and destroy stunted virus-curled plants.",
            "day_2_3": "Hang yellow sticky traps and spray Imidacloprid for whiteflies.",
            "day_7": "Inspect young shoot tips for whitefly presence."
        }
    },

    "Tomato___Tomato_mosaic_virus": {
        "scientific_name": "Tomato Mosaic Virus (ToMV)",
        "category": "Viral Pathogen",
        "explanation": "Tomato Mosaic Virus creates mottled green and yellow mosaic patterns on leaves, leaf distortion ('fern-like' leaves), and internal brown necrotic streaking in fruit.",
        "exact_cause": "Mechanical transmission through hands, tools, clothing, and tobacco products. Highly persistent on equipment.",
        "environmental_factors": {
            "temperature": "20°C - 30°C",
            "humidity": "Any",
            "leaf_wetness": "Mechanical contact"
        },
        "visible_symptoms": [
            "Mottled light green and dark green mosaic patterns on leaf surface",
            "Distorted, narrow, fern-like leaf blades ('shoestringing')",
            "Uneven fruit ripening with internal brown necrotic tissue",
            "Stunted plant growth"
        ],
        "similar_diseases": ["Cucumber Mosaic Virus", "2,4-D Herbicide Injury"],
        "organic_treatment": "Incurable. Remove and burn infected plants immediately to save remaining field.",
        "chemical_treatment": "No chemical viricide exists.",
        "treatment": "Destroy infected plants. Dip hands and pruning tools in 20% Non-fat Dry Milk solution or trisodium phosphate.",
        "precautions": "Prohibit smoking or tobacco use near tomato plants. Wash hands thoroughly before handling crop.",
        "action_timeline": {
            "immediate": "Remove infected tomato plants in plastic bags.",
            "day_2_3": "Sanitize all stakes, ties, and pruning tools in bleach solution.",
            "day_7": "Scout neighboring plants for mosaic mottling."
        }
    },

    "Tomato___healthy": {
        "scientific_name": "Solanum lycopersicum",
        "category": "Healthy Foliage",
        "explanation": "The tomato plant is in vibrant health, displaying lush compound green leaves, robust flowering, and clean leaf surfaces without spots, curl, or mold.",
        "exact_cause": "Proper drip irrigation, balanced NPK nutrition, staking, and regular pest scouting.",
        "environmental_factors": {
            "temperature": "20°C - 28°C",
            "humidity": "50% - 70%",
            "leaf_wetness": "Base watered"
        },
        "visible_symptoms": [
            "Rich green foliage free of spots or concentric rings",
            "Erect stems and healthy yellow flowers",
            "Smooth, unblemished green or red fruits"
        ],
        "similar_diseases": ["None"],
        "organic_treatment": "No disease treatment required. Continue organic liquid seaweed or compost tea feeding.",
        "chemical_treatment": "No chemical spray needed.",
        "treatment": "Maintain drip irrigation at soil level and prune bottom suckers periodically.",
        "precautions": "Keep foliage dry and maintain soil mulch cover.",
        "action_timeline": {
            "immediate": "Continue standard garden maintenance.",
            "day_2_3": "Prune non-productive baseline suckers.",
            "day_7": "Routine crop walk."
        }
    },

    # -------------------------------------------------------------------------
    # POTATO DISEASES
    # -------------------------------------------------------------------------
    "Potato___Early_blight": {
        "scientific_name": "Alternaria solani",
        "category": "Fungal Pathogen",
        "explanation": "Early Blight of potato causes dark brown concentric ringed target spots on foliage, leading to premature leaf drop and sunken dark lesions on tubers.",
        "exact_cause": "Overwintering fungal spores in soil debris and nightshade weeds, spread by rain and wind.",
        "environmental_factors": {
            "temperature": "24°C - 29°C",
            "humidity": "80% - 95%",
            "leaf_wetness": "> 4 hours"
        },
        "visible_symptoms": [
            "Dark brown concentric ring spots on lower potato leaves",
            "Yellowing surrounding leaf lesions",
            "Sunken, corky, dark brown decay spots on tubers",
            "Premature vine dying"
        ],
        "similar_diseases": ["Potato Late Blight", "Brown Spot"],
        "organic_treatment": "Spray Copper Octanoate soap or bio-fungicide Bacillus subtilis.",
        "chemical_treatment": "Mancozeb 75% WP @ 2.5 g/L or Chlorothalonil @ 2 g/L.",
        "treatment": "Apply Mancozeb or Chlorothalonil fungicide. Maintain nitrogen fertility.",
        "precautions": "Practice 3-year crop rotation. Ensure proper potato hilling to protect tubers from spores.",
        "action_timeline": {
            "immediate": "Inspect lower canopy leaves for bullseye spots.",
            "day_2_3": "Spray Mancozeb 75% WP @ 2.5 g/L.",
            "day_7": "Check tuber hill coverage."
        }
    },

    "Potato___Late_blight": {
        "scientific_name": "Phytophthora infestans",
        "category": "Water Mold / Oomycete",
        "explanation": "Potato Late Blight is a historic, devastating water mold disease. It causes large, water-soaked dark brown spots on foliage with white downy fungal growth underneath, rotting tubers into malodorous brown mush.",
        "exact_cause": "Rapid airborne sporangia transport during cool, foggy, rainy conditions.",
        "environmental_factors": {
            "temperature": "12°C - 22°C",
            "humidity": "90% - 100%",
            "leaf_wetness": "> 10 hours"
        },
        "visible_symptoms": [
            "Large, dark, water-soaked foliage patches turning black",
            "White velvety fungal halo on leaf underside in moist conditions",
            "Reddish-brown dry rot extending into potato tubers",
            "Rapid total field blighting"
        ],
        "similar_diseases": ["Potato Early Blight", "Frost Damage"],
        "organic_treatment": "Apply Copper Oxychloride 50% WP @ 3 g/L. Destroy infected plants.",
        "chemical_treatment": "Cymoxanil + Mancozeb @ 2 g/L or Metalaxyl + Mancozeb @ 2.5 g/L of water.",
        "treatment": "Spray Cymoxanil or Metalaxyl combination fungicide immediately.",
        "precautions": "Plant certified disease-free seed tubers. Destroy cull piles.",
        "action_timeline": {
            "immediate": "Burn heavily blighted potato vines.",
            "day_2_3": "Spray Cymoxanil + Mancozeb across field.",
            "day_7": "Daily scouting of foliage margins."
        }
    },

    "Potato___healthy": {
        "scientific_name": "Solanum tuberosum",
        "category": "Healthy Foliage",
        "explanation": "The potato crop is completely healthy, featuring dark green compound leaves, sturdy stems, and vigorous tuber development.",
        "exact_cause": "Certified seed tubers, proper soil hilling, balanced moisture, and timely disease monitoring.",
        "environmental_factors": {
            "temperature": "15°C - 24°C",
            "humidity": "50% - 75%",
            "leaf_wetness": "Normal"
        },
        "visible_symptoms": [
            "Lush dark green compound leaves",
            "No water-soaked spots, white mold, or concentric rings",
            "Clean stem bases and good soil hilling"
        ],
        "similar_diseases": ["None"],
        "organic_treatment": "No treatment required. Maintain organic bio-fertilizer and soil hilling.",
        "chemical_treatment": "No chemical treatment needed.",
        "treatment": "Maintain consistent moisture during tuber initiation.",
        "precautions": "Monitor for Colorado potato beetle and blight signs.",
        "action_timeline": {
            "immediate": "Continue normal potato field management.",
            "day_2_3": "Perform soil hilling check.",
            "day_7": "Routine crop walk."
        }
    },

    # -------------------------------------------------------------------------
    # APPLE DISEASES
    # -------------------------------------------------------------------------
    "Apple___Apple_scab": {
        "scientific_name": "Venturia inaequalis",
        "category": "Fungal Pathogen",
        "explanation": "Apple Scab produces olive-green to dark velvety spots on apple leaves and fruit. Affected fruits develop corky brown scab lesions and crack open.",
        "exact_cause": "Ascospores discharged from overwintered leaves during spring rains.",
        "environmental_factors": {
            "temperature": "10°C - 24°C",
            "humidity": "85% - 100%",
            "leaf_wetness": "> 9 hours"
        },
        "visible_symptoms": [
            "Olive-green to velvety brown spots on leaves",
            "Puckered, twisted, or distorted leaf margins",
            "Corky, dark brown scab lesions on apple fruit",
            "Premature leaf and fruit drop"
        ],
        "similar_diseases": ["Frogeye Leaf Spot", "Cedar Apple Rust"],
        "organic_treatment": "Spray Lime Sulfur or Wettable Sulfur (3 g/L) at bud break. Apply Neem oil.",
        "chemical_treatment": "Captan 50% WP @ 2 g/L or Myclobutanil 10% WP @ 0.4 g/L.",
        "treatment": "Spray Captan or Myclobutanil starting at green tip stage through petal fall.",
        "precautions": "Rake and destroy fallen orchard leaves in autumn to eliminate spore reservoirs.",
        "action_timeline": {
            "immediate": "Clear leaf litter beneath tree canopy.",
            "day_2_3": "Apply Captan or Myclobutanil spray.",
            "day_7": "Inspect new shoot leaves for olive spots."
        }
    },

    "Apple___Black_rot": {
        "scientific_name": "Botryosphaeria obtusa",
        "category": "Fungal Pathogen",
        "explanation": "Black Rot causes 'frogeye' leaf spots (purple margins with tan centers), black wood cankers on branches, and black mummified rotting apples.",
        "exact_cause": "Fungal infection overwintering in twig cankers and mummified fruit.",
        "environmental_factors": {
            "temperature": "20°C - 28°C",
            "humidity": "80% - 95%",
            "leaf_wetness": "> 8 hours"
        },
        "visible_symptoms": [
            "Circular leaf spots with purple borders and tan centers ('frogeye spots')",
            "Blackened, rotting fruit with concentric rings of black pycnidia",
            "Sunken reddish-brown to black cankers on tree branches",
            "Fruit shriveling into hard black mummies"
        ],
        "similar_diseases": ["Bitter Rot", "Apple Scab"],
        "organic_treatment": "Prune out infected branches 15 cm below cankers. Apply Liquid Copper.",
        "chemical_treatment": "Thiophanate-methyl 70% WP @ 1 g/L or Captan @ 2 g/L.",
        "treatment": "Prune dead wood and spray Thiophanate-methyl or Captan.",
        "precautions": "Remove all mummified apples from orchard trees during winter pruning.",
        "action_timeline": {
            "immediate": "Prune out diseased canker twigs.",
            "day_2_3": "Spray Thiophanate-methyl @ 1 g/L.",
            "day_7": "Check fruit clusters for frogeye spots."
        }
    },

    "Apple___Cedar_apple_rust": {
        "scientific_name": "Gymnosporangium juniperi-virginianae",
        "category": "Fungal Pathogen",
        "explanation": "Cedar Apple Rust requires both apple trees and Eastern Red Cedar/Juniper trees to complete its life cycle. It creates striking bright yellow-orange leaf spots with tube-like spore cups underneath.",
        "exact_cause": "Spores blown from orange gelatinous galls on nearby juniper trees in spring.",
        "environmental_factors": {
            "temperature": "12°C - 24°C",
            "humidity": "85% - 100%",
            "leaf_wetness": "> 4 hours"
        },
        "visible_symptoms": [
            "Bright orange to yellow circular spots on upper apple leaf surfaces",
            "Tiny black dots (pycnia) inside the orange spots",
            "Cluster cups (aecia) with finger-like tubes on leaf undersides",
            "Premature defoliation"
        ],
        "similar_diseases": ["Quince Rust", "Hawthorn Rust"],
        "organic_treatment": "Spray Sulfur dust or Copper Soap during pink bud stage.",
        "chemical_treatment": "Myclobutanil 10% WP @ 0.4 g/L or Propiconazole @ 1 ml/L.",
        "treatment": "Apply Myclobutanil or Propiconazole from pink bud through petal fall.",
        "precautions": "Remove nearby cedar/juniper trees within 500 meters of the apple orchard.",
        "action_timeline": {
            "immediate": "Locate and remove nearby cedar galls if possible.",
            "day_2_3": "Spray Myclobutanil @ 0.4 g/L.",
            "day_7": "Inspect orange spot containment."
        }
    },

    "Apple___healthy": {
        "scientific_name": "Malus domestica",
        "category": "Healthy Foliage",
        "explanation": "The apple foliage is robust and healthy, showing deep green leaves, smooth leaf margins, clean fruit, and zero rust or scab lesions.",
        "exact_cause": "Good canopy pruning, routine sanitation, and balanced orchard nutrition.",
        "environmental_factors": {
            "temperature": "15°C - 25°C",
            "humidity": "45% - 70%",
            "leaf_wetness": "Normal"
        },
        "visible_symptoms": [
            "Glossy dark green leaves without spots or distortions",
            "Smooth, clean fruit skin",
            "Healthy spur growth"
        ],
        "similar_diseases": ["None"],
        "organic_treatment": "No disease treatment required. Continue compost and micronutrient spray.",
        "chemical_treatment": "No chemical fungicide needed.",
        "treatment": "Maintain annual canopy pruning for solar penetration.",
        "precautions": "Rake autumn leaves annually to prevent fungal carryover.",
        "action_timeline": {
            "immediate": "Continue regular orchard care.",
            "day_2_3": "Monitor fruit sizing.",
            "day_7": "Routine orchard walkthrough."
        }
    },

    # -------------------------------------------------------------------------
    # GRAPE DISEASES
    # -------------------------------------------------------------------------
    "Grape___Black_rot": {
        "scientific_name": "Guignardia bidwellii",
        "category": "Fungal Pathogen",
        "explanation": "Black Rot of grape produces small reddish-brown leaf spots with black borders and shrivels developing berries into hard, black, wrinkled mummies.",
        "exact_cause": "Fungal pycnidia spores overwintering in mummified berries and cane lesions.",
        "environmental_factors": {
            "temperature": "20°C - 30°C",
            "humidity": "85% - 100%",
            "leaf_wetness": "> 7 hours"
        },
        "visible_symptoms": [
            "Small tan to reddish-brown circular spots on leaves with dark borders",
            "Tiny black pinhead dots (pycnidia) arranged in a ring inside leaf spots",
            "Grapes turn brown, shrivel, and transform into hard black mummies",
            "Black lesions on young shoots and petioles"
        ],
        "similar_diseases": ["Phomopsis Cane & Leaf Spot", "Anthracnose"],
        "organic_treatment": "Apply Liquid Copper Soap or Lime Sulfur during early shoot growth.",
        "chemical_treatment": "Myclobutanil 10% WP @ 0.5 g/L or Mancozeb @ 2 g/L.",
        "treatment": "Spray Myclobutanil or Mancozeb starting at 2-inch shoot growth through bloom.",
        "precautions": "Remove all mummified grape clusters during winter pruning. Maintain open canopy.",
        "action_timeline": {
            "immediate": "Prune out mummified berries and diseased canes.",
            "day_2_3": "Spray Myclobutanil @ 0.5 g/L.",
            "day_7": "Check berry clusters for black rot spots."
        }
    },

    "Grape___Esca_(Black_Measles)": {
        "scientific_name": "Phaeomoniella chlamydospora / Phaeoacremonium aleophilum",
        "category": "Fungal Complex",
        "explanation": "Esca (Black Measles) is a destructive trunk disease complex causing characteristic 'tiger-stripe' interveinal leaf yellowing/reddening and dark purple spots ('measles') on grape berries.",
        "exact_cause": "Fungal spores colonizing trunk pruning wounds.",
        "environmental_factors": {
            "temperature": "22°C - 32°C",
            "humidity": "Variable",
            "leaf_wetness": "Pruning wound entry"
        },
        "visible_symptoms": [
            "Interveinal yellow and reddish-brown stripes on leaves ('tiger-stripe pattern')",
            "Small dark purple spots on grape skins ('black measles')",
            "Internal dark wood streaking inside vine trunk",
            "Apoplexy (sudden vine wilting and collapse during summer heat)"
        ],
        "similar_diseases": ["Pierce's Disease", "Nutrient Deficiency"],
        "organic_treatment": "No cure for internal wood fungi. Paint pruning wounds with Trichoderma paste.",
        "chemical_treatment": "No systemic chemical cure available once wood is infected.",
        "treatment": "Surgically excise infected trunk wood or re-train a new sucker from below the lesion.",
        "precautions": "Apply wound sealant paste immediately after winter pruning.",
        "action_timeline": {
            "immediate": "Mark tiger-striped vines for trunk surgery or renewal.",
            "day_2_3": "Seal all fresh pruning cuts with wound paste.",
            "day_7": "Monitor canopy for apoplexy symptoms."
        }
    },

    "Grape___healthy": {
        "scientific_name": "Vitis vinifera",
        "category": "Healthy Foliage",
        "explanation": "The grapevine foliage is completely healthy, exhibiting clean lobed leaves, strong tendril growth, and unblemished fruit clusters.",
        "exact_cause": "Proper canopy hedging, leaf pulling, drip irrigation, and preventative sprays.",
        "environmental_factors": {
            "temperature": "18°C - 28°C",
            "humidity": "45% - 70%",
            "leaf_wetness": "Normal"
        },
        "visible_symptoms": [
            "Vibrant green lobed leaves without striping or spots",
            "Clean, clear berry clusters",
            "Healthy brown canes"
        ],
        "similar_diseases": ["None"],
        "organic_treatment": "No treatment required. Apply compost tea or micronutrient spray.",
        "chemical_treatment": "No chemical fungicide needed.",
        "treatment": "Perform selective leaf pulling around fruit zone for sunlight and airflow.",
        "precautions": "Maintain regular hedging and weed management.",
        "action_timeline": {
            "immediate": "Continue standard vineyard care.",
            "day_2_3": "Perform canopy shoot positioning.",
            "day_7": "Routine vineyard check."
        }
    },

    # -------------------------------------------------------------------------
    # PEPPER / CHILI DISEASES
    # -------------------------------------------------------------------------
    "Pepper,_bell___Bacterial_spot": {
        "scientific_name": "Xanthomonas euvesicatoria",
        "category": "Bacterial Infection",
        "explanation": "Bacterial Spot of pepper produces small water-soaked spots that turn dark brown with yellow halos. Severely affected leaves drop, exposing peppers to sunscald.",
        "exact_cause": "Seed-borne or rain-splashed bacteria active in warm, humid, rainy weather.",
        "environmental_factors": {
            "temperature": "24°C - 32°C",
            "humidity": "85% - 100%",
            "leaf_wetness": "Rain splash & dew"
        },
        "visible_symptoms": [
            "Small water-soaked green-yellow leaf spots turning dark brown",
            "Yellow halo surrounding brown spots",
            "Leaves turn yellow and drop off plant",
            "Raised, corky, rough spots on pepper fruit"
        ],
        "similar_diseases": ["Cercospora Leaf Spot", "Anthracnose"],
        "organic_treatment": "Spray Liquid Copper Soap or Bacteriophages.",
        "chemical_treatment": "Copper Hydroxide 77% WP @ 2 g/L + Streptocycline @ 0.5 g/10L.",
        "treatment": "Apply Copper Hydroxide combined with Streptocycline.",
        "precautions": "Use certified disease-free seeds. Avoid working with wet pepper plants.",
        "action_timeline": {
            "immediate": "Disinfect tools with 70% alcohol.",
            "day_2_3": "Spray Copper Hydroxide + Streptocycline.",
            "day_7": "Inspect new leaf flushes."
        }
    },

    "Pepper,_bell___healthy": {
        "scientific_name": "Capsicum annuum",
        "category": "Healthy Foliage",
        "explanation": "The bell pepper / chili plant is healthy, showing dark green glossy leaves, white flowers, and smooth developing peppers.",
        "exact_cause": "Good soil drainage, steady moisture, and balanced calcium-magnesium nutrition.",
        "environmental_factors": {
            "temperature": "20°C - 30°C",
            "humidity": "50% - 75%",
            "leaf_wetness": "Normal"
        },
        "visible_symptoms": [
            "Glossy dark green leaves free of spots",
            "Sturdy erect plant structure",
            "Smooth, unblemished peppers"
        ],
        "similar_diseases": ["None"],
        "organic_treatment": "No treatment required. Apply bio-fertilizers.",
        "chemical_treatment": "No chemical treatment needed.",
        "treatment": "Maintain base drip irrigation.",
        "precautions": "Monitor for aphids and thrips.",
        "action_timeline": {
            "immediate": "Continue standard care.",
            "day_2_3": "Check drip lines.",
            "day_7": "Routine inspection."
        }
    },

    # -------------------------------------------------------------------------
    # COTTON DISEASES
    # -------------------------------------------------------------------------
    "Cotton___Bacterial_blight": {
        "scientific_name": "Xanthomonas citri pv. malvacearum",
        "category": "Bacterial Infection",
        "explanation": "Cotton Bacterial Blight (Angular Leaf Spot / Blackarm) forms angular water-soaked leaf spots bounded by veinlets, dark stem cankers ('blackarm'), and boll rot.",
        "exact_cause": "Bacterial invasion through stomata promoted by rainstorms, warm humid weather, and contaminated seed.",
        "environmental_factors": {
            "temperature": "28°C - 36°C",
            "humidity": "85% - 100%",
            "leaf_wetness": "Heavy rain splashes"
        },
        "visible_symptoms": [
            "Angular water-soaked spots bounded by small leaf veinlets",
            "Spots turn dark brown to black",
            "Dark black lesions girdling stems ('Blackarm phase')",
            "Sunken dark water-soaked spots on cotton bolls"
        ],
        "similar_diseases": ["Alternaria Leaf Spot", "Cercospora Leaf Spot"],
        "organic_treatment": "Spray Copper Oxychloride @ 3 g/L or Neem cake extract.",
        "chemical_treatment": "Copper Oxychloride 50% WP @ 2.5 g/L + Streptocycline @ 1 g/10L.",
        "treatment": "Spray Copper Oxychloride + Streptocycline at initial angular spot appearance.",
        "precautions": "Delint cotton seeds with acid before sowing. Plant resistant cotton varieties.",
        "action_timeline": {
            "immediate": "Inspect leaf underside for angular water spots.",
            "day_2_3": "Spray Copper Oxychloride + Streptocycline.",
            "day_7": "Check stem nodes for blackarm lesions."
        }
    },

    "Cotton___healthy": {
        "scientific_name": "Gossypium hirsutum",
        "category": "Healthy Foliage",
        "explanation": "The cotton plant is healthy, showing broad lobed green leaves, clean bolls, and robust root anchor.",
        "exact_cause": "Balanced irrigation, timely bollworm control, and clean seed.",
        "environmental_factors": {
            "temperature": "25°C - 35°C",
            "humidity": "50% - 75%",
            "leaf_wetness": "Normal"
        },
        "visible_symptoms": [
            "Broad dark green lobed leaves",
            "Clean bolls free of water-soaked spots",
            "Strong central main stem"
        ],
        "similar_diseases": ["None"],
        "organic_treatment": "No disease treatment required.",
        "chemical_treatment": "No chemical treatment needed.",
        "treatment": "Maintain field weeding and drip schedule.",
        "precautions": "Scout for sucking pests like whiteflies and thrips.",
        "action_timeline": {
            "immediate": "Continue standard cotton management.",
            "day_2_3": "Check boll formation.",
            "day_7": "Routine field walk."
        }
    },

    # -------------------------------------------------------------------------
    # CITRUS / ORANGE DISEASES
    # -------------------------------------------------------------------------
    "Orange___Haunglongbing_(Citrus_greening)": {
        "scientific_name": "Candidatus Liberibacter asiaticus",
        "category": "Bacterial Infection",
        "explanation": "Citrus Greening (Huanglongbing / HLB) is a incurable bacterial disease transmitted by the Asian Citrus Psyllid. It causes yellow asymmetrical leaf mottling, bitter lopsided fruit, and ultimate tree death.",
        "exact_cause": "Vascular bacterial vectoring by Asian Citrus Psyllid (Diaphorina citri).",
        "environmental_factors": {
            "temperature": "20°C - 32°C",
            "humidity": "Variable",
            "leaf_wetness": "Psyllid vector presence"
        },
        "visible_symptoms": [
            "Asymmetrical blotchy yellow mottling across leaf veins",
            "Yellow shoots ('yellow dragon') in green canopy",
            "Small, lopsided, bitter green fruit with dark aborted seeds",
            "Tree dieback and root collapse"
        ],
        "similar_diseases": ["Zinc Deficiency", "Citrus Tristeza Virus"],
        "organic_treatment": "No cure. Control psyllids using Neem oil (5 ml/L) or sticky traps. Remove positive trees.",
        "chemical_treatment": "Control vector psyllids with Imidacloprid 17.8% SL @ 0.5 ml/L or Dimethoate 30% EC @ 1.5 ml/L.",
        "treatment": "Eradicate virus-infected trees immediately and apply systemic insecticide to suppress psyllids.",
        "precautions": "Plant certified disease-free nursery trees under screenhouses.",
        "action_timeline": {
            "immediate": "Mark blotchy-mottled trees for diagnostic testing.",
            "day_2_3": "Spray Imidacloprid to suppress vector psyllids.",
            "day_7": "Remove positive trees to save orchard."
        }
    },

    "Orange___healthy": {
        "scientific_name": "Citrus sinensis",
        "category": "Healthy Foliage",
        "explanation": "The citrus foliage is healthy, showing glossy dark green leaves, fragrant blossoms, and round uniform fruits.",
        "exact_cause": "Good soil drainage, micro-nutrient management (zinc, iron, manganese), and psyllid control.",
        "environmental_factors": {
            "temperature": "20°C - 30°C",
            "humidity": "50% - 70%",
            "leaf_wetness": "Normal"
        },
        "visible_symptoms": [
            "Glossy dark green leaves without mottling",
            "Uniform fruit shape and color",
            "Clean canopy branches"
        ],
        "similar_diseases": ["None"],
        "organic_treatment": "No disease treatment required. Apply compost and micronutrients.",
        "chemical_treatment": "No chemical treatment needed.",
        "treatment": "Maintain micro-irrigation at root zone.",
        "precautions": "Regular scouting for citrus psyllid and leaf miner.",
        "action_timeline": {
            "immediate": "Continue standard orchard management.",
            "day_2_3": "Check micronutrient levels.",
            "day_7": "Routine orchard check."
        }
    },

    # -------------------------------------------------------------------------
    # OTHER CROPS (Peach, Strawberry, Squash, Soybean, Cherry, Blueberry, Raspberry)
    # -------------------------------------------------------------------------
    "Peach___Bacterial_spot": {
        "scientific_name": "Xanthomonas arboricola pv. pruni",
        "category": "Bacterial Infection",
        "explanation": "Bacterial Spot of peach causes small purple/black leaf spots whose centers fall out ('shot-hole' effect) and pitted fruit lesions.",
        "exact_cause": "Bacteria splash-dispersed during spring rainstorms.",
        "environmental_factors": {"temperature": "20°C - 28°C", "humidity": "85% - 100%", "leaf_wetness": "Rain splash"},
        "visible_symptoms": ["Angular dark purple spots on leaves", "Centers fall out creating shot-holes", "Pitted, cracked peach fruit"],
        "similar_diseases": ["Peach Leaf Curl", "Fungal Shot-Hole"],
        "organic_treatment": "Spray Liquid Copper at bud break.",
        "chemical_treatment": "Oxytetracycline @ 1.5 g/L or Copper Hydroxide @ 2 g/L.",
        "treatment": "Apply Copper Hydroxide or Oxytetracycline.",
        "precautions": "Plant resistant cultivars. Avoid high nitrogen.",
        "action_timeline": {"immediate": "Inspect leaves for shot-holes.", "day_2_3": "Spray Copper Hydroxide.", "day_7": "Check fruit set."}
    },

    "Peach___healthy": {
        "scientific_name": "Prunus persica",
        "category": "Healthy Foliage",
        "explanation": "The peach foliage is healthy, featuring lance-shaped dark green leaves and clean stone fruit.",
        "exact_cause": "Pruning, preventative copper sprays, and good nutrition.",
        "environmental_factors": {"temperature": "18°C - 28°C", "humidity": "50% - 70%", "leaf_wetness": "Normal"},
        "visible_symptoms": ["Lanceolate dark green leaves", "No shot-holes or leaf curl"],
        "similar_diseases": ["None"],
        "organic_treatment": "No treatment required.", "chemical_treatment": "No chemical needed.",
        "treatment": "Routine orchard care.", "precautions": "Monitor for borer insects.",
        "action_timeline": {"immediate": "Normal care.", "day_2_3": "Irrigation check.", "day_7": "Routine walk."}
    },

    "Squash___Powdery_mildew": {
        "scientific_name": "Podosphaera xanthii",
        "category": "Fungal Pathogen",
        "explanation": "Powdery Mildew of squash coats leaf surfaces in white flour-like fungal dust, causing leaves to yellow, dry up, and die prematurely.",
        "exact_cause": "Windborne fungal spores active in warm dry weather with high humidity.",
        "environmental_factors": {"temperature": "20°C - 30°C", "humidity": "70% - 90%", "leaf_wetness": "High RH"},
        "visible_symptoms": ["White powdery circular patches on leaves and stems", "Leaves yellow, brown, and turn brittle", "Sunscald on exposed squash"],
        "similar_diseases": ["Downy Mildew"],
        "organic_treatment": "Spray Potassium Bicarbonate (5 g/L) or Neem oil (5 ml/L) or 10% Whey.",
        "chemical_treatment": "Chlorothalonil @ 2 g/L or Myclobutanil @ 0.5 g/L.",
        "treatment": "Spray Chlorothalonil or Potassium Bicarbonate.",
        "precautions": "Plant in full sun with wide plant spacing.",
        "action_timeline": {"immediate": "Prune old white-dusted leaves.", "day_2_3": "Apply Chlorothalonil spray.", "day_7": "Re-check leaf undersides."}
    },

    "Strawberry___Leaf_scorch": {
        "scientific_name": "Diplocarpon earlianum",
        "category": "Fungal Pathogen",
        "explanation": "Strawberry Leaf Scorch forms dark purple spots on leaves that coalesce, giving the foliage a scorched, fire-burned appearance.",
        "exact_cause": "Fungal conidia spread by rain splash.",
        "environmental_factors": {"temperature": "18°C - 26°C", "humidity": "80% - 95%", "leaf_wetness": "> 6 hours"},
        "visible_symptoms": ["Irregular purple blotches without white centers", "Lesions merge turning leaf brown and dry", "Scorched, burned leaf margins"],
        "similar_diseases": ["Strawberry Common Leaf Spot", "Leaf Blight"],
        "organic_treatment": "Spray Copper soap or Neem oil.",
        "chemical_treatment": "Captan 50% WP @ 2 g/L or Myclobutanil @ 0.4 g/L.",
        "treatment": "Prune old spotted leaves and spray Captan.",
        "precautions": "Use straw mulch and drip irrigation.",
        "action_timeline": {"immediate": "Remove dead purple leaves.", "day_2_3": "Spray Captan.", "day_7": "Check runner plants."}
    },

    "Strawberry___healthy": {
        "scientific_name": "Fragaria × ananassa",
        "category": "Healthy Foliage",
        "explanation": "Strawberry plants are healthy with deep green serrated trifoliate leaves and clean red berries.",
        "exact_cause": "Good mulch, drip watering, and clean runners.",
        "environmental_factors": {"temperature": "15°C - 25°C", "humidity": "50% - 70%", "leaf_wetness": "Normal"},
        "visible_symptoms": ["Glossy serrated green leaves", "No purple blotches"],
        "similar_diseases": ["None"],
        "organic_treatment": "No treatment required.", "chemical_treatment": "No chemical needed.",
        "treatment": "Routine strawberry bed care.", "precautions": "Keep berries off bare dirt.",
        "action_timeline": {"immediate": "Normal care.", "day_2_3": "Mulch check.", "day_7": "Routine walk."}
    },

    "Soybean___healthy": {
        "scientific_name": "Glycine max",
        "category": "Healthy Foliage",
        "explanation": "Soybean plants are healthy with rich green foliage and active root nodulation.",
        "exact_cause": "Bradyrhizobium inoculation and optimal moisture.",
        "environmental_factors": {"temperature": "20°C - 30°C", "humidity": "50% - 75%", "leaf_wetness": "Normal"},
        "visible_symptoms": ["Solid green trifoliate leaves", "No rust pustules or spots"],
        "similar_diseases": ["None"],
        "organic_treatment": "No treatment required.", "chemical_treatment": "No chemical needed.",
        "treatment": "Routine field care.", "precautions": "Scout for soybean aphids.",
        "action_timeline": {"immediate": "Normal field walk.", "day_2_3": "Moisture check.", "day_7": "Routine walk."}
    },

    "Blueberry___healthy": {
        "scientific_name": "Vaccinium corymbosum",
        "category": "Healthy Foliage",
        "explanation": "Blueberry foliage is healthy with smooth green leaves and acidic soil balance.",
        "exact_cause": "Soil pH 4.5-5.5, pine bark mulch, and drip irrigation.",
        "environmental_factors": {"temperature": "15°C - 25°C", "humidity": "50% - 70%", "leaf_wetness": "Normal"},
        "visible_symptoms": ["Glossy green leaves", "No spots or tip burn"],
        "similar_diseases": ["None"],
        "organic_treatment": "No treatment required.", "chemical_treatment": "No chemical needed.",
        "treatment": "Maintain soil acidification.", "precautions": "Keep soil pH between 4.5-5.2.",
        "action_timeline": {"immediate": "Normal care.", "day_2_3": "pH test.", "day_7": "Routine walk."}
    },

    "Cherry___Powdery_mildew": {
        "scientific_name": "Podosphaera clandestina",
        "category": "Fungal Pathogen",
        "explanation": "Cherry Powdery Mildew coats young leaves and shoot tips in white powdery fungal mats, causing leaf curling and distorted fruit growth.",
        "exact_cause": "Airborne spores active in humid shaded cherry canopies.",
        "environmental_factors": {"temperature": "15°C - 24°C", "humidity": "70% - 90%", "leaf_wetness": "High RH"},
        "visible_symptoms": ["White powdery patches on leaf underside", "Upward leaf rolling and blistering", "Stunted shoot tips"],
        "similar_diseases": ["Dust Residue"],
        "organic_treatment": "Spray Wettable Sulfur (3 g/L) or Neem oil.",
        "chemical_treatment": "Myclobutanil @ 0.4 g/L or Tebuconazole @ 1 ml/L.",
        "treatment": "Spray Wettable Sulfur or Myclobutanil.",
        "precautions": "Prune for inner canopy sunlight.",
        "action_timeline": {"immediate": "Prune shaded dense shoots.", "day_2_3": "Spray Wettable Sulfur.", "day_7": "Check shoot tips."}
    },

    "Cherry___healthy": {
        "scientific_name": "Prunus avium",
        "category": "Healthy Foliage",
        "explanation": "Cherry foliage is in excellent health with vibrant green leaves and clean fruit.",
        "exact_cause": "Good canopy pruning and preventative sulfur sprays.",
        "environmental_factors": {"temperature": "15°C - 25°C", "humidity": "50% - 70%", "leaf_wetness": "Normal"},
        "visible_symptoms": ["Smooth green leaves", "No white mildew mats"],
        "similar_diseases": ["None"],
        "organic_treatment": "No treatment required.", "chemical_treatment": "No chemical needed.",
        "treatment": "Routine orchard care.", "precautions": "Protect ripening cherry fruit from birds.",
        "action_timeline": {"immediate": "Normal care.", "day_2_3": "Pruning check.", "day_7": "Routine walk."}
    },

    "Raspberry___healthy": {
        "scientific_name": "Rubus idaeus",
        "category": "Healthy Foliage",
        "explanation": "Raspberry canes and leaves are healthy with bright green foliage and clean canes.",
        "exact_cause": "Caning pruning, good trellis support, and drip irrigation.",
        "environmental_factors": {"temperature": "15°C - 25°C", "humidity": "50% - 70%", "leaf_wetness": "Normal"},
        "visible_symptoms": ["Clean green leaves", "No cane rust or anthracnose spots"],
        "similar_diseases": ["None"],
        "organic_treatment": "No treatment required.", "chemical_treatment": "No chemical needed.",
        "treatment": "Prune spent floricanes.", "precautions": "Maintain trellis support.",
        "action_timeline": {"immediate": "Normal care.", "day_2_3": "Trellis check.", "day_7": "Routine walk."}
    }
}


TELUGU_DISEASE_OVERRIDES = {
    "Wheat___Stripe_rust": {
        "category": "శిలీంధ్ర తెగులు (Fungal Pathogen)",
        "explanation": "గోధుమ పసుపు కుంకుమ తెగులు (Wheat Stripe Rust) అనేది ఆకులపై పసుపు-నారింజ మచ్చలను చారల రూపంలో ఏర్పరిచే తీవ్రమైన శిలీంధ్ర వ్యాధి. ఇది కిరణజన్య సంయోగక్రియను తగ్గించి 70% వరకు దిగుబడి నష్టాన్ని కలిగిస్తుంది.",
        "exact_cause": "గాలి ద్వారా వ్యాపించే పసుపు కుంకుమ శిలీంధ్ర బీజాలు. చల్లని వాతావరణం (10°C నుండి 15°C) మరియు ఆకులపై ఎక్కువ సమయం తేమ ఉండటం దీనికి కారణం.",
        "visible_symptoms": [
            "ఆకులపై పొడవైన వరుసలలో చారలుగా ఏర్పడే పసుపు-నారింజ రంగు మచ్చలు",
            "తెగులు సోకిన ఆకులు ఎండిపోయి రాలిపోవడం",
            "గింజ సైజు తగ్గిపోవడం మరియు శ్రమ నష్టం"
        ],
        "organic_treatment": "మొదటి దశలోనే వేప నూనె (5 ml/లీటర్) లేదా వెల్లుల్లి కషాయం (20 ml/లీటర్) పిచికారీ చేయండి. ట్రెకోడెర్మా విరిడే వాడండి.",
        "chemical_treatment": "ప్రొపికోనజోల్ 25% EC (1 ml/లీటర్) లేదా టెబుకోనజోల్ 25.9% EC (1.5 ml/లీటర్) నీటిలో కలిపి పిచికారీ చేయండి. 14 రోజుల తర్వాత మళ్లీ పిచికారీ చేయండి.",
        "treatment": "ప్రొపికోనజోల్ లేదా టెబుకోనజోల్ వంటి శిలీంధ్ర నాశినులను వెంటనే పిచికారీ చేయండి.",
        "precautions": "తెగులును తట్టుకునే రకాలను విత్తుకోండి. నత్రజని ఎరువుల వాడకాన్ని పరిమితంగా ఉంచండి.",
        "action_timeline": {
            "immediate": "తెగులు సోకిన భాగాలను గుర్తించి గాలి ద్వారా వ్యాప్తి చెందకుండా చూడండి.",
            "day_2_3": "ఉదయం పూట ప్రొపికోనజోల్ లేదా టెబుకోనజోల్ పిచికారీ చేయండి.",
            "day_7": "పంటను మళ్లీ పరిశీలించి కొత్త మచ్చలు రాకుండా చూసుకోండి."
        }
    },
    "Rice___Blast": {
        "category": "శిలీంధ్ర తెగులు (Fungal Pathogen)",
        "explanation": "వరి అగ్గి/రాగి తెగులు (Rice Blast) వరి పంటకు తీవ్ర నష్టం కలిగించే ప్రధాన వ్యాధి. ఇది ఆకులపై నూలు కండ్ర (కంటి) ఆకారపు తెల్లటి/బూడిద రంగు మచ్చలను ఏర్పరుస్తుంది.",
        "exact_cause": "గాలి మరియు వర్షపు బిందువుల ద్వారా శిలీంధ్ర బీజాలు వ్యాపిస్తాయి. అధిక తేమ (>90%), రాత్రి పూట చల్లని ఉష్ణోగ్రత మరియు నత్రజని ఎక్కువ అవ్వడం వల్ల వేగంగా వ్యాపిస్తుంది.",
        "visible_symptoms": [
            "ఆకులపై కంటి ఆకారపు (నూలు కండ్ర) బూడిద/తెలుపు రంగు మచ్చలు",
            "మచ్చల చుట్టూ ముదురు గోధుమ రంగు సరిహద్దులు",
            "మెడ విరుపు తెగులు (Neck Blast) వలన కంకులు ఎండిపోయి గింజలు కాకపోవడం",
            "కణుపులు నల్లబడి కాండం విరిగిపోవడం"
        ],
        "organic_treatment": "సూడోమోనాస్ ఫ్లోరోసెన్స్ (10 గ్రా/లీటర్) లేదా వేప పిండి కషాయం (5%) పిచికారీ చేయండి.",
        "chemical_treatment": "ట్రైసైక్లాజోల్ 75% WP (0.6 గ్రా/లీటర్) లేదా ఐసోప్రోతియోలేన్ 40% EC (1.5 ml/లీటర్) పిచికారీ చేయండి.",
        "treatment": "ట్రైసైక్లాజోల్ 75% WP లేదా కసుగామైసిన్ వెంటనే పిచికారీ చేయండి.",
        "precautions": "నత్రజని ఎరువులను ఒకేసారి కాకుండా 3-4 విడతలుగా వేయండి. పొలంలో నీటి మట్టాన్ని సరిగ్గా నిర్వహించండి.",
        "action_timeline": {
            "immediate": "నత్రజని ఎరువులు వేయడం తాత్కాలికంగా నిలిపివేయండి.",
            "day_2_3": "ట్రైసైక్లాజోల్ 75% WP @ 0.6 గ్రా/లీటర్ చొప్పున పిచికారీ చేయండి.",
            "day_7": "కొత్త ఆకులు మరియు కంకులను తనిఖీ చేసి తెగులు అదుపులోకి వచ్చిందో లేదో చూడండి."
        }
    },
    "Corn___Common_rust": {
        "category": "శిలీంధ్ర తెగులు (Fungal Pathogen)",
        "explanation": "మొక్కజొన్న కుంకుమ తెగులు (Corn Common Rust) ఆకులపై ఎరుపు-గోధుమ రంగు పొడి మచ్చలను ఏర్పరుస్తుంది. ఇది ఆకుల కాంతి గ్రహణ शक्तिని తగ్గిస్తుంది.",
        "exact_cause": "గాలి ద్వారా పక్షులు/గాలి వీచే దిశలో వ్యాపించే శిలీంధ్ర బీజాలు.",
        "visible_symptoms": [
            "ఆకు ఉపరితలంపై చిన్న ఎరుపు-గోధుమ రంగు మచ్చలు",
            "ఆకులు త్వరగా ఎండిపోవడం",
            "మొక్కజొన్న పొత్తుల సైజు తగ్గడం"
        ],
        "organic_treatment": "వేప నూనె (5 ml/లీటర్) లేదా గంధకం (3 గ్రా/లీటర్) పిచికారీ చేయండి.",
        "chemical_treatment": "మ్యాంకోజెబ్ 75% WP (2 గ్రా/లీటర్) లేదా ప్రొపికోనజోల్ (1 ml/లీటర్) పిచికారీ చేయండి.",
        "treatment": "మ్యాంకోజెబ్ లేదా ప్రొపికోనజోల్ పిచికారీ చేయండి.",
        "precautions": "తెగులును తట్టుకునే విత్తనాలను వాడండి.",
        "action_timeline": {
            "immediate": "మచ్చలు ఉన్న ఆకులను గమనించండి.",
            "day_2_3": "మ్యాంకోజెబ్ పిచికారీ చేయండి.",
            "day_7": "పంట పరిస్థితిని మళ్లీ పరిశీలించండి."
        }
    },
    "Tomato___Late_blight": {
        "category": "శిలీంధ్ర తెగులు (Fungal/Oomycete)",
        "explanation": "టమాటా లేట్ బ్లైట్ తెగులు ఆకులు మరియు కాయలపై నల్లటి నీటి మచ్చలను ఏర్పరిచి పంటను వేగంగా నాశనం చేస్తుంది.",
        "exact_cause": "ఫైటోఫ్తోరా ఇన్ఫెస్టాన్స్ (Phytophthora infestans) శిలీంధ్రం. చల్లని తేమతో కూడిన వాతావరణంలో వ్యాపిస్తుంది.",
        "visible_symptoms": [
            "ఆకులపై పెద్ద నల్లటి లేదా గోధుమ రంగు నీటి మచ్చలు",
            "ఆకు అడుగు భాగంలో తెల్లటి బూజు పటలం",
            "కాయ కుళ్ళు వ్యాధి"
        ],
        "organic_treatment": "రాగి (Copper Soap) నివారణ మందు లేదా ట్రెకోడెర్మా విరిడే పిచికారీ చేయండి.",
        "chemical_treatment": "మెటలాక్సిల్ + మ్యాంకోజెబ్ (2 గ్రా/లీటర్) లేదా సైమోక్సానిల్ + మ్యాంకోజెబ్ పిచికారీ చేయండి.",
        "treatment": "మెటలాక్సిల్ + మ్యాంకోజెబ్ లేదా రాగి ఆధారిత మందులు పిచికారీ చేయండి.",
        "precautions": "డ్రిప్ సేద్యం ఉపయోగించండి. ఆకులపై నీరు నిలవకుండా చూడండి.",
        "action_timeline": {
            "immediate": "తీవ్రంగా సోకిన ఆకులను కత్తిరించండి.",
            "day_2_3": "మెటలాక్సిల్ + మ్యాంకోజెబ్ పిచికారీ చేయండి.",
            "day_7": "కొత్త చిగుళ్లను పరిశీలించండి."
        }
    }
}


def localize_info_to_telugu(info: dict, class_name: str) -> dict:
    if class_name in TELUGU_DISEASE_OVERRIDES:
        res = dict(info)
        res.update(TELUGU_DISEASE_OVERRIDES[class_name])
        return res

    res = dict(info)
    is_healthy = "healthy" in class_name.lower()

    if is_healthy:
        res["category"] = "ఆరోగ్యకరమైన ఆకులు (Healthy Foliage)"
        res["explanation"] = "మొక్కల ఆకులు పూర్తి ఆరోగ్యకరమైన స్థితిలో ఉన్నాయి. ఎటువంటి తెగుళ్లు లేదా వ్యాధి సంకేతాలు లేవు."
        res["exact_cause"] = "సమతుల్య నీటి యాజమాన్యం మరియు సరియైన పోషకాలు."
        res["organic_treatment"] = "ఎటువంటి చికిత్స అవసరం లేదు. సేంద్రీయ ఎరువులు అందించండి."
        res["chemical_treatment"] = "రసాయన మందులు అవసరం లేదు."
        res["treatment"] = "సరియైన నీటి యాజమాన్యం కొనసాగించండి."
        res["precautions"] = "పొలాన్ని శుభ్రంగా ఉంచండి."
        res["visible_symptoms"] = ["ఆరోగ్యకరమైన ఆకుపచ్చ ఆకులు", "మచ్చలు లేకపోవడం"]
        res["action_timeline"] = {
            "immediate": "సాధారణ సంరక్షణ కొనసాగించండి.",
            "day_2_3": "నేల తేమను తనిఖీ చేయండి.",
            "day_7": "వారపు తనిఖీ చేయండి."
        }
    else:
        res["category"] = "శిలీంధ్ర / బాక్టీరియల్ తెగులు (Pathogen)"
        res["explanation"] = f"AI నిర్ధారణ ప్రకారము పంట ఆకులపై తెగులు సంకేతాలు గుర్తించబడ్డాయి ({class_name.replace('___', ' ')}). దిగుబడి నష్టం జరగకుండా వెంటనే నివారణ చర్యలు తీసుకోండి."
        res["exact_cause"] = "గాలి లేదా నీటి ద్వారా వ్యాపించే శిలీంధ్ర/బాక్టీరియా బీజాలు."
        res["organic_treatment"] = "వేప నూనె (5 ml/లీటర్) లేదా గంధకం ఆధారిత నివారణ పిచికారీ చేయండి."
        res["chemical_treatment"] = "మ్యాంకోజెబ్ 75% WP (2 గ్రా/లీటర్) లేదా కాపర్ ఆక్సీక్లోరైడ్ పిచికారీ చేయండి."
        res["treatment"] = "శిలీంధ్ర నాశిని లేదా సూచించిన మందును పిచికారీ చేయండి."
        res["precautions"] = "తెగులు సోకిన మొక్కల ఆకులను తొలగించి దూరంగా పారవేయండి."
        res["action_timeline"] = {
            "immediate": "తెగులు సోకిన ఆకులను తీసివేయండి.",
            "day_2_3": "శిలీంధ్ర నాశిని పిచికారీ చేయండి.",
            "day_7": "పంట పరిస్థితిని పరిశీలించండి."
        }

    return res


def get_disease_info(class_name: str, lang: str = 'en'):
    """
    Retrieves rich, expert diagnostic information for the specified disease/crop class.
    Provides robust fallbacks for unknown or custom multi-spectral lookups.
    """
    if class_name in DISEASE_INFO:
        base_info = DISEASE_INFO[class_name]
    else:
        # Generic intelligent fallback generator if class key is not an exact match
        disease_lower = class_name.lower()
        crop_parts = class_name.split('___')
        crop_name = crop_parts[0].replace('_', ' ') if len(crop_parts) > 1 else class_name.split(' ')[0]
        cond_name = crop_parts[1].replace('_', ' ') if len(crop_parts) > 1 else class_name
        
        if "healthy" in disease_lower:
            base_info = {
                "scientific_name": f"{crop_name} (Healthy State)",
                "category": "Healthy Foliage",
                "explanation": f"The {crop_name} plant foliage is in healthy condition with vibrant green tissue structure and zero signs of pathogen infection or pest damage.",
                "exact_cause": "Balanced irrigation, optimal nutrient supply, and effective pest management.",
                "environmental_factors": {"temperature": "18°C - 28°C", "humidity": "50% - 70%", "leaf_wetness": "Normal"},
                "visible_symptoms": ["Uniform green leaf blade", "No spots, lesions, or curling", "Healthy turgid foliage"],
                "similar_diseases": ["None"],
                "organic_treatment": "No treatment required. Apply organic compost tea or bio-fertilizer as needed.",
                "chemical_treatment": "No chemical treatment required.",
                "treatment": "Maintain regular watering at soil level and routine field scouting.",
                "precautions": "Maintain crop hygiene and weed control.",
                "action_timeline": {"immediate": "Continue standard care.", "day_2_3": "Monitor soil moisture.", "day_7": "Routine check."}
            }
        elif "rust" in disease_lower:
            base_info = {
                "scientific_name": f"Puccinia / Uromyces sp. on {crop_name}",
                "category": "Fungal Pathogen",
                "explanation": f"Symptoms indicate Rust infection on {crop_name}. Rust fungi form reddish-brown or golden powdery pustules on leaves, reducing plant vigor.",
                "exact_cause": "Airborne fungal spores active in humid weather with moderate temperatures.",
                "environmental_factors": {"temperature": "15°C - 24°C", "humidity": "80% - 95%", "leaf_wetness": "> 6 hours"},
                "visible_symptoms": ["Reddish-brown or yellow powdery pustules", "Chlorotic halos around rust spots", "Leaf browning and leaf drop"],
                "similar_diseases": ["Mite Damage", "Nutrient Spotting"],
                "organic_treatment": "Dust Wettable Sulfur (3 g/L) or spray Neem oil (5 ml/L).",
                "chemical_treatment": "Propiconazole 25% EC @ 1 ml/L or Mancozeb 75% WP @ 2 g/L.",
                "treatment": "Apply Propiconazole or Mancozeb fungicide.",
                "precautions": "Ensure good field ventilation and avoid overhead irrigation.",
                "action_timeline": {"immediate": "Identify rust pustules.", "day_2_3": "Spray Propiconazole.", "day_7": "Check new leaf flushes."}
            }
        elif "blight" in disease_lower:
            base_info = {
                "scientific_name": f"Necrotic Pathogen on {crop_name}",
                "category": "Fungal / Oomycete Pathogen",
                "explanation": f"Symptoms align with Blight on {crop_name}. Blight causes rapidly expanding dark brown water-soaked spots, tissue necrosis, and severe defoliation.",
                "exact_cause": "Fungal spores or water molds spread by wind and rain splashes.",
                "environmental_factors": {"temperature": "18°C - 28°C", "humidity": "85% - 100%", "leaf_wetness": "> 8 hours"},
                "visible_symptoms": ["Large dark brown water-soaked patches", "Yellow halos and wilting", "Rapid tissue decay"],
                "similar_diseases": ["Frost Injury", "Severe Sunburn"],
                "organic_treatment": "Prune infected leaves. Spray Copper Oxychloride @ 3 g/L or Trichoderma.",
                "chemical_treatment": "Mancozeb 75% WP @ 2.5 g/L or Chlorothalonil @ 2 g/L.",
                "treatment": "Spray Mancozeb or Chlorothalonil fungicide immediately.",
                "precautions": "Mulch plant bases and avoid wet foliage overnight.",
                "action_timeline": {"immediate": "Prune blighted leaves.", "day_2_3": "Apply Mancozeb spray.", "day_7": "Check leaf margins."}
            }
        else:
            base_info = {
                "scientific_name": f"Pathogen / Stress on {crop_name}",
                "category": "Agronomic Condition",
                "explanation": f"AI diagnosis identified {cond_name} on {crop_name}. This condition requires targeted agronomic intervention to prevent yield drop.",
                "exact_cause": "Pathogen infection or environmental stress under high humidity or temperature extremes.",
                "environmental_factors": {"temperature": "20°C - 30°C", "humidity": "70% - 90%", "leaf_wetness": "Variable"},
                "visible_symptoms": ["Leaf discoloration or spots", "Structural foliage stress", "Reduced growth rate"],
                "similar_diseases": ["General Foliar Stress"],
                "organic_treatment": "Apply Neem oil formulation (5 ml/L) or Copper soap.",
                "chemical_treatment": "Apply broad-spectrum fungicide (Chlorothalonil @ 2 g/L).",
                "treatment": "Apply broad-spectrum protectant spray and isolate affected plants.",
                "precautions": "Maintain optimal irrigation and soil fertility.",
                "action_timeline": {"immediate": "Inspect foliage.", "day_2_3": "Apply protectant spray.", "day_7": "Re-examine plant."}
            }

    if lang and str(lang).lower().startswith('te'):
        return localize_info_to_telugu(base_info, class_name)

    return base_info

