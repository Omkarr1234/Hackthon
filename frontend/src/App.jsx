import React, { useEffect, useMemo, useRef, useState } from "react";
import "./App.css";

/*
  ================================================================
  AGRI SAATHI AI — FARMSENSE PS-01
  ================================================================

  THREE-FILE VERSION
  ---------------------------------------------------------------
  Files: App.jsx + App.css + main.jsx.
  No data.js is required; the agriculture database stays in App.jsx.

  HACKATHON PROBLEM FOCUS: PS-01 FARM SENSE
  ---------------------------------------------------------------
  "Given today's soil, weather and crop conditions, what should
   this farmer do next, when should they do it, and why?"

  CORE FLOW
  ---------------------------------------------------------------
  Farm profile + field observations + weather
                     ↓
                 Assessment
                     ↓
                Risk / Need
                     ↓
                Recommendation
                     ↓
                 Explanation
                     ↓
              History / Alerts

  TWO MAIN DATA SOURCES SHOWN IN THE PROTOTYPE
  ---------------------------------------------------------------
  1. Farmer / farm / field observations
     - crop
     - area
     - growth stage
     - soil type
     - soil moisture
     - irrigation availability

  2. Weather observations / forecast inputs
     - temperature
     - humidity
     - rain in previous 24h
     - rain in next 24h
     - rain in next 3 days

  OPTIONAL REAL AI CONNECTION
  ---------------------------------------------------------------
  Set AI_API_URL below or use /api/chat.
  The frontend never contains an API key.

  OPTIONAL REAL VISION CONNECTION
  ---------------------------------------------------------------
  Use /api/plant/analyze for actual image-model analysis.
  This frontend never invents a disease diagnosis or fake image
  confidence score when a vision backend is absent.

  IMPORTANT
  ---------------------------------------------------------------
  The local FarmSense decision engine is a transparent prototype,
  not an agronomic laboratory model. It is intended for the demo
  and explainability layer. Production deployment should use
  validated agronomic thresholds, local weather, soil tests,
  crop-specific extension recommendations and expert review.
*/

/* ================================================================
   1. OPTIONAL AI ENDPOINTS
   ================================================================ */

const AI_API_URL = "";
const VISION_API_URL = "";


/* ================================================================
   2. COMPLETE CROP DATABASE FROM THE PREVIOUS PROJECT
   ================================================================ */

const PLANTS = [
  {
    "id": "rice",
    "name": "Rice / Paddy",
    "category": "Cereal",
    "icon": "🌾",
    "season": "Kharif",
    "soil": "Clayey or loamy soil with good water retention",
    "water": "High",
    "temperature": "20–35°C",
    "harvest": "110–150 days",
    "description": "Major cereal crop requiring warm and humid conditions.",
    "diseases": [
      "Rice Blast",
      "Brown Planthopper",
      "Bacterial Leaf Blight",
      "Sheath Blight",
      "Stem Borer"
    ]
  },
  {
    "id": "wheat",
    "name": "Wheat",
    "category": "Cereal",
    "icon": "🌾",
    "season": "Rabi",
    "soil": "Well-drained loamy soil",
    "water": "Medium",
    "temperature": "15–25°C",
    "harvest": "110–150 days",
    "description": "Important winter cereal crop.",
    "diseases": [
      "Leaf Rust",
      "Stripe Rust",
      "Powdery Mildew",
      "Aphids",
      "Termites"
    ]
  },
  {
    "id": "maize",
    "name": "Maize / Corn",
    "category": "Cereal",
    "icon": "🌽",
    "season": "Kharif / Rabi",
    "soil": "Well-drained fertile soil",
    "water": "Medium",
    "temperature": "18–32°C",
    "harvest": "90–120 days",
    "description": "Versatile cereal crop used for food, feed and industry.",
    "diseases": [
      "Fall Armyworm",
      "Corn Leaf Blight",
      "Stem Borer",
      "Rust",
      "Downy Mildew"
    ]
  },
  {
    "id": "millet",
    "name": "Millet",
    "category": "Cereal",
    "icon": "🌾",
    "season": "Kharif",
    "soil": "Light and well-drained soil",
    "water": "Low",
    "temperature": "25–35°C",
    "harvest": "70–100 days",
    "description": "Drought-tolerant cereal suitable for dry regions.",
    "diseases": [
      "Downy Mildew",
      "Blast",
      "Rust",
      "Shoot Fly"
    ]
  },
  {
    "id": "sugarcane",
    "name": "Sugarcane",
    "category": "Commercial",
    "icon": "🎋",
    "season": "Year-round",
    "soil": "Deep fertile loamy soil",
    "water": "High",
    "temperature": "20–35°C",
    "harvest": "10–18 months",
    "description": "Long-duration commercial crop.",
    "diseases": [
      "Red Rot",
      "Smut",
      "Wilt",
      "Early Shoot Borer",
      "Whitefly"
    ]
  },
  {
    "id": "cotton",
    "name": "Cotton",
    "category": "Commercial",
    "icon": "☁️",
    "season": "Kharif",
    "soil": "Black soil is commonly suitable",
    "water": "Medium",
    "temperature": "21–30°C",
    "harvest": "150–180 days",
    "description": "Important fibre crop.",
    "diseases": [
      "Bollworm",
      "Whitefly",
      "Leaf Curl Virus",
      "Wilt",
      "Bacterial Blight"
    ]
  },
  {
    "id": "tomato",
    "name": "Tomato",
    "category": "Vegetable",
    "icon": "🍅",
    "season": "Multiple seasons",
    "soil": "Well-drained loamy soil",
    "water": "Medium",
    "temperature": "20–30°C",
    "harvest": "60–90 days",
    "description": "Popular vegetable crop grown across India.",
    "diseases": [
      "Early Blight",
      "Late Blight",
      "Leaf Curl Virus",
      "Bacterial Wilt",
      "Fruit Borer"
    ]
  },
  {
    "id": "potato",
    "name": "Potato",
    "category": "Vegetable",
    "icon": "🥔",
    "season": "Rabi",
    "soil": "Loose sandy loam",
    "water": "Medium",
    "temperature": "15–25°C",
    "harvest": "70–120 days",
    "description": "Important tuber crop.",
    "diseases": [
      "Late Blight",
      "Early Blight",
      "Bacterial Wilt",
      "Aphids",
      "Tuber Moth"
    ]
  },
  {
    "id": "onion",
    "name": "Onion",
    "category": "Vegetable",
    "icon": "🧅",
    "season": "Rabi / Kharif",
    "soil": "Well-drained loamy soil",
    "water": "Medium",
    "temperature": "13–25°C",
    "harvest": "90–150 days",
    "description": "Bulb vegetable widely cultivated in India.",
    "diseases": [
      "Purple Blotch",
      "Downy Mildew",
      "Thrips",
      "Basal Rot",
      "Stemphylium Blight"
    ]
  },
  {
    "id": "chilli",
    "name": "Chilli",
    "category": "Vegetable",
    "icon": "🌶️",
    "season": "Multiple seasons",
    "soil": "Well-drained loamy soil",
    "water": "Medium",
    "temperature": "20–30°C",
    "harvest": "120–150 days",
    "description": "Important spice and vegetable crop.",
    "diseases": [
      "Leaf Curl Virus",
      "Anthracnose",
      "Thrips",
      "Powdery Mildew",
      "Fruit Rot"
    ]
  },
  {
    "id": "brinjal",
    "name": "Brinjal / Eggplant",
    "category": "Vegetable",
    "icon": "🍆",
    "season": "Multiple seasons",
    "soil": "Fertile well-drained soil",
    "water": "Medium",
    "temperature": "21–30°C",
    "harvest": "100–140 days",
    "description": "Warm-season vegetable crop.",
    "diseases": [
      "Shoot and Fruit Borer",
      "Bacterial Wilt",
      "Little Leaf",
      "Phomopsis Blight",
      "Aphids"
    ]
  },
  {
    "id": "okra",
    "name": "Okra / Bhindi",
    "category": "Vegetable",
    "icon": "🥬",
    "season": "Kharif / Summer",
    "soil": "Well-drained loamy soil",
    "water": "Medium",
    "temperature": "24–32°C",
    "harvest": "45–65 days",
    "description": "Fast-growing vegetable crop.",
    "diseases": [
      "Yellow Vein Mosaic",
      "Fruit Borer",
      "Aphids",
      "Jassids",
      "Powdery Mildew"
    ]
  },
  {
    "id": "groundnut",
    "name": "Groundnut / Peanut",
    "category": "Oilseed",
    "icon": "🥜",
    "season": "Kharif",
    "soil": "Sandy loam",
    "water": "Medium",
    "temperature": "25–30°C",
    "harvest": "90–120 days",
    "description": "Important oilseed and food crop.",
    "diseases": [
      "Groundnut Leaf Spot",
      "Rust",
      "Collar Rot",
      "Aphids",
      "Thrips"
    ]
  },
  {
    "id": "soybean",
    "name": "Soybean",
    "category": "Oilseed",
    "icon": "🌱",
    "season": "Kharif",
    "soil": "Well-drained loamy soil",
    "water": "Medium",
    "temperature": "20–30°C",
    "harvest": "90–110 days",
    "description": "Major protein and oilseed crop.",
    "diseases": [
      "Yellow Mosaic Virus",
      "Stem Fly",
      "Pod Borer",
      "Rust",
      "Charcoal Rot"
    ]
  },
  {
    "id": "mustard",
    "name": "Mustard",
    "category": "Oilseed",
    "icon": "🌼",
    "season": "Rabi",
    "soil": "Well-drained loamy soil",
    "water": "Low–Medium",
    "temperature": "10–25°C",
    "harvest": "110–150 days",
    "description": "Major winter oilseed crop.",
    "diseases": [
      "White Rust",
      "Alternaria Blight",
      "Powdery Mildew",
      "Aphids"
    ]
  },
  {
    "id": "chickpea",
    "name": "Chickpea / Chana",
    "category": "Pulse",
    "icon": "🫘",
    "season": "Rabi",
    "soil": "Well-drained loamy soil",
    "water": "Low",
    "temperature": "15–25°C",
    "harvest": "90–120 days",
    "description": "Important pulse crop.",
    "diseases": [
      "Fusarium Wilt",
      "Ascochyta Blight",
      "Pod Borer",
      "Root Rot"
    ]
  },
  {
    "id": "pigeonpea",
    "name": "Pigeon Pea / Tur",
    "category": "Pulse",
    "icon": "🌱",
    "season": "Kharif",
    "soil": "Well-drained soil",
    "water": "Low–Medium",
    "temperature": "20–30°C",
    "harvest": "150–240 days",
    "description": "Long-duration pulse crop.",
    "diseases": [
      "Wilt",
      "Sterility Mosaic",
      "Pod Borer",
      "Phytophthora Blight"
    ]
  },
  {
    "id": "banana",
    "name": "Banana",
    "category": "Fruit",
    "icon": "🍌",
    "season": "Year-round",
    "soil": "Deep fertile well-drained soil",
    "water": "High",
    "temperature": "20–35°C",
    "harvest": "11–14 months",
    "description": "Major tropical fruit crop.",
    "diseases": [
      "Panama Wilt",
      "Sigatoka",
      "Bunchy Top Virus",
      "Rhizome Weevil"
    ]
  },
  {
    "id": "mango",
    "name": "Mango",
    "category": "Fruit",
    "icon": "🥭",
    "season": "Perennial",
    "soil": "Deep well-drained soil",
    "water": "Medium",
    "temperature": "24–30°C",
    "harvest": "Seasonal",
    "description": "Major Indian fruit crop.",
    "diseases": [
      "Anthracnose",
      "Powdery Mildew",
      "Mango Hopper",
      "Fruit Fly",
      "Dieback"
    ]
  },
  {
    "id": "papaya",
    "name": "Papaya",
    "category": "Fruit",
    "icon": "🍈",
    "season": "Year-round",
    "soil": "Well-drained fertile soil",
    "water": "Medium",
    "temperature": "21–33°C",
    "harvest": "8–12 months",
    "description": "Fast-growing tropical fruit crop.",
    "diseases": [
      "Papaya Ring Spot Virus",
      "Powdery Mildew",
      "Root Rot",
      "Mealybug"
    ]
  },
  {
    "id": "coconut",
    "name": "Coconut",
    "category": "Plantation",
    "icon": "🥥",
    "season": "Perennial",
    "soil": "Sandy loam and coastal soil",
    "water": "High",
    "temperature": "25–32°C",
    "harvest": "Year-round",
    "description": "Important tropical plantation crop.",
    "diseases": [
      "Bud Rot",
      "Root Wilt",
      "Stem Bleeding",
      "Rhinoceros Beetle",
      "Red Palm Weevil"
    ]
  },
  {
    "id": "turmeric",
    "name": "Turmeric",
    "category": "Spice",
    "icon": "🟡",
    "season": "Kharif",
    "soil": "Well-drained loamy soil",
    "water": "Medium–High",
    "temperature": "20–35°C",
    "harvest": "7–9 months",
    "description": "Major spice and medicinal crop.",
    "diseases": [
      "Rhizome Rot",
      "Leaf Spot",
      "Leaf Blotch",
      "Shoot Borer"
    ]
  },
  {
    "id": "ginger",
    "name": "Ginger",
    "category": "Spice",
    "icon": "🫚",
    "season": "Kharif",
    "soil": "Rich well-drained soil",
    "water": "Medium–High",
    "temperature": "20–30°C",
    "harvest": "7–9 months",
    "description": "Important spice crop.",
    "diseases": [
      "Soft Rot",
      "Leaf Spot",
      "Bacterial Wilt",
      "Shoot Borer"
    ]
  },
  {
    "id": "coffee",
    "name": "Coffee",
    "category": "Plantation",
    "icon": "☕",
    "season": "Perennial",
    "soil": "Deep fertile acidic soil",
    "water": "Medium–High",
    "temperature": "18–28°C",
    "harvest": "Seasonal",
    "description": "Important plantation crop in South India.",
    "diseases": [
      "Coffee Leaf Rust",
      "Berry Disease",
      "White Stem Borer",
      "Black Rot"
    ]
  }
];


/* ================================================================
   3. COMPLETE DISEASE / PEST DATABASE FROM THE PREVIOUS PROJECT
   ================================================================ */

const DISEASES = [
  {
    "id": "rice-blast",
    "name": "Rice Blast",
    "crops": [
      "Rice"
    ],
    "type": "Fungal disease",
    "symptoms": "Spindle-shaped lesions may appear on leaves and other plant parts.",
    "causes": "Fungal infection promoted by suitable humidity and crop conditions.",
    "prevention": "Use healthy seed, balanced nutrition and recommended agronomic practices.",
    "management": "Remove heavily affected material where practical and follow local agricultural recommendations."
  },
  {
    "id": "late-blight",
    "name": "Late Blight",
    "crops": [
      "Tomato",
      "Potato"
    ],
    "type": "Fungal-like disease",
    "symptoms": "Dark lesions can develop on leaves and stems; fruit or tubers may also be affected.",
    "causes": "Favoured by cool, wet conditions.",
    "prevention": "Use healthy planting material and maintain appropriate spacing and field sanitation.",
    "management": "Seek local expert guidance for approved disease-management products."
  },
  {
    "id": "early-blight",
    "name": "Early Blight",
    "crops": [
      "Tomato",
      "Potato"
    ],
    "type": "Fungal disease",
    "symptoms": "Brown lesions, often with concentric ring patterns, may develop on older leaves.",
    "causes": "Fungal infection favoured by leaf wetness and plant stress.",
    "prevention": "Crop rotation, sanitation and good airflow can help reduce risk.",
    "management": "Use locally recommended management practices."
  },
  {
    "id": "yellow-mosaic",
    "name": "Yellow Mosaic Virus",
    "crops": [
      "Soybean"
    ],
    "type": "Viral disease",
    "symptoms": "Yellow and green mosaic patterns may appear on leaves.",
    "causes": "Virus commonly spread by insect vectors.",
    "prevention": "Use healthy planting material and manage vectors according to local recommendations.",
    "management": "Remove severely affected plants where appropriate and control vectors using integrated practices."
  },
  {
    "id": "bacterial-wilt",
    "name": "Bacterial Wilt",
    "crops": [
      "Tomato",
      "Brinjal"
    ],
    "type": "Bacterial disease",
    "symptoms": "Plants may wilt while leaves initially remain green.",
    "causes": "Soil-borne bacterial infection.",
    "prevention": "Use clean planting material and maintain field sanitation.",
    "management": "Remove affected plants and avoid moving contaminated soil or water."
  },
  {
    "id": "powdery-mildew",
    "name": "Powdery Mildew",
    "crops": [
      "Mango",
      "Mustard",
      "Chilli"
    ],
    "type": "Fungal disease",
    "symptoms": "White powdery growth can appear on leaves, shoots or flowers.",
    "causes": "Fungal infection favoured by suitable humidity and plant conditions.",
    "prevention": "Maintain airflow and avoid excessive dense growth.",
    "management": "Use locally approved disease-management practices."
  },
  {
    "id": "anthracnose",
    "name": "Anthracnose",
    "crops": [
      "Mango",
      "Chilli"
    ],
    "type": "Fungal disease",
    "symptoms": "Dark sunken lesions can occur on leaves, shoots or fruits.",
    "causes": "Fungal infection, often favoured by wet conditions.",
    "prevention": "Field sanitation and good airflow can reduce disease pressure.",
    "management": "Consult local agriculture experts for crop-specific treatment."
  },
  {
    "id": "aphids",
    "name": "Aphids",
    "crops": [
      "Wheat",
      "Mustard",
      "Chilli",
      "Potato"
    ],
    "type": "Insect pest",
    "symptoms": "Small insects cluster on young shoots and leaves; plants may become distorted.",
    "causes": "Aphid infestation.",
    "prevention": "Encourage beneficial insects and monitor crops regularly.",
    "management": "Use integrated pest management and locally approved controls when thresholds are exceeded."
  },
  {
    "id": "fall-armyworm",
    "name": "Fall Armyworm",
    "crops": [
      "Maize"
    ],
    "type": "Insect pest",
    "symptoms": "Leaf feeding damage and ragged holes can occur, especially in young maize.",
    "causes": "Larvae of an invasive moth species.",
    "prevention": "Regular crop scouting and early detection.",
    "management": "Follow local integrated pest-management recommendations."
  },
  {
    "id": "bollworm",
    "name": "Bollworm",
    "crops": [
      "Cotton"
    ],
    "type": "Insect pest",
    "symptoms": "Larvae damage buds, flowers and developing bolls.",
    "causes": "Caterpillar infestation.",
    "prevention": "Regular scouting and integrated pest management.",
    "management": "Use locally recommended control measures based on pest thresholds."
  },
  {
    "id": "yellow-vein-mosaic",
    "name": "Yellow Vein Mosaic",
    "crops": [
      "Okra"
    ],
    "type": "Viral disease",
    "symptoms": "Veins become yellow and leaves can show mosaic patterns.",
    "causes": "Viral infection transmitted by insect vectors.",
    "prevention": "Monitor and manage vector populations.",
    "management": "Remove severely affected plants where recommended."
  },
  {
    "id": "panama-wilt",
    "name": "Panama Wilt",
    "crops": [
      "Banana"
    ],
    "type": "Fungal disease",
    "symptoms": "Leaves may yellow and wilt progressively.",
    "causes": "Soil-borne fungal pathogen.",
    "prevention": "Use healthy planting material and maintain field sanitation.",
    "management": "Use resistant varieties and follow local expert recommendations."
  }
];


/* ================================================================
   4. SIMPLE FARM SENSE GROWTH STAGES
   ================================================================ */

const GROWTH_STAGES = [
  "Establishment / Seedling",
  "Vegetative growth",
  "Flowering / Reproductive",
  "Fruit / Grain / Pod development",
  "Maturity",
  "Harvest / Post-harvest"
];


/* ================================================================
   5. UI TRANSLATIONS
   ================================================================ */

const TEXT = {
  en: {
    dashboard: "Dashboard",
    farm: "Farm Profile",
    crops: "Crop Explorer",
    health: "Disease Guide",
    doctor: "Plant Doctor",
    assistant: "FarmSense AI",
    back: "Back",
    home: "Home",
    configure: "Configure Farm",
    askAI: "Ask FarmSense AI",
    save: "Save Decision",
    farmer: "Farmer",
    location: "Location",
    crop: "Crop",
    area: "Farm Area",
    stage: "Growth Stage",
    soil: "Soil Type",
    moisture: "Soil Moisture",
    irrigation: "Irrigation",
    temperature: "Temperature",
    humidity: "Humidity",
    rainPast: "Rain last 24h",
    rainNext: "Rain next 24h",
    rainThree: "Rain next 3 days",
    action: "Recommended Action",
    when: "When",
    why: "Why",
    risk: "Risk",
    need: "Need",
    dataSources: "Data Sources",
    reasoning: "Explained Reasoning",
    alerts: "Alerts",
    history: "History",
    profile: "Farm & Crop Profile",
    update: "Update Assessment",
    search: "Search crops or diseases...",
    learn: "Learn more",
    useAI: "Ask AI",
    upload: "Upload plant photo",
    camera: "Camera",
    analyze: "Analyze",
    clear: "Clear",
    typeQuestion: "Ask any agriculture question...",
    mic: "Mic",
    listening: "Listening...",
    send: "Send",
    offline: "Offline decision engine",
    online: "AI backend connected",
    disclaimer: "AI guidance is decision support, not a laboratory diagnosis. Verify important treatment decisions with a qualified agriculture professional and local recommendations.",
    farmerQuestion: "What should this farmer do next?",
    prototype: "Working Prototype",
    decisionLayer: "Decision Layer",
    fieldMonitoring: "Field-Condition Monitoring",
    twoSources: "Two or More Data Sources",
    riskNeed: "Risk & Need Identification",
    intelligence: "Intelligent Recommendation",
    explained: "Explained Reasoning",
    historyAlerts: "History & Alerts",
    quickQuestions: "Quick Questions",
    noAlerts: "No major threshold-based alert from the current inputs.",
    plantHealth: "Plant Health",
    diseaseDetails: "Disease Details",
  },
  kn: {
    dashboard: "ಡ್ಯಾಶ್‌ಬೋರ್ಡ್",
    farm: "ಫಾರ್ಮ್ ಪ್ರೊಫೈಲ್",
    crops: "ಬೆಳೆ ಅನ್ವೇಷಣೆ",
    health: "ರೋಗ ಮಾರ್ಗದರ್ಶಿ",
    doctor: "ಸಸ್ಯ ವೈದ್ಯ",
    assistant: "FarmSense AI",
    back: "ಹಿಂದೆ",
    home: "ಮುಖಪುಟ",
    configure: "ಫಾರ್ಮ್ ಹೊಂದಿಸಿ",
    askAI: "FarmSense AI ಕೇಳಿ",
    save: "ನಿರ್ಧಾರ ಉಳಿಸಿ",
    farmer: "ರೈತ",
    location: "ಸ್ಥಳ",
    crop: "ಬೆಳೆ",
    area: "ಫಾರ್ಮ್ ವಿಸ್ತೀರ್ಣ",
    stage: "ಬೆಳೆ ಹಂತ",
    soil: "ಮಣ್ಣಿನ ವಿಧ",
    moisture: "ಮಣ್ಣಿನ ತೇವಾಂಶ",
    irrigation: "ನೀರಾವರಿ",
    temperature: "ತಾಪಮಾನ",
    humidity: "ತೇವಾಂಶ",
    rainPast: "ಕಳೆದ 24 ಗಂಟೆಯ ಮಳೆ",
    rainNext: "ಮುಂದಿನ 24 ಗಂಟೆಯ ಮಳೆ",
    rainThree: "ಮುಂದಿನ 3 ದಿನಗಳ ಮಳೆ",
    action: "ಶಿಫಾರಸು ಮಾಡಿದ ಕ್ರಮ",
    when: "ಯಾವಾಗ",
    why: "ಏಕೆ",
    risk: "ಅಪಾಯ",
    need: "ಅಗತ್ಯ",
    dataSources: "ಡೇಟಾ ಮೂಲಗಳು",
    reasoning: "ವಿವರವಾದ ಕಾರಣ",
    alerts: "ಎಚ್ಚರಿಕೆಗಳು",
    history: "ಇತಿಹಾಸ",
    profile: "ಫಾರ್ಮ್ ಮತ್ತು ಬೆಳೆ ಪ್ರೊಫೈಲ್",
    update: "ಮೌಲ್ಯಮಾಪನ ನವೀಕರಿಸಿ",
    search: "ಬೆಳೆ ಅಥವಾ ರೋಗ ಹುಡುಕಿ...",
    learn: "ಇನ್ನಷ್ಟು ನೋಡಿ",
    useAI: "AI ಕೇಳಿ",
    upload: "ಸಸ್ಯದ ಫೋಟೋ ಅಪ್‌ಲೋಡ್ ಮಾಡಿ",
    camera: "ಕ್ಯಾಮೆರಾ",
    analyze: "ವಿಶ್ಲೇಷಿಸಿ",
    clear: "ಅಳಿಸಿ",
    typeQuestion: "ಕೃಷಿಯ ಬಗ್ಗೆ ಏನು ಬೇಕಾದರೂ ಕೇಳಿ...",
    mic: "ಮೈಕ್",
    listening: "ಕೇಳಲಾಗುತ್ತಿದೆ...",
    send: "ಕಳುಹಿಸಿ",
    offline: "ಆಫ್‌ಲೈನ್ ನಿರ್ಧಾರ ಎಂಜಿನ್",
    online: "AI backend ಸಂಪರ್ಕಿಸಲಾಗಿದೆ",
    disclaimer: "AI ಮಾರ್ಗದರ್ಶನ ನಿರ್ಧಾರ ಸಹಾಯ ಮಾತ್ರ; ಪ್ರಯೋಗಾಲಯದ ರೋಗನಿರ್ಣಯವಲ್ಲ. ಮುಖ್ಯ ಚಿಕಿತ್ಸಾ ನಿರ್ಧಾರಗಳನ್ನು ಕೃಷಿ ತಜ್ಞರು ಮತ್ತು ಸ್ಥಳೀಯ ಶಿಫಾರಸುಗಳೊಂದಿಗೆ ಪರಿಶೀಲಿಸಿ.",
    farmerQuestion: "ಈ ರೈತ ಈಗ ಏನು ಮಾಡಬೇಕು?",
    prototype: "ಕಾರ್ಯನಿರ್ವಹಿಸುವ ಪ್ರೋಟೋಟೈಪ್",
    decisionLayer: "ನಿರ್ಧಾರ ಪದರ",
    fieldMonitoring: "ಕ್ಷೇತ್ರ ಸ್ಥಿತಿ ಮೇಲ್ವಿಚಾರಣೆ",
    twoSources: "ಎರಡು ಅಥವಾ ಹೆಚ್ಚು ಡೇಟಾ ಮೂಲಗಳು",
    riskNeed: "ಅಪಾಯ ಮತ್ತು ಅಗತ್ಯ ಗುರುತಿಸುವಿಕೆ",
    intelligence: "ಬುದ್ಧಿವಂತ ಶಿಫಾರಸು",
    explained: "ವಿವರವಾದ ಕಾರಣ",
    historyAlerts: "ಇತಿಹಾಸ ಮತ್ತು ಎಚ್ಚರಿಕೆಗಳು",
    quickQuestions: "ತ್ವರಿತ ಪ್ರಶ್ನೆಗಳು",
    noAlerts: "ಪ್ರಸ್ತುತ ಮಾಹಿತಿಯಲ್ಲಿ ಪ್ರಮುಖ threshold ಆಧಾರಿತ ಎಚ್ಚರಿಕೆ ಇಲ್ಲ.",
    plantHealth: "ಸಸ್ಯ ಆರೋಗ್ಯ",
    diseaseDetails: "ರೋಗ ವಿವರಗಳು",
  }
};


/* ================================================================
   6. HELPER FUNCTIONS
   ================================================================ */

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function number(value) {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

function normalize(text = "") {
  return String(text)
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function cropById(id) {
  return PLANTS.find((item) => item.id === id) || PLANTS[0];
}

function findCrop(question) {
  const q = normalize(question);

  return PLANTS.find((item) => {
    const values = [
      item.id,
      item.name,
      ...(item.name || "").split(/[\s/()-]+/),
    ];

    return values.some((value) => {
      const word = normalize(value);
      return word.length >= 3 && q.includes(word);
    });
  });
}

function findDisease(question) {
  const q = normalize(question);

  return DISEASES.find((item) => {
    const values = [
      item.id,
      item.name,
      ...(item.crops || []),
      item.type,
    ];

    return values.some((value) => {
      const word = normalize(value);
      return word.length >= 3 && q.includes(word);
    });
  });
}


/* ================================================================
   7. FARMSENSE DECISION ENGINE
   ================================================================
   This is the explainable decision layer for the hackathon demo.
   It converts field + weather + crop stage inputs into:
     - need
     - risk
     - action
     - timing
     - reasoning
     - data sources
*/

function buildFarmDecision(farm) {
  const crop = cropById(farm.crop);
  const moisture = number(farm.soilMoisture);
  const temperature = number(farm.temperature);
  const humidity = number(farm.humidity);
  const rainPast = number(farm.rainPast24);
  const rainNext = number(farm.rainNext24);
  const rainThree = number(farm.rainNext3Days);
  const area = number(farm.area);
  const stage = farm.stage;

  let waterNeed = 0;
  let weatherRisk = 0;
  let cropRisk = 0;
  const reasons = [];
  const alerts = [];
  const dataSources = [];

  /* SOURCE 1: FARM / FIELD */
  dataSources.push("Farm profile + field observation");

  if (moisture < 15) {
    waterNeed += 70;
    weatherRisk += 20;
    reasons.push("soil moisture is very low");
    alerts.push("Moisture-deficit risk");
  } else if (moisture < 30) {
    waterNeed += 50;
    weatherRisk += 10;
    reasons.push("soil moisture is below the preferred monitoring band");
  } else if (moisture < 45) {
    waterNeed += 25;
    reasons.push("soil moisture is moderate and should be monitored");
  } else if (moisture <= 70) {
    waterNeed += 5;
    reasons.push("soil moisture is currently adequate for monitoring");
  } else {
    waterNeed -= 10;
    weatherRisk += 8;
    reasons.push("soil moisture is relatively high");
  }

  if (farm.irrigation === "Unavailable") {
    cropRisk += 15;
    reasons.push("irrigation access is unavailable");
    alerts.push("Limited irrigation access");
  } else if (farm.irrigation === "Limited") {
    cropRisk += 7;
    reasons.push("irrigation access is limited");
  } else {
    reasons.push("irrigation is available if needed");
  }

  /* SOURCE 2: WEATHER */
  dataSources.push("Weather observation / forecast input");

  if (temperature >= 36) {
    waterNeed += 20;
    weatherRisk += 25;
    reasons.push("temperature is high and can increase water demand");
    alerts.push("Heat-stress risk");
  } else if (temperature >= 32) {
    waterNeed += 10;
    weatherRisk += 10;
    reasons.push("temperature is warm enough to increase evapotranspiration pressure");
  } else if (temperature < 10) {
    cropRisk += 12;
    reasons.push("temperature is low relative to many common crops");
  }

  if (humidity >= 85) {
    cropRisk += 15;
    reasons.push("humidity is high, so disease scouting is important");
    alerts.push("High-humidity disease-watch");
  }

  if (rainPast >= 30) {
    cropRisk += 18;
    waterNeed -= 20;
    reasons.push("recent rainfall has been high");
  } else if (rainPast >= 10) {
    waterNeed -= 10;
    reasons.push("some recent rainfall reduces immediate irrigation pressure");
  }

  if (rainNext >= 25) {
    waterNeed -= 35;
    weatherRisk += 20;
    reasons.push("substantial rain is forecast within the next 24 hours");
    alerts.push("Heavy-rain / waterlogging watch");
  } else if (rainNext >= 10) {
    waterNeed -= 15;
    reasons.push("rain is expected within the next 24 hours");
  } else {
    reasons.push("little rain is expected in the next 24 hours");
  }

  if (rainThree >= 50) {
    weatherRisk += 18;
    reasons.push("more rainfall is expected over the next three days");
  }

  /* SOURCE 3: CROP PROFILE */
  dataSources.push("Crop profile + growth stage");

  if (stage === "Flowering / Reproductive" || stage === "Fruit / Grain / Pod development") {
    waterNeed += 10;
    cropRisk += 5;
    reasons.push(`the crop is in ${stage}, so timely moisture management deserves attention`);
  } else if (stage === "Establishment / Seedling") {
    waterNeed += 8;
    reasons.push("the crop is establishing, so moisture should be checked frequently");
  } else if (stage === "Maturity") {
    waterNeed -= 5;
    reasons.push("the crop is nearing maturity, so irrigation should be based on the crop's actual need");
  } else if (stage === "Harvest / Post-harvest") {
    waterNeed -= 20;
    reasons.push("the crop is at harvest/post-harvest, so irrigation may no longer be the main decision");
  }

  /* COMBINE */
  waterNeed = clamp(Math.round(waterNeed), 0, 100);
  const risk = clamp(Math.round(10 + weatherRisk + cropRisk + (waterNeed >= 70 ? 15 : 0)), 0, 100);

  let urgency = "Routine monitoring";
  let action = "Monitor field conditions";
  let when = "Today — during the next field check";

  if (stage === "Harvest / Post-harvest") {
    action = "Prioritize harvest / post-harvest handling and monitor field moisture rather than adding routine irrigation.";
    when = "Today — based on harvest readiness and weather window";
    urgency = risk >= 60 ? "Attention today" : "Routine monitoring";
  } else if (rainNext >= 25 && moisture <= 45) {
    action = "Do not rush into irrigation; inspect the field and use the forecast rain first unless the crop is visibly stressed.";
    when = "Re-check before the expected rain and again after the rainfall";
    urgency = "Weather-dependent";
  } else if (waterNeed >= 70) {
    action = "Irrigate soon, subject to the crop's local irrigation recommendation and field condition.";
    when = "Within the next field-management window, preferably before severe moisture stress develops";
    urgency = "High need";
  } else if (waterNeed >= 45) {
    action = "Check soil moisture again and plan irrigation if the field remains dry.";
    when = "Re-check within the next 6–12 hours or at the next field visit";
    urgency = "Moderate need";
  } else {
    action = "Do not irrigate just because of the calendar; continue monitoring soil moisture and weather.";
    when = "Check again at the next planned field visit";
    urgency = "Low immediate water need";
  }

  if (risk >= 70) {
    alerts.push("Overall field attention is high from the current inputs");
  } else if (risk >= 45) {
    alerts.push("Moderate field attention recommended");
  }

  const riskLevel = risk >= 70 ? "HIGH" : risk >= 45 ? "MEDIUM" : "LOW";

  const explanation = [
    `Crop: ${crop.name}`,
    `Growth stage: ${stage}`,
    `Soil moisture: ${moisture}%`,
    `Temperature: ${temperature}°C`,
    `Humidity: ${humidity}%`,
    `Rain next 24h: ${rainNext} mm`,
    `Rain next 3 days: ${rainThree} mm`,
    `Irrigation access: ${farm.irrigation}`,
    `Farm area: ${area} acres`,
  ];

  return {
    crop,
    stage,
    moisture,
    temperature,
    humidity,
    rainPast,
    rainNext,
    rainThree,
    area,
    waterNeed,
    risk,
    riskLevel,
    urgency,
    action,
    when,
    reasons,
    alerts: Array.from(new Set(alerts)),
    dataSources,
    explanation,
    generatedAt: new Date().toLocaleString(),
  };
}


/* ================================================================
   8. LOCAL AGRICULTURE ASSISTANT
   ================================================================
   Used when the real AI backend is not connected.
   It is intentionally transparent and easy to explain to judges.
*/

function localAgricultureAnswer(question, farm, decision, language) {
  const q = normalize(question);
  const crop = decision.crop;

  if (!q) {
    return language === "kn"
      ? "ಕೃಷಿಯ ಬಗ್ಗೆ ಪ್ರಶ್ನೆ ಕೇಳಿ. ಉದಾಹರಣೆ: ಇಂದು ಈ ರೈತ ಏನು ಮಾಡಬೇಕು? ಟೊಮೆಟೊ ಹೇಗೆ ಬೆಳೆಸಬೇಕು? ಮಣ್ಣಿನ ತೇವಾಂಶ ಕಡಿಮೆಯಾದರೆ ಏನು ಮಾಡಬೇಕು?"
      : "Ask an agriculture question. Examples: What should this farmer do today? How should I grow tomato? What should I do if soil moisture is low?";
  }

  if (/^(hi|hello|hey|namaste|ನಮಸ್ಕಾರ)/i.test(q)) {
    return language === "kn"
      ? "ನಮಸ್ಕಾರ! 🌱 ನಾನು FarmSense AI. ಬೆಳೆ, ಮಣ್ಣು, ನೀರಾವರಿ, ಹವಾಮಾನ, ಕೀಟ, ರೋಗ, ಗೊಬ್ಬರ, pruning, ಕೊಯ್ಲು ಮತ್ತು ಮುಖ್ಯವಾಗಿ ರೈತ ಈಗ ಏನು ಮಾಡಬೇಕು ಎಂಬುದರ ಬಗ್ಗೆ ಕೇಳಿ."
      : "Namaste! 🌱 I am FarmSense AI. Ask me about crops, soil, irrigation, weather, pests, diseases, fertilizer, pruning, harvest, or most importantly what the farmer should do next.";
  }

  if (/today|now|next|ಇಂದು|ಈಗ|ಮುಂದೆ|ಮುಂದಿನ/.test(q)) {
    return `${decision.action}\n\nWhen: ${decision.when}\n\nWhy: ${decision.reasons.slice(0, 6).join("; ")}\n\nCurrent risk: ${decision.riskLevel} (${decision.risk}/100)\nNeed score: ${decision.waterNeed}/100`;
  }

  if (/risk|danger|threat|problem|ಅಪಾಯ|ಸಮಸ್ಯೆ/.test(q)) {
    return `Current FarmSense risk: ${decision.riskLevel} (${decision.risk}/100).\n\n${decision.alerts.length ? "Alerts:\n- " + decision.alerts.join("\n- ") : "No major threshold-based alert from the current inputs."}\n\nWhy: ${decision.reasons.join("; ")}`;
  }

  if (/water|irrigat|watering|ನೀರು|ನೀರಾವರಿ/.test(q)) {
    return `For ${crop.name}, the current water-need score is ${decision.waterNeed}/100.\n\nRecommendation: ${decision.action}\nWhen: ${decision.when}\n\nMain evidence: soil moisture ${decision.moisture}%, rain next 24h ${decision.rainNext} mm, temperature ${decision.temperature}°C, growth stage ${decision.stage}.`;
  }

  if (/grow|cultivat|sow|seed|planting|ಬೆಳೆ|ಬೆಳೆಸ|ಬಿತ್ತನೆ|ನಾಟಿ/.test(q)) {
    return `${crop.name} basic guide:\n\nSeason: ${crop.season}\nSoil: ${crop.soil}\nWater requirement: ${crop.water}\nTemperature: ${crop.temperature}\nTypical harvest period: ${crop.harvest}\n\nFor a field decision, also consider today's soil moisture, forecast rain, crop stage and irrigation availability.`;
  }

  if (/soil|ಮಣ್ಣು|p h|ph\b|organic/.test(q)) {
    return `${crop.name} generally prefers ${crop.soil}.\n\nFarmSense uses your selected soil type as field context, but a laboratory soil test is more reliable for pH, N, P, K and micronutrient decisions.`;
  }

  if (/fertil|fertiliser|fertilizer|npk|nitrogen|phosphorus|potassium|ಗೊಬ್ಬರ|ಸಾರ/.test(q)) {
    return `For fertilizer decisions in ${crop.name}, use crop stage + soil-test results + previous fertilizer use + local recommendation.\n\nNitrogen mainly supports vegetative growth, phosphorus supports roots and reproductive development, and potassium supports plant water regulation and stress response. Avoid giving a fixed dose without field-specific evidence.`;
  }

  if (/pest|insect|worm|aphid|ಕೀಟ|ಹುಳು/.test(q)) {
    return `Pest-management checklist for ${crop.name}:\n1. Inspect young leaves, growing points and leaf undersides.\n2. Look for insects, eggs, webbing, chewing damage or frass.\n3. Record affected area and crop stage.\n4. Prefer integrated pest management and locally approved controls when needed.\n\nTell me the exact pest/symptom for more targeted guidance.`;
  }

  if (/disease|diseases|spot|yellow|mosaic|blight|ರೋಗ|ಹಳದಿ/.test(q)) {
    const disease = findDisease(question);

    if (disease) {
      return `${disease.name}\n\nType: ${disease.type}\nCrops: ${disease.crops.join(", ")}\n\nSymptoms: ${disease.symptoms}\n\nCauses: ${disease.causes}\n\nPrevention: ${disease.prevention}\n\nManagement: ${disease.management}`;
    }

    return `For ${crop.name}, common recorded health problems include: ${crop.diseases.join(", ")}.\n\nDescribe the symptom, affected plant part, spread, recent weather and crop stage. A photograph can support screening, but a photo alone should not be treated as a laboratory diagnosis.`;
  }

  if (/prun|cut|cutting|branch|ಕೊಂಬೆ|ಕತ್ತರ|pruning/.test(q)) {
    return `Pruning is crop- and age-specific. For ${crop.name}, first identify the goal: remove dry/diseased growth, manage suckers, shape the canopy, or control height. Tell me the plant age and exactly what you want to cut, and I can structure a safe checklist.`;
  }

  if (/harvest|maturity|ಕೊಯ್ಲು|ಪಕ್ವ/.test(q)) {
    return `Harvest planning for ${crop.name} depends on crop maturity, intended use, weather and market requirements. The dataset indicates a typical harvest period of ${crop.harvest}. Check the actual crop maturity rather than using the number alone.`;
  }

  if (/storage|post harvest|postharvest|ಸಂಗ್ರಹ|ಕೊಯ್ಲಿನ ನಂತರ/.test(q)) {
    return `Post-harvest decisions depend on the crop and intended use. Keep produce clean and dry, minimize mechanical damage, separate diseased or damaged produce, and use appropriate storage conditions for the specific crop.`;
  }

  if (/weather|rain|temperature|humidity|ಹವಾಮಾನ|ಮಳೆ|ತಾಪಮಾನ/.test(q)) {
    return `Current weather context:\nTemperature: ${decision.temperature}°C\nHumidity: ${decision.humidity}%\nRain last 24h: ${decision.rainPast} mm\nRain next 24h: ${decision.rainNext} mm\nRain next 3 days: ${decision.rainThree} mm\n\nFarmSense combines this weather context with soil moisture and crop stage to decide what to do next.`;
  }

  return language === "kn"
    ? `ಈ ಪ್ರಶ್ನೆಗೆ ಸ್ಥಳೀಯ FarmSense knowledge base ನಲ್ಲಿ ಸಂಪೂರ್ಣ ಉತ್ತರ ಇಲ್ಲ. /api/chat ಗೆ ನಿಜವಾದ LLM ಸಂಪರ್ಕಿಸಿದರೆ ಹೆಚ್ಚಿನ ಕೃಷಿ ಪ್ರಶ್ನೆಗಳಿಗೆ open-ended ಉತ್ತರ ಸಿಗುತ್ತದೆ. ಈಗಿನ ಕ್ಷೇತ್ರದ ನಿರ್ಧಾರ: ${decision.action}.`
    : `This question is broader than the local FarmSense knowledge base. Connect /api/chat for open-ended LLM answers. The current field decision is: ${decision.action}.`;
}


/* ================================================================
   9. OPTIONAL REAL AI CALL
   ================================================================ */

async function askRealAI(question, farm, decision, language) {
  const endpoint = AI_API_URL || "/api/chat";

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      question,
      language,
      farm,
      decision,
      cropDatabase: PLANTS,
      diseaseDatabase: DISEASES,
      system: "You are FarmSense, an agriculture decision-support assistant. Give practical, cautious, step-by-step guidance. For PS-01, prioritize what the farmer should do next, when, and why, using the provided field and weather context. Never claim a photo is a definitive diagnosis. Do not invent sensor readings or confidence scores.",
    }),
  });

  if (!response.ok) {
    throw new Error(`AI backend returned ${response.status}`);
  }

  const data = await response.json();

  if (!data || typeof data.answer !== "string" || !data.answer.trim()) {
    throw new Error("AI backend returned an invalid response");
  }

  return data.answer.trim();
}


/* ================================================================
   10. LOCAL DEFAULT FARM
   ================================================================ */

const AUTH_STORAGE_KEY = "agri_saathi_farmsense_user_v1";

const DEFAULT_FARM = {
  farmer: "Demo Farmer",
  location: "Bengaluru, Karnataka",
  crop: "tomato",
  area: 2,
  stage: "Vegetative growth",
  soilType: "Loamy",
  soilMoisture: 34,
  irrigation: "Available",
  temperature: 29,
  humidity: 68,
  rainPast24: 0,
  rainNext24: 4,
  rainNext3Days: 12,
};


/* ================================================================
   11. MAIN APP
   ================================================================ */

export default function App() {
  const [language, setLanguage] = useState("en");
  const [page, setPage] = useState("home");
  const [pageStack, setPageStack] = useState([]);
  const [farm, setFarm] = useState(DEFAULT_FARM);
  const [savedDecisions, setSavedDecisions] = useState([]);
  const [selectedCrop, setSelectedCrop] = useState(null);
  const [selectedDisease, setSelectedDisease] = useState(null);
  const [authUser, setAuthUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(AUTH_STORAGE_KEY) || "null");
    } catch {
      return null;
    }
  });

  const text = TEXT[language];

  function loginUser(user) {
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
    setAuthUser(user);
    setPage("home");
    setPageStack([]);
  }

  function logoutUser() {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    setAuthUser(null);
    setPage("home");
    setPageStack([]);
  }
  const decision = useMemo(() => buildFarmDecision(farm), [farm]);

  function navigate(nextPage) {
    if (nextPage === page) return;
    setPageStack((old) => [...old, page]);
    setPage(nextPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function goBack() {
    if (pageStack.length === 0) {
      setPage("home");
      return;
    }

    const next = pageStack[pageStack.length - 1];
    setPageStack((old) => old.slice(0, -1));
    setPage(next);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function openCrop(crop) {
    setSelectedCrop(crop);
    navigate("cropDetail");
  }

  function openDisease(disease) {
    setSelectedDisease(disease);
    navigate("diseaseDetail");
  }

  function updateFarm(key, value) {
    setFarm((old) => ({ ...old, [key]: value }));
  }

  function saveDecision() {
    const record = {
      time: new Date().toLocaleString(),
      farmer: farm.farmer,
      location: farm.location,
      crop: decision.crop.name,
      stage: decision.stage,
      action: decision.action,
      when: decision.when,
      risk: decision.risk,
      riskLevel: decision.riskLevel,
    };

    setSavedDecisions((old) => [record, ...old].slice(0, 15));
  }

  if (!authUser) {
    return (
      <div className="farmsense-app">
        <AuthPage
          language={language}
          setLanguage={setLanguage}
          text={text}
          onLogin={loginUser}
        />
      </div>
    );
  }

  return (
    <div className="farmsense-app">
      <Header
        page={page}
        language={language}
        setLanguage={setLanguage}
        go={navigate}
        back={goBack}
        text={text}
        user={authUser}
        onLogout={logoutUser}
      />

      {page === "home" && (
        <Dashboard
          farm={farm}
          decision={decision}
          text={text}
          go={navigate}
          saveDecision={saveDecision}
          history={savedDecisions}
        />
      )}

      {page === "farm" && (
        <FarmProfile
          farm={farm}
          decision={decision}
          text={text}
          updateFarm={updateFarm}
          go={navigate}
        />
      )}

      {page === "assistant" && (
        <Assistant
          language={language}
          farm={farm}
          decision={decision}
          text={text}
        />
      )}

      {page === "crops" && (
        <CropExplorer
          text={text}
          openCrop={openCrop}
          language={language}
        />
      )}

      {page === "cropDetail" && selectedCrop && (
        <CropDetail
          crop={selectedCrop}
          text={text}
          go={navigate}
          language={language}
        />
      )}

      {page === "health" && (
        <DiseaseGuide
          text={text}
          openDisease={openDisease}
          go={navigate}
        />
      )}

      {page === "diseaseDetail" && selectedDisease && (
        <DiseaseDetail
          disease={selectedDisease}
          text={text}
          language={language}
          go={navigate}
        />
      )}

      {page === "doctor" && (
        <PlantDoctor
          text={text}
          language={language}
          farm={farm}
        />
      )}

      <Footer />
    </div>
  );
}


/* ================================================================
   12. HEADER
   ================================================================ */

function Header({ page, language, setLanguage, go, back, text, user, onLogout }) {
  const items = [
    ["home", text.dashboard],
    ["farm", text.farm],
    ["crops", text.crops],
    ["health", text.health],
    ["doctor", text.doctor],
    ["assistant", text.assistant],
  ];

  return (
    <header className="topbar">
      <button className="brand" onClick={() => go("home")}>
        <span className="brand-mark">🌱</span>
        <span className="brand-copy">
          <b>Agri Saathi AI</b>
          <small>FarmSense • Smart Farm AI</small>
        </span>
      </button>

      <nav className="topnav">
        {items.map(([id, label]) => (
          <button
            key={id}
            className={page === id ? "nav-item active" : "nav-item"}
            onClick={() => go(id)}
          >
            {label}
          </button>
        ))}
      </nav>

      <div className="top-actions">
        {page !== "home" && (
          <button className="back-button" onClick={back}>
            ← {text.back}
          </button>
        )}

        <div className="user-menu">
          <span className="user-avatar">👨‍🌾</span>
          <span className="user-name">{user?.name || user?.email || "Farmer"}</span>
        </div>

        <button
          className="language-button"
          onClick={() => setLanguage(language === "en" ? "kn" : "en")}
        >
          {language === "en" ? "ಕನ್ನಡ" : "English"}
        </button>

        <button className="logout-button" onClick={onLogout}>
          {language === "en" ? "Logout" : "ಲಾಗ್‌ಔಟ್"}
        </button>
      </div>
    </header>
  );
}


/* ================================================================
   13. LOGIN / REGISTER
   ================================================================ */

function AuthPage({ language, setLanguage, onLogin }) {
  const [mode, setMode] = useState("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const isKannada = language === "kn";

  function submit(event) {
    event.preventDefault();
    setError("");

    const cleanName = name.trim();
    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password.trim();

    if (!cleanEmail || !cleanPassword || (mode === "register" && !cleanName)) {
      setError(
        isKannada
          ? "ದಯವಿಟ್ಟು ಎಲ್ಲಾ ಅಗತ್ಯ ಮಾಹಿತಿಯನ್ನು ನಮೂದಿಸಿ."
          : "Please fill in all required fields."
      );
      return;
    }

    if (!cleanEmail.includes("@")) {
      setError(
        isKannada
          ? "ಸರಿಯಾದ ಇಮೇಲ್ ವಿಳಾಸವನ್ನು ನಮೂದಿಸಿ."
          : "Please enter a valid email address."
      );
      return;
    }

    if (cleanPassword.length < 6) {
      setError(
        isKannada
          ? "ಪಾಸ್‌ವರ್ಡ್ ಕನಿಷ್ಠ 6 ಅಕ್ಷರಗಳಿರಬೇಕು."
          : "Password must contain at least 6 characters."
      );
      return;
    }

    /*
      Demo-only local authentication.
      This keeps the hackathon prototype simple and avoids requiring
      a database or auth server. Do not treat this as production security.
    */
    const databaseKey = "agri_saathi_demo_users_v1";
    const savedUsers = JSON.parse(localStorage.getItem(databaseKey) || "[]");

    if (mode === "register") {
      const exists = savedUsers.some((u) => u.email === cleanEmail);
      if (exists) {
        setError(
          isKannada
            ? "ಈ ಇಮೇಲ್ ಈಗಾಗಲೇ ನೋಂದಾಯಿಸಲಾಗಿದೆ. Login ಮಾಡಿ."
            : "This email is already registered. Please log in."
        );
        setMode("login");
        return;
      }

      const user = {
        name: cleanName,
        email: cleanEmail,
      };

      savedUsers.push({
        ...user,
        password: cleanPassword,
      });

      localStorage.setItem(databaseKey, JSON.stringify(savedUsers));
      onLogin(user);
      return;
    }

    const matched = savedUsers.find(
      (u) => u.email === cleanEmail && u.password === cleanPassword
    );

    /*
      Built-in demo account for the judging/demo machine.
      Demo credentials:
      demo@agrisaathi.ai
      123456
    */
    if (
      (cleanEmail === "demo@agrisaathi.ai" && cleanPassword === "123456") ||
      matched
    ) {
      onLogin(
        matched
          ? { name: matched.name, email: matched.email }
          : { name: "Demo Farmer", email: "demo@agrisaathi.ai" }
      );
      return;
    }

    setError(
      isKannada
        ? "Login ವಿವರಗಳು ತಪ್ಪಾಗಿವೆ. Demo account ಬಳಸಿ: demo@agrisaathi.ai / 123456"
        : "Incorrect login details. Demo account: demo@agrisaathi.ai / 123456"
    );
  }

  function fillDemo() {
    setName("Demo Farmer");
    setEmail("demo@agrisaathi.ai");
    setPassword("123456");
    setMode("login");
    setError("");
  }

  return (
    <div className="auth-page">
      <div className="auth-glow auth-glow-one" />
      <div className="auth-glow auth-glow-two" />

      <div className="auth-brand">
        <div className="auth-logo">🌱</div>
        <div>
          <b>Agri Saathi AI</b>
          <small>FarmSense • Smart Farm AI</small>
        </div>

        <button
          className="auth-language"
          onClick={() => setLanguage(language === "en" ? "kn" : "en")}
        >
          {language === "en" ? "ಕನ್ನಡ" : "English"}
        </button>
      </div>

      <div className="auth-layout">
        <div className="auth-story">
          <div className="auth-eyebrow">
            AGRI SAATHI AI • SMART FARM ASSISTANT
          </div>

          <h1>
            Ask. Understand. Farm Better.
            <br />
            <em>Always with Farmer 🧑🏻‍🌾</em>
          </h1>

          <p>
            Agri Saathi AI turns farm conditions, soil moisture, weather, rainfall
            and crop stage into clear, practical guidance for the farmer.
          </p>

          <div className="auth-feature-list">
            <div>
              <span>01</span>
              <div>
                <b>{isKannada ? "ಸ್ಮಾರ್ಟ್ ನಿರ್ಧಾರ" : "Smart decision support"}</b>
                <small>
                  {isKannada
                    ? "ಇಂದು ಏನು ಮಾಡಬೇಕು ಮತ್ತು ಏಕೆ ಎಂದು ತಿಳಿಸಿ."
                    : "Know what to do next, when, and why."}
                </small>
              </div>
            </div>

            <div>
              <span>02</span>
              <div>
                <b>{isKannada ? "ಸಸ್ಯ ಆರೋಗ್ಯ" : "Plant health"}</b>
                <small>
                  {isKannada
                    ? "ರೋಗ ಮತ್ತು ಕೀಟ ಸಮಸ್ಯೆಗಳಿಗೆ ಮಾರ್ಗದರ್ಶನ."
                    : "Disease and pest guidance with photo support."}
                </small>
              </div>
            </div>

            <div>
              <span>03</span>
              <div>
                <b>{isKannada ? "AI ಸಹಾಯಕ" : "AI assistant"}</b>
                <small>
                  {isKannada
                    ? "ಸಹಜ ಭಾಷೆಯಲ್ಲಿ ಕೃಷಿ ಪ್ರಶ್ನೆಗಳಿಗೆ ಉತ್ತರ."
                    : "Ask agriculture questions naturally."}
                </small>
              </div>
            </div>
          </div>
        </div>

        <form className="auth-card" onSubmit={submit}>
          <div className="auth-card-head">
            <span>{mode === "login" ? "WELCOME BACK" : "GET STARTED"}</span>
            <h2>
              {mode === "login"
                ? isKannada
                  ? "ಲಾಗಿನ್ ಮಾಡಿ"
                  : "Login to FarmSense"
                : isKannada
                  ? "ಖಾತೆ ರಚಿಸಿ"
                  : "Create your account"}
            </h2>
            <p>
              {mode === "login"
                ? isKannada
                  ? "ನಿಮ್ಮ ಫಾರ್ಮ್ ನಿರ್ಧಾರಗಳನ್ನು ಮುಂದುವರಿಸಿ."
                  : "Continue to your farmer decision workspace."
                : isKannada
                  ? "ನಿಮ್ಮ FarmSense workspace ಪ್ರಾರಂಭಿಸಿ."
                  : "Create a simple local hackathon account."}
            </p>
          </div>

          {mode === "register" && (
            <label className="auth-field">
              <span>{isKannada ? "ಹೆಸರು" : "Full name"}</span>
              <input
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder={isKannada ? "ನಿಮ್ಮ ಹೆಸರು" : "Your name"}
                autoComplete="name"
              />
            </label>
          )}

          <label className="auth-field">
            <span>{isKannada ? "ಇಮೇಲ್" : "Email"}</span>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="farmer@example.com"
              autoComplete="email"
            />
          </label>

          <label className="auth-field">
            <span>{isKannada ? "ಪಾಸ್‌ವರ್ಡ್" : "Password"}</span>

            <div className="password-wrap">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="••••••••"
                autoComplete={mode === "login" ? "current-password" : "new-password"}
              />

              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword((value) => !value)}
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
          </label>

          {error && <div className="auth-error">⚠️ {error}</div>}

          <button className="auth-submit" type="submit">
            {mode === "login"
              ? isKannada
                ? "ಲಾಗಿನ್ →"
                : "Login →"
              : isKannada
                ? "ಖಾತೆ ರಚಿಸಿ →"
                : "Create account →"}
          </button>

          <button
            type="button"
            className="demo-login-button"
            onClick={fillDemo}
          >
            🎯 {isKannada ? "Demo account ತುಂಬಿಸಿ" : "Use Demo Account"}
          </button>

          <div className="auth-switch">
            <span>
              {mode === "login"
                ? isKannada
                  ? "ಖಾತೆ ಇಲ್ಲವೇ?"
                  : "Don't have an account?"
                : isKannada
                  ? "ಈಗಾಗಲೇ ಖಾತೆ ಇದೆಯೇ?"
                  : "Already have an account?"}
            </span>

            <button
              type="button"
              onClick={() => {
                setMode(mode === "login" ? "register" : "login");
                setError("");
              }}
            >
              {mode === "login"
                ? isKannada
                  ? "Register"
                  : "Register"
                : isKannada
                  ? "Login"
                  : "Login"}
            </button>
          </div>

          <small className="auth-note">
            {isKannada
              ? "ಈ login demo purposeಗಾಗಿ localStorage ಬಳಸುತ್ತದೆ; production authentication backend ಸಂಪರ್ಕಿಸಬೇಕು."
              : "Demo authentication uses localStorage. Production deployment should use a secure authentication backend."}
          </small>
        </form>
      </div>

      <div className="auth-bottom">
        <span>🌱 Farmer-first • Explainable decisions • Smart Farm AI</span>
        <span>2026</span>
      </div>
    </div>
  );
}


/* ================================================================
   14. DASHBOARD
   ================================================================ */

function Dashboard({ farm, decision, text, go, saveDecision, history }) {
  return (
    <main className="page-shell">
      <section className="hero-card">
        <div className="hero-left">
          <div className="eyebrow">AGRI SAATHI AI • SMART FARM ASSISTANT</div>
          <h1>
            Ask. Understand. Farm Better.
            <br />
            <em>Always with Farmer 🧑🏻‍🌾</em>
          </h1>
          <p>
            Agri Saathi AI combines farm observations, soil moisture, weather,
            rainfall, irrigation access and crop stage to provide clear,
            practical guidance for farmers.
          </p>

          <div className="button-row">
            <button className="primary-button" onClick={() => go("assistant")}>
              🤖 {text.askAI}
            </button>
            <button className="secondary-button" onClick={() => go("farm")}>
              ⚙️ {text.configure}
            </button>
          </div>

          <div className="hero-points">
            <span>✓ Farm + soil</span>
            <span>✓ Weather</span>
            <span>✓ Crop stage</span>
            <span>✓ Explained decision</span>
          </div>
        </div>

        <DecisionHero decision={decision} text={text} saveDecision={saveDecision} />
      </section>

      <FarmSummary farm={farm} decision={decision} onEdit={() => go("farm")} text={text} />

      <SectionTitle eyebrow={text.decisionLayer} title={text.farmerQuestion} />

      <div className="metric-grid">
        <MetricCard icon="💧" label={text.moisture} value={`${decision.moisture}%`} source="Field observation" />
        <MetricCard icon="🌧️" label={text.rainNext} value={`${decision.rainNext} mm`} source="Weather input" />
        <MetricCard icon="🌡️" label={text.temperature} value={`${decision.temperature}°C`} source="Weather input" />
        <MetricCard icon="⚠️" label={text.risk} value={`${decision.risk}/100`} source="Decision engine" />
      </div>

      <div className="decision-grid">
        <ReasoningCard decision={decision} text={text} />
        <RiskCard decision={decision} text={text} />
      </div>

      <SectionTitle eyebrow={text.prototype} title="Data → Assessment → Risk → Decision" />
      <DecisionFlow decision={decision} />

      <SectionTitle eyebrow={text.historyAlerts} title={text.historyAlerts} />
      <HistoryTable history={history} />

      <section className="large-disclaimer">
        🛡️ {text.disclaimer}
      </section>
    </main>
  );
}


function DecisionHero({ decision, text, saveDecision }) {
  return (
    <div className="decision-hero">
      <div className="decision-kicker">{text.action}</div>
      <div className="decision-risk-row">
        <span className={`risk-pill ${decision.riskLevel.toLowerCase()}`}>
          {decision.riskLevel}
        </span>
        <span className="urgency-pill">{decision.urgency}</span>
      </div>
      <h2>{decision.action}</h2>
      <p className="decision-when">
        <b>{text.when}:</b> {decision.when}
      </p>
      <p className="decision-why">
        <b>{text.why}:</b> {decision.reasons.slice(0, 4).join("; ")}.
      </p>
      <div className="decision-crop-line">
        <span>{decision.crop.icon}</span>
        <span>{decision.crop.name}</span>
        <span>•</span>
        <span>{decision.stage}</span>
      </div>
      <button className="white-button" onClick={saveDecision}>
        ✓ {text.save}
      </button>
    </div>
  );
}


function FarmSummary({ farm, decision, onEdit, text }) {
  return (
    <section className="farm-summary">
      <SummaryItem label={text.farmer} value={farm.farmer} />
      <SummaryItem label={text.location} value={`📍 ${farm.location}`} />
      <SummaryItem label={text.crop} value={`${decision.crop.icon} ${decision.crop.name}`} />
      <SummaryItem label={text.stage} value={decision.stage} />
      <SummaryItem label={text.area} value={`${farm.area} acres`} />
      <button className="summary-edit" onClick={onEdit}>Edit →</button>
    </section>
  );
}


function SummaryItem({ label, value }) {
  return (
    <div className="summary-item">
      <small>{label}</small>
      <b>{value}</b>
    </div>
  );
}


function SectionTitle({ eyebrow, title }) {
  return (
    <div className="section-title">
      <div className="eyebrow">{eyebrow}</div>
      <h2>{title}</h2>
    </div>
  );
}


function MetricCard({ icon, label, value, source }) {
  return (
    <div className="metric-card">
      <span className="metric-icon">{icon}</span>
      <div>
        <small>{label}</small>
        <b>{value}</b>
        <em>{source}</em>
      </div>
    </div>
  );
}


function ReasoningCard({ decision, text }) {
  return (
    <article className="white-card">
      <div className="card-title-row">
        <div>
          <div className="tiny-label">{text.explained}</div>
          <h3>Why this recommendation?</h3>
        </div>
        <span className="round-icon">🧠</span>
      </div>

      <div className="reason-list">
        {decision.reasons.map((reason, index) => (
          <div className="reason-line" key={`${reason}-${index}`}>
            <span>✓</span>
            <p>{reason}</p>
          </div>
        ))}
      </div>

      <div className="data-source-box">
        <b>{text.dataSources}</b>
        {decision.dataSources.map((source) => (
          <span key={source}>• {source}</span>
        ))}
      </div>
    </article>
  );
}


function RiskCard({ decision, text }) {
  return (
    <article className="white-card">
      <div className="card-title-row">
        <div>
          <div className="tiny-label">{text.riskNeed}</div>
          <h3>Risk & Need Identification</h3>
        </div>
        <span className="round-icon">⚠️</span>
      </div>

      <div className="score-block">
        <div className="score-row">
          <span>{text.risk}</span>
          <b>{decision.risk}/100</b>
        </div>
        <div className="progress-track">
          <span style={{ width: `${decision.risk}%` }} />
        </div>
        <div className="score-row secondary-score">
          <span>{text.need}</span>
          <b>{decision.waterNeed}/100</b>
        </div>
        <div className="progress-track need-track">
          <span style={{ width: `${decision.waterNeed}%` }} />
        </div>
      </div>

      <div className="alert-list">
        {decision.alerts.length > 0 ? (
          decision.alerts.map((alert) => (
            <div className="alert-item" key={alert}>⚠️ {alert}</div>
          ))
        ) : (
          <div className="safe-item">✓ {text.noAlerts}</div>
        )}
      </div>
    </article>
  );
}


function DecisionFlow({ decision }) {
  const steps = [
    ["01", "Farm & crop profile", `${decision.crop.name} • ${decision.stage}`],
    ["02", "Field + weather data", `Moisture ${decision.moisture}% • Rain ${decision.rainNext} mm`],
    ["03", "Risk / need assessment", `Risk ${decision.risk}/100 • Need ${decision.waterNeed}/100`],
    ["04", "Farmer action", decision.action],
  ];

  return (
    <div className="flow-grid">
      {steps.map(([numberValue, title, value], index) => (
        <div className={index === 3 ? "flow-card final" : "flow-card"} key={numberValue}>
          <small>{numberValue}</small>
          <b>{title}</b>
          <p>{value}</p>
        </div>
      ))}
    </div>
  );
}


function HistoryTable({ history }) {
  if (!history.length) {
    return (
      <div className="empty-history">
        Save a recommendation from the dashboard to demonstrate decision history.
      </div>
    );
  }

  return (
    <div className="history-table">
      <div className="history-head">
        <span>Time</span>
        <span>Crop</span>
        <span>Stage</span>
        <span>Decision</span>
        <span>Risk</span>
      </div>
      {history.map((record, index) => (
        <div className="history-row" key={`${record.time}-${index}`}>
          <span>{record.time}</span>
          <b>{record.crop}</b>
          <span>{record.stage}</span>
          <strong>{record.action}</strong>
          <em>{record.riskLevel} · {record.risk}</em>
        </div>
      ))}
    </div>
  );
}


/* ================================================================
   14. FARM PROFILE PAGE
   ================================================================ */

function FarmProfile({ farm, decision, text, updateFarm, go }) {
  return (
    <main className="page-shell narrow-shell">
      <SectionTitle eyebrow={text.decisionLayer} title={text.profile} />

      <section className="form-card">
        <div className="form-grid">
          <Field label={text.farmer}>
            <input
              value={farm.farmer}
              onChange={(e) => updateFarm("farmer", e.target.value)}
              placeholder="Farmer name"
            />
          </Field>

          <Field label={text.location}>
            <input
              value={farm.location}
              onChange={(e) => updateFarm("location", e.target.value)}
              placeholder="Village / district / state"
            />
          </Field>

          <Field label={text.area}>
            <input
              type="number"
              min="0"
              value={farm.area}
              onChange={(e) => updateFarm("area", e.target.value)}
            />
          </Field>

          <Field label={text.crop}>
            <select
              value={farm.crop}
              onChange={(e) => updateFarm("crop", e.target.value)}
            >
              {PLANTS.map((item) => (
                <option value={item.id} key={item.id}>
                  {item.icon} {item.name}
                </option>
              ))}
            </select>
          </Field>

          <Field label={text.stage}>
            <select
              value={farm.stage}
              onChange={(e) => updateFarm("stage", e.target.value)}
            >
              {GROWTH_STAGES.map((stage) => (
                <option value={stage} key={stage}>{stage}</option>
              ))}
            </select>
          </Field>

          <Field label={text.soil}>
            <select
              value={farm.soilType}
              onChange={(e) => updateFarm("soilType", e.target.value)}
            >
              <option>Loamy</option>
              <option>Clay</option>
              <option>Sandy loam</option>
              <option>Black soil</option>
              <option>Red soil</option>
              <option>Other</option>
            </select>
          </Field>

          <Field label={`${text.moisture} (%)`} hint="0–100">
            <input
              type="number"
              min="0"
              max="100"
              value={farm.soilMoisture}
              onChange={(e) => updateFarm("soilMoisture", e.target.value)}
            />
          </Field>

          <Field label={text.irrigation}>
            <select
              value={farm.irrigation}
              onChange={(e) => updateFarm("irrigation", e.target.value)}
            >
              <option>Available</option>
              <option>Limited</option>
              <option>Unavailable</option>
            </select>
          </Field>

          <Field label={`${text.temperature} (°C)`} hint="Weather input">
            <input
              type="number"
              value={farm.temperature}
              onChange={(e) => updateFarm("temperature", e.target.value)}
            />
          </Field>

          <Field label={`${text.humidity} (%)`} hint="Weather input">
            <input
              type="number"
              min="0"
              max="100"
              value={farm.humidity}
              onChange={(e) => updateFarm("humidity", e.target.value)}
            />
          </Field>

          <Field label={`${text.rainPast} (mm)`} hint="Weather input">
            <input
              type="number"
              min="0"
              value={farm.rainPast24}
              onChange={(e) => updateFarm("rainPast24", e.target.value)}
            />
          </Field>

          <Field label={`${text.rainNext} (mm)`} hint="Weather input">
            <input
              type="number"
              min="0"
              value={farm.rainNext24}
              onChange={(e) => updateFarm("rainNext24", e.target.value)}
            />
          </Field>

          <Field label={`${text.rainThree} (mm)`} hint="Weather input">
            <input
              type="number"
              min="0"
              value={farm.rainNext3Days}
              onChange={(e) => updateFarm("rainNext3Days", e.target.value)}
            />
          </Field>
        </div>
      </section>

      <section className="live-decision-card">
        <div>
          <div className="eyebrow">LIVE DECISION</div>
          <h2>{decision.action}</h2>
          <p>{decision.reasons.join("; ")}</p>
        </div>
        <div className="live-side">
          <span className={`risk-pill ${decision.riskLevel.toLowerCase()}`}>{decision.riskLevel}</span>
          <b>Risk {decision.risk}/100</b>
        </div>
      </section>

      <section className="small-note-card">
        <b>How FarmSense makes decisions</b>
        <p>
          The farmer enters field conditions and weather information. FarmSense then
          recalculates need, risk and the next action immediately. This makes the
          prototype a decision tool rather than a dashboard that only displays data.
        </p>
      </section>

      <button className="primary-button" onClick={() => go("home")}>
        ← {text.dashboard}
      </button>
    </main>
  );
}


function Field({ label, hint, children }) {
  return (
    <label className="field">
      <span>
        {label}
        {hint && <small>{hint}</small>}
      </span>
      {children}
    </label>
  );
}


/* ================================================================
   15. AI ASSISTANT PAGE
   ================================================================ */

function Assistant({ language, farm, decision, text }) {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content:
        language === "kn"
          ? "ನಮಸ್ಕಾರ! 🌱 ನಾನು FarmSense AI. ಈಗಿನ ಕ್ಷೇತ್ರದ ಮಾಹಿತಿಯನ್ನು ಬಳಸಿ ರೈತ ಏನು ಮಾಡಬೇಕು, ಯಾವಾಗ ಮಾಡಬೇಕು ಮತ್ತು ಏಕೆ ಎಂದು ಕೇಳಿ."
          : "Namaste! 🌱 I am FarmSense AI. Ask me what the farmer should do, when they should do it, and why, using the current field context.",
    },
  ]);
  const [question, setQuestion] = useState("");
  const [busy, setBusy] = useState(false);
  const [mode, setMode] = useState("auto");
  const [listening, setListening] = useState(false);
  const [error, setError] = useState("");
  const recognitionRef = useRef(null);
  const endRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, busy]);

  async function sendQuestion(value = question) {
    const q = value.trim();
    if (!q || busy) return;

    setQuestion("");
    setError("");
    setMessages((old) => [...old, { role: "user", content: q }]);
    setBusy(true);

    try {
      let answer = "";

      if (mode !== "local") {
        try {
          answer = await askRealAI(q, farm, decision, language);
        } catch (apiError) {
          if (mode === "ai") {
            throw apiError;
          }
          answer = localAgricultureAnswer(q, farm, decision, language);
        }
      } else {
        answer = localAgricultureAnswer(q, farm, decision, language);
      }

      setMessages((old) => [
        ...old,
        {
          role: "assistant",
          content: answer,
        },
      ]);
    } catch (err) {
      const fallback = localAgricultureAnswer(q, farm, decision, language);
      setMessages((old) => [
        ...old,
        {
          role: "assistant",
          content: fallback,
        },
      ]);
      setError(
        language === "kn"
          ? "AI backend ಸಂಪರ್ಕವಾಗಿಲ್ಲ; Local FarmSense ಉತ್ತರವನ್ನು ಬಳಸಲಾಗಿದೆ."
          : "The AI backend is not connected; Local FarmSense fallback was used."
      );
    } finally {
      setBusy(false);
    }
  }

  function startVoice() {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setError(
        language === "kn"
          ? "ಈ ಬ್ರೌಸರ್‌ನಲ್ಲಿ voice input ಬೆಂಬಲವಿಲ್ಲ. Chrome ಅಥವಾ Edge ಬಳಸಿ."
          : "Voice input is not supported in this browser. Use Chrome or Edge."
      );
      return;
    }

    if (listening) {
      recognitionRef.current?.stop();
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = language === "kn" ? "kn-IN" : "en-IN";
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setError("");
      setListening(true);
    };

    recognition.onend = () => {
      setListening(false);
    };

    recognition.onerror = () => {
      setListening(false);
      setError(
        language === "kn"
          ? "ಮೈಕ್ರೋಫೋನ್ ಅನುಮತಿ ನೀಡಿರಿ ಮತ್ತು ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ."
          : "Microphone permission failed. Allow microphone access and try again."
      );
    };

    recognition.onresult = (event) => {
      const transcript = event.results?.[0]?.[0]?.transcript || "";
      setQuestion(transcript);
    };

    recognitionRef.current = recognition;
    recognition.start();
  }

  const suggestions =
    language === "kn"
      ? [
          "ಇಂದು ಈ ರೈತ ಏನು ಮಾಡಬೇಕು?",
          "ಮಣ್ಣಿನ ತೇವಾಂಶ ಕಡಿಮೆಯಾದರೆ ಏನು ಮಾಡಬೇಕು?",
          "ಈ ಬೆಳೆ ಹೇಗೆ ಬೆಳೆಸಬೇಕು?",
          "ನನ್ನ ಹೊಲದ ಅಪಾಯ ಏನು?",
        ]
      : [
          "What should this farmer do today?",
          "What if soil moisture is low?",
          "How should I grow this crop?",
          "What is my field risk?",
        ];

  return (
    <main className="page-shell narrow-shell">
      <SectionTitle eyebrow="OPEN-ENDED DECISION SUPPORT" title={text.assistant} />

      <section className="assistant-card">
        <div className="assistant-head">
          <div className="assistant-identity">
            <div className="assistant-icon">🌱</div>
            <div>
              <b>FarmSense AI</b>
              <small>
                {decision.crop.name} • {decision.stage} • Risk {decision.risk}/100
              </small>
            </div>
          </div>

          <div className="mode-switch">
            <button
              className={mode === "auto" ? "selected" : ""}
              onClick={() => setMode("auto")}
            >
              Auto
            </button>
            <button
              className={mode === "local" ? "selected" : ""}
              onClick={() => setMode("local")}
            >
              Local
            </button>
            <button
              className={mode === "ai" ? "selected" : ""}
              onClick={() => setMode("ai")}
            >
              AI API
            </button>
          </div>
        </div>

        <div className="assistant-context">
          <span>🌾 {decision.crop.name}</span>
          <span>💧 Moisture {decision.moisture}%</span>
          <span>🌧️ Rain {decision.rainNext} mm</span>
          <span>🎯 {decision.action}</span>
        </div>

        <div className="chat-window">
          {messages.map((message, index) => (
            <div
              className={message.role === "user" ? "chat-message user" : "chat-message"}
              key={`${message.role}-${index}`}
            >
              <span className="chat-avatar">
                {message.role === "user" ? "👤" : "🌱"}
              </span>
              <div className="chat-bubble">
                {message.content.split("\n").map((line, lineIndex) => (
                  <React.Fragment key={`${index}-${lineIndex}`}>
                    {line}
                    {lineIndex < message.content.split("\n").length - 1 && <br />}
                  </React.Fragment>
                ))}
              </div>
            </div>
          ))}

          {busy && (
            <div className="chat-message">
              <span className="chat-avatar">🌱</span>
              <div className="chat-bubble typing-bubble">Thinking about the field…</div>
            </div>
          )}

          <div ref={endRef} />
        </div>

        <div className="quick-row">
          <small>{text.quickQuestions}</small>
          {suggestions.map((item) => (
            <button key={item} onClick={() => sendQuestion(item)}>
              {item}
            </button>
          ))}
        </div>

        {error && <div className="error-box">{error}</div>}

        <div className="composer">
          <button
            className={listening ? "mic-button listening" : "mic-button"}
            onClick={startVoice}
          >
            🎙️ {listening ? text.listening : text.mic}
          </button>

          <textarea
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                sendQuestion();
              }
            }}
            placeholder={text.typeQuestion}
          />

          <button className="clear-button" onClick={() => setQuestion("")}>
            ✕
          </button>

          <button
            className="send-button"
            disabled={!question.trim() || busy}
            onClick={() => sendQuestion()}
          >
            {text.send} ↑
          </button>
        </div>

        <div className="assistant-footnote">
          {mode === "local"
            ? `🌿 ${text.offline}`
            : mode === "ai"
              ? `🤖 ${text.online} / ${AI_API_URL || "/api/chat"}`
              : `⚡ Auto mode: uses real AI when available, otherwise local FarmSense reasoning.`}
        </div>
      </section>

      <section className="assistant-architecture">
        <div>
          <div className="eyebrow">WHY FARMSENSE HELPS</div>
          <h3>Not just “ask an AI”.</h3>
          <p>
            The assistant receives the farm context and the decision-engine result.
            That means the AI can explain the recommendation, answer follow-up
            questions and reason from the same evidence shown on the dashboard.
          </p>
        </div>
        <div className="architecture-flow">
          <span>Farm data</span>
          <b>→</b>
          <span>Weather</span>
          <b>→</b>
          <span>Decision</span>
          <b>→</b>
          <span>AI explanation</span>
        </div>
      </section>
    </main>
  );
}


/* ================================================================
   16. CROP EXPLORER
   ================================================================ */

function CropExplorer({ text, openCrop }) {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");

  const categories = useMemo(() => {
    return ["All", ...Array.from(new Set(PLANTS.map((item) => item.category)))];
  }, []);

  const filtered = useMemo(() => {
    const q = normalize(search);

    return PLANTS.filter((item) => {
      const categoryMatch = category === "All" || item.category === category;
      const textMatch =
        !q ||
        normalize(`${item.name} ${item.category} ${item.description}`).includes(q);

      return categoryMatch && textMatch;
    });
  }, [search, category]);

  return (
    <main className="page-shell">
      <SectionTitle eyebrow="CROP KNOWLEDGE" title={text.crops} />

      <div className="search-row">
        <div className="search-box">
          🔎
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={text.search}
          />
          {search && <button onClick={() => setSearch("")}>✕</button>}
        </div>
      </div>

      <div className="category-row">
        {categories.map((item) => (
          <button
            key={item}
            className={category === item ? "category-button selected" : "category-button"}
            onClick={() => setCategory(item)}
          >
            {item}
          </button>
        ))}
      </div>

      <div className="crop-grid">
        {filtered.map((item) => (
          <article className="crop-card" key={item.id} onClick={() => openCrop(item)}>
            <div className="crop-top-row">
              <span className="crop-icon">{item.icon}</span>
              <span className="category-pill">{item.category}</span>
            </div>
            <h3>{item.name}</h3>
            <p>{item.description}</p>
            <div className="crop-mini-facts">
              <span>🌦️ {item.season}</span>
              <span>🪨 {item.soil}</span>
              <span>💧 {item.water}</span>
              <span>🌡️ {item.temperature}</span>
            </div>
            <b className="learn-link">{text.learn} →</b>
          </article>
        ))}
      </div>

      {!filtered.length && (
        <div className="empty-history">No crop matches the current search.</div>
      )}
    </main>
  );
}


function CropDetail({ crop, text, go }) {
  return (
    <main className="page-shell narrow-shell">
      <button className="text-back" onClick={() => go("crops")}>← {text.crops}</button>

      <section className="detail-hero">
        <div className="detail-icon">{crop.icon}</div>
        <div>
          <span className="category-pill">{crop.category}</span>
          <h1>{crop.name}</h1>
          <p>{crop.description}</p>
        </div>
      </section>

      <div className="fact-grid">
        <Fact label={text.season} value={crop.season} icon="🌦️" />
        <Fact label={text.soil} value={crop.soil} icon="🪨" />
        <Fact label={text.moisture} value={crop.water} icon="💧" />
        <Fact label={text.temperature} value={crop.temperature} icon="🌡️" />
        <Fact label="Harvest" value={crop.harvest} icon="🧺" />
      </div>

      <section className="white-card crop-disease-card">
        <div className="eyebrow">COMMON HEALTH PROBLEMS</div>
        <h2>{crop.name}</h2>
        <div className="tag-list">
          {crop.diseases.map((item) => (
            <span key={item}>{item}</span>
          ))}
        </div>
      </section>

      <section className="green-callout">
        <div>
          <div className="eyebrow light">FARMSENSE DECISION SUPPORT</div>
          <h2>Use current field conditions to decide what to do next.</h2>
        </div>
        <button className="white-button" onClick={() => go("assistant")}>
          {text.askAI} →
        </button>
      </section>
    </main>
  );
}


function Fact({ label, value, icon }) {
  return (
    <div className="fact-card">
      <span>{icon}</span>
      <div>
        <small>{label}</small>
        <b>{value}</b>
      </div>
    </div>
  );
}


/* ================================================================
   17. DISEASE GUIDE
   ================================================================ */

function DiseaseGuide({ text, openDisease, go }) {
  const [search, setSearch] = useState("");

  const filtered = DISEASES.filter((item) =>
    normalize(`${item.name} ${item.type} ${item.crops.join(" ")}`).includes(normalize(search))
  );

  return (
    <main className="page-shell">
      <SectionTitle eyebrow="PLANT HEALTH" title={text.health} />

      <div className="search-row">
        <div className="search-box">
          🔎
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={text.search}
          />
          {search && <button onClick={() => setSearch("")}>✕</button>}
        </div>
      </div>

      <div className="disease-grid">
        {filtered.map((item) => (
          <article className="disease-card" key={item.id}>
            <div className="disease-icon">
              {item.type.includes("Insect") ? "🐛" : item.type.includes("Viral") ? "🦠" : "🩺"}
            </div>
            <span className="category-pill">{item.type}</span>
            <h3>{item.name}</h3>
            <p>{item.symptoms}</p>
            <div className="disease-crops">{item.crops.join(" • ")}</div>
            <div className="button-row small-row">
              <button className="secondary-button small" onClick={() => openDisease(item)}>
                {text.diseaseDetails}
              </button>
              <button className="text-button" onClick={() => go("doctor")}>
                📷 {text.doctor}
              </button>
            </div>
          </article>
        ))}
      </div>
    </main>
  );
}


function DiseaseDetail({ disease, text, go }) {
  return (
    <main className="page-shell narrow-shell">
      <button className="text-back" onClick={() => go("health")}>← {text.health}</button>

      <section className="detail-hero">
        <div className="detail-icon">
          {disease.type.includes("Insect") ? "🐛" : disease.type.includes("Viral") ? "🦠" : "🩺"}
        </div>
        <div>
          <span className="category-pill">{disease.type}</span>
          <h1>{disease.name}</h1>
          <p>Affected crops: {disease.crops.join(", ")}</p>
        </div>
      </section>

      <div className="detail-info-grid">
        <InfoBox title="Symptoms" value={disease.symptoms} icon="🔎" />
        <InfoBox title="Causes" value={disease.causes} icon="🧬" />
        <InfoBox title="Prevention" value={disease.prevention} icon="🛡️" />
        <InfoBox title="Management" value={disease.management} icon="🌿" />
      </div>

      <section className="large-disclaimer">
        🛡️ {text.disclaimer}
      </section>

      <button className="primary-button" onClick={() => go("doctor")}>
        📷 {text.doctor}
      </button>
    </main>
  );
}


function InfoBox({ title, value, icon }) {
  return (
    <article className="info-box">
      <span>{icon}</span>
      <div>
        <small>{title}</small>
        <p>{value}</p>
      </div>
    </article>
  );
}


/* ================================================================
   18. PLANT DOCTOR
   ================================================================ */

function PlantDoctor({ text, language, farm }) {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState("");
  const [result, setResult] = useState(null);
  const [cropId, setCropId] = useState(farm.crop);
  const [symptoms, setSymptoms] = useState("");
  const [busy, setBusy] = useState(false);
  const fileRef = useRef(null);

  function chooseFile(selected) {
    if (!selected) return;
    setFile(selected);
    setPreview(URL.createObjectURL(selected));
    setResult(null);
  }

  async function analyzePhoto() {
    if (!file) return;

    setBusy(true);

    try {
      const endpoint = VISION_API_URL || "/api/plant/analyze";
      const formData = new FormData();
      formData.append("image", file);
      formData.append("crop", cropById(cropId).name);
      formData.append("symptoms", symptoms);
      formData.append("language", language);

      const response = await fetch(endpoint, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Vision backend returned ${response.status}`);
      }

      const data = await response.json();
      setResult({
        connected: true,
        condition: data.condition || data.diagnosis || "Vision result received",
        explanation: data.explanation || data.symptoms || "The vision backend returned a result.",
        advice: data.advice || data.management || "Follow the returned crop-specific guidance.",
      });
    } catch (error) {
      const crop = cropById(cropId);
      const symptomText = normalize(symptoms);
      const matches = [];

      crop.diseases.forEach((name) => {
        const disease = DISEASES.find((item) => normalize(item.name).includes(normalize(name)) || normalize(name).includes(normalize(item.name)));
        if (disease) {
          const words = normalize(`${disease.name} ${disease.symptoms}`).split(" ");
          const overlap = words.some((word) => word.length > 4 && symptomText.includes(word));
          if (overlap) matches.push(disease);
        }
      });

      setResult({
        connected: false,
        condition: matches[0]?.name || "Image captured — vision AI not connected",
        explanation: matches[0]
          ? `${matches[0].symptoms} Possible match based on the crop and symptom text; this is not an image diagnosis.`
          : "The photograph is ready for a real vision model. The current frontend intentionally does not invent a disease name or confidence score from image pixels.",
        advice: matches[0]
          ? `${matches[0].causes}\n\nPrevention: ${matches[0].prevention}\n\nManagement: ${matches[0].management}`
          : "Connect /api/plant/analyze to a vision model. Meanwhile, describe the symptom and use the Disease Guide to investigate possible conditions.",
      });
    } finally {
      setBusy(false);
    }
  }

  function clearPhoto() {
    setFile(null);
    setPreview("");
    setResult(null);
    setSymptoms("");
  }

  return (
    <main className="page-shell narrow-shell">
      <SectionTitle eyebrow="AI-ASSISTED PLANT HEALTH" title={text.doctor} />

      <div className="doctor-layout">
        <section className="doctor-upload-card">
          <div className="upload-zone" onClick={() => fileRef.current?.click()}>
            {preview ? (
              <img src={preview} alt="Uploaded plant" />
            ) : (
              <>
                <span>📷</span>
                <b>{text.upload}</b>
                <small>JPG • PNG • WEBP</small>
              </>
            )}
          </div>

          <input
            ref={fileRef}
            hidden
            type="file"
            accept="image/*"
            capture="environment"
            onChange={(e) => chooseFile(e.target.files?.[0])}
          />

          <div className="doctor-form">
            <label className="field">
              <span>Crop</span>
              <select value={cropId} onChange={(e) => setCropId(e.target.value)}>
                {PLANTS.map((item) => (
                  <option value={item.id} key={item.id}>
                    {item.icon} {item.name}
                  </option>
                ))}
              </select>
            </label>

            <label className="field">
              <span>Describe symptoms</span>
              <textarea
                value={symptoms}
                onChange={(e) => setSymptoms(e.target.value)}
                placeholder="Example: yellow spots on older leaves, insects under leaf..."
              />
            </label>
          </div>

          <div className="button-row">
            <button className="secondary-button" onClick={() => fileRef.current?.click()}>
              📸 {text.camera}
            </button>
            <button className="primary-button" disabled={!file || busy} onClick={analyzePhoto}>
              🔬 {busy ? "Analyzing..." : text.analyze}
            </button>
            <button className="text-button" onClick={clearPhoto}>
              {text.clear}
            </button>
          </div>
        </section>

        <section className="doctor-result-card">
          {!result ? (
            <div className="doctor-empty">
              <span>🌿</span>
              <h3>{text.plantHealth}</h3>
              <p>
                Add a clear plant image. A real vision backend can return a possible
                condition, explanation and management guidance here.
              </p>
            </div>
          ) : (
            <div className="doctor-result">
              <div className="result-status">
                <span className={result.connected ? "connected-dot" : "local-dot"} />
                {result.connected ? "Vision AI connected" : "Local / no vision backend"}
              </div>
              <h2>{result.condition}</h2>
              <div className="result-section">
                <b>What it may mean</b>
                <p>{result.explanation}</p>
              </div>
              <div className="result-section">
                <b>What to do</b>
                <p>{result.advice}</p>
              </div>
              <div className="large-disclaimer">🛡️ {text.disclaimer}</div>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}


/* ================================================================
   19. FOOTER
   ================================================================ */

function Footer() {
  return (
    <footer className="footer">
      <div>
        <b>🌱 Agri Saathi AI</b>
        <span>Agri Saathi AI • Smart farm decision support</span>
      </div>
      <span>Farm data → Weather → Assessment → Risk → Decision</span>
    </footer>
  );
}


