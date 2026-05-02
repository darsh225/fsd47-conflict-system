const express = require('express');
const router = express.Router();
const Record = require('../models/Record');
const Conflict = require('../models/Conflict');
const { protect, adminOnly } = require('../middleware/auth');

// GET /api/records — All authenticated users can list records
router.get('/', protect, async (req, res) => {
  try {
    const records = await Record.find().sort({ updatedAt: -1 });
    res.json({ records });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch records.', error: err.message });
  }
});

// GET /api/records/:id — Get a single record
router.get('/:id', protect, async (req, res) => {
  try {
    const record = await Record.findById(req.params.id);
    if (!record) return res.status(404).json({ message: 'Record not found.' });
    res.json({ record });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch record.', error: err.message });
  }
});

// POST /api/records — Admin creates a new record
router.post('/', protect, adminOnly, async (req, res) => {
  try {
    const { title, content } = req.body;
    if (!title || !content) {
      return res.status(400).json({ message: 'Title and content are required.' });
    }

    const record = await Record.create({
      title,
      content,
      version: 1,
      createdBy: req.user._id,
      createdByUsername: req.user.username,
      lastUpdatedBy: req.user._id,
      lastUpdatedByUsername: req.user.username
    });

    res.status(201).json({ message: 'Record created successfully.', record });
  } catch (err) {
    res.status(500).json({ message: 'Failed to create record.', error: err.message });
  }
});

// PUT /api/records/:id — Update with CONFLICT DETECTION (optimistic locking)
router.put('/:id', protect, async (req, res) => {
  try {
    const { title, content, clientVersion } = req.body;

    if (clientVersion === undefined || clientVersion === null) {
      return res.status(400).json({ message: 'clientVersion is required to detect conflicts.' });
    }

    if (!title || !content) {
      return res.status(400).json({ message: 'Title and content are required.' });
    }

    // Fetch the current record from DB
    const record = await Record.findById(req.params.id);
    if (!record) return res.status(404).json({ message: 'Record not found.' });

    // ⚡ CONFLICT DETECTION: Compare client version to server version
    if (record.version !== Number(clientVersion)) {
      // Save the conflict to DB
      const conflict = await Conflict.create({
        recordId: record._id,
        recordTitle: record.title,
        attemptedBy: req.user._id,
        attemptedByUsername: req.user.username,
        clientVersion: Number(clientVersion),
        serverVersion: record.version,
        attemptedData: { title, content },
        conflictedWithUsername: record.lastUpdatedByUsername,
        status: 'rejected'
      });

      return res.status(409).json({
        message: 'Conflict detected! This record was modified by another user since you last read it.',
        conflict: {
          conflictId: conflict._id,
          yourVersion: clientVersion,
          currentVersion: record.version,
          lastUpdatedBy: record.lastUpdatedByUsername,
          lastUpdatedAt: record.updatedAt,
          currentTitle: record.title,
          currentContent: record.content
        }
      });
    }

    // No conflict — apply the update and increment version
    record.title = title;
    record.content = content;
    record.version = record.version + 1;
    record.lastUpdatedBy = req.user._id;
    record.lastUpdatedByUsername = req.user.username;
    await record.save();

    res.json({
      message: 'Record updated successfully.',
      record
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to update record.', error: err.message });
  }
});

// DELETE /api/records/:id — Admin only
router.delete('/:id', protect, adminOnly, async (req, res) => {
  try {
    const record = await Record.findByIdAndDelete(req.params.id);
    if (!record) return res.status(404).json({ message: 'Record not found.' });
    res.json({ message: 'Record deleted successfully.' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete record.', error: err.message });
  }
});

module.exports = router;
