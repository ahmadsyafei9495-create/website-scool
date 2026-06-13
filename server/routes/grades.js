const express = require('express');
const { db } = require('../db');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

router.get('/student/:id', authenticate, authorize('superadmin','admin','guru','siswa'), (req, res) => {
  db.all('SELECT * FROM grades WHERE student_id = ?', [req.params.id], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

router.post('/', authenticate, authorize('superadmin','admin','guru'), (req, res) => {
  const { student_id, subject, score, term } = req.body;
  db.run('INSERT INTO grades (student_id,subject,score,term) VALUES (?,?,?,?)', [student_id,subject,score,term], function(err){
    if (err) return res.status(500).json({ error: err.message });
    res.json({ id: this.lastID });
  });
});

module.exports = router;
