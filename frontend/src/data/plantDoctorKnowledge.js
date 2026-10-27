const COMMON_CARE = [
  "Inspect several plants and the underside of leaves before deciding on treatment.",
  "Remove badly affected plant material with clean tools and dispose of it away from the field.",
  "Avoid watering foliage; irrigate the root zone in the morning and improve airflow.",
  "Use only locally approved products and follow the product label. Ask an agricultural expert when symptoms spread quickly.",
];

export const PLANT_DOCTOR_KNOWLEDGE = {
  tomato: {
    crop: "Tomato",
    symptoms: [
      {
        terms: ["yellow", "yellowing", "pale", "older leaves"],
        possible: "Nutrient stress or early disease symptoms",
        causes: "Yellowing can follow nutrient imbalance, water stress, poor drainage, or an early foliar disease.",
        prevention: "Keep irrigation even, maintain drainage, remove weeds, and use a soil test before applying fertilizer.",
      },
      {
        terms: ["spot", "spots", "brown", "dark", "blight"],
        possible: "Possible fungal or bacterial leaf-spot pattern",
        causes: "Leaf spots can be associated with persistent leaf wetness, infected residue, or splash from soil.",
        prevention: "Increase spacing and airflow, use clean water at the base, mulch soil, and remove infected leaves.",
      },
      {
        terms: ["curl", "curled", "mosaic", "sticky", "whitefly", "insect"],
        possible: "Possible insect-related stress or virus-like symptom pattern",
        causes: "Sap-feeding insects can cause curling, sticky residue, and virus-like patterns.",
        prevention: "Inspect leaf undersides, remove heavily affected plants when advised locally, and use integrated pest management.",
      },
    ],
  },
  rice: {
    crop: "Rice / Paddy",
    symptoms: [
      {
        terms: ["brown", "spot", "lesion", "blast"],
        possible: "Possible rice leaf-spot or blast-like pattern",
        causes: "Leaf lesions can be associated with prolonged leaf wetness, crop stress, or infected residue.",
        prevention: "Use balanced nutrition, avoid excessive nitrogen, manage water carefully, and follow local advisories.",
      },
      {
        terms: ["insect", "hopper", "yellow", "curl"],
        possible: "Possible insect or nutrient stress pattern",
        causes: "Hoppers and other pests may cause yellowing, curling, or patchy crop decline.",
        prevention: "Scout regularly and use integrated pest management rather than routine spraying.",
      },
    ],
  },
  wheat: {
    crop: "Wheat",
    symptoms: [
      {
        terms: ["rust", "orange", "brown", "powder", "spot"],
        possible: "Possible rust or foliar disease pattern",
        causes: "Rust-like symptoms often increase in humid conditions and may spread through the canopy.",
        prevention: "Use resistant varieties where available, monitor field edges, and follow local extension guidance.",
      },
    ],
  },
  maize: {
    crop: "Maize / Corn",
    symptoms: [
      {
        terms: ["worm", "insect", "window", "chew", "hole"],
        possible: "Possible caterpillar or chewing-insect damage",
        causes: "Chewed leaves and window-pane damage can be caused by caterpillars or other chewing pests.",
        prevention: "Inspect whorls and leaf undersides regularly and use locally approved integrated controls.",
      },
      {
        terms: ["spot", "stripe", "brown", "blight"],
        possible: "Possible maize foliar disease pattern",
        causes: "Spots or stripes can follow infected residue, humidity, and prolonged leaf wetness.",
        prevention: "Rotate crops where practical, manage residue, and avoid unnecessary leaf wetness.",
      },
    ],
  },
  chilli: {
    crop: "Chilli",
    symptoms: [
      {
        terms: ["curl", "thrips", "silver", "sticky", "insect"],
        possible: "Possible sucking-insect stress or virus-like symptom pattern",
        causes: "Thrips and other sap-feeding insects can cause curling, silvering, and distorted new growth.",
        prevention: "Scout new growth, remove severely affected plants when advised, and use integrated pest management.",
      },
      {
        terms: ["spot", "rot", "sunken", "brown"],
        possible: "Possible fruit or leaf-spot disease pattern",
        causes: "Wet foliage, fruit injury, and poor airflow can increase spot and rot problems.",
        prevention: "Keep foliage dry, improve airflow, remove damaged fruit, and avoid overhead irrigation.",
      },
    ],
  },
  default: {
    crop: "selected crop",
    symptoms: [],
  },
};

export function getPlantDoctorGuidance(cropId, symptomText) {
  const knowledge = PLANT_DOCTOR_KNOWLEDGE[cropId] || PLANT_DOCTOR_KNOWLEDGE.default;
  const normalized = symptomText.trim().toLowerCase();
  const match = knowledge.symptoms.find((item) =>
    item.terms.some((term) => normalized.includes(term)),
  );

  if (!match) {
    return {
      possible: "No specific symptom pattern selected",
      causes: normalized
        ? `The entered symptoms (“${symptomText.trim()}”) need closer field inspection. Similar-looking symptoms can have different causes.`
        : "No symptoms were entered, so this is general crop-care guidance rather than a condition suggestion.",
      prevention: "Monitor new and older leaves separately, check soil moisture and drainage, and record whether symptoms are spreading.",
      care: COMMON_CARE,
    };
  }

  return {
    possible: match.possible,
    causes: match.causes,
    prevention: match.prevention,
    care: COMMON_CARE,
  };
}
