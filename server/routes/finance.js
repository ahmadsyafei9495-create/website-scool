const express = require('express');
const { db } = require('../db');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

router.post('/pay', authenticate, authorize('superadmin','admin','keuangan'), (req, res) => {
  const { student_id, amount, type, date } = req.body;
  db.run('INSERT INTO finance (student_id,amount,type,date) VALUES (?,?,?,?)', [student_id,amount,type,date], function(err){
    if (err) return res.status(500).json({ error: err.message });
    res.json({ id: this.lastID });
  });
});

router.get('/student/:id', authenticate, authorize('superadmin','admin','keuangan','siswa'), (req, res) => {
  db.all('SELECT * FROM finance WHERE student_id = ?', [req.params.id], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

module.exports = router;
