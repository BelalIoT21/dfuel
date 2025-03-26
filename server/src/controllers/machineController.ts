import { Request, Response } from 'express';
import { Machine } from '../models/Machine';
import mongoose from 'mongoose';
import User from '../models/User';

// Default image mappings for standard machines
const DEFAULT_MACHINE_IMAGES = {
  '1': '/lovable-uploads/81c40f5d-e4d4-42ef-8262-0467a8fb48c3.png', // Laser Cutter
  '2': '/lovable-uploads/82f38bc9-30e8-4f58-9ad4-93d158cacf88.png', // Ultimaker
  '3': '/lovable-uploads/381a5202-3287-46e3-9eda-f836609b10ac.png', // X1 E Carbon 3D Printer
  '4': '/machines/bambu-lab.jpg' // Bambu Lab
};

// Get all machines
export const getMachines = async (req: Request, res: Response) => {
  try {
    // Check if we should filter special machines (5 and 6)
    const filterSpecial = req.query.filterSpecial === 'true';
    
    let query = {};
    if (filterSpecial) {
      // Filter out machines 5 and 6 if requested
      query = { _id: { $nin: ['5', '6'] } };
    }
    
    const machines = await Machine.find(query);
    console.log(`Retrieved ${machines.length} machines${filterSpecial ? ' (filtered)' : ''}`);
    
    // Normalize status field for all machines before sending response
    const normalizedMachines = machines.map(machine => {
      // Clone the document to avoid modifying the original
      const machineObj = machine.toObject();
      
      // Create a normalized status field for client-side use only
      // This doesn't modify the database schema field
      const clientStatus = (() => {
        if (machineObj.status === 'In Use') {
          return 'in-use'; // Map "In Use" to "in-use" for frontend compatibility
        } else if (machineObj.status) {
          return machineObj.status.toLowerCase(); // Lowercase other statuses
        }
        return 'available'; // Default status
      })();
      
      // Return a new object with the normalized client status
      return {
        ...machineObj,
        status: clientStatus
      };
    });
    
    res.status(200).json(normalizedMachines);
  } catch (error) {
    console.error('Error in getMachines:', error);
    res.status(500).json({ message: 'Server error', error: error instanceof Error ? error.message : 'Unknown error' });
  }
};

// Get machine by ID
export const getMachineById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Handle string IDs properly
    let machine;
    if (mongoose.Types.ObjectId.isValid(id)) {
      machine = await Machine.findById(id);
    } else {
      machine = await Machine.findOne({ _id: id });
    }

    if (!machine) {
      return res.status(404).json({ message: 'Machine not found' });
    }
    
    // Convert machine to plain object
    const machineObj = machine.toObject();
    
    // Create a normalized status for client-side only
    let clientStatus = 'available'; // Default
    if (machineObj.status) {
      if (machineObj.status === 'In Use') {
        clientStatus = 'in-use'; // Map "In Use" to "in-use" for frontend
      } else {
        clientStatus = machineObj.status.toLowerCase();
      }
    }

    // Return a new object with the normalized client status
    res.status(200).json({
      ...machineObj,
      status: clientStatus
    });
  } catch (error) {
    console.error('Error in getMachineById:', error);
    res.status(500).json({ message: 'Server error', error: error instanceof Error ? error.message : 'Unknown error' });
  }
};

// Get machine status
export const getMachineStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Handle string IDs properly
    let machine;
    if (mongoose.Types.ObjectId.isValid(id)) {
      machine = await Machine.findById(id);
    } else {
      machine = await Machine.findOne({ _id: id });
    }

    if (!machine) {
      return res.status(404).json({ message: 'Machine not found' });
    }
    
    // Convert machine status to normalized format for client
    let clientStatus = 'available'; // Default
    if (machine.status) {
      if (machine.status === 'In Use') {
        clientStatus = 'in-use'; // Map "In Use" to "in-use" for frontend
      } else {
        clientStatus = machine.status.toLowerCase();
      }
    }

    res.status(200).json({
      status: clientStatus,
      maintenanceNote: machine.maintenanceNote || ''
    });
  } catch (error) {
    console.error('Error in getMachineStatus:', error);
    res.status(500).json({ message: 'Server error', error: error instanceof Error ? error.message : 'Unknown error' });
  }
};

// Create a new machine (admin only)
export const createMachine = async (req: Request, res: Response) => {
  try {
    console.log("Creating new machine with data:", req.body);
    
    const { 
      name, 
      type, 
      description, 
      status = 'Available', 
      requiresCertification,
      difficulty = 'Beginner',
      imageUrl = '',
      specifications = '',
      details = '',
      certificationInstructions = '',
      linkedCourseId = '',
      linkedQuizId = ''
    } = req.body;

    // Generate the next available ID (starting from 7)
    // Find the highest current machine ID
    const machines = await Machine.find({}, { _id: 1 }).sort({ _id: -1 });
    let nextId = '7'; // Default start if no machines exist
    
    if (machines.length > 0) {
      // Get the highest existing ID
      const highestId = machines[0]._id;
      console.log("Highest existing ID:", highestId);
      
      if (!isNaN(Number(highestId))) {
        // Convert to number, increment, then back to string
        nextId = String(Number(highestId) + 1);
      }
    }
    
    console.log(`Creating new machine with ID: ${nextId}`);
    
    // Create new machine with the generated ID
    const machine = new Machine({
      _id: nextId,
      name,
      type,
      description,
      status,
      requiresCertification,
      difficulty,
      imageUrl,
      specifications,
      details,
      certificationInstructions,
      linkedCourseId,
      linkedQuizId,
      bookedTimeSlots: []
    });

    const createdMachine = await machine.save();
    console.log(`Created new machine: ${name} with ID: ${createdMachine._id}`);

    res.status(201).json(createdMachine);
  } catch (error) {
    console.error('Error in createMachine:', error);
    res.status(500).json({ 
      message: 'Server error', 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
};

// Update machine (admin only)
export const updateMachine = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    console.log(`Updating machine ${id} with data:`, req.body);

    // Handle string IDs properly
    let machine;
    if (mongoose.Types.ObjectId.isValid(id)) {
      machine = await Machine.findById(id);
    } else {
      machine = await Machine.findOne({ _id: id });
    }

    if (!machine) {
      return res.status(404).json({ message: 'Machine not found' });
    }

    // Extract all fields from request body
    const {
      name,
      type,
      description,
      status,
      requiresCertification,
      difficulty,
      imageUrl,
      specifications,
      details,
      certificationInstructions,
      linkedCourseId,
      linkedQuizId
    } = req.body;

    // Update all machine fields
    machine.name = name || machine.name;
    machine.type = type || machine.type;
    machine.description = description || machine.description;
    
    // Important: Handle boolean field explicitly
    machine.requiresCertification = requiresCertification !== undefined ? requiresCertification : machine.requiresCertification;
    
    machine.difficulty = difficulty || machine.difficulty;
    
    // Special handling for imageUrl
    if (imageUrl && imageUrl !== "") {
      // User provided an image, use it
      machine.imageUrl = imageUrl;
    } else if (DEFAULT_MACHINE_IMAGES[id] && (!machine.imageUrl || machine.imageUrl === "")) {
      // Use default image for standard machines if no image exists
      machine.imageUrl = DEFAULT_MACHINE_IMAGES[id];
      console.log(`Applied default image for machine ${id}: ${machine.imageUrl}`);
    }
    // Otherwise keep the existing image
    
    machine.specifications = specifications !== undefined ? specifications : machine.specifications;
    machine.details = details !== undefined ? details : machine.details;
    machine.certificationInstructions = certificationInstructions !== undefined ? certificationInstructions : machine.certificationInstructions;
    machine.linkedCourseId = linkedCourseId !== undefined ? linkedCourseId : machine.linkedCourseId;
    machine.linkedQuizId = linkedQuizId !== undefined ? linkedQuizId : machine.linkedQuizId;
    
    // Convert status to proper format (first letter capitalized)
    if (status) {
      // Ensure we're using a valid status from the Machine model
      let normalizedStatus: 'Available' | 'Maintenance' | 'In Use';
      switch(status.toLowerCase()) {
        case 'available':
          normalizedStatus = 'Available';
          break;
        case 'maintenance':
          normalizedStatus = 'Maintenance';
          break;
        case 'in-use':
        case 'in use':
        case 'out of order': // Map "out of order" to "In Use"
          normalizedStatus = 'In Use';
          break;
        default:
          normalizedStatus = 'Available';
      }
      machine.status = normalizedStatus;
    }
    
    const updatedMachine = await machine.save();
    console.log("Machine updated successfully:", updatedMachine);

    res.status(200).json({ 
      message: 'Machine updated successfully', 
      machine: {
        ...updatedMachine.toObject(),
        status: updatedMachine.status === 'In Use' ? 'in-use' : updatedMachine.status.toLowerCase()
      }
    });
  } catch (error) {
    console.error('Error in updateMachine:', error);
    res.status(500).json({ message: 'Server error', error: error instanceof Error ? error.message : 'Unknown error' });
  }
};

// Update machine status (admin only)
export const updateMachineStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status, maintenanceNote } = req.body;

    console.log(`Updating machine ${id} status to: ${status}, note: ${maintenanceNote}`);

    // Find machine with proper ID handling
    let machine;
    if (mongoose.Types.ObjectId.isValid(id)) {
      machine = await Machine.findById(id);
    } else {
      machine = await Machine.findOne({ _id: id });
    }

    if (!machine) {
      console.error(`Machine not found with ID: ${id}`);
      return res.status(404).json({ message: 'Machine not found' });
    }

    // Map status values to the exact string literals as defined in the Machine model
    let normalizedStatus: 'Available' | 'Maintenance' | 'In Use';
    switch(status.toLowerCase()) {
      case 'available':
        normalizedStatus = 'Available';
        break;
      case 'maintenance':
        normalizedStatus = 'Maintenance';
        break;
      case 'in-use':
      case 'in use':
      case 'out of order': // Map "out of order" to "In Use"
        normalizedStatus = 'In Use';
        break;
      default:
        normalizedStatus = 'Available';
    }

    // Update the machine status (removed special handling for Machine 1)
    machine.status = normalizedStatus;
    machine.maintenanceNote = maintenanceNote || '';
    
    console.log(`Saving machine with status: ${machine.status}`);
    await machine.save();

    // Return normalized status for client
    let clientStatus = machine.status === 'In Use' ? 'in-use' : machine.status.toLowerCase();

    console.log(`Machine ${id} status updated successfully to: ${machine.status}, client will see: ${clientStatus}`);
    res.status(200).json({ 
      message: 'Machine status updated successfully', 
      machine: {
        ...machine.toObject(),
        status: clientStatus
      },
      success: true 
    });
  } catch (error) {
    console.error('Error in updateMachineStatus:', error);
    res.status(500).json({ message: 'Server error', error: error instanceof Error ? error.message : 'Unknown error' });
  }
};

// Delete machine (admin only)
export const deleteMachine = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Handle string IDs properly
    let machine;
    if (mongoose.Types.ObjectId.isValid(id)) {
      machine = await Machine.findById(id);
    } else {
      machine = await Machine.findOne({ _id: id });
    }

    if (!machine) {
      return res.status(404).json({ message: 'Machine not found' });
    }

    // Find all users with this machine certification
    const machineId = id.toString();
    console.log(`Finding users with certification for machine ${machineId}`);
    
    try {
      // Remove this certification from all users
      const updateResult = await User.updateMany(
        { certifications: machineId },
        { $pull: { certifications: machineId } }
      );
      
      console.log(`Removed certification ${machineId} from ${updateResult.modifiedCount} users`);
      
      // Also remove certification dates for this machine
      const dateUpdateResult = await User.updateMany(
        {},
        { $unset: { [`certificationDates.${machineId}`]: "" } }
      );
      
      console.log(`Removed certification dates for machine ${machineId} from ${dateUpdateResult.modifiedCount} users`);
    } catch (error) {
      console.error("Error removing certifications:", error);
      // Continue with machine deletion even if certification removal fails
    }

    // Delete the machine
    await machine.deleteOne();

    res.status(200).json({ message: 'Machine deleted successfully' });
  } catch (error) {
    console.error('Error in deleteMachine:', error);
    res.status(500).json({ message: 'Server error', error: error instanceof Error ? error.message : 'Unknown error' });
  }
};
