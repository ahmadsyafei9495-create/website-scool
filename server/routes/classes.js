const express = require('express');
const { db } = require('../db');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

router.get('/', authenticate, authorize('superadmin','admin','guru'), (req, res) => {
  db.all('SELECT * FROM classes', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

router.post('/', authenticate, authorize('superadmin','admin'), (req, res) => {
  const { name, wali } = req.body;
  db.run('INSERT INTO classes (name,wali) VALUES (?,?)', [name,wali], function(err){
    if (err) return res.status(500).json({ error: err.message });
    res.json({ id: this.lastID });
  });
});

module.exports = router;
