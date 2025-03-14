
import { Request, Response } from 'express';
import { User } from '../../models/User';

// @desc    Request password reset
// @route   POST /api/auth/forgot-password
// @access  Public
export const forgotPassword = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Generate reset code (6 digits)
    const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Set expiry (1 hour from now)
    const expiry = new Date();
    expiry.setHours(expiry.getHours() + 1);

    // Save reset code to user
    user.resetCode = {
      code: resetCode,
      expiry: expiry,
    };
    await user.save();

    // In a real app, we would send an email here
    console.log(`Reset code for ${email}: ${resetCode}`);

    res.json({ message: 'Password reset code sent to your email' });
  } catch (error) {
    console.error('Error in forgotPassword:', error);
    res.status(500).json({ 
      message: 'Server error', 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
};

// @desc    Reset password with code
// @route   POST /api/auth/reset-password
// @access  Public
export const resetPassword = async (req: Request, res: Response) => {
  try {
    const { email, resetCode, newPassword } = req.body;

    // Validate input
    if (!email || !resetCode || !newPassword) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    // Find user
    const user = await User.findOne({ email });
    if (!user || !user.resetCode) {
      return res.status(400).json({ message: 'Invalid or expired reset code' });
    }

    // Check if code matches and is not expired
    if (user.resetCode.code !== resetCode || new Date() > user.resetCode.expiry) {
      return res.status(400).json({ message: 'Invalid or expired reset code' });
    }

    // Update password and clear reset code
    user.password = newPassword;
    user.resetCode = undefined;
    await user.save();

    res.json({ message: 'Password has been reset successfully' });
  } catch (error) {
    console.error('Error in resetPassword:', error);
    res.status(500).json({ 
      message: 'Server error', 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
};
