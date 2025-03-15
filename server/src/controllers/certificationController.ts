
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

// Helper function to normalize machine IDs
const normalizeMachineId = (machineId: string) => {
  // Special case mappings for hardcoded IDs
  if (machineId === "1") return "67d5658be9267b302f7aa015";
  if (machineId === "2") return "67d5658be9267b302f7aa016";
  if (machineId === "3") return "67d5658be9267b302f7aa017";
  if (machineId === "4") return "67d5658be9267b302f7aa018";
  if (machineId === "5") return "67d5658be9267b302f7aa019";
  if (machineId === "6") return "67d5658be9267b302f7aa01a"; // Safety course
  
  return machineId;
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
    
    // Check if user exists (using the helper function)
    const user = await findUserById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Normalize the machine ID
    const normalizedMachineId = normalizeMachineId(machineId);
    
    // Check if user already has certification
    if (user.certifications.includes(normalizedMachineId)) {
      return res.json({ 
        message: 'User already has this certification', 
        certifications: user.certifications,
        success: true
      });
    }
    
    // Add certification
    user.certifications.push(normalizedMachineId);
    await user.save();
    
    res.json({ 
      message: 'Certification added successfully', 
      certifications: user.certifications,
      success: true
    });
  } catch (error) {
    console.error('Error in addCertification:', error);
    res.status(500).json({ 
      message: 'Server error', 
      error: error instanceof Error ? error.message : 'Unknown error',
      success: false 
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
    
    // Normalize the machine ID
    const normalizedMachineId = normalizeMachineId(machineId);
    
    // Check if user has certification
    if (!user.certifications.includes(normalizedMachineId)) {
      return res.status(400).json({ message: 'User does not have this certification' });
    }
    
    // Remove certification
    user.certifications = user.certifications.filter(cert => cert !== normalizedMachineId);
    await user.save();
    
    res.json({ 
      message: 'Certification removed successfully', 
      certifications: user.certifications,
      success: true
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
    const certifications = user.certifications.map(cert => {
      // Convert MongoDB ObjectIds to strings
      return cert.toString();
    });
    
    res.json(certifications);
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
    
    // Normalize the machine ID
    const normalizedMachineId = normalizeMachineId(machineId as string);
    
    const hasCertification = user.certifications.includes(normalizedMachineId);
    
    res.json({ hasCertification });
  } catch (error) {
    console.error('Error in checkCertification:', error);
    res.status(500).json({ 
      message: 'Server error', 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
};
