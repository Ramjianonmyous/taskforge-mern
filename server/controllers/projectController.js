const Project = require('../models/Project');

exports.getProjects = async (req, res) => {
  try {
    const projects = await Project.find()
      .populate('members', 'name email avatar')
      .populate('createdBy', 'name email avatar');
    res.json(projects);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching projects', error: err.message });
  }
};

exports.createProject = async (req, res) => {
  try {
    
    const { name, description, members, status } = req.body;
    
    const project = new Project({
      name,
      description,
      members,
      status,
      createdBy: req.userId
    });
    
    await project.save();
    
    const populatedProject = await Project.findById(project._id)
      .populate('members', 'name email avatar')
      .populate('createdBy', 'name email avatar');
      
    res.status(201).json(populatedProject);
  } catch (err) {
    res.status(500).json({ message: 'Error creating project', error: err.message });
  }
};

exports.updateProject = async (req, res) => {
  try {
    
    const project = await Project.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    ).populate('members', 'name email avatar').populate('createdBy', 'name email avatar');
    
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }
    
    res.json(project);
  } catch (err) {
    res.status(500).json({ message: 'Error updating project', error: err.message });
  }
};

exports.deleteProject = async (req, res) => {
  try {
    
    const project = await Project.findByIdAndDelete(req.params.id);
    
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }
    
    res.json({ message: 'Project deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting project', error: err.message });
  }
};
