
export const machines = [
  {
    id: 'laser-cutter',
    name: 'Laser Cutter',
    description: 'High-precision laser cutting and engraving system for various materials.',
    image: '/placeholder.svg',
    status: 'available',
    courseCompleted: false,
    quizPassed: false,
    maintenanceDate: '2023-10-15',
    certificationRequired: true,
    specs: {
      power: '100W',
      workArea: '900 x 600 mm',
      materials: ['Wood', 'Acrylic', 'Paper', 'Leather']
    }
  },
  {
    id: 'ultimaker',
    name: 'Ultimaker 3D Printer',
    description: 'Professional 3D printer for detailed prototypes and functional models.',
    image: '/placeholder.svg',
    status: 'available',
    courseCompleted: false,
    quizPassed: false,
    maintenanceDate: '2023-11-05',
    certificationRequired: true,
    specs: {
      technology: 'FDM',
      buildVolume: '215 x 215 x 200 mm',
      materials: ['PLA', 'ABS', 'PETG', 'TPU']
    }
  },
  {
    id: 'safety-cabinet',
    name: 'Safety Cabinet',
    description: 'Storage cabinet for safely storing hazardous materials and chemicals.',
    image: '/placeholder.svg',
    status: 'maintenance',
    courseCompleted: false,
    quizPassed: false,
    maintenanceDate: '2023-10-20',
    certificationRequired: true,
    specs: {
      capacity: '45 gallons',
      compliance: 'OSHA & NFPA compliant',
      materials: ['Chemicals', 'Flammables', 'Corrosives']
    }
  },
  {
    id: 'carbon-3d',
    name: 'X1 E Carbon 3D Printer',
    description: 'Advanced carbon fiber 3D printing technology for high-strength parts.',
    image: '/placeholder.svg',
    status: 'available',
    courseCompleted: false,
    quizPassed: false,
    maintenanceDate: '2023-12-01',
    certificationRequired: true,
    specs: {
      technology: 'Carbon Fiber FDM',
      buildVolume: '300 x 300 x 350 mm',
      materials: ['Carbon Fiber', 'Nylon', 'PETG', 'PC']
    }
  },
  {
    id: 'bambu-lab',
    name: 'Bambu Lab X1 E',
    description: 'High-speed multi-material 3D printer with advanced automation features.',
    image: '/placeholder.svg',
    status: 'available',
    courseCompleted: false,
    quizPassed: false,
    maintenanceDate: '2023-11-15',
    certificationRequired: true,
    specs: {
      technology: 'FDM',
      buildVolume: '256 x 256 x 256 mm',
      materials: ['PLA', 'PETG', 'TPU', 'ABS', 'PA', 'PC']
    }
  }
];

export const courses = {
  'laser-cutter': {
    title: 'Laser Cutter Safety & Operation Course',
    description: 'Learn to safely operate the laser cutter, understand its capabilities and limitations.',
    duration: '2 hours',
    slides: [
      {
        title: "Introduction to Laser Cutting",
        content: "Laser cutting is a technology that uses a high-powered laser to cut materials with precision. This course will teach you how to safely operate our laser cutter.",
        image: "/placeholder.svg"
      },
      {
        title: "Safety Protocols",
        content: "Always wear safety glasses when operating the laser cutter. Never leave the machine unattended while it's running. Ensure proper ventilation is active during operation.",
        image: "/placeholder.svg"
      },
      {
        title: "Material Guidelines",
        content: "Safe materials: Wood, paper, acrylic, leather. Never cut: PVC, vinyl, or any material containing chlorine as they produce toxic gases when cut.",
        image: "/placeholder.svg"
      },
      {
        title: "Machine Setup",
        content: "1. Turn on the exhaust system. 2. Power on the laser cutter. 3. Check the lens is clean. 4. Position your material securely on the bed.",
        image: "/placeholder.svg"
      },
      {
        title: "Software Operation",
        content: "Learn to use the software to prepare your designs, set cutting parameters, and control the machine. Proper settings vary by material type and thickness.",
        image: "/placeholder.svg"
      }
    ]
  },
  'ultimaker': {
    title: 'Ultimaker 3D Printer Training',
    description: 'Master the Ultimaker 3D printer from basic operation to advanced settings.',
    duration: '1.5 hours',
    slides: [
      {
        title: "Ultimaker Basics",
        content: "The Ultimaker 3D printer uses FDM (Fused Deposition Modeling) technology to create objects by laying down successive layers of material according to a digital design.",
        image: "/placeholder.svg"
      },
      {
        title: "Printer Components",
        content: "Familiarize yourself with key components: print head, build plate, filament feeder, touchscreen interface, and print cores for different materials.",
        image: "/placeholder.svg"
      },
      {
        title: "Material Handling",
        content: "Learn proper loading and unloading of filaments, storage practices to prevent moisture absorption, and how to select the right material for your project.",
        image: "/placeholder.svg"
      },
      {
        title: "Slicing Software",
        content: "Introduction to Ultimaker Cura software for preparing 3D models for printing. Learn key settings that affect print quality, strength, and time.",
        image: "/placeholder.svg"
      },
      {
        title: "Maintenance Procedures",
        content: "Regular maintenance ensures optimal performance. Learn to clean the build plate, check for nozzle clogs, lubricate moving parts, and calibrate the printer.",
        image: "/placeholder.svg"
      }
    ]
  },
  'safety-cabinet': {
    title: 'Hazardous Materials Storage Safety',
    description: 'Essential training for safe handling and storage of hazardous materials.',
    duration: '1 hour',
    slides: [
      {
        title: "Hazardous Materials Overview",
        content: "Understanding the different classes of hazardous materials and their properties. Learn about the risks associated with improper storage and handling.",
        image: "/placeholder.svg"
      },
      {
        title: "Safety Cabinet Features",
        content: "Our safety cabinet is designed with double-wall construction, leak-proof sills, and self-closing doors to contain spills and prevent fire spread.",
        image: "/placeholder.svg"
      },
      {
        title: "Material Compatibility",
        content: "Not all chemicals can be stored together. Learn about compatibility groups and segregation requirements to prevent dangerous reactions.",
        image: "/placeholder.svg"
      },
      {
        title: "Proper Storage Procedures",
        content: "Step-by-step guidelines for correctly storing materials, labeling containers, maintaining inventory, and handling spills.",
        image: "/placeholder.svg"
      },
      {
        title: "Emergency Response",
        content: "What to do in case of spills, leaks, or fire. Know the location of emergency equipment and how to use the spill kit and fire extinguisher.",
        image: "/placeholder.svg"
      }
    ]
  },
  'carbon-3d': {
    title: 'X1 E Carbon 3D Printer Advanced Operation',
    description: 'Specialized training for the X1 E Carbon 3D printer with focus on composite materials.',
    duration: '2.5 hours',
    slides: [
      {
        title: "Carbon Fiber Printing Technology",
        content: "The X1 E printer uses proprietary technology to print with carbon fiber reinforced materials, creating parts with exceptional strength-to-weight ratios.",
        image: "/placeholder.svg"
      },
      {
        title: "Material Properties & Selection",
        content: "Understand the mechanical properties of carbon fiber composites and how to select the right material for structural, heat-resistant, or flexible applications.",
        image: "/placeholder.svg"
      },
      {
        title: "Design Considerations",
        content: "Learn specific design principles for carbon fiber printing, including optimal orientation, support structures, and design features to maximize strength.",
        image: "/placeholder.svg"
      },
      {
        title: "Machine Calibration & Setup",
        content: "Master the precise calibration procedures required for successful carbon fiber printing, including nozzle height, bed leveling, and material loading.",
        image: "/placeholder.svg"
      },
      {
        title: "Post-Processing Techniques",
        content: "Explore methods for finishing carbon fiber parts, including support removal, surface smoothing, and strengthening treatments.",
        image: "/placeholder.svg"
      }
    ]
  },
  'bambu-lab': {
    title: 'Bambu Lab X1 E Multi-Material Printing',
    description: 'Learn to use the advanced features of the Bambu Lab X1 E 3D printer.',
    duration: '2 hours',
    slides: [
      {
        title: "Bambu Lab X1 E Overview",
        content: "The Bambu Lab X1 E is a high-speed, multi-material 3D printer with AI-powered features and a fully enclosed design for printing advanced materials.",
        image: "/placeholder.svg"
      },
      {
        title: "AMS System Operation",
        content: "Learn to use the Automatic Material System for seamless multi-color and multi-material printing, including filament loading and humidity control.",
        image: "/placeholder.svg"
      },
      {
        title: "Lidar Calibration System",
        content: "Understand how the lidar-based calibration system works to ensure first-layer perfection and automatic bed leveling, and how to maintain it.",
        image: "/placeholder.svg"
      },
      {
        title: "Bambu Studio Software",
        content: "Master the Bambu Studio software for print preparation, including multi-material assignment, print profiles, and AI-assisted support generation.",
        image: "/placeholder.svg"
      },
      {
        title: "Advanced Features & Troubleshooting",
        content: "Explore advanced features like the built-in camera for remote monitoring, filament runout detection, and common troubleshooting procedures.",
        image: "/placeholder.svg"
      }
    ]
  }
};

// Create more detailed quizzes for each machine
export const quizzes = {
  'laser-cutter': [
    {
      question: 'What should you always wear when operating the laser cutter?',
      options: [
        'Headphones',
        'Safety glasses',
        'Gloves',
        'All of the above'
      ],
      correctAnswer: 1
    },
    {
      question: 'What materials should NEVER be cut with the laser cutter?',
      options: [
        'Paper',
        'Wood',
        'PVC or vinyl',
        'Acrylic'
      ],
      correctAnswer: 2
    },
    {
      question: 'What should you do before starting a job?',
      options: [
        'Make sure the exhaust is on',
        'Check if the material is properly secured',
        'Ensure the lens is clean',
        'All of the above'
      ],
      correctAnswer: 3
    },
    {
      question: 'What is the maximum thickness of plywood the laser cutter can cut?',
      options: [
        '4mm',
        '6mm',
        '10mm',
        '15mm'
      ],
      correctAnswer: 1
    },
    {
      question: 'What should you do if you notice a fire inside the laser cutter?',
      options: [
        'Open the lid to blow out the flames',
        'Press the emergency stop button and use the fire extinguisher if necessary',
        'Increase laser power to burn through the material faster',
        'Continue the job but watch closely'
      ],
      correctAnswer: 1
    }
  ],
  'ultimaker': [
    {
      question: 'What is the maximum temperature of the print bed?',
      options: [
        '50°C',
        '100°C',
        '120°C',
        '200°C'
      ],
      correctAnswer: 2
    },
    {
      question: 'Which material is commonly used in 3D printing?',
      options: [
        'PLA',
        'Gold',
        'Rubber',
        'Concrete'
      ],
      correctAnswer: 0
    },
    {
      question: 'What should you do after a print is complete?',
      options: [
        'Immediately remove the print while hot',
        'Turn off the printer completely',
        'Wait for the bed to cool down before removing the print',
        'Pour water on the print to cool it faster'
      ],
      correctAnswer: 2
    },
    {
      question: 'What software is used to prepare models for the Ultimaker printer?',
      options: [
        'Microsoft Word',
        'Adobe Photoshop',
        'Ultimaker Cura',
        'AutoCAD'
      ],
      correctAnswer: 2
    },
    {
      question: 'What can cause a nozzle clog in the Ultimaker printer?',
      options: [
        'Printing too cold',
        'Low quality filament with contaminants',
        'Improper filament storage allowing moisture absorption',
        'All of the above'
      ],
      correctAnswer: 3
    }
  ],
  'safety-cabinet': [
    {
      question: 'What materials should be stored in the safety cabinet?',
      options: [
        'Food and beverages',
        'Personal items',
        'Hazardous chemicals and flammable materials',
        'Electronic equipment'
      ],
      correctAnswer: 2
    },
    {
      question: 'How should chemicals be organized in the safety cabinet?',
      options: [
        'Alphabetically by name',
        'By chemical compatibility groups',
        'By container size',
        'By color'
      ],
      correctAnswer: 1
    },
    {
      question: 'What should you do in case of a chemical spill?',
      options: [
        'Clean it up with paper towels and throw them in the regular trash',
        'Leave it for someone else to clean',
        'Use the spill kit and follow the chemical's SDS procedures',
        'Dilute it with water'
      ],
      correctAnswer: 2
    },
    {
      question: 'What feature of the safety cabinet helps prevent fire spread?',
      options: [
        'Double-wall construction',
        'Self-closing doors',
        'Air filtration system',
        'Both A and B'
      ],
      correctAnswer: 3
    },
    {
      question: 'How often should the safety cabinet be inspected?',
      options: [
        'Once a year',
        'Monthly',
        'Never, it doesn't require inspection',
        'Only when there's a problem'
      ],
      correctAnswer: 1
    }
  ],
  'carbon-3d': [
    {
      question: 'What type of material provides the highest strength in the X1 E printer?',
      options: [
        'PLA',
        'Carbon fiber reinforced nylon',
        'PETG',
        'Flexible TPU'
      ],
      correctAnswer: 1
    },
    {
      question: 'What is the recommended bed temperature for carbon fiber materials?',
      options: [
        '30-45°C',
        '60-80°C',
        '100-120°C',
        '150-180°C'
      ],
      correctAnswer: 2
    },
    {
      question: 'Why is part orientation important when printing with carbon fiber?',
      options: [
        'It affects print time only',
        'It affects the strength properties of the final part',
        'It doesn't matter for carbon fiber printing',
        'It only affects surface finish'
      ],
      correctAnswer: 1
    },
    {
      question: 'What personal protective equipment should be worn when handling carbon fiber filament?',
      options: [
        'No PPE is necessary',
        'Gloves only',
        'Gloves and dust mask/respirator',
        'Full hazmat suit'
      ],
      correctAnswer: 2
    },
    {
      question: 'What type of nozzle is required for printing carbon fiber materials?',
      options: [
        'Standard brass nozzle',
        'Hardened steel or ruby-tipped nozzle',
        'Aluminum nozzle',
        'Any nozzle will work'
      ],
      correctAnswer: 1
    }
  ],
  'bambu-lab': [
    {
      question: 'What unique feature allows the Bambu Lab X1 E to print multiple colors?',
      options: [
        'Manual filament changing',
        'Automatic Material System (AMS)',
        'Multiple print heads',
        'Color mixing hotend'
      ],
      correctAnswer: 1
    },
    {
      question: 'What technology does the Bambu Lab X1 E use for automatic bed leveling?',
      options: [
        'Inductive sensor',
        'BLTouch probe',
        'Lidar system',
        'Manual leveling only'
      ],
      correctAnswer: 2
    },
    {
      question: 'What is the maximum print speed capability of the Bambu Lab X1 E?',
      options: [
        'Up to 100 mm/s',
        'Up to 250 mm/s',
        'Up to 500 mm/s',
        'Up to 1000 mm/s'
      ],
      correctAnswer: 2
    },
    {
      question: 'Which software is specifically designed for the Bambu Lab printers?',
      options: [
        'Cura',
        'Bambu Studio',
        'Simplify3D',
        'PrusaSlicer'
      ],
      correctAnswer: 1
    },
    {
      question: 'What feature helps monitor print progress remotely on the Bambu Lab X1 E?',
      options: [
        'Built-in camera',
        'Email notifications',
        'Text messages',
        'None, you must be present'
      ],
      correctAnswer: 0
    }
  ]
};

// Default quiz for any machine not specifically defined
export const defaultQuiz = [
  {
    question: 'What is the first step before operating any machine?',
    options: [
      'Turn it on immediately',
      'Check your surroundings and ensure the workspace is clear',
      'Adjust all settings to maximum',
      'Call another person to watch'
    ],
    correctAnswer: 1
  },
  {
    question: 'When should you wear safety glasses?',
    options: [
      'Only when working with wood',
      'Only when specifically instructed',
      'Whenever operating any machinery',
      'Only if you don\'t have good eyesight'
    ],
    correctAnswer: 2
  },
  {
    question: 'What should you do if the machine makes an unusual noise?',
    options: [
      'Ignore it and continue working',
      'Increase the speed to see if it goes away',
      'Stop the machine immediately and report the issue',
      'Hit the machine to make it stop'
    ],
    correctAnswer: 2
  }
];
