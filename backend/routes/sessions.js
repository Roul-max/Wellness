const express = require('express');
const Session = require('../models/Session');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Get all published sessions (public endpoint)
router.get('/sessions', async (req, res) => {
  try {
    const { page = 1, limit = 20, tags, search } = req.query;
    
    const query = { status: 'published' };
    
    // Add tag filtering
    if (tags) {
      const tagArray = tags.split(',').map(tag => tag.trim().toLowerCase());
      query.tags = { $in: tagArray };
    }
    
    // Add search functionality
    if (search) {
      query.$text = { $search: search };
    }

    const sessions = await Session.find(query)
      .populate('user_id', 'email created_at')
      .sort({ updated_at: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit))
      .lean();

    const total = await Session.countDocuments(query);

    res.json({
      sessions,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalSessions: total,
        hasNextPage: parseInt(page) * parseInt(limit) < total
      }
    });
  } catch (error) {
    console.error('Fetch sessions error:', error);
    res.status(500).json({ error: 'Failed to fetch sessions' });
  }
});

// Get user's own sessions (protected)
router.get('/my-sessions', authenticateToken, async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    
    const query = { user_id: req.user._id };
    if (status && ['draft', 'published'].includes(status)) {
      query.status = status;
    }

    const sessions = await Session.find(query)
      .sort({ updated_at: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit))
      .lean();

    const total = await Session.countDocuments(query);

    res.json({
      sessions,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalSessions: total,
        hasNextPage: parseInt(page) * parseInt(limit) < total
      }
    });
  } catch (error) {
    console.error('Fetch user sessions error:', error);
    res.status(500).json({ error: 'Failed to fetch your sessions' });
  }
});

// Get single user session (protected)
router.get('/my-sessions/:id', authenticateToken, async (req, res) => {
  try {
    const session = await Session.findOne({
      _id: req.params.id,
      user_id: req.user._id
    }).lean();

    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    res.json(session);
  } catch (error) {
    console.error('Fetch session error:', error);
    res.status(500).json({ error: 'Failed to fetch session' });
  }
});

// Save draft session (protected)
router.post('/my-sessions/save-draft', authenticateToken, async (req, res) => {
  try {
    const { id, title, tags, json_file_url } = req.body;

    const sessionData = {
      user_id: req.user._id,
      title: title || 'Untitled Session',
      tags: Array.isArray(tags) ? tags.filter(tag => tag.trim()) : [],
      json_file_url: json_file_url || '',
      status: 'draft'
    };

    let session;
    
    if (id) {
      // Update existing session
      session = await Session.findOneAndUpdate(
        { _id: id, user_id: req.user._id },
        sessionData,
        { new: true, runValidators: true }
      );
      
      if (!session) {
        return res.status(404).json({ error: 'Session not found' });
      }
    } else {
      // Create new session
      session = new Session(sessionData);
      await session.save();
    }

    res.json({
      message: 'Draft saved successfully',
      session
    });
  } catch (error) {
    console.error('Save draft error:', error);
    
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ error: messages.join(', ') });
    }
    
    res.status(500).json({ error: 'Failed to save draft' });
  }
});

// Publish session (protected)
router.post('/my-sessions/publish', authenticateToken, async (req, res) => {
  try {
    const { id, title, tags, json_file_url } = req.body;

    // Validation for publishing
    if (!title || !title.trim()) {
      return res.status(400).json({ error: 'Title is required for publishing' });
    }

    if (!json_file_url || !json_file_url.trim()) {
      return res.status(400).json({ error: 'JSON file URL is required for publishing' });
    }

    const sessionData = {
      user_id: req.user._id,
      title: title.trim(),
      tags: Array.isArray(tags) ? tags.filter(tag => tag.trim()) : [],
      json_file_url: json_file_url.trim(),
      status: 'published'
    };

    let session;
    
    if (id) {
      // Update existing session
      session = await Session.findOneAndUpdate(
        { _id: id, user_id: req.user._id },
        sessionData,
        { new: true, runValidators: true }
      );
      
      if (!session) {
        return res.status(404).json({ error: 'Session not found' });
      }
    } else {
      // Create new session
      session = new Session(sessionData);
      await session.save();
    }

    res.json({
      message: 'Session published successfully',
      session
    });
  } catch (error) {
    console.error('Publish session error:', error);
    
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ error: messages.join(', ') });
    }
    
    res.status(500).json({ error: 'Failed to publish session' });
  }
});

// Delete session (protected)
router.delete('/my-sessions/:id', authenticateToken, async (req, res) => {
  try {
    const session = await Session.findOneAndDelete({
      _id: req.params.id,
      user_id: req.user._id
    });

    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    res.json({ message: 'Session deleted successfully' });
  } catch (error) {
    console.error('Delete session error:', error);
    res.status(500).json({ error: 'Failed to delete session' });
  }
});

module.exports = router;