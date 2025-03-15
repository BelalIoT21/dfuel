
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
    const { machineId, date, time } = req.body;
    
    // Validate input
    if (!machineId || !date || !time) {
      return res.status(400).json({ message: 'All fields are required' });
    }
    
    // Check if machine exists
    const machine = await Machine.findById(machineId);
    if (!machine) {
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
    
    // Format the date-time slot string
    const dateObj = new Date(date);
    const formattedDate = dateObj.toISOString().split('T')[0];
    const timeSlot = `${formattedDate}-${time}`;
    
    // For admin users, bypass booking slot check
    if (!req.user.isAdmin) {
      // Check if the time slot is already booked
      if (machine.bookedTimeSlots.includes(timeSlot)) {
        return res.status(400).json({ message: 'This time slot is already booked' });
      }
      
      // Also check if there's any active booking for this slot
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
    const booking = new Booking({
      user: req.user._id,
      machine: machineId,
      date,
      time,
      // Auto-approve bookings made by admins
      status: req.user.isAdmin ? 'Approved' : 'Pending'
    });
    
    const createdBooking = await booking.save();
    console.log('Created booking in MongoDB:', createdBooking);
    
    // If admin auto-approved, add to machine's booked time slots
    if (req.user.isAdmin) {
      await machine.addBookedTimeSlot(timeSlot);
    }
    
    // Add booking reference to user's bookings array
    await User.findByIdAndUpdate(
      req.user._id,
      { $push: { bookings: createdBooking._id } }
    );
    
    res.status(201).json(createdBooking);
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
    console.log('Fetching bookings for user:', req.user._id);
    const bookings = await Booking.find({ user: req.user._id })
      .populate('machine', 'name type')
      .sort({ date: -1 });
    
    console.log('Found bookings:', bookings.length);
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
    const populatedUser = booking.user as any;
    if (populatedUser._id.toString() !== req.user._id.toString() && !req.user.isAdmin) {
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
    
    console.log(`Updating booking ${req.params.id} status to ${status}`);
    
    // Validate status value
    if (!['Pending', 'Approved', 'Completed', 'Canceled', 'Rejected'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status value' });
    }
    
    const booking = await Booking.findById(req.params.id);
    
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }
    
    const machine = await Machine.findById(booking.machine);
    if (!machine) {
      return res.status(404).json({ message: 'Machine not found' });
    }
    
    // Format the date-time slot string
    const dateObj = new Date(booking.date);
    const formattedDate = dateObj.toISOString().split('T')[0];
    const timeSlot = `${formattedDate}-${booking.time}`;
    
    // If status is changing to Approved, check if the time slot is already taken by another approved booking
    if (status === 'Approved' && booking.status !== 'Approved') {
      const bookingDate = new Date(booking.date);
      const conflictingBooking = await Booking.findOne({
        machine: booking.machine,
        date: {
          $gte: new Date(bookingDate.setHours(0, 0, 0, 0)),
          $lt: new Date(bookingDate.setHours(23, 59, 59, 999))
        },
        time: booking.time,
        status: 'Approved',
        _id: { $ne: booking._id } // Exclude the current booking
      });
      
      if (conflictingBooking) {
        return res.status(400).json({ 
          message: 'This time slot is already booked by another approved booking'
        });
      }
      
      // Add the booked time slot to the machine
      await machine.addBookedTimeSlot(timeSlot);
    }
    
    // If status is changing from Approved to something else, remove the booked time slot
    if (booking.status === 'Approved' && status !== 'Approved') {
      await machine.removeBookedTimeSlot(timeSlot);
    }
    
    booking.status = status;
    const updatedBooking = await booking.save();
    
    console.log('Updated booking status in MongoDB:', updatedBooking);
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
    
    // If the booking was approved, free up the time slot
    if (booking.status === 'Approved') {
      const machine = await Machine.findById(booking.machine);
      if (machine) {
        const dateObj = new Date(booking.date);
        const formattedDate = dateObj.toISOString().split('T')[0];
        const timeSlot = `${formattedDate}-${booking.time}`;
        await machine.removeBookedTimeSlot(timeSlot);
      }
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
    console.log('Fetching all bookings for admin');
    const bookings = await Booking.find({})
      .populate({
        path: 'machine',
        select: 'name type'
      })
      .populate({
        path: 'user',
        select: 'name email'
      })
      .sort({ date: -1 });
    
    // Format the response to include machine name and user name
    const formattedBookings = bookings.map(booking => {
      // Use type assertions to access populated fields
      const machineDoc = booking.machine as any;
      const userDoc = booking.user as any;
      
      return {
        _id: booking._id,
        machineId: booking.machine,
        machineName: machineDoc && machineDoc.name ? machineDoc.name : 'Unknown Machine',
        machineType: machineDoc && machineDoc.type ? machineDoc.type : 'Unknown Type',
        userId: booking.user,
        userName: userDoc && userDoc.name ? userDoc.name : 'Unknown User',
        userEmail: userDoc && userDoc.email ? userDoc.email : 'Unknown Email',
        date: booking.date,
        time: booking.time,
        status: booking.status,
        createdAt: booking.createdAt,
        updatedAt: booking.updatedAt
      };
    });
    
    console.log('Found total bookings:', bookings.length);
    res.json(formattedBookings);
  } catch (error) {
    console.error('Error in getAllBookings:', error);
    res.status(500).json({ 
      message: 'Server error', 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
};
