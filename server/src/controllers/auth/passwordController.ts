
import { Request, Response } from 'express';
import User from '../../models/User';
import bcrypt from 'bcryptjs';

/**
 * Change user password
 * @route POST /api/auth/change-password
 * @access Private
 */
export const changePassword = async (req: Request, res: Response) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    // Validate input
    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Current password and new password are required'
      });
    }

    // Validate new password length
    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false, 
        message: 'New password must be at least 6 characters long'
      });
    }
    
    // Get user from auth middleware
    const user = await User.findById(req.user?.id).select('+password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Check if current password matches
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    
    if (!isMatch) {
      console.log('Password verification failed: Current password is incorrect');
      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }
    
    // Don't hash the password here - User model will handle hashing in the pre-save hook
    user.password = newPassword;
    
    await user.save();
    
    res.status(200).json({
      success: true,
      message: 'Password updated successfully'
    });
  } catch (error) {
    console.error('Error in changePassword controller:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};
