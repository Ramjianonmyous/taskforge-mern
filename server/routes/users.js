const express = require('express');
const User = require('../models/User');
const Task = require('../models/Task');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');

const router = express.Router();

// Get all users
router.get('/', authMiddleware, async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get user by ID
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update user profile
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    // Users can only update their own profile
    if (req.userId !== req.params.id && req.userRole !== 'admin') {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    const { name, email, department, avatar } = req.body;

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { name, email, department, avatar },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Delete user (admin only)
router.delete('/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    // Can't delete yourself
    if (req.userId === req.params.id) {
      return res.status(400).json({ message: 'Cannot delete your own account' });
    }

    const user = await User.findByIdAndDelete(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Unassign tasks from deleted user
    await Task.updateMany(
      { assignee: req.params.id },
      { assignee: null }
    );

    res.json({ message: 'User deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get user statistics
router.get('/:id/stats', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const assignedTasks = await Task.countDocuments({ assignee: req.params.id });
    const completedTasks = await Task.countDocuments({
      assignee: req.params.id,
      status: 'done',
    });
    const inProgressTasks = await Task.countDocuments({
      assignee: req.params.id,
      status: 'in-progress',
    });

    res.json({
      assignedTasks,
      completedTasks,
      inProgressTasks,
      completionRate: assignedTasks > 0 ? ((completedTasks / assignedTasks) * 100).toFixed(1) : 0,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
