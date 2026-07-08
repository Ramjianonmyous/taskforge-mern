const express = require('express');
const Project = require('../models/Project');
const Task = require('../models/Task');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

// Get all projects with members and tasks
router.get('/', authMiddleware, async (req, res) => {
  try {
    const projects = await Project.find().populate('members', 'name email avatar role department');
    const projectList = [];

    for (let project of projects) {
      const tasks = await Task.find({ project: project._id }).populate('assignee', 'name email avatar role department');
      projectList.push({
        ...project.toJSON(),
        tasks,
      });
    }

    res.json(projectList);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create project
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { name, description, status, startDate, endDate, members } = req.body;
    const project = new Project({
      name,
      description,
      status: status || 'ongoing',
      startDate,
      endDate,
      members: members || [],
    });
    await project.save();
    res.status(201).json(project);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update project
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { name, description, status, startDate, endDate, members } = req.body;
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    if (name) project.name = name;
    if (description !== undefined) project.description = description;
    if (status) project.status = status;
    if (startDate) project.startDate = startDate;
    if (endDate) project.endDate = endDate;
    if (members) project.members = members;

    await project.save();
    res.json(project);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Delete project
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }
    
    // Unlink tasks associated with this project
    await Task.updateMany({ project: project._id }, { project: null });

    await project.deleteOne();
    res.json({ message: 'Project deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
