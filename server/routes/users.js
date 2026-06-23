const express = require('express');
const bcrypt = require('bcrypt');
const { db } = require('../db');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

router.get('/', authenticate, authorize('superadmin','admin'), (req, res) => {
  db.all('SELECT u.id, u.username, COALESCE(r.name,u.role) AS role, u.name FROM users u LEFT JOIN roles r ON u.role_id=r.id', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

router.post('/', authenticate, authorize('superadmin'), async (req, res) => {
  const { username, password, role, role_id, name } = req.body;
  if (!username || !password) return res.status(400).json({ error: 'Missing fields' });
  const hash = await bcrypt.hash(password, 10);

  const insertUser = (roleFieldSql, params) => {
    db.run(roleFieldSql, params, function(err){
      if (err) return res.status(500).json({ error: err.message });
      res.json({ id: this.lastID });
    });
  };

  if (role_id) {
    insertUser('INSERT INTO users (username,password,role_id,name) VALUES (?,?,?,?)', [username, hash, role_id, name||null]);
    return;
  }

  if (role) {
    // try to find role id by name
    db.get('SELECT id FROM roles WHERE name = ?', [role], (err, r) => {
      if (err) return res.status(500).json({ error: err.message });
      if (r && r.id) {
        insertUser('INSERT INTO users (username,password,role_id,name) VALUES (?,?,?,?)', [username, hash, r.id, name||null]);
      } else {
        // fallback to older schema text field
        insertUser('INSERT INTO users (username,password,role,name) VALUES (?,?,?,?)', [username, hash, role, name||null]);
      }
    });
    return;
  }

  insertUser('INSERT INTO users (username,password,name) VALUES (?,?,?)', [username, hash, name||null]);
});

module.exports = router;
