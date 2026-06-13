const bcrypt = require('bcrypt');
const { init, db } = require('./db');

init();

async function seed() {
  const hash = await bcrypt.hash('admin123', 10);
  db.get('SELECT * FROM users WHERE username = ?', ['admin'], (err, row) => {
    if (!row) {
      db.run('INSERT INTO users (username,password,role,name) VALUES (?,?,?,?)', ['admin', hash, 'superadmin','Administrator']);
      console.log('Created default admin -> username: admin password: admin123');
    } else {
      console.log('Admin user already exists');
    }
  });
}

seed();
