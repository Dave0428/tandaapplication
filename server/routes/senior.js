/* User-side: ang sariling contacts, appointments, at serbisyo ng naka-login. */
const express = require('express');
const { db } = require('../db');
const { requireAuth } = require('./auth');

const router = express.Router();
router.use(requireAuth);

// GET /api/me/contacts
router.get('/contacts', async (req, res) => {
  try{
    const rows = await db.all(
      'SELECT id, name, phone, relationship FROM emergency_contacts WHERE user_id = ? ORDER BY name',
      [req.user.uid]
    );
    res.json({ rows });
  }catch(err){ console.error('me contacts failed:', err); res.status(500).json({ error:'server error' }); }
});

// GET /api/me/appointments: paparating lang, para sa reminders
router.get('/appointments', async (req, res) => {
  try{
    const now = new Date().toISOString();
    const rows = await db.all(
      `SELECT id, title, starts_at, status, notes FROM appointments
       WHERE user_id = ? AND status = 'scheduled' AND starts_at >= ?
       ORDER BY starts_at ASC LIMIT 20`,
      [req.user.uid, now]
    );
    res.json({ rows });
  }catch(err){ console.error('me appointments failed:', err); res.status(500).json({ error:'server error' }); }
});

// GET /api/me/services: aktibong serbisyo lang
router.get('/services', async (req, res) => {
  try{
    const rows = await db.all(
      "SELECT id, name, category, phone, address, hours FROM services WHERE status = 'active' ORDER BY category, name"
    );
    res.json({ rows });
  }catch(err){ console.error('me services failed:', err); res.status(500).json({ error:'server error' }); }
});

module.exports = router;