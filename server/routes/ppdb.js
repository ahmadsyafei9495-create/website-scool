const express = require('express');
const { db } = require('../db');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

router.post('/apply', (req, res) => {
  const { name, birthdate } = req.body;
  db.run('INSERT INTO ppdb (name,birthdate,status) VALUES (?,?,?)', [name,birthdate,'pending'], function(err){
    if (err) return res.status(500).json({ error: err.message });
    res.json({ id: this.lastID });
  });
});

router.get('/list', authenticate, authorize('superadmin','admin'), (req, res) => {
  db.all('SELECT * FROM ppdb', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

router.post('/decide/:id', authenticate, authorize('superadmin','admin'), (req, res) => {
  const { status } = req.body;
  db.run('UPDATE ppdb SET status=? WHERE id=?', [status, req.params.id], function(err){
    if (err) return res.status(500).json({ error: err.message });
    res.json({ changed: this.changes });
  });
});

module.exports = router;
