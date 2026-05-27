const express = require('express');
const Project = require('../models/Project');
const router = express.Router();

// Get all projects
router.get('/', async (req, res) => {
    try {
        const projects = await Project.find();
        res.json(projects);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get projects by owner email
router.get('/owner/:email', async (req, res) => {
    try {
        const projects = await Project.find({ ownerEmail: req.params.email });
        res.json(projects);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get projects by contributor email
router.get('/contributor/:email', async (req, res) => {
    try {
        const projects = await Project.find({ 'contributors.email': req.params.email });
        res.json(projects);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get single project by ID
router.get('/:id', async (req, res) => {
    try {
        const project = await Project.findById(req.params.id);
        if (!project) {
            return res.status(404).json({ message: 'Project not found' });
        }
        res.json(project);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Create new project
router.post('/', async (req, res) => {
    try {
        const { projectName, domain, difficulty, description, ownerEmail } = req.body;
        
        const project = new Project({
            projectName,
            domain,
            difficulty,
            description,
            ownerEmail,
            contributors: []
        });
        
        const newProject = await project.save();
        res.status(201).json(newProject);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Add contributor to project
router.post('/:id/contributors', async (req, res) => {
    try {
        const { email } = req.body;
        const project = await Project.findById(req.params.id);
        
        if (!project) {
            return res.status(404).json({ message: 'Project not found' });
        }
        
        // Check if contributor already exists
        const existingContributor = project.contributors.find(c => c.email === email);
        if (!existingContributor) {
            project.contributors.push({ email, joinedAt: new Date() });
            await project.save();
        }
        
        res.json(project);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Update project status
router.put('/:id/status', async (req, res) => {
    try {
        const { status } = req.body;
        const project = await Project.findById(req.params.id);
        
        if (!project) {
            return res.status(404).json({ message: 'Project not found' });
        }
        
        project.status = status;
        const updatedProject = await project.save();
        res.json(updatedProject);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

module.exports = router;