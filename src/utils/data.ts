
export interface Machine {
  id: string;
  name: string;
  description: string;
  image: string;
  courseCompleted: boolean;
  quizPassed: boolean;
}

export interface CourseContent {
  id: string;
  machineId: string;
  title: string;
  content: string;
}

export interface Quiz {
  id: string;
  machineId: string;
  questions: QuizQuestion[];
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
}

export interface Booking {
  id: string;
  machineId: string;
  userId: string;
  date: string;
  timeSlot: string;
  status: 'pending' | 'confirmed' | 'cancelled';
}

// Sample data
export const machines: Machine[] = [
  {
    id: '1',
    name: 'Laser Cutter',
    description: 'Professional grade laser cutting machine for precise cuts',
    image: '/placeholder.svg',
    courseCompleted: false,
    quizPassed: false,
  },
  {
    id: '2',
    name: 'Ultimaker',
    description: '3D printer for high-quality prototypes and models',
    image: '/placeholder.svg',
    courseCompleted: false,
    quizPassed: false,
  },
  {
    id: '3',
    name: 'Safety Cabinet',
    description: 'Storage for hazardous materials and equipment',
    image: '/placeholder.svg',
    courseCompleted: false,
    quizPassed: false,
  },
  {
    id: '4',
    name: 'X1 E Carbon 3D Printer',
    description: 'Advanced 3D printer for carbon fiber composites',
    image: '/placeholder.svg',
    courseCompleted: false,
    quizPassed: false,
  },
  {
    id: '5',
    name: 'Bambu Lab X1 E',
    description: 'Next-generation 3D printing technology',
    image: '/placeholder.svg',
    courseCompleted: false,
    quizPassed: false,
  },
];

export const courses: Record<string, CourseContent> = {
  '1': {
    id: '1',
    machineId: '1',
    title: 'Laser Cutter Safety & Operation',
    content: `
      <h2>Introduction to Laser Cutting</h2>
      <p>The laser cutter is a powerful tool that uses a focused beam of light to cut and engrave materials with high precision. This course will teach you how to safely operate our laser cutter and understand its capabilities and limitations.</p>
      
      <h2>Safety Precautions</h2>
      <p>Always follow these critical safety guidelines:</p>
      <ul>
        <li>Never leave the laser cutter unattended while it's operating</li>
        <li>Always use the ventilation system to remove fumes</li>
        <li>Never attempt to cut materials not approved for laser cutting (PVC, vinyl, etc.)</li>
        <li>Keep the work area clean and free of flammable materials</li>
        <li>Know the location of the fire extinguisher and emergency stop button</li>
        <li>Never look directly at the laser beam, even with protective eyewear</li>
      </ul>
      
      <h2>Approved Materials</h2>
      <p>The following materials are safe to use in our laser cutter:</p>
      <ul>
        <li>Wood (natural, plywood, MDF)</li>
        <li>Paper, cardboard, and cardstock</li>
        <li>Acrylic (cast only, not extruded)</li>
        <li>Leather (vegetable tanned, not chrome tanned)</li>
        <li>Fabric (natural fibers)</li>
        <li>Glass (for engraving only)</li>
      </ul>
      
      <h2>Prohibited Materials</h2>
      <p>The following materials must NEVER be used in the laser cutter:</p>
      <ul>
        <li>PVC, vinyl, or anything containing chlorine</li>
        <li>ABS plastic</li>
        <li>Polycarbonate</li>
        <li>Fiberglass</li>
        <li>Coated carbon fiber</li>
        <li>Materials containing halogens, epoxy, or phenolic resins</li>
      </ul>
      
      <h2>Machine Operation Steps</h2>
      <ol>
        <li>Turn on the machine and exhaust system</li>
        <li>Prepare your digital file in the required format</li>
        <li>Position your material on the cutting bed</li>
        <li>Focus the laser to the correct height</li>
        <li>Set the appropriate power and speed settings</li>
        <li>Send your file to the laser cutter</li>
        <li>Monitor the cutting process</li>
        <li>When finished, allow material to cool before handling</li>
        <li>Clean the machine and surrounding area</li>
      </ol>
      
      <h2>Troubleshooting</h2>
      <p>If you encounter any issues with the laser cutter, please contact a staff member immediately. Common issues include:</p>
      <ul>
        <li>Laser not firing</li>
        <li>Inconsistent cutting depth</li>
        <li>Alignment problems</li>
        <li>Software communication errors</li>
      </ul>
      
      <h2>Maintenance</h2>
      <p>Regular maintenance helps keep the laser cutter working properly. Users should:</p>
      <ul>
        <li>Clean the cutting bed after each use</li>
        <li>Check the lens for debris or damage</li>
        <li>Report any unusual sounds, smells, or performance issues</li>
      </ul>
    `,
  },
  '2': {
    id: '2',
    machineId: '2',
    title: 'Ultimaker 3D Printer Training',
    content: `
      <h2>Introduction to 3D Printing with Ultimaker</h2>
      <p>The Ultimaker is a high-quality desktop 3D printer that uses fused filament fabrication (FFF) to create three-dimensional objects. This course will teach you how to safely operate the Ultimaker and create successful prints.</p>
      
      <h2>Safety Guidelines</h2>
      <p>While 3D printers are generally safe, please observe these precautions:</p>
      <ul>
        <li>The nozzle can reach temperatures of 280°C - never touch the nozzle during or immediately after printing</li>
        <li>The build plate can reach 120°C - allow it to cool before handling prints</li>
        <li>Maintain good ventilation, especially when printing with ABS or other materials that emit fumes</li>
        <li>Keep long hair, loose clothing, and jewelry away from moving parts</li>
        <li>Some filaments may cause allergic reactions - wear gloves if necessary</li>
      </ul>
      
      <h2>Supported Materials</h2>
      <p>The Ultimaker can print with a variety of materials, including:</p>
      <ul>
        <li>PLA (easiest to print, biodegradable)</li>
        <li>PETG (strong, flexible, water-resistant)</li>
        <li>ABS (durable, heat-resistant, but requires ventilation)</li>
        <li>TPU (flexible, rubber-like)</li>
        <li>Nylon (strong, durable, but hygroscopic)</li>
        <li>Specialty filaments (wood-filled, metal-filled, carbon fiber-reinforced)</li>
      </ul>
      
      <h2>Printing Process Overview</h2>
      <ol>
        <li>Prepare your 3D model in CAD software</li>
        <li>Export your model as an STL file</li>
        <li>Import the STL into the Ultimaker Cura slicing software</li>
        <li>Configure print settings (layer height, infill, support, etc.)</li>
        <li>Save the gcode file to a USB drive or send directly to the printer</li>
        <li>Load filament into the printer</li>
        <li>Level the build plate if necessary</li>
        <li>Start the print and monitor initial layers</li>
        <li>Allow the print to complete and cool before removal</li>
      </ol>
      
      <h2>Printer Maintenance</h2>
      <p>Regular maintenance ensures reliable printing:</p>
      <ul>
        <li>Clean the build plate before each print using isopropyl alcohol</li>
        <li>Check and clean the nozzle regularly</li>
        <li>Keep filament dry and properly stored</li>
        <li>Lubricate moving parts according to the maintenance schedule</li>
        <li>Check belts for proper tension</li>
      </ul>
      
      <h2>Troubleshooting Common Issues</h2>
      <ul>
        <li>Poor adhesion to build plate: Check leveling, cleanliness, and first layer settings</li>
        <li>Stringing: Adjust retraction settings or lower printing temperature</li>
        <li>Layer shifting: Check belt tension and ensure printer is on a stable surface</li>
        <li>Warping: Use a brim or raft, adjust bed temperature, and consider an enclosure</li>
        <li>Clogged nozzle: Perform a "cold pull" or replace the nozzle if necessary</li>
      </ul>
      
      <h2>Design Considerations for 3D Printing</h2>
      <ul>
        <li>Design for minimal support requirements</li>
        <li>Consider orientation for optimal strength and surface finish</li>
        <li>Account for printer tolerances and shrinkage</li>
        <li>Use appropriate wall thicknesses and infill percentages</li>
        <li>Break large models into smaller parts if necessary</li>
      </ul>
    `,
  },
  '3': {
    id: '3',
    machineId: '3',
    title: 'Safety Cabinet Protocols',
    content: `
      <h2>Introduction to Safety Cabinets</h2>
      <p>Safety cabinets are essential for the proper storage of hazardous materials and equipment. This course will teach you how to safely use our safety cabinets and follow proper protocols for handling dangerous substances.</p>
      
      <h2>Types of Safety Cabinets</h2>
      <p>Our facility has several types of safety cabinets:</p>
      <ul>
        <li>Flammable storage cabinets (yellow)</li>
        <li>Corrosive storage cabinets (blue/white)</li>
        <li>Toxic substance cabinets (green)</li>
        <li>Oxidizer cabinets (red)</li>
        <li>Compressed gas cylinder cabinets</li>
      </ul>
      
      <h2>General Safety Guidelines</h2>
      <ul>
        <li>Always keep cabinets closed and locked when not in use</li>
        <li>Store chemicals according to compatibility, not alphabetically</li>
        <li>Never store food or drink in or near safety cabinets</li>
        <li>Maintain clear access to cabinets at all times</li>
        <li>Report any spills, damage, or concerns immediately</li>
        <li>Check cabinet ventilation systems regularly</li>
        <li>Never disable safety features or self-closing mechanisms</li>
      </ul>
      
      <h2>Chemical Storage Rules</h2>
      <p>Follow these guidelines when storing chemicals:</p>
      <ul>
        <li>Keep all containers properly labeled</li>
        <li>Store chemicals in their original containers whenever possible</li>
        <li>Do not overload shelves</li>
        <li>Place larger containers on lower shelves</li>
        <li>Use secondary containment for liquids when appropriate</li>
        <li>Separate incompatible materials</li>
        <li>Check expiration dates regularly and dispose of expired chemicals properly</li>
      </ul>
      
      <h2>Accessing Stored Materials</h2>
      <ol>
        <li>Sign out materials in the logbook</li>
        <li>Use appropriate personal protective equipment (PPE)</li>
        <li>Open cabinet doors slowly</li>
        <li>Remove only what you need</li>
        <li>Secure the cabinet before moving away</li>
        <li>Return materials promptly after use</li>
        <li>Sign materials back in after returning them</li>
      </ol>
      
      <h2>Emergency Procedures</h2>
      <p>In case of spills or emergencies:</p>
      <ul>
        <li>Know the location of safety showers, eyewash stations, and spill kits</li>
        <li>For small spills, use appropriate spill control materials</li>
        <li>For large spills, evacuate the area and call for assistance</li>
        <li>Report all incidents, even if minor</li>
        <li>Be familiar with the emergency evacuation route</li>
      </ul>
      
      <h2>Inspection and Maintenance</h2>
      <p>Safety cabinets require regular inspection:</p>
      <ul>
        <li>Check door closure and sealing</li>
        <li>Inspect shelving for stability and damage</li>
        <li>Ensure ventilation systems are functioning</li>
        <li>Verify that warning labels are intact and legible</li>
        <li>Test locks and security mechanisms</li>
      </ul>
      
      <h2>Inventory Management</h2>
      <p>Proper inventory management ensures safety and efficiency:</p>
      <ul>
        <li>Maintain an up-to-date inventory list</li>
        <li>Perform regular inventory checks</li>
        <li>Follow first-in, first-out (FIFO) principles</li>
        <li>Report low stock levels of essential materials</li>
        <li>Properly dispose of unused or expired materials</li>
      </ul>
    `,
  },
  '4': {
    id: '4',
    machineId: '4',
    title: 'X1 E Carbon 3D Printer Advanced Training',
    content: `
      <h2>Introduction to Carbon Fiber 3D Printing</h2>
      <p>The X1 E Carbon 3D Printer is an advanced system designed specifically for printing with carbon fiber composite materials. This course will teach you how to properly operate this specialized equipment and understand its unique capabilities.</p>
      
      <h2>Safety Considerations</h2>
      <p>When working with carbon fiber materials and the X1 E printer:</p>
      <ul>
        <li>Always wear nitrile gloves when handling carbon fiber filaments</li>
        <li>Use a NIOSH-approved respirator if ventilation is inadequate</li>
        <li>Wear safety glasses to protect from filament particles</li>
        <li>Be aware that carbon fiber particles can be electrically conductive - keep electronics protected</li>
        <li>The hardened nozzles reach extremely high temperatures - never touch during operation</li>
        <li>Ensure the build chamber is fully closed during printing</li>
      </ul>
      
      <h2>Supported Materials</h2>
      <p>The X1 E Carbon printer can work with:</p>
      <ul>
        <li>Carbon fiber reinforced nylon (PA-CF)</li>
        <li>Carbon fiber reinforced PEEK (PEEK-CF)</li>
        <li>Carbon fiber reinforced PEI/ULTEM</li>
        <li>Glass fiber reinforced nylons</li>
        <li>Metal-filled composites</li>
        <li>High-temperature technical polymers</li>
      </ul>
      
      <h2>Machine Components</h2>
      <p>Familiarize yourself with these key components:</p>
      <ul>
        <li>Hardened steel nozzle system</li>
        <li>High-temperature heated build chamber</li>
        <li>Advanced cooling system</li>
        <li>Filament dry storage compartment</li>
        <li>Hardened drive gears</li>
        <li>HEPA filtration system</li>
        <li>High-temperature build plate</li>
      </ul>
      
      <h2>Printing Process</h2>
      <ol>
        <li>Ensure filament is properly dried (using the integrated drying system)</li>
        <li>Prepare your 3D model in CAD software</li>
        <li>Use the specialized X1 slicing software with appropriate composite settings</li>
        <li>Apply proper build plate preparation (specific adhesives may be required)</li>
        <li>Preheat the chamber to the required temperature</li>
        <li>Load filament according to the guided procedure</li>
        <li>Start the print and monitor initial layers</li>
        <li>Allow the chamber to cool completely before removing the print</li>
        <li>Use proper tools for part removal to avoid damage to the build plate</li>
      </ol>
      
      <h2>Post-Processing</h2>
      <p>Carbon fiber prints often require post-processing:</p>
      <ul>
        <li>Support removal using specialized cutting tools</li>
        <li>Surface finishing (sanding, polishing)</li>
        <li>Heat treatment for optimal mechanical properties</li>
        <li>Proper disposal of carbon fiber dust and waste</li>
        <li>Application of sealants or coatings if needed</li>
      </ul>
      
      <h2>Maintenance Requirements</h2>
      <p>The X1 E requires specific maintenance procedures:</p>
      <ul>
        <li>Regular nozzle inspection and replacement (abrasive materials cause wear)</li>
        <li>Cleaning of the build chamber and HEPA filters</li>
        <li>Lubrication of motion systems</li>
        <li>Calibration of the build plate and motion system</li>
        <li>Inspection of filament drive system for wear</li>
      </ul>
      
      <h2>Troubleshooting</h2>
      <p>Common issues and solutions:</p>
      <ul>
        <li>Nozzle clogging: Use the provided cleaning filament and nozzle cleaning tools</li>
        <li>Layer delamination: Increase chamber temperature and check for draft exposure</li>
        <li>Warping: Ensure proper chamber temperature and build plate adhesion</li>
        <li>Filament breaks: Check for proper drying and filament path obstructions</li>
        <li>Print failure: Check nozzle condition and filament quality</li>
      </ul>
    `,
  },
  '5': {
    id: '5',
    machineId: '5',
    title: 'Bambu Lab X1 E Operation Training',
    content: `
      <h2>Introduction to the Bambu Lab X1 E</h2>
      <p>The Bambu Lab X1 E is a cutting-edge 3D printer featuring a core XY motion system, high-speed printing capabilities, and multi-material support. This course will teach you how to operate this advanced printer and take advantage of its unique features.</p>
      
      <h2>Safety Guidelines</h2>
      <ul>
        <li>The hotend can reach temperatures up to 300°C - never touch during operation</li>
        <li>The heated bed can reach 110°C - allow to cool before handling prints</li>
        <li>Keep the enclosure closed during printing for temperature stability and safety</li>
        <li>Ensure proper ventilation, especially when printing with ABS or other materials that emit fumes</li>
        <li>Disconnect power before performing maintenance</li>
        <li>Keep fingers away from moving parts (especially the high-speed toolhead)</li>
      </ul>
      
      <h2>Key Features</h2>
      <p>The Bambu Lab X1 E offers several advanced features:</p>
      <ul>
        <li>High-speed Core XY motion system</li>
        <li>Auto bed leveling with strain gauge system</li>
        <li>Built-in camera for remote monitoring</li>
        <li>AI print failure detection</li>
        <li>Multi-material capability (with AMS system)</li>
        <li>WiFi and ethernet connectivity</li>
        <li>7-inch touchscreen interface</li>
        <li>Lidar-based first layer inspection</li>
      </ul>
      
      <h2>Supported Materials</h2>
      <p>The X1 E can print with a wide range of materials:</p>
      <ul>
        <li>PLA, PLA+</li>
        <li>PETG, PET, PETG+</li>
        <li>ABS, ABS+</li>
        <li>TPU (95A and above)</li>
        <li>PA (Nylon)</li>
        <li>PC (Polycarbonate)</li>
        <li>ASA</li>
        <li>PVA (support material)</li>
        <li>Various specialty and composite filaments</li>
      </ul>
      
      <h2>Printer Setup and Operation</h2>
      <ol>
        <li>Power on the printer and wait for initialization</li>
        <li>Load filament following the on-screen instructions</li>
        <li>Prepare your 3D model in Bambu Studio slicing software</li>
        <li>Transfer the file via WiFi, USB, or directly from the cloud</li>
        <li>Confirm print settings on the touchscreen</li>
        <li>The printer will automatically handle bed leveling and first layer calibration</li>
        <li>Monitor the print progress on the touchscreen or remotely via the Bambu app</li>
        <li>Wait for the bed to cool before removing your print</li>
      </ol>
      
      <h2>Using the AMS (Automatic Material System)</h2>
      <p>If your project requires multiple materials:</p>
      <ul>
        <li>Load up to four different filaments in the AMS system</li>
        <li>Assign materials to different parts in Bambu Studio</li>
        <li>The printer will automatically switch materials during printing</li>
        <li>Monitor filament usage through the transparent AMS cover</li>
        <li>The built-in filament runout sensor will pause the print if needed</li>
      </ul>
      
      <h2>Maintenance Tasks</h2>
      <p>Regular maintenance will ensure optimal performance:</p>
      <ul>
        <li>Clean the build plate with isopropyl alcohol before each print</li>
        <li>Check and clean the nozzle regularly using the nozzle cleaning function</li>
        <li>Inspect and clean the filament path and extruder gears</li>
        <li>Update firmware when prompted</li>
        <li>Clean the HEPA filter monthly</li>
        <li>Lubricate linear rails according to the maintenance schedule</li>
      </ul>
      
      <h2>Troubleshooting</h2>
      <p>Common issues and solutions:</p>
      <ul>
        <li>First layer issues: Use the first layer calibration tool in the printer menu</li>
        <li>Filament jams: Follow the on-screen guidance for clearing jams</li>
        <li>Print not sticking: Clean the plate and adjust first layer settings</li>
        <li>AMS filament switching problems: Check filament path for obstructions</li>
        <li>Network connectivity issues: Reset network settings in the device menu</li>
      </ul>
      
      <h2>Advanced Features</h2>
      <p>Once comfortable with basic operation, explore these advanced capabilities:</p>
      <ul>
        <li>Custom print profiles for specific applications</li>
        <li>Remote monitoring and control via mobile app</li>
        <li>Using the timelapse feature for creating print videos</li>
        <li>Multi-color and multi-material printing techniques</li>
        <li>Integration with Bambu Cloud for print management</li>
      </ul>
    `,
  },
};

export const quizzes: Record<string, Quiz> = {
  '1': {
    id: '1',
    machineId: '1',
    questions: [
      {
        id: '1-1',
        question: 'What safety equipment must be worn when operating the laser cutter?',
        options: [
          'Safety glasses',
          'Regular glasses',
          'No protection needed',
          'Sunglasses',
        ],
        correctAnswer: 0,
      },
      {
        id: '1-2',
        question: 'Which material should NEVER be cut with the laser cutter?',
        options: [
          'Cardboard',
          'Acrylic',
          'PVC/Vinyl',
          'Wood',
        ],
        correctAnswer: 2,
      },
      {
        id: '1-3',
        question: 'What should you do before starting a laser cutting job?',
        options: [
          'Disable the ventilation system',
          'Leave the room',
          'Ensure proper material placement and focus',
          'Increase the power to maximum',
        ],
        correctAnswer: 2,
      },
      {
        id: '1-4',
        question: 'What should you do if a fire starts in the laser cutter?',
        options: [
          'Open the lid to let the fire out',
          'Hit the emergency stop button and use the fire extinguisher if needed',
          'Spray water on the machine',
          'Continue the job to see if the fire goes out',
        ],
        correctAnswer: 1,
      },
      {
        id: '1-5',
        question: 'Why is the ventilation system important when using the laser cutter?',
        options: [
          'It keeps the machine cool',
          'It removes potentially harmful fumes and particles',
          'It improves cutting quality',
          'It's not important, just optional',
        ],
        correctAnswer: 1,
      },
    ],
  },
  '2': {
    id: '2',
    machineId: '2',
    questions: [
      {
        id: '2-1',
        question: 'What is the maximum temperature the Ultimaker nozzle can reach?',
        options: [
          '180°C',
          '220°C',
          '280°C',
          '350°C',
        ],
        correctAnswer: 2,
      },
      {
        id: '2-2',
        question: 'Which material is considered the easiest to print with on the Ultimaker?',
        options: [
          'ABS',
          'PLA',
          'Nylon',
          'TPU',
        ],
        correctAnswer: 1,
      },
      {
        id: '2-3',
        question: 'What should you do before removing a completed print?',
        options: [
          'Remove it immediately while hot',
          'Cool the bed completely before removal',
          'Pour water on the print to cool it',
          'Hit the print with a hammer',
        ],
        correctAnswer: 1,
      },
      {
        id: '2-4',
        question: 'What is the purpose of "build plate adhesion" settings in slicing software?',
        options: [
          'To make the print permanently stick to the plate',
          'To increase print speed',
          'To help the first layers adhere properly and prevent warping',
          'It has no real purpose',
        ],
        correctAnswer: 2,
      },
      {
        id: '2-5',
        question: 'What regular maintenance should be performed on the Ultimaker?',
        options: [
          'No maintenance is required',
          'Only professional technicians should maintain it',
          'Cleaning the build plate, checking/cleaning the nozzle, and lubricating moving parts',
          'Disassembling the printer completely each month',
        ],
        correctAnswer: 2,
      },
    ],
  },
  '3': {
    id: '3',
    machineId: '3',
    questions: [
      {
        id: '3-1',
        question: 'What color is typically used for flammable storage cabinets?',
        options: [
          'Red',
          'Blue',
          'Yellow',
          'Green',
        ],
        correctAnswer: 2,
      },
      {
        id: '3-2',
        question: 'How should chemicals be organized in safety cabinets?',
        options: [
          'Alphabetically',
          'By container size',
          'By expiration date',
          'According to chemical compatibility',
        ],
        correctAnswer: 3,
      },
      {
        id: '3-3',
        question: 'What should you do when accessing materials from a safety cabinet?',
        options: [
          'Take what you need and leave the cabinet open for convenience',
          'Sign out materials, use appropriate PPE, and secure the cabinet after use',
          'Remove all materials at once to save time',
          'There are no special procedures needed',
        ],
        correctAnswer: 1,
      },
      {
        id: '3-4',
        question: 'What should you do in case of a chemical spill?',
        options: [
          'Clean it up with paper towels and regular trash',
          'Ignore small spills as they will evaporate',
          'Use appropriate spill control materials and report the incident',
          'Pour water on the spill to dilute it',
        ],
        correctAnswer: 2,
      },
      {
        id: '3-5',
        question: 'Why should safety cabinet doors be kept closed when not in use?',
        options: [
          'It's not necessary to keep them closed',
          'To maintain proper temperature for the chemicals',
          'To contain vapors and protect contents in case of fire',
          'Just to keep the room looking tidy',
        ],
        correctAnswer: 2,
      },
    ],
  },
  '4': {
    id: '4',
    machineId: '4',
    questions: [
      {
        id: '4-1',
        question: 'What type of personal protective equipment (PPE) should be worn when handling carbon fiber filaments?',
        options: [
          'No PPE is necessary',
          'Just regular gloves',
          'Nitrile gloves and safety glasses',
          'Full hazmat suit',
        ],
        correctAnswer: 2,
      },
      {
        id: '4-2',
        question: 'Why are hardened steel nozzles used in the X1 E Carbon printer?',
        options: [
          'They look better',
          'They're cheaper than brass nozzles',
          'Carbon fiber materials are abrasive and would quickly wear out standard nozzles',
          'They heat up faster',
        ],
        correctAnswer: 2,
      },
      {
        id: '4-3',
        question: 'What is an important consideration when storing carbon fiber filaments?',
        options: [
          'Keep them wet for flexibility',
          'Keep them properly dried to prevent printing issues',
          'Store them at room temperature with no special considerations',
          'Expose them to UV light regularly',
        ],
        correctAnswer: 1,
      },
      {
        id: '4-4',
        question: 'What is a common issue when printing with carbon fiber materials?',
        options: [
          'Prints come out too soft',
          'Increased nozzle wear and potential clogging',
          'Prints are too lightweight',
          'Materials cost too little',
        ],
        correctAnswer: 1,
      },
      {
        id: '4-5',
        question: 'Why is a high-temperature build chamber important for carbon fiber printing?',
        options: [
          'It's not important, just a luxury feature',
          'To prevent material warping and layer delamination',
          'To make the printing process faster',
          'To save electricity',
        ],
        correctAnswer: 1,
      },
    ],
  },
  '5': {
    id: '5',
    machineId: '5',
    questions: [
      {
        id: '5-1',
        question: 'What type of motion system does the Bambu Lab X1 E use?',
        options: [
          'Cartesian',
          'Delta',
          'SCARA',
          'Core XY',
        ],
        correctAnswer: 3,
      },
      {
        id: '5-2',
        question: 'What technology does the Bambu Lab X1 E use for bed leveling?',
        options: [
          'Manual adjustment screws',
          'Strain gauge system',
          'Optical sensors',
          'It doesn't have bed leveling',
        ],
        correctAnswer: 1,
      },
      {
        id: '5-3',
        question: 'What does the AMS system allow you to do?',
        options: [
          'Print at higher speeds',
          'Print with multiple materials automatically',
          'Connect to WiFi',
          'Increase build volume',
        ],
        correctAnswer: 1,
      },
      {
        id: '5-4',
        question: 'What should you do before starting a print on the Bambu Lab X1 E?',
        options: [
          'Manually level the bed with a piece of paper',
          'Disassemble the nozzle for cleaning',
          'Clean the build plate with isopropyl alcohol',
          'Apply glue stick to the entire build surface',
        ],
        correctAnswer: 2,
      },
      {
        id: '5-5',
        question: 'How can you monitor print progress remotely on the Bambu Lab X1 E?',
        options: [
          'You cannot monitor remotely',
          'Using the built-in camera and Bambu app',
          'By calling customer service',
          'By asking someone else to check it',
        ],
        correctAnswer: 1,
      },
    ],
  },
};
