
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

// Function to seed courses for machines 5 and 6
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
