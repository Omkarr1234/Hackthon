export const DEMO_SHOPS = [
  { name: "Sample Green Seeds Centre", address: "Fictional address, Mandya region", category: "Seeds", contact: "Demo contact only", open_in_maps: "https://www.openstreetmap.org/", is_demo: true },
  { name: "Sample Kaveri Farm Supplies", address: "Fictional address, Mysuru region", category: "Fertilizer", contact: "Demo contact only", open_in_maps: "https://www.openstreetmap.org/", is_demo: true },
  { name: "Sample Raitha Irrigation Hub", address: "Fictional address, Hassan region", category: "Irrigation", contact: "Demo contact only", open_in_maps: "https://www.openstreetmap.org/", is_demo: true },
  { name: "Sample Mysore Seed Nursery", address: "Fictional address, Mysuru region", category: "Seeds and nursery", contact: "Demo contact only", open_in_maps: "https://www.openstreetmap.org/", is_demo: true },
  { name: "Sample Deccan Farm Tools", address: "Fictional address, Dharwad region", category: "Farm supplies", contact: "Demo contact only", open_in_maps: "https://www.openstreetmap.org/", is_demo: true },
  { name: "Sample Soil Care Point", address: "Fictional address, Kolar region", category: "Soil testing", contact: "Demo contact only", open_in_maps: "https://www.openstreetmap.org/", is_demo: true },
];

export const DEMO_NEWS = [
  { title: "FarmSense sample: Karnataka crop advisory", summary: "Illustrative advisory link for the demo; verify current guidance with the official department.", publisher: "FarmSense demo", published: "Demo sample", url: "https://raitamitra.karnataka.gov.in/", category: "Sample source", is_demo: true },
  { title: "FarmSense sample: weather-based farming guidance", summary: "Illustrative source link for the demo; not a live alert or forecast.", publisher: "FarmSense demo", published: "Demo sample", url: "https://mausam.imd.gov.in/", category: "Sample source", is_demo: true },
];

export const DEMO_PRODUCTS = [
  { id: "demo-seeds", name: "Vegetable seed information", description: "Illustrative demo catalog entry.", category: "Seeds", price: null, currency: "INR", url: "https://icar.gov.in/", is_demo: true },
  { id: "demo-tools", name: "Hand tools information", description: "Illustrative demo catalog entry.", category: "Tools", price: null, currency: "INR", url: "https://icar.gov.in/", is_demo: true },
  { id: "demo-irrigation", name: "Drip irrigation guidance", description: "Illustrative demo catalog entry.", category: "Irrigation", price: null, currency: "INR", url: "https://pmksy.gov.in/", is_demo: true },
];

export const DEMO_LABOUR = [
  { id: "demo-labour-1", display_name: "Ananya (sample)", village: "Mandya region", district: "Mandya", skills: ["sugarcane", "harvesting"], wage: "Illustrative ₹650/day", contact_method: "Demo request only", is_demo: true },
  { id: "demo-labour-2", display_name: "Ravi (sample)", village: "Hassan region", district: "Hassan", skills: ["weeding", "irrigation"], wage: "Illustrative ₹550/day", contact_method: "Demo request only", is_demo: true },
];

export const DEMO_EQUIPMENT = [
  { id: "demo-equipment-1", name: "Sample mini tractor", category: "Tractor", description: "Illustrative demo equipment listing.", rate: "Illustrative ₹900/day", location: "Mandya region", availability: "By request", is_demo: true },
  { id: "demo-equipment-2", name: "Sample drip irrigation kit", category: "Irrigation", description: "Illustrative demo equipment listing.", rate: "Illustrative ₹350/day", location: "Mysuru region", availability: "Weekdays", is_demo: true },
];

export const DEMO_RECORDS = {
  jobs: [{ id: "demo-job-1", task: "Harvesting support", status: "Demo request", location: "Mandya region" }],
  listings: DEMO_EQUIPMENT,
  bookings: [{ id: "demo-booking-1", name: "Sample mini tractor", status: "Demo booking", booking_date: "Next available day" }],
};

export const DEMO_MANDI_RECORDS = [
  { state: "Karnataka", commodity: "Tomato", market: "Sample Mandya Market", modal_price: 1850, arrival_date: "2026-10-24", is_demo: true },
  { state: "Karnataka", commodity: "Maize", market: "Sample Mysuru Market", modal_price: 2250, arrival_date: "2026-10-24", is_demo: true },
  { state: "Karnataka", commodity: "Onion", market: "Sample Hassan Market", modal_price: 3100, arrival_date: "2026-10-24", is_demo: true },
];
