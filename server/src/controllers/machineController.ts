import { Request, Response } from 'express';
import { Machine } from '../models/Machine';
import mongoose from 'mongoose';

// Get all machines
export const getMachines = async (req: Request, res: Response) => {
  try {
    // Only return machines that haven't been soft-deleted or permanently deleted
    const machines = await Machine.find({ 
      deletedAt: { $exists: false },
      permanentlyDeleted: { $ne: true }
    });
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

    // Handle string IDs properly
    let machine;
    if (mongoose.Types.ObjectId.isValid(id)) {
      machine = await Machine.findOne({
        _id: id,
        deletedAt: { $exists: false },
        permanentlyDeleted: { $ne: true }
      });
    } else {
      machine = await Machine.findOne({
        _id: id,
        deletedAt: { $exists: false },
        permanentlyDeleted: { $ne: true }
      });
    }

    if (!machine) {
      return res.status(404).json({ message: 'Machine not found' });
    }

    res.status(200).json(machine);
  } catch (error) {
    console.error('Error in getMachineById:', error);
    res.status(500).json({ message: 'Server error', error: error instanceof Error ? error.message : 'Unknown error' });
  }
};

// Create new machine
export const createMachine = async (req: Request, res: Response) => {
  try {
    const { name, type, description, status, requiresCertification, maintenanceNote, bookedTimeSlots, difficulty, imageUrl, details, specifications, certificationInstructions, linkedCourseId, linkedQuizId, note, isUserCreated } = req.body;

    const machine = new Machine({
      name,
      type,
      description,
      status,
      requiresCertification,
      maintenanceNote,
      bookedTimeSlots,
      difficulty,
      imageUrl,
      details,
      specifications,
      certificationInstructions,
      linkedCourseId,
      linkedQuizId,
      note,
      isUserCreated
    });

    const savedMachine = await machine.save();
    res.status(201).json(savedMachine);
  } catch (error) {
    console.error('Error in createMachine:', error);
    res.status(500).json({ message: 'Server error', error: error instanceof Error ? error.message : 'Unknown error' });
  }
};

// Update machine
export const updateMachine = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, type, description, status, requiresCertification, maintenanceNote, bookedTimeSlots, difficulty, imageUrl, details, specifications, certificationInstructions, linkedCourseId, linkedQuizId, note, isUserCreated } = req.body;

    // Find the machine
    let machine;
    if (mongoose.Types.ObjectId.isValid(id)) {
      machine = await Machine.findById(id);
    } else {
      machine = await Machine.findOne({ _id: id });
    }

    if (!machine) {
      return res.status(404).json({ message: 'Machine not found' });
    }

    const updatedMachine = await Machine.findByIdAndUpdate(
      id,
      {
        name,
        type,
        description,
        status,
        requiresCertification,
        maintenanceNote,
        bookedTimeSlots,
        difficulty,
        imageUrl,
        details,
        specifications,
        certificationInstructions,
        linkedCourseId,
        linkedQuizId,
        note,
        isUserCreated
      },
      { new: true }
    );

    res.status(200).json({ success: true, machine: updatedMachine });
  } catch (error) {
    console.error('Error in updateMachine:', error);
    res.status(500).json({ message: 'Server error', error: error instanceof Error ? error.message : 'Unknown error' });
  }
};

// Update the delete machine endpoint to support permanent deletion
export const deleteMachine = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { permanent } = req.query; // Add support for permanent deletion query parameter
    
    let machine;
    try {
      machine = await Machine.findById(id);
    } catch (error) {
      console.error(`Error finding machine ${id}:`, error);
    }
    
    if (!machine) {
      return res.status(404).json({ message: 'Machine not found' });
    }
    
    // Check if this is a core machine (ID 1-6)
    const isCoreMachine = Number(id) >= 1 && Number(id) <= 6;
    
    if (permanent === 'true' || permanent === '1') {
      // For permanent deletion, we mark it as permanently deleted
      // This way it won't be recreated on server restart
      console.log(`Permanently deleting machine ${id}`);
      
      // For core machines (1-6), just mark as permanently deleted instead of removing
      if (isCoreMachine) {
        await Machine.findByIdAndUpdate(id, { 
          deletedAt: new Date(),
          permanentlyDeleted: true,
          status: 'Maintenance',
          maintenanceNote: 'This machine has been permanently deleted.'
        });
        
        console.log(`Core machine ${id} marked as permanently deleted`);
        return res.status(200).json({ 
          message: 'Core machine marked as permanently deleted',
          softDeleted: true
        });
      } else {
        // For user-created machines, we can actually delete them
        await Machine.findByIdAndDelete(id);
        console.log(`User-created machine ${id} permanently deleted from database`);
        return res.status(200).json({ message: 'Machine permanently deleted' });
      }
    } else {
      // For soft deletion, just set the deletedAt timestamp
      console.log(`Soft-deleting machine ${id}`);
      await Machine.findByIdAndUpdate(id, { deletedAt: new Date() });
      return res.status(200).json({ 
        message: 'Machine deleted successfully (soft delete)',
        softDeleted: true
      });
    }
  } catch (error) {
    console.error('Error in deleteMachine:', error);
    res.status(500).json({ message: 'Server error', error: error instanceof Error ? error.message : 'Unknown error' });
  }
};

// Get machine status
export const getMachineStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const machine = await Machine.findById(id);

    if (!machine) {
      return res.status(404).json({ message: 'Machine not found' });
    }

    res.status(200).json({ status: machine.status, maintenanceNote: machine.maintenanceNote });
  } catch (error) {
    console.error('Error in getMachineStatus:', error);
    res.status(500).json({ message: 'Server error', error: error instanceof Error ? error.message : 'Unknown error' });
  }
};

// Update machine status
export const updateMachineStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status, maintenanceNote } = req.body;

    // Find the machine
    let machine;
    if (mongoose.Types.ObjectId.isValid(id)) {
      machine = await Machine.findById(id);
    } else {
      machine = await Machine.findOne({ _id: id });
    }

    if (!machine) {
      return res.status(404).json({ message: 'Machine not found' });
    }

    machine.status = status;
    machine.maintenanceNote = maintenanceNote || ''; // Allow clearing the maintenance note

    await machine.save();

    res.status(200).json({ success: true, message: 'Machine status updated successfully' });
  } catch (error) {
    console.error('Error in updateMachineStatus:', error);
    res.status(500).json({ message: 'Server error', error: error instanceof Error ? error.message : 'Unknown error' });
  }
};

// Update restoreMachine function to respect permanently deleted machines
export const restoreMachine = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    // Check if machine exists in any state
    const machine = await Machine.findOne({ _id: id });
    
    if (!machine) {
      return res.status(404).json({ message: 'Machine not found' });
    }
    
    // Don't restore permanently deleted machines
    if (machine.permanentlyDeleted) {
      return res.status(400).json({
        message: 'Cannot restore permanently deleted machine',
        permanentlyDeleted: true
      });
    }
    
    // If machine exists but is soft-deleted, restore it
    if (machine.deletedAt) {
      // Clear the deletedAt field
      machine.deletedAt = undefined;
      machine.status = 'Available';
      machine.maintenanceNote = '';
      
      await machine.save();
      
      return res.status(200).json({
        success: true,
        message: 'Machine restored successfully',
        machine
      });
    }
    
    // If machine exists and is not deleted, just return it
    return res.status(200).json({
      success: true,
      message: 'Machine is already active',
      machine
    });
  } catch (error) {
    console.error('Error in restoreMachine:', error);
    res.status(500).json({ message: 'Server error', error: error instanceof Error ? error.message : 'Unknown error' });
  }
};

// Backup machine endpoint
export const backupMachine = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { backupData } = req.body;

    // Find the machine to ensure it exists
    const machine = await Machine.findById(id);
    if (!machine) {
      return res.status(404).json({ message: 'Machine not found' });
    }

    // Update with provided backup data
    await Machine.findByIdAndUpdate(id, { backupData });

    res.status(200).json({ success: true, message: 'Machine backed up successfully' });
  } catch (error) {
    console.error(`Error in backupMachine:`, error);
    res.status(500).json({ message: 'Server error', error: error instanceof Error ? error.message : 'Unknown error' });
  }
};
