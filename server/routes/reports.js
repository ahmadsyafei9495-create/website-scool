const express = require('express');
const { db } = require('../db');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

router.get('/students', authenticate, authorize('superadmin','admin'), (req, res) => {
  db.all('SELECT * FROM students', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

router.get('/finance/summary', authenticate, authorize('superadmin','admin','keuangan'), (req, res) => {
  db.get('SELECT COUNT(*) as count, IFNULL(SUM(amount),0) as total FROM finance', [], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(row);
  });
});

module.exports = router;
