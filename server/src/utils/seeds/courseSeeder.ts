import { Course } from '../../models/Course';
import mongoose from 'mongoose';

// Define the safety cabinet course content
const safetyCabinetCourseContent = `
# Safety Cabinet Usage Course

## Introduction
This course will teach you how to properly use the safety cabinet for storing hazardous materials.

## Important Safety Rules
1. Always wear appropriate PPE when handling chemicals
2. Store flammable materials in designated cabinets only
3. Keep cabinets closed and locked when not in use
4. Never mix incompatible chemicals
5. Report any spills or damage immediately

## Proper Storage Procedures
- Label all containers clearly with contents and date
- Store heavier items on lower shelves
- Ensure all containers are sealed properly
- Organize chemicals by compatibility groups
- Maintain an inventory of stored materials

## Emergency Procedures
If you encounter a spill or accident:
1. Alert others in the area
2. Contact the lab supervisor immediately
3. Use appropriate spill kits if trained to do so
4. Evacuate if necessary
`;

// Define the machine safety course content
const machineSafetyCourseContent = `
# Machine Safety Course

## Introduction
This course covers the essential safety protocols for all machines in the makerspace.

## General Safety Rules
1. Never operate machinery without proper training
2. Always wear appropriate PPE (eye protection, closed-toe shoes, etc.)
3. Remove jewelry, tie back long hair, and secure loose clothing
4. No food or drinks in the machine area
5. Never leave running machines unattended

## Emergency Procedures
1. Know the location of emergency stops for all equipment
2. Know the location of first aid kits and fire extinguishers
3. Report all accidents and near-misses to staff
4. In case of injury, seek help immediately

## Before Using Any Machine
1. Inspect the machine for damage or wear
2. Ensure all guards are in place
3. Check that your work area is clear
4. Have your materials and tools organized
5. Understand the machine's capabilities and limitations

## After Using a Machine
1. Turn off all power and wait for moving parts to stop
2. Clean the machine and work area
3. Return tools to their proper locations
4. Report any issues to staff
`;

// Define content for courses 1-4
const laserCutterCourseContent = `
# Laser Cutter Course

## Introduction
This course will teach you how to safely and effectively use the laser cutter.

## Safety Precautions
1. Never leave the laser cutter unattended while in operation
2. Always use the ventilation system
3. Never cut materials that produce toxic fumes (PVC, vinyl, etc.)
4. Keep the area around the laser cutter clean and free of flammable materials
5. Know the location of the fire extinguisher and how to use it

## Operating Procedures
1. Prepare your design in appropriate software
2. Set up the material on the cutting bed
3. Focus the laser
4. Set appropriate power and speed settings
5. Start the job and monitor progress

## Maintenance
1. Clean the cutting bed after each use
2. Check and clean the lens regularly
3. Empty the debris tray when full
4. Report any issues to staff immediately
`;

const ultimakerCourseContent = `
# Ultimaker 3D Printer Course

## Introduction
This course teaches you how to use the Ultimaker 3D printer effectively.

## Printer Components
1. Build plate
2. Extruder
3. Filament feeder
4. Control panel
5. Filament spool holder

## Printing Process
1. Prepare your 3D model in slicing software
2. Select appropriate material and settings
3. Load filament
4. Start your print
5. Remove and post-process your print

## Troubleshooting
1. Adhesion problems
2. Stringing
3. Layer shifting
4. Clogged nozzle
5. Print not sticking to the build plate
`;

const cncRouterCourseContent = `
# CNC Router Course

## Introduction
This course covers the safe and effective use of the CNC router.

## Safety First
1. Always wear proper PPE (eye protection, hearing protection, dust mask)
2. Never wear loose clothing, jewelry, or gloves around the machine
3. Keep hands away from the cutting area
4. Ensure material is properly secured
5. Know the location of emergency stops

## Machine Setup
1. Mounting your material
2. Tool selection and installation
3. Setting work coordinates
4. Setting up your CAM program
5. Verifying your tool paths

## Operation
1. Starting the machine
2. Monitoring the cut
3. Emergency procedures
4. Completing the job
5. Machine shutdown
`;

const x1CarbonCourseContent = `
# X1 E Carbon 3D Printer Course

## Introduction
This course covers the operation of the X1 E Carbon 3D printer for advanced composite printing.

## Material Handling
1. Carbon fiber reinforced materials
2. Proper storage of materials
3. Loading and unloading fiber rolls
4. Safety considerations for carbon fiber

## Print Preparation
1. Designing for fiber reinforcement
2. Setting up fiber paths
3. Optimizing part strength
4. Build plate preparation
5. Printer calibration

## Post-Processing
1. Safe part removal
2. Support structure removal
3. Part finishing techniques
4. Strength testing considerations
5. Disposal of waste materials
`;

// Function to seed all courses
export async function seedAllCourses() {
  try {
    // Check if courses already exist
    const courses = [
      {
        _id: '1',
        title: 'Laser Cutter Training',
        description: 'Learn how to safely operate the lab\'s laser cutter',
        category: 'Equipment',
        content: laserCutterCourseContent,
        imageUrl: 'http://localhost:4000/utils/images/IMG_7814.jpg',
        relatedMachineIds: ['1'],
        quizId: '1',
        difficulty: 'Intermediate'
      },
      {
        _id: '2',
        title: 'Ultimaker 3D Printer Training',
        description: 'Learn how to use the Ultimaker 3D printer effectively',
        category: 'Equipment',
        content: ultimakerCourseContent,
        imageUrl: 'http://localhost:4000/utils/images/IMG_7815.jpg',
        relatedMachineIds: ['2'],
        quizId: '2',
        difficulty: 'Basic'
      },
      {
        _id: '3',
        title: 'CNC Router Basics',
        description: 'Learn the fundamentals of CNC routing for precision cutting',
        category: 'Equipment',
        content: cncRouterCourseContent,
        imageUrl: 'http://localhost:4000/utils/images/IMG_7816.jpg',
        relatedMachineIds: ['3'],
        quizId: '3',
        difficulty: 'Advanced'
      },
      {
        _id: '4',
        title: 'X1 E Carbon 3D Printer',
        description: 'Advanced training for carbon fiber composite printing',
        category: 'Equipment',
        content: x1CarbonCourseContent,
        imageUrl: 'http://localhost:4000/utils/images/IMG_7817.jpg',
        relatedMachineIds: ['4'],
        quizId: '4',
        difficulty: 'Advanced'
      },
      {
        _id: '5',
        title: 'Safety Cabinet Usage',
        description: 'Learn how to properly use and store materials in the safety cabinet',
        category: 'Safety',
        content: safetyCabinetCourseContent,
        imageUrl: 'http://localhost:4000/utils/images/IMG_7818.jpg',
        relatedMachineIds: ['5'],
        quizId: '5',
        difficulty: 'Basic'
      },
      {
        _id: '6',
        title: 'Machine Safety Fundamentals',
        description: 'Essential safety training required for all makerspace users',
        category: 'Safety',
        content: machineSafetyCourseContent,
        imageUrl: 'http://localhost:4000/utils/images/IMG_7821.jpg',
        relatedMachineIds: ['6'],
        quizId: '6',
        difficulty: 'Basic'
      }
    ];

    for (const courseData of courses) {
      const existingCourse = await Course.findById(courseData._id);
      
      if (!existingCourse) {
        const course = new Course(courseData);
        await course.save();
        console.log(`Created course: ${courseData.title} with ID: ${courseData._id}`);
      } else {
        console.log(`Course ${courseData.title} already exists with ID: ${courseData._id}`);
      }
    }
    
    console.log('Courses seeding completed successfully');
    return { success: true };
  } catch (error) {
    console.error('Error seeding courses:', error);
    return { success: false, error };
  }
}

// Keep the original safety courses function for backward compatibility
export async function seedSafetyCourses() {
  try {
    // Check if courses already exist
    const course5 = await Course.findById('5');
    const course6 = await Course.findById('6');
    
    // Create Safety Cabinet course if it doesn't exist
    if (!course5) {
      const safetyCabinetCourse = new Course({
        _id: '5',
        title: 'Safety Cabinet Usage',
        description: 'Learn how to properly use and store materials in the safety cabinet',
        category: 'Safety',
        content: safetyCabinetCourseContent,
        imageUrl: 'http://localhost:4000/utils/images/IMG_7818.jpg',
        relatedMachineIds: ['5'],
        quizId: '5',
        difficulty: 'Basic'
      });
      
      await safetyCabinetCourse.save();
      console.log('Created Safety Cabinet course with ID: 5');
    } else {
      console.log('Safety Cabinet course already exists');
    }
    
    // Create Machine Safety course if it doesn't exist
    if (!course6) {
      const machineSafetyCourse = new Course({
        _id: '6',
        title: 'Machine Safety Fundamentals',
        description: 'Essential safety training required for all makerspace users',
        category: 'Safety',
        content: machineSafetyCourseContent,
        imageUrl: 'http://localhost:4000/utils/images/IMG_7821.jpg',
        relatedMachineIds: ['6'],
        quizId: '6',
        difficulty: 'Basic'
      });
      
      await machineSafetyCourse.save();
      console.log('Created Machine Safety course with ID: 6');
    } else {
      console.log('Machine Safety course already exists');
    }
    
    console.log('Safety courses seeding completed successfully');
    return { success: true };
  } catch (error) {
    console.error('Error seeding safety courses:', error);
    return { success: false, error };
  }
}
