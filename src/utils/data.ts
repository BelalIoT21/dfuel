
export const machines = [
  {
    id: "1",
    name: "Laser Cutter",
    description: "Used for cutting and engraving various materials with precision",
    type: "Laser Cutter",
    difficulty: "Intermediate",
    requiresCertification: true,
    status: "available",
    image: "https://placehold.co/600x400?text=Laser+Cutter"
  },
  {
    id: "2",
    name: "Ultimaker",
    description: "Professional 3D printer for creating detailed models and prototypes",
    type: "3D Printer",
    difficulty: "Beginner",
    requiresCertification: true,
    status: "available",
    image: "https://placehold.co/600x400?text=Ultimaker"
  },
  {
    id: "3",
    name: "Safety Cabinet",
    description: "Storage for personal protective equipment and safety supplies",
    type: "Safety Cabinet",
    difficulty: "Beginner",
    requiresCertification: false,
    status: "available",
    image: "https://placehold.co/600x400?text=Safety+Cabinet"
  },
  {
    id: "4",
    name: "Bambu Lab X1 E",
    description: "High-speed 3D printer with advanced multi-material capabilities",
    type: "3D Printer",
    difficulty: "Intermediate",
    requiresCertification: true,
    status: "available",
    image: "https://placehold.co/600x400?text=Bambu+Lab"
  },
  {
    id: "5",
    name: "Bambu Lab X1 E",
    description: "High-speed 3D printer with advanced multi-material capabilities",
    type: "3D Printer",
    difficulty: "Intermediate",
    requiresCertification: true,
    status: "available",
    image: "https://placehold.co/600x400?text=Bambu+Lab"
  },
  {
    id: "7",
    name: "X1 E Carbon 3D Printer",
    description: "Advanced 3D printer for creating carbon fiber reinforced parts",
    type: "3D Printer",
    difficulty: "Advanced",
    requiresCertification: true,
    status: "available",
    image: "https://placehold.co/600x400?text=X1+E+Carbon"
  }
];

export const users = [
  {
    id: "1",
    name: "Admin User",
    email: "admin@example.com",
    password: "password",
    isAdmin: true,
    certifications: ["1", "2", "3", "7"],
    bookings: [],
    lastLogin: new Date().toISOString()
  },
  {
    id: "2",
    name: "Regular User",
    email: "user@example.com",
    password: "password",
    isAdmin: false,
    certifications: ["2", "4", "5"],
    bookings: [],
    lastLogin: new Date().toISOString()
  }
];

export const bookings = [];

// Add these exports to fix the error in MachineDetail.tsx
export const courses = {
  "1": { title: "Laser Cutter Safety", modules: ["Safety Basics", "Machine Controls", "Material Selection"] },
  "2": { title: "3D Printer Fundamentals", modules: ["Printer Setup", "Filament Selection", "Print Settings"] },
  "3": { title: "Safety Cabinet Usage", modules: ["Equipment Organization", "PPE Usage", "Safety Protocols"] },
  "4": { title: "Bambu Lab X1 E Operation", modules: ["Setup and Calibration", "Print Settings", "Maintenance"] },
  "5": { title: "Bambu Lab X1 E Operation", modules: ["Setup and Calibration", "Print Settings", "Maintenance"] },
  "7": { title: "X1 E Carbon 3D Printing", modules: ["Carbon Fiber Materials", "Advanced Settings", "Post-Processing"] }
};

export const quizzes = {
  "1": { questions: 5, passingScore: 80 },
  "2": { questions: 5, passingScore: 80 },
  "3": { questions: 3, passingScore: 100 },
  "4": { questions: 5, passingScore: 80 },
  "5": { questions: 5, passingScore: 80 },
  "7": { questions: 8, passingScore: 85 }
};
