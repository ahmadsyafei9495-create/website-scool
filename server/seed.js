const bcrypt = require('bcrypt');
const { init, db } = require('./db');

init();

async function ensureRole(name, cb) {
  db.get('SELECT id FROM roles WHERE name = ?', [name], (err, row) => {
    if (err) return cb(err);
    if (!row) {
      db.run('INSERT INTO roles (name) VALUES (?)', [name], function(err2){
        if (err2) return cb(err2);
        cb(null, this.lastID || null);
      });
    } else cb(null, row.id || null);
  });
}

async function seed() {
  const hash = await bcrypt.hash('admin123', 10);
  const roles = ['superadmin','admin','guru','siswa','orangtua'];

  // ensure roles
  const ensureAll = (i=0) => {
    if (i>=roles.length) return createAdmin();
    ensureRole(roles[i], (e) => { if (e) console.error('role seed error', e); ensureAll(i+1); });
  };

  function createAdmin() {
    db.get('SELECT * FROM users WHERE username = ?', ['admin'], (err, row) => {
      if (err) return console.error(err);
      if (!row) {
        // try to get superadmin role id
        db.get('SELECT id FROM roles WHERE name = ?', ['superadmin'], (er, r) => {
          if (er) return console.error(er);
          if (r && r.id) {
            db.run('INSERT INTO users (username,password,role_id,name) VALUES (?,?,?,?)', ['admin', hash, r.id, 'Administrator'], function(err2){
              if (err2) return console.error(err2);
              console.log('Created default admin -> username: admin password: admin123');
            });
          } else {
            // fallback to older schema (role text)
            db.run('INSERT INTO users (username,password,role,name) VALUES (?,?,?,?)', ['admin', hash, 'superadmin','Administrator'], function(err2){
              if (err2) return console.error(err2);
              console.log('Created default admin -> username: admin password: admin123');
            });
          }
        });
      } else {
        console.log('Admin user already exists');
      }
    });
  }

  ensureAll();
}

seed();
