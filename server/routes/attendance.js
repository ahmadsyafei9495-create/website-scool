const express = require('express');
const { db } = require('../db');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

router.post('/', authenticate, authorize('superadmin','admin','guru'), (req, res) => {
  const { student_id, date, status } = req.body;
  db.run('INSERT INTO attendance (student_id,date,status) VALUES (?,?,?)', [student_id,date,status], function(err){
    if (err) return res.status(500).json({ error: err.message });
    res.json({ id: this.lastID });
  });
});

router.get('/student/:id', authenticate, authorize('superadmin','admin','guru','siswa'), (req, res) => {
  db.all('SELECT * FROM attendance WHERE student_id = ?', [req.params.id], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

module.exports = router;
