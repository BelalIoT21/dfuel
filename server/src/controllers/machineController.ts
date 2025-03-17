
import { Request, Response } from 'express';
import { Machine } from '../models/Machine';
import mongoose from 'mongoose';

// Get all machines
export const getMachines = async (req: Request, res: Response) => {
  try {
    const machines = await Machine.find({});
    res.status(200).json(machines);
  } catch (error) {
    console.error('Error in getMachines:', error);
    res.status(500).json({ message: 'Server error', error: error instanceof Error ? error.message : 'Unknown error' });
  }
};

// Get machine by ID
export const getMachineById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Convert the ID to an ObjectId
    const objectId = new mongoose.Types.ObjectId(id);

    const machine = await Machine.findById(objectId);

    if (!machine) {
      return res.status(404).json({ message: 'Machine not found' });
    }

    res.status(200).json(machine);
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

    // Convert the ID to an ObjectId
    const objectId = new mongoose.Types.ObjectId(id);

    const machine = await Machine.findById(objectId);

    if (!machine) {
      return res.status(404).json({ message: 'Machine not found' });
    }

    // Update the machine
    machine.name = name;
    // Convert status to proper format (first letter capitalized)
    machine.status = status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
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
    const { status, note } = req.body;

    console.log(`Updating machine ${id} status to: ${status}, note: ${note}`);

    // Convert the ID to an ObjectId
    const objectId = new mongoose.Types.ObjectId(id);

    const machine = await Machine.findById(objectId);

    if (!machine) {
      return res.status(404).json({ message: 'Machine not found' });
    }

    // Map status values to proper format for MongoDB
    let normalizedStatus = 'Available';
    switch(status.toLowerCase()) {
      case 'available':
        normalizedStatus = 'Available';
        break;
      case 'maintenance':
        normalizedStatus = 'Maintenance';
        break;
      case 'in-use':
      case 'in use':
        normalizedStatus = 'Out of Order'; // Using "Out of Order" for "In Use" as per model
        break;
      default:
        normalizedStatus = 'Available';
    }

    // Update the machine status
    machine.status = normalizedStatus;
    machine.maintenanceNote = note;
    await machine.save();

    console.log(`Machine ${id} status updated to: ${normalizedStatus}`);
    res.status(200).json({ 
      message: 'Machine status updated successfully', 
      machine,
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

    // Convert the ID to an ObjectId
    const objectId = new mongoose.Types.ObjectId(id);

    const machine = await Machine.findById(objectId);

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
