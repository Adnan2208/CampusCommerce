import Grievance from '../models/Grievance.js';
import User from '../models/User.js';

// Submit a new grievance
export const submitGrievance = async (req, res) => {
  try {
    const { subject, category, description, priority } = req.body;
    
    // Get user details from database
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Prevent admins from submitting grievances
    if (user.isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Admins cannot submit grievances. Please use your admin account to manage user grievances only.'
      });
    }
    
    const grievance = new Grievance({
      userId: user._id,
      userName: user.name,
      userEmail: user.email,
      subject,
      category,
      description,
      priority: priority || 'Medium'
    });

    await grievance.save();

    res.status(201).json({
      success: true,
      message: 'Grievance submitted successfully. We will review it soon.',
      grievance
    });
  } catch (error) {
    console.error('Error submitting grievance:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit grievance',
      error: error.message
    });
  }
};

// Get all grievances (Admin only)
export const getAllGrievances = async (req, res) => {
  try {
    // Get user details from database to check admin status
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if user is admin
    if (!user.isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin only.'
      });
    }

    const grievances = await Grievance.find()
      .sort({ createdAt: -1 })
      .populate('userId', 'name email');

    res.json({
      success: true,
      grievances
    });
  } catch (error) {
    console.error('Error fetching grievances:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch grievances',
      error: error.message
    });
  }
};

// Get user's own grievances
export const getMyGrievances = async (req, res) => {
  try {
    const grievances = await Grievance.find({ userId: req.user.userId })
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      grievances
    });
  } catch (error) {
    console.error('Error fetching user grievances:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch your grievances',
      error: error.message
    });
  }
};

// Update grievance status (Admin only)
export const updateGrievanceStatus = async (req, res) => {
  try {
    // Get user details from database to check admin status
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (!user.isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin only.'
      });
    }

    const { grievanceId } = req.params;
    const { status, adminNotes, priority } = req.body;

    const updateData = {};
    if (status) updateData.status = status;
    if (adminNotes !== undefined) updateData.adminNotes = adminNotes;
    if (priority) updateData.priority = priority;
    
    if (status === 'Resolved' || status === 'Closed') {
      updateData.resolvedAt = new Date();
    }

    const grievance = await Grievance.findByIdAndUpdate(
      grievanceId,
      updateData,
      { new: true }
    );

    if (!grievance) {
      return res.status(404).json({
        success: false,
        message: 'Grievance not found'
      });
    }

    res.json({
      success: true,
      message: 'Grievance updated successfully',
      grievance
    });
  } catch (error) {
    console.error('Error updating grievance:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update grievance',
      error: error.message
    });
  }
};

// Delete grievance (Admin only)
export const deleteGrievance = async (req, res) => {
  try {
    // Get user details from database to check admin status
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (!user.isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin only.'
      });
    }

    const { grievanceId } = req.params;
    const grievance = await Grievance.findByIdAndDelete(grievanceId);

    if (!grievance) {
      return res.status(404).json({
        success: false,
        message: 'Grievance not found'
      });
    }

    res.json({
      success: true,
      message: 'Grievance deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting grievance:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete grievance',
      error: error.message
    });
  }
};
