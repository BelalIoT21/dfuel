
export const machines = [
  {
    id: "1",
    name: "Laser Cutter",
    description: "A machine that uses a laser to cut materials such as wood, plastic, and metal.",
    image: "https://images.unsplash.com/photo-1525598912003-663126343e1f",
    status: "available",
    maintenanceDate: "2023-10-15",
    type: "Laser Cutter",
    specs: {
      power: "80W",
      workArea: "600mm x 400mm",
      materials: ["Wood", "Acrylic", "Leather", "Paper"]
    }
  },
  {
    id: "2",
    name: "Ultimaker",
    description: "A 3D printer that creates objects by adding material layer by layer.",
    image: "https://images.unsplash.com/photo-1631545308595-62c8e71be777",
    status: "available",
    maintenanceDate: "2023-09-20",
    type: "3D Printer",
    specs: {
      buildVolume: "220 x 220 x 250 mm",
      resolution: "20-200 microns",
      filamentTypes: ["PLA", "ABS", "PETG", "TPU"]
    }
  },
  {
    id: "3",
    name: "Safety Cabinet",
    description: "Contains essential safety equipment including first aid kits, fire extinguishers, and personal protective equipment.",
    image: "https://images.unsplash.com/photo-1621575431245-53543907e096",
    status: "available",
    maintenanceDate: "2023-10-01",
    type: "Safety Cabinet",
    specs: {
      equipment: ["First Aid Kit", "Fire Extinguisher", "Protective Gear"],
      location: "Main Lab Area",
      accessLevel: "All Members"
    }
  },
  {
    id: "4",
    name: "Bambu Lab X1 E",
    description: "A high-speed 3D printer with multi-material capability for creating complex models.",
    image: "https://images.unsplash.com/photo-1576045057995-568f588b6733",
    status: "available",
    maintenanceDate: "2023-09-15",
    type: "3D Printer",
    specs: {
      buildVolume: "256 x 256 x 256 mm",
      resolution: "10-200 microns",
      filamentTypes: ["PLA", "ABS", "PETG", "TPU", "PC", "PA"]
    }
  },
  {
    id: "5",
    name: "Bambu Lab X1 E",
    description: "A high-speed 3D printer with multi-material capability for creating complex models.",
    image: "https://images.unsplash.com/photo-1576045057995-568f588b6733",
    status: "maintenance",
    maintenanceDate: "2023-10-05",
    type: "3D Printer",
    specs: {
      buildVolume: "256 x 256 x 256 mm",
      resolution: "10-200 microns",
      filamentTypes: ["PLA", "ABS", "PETG", "TPU", "PC", "PA"]
    }
  },
  {
    id: "6",
    name: "Machine Safety Course",
    description: "Comprehensive safety training for all makerspace equipment and protocols.",
    image: "https://images.unsplash.com/photo-1580894908361-967195033215",
    status: "available",
    maintenanceDate: "2023-08-30",
    type: "Safety Course",
    specs: {
      duration: "2 hours",
      requirements: "None",
      certification: "Required for all machine use"
    }
  },
  {
    id: "7",
    name: "X1 E Carbon 3D Printer",
    description: "A high-performance 3D printer designed for carbon fiber and composite materials.",
    image: "https://images.unsplash.com/photo-1633118210816-6fca275e2af6",
    status: "available",
    maintenanceDate: "2023-10-12",
    type: "3D Printer",
    specs: {
      buildVolume: "300 x 300 x 300 mm",
      resolution: "10-100 microns",
      filamentTypes: ["PLA", "Carbon Fiber", "Nylon", "PETG", "ABS"]
    }
  }
];

export const courses = {
  "1": {
    id: "1",
    title: "Laser Cutter Safety Course",
    modules: [
      { title: "Introduction to Laser Cutting", duration: "15 min" },
      { title: "Safety Procedures", duration: "25 min" },
      { title: "Machine Operation", duration: "30 min" },
      { title: "Maintenance and Troubleshooting", duration: "20 min" }
    ],
    requirements: "None"
  },
  "2": {
    id: "2",
    title: "3D Printing Fundamentals",
    modules: [
      { title: "3D Printing Technologies", duration: "20 min" },
      { title: "Filament Types and Usage", duration: "20 min" },
      { title: "Operating the Ultimaker", duration: "30 min" },
      { title: "Post-Processing Techniques", duration: "20 min" }
    ],
    requirements: "Machine Safety Certification"
  },
  "3": {
    id: "3",
    title: "Safety Equipment Training",
    modules: [
      { title: "Emergency Procedures", duration: "20 min" },
      { title: "First Aid Basics", duration: "30 min" },
      { title: "Fire Safety", duration: "15 min" },
      { title: "Personal Protective Equipment", duration: "15 min" }
    ],
    requirements: "None"
  },
  "4": {
    id: "4",
    title: "Bambu Lab X1 E Training",
    modules: [
      { title: "Introduction to Bambu Lab Printers", duration: "15 min" },
      { title: "AMS and Multi-Material Printing", duration: "25 min" },
      { title: "Troubleshooting Common Issues", duration: "20 min" },
      { title: "Advanced Printing Techniques", duration: "30 min" }
    ],
    requirements: "Machine Safety Certification"
  },
  "5": {
    id: "5",
    title: "Bambu Lab X1 E Advanced Features",
    modules: [
      { title: "Multi-Color Printing", duration: "25 min" },
      { title: "Calibration and Maintenance", duration: "20 min" },
      { title: "Custom Profiles", duration: "20 min" },
      { title: "Remote Printing and Monitoring", duration: "15 min" }
    ],
    requirements: "Machine Safety Certification"
  },
  "6": {
    id: "6",
    title: "General Machine Safety Course",
    modules: [
      { title: "Makerspace Safety Principles", duration: "25 min" },
      { title: "Personal Safety and Protective Equipment", duration: "20 min" },
      { title: "Emergency Procedures", duration: "15 min" },
      { title: "Responsible Equipment Use", duration: "20 min" }
    ],
    requirements: "None"
  },
  "7": {
    id: "7",
    title: "X1 E Carbon 3D Printer Training",
    modules: [
      { title: "Carbon Fiber Printing Basics", duration: "25 min" },
      { title: "Material Properties and Selection", duration: "20 min" },
      { title: "Advanced Settings and Optimization", duration: "25 min" },
      { title: "Post-Processing Carbon Fiber Prints", duration: "20 min" }
    ],
    requirements: "Machine Safety Certification"
  }
};

export const quizzes = {
  "1": {
    id: "1",
    title: "Laser Cutter Certification Quiz",
    questions: [
      {
        question: "What material should never be cut with a laser cutter?",
        options: ["Wood", "Acrylic", "PVC", "Paper"],
        correctAnswer: "PVC",
        explanation: "PVC releases toxic chlorine gas when cut with a laser."
      },
      {
        question: "What should you do before starting a cut?",
        options: [
          "Check if the correct lens is installed",
          "Ensure the ventilation is working",
          "Make sure the material is properly secured",
          "All of the above"
        ],
        correctAnswer: "All of the above",
        explanation: "All of these steps are critical safety checks."
      }
    ]
  },
  "2": {
    id: "2",
    title: "3D Printing Certification Quiz",
    questions: [
      {
        question: "What is the recommended first layer height?",
        options: ["0.1mm", "0.2mm", "0.3mm", "0.4mm"],
        correctAnswer: "0.3mm",
        explanation: "A slightly thicker first layer helps with bed adhesion."
      },
      {
        question: "Which material typically requires a heated bed?",
        options: ["PLA", "ABS", "Both A and B", "Neither A nor B"],
        correctAnswer: "ABS",
        explanation: "ABS requires a heated bed to prevent warping."
      }
    ]
  },
  "3": {
    id: "3",
    title: "Safety Cabinet Certification Quiz",
    questions: [
      {
        question: "Where should the first aid kit be stored?",
        options: [
          "In a locked cabinet",
          "In a clearly marked and accessible location",
          "With the lab supervisor",
          "Near flammable materials"
        ],
        correctAnswer: "In a clearly marked and accessible location",
        explanation: "First aid kits must be easily accessible in emergencies."
      },
      {
        question: "How often should fire extinguishers be inspected?",
        options: ["Monthly", "Quarterly", "Yearly", "Every two years"],
        correctAnswer: "Monthly",
        explanation: "Monthly visual inspections ensure they are charged and ready for use."
      }
    ]
  },
  "4": {
    id: "4",
    title: "Bambu Lab X1 E Certification Quiz",
    questions: [
      {
        question: "What unique feature does the Bambu Lab X1 E have?",
        options: [
          "Auto bed leveling",
          "Multi-material printing capability",
          "Voice control",
          "Laser engraving"
        ],
        correctAnswer: "Multi-material printing capability",
        explanation: "The AMS system enables multi-material printing with up to four filaments."
      },
      {
        question: "What should you do if filament stops extruding mid-print?",
        options: [
          "Stop the print immediately",
          "Increase the nozzle temperature",
          "Check for clogs in the filament path",
          "All of the above"
        ],
        correctAnswer: "All of the above",
        explanation: "All these steps are part of troubleshooting filament extrusion issues."
      }
    ]
  },
  "5": {
    id: "5",
    title: "Bambu Lab X1 E Advanced Certification Quiz",
    questions: [
      {
        question: "What is the maximum number of filaments the AMS can handle?",
        options: ["1", "2", "4", "6"],
        correctAnswer: "4",
        explanation: "The standard AMS can handle up to 4 different filaments."
      },
      {
        question: "Which slicer is specifically designed for Bambu Lab printers?",
        options: ["Cura", "PrusaSlicer", "Bambu Studio", "Simplify3D"],
        correctAnswer: "Bambu Studio",
        explanation: "Bambu Studio is optimized for Bambu Lab printers."
      }
    ]
  },
  "6": {
    id: "6",
    title: "Machine Safety Certification Quiz",
    questions: [
      {
        question: "What should you do before operating any equipment in the makerspace?",
        options: [
          "Check your email",
          "Read the equipment manual",
          "Sign the attendance sheet",
          "Turn on all machines"
        ],
        correctAnswer: "Read the equipment manual",
        explanation: "Always read the manual and understand the equipment before operation."
      },
      {
        question: "What is the correct response to an equipment fire?",
        options: [
          "Try to finish your project quickly",
          "Use water to extinguish it",
          "Alert others and use the appropriate fire extinguisher",
          "Leave the building immediately without telling anyone"
        ],
        correctAnswer: "Alert others and use the appropriate fire extinguisher",
        explanation: "Alert others to the danger and use the correct type of extinguisher for the fire."
      }
    ]
  },
  "7": {
    id: "7",
    title: "X1 E Carbon 3D Printer Certification Quiz",
    questions: [
      {
        question: "What is a key benefit of carbon fiber filament?",
        options: [
          "It's cheaper than standard PLA",
          "It provides higher strength-to-weight ratio",
          "It prints faster than other materials",
          "It doesn't require a heated bed"
        ],
        correctAnswer: "It provides higher strength-to-weight ratio",
        explanation: "Carbon fiber reinforced filaments offer superior strength with less weight."
      },
      {
        question: "Which nozzle type is recommended for carbon fiber filaments?",
        options: [
          "Brass nozzle",
          "Hardened steel nozzle",
          "Ruby nozzle",
          "Any nozzle works equally well"
        ],
        correctAnswer: "Hardened steel nozzle",
        explanation: "Carbon fiber is abrasive and requires a hardened nozzle to prevent wear."
      }
    ]
  }
};
