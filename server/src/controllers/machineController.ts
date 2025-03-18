import { Request, Response } from 'express';
import { Machine } from '../models/Machine';
import mongoose from 'mongoose';

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

// Update machine (admin only)
export const updateMachine = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, status } = req.body;

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

    // Update the machine
    machine.name = name;
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
    
    await machine.save();

    res.status(200).json({ message: 'Machine updated successfully', machine });
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

    // Update the machine status
    machine.status = normalizedStatus;
    
    // Only set maintenance note if provided
    if (maintenanceNote !== undefined) {
      // If we're switching to Available status, clear the note
      if (normalizedStatus === 'Available') {
        machine.maintenanceNote = '';
      } else {
        // Otherwise set it if provided or clear it if empty string
        machine.maintenanceNote = maintenanceNote;
      }
    }
    
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

    // Delete the machine
    await machine.deleteOne();

    res.status(200).json({ message: 'Machine deleted successfully' });
  } catch (error) {
    console.error('Error in deleteMachine:', error);
    res.status(500).json({ message: 'Server error', error: error instanceof Error ? error.message : 'Unknown error' });
  }
};

// Check and seed machines if needed - called at server startup
export const checkAndSeedMachines = async () => {
  try {
    console.log('Checking if all machines exist in database...');
    
    // Expected machine IDs
    const expectedMachineIds = ['1', '2', '3', '4', '5', '6'];
    
    // Check if all machines exist
    const existingMachines = await Machine.find({ _id: { $in: expectedMachineIds } });
    const existingIds = existingMachines.map(m => m._id.toString());
    
    console.log(`Found ${existingMachines.length} of ${expectedMachineIds.length} expected machines`);
    
    // Find missing machines
    const missingIds = expectedMachineIds.filter(id => !existingIds.includes(id));
    
    if (missingIds.length > 0) {
      console.log(`Missing machines with IDs: ${missingIds.join(', ')}. Reseeding...`);
      
      // Import the seed data
      const { seedMachines } = require('../utils/seed');
      
      // Run the seed function to add missing machines
      await seedMachines(true, missingIds);
      
      console.log('Machine reseeding completed successfully');
    } else {
      console.log('All expected machines exist in the database');
    }
  } catch (error) {
    console.error('Error checking and seeding machines:', error);
  }
};
