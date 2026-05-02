const express = require('express');
const router = express.Router();
const Conflict = require('../models/Conflict');
const { protect, adminOnly } = require('../middleware/auth');

// GET /api/conflicts — Admin views all conflict history
router.get('/', protect, adminOnly, async (req, res) => {
  try {
    const conflicts = await Conflict.find()
      .sort({ createdAt: -1 })
      .populate('recordId', 'title version')
      .populate('attemptedBy', 'username email');

    res.json({ conflicts, total: conflicts.length });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch conflicts.', error: err.message });
  }
});

// GET /api/conflicts/record/:recordId — Conflicts for a specific record
router.get('/record/:recordId', protect, adminOnly, async (req, res) => {
  try {
    const conflicts = await Conflict.find({ recordId: req.params.recordId })
      .sort({ createdAt: -1 });

    res.json({ conflicts, total: conflicts.length });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch record conflicts.', error: err.message });
  }
});

module.exports = router;
