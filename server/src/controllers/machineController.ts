import { Request, Response } from 'express';
import { Machine } from '../models/Machine';
import mongoose from 'mongoose';

// Get all machines
export const getMachines = async (req: Request, res: Response) => {
  try {
    // Only return machines that haven't been soft-deleted or permanently deleted
    const machines = await Machine.find({ 
      $or: [
        { deletedAt: { $exists: false } },
        { deletedAt: null }
      ],
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
        $or: [
          { deletedAt: { $exists: false } },
          { deletedAt: null }
        ],
        permanentlyDeleted: { $ne: true }
      });
    } else {
      machine = await Machine.findOne({
        _id: id,
        $or: [
          { deletedAt: { $exists: false } },
          { deletedAt: null }
        ],
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
    console.log('Creating new machine with data:', req.body);
    
    const { name, type, description, status, requiresCertification, maintenanceNote, bookedTimeSlots, difficulty, imageUrl, details, specifications, certificationInstructions, linkedCourseId, linkedQuizId, note, isUserCreated } = req.body;

    // Normalize requiresCertification to ensure it's a boolean
    const normalizedRequiresCertification = Boolean(requiresCertification);
    console.log(`Normalized requiresCertification: ${normalizedRequiresCertification} (${typeof normalizedRequiresCertification})`);

    // Create machine with next available ID
    const machine = new Machine({
      name,
      type,
      description,
      status: status || 'Available',
      requiresCertification: normalizedRequiresCertification,
      maintenanceNote,
      bookedTimeSlots: bookedTimeSlots || [],
      difficulty,
      imageUrl,
      details,
      specifications,
      certificationInstructions,
      linkedCourseId: linkedCourseId || null,
      linkedQuizId: linkedQuizId || null,
      note,
      isUserCreated: isUserCreated || true
    });

    console.log('Saving machine:', { 
      ...machine.toObject(),
      requiresCertification: `${machine.requiresCertification} (${typeof machine.requiresCertification})` 
    });
    
    const savedMachine = await machine.save();
    
    // Create an initial backup of the new machine
    await backupMachineData(savedMachine._id);
    
    console.log('Machine saved successfully:', savedMachine);
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
    
    // Backup the machine data before updating
    await backupMachineData(id);

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

// Delete machine endpoint updated to ensure permanent deletion for machines with ID > 6
export const deleteMachine = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { permanent, hardDelete } = req.query; // Add hardDelete parameter for true database deletion
    
    console.log(`Deleting machine ${id}, permanent: ${permanent}, hardDelete: ${hardDelete}`);
    
    let machine;
    try {
      machine = await Machine.findById(id);
    } catch (error) {
      console.error(`Error finding machine ${id}:`, error);
    }
    
    if (!machine) {
      return res.status(404).json({ message: 'Machine not found' });
    }
    
    // Backup the machine before deletion
    await backupMachineData(id);
    
    // Check if this is a core machine (ID 1-6) or user-created machine (ID > 6)
    const machineIdNum = Number(id);
    const isCoreMachine = machineIdNum >= 1 && machineIdNum <= 6;
    const isUserMachine = !isNaN(machineIdNum) && machineIdNum > 6;
    
    // For user-created machines (ID > 6), always use permanent deletion
    // regardless of the permanent flag
    const shouldPermanentDelete = permanent === 'true' || permanent === '1' || isUserMachine;
    
    if (shouldPermanentDelete) {
      console.log(`Using permanent deletion for machine ${id} (isUserMachine: ${isUserMachine})`);
      
      // For core machines (1-6), don't allow physical deletion from database
      if (isCoreMachine) {
        console.log(`Cannot permanently delete core machine ${id} - using soft delete instead`);
        // Just use soft delete for core machines
        await Machine.findByIdAndUpdate(id, { 
          deletedAt: new Date(),
          status: 'Maintenance',
          maintenanceNote: 'This machine has been temporarily removed.',
          permanentlyDeleted: true
        });
        
        return res.status(200).json({ 
          message: 'Core machine soft-deleted and marked as permanently deleted',
          softDeleted: true,
          permanentlyDeleted: true
        });
      } else {
        // For user-created machines, perform HARD DELETE (completely remove from database)
        try {
          await Machine.findByIdAndDelete(id);
          console.log(`Non-core machine ${id} PERMANENTLY DELETED from database`);
          return res.status(200).json({ 
            message: 'Machine permanently deleted from database',
            permanentlyDeleted: true,
            hardDeleted: true
          });
        } catch (deleteError) {
          console.error(`Error performing hard delete on machine ${id}:`, deleteError);
          
          // If hard delete fails, mark as permanently deleted
          await Machine.findByIdAndUpdate(id, { 
            deletedAt: new Date(),
            status: 'Maintenance',
            maintenanceNote: 'This machine has been permanently removed.',
            permanentlyDeleted: true
          });
          
          return res.status(200).json({ 
            message: 'Machine marked as permanently deleted',
            permanentlyDeleted: true
          });
        }
      }
    } else {
      // For soft deletion, just set the deletedAt timestamp
      console.log(`Soft-deleting machine ${id}`);
      await Machine.findByIdAndUpdate(id, { 
        deletedAt: new Date(),
        status: 'Maintenance',
        maintenanceNote: 'This machine has been temporarily removed.'
      });
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
    
    // Backup the machine data before updating status
    await backupMachineData(id);

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

// Helper function to backup machine data
const backupMachineData = async (machineId: string) => {
  try {
    const machine = await Machine.findById(machineId);
    if (!machine) {
      console.error(`Cannot backup machine ${machineId}: not found`);
      return false;
    }
    
    // Create backup data with timestamp
    const backupData = {
      ...machine.toObject(),
      _backupTime: new Date().toISOString()
    };
    
    // Store backup as JSON string
    await Machine.findByIdAndUpdate(machineId, {
      backupData: JSON.stringify(backupData)
    });
    
    console.log(`Successfully backed up machine ${machineId}`);
    return true;
  } catch (error) {
    console.error(`Error backing up machine ${machineId}:`, error);
    return false;
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

    // Update with provided backup data or generate new backup
    if (backupData) {
      await Machine.findByIdAndUpdate(id, { backupData });
    } else {
      const success = await backupMachineData(id);
      if (!success) {
        return res.status(500).json({ message: 'Failed to backup machine' });
      }
    }

    res.status(200).json({ success: true, message: 'Machine backed up successfully' });
  } catch (error) {
    console.error(`Error in backupMachine:`, error);
    res.status(500).json({ message: 'Server error', error: error instanceof Error ? error.message : 'Unknown error' });
  }
};
