
import { Request, Response } from 'express';
import { Booking } from '../models/Booking';
import { User } from '../models/User';
import { Machine } from '../models/Machine';
import mongoose from 'mongoose';

// @desc    Create new booking
// @route   POST /api/bookings
// @access  Private
export const createBooking = async (req: Request, res: Response) => {
  try {
    console.log('Booking request received:', req.body);
    const { machineId, date, time } = req.body;
    
    // Validate input
    if (!machineId || !date || !time) {
      return res.status(400).json({ message: 'All fields are required' });
    }
    
    // Check if machine exists
    console.log(`Looking for machine with ID: ${machineId}`);
    const machine = await Machine.findById(machineId).catch(err => {
      console.error('Error finding machine:', err);
      return null;
    });
    
    if (!machine) {
      console.log(`Machine not found with ID: ${machineId}`);
      return res.status(404).json({ message: 'Machine not found' });
    }
    
    // For admin users, bypass machine status check
    if (!req.user.isAdmin) {
      // Check if machine is available for non-admin users
      if (machine.status !== 'Available') {
        return res.status(400).json({ 
          message: `Machine is currently ${machine.status.toLowerCase()}`
        });
      }
    }
    
    // For admin users, bypass certification check
    if (machine.requiresCertification && !req.user.isAdmin) {
      const user = await User.findById(req.user._id);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      if (!user.certifications.includes(machineId)) {
        return res.status(403).json({ 
          message: 'Certification required to book this machine'
        });
      }
    }
    
    // For admin users, bypass booking slot check
    if (!req.user.isAdmin) {
      // Check if booking slot is available for non-admin users
      const bookingDate = new Date(date);
      const existingBooking = await Booking.findOne({
        machine: machineId,
        date: {
          $gte: new Date(bookingDate.setHours(0, 0, 0, 0)),
          $lt: new Date(bookingDate.setHours(23, 59, 59, 999))
        },
        time,
        status: { $in: ['Pending', 'Approved'] }
      });
      
      if (existingBooking) {
        return res.status(400).json({ message: 'This time slot is already booked' });
      }
    }
    
    // Create booking
    console.log('Creating new booking');
    const booking = new Booking({
      user: req.user._id,
      machine: machineId,
      date,
      time,
      // Auto-approve bookings made by admins
      status: req.user.isAdmin ? 'Approved' : 'Pending'
    });
    
    const createdBooking = await booking.save();
    console.log('Booking created successfully:', createdBooking);
    
    // Add booking to user's bookings array
    await User.findByIdAndUpdate(
      req.user._id,
      { $push: { bookings: createdBooking._id } }
    );
    
    res.status(201).json({
      success: true,
      booking: createdBooking
    });
  } catch (error) {
    console.error('Error in createBooking:', error);
    res.status(500).json({ 
      message: 'Server error', 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
};

// @desc    Get user bookings
// @route   GET /api/bookings
// @access  Private
export const getUserBookings = async (req: Request, res: Response) => {
  try {
    const bookings = await Booking.find({ user: req.user._id })
      .populate('machine', 'name type')
      .sort({ date: -1 });
    
    res.json(bookings);
  } catch (error) {
    console.error('Error in getUserBookings:', error);
    res.status(500).json({ 
      message: 'Server error', 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
};

// @desc    Get booking by ID
// @route   GET /api/bookings/:id
// @access  Private
export const getBookingById = async (req: Request, res: Response) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('machine', 'name type status')
      .populate('user', 'name email');
    
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }
    
    // Check if booking belongs to user or user is admin
    if (booking.user._id.toString() !== req.user._id.toString() && !req.user.isAdmin) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    
    res.json(booking);
  } catch (error) {
    console.error('Error in getBookingById:', error);
    res.status(500).json({ 
      message: 'Server error', 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
};

// @desc    Update booking status
// @route   PUT /api/bookings/:id/status
// @access  Private/Admin
export const updateBookingStatus = async (req: Request, res: Response) => {
  try {
    const { status } = req.body;
    
    if (!status) {
      return res.status(400).json({ message: 'Status is required' });
    }
    
    const booking = await Booking.findById(req.params.id);
    
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }
    
    booking.status = status;
    const updatedBooking = await booking.save();
    
    res.json(updatedBooking);
  } catch (error) {
    console.error('Error in updateBookingStatus:', error);
    res.status(500).json({ 
      message: 'Server error', 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
};

// @desc    Cancel booking
// @route   PUT /api/bookings/:id/cancel
// @access  Private
export const cancelBooking = async (req: Request, res: Response) => {
  try {
    const booking = await Booking.findById(req.params.id);
    
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }
    
    // Check if booking belongs to user
    if (booking.user.toString() !== req.user._id.toString() && !req.user.isAdmin) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    
    // Only allow cancellation of pending or approved bookings
    if (booking.status === 'Completed' || booking.status === 'Canceled') {
      return res.status(400).json({ 
        message: `Cannot cancel booking with status: ${booking.status}` 
      });
    }
    
    booking.status = 'Canceled';
    const updatedBooking = await booking.save();
    
    res.json(updatedBooking);
  } catch (error) {
    console.error('Error in cancelBooking:', error);
    res.status(500).json({ 
      message: 'Server error', 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
};

// @desc    Get all bookings
// @route   GET /api/bookings/all
// @access  Private/Admin
export const getAllBookings = async (req: Request, res: Response) => {
  try {
    const bookings = await Booking.find({})
      .populate('machine', 'name type')
      .populate('user', 'name email')
      .sort({ date: -1 });
    
    res.json(bookings);
  } catch (error) {
    console.error('Error in getAllBookings:', error);
    res.status(500).json({ 
      message: 'Server error', 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
};
