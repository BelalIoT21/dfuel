
import { Request, Response } from 'express';
import { User } from '../models/User';
import { Machine } from '../models/Machine';
import mongoose from 'mongoose';

// Helper function to find user by ID
const findUserById = async (userId: string) => {
  // Try to find by MongoDB ID first
  if (mongoose.Types.ObjectId.isValid(userId)) {
    const user = await User.findById(userId);
    if (user) return user;
  }
  
  // If not found or not a valid MongoDB ID, try to find by custom ID
  return await User.findOne({ id: userId });
};

// @desc    Add certification to user
// @route   POST /api/certifications
// @access  Private/Admin
export const addCertification = async (req: Request, res: Response) => {
  try {
    const { userId, machineId } = req.body;
    
    // Validate input
    if (!userId || !machineId) {
      return res.status(400).json({ message: 'User ID and Machine ID are required' });
    }
    
    // Check if machine exists
    const machine = await Machine.findById(machineId);
    if (!machine) {
      return res.status(404).json({ message: 'Machine not found' });
    }
    
    // Check if user exists (using the helper function)
    const user = await findUserById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Check if user already has certification
    if (user.certifications.includes(machineId)) {
      return res.status(400).json({ message: 'User already has this certification' });
    }
    
    // Add certification
    user.certifications.push(machineId);
    await user.save();
    
    res.json({ 
      message: 'Certification added successfully', 
      certifications: user.certifications 
    });
  } catch (error) {
    console.error('Error in addCertification:', error);
    res.status(500).json({ 
      message: 'Server error', 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
};

// @desc    Remove certification from user
// @route   DELETE /api/certifications
// @access  Private/Admin
export const removeCertification = async (req: Request, res: Response) => {
  try {
    const { userId, machineId } = req.body;
    
    // Validate input
    if (!userId || !machineId) {
      return res.status(400).json({ message: 'User ID and Machine ID are required' });
    }
    
    // Check if user exists (using the helper function)
    const user = await findUserById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Check if user has certification
    if (!user.certifications.includes(machineId)) {
      return res.status(400).json({ message: 'User does not have this certification' });
    }
    
    // Remove certification
    user.certifications = user.certifications.filter(cert => cert !== machineId);
    await user.save();
    
    res.json({ 
      message: 'Certification removed successfully', 
      certifications: user.certifications 
    });
  } catch (error) {
    console.error('Error in removeCertification:', error);
    res.status(500).json({ 
      message: 'Server error', 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
};

// @desc    Get user certifications
// @route   GET /api/certifications/user/:userId
// @access  Private/Admin
export const getUserCertifications = async (req: Request, res: Response) => {
  try {
    const user = await findUserById(req.params.userId);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Get machine details for each certification
    const machines = await Machine.find({
      _id: { $in: user.certifications }
    }).select('name type');
    
    res.json(machines);
  } catch (error) {
    console.error('Error in getUserCertifications:', error);
    res.status(500).json({ 
      message: 'Server error', 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
};

// @desc    Check if user has certification
// @route   GET /api/certifications/check
// @access  Private
export const checkCertification = async (req: Request, res: Response) => {
  try {
    const { machineId } = req.query;
    
    if (!machineId) {
      return res.status(400).json({ message: 'Machine ID is required' });
    }
    
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    const hasCertification = user.certifications.includes(machineId as string);
    
    res.json({ hasCertification });
  } catch (error) {
    console.error('Error in checkCertification:', error);
    res.status(500).json({ 
      message: 'Server error', 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
};
