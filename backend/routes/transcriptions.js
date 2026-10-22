const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const { transcriptionQueries, sessionQueries } = require('../database');

// Helper: parse tags
const parseTags = (tags) => {
  try {
    return JSON.parse(tags || '[]');
  } catch {
    return [];
  }
};

// GET /api/transcriptions - Get all transcriptions
router.get('/', (req, res) => {
  try {
    const { search, favorite } = req.query;
    let transcriptions;

    if (search) {
      transcriptions = transcriptionQueries.search.all(`%${search}%`, `%${search}%`);
    } else {
      transcriptions = transcriptionQueries.findAll.all();
    }

    // Parse tags for each transcription
    const formatted = transcriptions.map(t => ({
      ...t,
      tags: parseTags(t.tags),
      is_favorite: Boolean(t.is_favorite)
    }));

    res.json({ success: true, data: formatted, count: formatted.length });
  } catch (error) {
    console.error('Error fetching transcriptions:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/transcriptions/stats - Get stats
router.get('/stats', (req, res) => {
  try {
    const stats = transcriptionQueries.getStats.get();
    const recent = transcriptionQueries.getRecent.all().map(t => ({
      ...t,
      tags: parseTags(t.tags),
      is_favorite: Boolean(t.is_favorite)
    }));
    res.json({ success: true, data: { ...stats, recent } });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/transcriptions/:id - Get single transcription
router.get('/:id', (req, res) => {
  try {
    const transcription = transcriptionQueries.findById.get(req.params.id);
    if (!transcription) {
      return res.status(404).json({ success: false, error: 'Transcription not found' });
    }
    res.json({
      success: true,
      data: {
        ...transcription,
        tags: parseTags(transcription.tags),
        is_favorite: Boolean(transcription.is_favorite)
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/transcriptions - Create transcription
router.post('/', (req, res) => {
  try {
    const { title, content, language = 'en-IN', duration_seconds = 0, tags = [] } = req.body;

    if (!title || !content) {
      return res.status(400).json({ success: false, error: 'Title and content are required' });
    }

    const id = uuidv4();
    const word_count = content.trim().split(/\s+/).filter(Boolean).length;

    transcriptionQueries.create.run(
      id,
      title,
      content,
      language,
      duration_seconds,
      word_count,
      JSON.stringify(tags),
      0
    );

    const created = transcriptionQueries.findById.get(id);
    res.status(201).json({
      success: true,
      data: { ...created, tags: parseTags(created.tags), is_favorite: Boolean(created.is_favorite) },
      message: 'Transcription saved successfully'
    });
  } catch (error) {
    console.error('Error creating transcription:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// PUT /api/transcriptions/:id - Update transcription
router.put('/:id', (req, res) => {
  try {
    const existing = transcriptionQueries.findById.get(req.params.id);
    if (!existing) {
      return res.status(404).json({ success: false, error: 'Transcription not found' });
    }

    const {
      title = existing.title,
      content = existing.content,
      language = existing.language,
      tags = parseTags(existing.tags),
      is_favorite = Boolean(existing.is_favorite)
    } = req.body;

    transcriptionQueries.update.run(
      title,
      content,
      language,
      JSON.stringify(tags),
      is_favorite ? 1 : 0,
      req.params.id
    );

    const updated = transcriptionQueries.findById.get(req.params.id);
    res.json({
      success: true,
      data: { ...updated, tags: parseTags(updated.tags), is_favorite: Boolean(updated.is_favorite) },
      message: 'Transcription updated successfully'
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// PATCH /api/transcriptions/:id/favorite - Toggle favorite
router.patch('/:id/favorite', (req, res) => {
  try {
    const existing = transcriptionQueries.findById.get(req.params.id);
    if (!existing) {
      return res.status(404).json({ success: false, error: 'Transcription not found' });
    }

    transcriptionQueries.toggleFavorite.run(req.params.id);
    const updated = transcriptionQueries.findById.get(req.params.id);
    res.json({
      success: true,
      data: { ...updated, tags: parseTags(updated.tags), is_favorite: Boolean(updated.is_favorite) },
      message: `${updated.is_favorite ? 'Added to' : 'Removed from'} favorites`
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// DELETE /api/transcriptions/:id - Delete transcription
router.delete('/:id', (req, res) => {
  try {
    const existing = transcriptionQueries.findById.get(req.params.id);
    if (!existing) {
      return res.status(404).json({ success: false, error: 'Transcription not found' });
    }

    transcriptionQueries.delete.run(req.params.id);
    res.json({ success: true, message: 'Transcription deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
