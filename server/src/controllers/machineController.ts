import { Request, Response } from 'express';
import { Machine } from '../models/Machine';
import mongoose from 'mongoose';
import User from '../models/User';

const DEFAULT_MACHINE_IMAGES: Record<string, string> = {
  '1': '/utils/images/IMG_7814.jpg', // Laser Cutter
  '2': '/utils/images/IMG_7773.jpg', // Ultimaker
  '3': '/utils/images/IMG_7768.jpg', // X1 E Carbon 3D Printer
  '4': '/utils/images/IMG_7769.jpg', // Bambu Lab
  '5': '/utils/images/IMG_7775.jpg', // Safety Cabinet
  '6': '/utils/images/IMG_7821.jpg'  // Safety Course
};

// Helper function to format image URLs properly for client use
const formatImageUrl = (url: string, id?: string): string => {
  if (!url || url === '') {
    if (id && id in DEFAULT_MACHINE_IMAGES) {
      return DEFAULT_MACHINE_IMAGES[id];
    }
    return '';
  }
  
  // For data URLs, return as is
  if (url.startsWith('data:')) {
    return url;
  }
  
  // For server paths, make sure they have the correct format
  if (url.startsWith('/utils/images')) {
    return `http://localhost:4000${url}`;
  }
  
  // Ensure all URLs have proper format
  if (!url.startsWith('http') && !url.startsWith('/')) {
    return '/' + url;
  }
  
  return url;
};

export const getMachines = async (req: Request, res: Response) => {
  try {
    const filterSpecial = req.query.filterSpecial === 'true';
    
    let query = {};
    if (filterSpecial) {
      query = { _id: { $nin: ['5', '6'] } };
    }
    
    const machines = await Machine.find(query);
    console.log(`Retrieved ${machines.length} machines${filterSpecial ? ' (filtered)' : ''}`);
    
    const normalizedMachines = machines.map(machine => {
      const machineObj = machine.toObject();
      
      const clientStatus = (() => {
        if (machineObj.status === 'In Use') {
          return 'in-use';
        } else if (machineObj.status) {
          return machineObj.status.toLowerCase();
        }
        return 'available';
      })();
      
      const imageUrl = formatImageUrl(machineObj.imageUrl || '', machineObj._id);
      
      return {
        ...machineObj,
        status: clientStatus,
        imageUrl: imageUrl,
        image: imageUrl
      };
    });
    
    res.status(200).json(normalizedMachines);
  } catch (error) {
    console.error('Error in getMachines:', error);
    res.status(500).json({ message: 'Server error', error: error instanceof Error ? error.message : 'Unknown error' });
  }
};

export const getMachineById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    let machine;
    if (mongoose.Types.ObjectId.isValid(id)) {
      machine = await Machine.findById(id);
    } else {
      machine = await Machine.findOne({ _id: id });
    }

    if (!machine) {
      return res.status(404).json({ message: 'Machine not found' });
    }
    
    const machineObj = machine.toObject();
    
    let clientStatus = 'available';
    if (machineObj.status) {
      if (machineObj.status === 'In Use') {
        clientStatus = 'in-use';
      } else {
        clientStatus = machineObj.status.toLowerCase();
      }
    }
    
    const imageUrl = formatImageUrl(machineObj.imageUrl || '', id);

    res.status(200).json({
      ...machineObj,
      status: clientStatus,
      imageUrl: imageUrl,
      image: imageUrl
    });
  } catch (error) {
    console.error('Error in getMachineById:', error);
    res.status(500).json({ message: 'Server error', error: error instanceof Error ? error.message : 'Unknown error' });
  }
};

export const getMachineStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    let machine;
    if (mongoose.Types.ObjectId.isValid(id)) {
      machine = await Machine.findById(id);
    } else {
      machine = await Machine.findOne({ _id: id });
    }

    if (!machine) {
      return res.status(404).json({ message: 'Machine not found' });
    }
    
    let clientStatus = 'available';
    if (machine.status) {
      if (machine.status === 'In Use') {
        clientStatus = 'in-use';
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
      image = '',
      specifications = '',
      details = '',
      certificationInstructions = '',
      linkedCourseId = '',
      linkedQuizId = ''
    } = req.body;

    // Use either imageUrl or image field, whichever is provided
    let normalizedImageUrl = imageUrl || image || '';
    
    // Check if it's a data URL (uploaded image) and log for debugging
    if (normalizedImageUrl && normalizedImageUrl.startsWith('data:')) {
      console.log("Image data URL detected during machine creation, length:", normalizedImageUrl.length);
    } else if (normalizedImageUrl) {
      console.log("Using provided image URL:", normalizedImageUrl);
    }
    
    // Ensure URL has proper format if it's a path and not a data URL
    if (normalizedImageUrl && !normalizedImageUrl.startsWith('data:') &&
        !normalizedImageUrl.startsWith('/') && !normalizedImageUrl.startsWith('http')) {
      normalizedImageUrl = '/' + normalizedImageUrl;
    }

    // Get the next available ID (ensuring we never overwrite existing machines)
    const machines = await Machine.find({}, '_id').sort({ _id: -1 });
    let nextId = '7'; // Start from 7 for user-created machines
    
    if (machines.length > 0) {
      const highestId = machines.reduce((max, machine) => {
        const id = machine._id.toString();
        return !isNaN(Number(id)) && Number(id) > Number(max) ? id : max;
      }, '6'); // Default to 6 if no numeric IDs found
      
      console.log("Highest existing ID:", highestId);
      nextId = String(Number(highestId) + 1);
    }
    
    console.log(`Creating new machine with ID: ${nextId}`);
    
    let normalizedRequiresCertification: boolean;
    if (typeof requiresCertification === 'boolean') {
      normalizedRequiresCertification = requiresCertification;
    } else if (typeof requiresCertification === 'string') {
      normalizedRequiresCertification = requiresCertification === 'true';
    } else {
      normalizedRequiresCertification = requiresCertification !== undefined ? Boolean(requiresCertification) : true;
    }
    
    console.log(`requiresCertification normalized to: ${normalizedRequiresCertification} (${typeof normalizedRequiresCertification})`);
    
    // Create the new machine with a unique ID
    const machine = new Machine({
      _id: nextId,
      name,
      type,
      description,
      status,
      requiresCertification: normalizedRequiresCertification,
      difficulty,
      imageUrl: normalizedImageUrl,
      specifications,
      details,
      certificationInstructions,
      linkedCourseId: linkedCourseId || undefined,
      linkedQuizId: linkedQuizId || undefined,
      bookedTimeSlots: [],
      isUserCreated: true // Add flag to indicate this is a user-created machine
    });

    const createdMachine = await machine.save();
    console.log(`Created new machine: ${name} with ID: ${createdMachine._id}`);

    // Always use the provided image if available, or a default
    let finalImageUrl = normalizedImageUrl || '';
    if ((!finalImageUrl || finalImageUrl === '') && createdMachine._id in DEFAULT_MACHINE_IMAGES) {
      finalImageUrl = DEFAULT_MACHINE_IMAGES[createdMachine._id as keyof typeof DEFAULT_MACHINE_IMAGES];
    }

    // For debugging
    console.log(`Final image URL for machine ${createdMachine._id}: ${finalImageUrl.substring(0, 50)}${finalImageUrl.length > 50 ? '...' : ''}`);

    const machineWithImage = {
      ...createdMachine.toObject(),
      image: finalImageUrl,
      imageUrl: finalImageUrl
    };

    res.status(201).json(machineWithImage);
  } catch (error) {
    console.error('Error in createMachine:', error);
    res.status(500).json({ 
      message: 'Server error', 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
};

export const updateMachine = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    console.log(`Updating machine ${id} with data:`, req.body);

    let machine;
    if (mongoose.Types.ObjectId.isValid(id)) {
      machine = await Machine.findById(id);
    } else {
      machine = await Machine.findOne({ _id: id });
    }

    if (!machine) {
      return res.status(404).json({ message: 'Machine not found' });
    }

    // Create a backup of the machine before updating it
    try {
      // Store current machine state in the machineBackups collection
      const db = mongoose.connection.db;
      if (db) {
        const backupsCollection = db.collection('machineBackups');
        const backupData = {
          machineId: id,
          data: JSON.stringify(machine.toObject()),
          timestamp: new Date(),
          reason: 'pre-update'
        };
        await backupsCollection.insertOne(backupData);
        console.log(`Created backup of machine ${id} before update`);
      }
    } catch (backupError) {
      console.error(`Error creating backup for machine ${id}:`, backupError);
      // Continue with update even if backup fails
    }

    const {
      name,
      type,
      description,
      status,
      requiresCertification,
      difficulty,
      imageUrl,
      image,
      specifications,
      details,
      certificationInstructions,
      linkedCourseId,
      linkedQuizId
    } = req.body;

    // Only update fields that are provided
    if (name !== undefined) machine.name = name;
    if (type !== undefined) machine.type = type;
    if (description !== undefined) machine.description = description;
    
    console.log(`Original requiresCertification for machine ${id}: ${requiresCertification} (${typeof requiresCertification})`);
    
    if (requiresCertification !== undefined) {
      let normalizedValue: boolean;
      if (typeof requiresCertification === 'boolean') {
        normalizedValue = requiresCertification;
      } else if (typeof requiresCertification === 'string') {
        normalizedValue = requiresCertification === 'true';
      } else {
        normalizedValue = Boolean(requiresCertification);
      }
      
      machine.requiresCertification = normalizedValue;
      console.log(`Setting requiresCertification for machine ${id} to ${normalizedValue} (${typeof normalizedValue})`);
    }
    
    if (difficulty !== undefined) machine.difficulty = difficulty;
    
    // Handle image uploads - correctly process data URLs or path URLs
    if (imageUrl || image) {
      const finalImageUrl = imageUrl || image;
      
      // Check if the image is a data URL
      if (finalImageUrl && finalImageUrl.startsWith('data:image')) {
        console.log(`Storing data URL image for machine ${id} (length: ${finalImageUrl.length} bytes)`);
        machine.imageUrl = finalImageUrl;
      } else if (finalImageUrl) {
        // For regular URLs, just store the path
        console.log(`Storing URL image for machine ${id}: ${finalImageUrl}`);
        machine.imageUrl = finalImageUrl;
      }
      
      console.log(`Updated image URL for machine ${id}`);
    } else if (id in DEFAULT_MACHINE_IMAGES && (!machine.imageUrl || machine.imageUrl === "")) {
      machine.imageUrl = DEFAULT_MACHINE_IMAGES[id as keyof typeof DEFAULT_MACHINE_IMAGES];
      console.log(`Applied default image for machine ${id}: ${machine.imageUrl}`);
    }
    
    if (specifications !== undefined) machine.specifications = specifications;
    if (details !== undefined) machine.details = details;
    if (certificationInstructions !== undefined) machine.certificationInstructions = certificationInstructions;
    
    // Explicit handling of linkedCourseId and linkedQuizId - only clear if explicitly set to null, empty, or 'none'
    if (linkedCourseId === null || linkedCourseId === '' || linkedCourseId === 'none') {
      machine.linkedCourseId = undefined;
      console.log(`Removed linkedCourseId for machine ${id}`);
    } else if (linkedCourseId !== undefined) {
      machine.linkedCourseId = linkedCourseId;
      console.log(`Updated linkedCourseId for machine ${id} to: ${linkedCourseId}`);
    }
    
    // Explicit handling of linkedQuizId - only clear if explicitly set to null, empty, or 'none'
    if (linkedQuizId === null || linkedQuizId === '' || linkedQuizId === 'none') {
      machine.linkedQuizId = undefined;
      console.log(`Removed linkedQuizId for machine ${id}`);
    } else if (linkedQuizId !== undefined) {
      machine.linkedQuizId = linkedQuizId;
      console.log(`Updated linkedQuizId for machine ${id} to: ${linkedQuizId}`);
    }
    
    if (status) {
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
        case 'out of order':
          normalizedStatus = 'In Use';
          break;
        default:
          normalizedStatus = 'Available';
      }
      machine.status = normalizedStatus;
    }
    
    const updatedMachine = await machine.save();
    console.log(`Machine ${id} updated successfully:`, updatedMachine);
    
    // Format the image URL for the response
    const formattedImageUrl = formatImageUrl(updatedMachine.imageUrl || '', id);

    res.status(200).json({ 
      message: 'Machine updated successfully', 
      machine: {
        ...updatedMachine.toObject(),
        status: updatedMachine.status === 'In Use' ? 'in-use' : updatedMachine.status.toLowerCase(),
        imageUrl: formattedImageUrl,
        image: formattedImageUrl
      }
    });
  } catch (error) {
    console.error('Error in updateMachine:', error);
    res.status(500).json({ message: 'Server error', error: error instanceof Error ? error.message : 'Unknown error' });
  }
};

export const updateMachineStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status, maintenanceNote } = req.body;

    console.log(`Updating machine ${id} status to: ${status}, note: ${maintenanceNote}`);

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
      case 'out of order':
        normalizedStatus = 'In Use';
        break;
      default:
        normalizedStatus = 'Available';
    }

    machine.status = normalizedStatus;
    machine.maintenanceNote = maintenanceNote || '';
    
    console.log(`Saving machine with status: ${machine.status}`);
    await machine.save();

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

export const deleteMachine = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    let machine;
    if (mongoose.Types.ObjectId.isValid(id)) {
      machine = await Machine.findById(id);
    } else {
      machine = await Machine.findOne({ _id: id });
    }

    if (!machine) {
      return res.status(404).json({ message: 'Machine not found' });
    }

    let machineId = id.toString();
    
    // For core machines (1-6), create a backup and then soft delete
    if (machineId >= '1' && machineId <= '6') {
      console.log(`Creating backup and soft-deleting core machine ${machineId}`);
      
      try {
        // Create a backup of the machine before soft deletion
        const db = mongoose.connection.db;
        if (db) {
          const backupsCollection = db.collection('machineBackups');
          const backupData = {
            machineId,
            data: JSON.stringify(machine.toObject()),
            timestamp: new Date(),
            reason: 'pre-soft-delete'
          };
          await backupsCollection.insertOne(backupData);
          console.log(`Created backup of machine ${machineId} before soft deletion`);
        }
      } catch (backupError) {
        console.error(`Error creating backup for machine ${machineId}:`, backupError);
      }
      
      machine.status = 'Maintenance';
      machine.maintenanceNote = 'This machine has been temporarily removed.';
      await machine.save();
      
      console.log(`Marked core machine ${machineId} as maintenance instead of deleting`);
      return res.status(200).json({ 
        message: 'Core machine marked as maintenance. It can be restored later.',
        softDeleted: true
      });
    }
    
    console.log(`Finding users with certification for machine ${machineId}`);
    
    try {
      // First, identify all users with this machine certification
      const usersWithCert = await User.find({ certifications: machineId });
      console.log(`Found ${usersWithCert.length} users with certification for machine ${machineId}`);
      
      // Remove the certification from each user's list
      const updateResult = await User.updateMany(
        { certifications: machineId },
        { $pull: { certifications: machineId } }
      );
      
      console.log(`Removed certification ${machineId} from ${updateResult.modifiedCount} users`);
      
      // Also remove any certification dates for this machine
      const dateUpdateResult = await User.updateMany(
        {},
        { $unset: { [`certificationDates.${machineId}`]: "" } }
      );
      
      console.log(`Removed certification dates for machine ${machineId} from ${dateUpdateResult.modifiedCount} users`);
    } catch (error) {
      console.error("Error removing certifications:", error);
    }

    // For user-created machines, create a backup before deletion
    try {
      const db = mongoose.connection.db;
      if (db) {
        const backupsCollection = db.collection('machineBackups');
        const backupData = {
          machineId,
          data: JSON.stringify(machine.toObject()),
          timestamp: new Date(),
          reason: 'pre-delete'
        };
        await backupsCollection.insertOne(backupData);
        console.log(`Created backup of machine ${machineId} before deletion`);
      }
    } catch (backupError) {
      console.error(`Error creating backup for machine ${machineId}:`, backupError);
    }

    // Delete the machine
    await machine.deleteOne();

    res.status(200).json({ message: 'Machine deleted successfully' });
  } catch (error) {
    console.error('Error in deleteMachine:', error);
    res.status(500).json({ message: 'Server error', error: error instanceof Error ? error.message : 'Unknown error' });
  }
};

// New endpoint to backup a machine
export const backupMachine = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { backupData } = req.body;
    
    if (!backupData) {
      return res.status(400).json({ message: 'Backup data is required' });
    }
    
    let machine;
    if (mongoose.Types.ObjectId.isValid(id)) {
      machine = await Machine.findById(id);
    } else {
      machine = await Machine.findOne({ _id: id });
    }
    
    if (!machine) {
      return res.status(404).json({ message: 'Machine not found' });
    }
    
    try {
      const db = mongoose.connection.db;
      if (db) {
        const backupsCollection = db.collection('machineBackups');
        const backupRecord = {
          machineId: id,
          data: backupData,
          timestamp: new Date(),
          reason: 'api-backup'
        };
        await backupsCollection.insertOne(backupRecord);
        console.log(`Created backup of machine ${id}`);
        
        return res.status(200).json({ 
          message: 'Machine backup created successfully',
          success: true
        });
      } else {
        throw new Error('Database connection not available');
      }
    } catch (dbError) {
      console.error(`Database error creating backup for machine ${id}:`, dbError);
      return res.status(500).json({ 
        message: 'Error creating backup', 
        error: dbError instanceof Error ? dbError.message : 'Unknown error'
      });
    }
  } catch (error) {
    console.error('Error in backupMachine:', error);
    return res.status(500).json({ 
      message: 'Server error', 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
};

// Updated endpoint to restore a machine
export const restoreMachine = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { useLatestBackup, useTemplate } = req.body;
    
    console.log(`Restoring machine ${id} with options:`, { useLatestBackup, useTemplate });
    
    // FIRST: Try to restore from latest backup if requested
    if (useLatestBackup) {
      try {
        const db = mongoose.connection.db;
        if (db) {
          const backupsCollection = db.collection('machineBackups');
          // Find the latest backup for this machine
          const latestBackup = await backupsCollection.find({ machineId: id })
            .sort({ timestamp: -1 })
            .limit(1)
            .toArray();
            
          if (latestBackup.length > 0) {
            console.log(`Found backup for machine ${id} from ${latestBackup[0].timestamp}`);
            
            // Parse the backup data
            const backupData = JSON.parse(latestBackup[0].data);
            
            // See if the machine exists
            let existingMachine;
            if (mongoose.Types.ObjectId.isValid(id)) {
              existingMachine = await Machine.findById(id);
            } else {
              existingMachine = await Machine.findOne({ _id: id });
            }
            
            if (existingMachine) {
              // Update existing machine with backed up data
              console.log(`Updating existing machine ${id} with backup data`);
              
              // Update all fields from backup
              Object.keys(backupData).forEach(key => {
                // Skip special fields that shouldn't be restored
                if (!['_id', '__v', 'createdAt', 'updatedAt', '_backupTime'].includes(key)) {
                  existingMachine[key] = backupData[key];
                }
              });
              
              // Set status to Available
              existingMachine.status = 'Available';
              existingMachine.maintenanceNote = '';
              
              await existingMachine.save();
              console.log(`Successfully restored machine ${id} from backup`);
              
              return res.status(200).json({
                message: 'Machine restored successfully from backup',
                machine: existingMachine
              });
            } else {
              // Create a new machine from backup
              console.log(`Creating new machine ${id} from backup data`);
              
              // Prepare clean data for new machine
              const cleanData = { ...backupData };
              delete cleanData._backupTime;
              delete cleanData.__v;
              delete cleanData.createdAt;
              delete cleanData.updatedAt;
              
              // Ensure _id is correct
              cleanData._id = id;
              
              // Set status to Available
              cleanData.status = 'Available';
              cleanData.maintenanceNote = '';
              
              const newMachine = new Machine(cleanData);
              await newMachine.save();
              
              console.log(`Successfully recreated machine ${id} from backup`);
              
              return res.status(200).json({
                message: 'Machine recreated successfully from backup',
                machine: newMachine
              });
            }
          } else {
            console.log(`No backup found for machine ${id}`);
          }
        }
      } catch (backupError) {
        console.error(`Error restoring machine ${id} from backup:`, backupError);
      }
    }
    
    // SECOND: If we get here, either backup restore failed or wasn't requested
    // Try to restore from original templates (for core machines 1-6)
    if (useTemplate || id >= '1' && id <= '6') {
      console.log(`Attempting to restore core machine ${id} from template`);
      
      let existingMachine;
      if (mongoose.Types.ObjectId.isValid(id)) {
        existingMachine = await Machine.findById(id);
      } else {
        existingMachine = await Machine.findOne({ _id: id });
      }
      
      if (existingMachine) {
        // If the machine is soft-deleted (in maintenance), just restore it
        if (existingMachine.status === 'Maintenance' && 
            existingMachine.maintenanceNote === 'This machine has been temporarily removed.') {
          
          // Restore the machine to available status
          existingMachine.status = 'Available';
          existingMachine.maintenanceNote = '';
          await existingMachine.save();
          
          return res.status(200).json({
            message: 'Machine restored successfully',
            machine: existingMachine
          });
        }
      }
      
      // Import the restore function from seeder
      const { restoreDeletedMachines } = require('../utils/seeds/machineSeeder');
      await restoreDeletedMachines();
      
      // Check if restoration worked
      const restoredMachine = await Machine.findById(id);
      if (restoredMachine) {
        return res.status(200).json({
          message: 'Core machine restored successfully from template',
          machine: restoredMachine
        });
      }
    }
    
    // If we get here, all restoration attempts failed
    return res.status(404).json({ 
      message: 'Machine could not be restored',
      error: 'Restoration failed'
    });
  } catch (error) {
    console.error('Error in restoreMachine:', error);
    res.status(500).json({ 
      message: 'Server error', 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
};
