import { Product } from "./types";

// The standard luxury inventory for Joy Gym Equipments
export const JOY_CATALOG: Product[] = [
  {
    id: "dumbbell-set",
    name: "Chrome Adjustable Dumbbell Set",
    price: 349,
    description: "Laser-engraved solid chrome finish dumbbells built with an innovative quick-twist weight adjust selector. Replaces 10 individual sets of traditional dumbbells.",
    category: "Strength",
    rating: 4.9,
    specifications: [
      "Adjust range: 5 to 50 lbs per handle",
      "Grip: Deep laser diamond textured knurling",
      "Plates: High-end CNC machined premium steel",
      "Dimensions: 14.2in x 7.1in x 7.1in"
    ],
    imageUrl: "/src/assets/images/equipment_dumbbell_1779487291733.png",
    customizationOptions: {
      materials: ["Polished Chrome", "Classic Gold Electroplate", "Satin Black Nickel"],
      colors: ["#CFB53B", "#C0C0C0", "#212121"],
      weightSteps: [5, 10, 15, 20, 25, 30, 35, 40, 45, 50]
    }
  },
  {
    id: "smart-treadmill",
    name: "Joy Smart Interactive Treadmill",
    price: 1499,
    description: "Futuristic gym standard running gear featuring adaptive fluid shocks, high-end visual console, silent brushless motor, and automatic motorized recline control.",
    category: "Cardio",
    rating: 4.8,
    specifications: [
      "Motor: 4.25 HP Continuous Whisper Power",
      "Console: 21.5-inch 120Hz IPS Touch Display",
      "Speed: 0.5 to 14.5 MPH with digital recline link",
      "Capacity: Tested up to 380 lbs body weight"
    ],
    imageUrl: "/src/assets/images/equipment_treadmill_1779487259316.png",
    customizationOptions: {
      materials: ["Sport Carbon Casing", "Polished Aluminum", "Stealth Matte Obsidian"],
      colors: ["#dcfc2d", "#FF0055", "#FFCC00"]
    }
  },
  {
    id: "squat-rack",
    name: "Commercial Squat Rack & Power Cage",
    price: 899,
    description: "Ultra-stable structural commercial power safety system. Built with 11-gauge carbon steel framing on custom matte gold pillars.",
    category: "Strength",
    rating: 5.0,
    specifications: [
      "Steel: 3in x 3in 11-gauge high torque carbon steel",
      "Attachments: Premium multi-weight pull-up bar, J-cups, safeties",
      "Finish: Double electrostatic gold-flecked powder coat",
      "Height: 84.5-inch compact overhead clearance"
    ],
    imageUrl: "/src/assets/images/equipment_rack_1779487273817.png",
    customizationOptions: {
      materials: ["electrostatic gold coat", "matte racing red", "carbon grey"],
      colors: ["#D4AF37", "#E63946", "#4A5568"]
    }
  },
  {
    id: "olympic-barbell",
    name: "Olympic 7ft Barbell with Plates Set",
    price: 590,
    description: "Olympic standard 7-foot training bar accompanied by 255 lbs of vulcanized premium sound-absorbing rubber weight plates.",
    category: "Strength",
    rating: 4.9,
    specifications: [
      "Shaft: 190,000 PSI high-tensile steel core",
      "Sleeves: Precision machine-cut bushings with brass inserts",
      "Inclusions: 2x45lb, 2x35lb, 2x25lb, 2x10lb, 4x5lb, 2x2.5lb plates",
      "Collars: Spring gold collar locks included"
    ],
    imageUrl: "/src/assets/images/equipment_dumbbell_1779487291733.png", // sharing premium preview
    customizationOptions: {
      materials: ["Zinc Plated Shaft", "Polished Chrome Sleeves", "Cerakote Elite Gold"],
      colors: ["#E2E8F0", "#CBD5E1", "#F59E0B"]
    }
  },
  {
    id: "kinetic-bike",
    name: "Joy Kinetic Air Bike",
    price: 699,
    description: "Wind-resistance stationary combat cycle. Leverages dual belt power transmissions and solid steel wind fan configurations.",
    category: "Cardio",
    rating: 4.7,
    specifications: [
      "Fan: 27-inch super alloy steel resistance propeller",
      "Drive: Dual-stage premium belt drive for quiet cadence",
      "Metrics: Dynamic calorie burn, RPM, HIIT workout programs",
      "Ergonomics: Custom high-density density seat adjustments"
    ],
    imageUrl: "/src/assets/images/equipment_treadmill_1779487259316.png", // sharing preview
    customizationOptions: {
      materials: ["Steel Wind Propeller", "Light Brushed Platinum", "Racing Sleek Yellow Highlights"],
      colors: ["#dcfc2d", "#BFDBFE", "#3B82F6"]
    }
  },
  {
    id: "military-bench",
    name: "Heavy-Duty Multi-Angle Flat/Incline Bench",
    price: 249,
    description: "Professional utility bench featuring steel-reinforced multi-angle pin adjustment mechanisms. Upholstered in industrial gym grade carbon fiber wrap.",
    category: "Accessories",
    rating: 4.8,
    specifications: [
      "Positions: 9 spine angle back adjustments, 3 seat angle adjustments",
      "Upholstery: Sweatproof textured tear-resistant leather vinyl",
      "Transit: Smooth rubber wheels for easy relocation on gym floor"
    ],
    imageUrl: "/src/assets/images/equipment_rack_1779487273817.png", // sharing preview
    customizationOptions: {
      materials: ["Carbon Textured Leather", "Vulcanized Alcantara", "Full-grain Classic Black"],
      colors: ["#334155", "#0F172A", "#1E293B"]
    }
  },
  {
    id: "functional-cable-trainer",
    name: "Commercial Functional Cable Crossover Tower",
    price: 3200,
    description: "Multi-pulley industrial crossover tower featuring 180-degree swiveling high-tensile steel pulleys and aviation grade dual weight cables.",
    category: "Strength",
    rating: 4.9,
    specifications: [
      "Plates: Dual 200 lb solid steel weight stack layers",
      "Pulleys: Ultra-glide fiberglass reinforced nylon pulleys",
      "Cables: 2000 lbs military-spec tensile strength wire"
    ],
    imageUrl: "/src/assets/images/equipment_rack_1779487273817.png",
    customizationOptions: {
      materials: ["Deep Stealth Black Nickel", "Polished Stainless Steel", "Classic Gold-Fleck Powder"],
      colors: ["#1e293b", "#cbd5e1", "#eab308"]
    }
  },
  {
    id: "water-rower",
    name: "Prestige Carbon Water Rowing Ergometer",
    price: 1250,
    description: "Interactive hydro-resistance fluid drive rower crafted with real-time paddle dynamics and smooth double-track seat sliders.",
    category: "Cardio",
    rating: 4.7,
    specifications: [
      "Tank: Polycarbonate fluid water resistance tank with active rotor blades",
      "Sled: Micro-friction active carbon ball bearing double track seat",
      "Console: Smart workout telemetry system with bluetooth syncing"
    ],
    imageUrl: "/src/assets/images/equipment_treadmill_1779487259316.png",
    customizationOptions: {
      materials: ["Aircraft Matte Carbon Fiber", "Brushed Silver Shield", "Stealth Onyx Anodized"],
      colors: ["#111827", "#9ca3af", "#030712"]
    }
  },
  {
    id: "leg-press",
    name: "Commercial 45-Degree Rotary Leg Press Machine",
    price: 1850,
    description: "Ultra-heavy leverage plateloaded leg press built with quad safety stop handles and professional oversized metallic slip-proof footboard.",
    category: "Strength",
    rating: 5.0,
    specifications: [
      "Angle: Perfect 45-degree biomechanical path with linear bearings",
      "Board: 24in x 18in texturized non-slip angled steel deck",
      "Plates: 4 heavy weight plate pins with safety spring guards"
    ],
    imageUrl: "/src/assets/images/equipment_rack_1779487273817.png",
    customizationOptions: {
      materials: ["Heavy Steel Oxide Frame", "Bright Electrostatic Gold", "Polished Aluminum Sleek"],
      colors: ["#374151", "#fbbf24", "#e5e7eb"]
    }
  }
];
