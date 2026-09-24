// ============================================================
// AGRI SAATHI AI - LOCAL AGRICULTURE KNOWLEDGE BASE
// ============================================================

const PLANTS = [
  {
    id: "rice",
    name: "Rice / Paddy",
    category: "Cereal",
    icon: "🌾",
    season: "Kharif",
    soil: "Clayey or loamy soil with good water retention",
    water: "High",
    temperature: "20–35°C",
    harvest: "110–150 days",
    description: "Major cereal crop requiring warm and humid conditions.",
    diseases: [
      "Rice Blast",
      "Brown Planthopper",
      "Bacterial Leaf Blight",
      "Sheath Blight",
      "Stem Borer"
    ]
  },
  {
    id: "wheat",
    name: "Wheat",
    category: "Cereal",
    icon: "🌾",
    season: "Rabi",
    soil: "Well-drained loamy soil",
    water: "Medium",
    temperature: "15–25°C",
    harvest: "110–150 days",
    description: "Important winter cereal crop.",
    diseases: [
      "Leaf Rust",
      "Stripe Rust",
      "Powdery Mildew",
      "Aphids",
      "Termites"
    ]
  },
  {
    id: "maize",
    name: "Maize / Corn",
    category: "Cereal",
    icon: "🌽",
    season: "Kharif / Rabi",
    soil: "Well-drained fertile soil",
    water: "Medium",
    temperature: "18–32°C",
    harvest: "90–120 days",
    description: "Versatile cereal crop used for food, feed and industry.",
    diseases: [
      "Fall Armyworm",
      "Corn Leaf Blight",
      "Stem Borer",
      "Rust",
      "Downy Mildew"
    ]
  },
  {
    id: "millet",
    name: "Millet",
    category: "Cereal",
    icon: "🌾",
    season: "Kharif",
    soil: "Light and well-drained soil",
    water: "Low",
    temperature: "25–35°C",
    harvest: "70–100 days",
    description: "Drought-tolerant cereal suitable for dry regions.",
    diseases: [
      "Downy Mildew",
      "Blast",
      "Rust",
      "Shoot Fly"
    ]
  },
  {
    id: "sugarcane",
    name: "Sugarcane",
    category: "Commercial",
    icon: "🎋",
    season: "Year-round",
    soil: "Deep fertile loamy soil",
    water: "High",
    temperature: "20–35°C",
    harvest: "10–18 months",
    description: "Long-duration commercial crop.",
    diseases: [
      "Red Rot",
      "Smut",
      "Wilt",
      "Early Shoot Borer",
      "Whitefly"
    ]
  },
  {
    id: "cotton",
    name: "Cotton",
    category: "Commercial",
    icon: "☁️",
    season: "Kharif",
    soil: "Black soil is commonly suitable",
    water: "Medium",
    temperature: "21–30°C",
    harvest: "150–180 days",
    description: "Important fibre crop.",
    diseases: [
      "Bollworm",
      "Whitefly",
      "Leaf Curl Virus",
      "Wilt",
      "Bacterial Blight"
    ]
  },
  {
    id: "tomato",
    name: "Tomato",
    category: "Vegetable",
    icon: "🍅",
    season: "Multiple seasons",
    soil: "Well-drained loamy soil",
    water: "Medium",
    temperature: "20–30°C",
    harvest: "60–90 days",
    description: "Popular vegetable crop grown across India.",
    diseases: [
      "Early Blight",
      "Late Blight",
      "Leaf Curl Virus",
      "Bacterial Wilt",
      "Fruit Borer"
    ]
  },
  {
    id: "potato",
    name: "Potato",
    category: "Vegetable",
    icon: "🥔",
    season: "Rabi",
    soil: "Loose sandy loam",
    water: "Medium",
    temperature: "15–25°C",
    harvest: "70–120 days",
    description: "Important tuber crop.",
    diseases: [
      "Late Blight",
      "Early Blight",
      "Bacterial Wilt",
      "Aphids",
      "Tuber Moth"
    ]
  },
  {
    id: "onion",
    name: "Onion",
    category: "Vegetable",
    icon: "🧅",
    season: "Rabi / Kharif",
    soil: "Well-drained loamy soil",
    water: "Medium",
    temperature: "13–25°C",
    harvest: "90–150 days",
    description: "Bulb vegetable widely cultivated in India.",
    diseases: [
      "Purple Blotch",
      "Downy Mildew",
      "Thrips",
      "Basal Rot",
      "Stemphylium Blight"
    ]
  },
  {
    id: "chilli",
    name: "Chilli",
    category: "Vegetable",
    icon: "🌶️",
    season: "Multiple seasons",
    soil: "Well-drained loamy soil",
    water: "Medium",
    temperature: "20–30°C",
    harvest: "120–150 days",
    description: "Important spice and vegetable crop.",
    diseases: [
      "Leaf Curl Virus",
      "Anthracnose",
      "Thrips",
      "Powdery Mildew",
      "Fruit Rot"
    ]
  },
  {
    id: "brinjal",
    name: "Brinjal / Eggplant",
    category: "Vegetable",
    icon: "🍆",
    season: "Multiple seasons",
    soil: "Fertile well-drained soil",
    water: "Medium",
    temperature: "21–30°C",
    harvest: "100–140 days",
    description: "Warm-season vegetable crop.",
    diseases: [
      "Shoot and Fruit Borer",
      "Bacterial Wilt",
      "Little Leaf",
      "Phomopsis Blight",
      "Aphids"
    ]
  },
  {
    id: "okra",
    name: "Okra / Bhindi",
    category: "Vegetable",
    icon: "🥬",
    season: "Kharif / Summer",
    soil: "Well-drained loamy soil",
    water: "Medium",
    temperature: "24–32°C",
    harvest: "45–65 days",
    description: "Fast-growing vegetable crop.",
    diseases: [
      "Yellow Vein Mosaic",
      "Fruit Borer",
      "Aphids",
      "Jassids",
      "Powdery Mildew"
    ]
  },
  {
    id: "groundnut",
    name: "Groundnut / Peanut",
    category: "Oilseed",
    icon: "🥜",
    season: "Kharif",
    soil: "Sandy loam",
    water: "Medium",
    temperature: "25–30°C",
    harvest: "90–120 days",
    description: "Important oilseed and food crop.",
    diseases: [
      "Groundnut Leaf Spot",
      "Rust",
      "Collar Rot",
      "Aphids",
      "Thrips"
    ]
  },
  {
    id: "soybean",
    name: "Soybean",
    category: "Oilseed",
    icon: "🌱",
    season: "Kharif",
    soil: "Well-drained loamy soil",
    water: "Medium",
    temperature: "20–30°C",
    harvest: "90–110 days",
    description: "Major protein and oilseed crop.",
    diseases: [
      "Yellow Mosaic Virus",
      "Stem Fly",
      "Pod Borer",
      "Rust",
      "Charcoal Rot"
    ]
  },
  {
    id: "mustard",
    name: "Mustard",
    category: "Oilseed",
    icon: "🌼",
    season: "Rabi",
    soil: "Well-drained loamy soil",
    water: "Low–Medium",
    temperature: "10–25°C",
    harvest: "110–150 days",
    description: "Major winter oilseed crop.",
    diseases: [
      "White Rust",
      "Alternaria Blight",
      "Powdery Mildew",
      "Aphids"
    ]
  },
  {
    id: "chickpea",
    name: "Chickpea / Chana",
    category: "Pulse",
    icon: "🫘",
    season: "Rabi",
    soil: "Well-drained loamy soil",
    water: "Low",
    temperature: "15–25°C",
    harvest: "90–120 days",
    description: "Important pulse crop.",
    diseases: [
      "Fusarium Wilt",
      "Ascochyta Blight",
      "Pod Borer",
      "Root Rot"
    ]
  },
  {
    id: "pigeonpea",
    name: "Pigeon Pea / Tur",
    category: "Pulse",
    icon: "🌱",
    season: "Kharif",
    soil: "Well-drained soil",
    water: "Low–Medium",
    temperature: "20–30°C",
    harvest: "150–240 days",
    description: "Long-duration pulse crop.",
    diseases: [
      "Wilt",
      "Sterility Mosaic",
      "Pod Borer",
      "Phytophthora Blight"
    ]
  },
  {
    id: "banana",
    name: "Banana",
    category: "Fruit",
    icon: "🍌",
    season: "Year-round",
    soil: "Deep fertile well-drained soil",
    water: "High",
    temperature: "20–35°C",
    harvest: "11–14 months",
    description: "Major tropical fruit crop.",
    diseases: [
      "Panama Wilt",
      "Sigatoka",
      "Bunchy Top Virus",
      "Rhizome Weevil"
    ]
  },
  {
    id: "mango",
    name: "Mango",
    category: "Fruit",
    icon: "🥭",
    season: "Perennial",
    soil: "Deep well-drained soil",
    water: "Medium",
    temperature: "24–30°C",
    harvest: "Seasonal",
    description: "Major Indian fruit crop.",
    diseases: [
      "Anthracnose",
      "Powdery Mildew",
      "Mango Hopper",
      "Fruit Fly",
      "Dieback"
    ]
  },
  {
    id: "papaya",
    name: "Papaya",
    category: "Fruit",
    icon: "🍈",
    season: "Year-round",
    soil: "Well-drained fertile soil",
    water: "Medium",
    temperature: "21–33°C",
    harvest: "8–12 months",
    description: "Fast-growing tropical fruit crop.",
    diseases: [
      "Papaya Ring Spot Virus",
      "Powdery Mildew",
      "Root Rot",
      "Mealybug"
    ]
  },
  {
    id: "coconut",
    name: "Coconut",
    category: "Plantation",
    icon: "🥥",
    season: "Perennial",
    soil: "Sandy loam and coastal soil",
    water: "High",
    temperature: "25–32°C",
    harvest: "Year-round",
    description: "Important tropical plantation crop.",
    diseases: [
      "Bud Rot",
      "Root Wilt",
      "Stem Bleeding",
      "Rhinoceros Beetle",
      "Red Palm Weevil"
    ]
  },
  {
    id: "turmeric",
    name: "Turmeric",
    category: "Spice",
    icon: "🟡",
    season: "Kharif",
    soil: "Well-drained loamy soil",
    water: "Medium–High",
    temperature: "20–35°C",
    harvest: "7–9 months",
    description: "Major spice and medicinal crop.",
    diseases: [
      "Rhizome Rot",
      "Leaf Spot",
      "Leaf Blotch",
      "Shoot Borer"
    ]
  },
  {
    id: "ginger",
    name: "Ginger",
    category: "Spice",
    icon: "🫚",
    season: "Kharif",
    soil: "Rich well-drained soil",
    water: "Medium–High",
    temperature: "20–30°C",
    harvest: "7–9 months",
    description: "Important spice crop.",
    diseases: [
      "Soft Rot",
      "Leaf Spot",
      "Bacterial Wilt",
      "Shoot Borer"
    ]
  },
  {
    id: "coffee",
    name: "Coffee",
    category: "Plantation",
    icon: "☕",
    season: "Perennial",
    soil: "Deep fertile acidic soil",
    water: "Medium–High",
    temperature: "18–28°C",
    harvest: "Seasonal",
    description: "Important plantation crop in South India.",
    diseases: [
      "Coffee Leaf Rust",
      "Berry Disease",
      "White Stem Borer",
      "Black Rot"
    ]
  }
];

const DISEASES = [
  {
    id: "rice-blast",
    name: "Rice Blast",
    crops: ["Rice"],
    type: "Fungal disease",
    symptoms: "Spindle-shaped lesions may appear on leaves and other plant parts.",
    causes: "Fungal infection promoted by suitable humidity and crop conditions.",
    prevention: "Use healthy seed, balanced nutrition and recommended agronomic practices.",
    management: "Remove heavily affected material where practical and follow local agricultural recommendations."
  },
  {
    id: "late-blight",
    name: "Late Blight",
    crops: ["Tomato", "Potato"],
    type: "Fungal-like disease",
    symptoms: "Dark lesions can develop on leaves and stems; fruit or tubers may also be affected.",
    causes: "Favoured by cool, wet conditions.",
    prevention: "Use healthy planting material and maintain appropriate spacing and field sanitation.",
    management: "Seek local expert guidance for approved disease-management products."
  },
  {
    id: "early-blight",
    name: "Early Blight",
    crops: ["Tomato", "Potato"],
    type: "Fungal disease",
    symptoms: "Brown lesions, often with concentric ring patterns, may develop on older leaves.",
    causes: "Fungal infection favoured by leaf wetness and plant stress.",
    prevention: "Crop rotation, sanitation and good airflow can help reduce risk.",
    management: "Use locally recommended management practices."
  },
  {
    id: "yellow-mosaic",
    name: "Yellow Mosaic Virus",
    crops: ["Soybean"],
    type: "Viral disease",
    symptoms: "Yellow and green mosaic patterns may appear on leaves.",
    causes: "Virus commonly spread by insect vectors.",
    prevention: "Use healthy planting material and manage vectors according to local recommendations.",
    management: "Remove severely affected plants where appropriate and control vectors using integrated practices."
  },
  {
    id: "bacterial-wilt",
    name: "Bacterial Wilt",
    crops: ["Tomato", "Brinjal"],
    type: "Bacterial disease",
    symptoms: "Plants may wilt while leaves initially remain green.",
    causes: "Soil-borne bacterial infection.",
    prevention: "Use clean planting material and maintain field sanitation.",
    management: "Remove affected plants and avoid moving contaminated soil or water."
  },
  {
    id: "powdery-mildew",
    name: "Powdery Mildew",
    crops: ["Mango", "Mustard", "Chilli"],
    type: "Fungal disease",
    symptoms: "White powdery growth can appear on leaves, shoots or flowers.",
    causes: "Fungal infection favoured by suitable humidity and plant conditions.",
    prevention: "Maintain airflow and avoid excessive dense growth.",
    management: "Use locally approved disease-management practices."
  },
  {
    id: "anthracnose",
    name: "Anthracnose",
    crops: ["Mango", "Chilli"],
    type: "Fungal disease",
    symptoms: "Dark sunken lesions can occur on leaves, shoots or fruits.",
    causes: "Fungal infection, often favoured by wet conditions.",
    prevention: "Field sanitation and good airflow can reduce disease pressure.",
    management: "Consult local agriculture experts for crop-specific treatment."
  },
  {
    id: "aphids",
    name: "Aphids",
    crops: ["Wheat", "Mustard", "Chilli", "Potato"],
    type: "Insect pest",
    symptoms: "Small insects cluster on young shoots and leaves; plants may become distorted.",
    causes: "Aphid infestation.",
    prevention: "Encourage beneficial insects and monitor crops regularly.",
    management: "Use integrated pest management and locally approved controls when thresholds are exceeded."
  },
  {
    id: "fall-armyworm",
    name: "Fall Armyworm",
    crops: ["Maize"],
    type: "Insect pest",
    symptoms: "Leaf feeding damage and ragged holes can occur, especially in young maize.",
    causes: "Larvae of an invasive moth species.",
    prevention: "Regular crop scouting and early detection.",
    management: "Follow local integrated pest-management recommendations."
  },
  {
    id: "bollworm",
    name: "Bollworm",
    crops: ["Cotton"],
    type: "Insect pest",
    symptoms: "Larvae damage buds, flowers and developing bolls.",
    causes: "Caterpillar infestation.",
    prevention: "Regular scouting and integrated pest management.",
    management: "Use locally recommended control measures based on pest thresholds."
  },
  {
    id: "yellow-vein-mosaic",
    name: "Yellow Vein Mosaic",
    crops: ["Okra"],
    type: "Viral disease",
    symptoms: "Veins become yellow and leaves can show mosaic patterns.",
    causes: "Viral infection transmitted by insect vectors.",
    prevention: "Monitor and manage vector populations.",
    management: "Remove severely affected plants where recommended."
  },
  {
    id: "panama-wilt",
    name: "Panama Wilt",
    crops: ["Banana"],
    type: "Fungal disease",
    symptoms: "Leaves may yellow and wilt progressively.",
    causes: "Soil-borne fungal pathogen.",
    prevention: "Use healthy planting material and maintain field sanitation.",
    management: "Use resistant varieties and follow local expert recommendations."
  }
];

// ============================================================
// AI ASSISTANT
// ============================================================

function normalize(text) {
  return text
    .toLowerCase()
    .replace(/[?!.!,]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function findCrop(question) {
  const q = normalize(question);

  return PLANTS.find((crop) => {
    const words = [
      crop.name.toLowerCase(),
      crop.id,
      ...crop.name.toLowerCase().split(" ")
    ];

    return words.some((word) => word.length > 2 && q.includes(word));
  });
}

function answerAgricultureQuestion(question) {
  const q = normalize(question);

  if (!q) {
    return {
      answer: "Please type an agriculture question.",
      suggestions: ["How much water does rice need?", "Tomato diseases", "What is NPK?"]
    };
  }

  const crop = findCrop(q);

  if (
    q.includes("hello") ||
    q.includes("hi") ||
    q.includes("namaste") ||
    q.includes("ನಮಸ್ಕಾರ")
  ) {
    return {
      answer:
        "Namaste! 🌱 I am Agri Saathi AI. I can help you with crops, plant diseases, soil, irrigation, nutrients, pests and basic farming guidance.",
      suggestions: [
        "Tell me about tomato",
        "Rice diseases",
        "What is NPK?",
        "How often should I water my crop?"
      ]
    };
  }

  if (q.includes("npk")) {
    return {
      answer:
        "🌱 NPK stands for Nitrogen, Phosphorus and Potassium. Nitrogen supports vegetative growth, phosphorus supports root and reproductive development, and potassium supports water regulation and stress response. Exact fertilizer quantities should be based on the crop and a soil test.",
      suggestions: [
        "What is nitrogen?",
        "What is phosphorus?",
        "What is potassium?"
      ]
    };
  }

  if (q.includes("nitrogen")) {
    return {
      answer:
        "Nitrogen is an essential nutrient for plant growth, especially leaves and vegetative development. Low nitrogen can be associated with pale foliage and weak growth. Confirm nutrient status with a soil test before applying fertilizer."
    };
  }

  if (q.includes("phosphorus")) {
    return {
      answer:
        "Phosphorus supports root development, energy transfer and reproductive growth. The required amount varies by crop and soil condition, so use soil-test results and local recommendations."
    };
  }

  if (q.includes("potassium")) {
    return {
      answer:
        "Potassium supports water regulation, enzyme activity and plant stress response. Crop requirements vary, so avoid applying large quantities without soil-test information."
    };
  }

  if (
    q.includes("fertilizer") ||
    q.includes("fertiliser") ||
    q.includes("ಗೊಬ್ಬರ")
  ) {
    return {
      answer:
        "💊 Fertilizer decisions should consider crop, soil-test NPK, pH, growth stage and local recommendations. I can explain the role of individual nutrients, but exact application rates should come from a soil test or agricultural professional."
    };
  }

  if (
    q.includes("water") ||
    q.includes("irrigation") ||
    q.includes("watering") ||
    q.includes("ನೀರು")
  ) {
    if (crop) {
      return {
        answer: `💧 ${crop.name} generally requires ${crop.water} water. Its suitable temperature range is approximately ${crop.temperature}. Actual irrigation should depend on soil moisture, weather, crop stage and local conditions.`
      };
    }

    return {
      answer:
        "💧 Irrigation should depend on crop type, growth stage, soil type, rainfall and soil moisture. Avoid both prolonged waterlogging and severe moisture stress."
    };
  }

  if (
    q.includes("disease") ||
    q.includes("diseases") ||
    q.includes("रोग") ||
    q.includes("ರೋಗ")
  ) {
    if (crop) {
      return {
        answer: `🩺 Common problems associated with ${crop.name} include: ${crop.diseases.join(", ")}. A photo-based result is only a screening and should be confirmed by an agriculture expert before treatment.`,
        suggestions: crop.diseases.slice(0, 3).map((x) => `${x} in ${crop.name}`)
      };
    }

    return {
      answer:
        "🩺 I can help you identify possible plant-health issues. Tell me the crop name and describe the symptoms, or use the Plant Doctor photo scanner."
    };
  }

  if (
    q.includes("soil") ||
    q.includes("ph") ||
    q.includes("pH".toLowerCase())
  ) {
    return {
      answer:
        "🧪 Soil health depends on pH, organic matter, NPK, texture, moisture and drainage. A laboratory soil test is much more reliable than judging fertility from soil colour or a photograph."
    };
  }

  if (
    q.includes("crop") ||
    q.includes("grow") ||
    q.includes("plant")
  ) {
    if (crop) {
      return {
        answer: `🌾 ${crop.name} is a ${crop.category.toLowerCase()} crop. It is generally grown in ${crop.season} conditions. Soil: ${crop.soil}. Typical temperature: ${crop.temperature}. Harvest period: ${crop.harvest}.`,
        suggestions: [
          `${crop.name} diseases`,
          `${crop.name} water requirement`,
          `${crop.name} soil`
        ]
      };
    }

    return {
      answer:
        "🌱 Crop selection depends on soil, climate, rainfall, irrigation availability, season, market conditions and local farming practices. Use the Crop Library to explore available crops."
    };
  }

  if (crop) {
    return {
      answer: `🌱 ${crop.name}: ${crop.description} It generally prefers ${crop.soil}. Water requirement: ${crop.water}. Temperature: ${crop.temperature}. Common issues include ${crop.diseases.slice(0, 4).join(", ")}.`,
      suggestions: [
        `${crop.name} diseases`,
        `${crop.name} irrigation`,
        `${crop.name} soil`
      ]
    };
  }

  return {
    answer:
      "🤖 I can help with crop information, plant diseases, pests, irrigation, soil, NPK and fertilizer basics. Try asking something like “What are tomato diseases?” or “How much water does rice need?”",
    suggestions: [
      "What is NPK?",
      "Tomato diseases",
      "Rice information",
      "How should I manage irrigation?"
    ]
  };
}

// ============================================================
// PHOTO SCREENING
// This is a visual heuristic, NOT a real ML diagnosis.
// ============================================================

function analyzePlantImage(file) {
  if (!file) {
    return {
      title: "No image selected",
      condition: "No result",
      confidence: 0
    };
  }

  const name = file.name.toLowerCase();

  let condition = "General plant stress / possible leaf issue";
  let confidence = 0.52;
  let advice =
    "This prototype cannot reliably diagnose a disease from an image alone. Check the crop, symptoms, weather and consult a local agriculture expert before treatment.";

  if (
    name.includes("blight") ||
    name.includes("spot") ||
    name.includes("leaf")
  ) {
    condition = "Possible leaf spot / blight pattern";
    confidence = 0.62;
    advice =
      "Inspect the underside and upper surface of leaves. Look for expanding spots, fungal growth and plant-to-plant spread.";
  } else if (
    name.includes("yellow") ||
    name.includes("mosaic")
  ) {
    condition = "Possible nutrient stress or viral-like symptom";
    confidence = 0.58;
    advice =
      "Check whether yellowing is uniform or mosaic-like. Review soil nutrition and inspect for insect vectors.";
  } else if (
    name.includes("pest") ||
    name.includes("insect") ||
    name.includes("worm")
  ) {
    condition = "Possible insect or pest damage";
    confidence = 0.64;
    advice =
      "Inspect leaves, stems and growing points for insects, eggs, webbing or chewing damage.";
  }

  return {
    title: "Plant Health Screening",
    condition,
    confidence,
    advice
  };
}

export {
  PLANTS,
  DISEASES,
  answerAgricultureQuestion,
  analyzePlantImage
};
