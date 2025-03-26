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
      
      let imageUrl = machineObj.imageUrl || '';
      
      if ((!imageUrl || imageUrl === '') && machineObj._id in DEFAULT_MACHINE_IMAGES) {
        imageUrl = DEFAULT_MACHINE_IMAGES[machineObj._id];
      }
      
      if (imageUrl && !imageUrl.startsWith('/') && !imageUrl.startsWith('http')) {
        imageUrl = '/' + imageUrl;
      }
      
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
    
    let imageUrl = machineObj.imageUrl || '';
    
    if ((!imageUrl || imageUrl === '') && id in DEFAULT_MACHINE_IMAGES) {
      imageUrl = DEFAULT_MACHINE_IMAGES[id as keyof typeof DEFAULT_MACHINE_IMAGES];
    }
    
    if (imageUrl && !imageUrl.startsWith('/') && !imageUrl.startsWith('http')) {
      imageUrl = '/' + imageUrl;
    }

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
      specifications = '',
      details = '',
      certificationInstructions = '',
      linkedCourseId = '',
      linkedQuizId = ''
    } = req.body;

    let normalizedImageUrl = imageUrl;
    if (normalizedImageUrl && !normalizedImageUrl.startsWith('/') && !normalizedImageUrl.startsWith('http')) {
      normalizedImageUrl = '/' + normalizedImageUrl;
    }

    const machines = await Machine.find({}, '_id').sort({ _id: -1 });
    let nextId = '7';
    
    if (machines.length > 0) {
      const highestId = machines[0]._id;
      console.log("Highest existing ID:", highestId);
      
      if (!isNaN(Number(highestId))) {
        nextId = String(Number(highestId) + 1);
      }
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
      bookedTimeSlots: []
    });

    const createdMachine = await machine.save();
    console.log(`Created new machine: ${name} with ID: ${createdMachine._id}`);

    let finalImageUrl = normalizedImageUrl || '';
    if ((!finalImageUrl || finalImageUrl === '') && createdMachine._id in DEFAULT_MACHINE_IMAGES) {
      finalImageUrl = DEFAULT_MACHINE_IMAGES[createdMachine._id as keyof typeof DEFAULT_MACHINE_IMAGES];
    }

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
      
      // IMPORTANT: Never clear linkedCourseId or linkedQuizId when requiresCertification is turned off
      // Only clear them if they are explicitly set to null, empty string, or 'none'
    }
    
    if (difficulty !== undefined) machine.difficulty = difficulty;
    
    const finalImageUrl = imageUrl || image || machine.imageUrl;
    if (finalImageUrl !== undefined) {
      machine.imageUrl = finalImageUrl;
      console.log(`Updated image URL for machine ${id} to: ${finalImageUrl}`);
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
    
    let normalizedImageUrl = updatedMachine.imageUrl || '';
    if (normalizedImageUrl && !normalizedImageUrl.startsWith('/') && !normalizedImageUrl.startsWith('http')) {
      normalizedImageUrl = '/' + normalizedImageUrl;
    }

    res.status(200).json({ 
      message: 'Machine updated successfully', 
      machine: {
        ...updatedMachine.toObject(),
        status: updatedMachine.status === 'In Use' ? 'in-use' : updatedMachine.status.toLowerCase(),
        imageUrl: normalizedImageUrl,
        image: normalizedImageUrl
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
    console.log(`Finding users with certification for machine ${machineId}`);
    
    try {
      const updateResult = await User.updateMany(
        { certifications: machineId },
        { $pull: { certifications: machineId } }
      );
      
      console.log(`Removed certification ${machineId} from ${updateResult.modifiedCount} users`);
      
      const dateUpdateResult = await User.updateMany(
        {},
        { $unset: { [`certificationDates.${machineId}`]: "" } }
      );
      
      console.log(`Removed certification dates for machine ${machineId} from ${dateUpdateResult.modifiedCount} users`);
    } catch (error) {
      console.error("Error removing certifications:", error);
    }

    await machine.deleteOne();

    res.status(200).json({ message: 'Machine deleted successfully' });
  } catch (error) {
    console.error('Error in deleteMachine:', error);
    res.status(500).json({ message: 'Server error', error: error instanceof Error ? error.message : 'Unknown error' });
  }
};
