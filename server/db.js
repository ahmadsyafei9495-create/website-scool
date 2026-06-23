const path = require('path');
const sqlite3 = require('sqlite3').verbose();

const useMysql = process.env.USE_MYSQL === 'true' || false;

let db = null;

const exportedDb = {
  get: (sql, params, cb) => {
    if (!db) return cb(new Error('DB not initialized'));
    return db.get(sql, params, cb);
  },
  all: (sql, params, cb) => {
    if (!db) return cb(new Error('DB not initialized'));
    return db.all(sql, params, cb);
  },
  run: (sql, params, cb) => {
    if (!db) return cb(new Error('DB not initialized'));
    return db.run(sql, params, cb);
  }
};

function createSqlite() {
  const DB_PATH = path.join(__dirname, 'sis.db');
  const sdb = new sqlite3.Database(DB_PATH);
  return {
    get: (sql, params, cb) => sdb.get(sql, params, cb),
    all: (sql, params, cb) => sdb.all(sql, params, cb),
    run: (sql, params, cb) => sdb.run(sql, params, cb),
    raw: sdb
  };
}

function createMysqlPool() {
  const mysql = require('mysql2/promise');
  const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'sis',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
  });

  return {
    get: async (sql, params, cb) => {
      try {
        const [rows] = await pool.execute(sql, params || []);
        cb(null, rows[0] || null);
      } catch (err) { cb(err); }
    },
    all: async (sql, params, cb) => {
      try {
        const [rows] = await pool.execute(sql, params || []);
        cb(null, rows);
      } catch (err) { cb(err); }
    },
    run: async (sql, params, cb) => {
      try {
        const [result] = await pool.execute(sql, params || []);
        const ctx = { lastID: result.insertId || null, changes: result.affectedRows || 0 };
        cb.call(ctx, null);
      } catch (err) { cb(err); }
    },
    raw: pool
  };
}

function init() {
  if (useMysql) {
    db = createMysqlPool();
    // create tables if not exist (MySQL schema similar to server/schema.sql)
    const ddl = [
      `CREATE TABLE IF NOT EXISTS roles (id INT AUTO_INCREMENT PRIMARY KEY, name VARCHAR(50) UNIQUE NOT NULL);`,
      `CREATE TABLE IF NOT EXISTS users (id INT AUTO_INCREMENT PRIMARY KEY, username VARCHAR(100) UNIQUE NOT NULL, password VARCHAR(255) NOT NULL, role_id INT, name VARCHAR(255), created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY (role_id) REFERENCES roles(id));`,
      `CREATE TABLE IF NOT EXISTS departments (id INT AUTO_INCREMENT PRIMARY KEY, name VARCHAR(150) UNIQUE NOT NULL);`,
      `CREATE TABLE IF NOT EXISTS classes (id INT AUTO_INCREMENT PRIMARY KEY, name VARCHAR(100) NOT NULL, department_id INT, wali_id INT, FOREIGN KEY (department_id) REFERENCES departments(id));`,
      `CREATE TABLE IF NOT EXISTS students (id INT AUTO_INCREMENT PRIMARY KEY, nisn VARCHAR(30) UNIQUE, name VARCHAR(255), birthdate DATE, class_id INT, department_id INT, photo VARCHAR(255), created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY (class_id) REFERENCES classes(id), FOREIGN KEY (department_id) REFERENCES departments(id));`,
      `CREATE TABLE IF NOT EXISTS teachers (id INT AUTO_INCREMENT PRIMARY KEY, nidn VARCHAR(50) UNIQUE, name VARCHAR(255), email VARCHAR(150), photo VARCHAR(255));`,
      `CREATE TABLE IF NOT EXISTS subjects (id INT AUTO_INCREMENT PRIMARY KEY, code VARCHAR(50), name VARCHAR(255), teacher_id INT, FOREIGN KEY (teacher_id) REFERENCES teachers(id));`,
      `CREATE TABLE IF NOT EXISTS schedules (id INT AUTO_INCREMENT PRIMARY KEY, class_id INT, subject_id INT, day VARCHAR(20), start_time TIME, end_time TIME, FOREIGN KEY (class_id) REFERENCES classes(id), FOREIGN KEY (subject_id) REFERENCES subjects(id));`,
      `CREATE TABLE IF NOT EXISTS registrations (id INT AUTO_INCREMENT PRIMARY KEY, registration_no VARCHAR(100) UNIQUE, name VARCHAR(255), birthdate DATE, status VARCHAR(50) DEFAULT 'pending', created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP);`,
      `CREATE TABLE IF NOT EXISTS attendances (id INT AUTO_INCREMENT PRIMARY KEY, student_id INT, date DATE, status VARCHAR(20), note TEXT, FOREIGN KEY (student_id) REFERENCES students(id));`,
      `CREATE TABLE IF NOT EXISTS grades (id INT AUTO_INCREMENT PRIMARY KEY, student_id INT, subject_id INT, teacher_id INT, task_score FLOAT, uts_score FLOAT, uas_score FLOAT, final_score FLOAT, term VARCHAR(50), FOREIGN KEY (student_id) REFERENCES students(id), FOREIGN KEY (subject_id) REFERENCES subjects(id), FOREIGN KEY (teacher_id) REFERENCES teachers(id));`,
      `CREATE TABLE IF NOT EXISTS payments (id INT AUTO_INCREMENT PRIMARY KEY, student_id INT, amount DECIMAL(12,2), type VARCHAR(50), status VARCHAR(50), proof VARCHAR(255), date DATE, FOREIGN KEY (student_id) REFERENCES students(id));`,
      `CREATE TABLE IF NOT EXISTS announcements (id INT AUTO_INCREMENT PRIMARY KEY, title VARCHAR(255), content TEXT, target VARCHAR(50), created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP);`
    ];

    (async () => {
      for (const s of ddl) {
        try { await db.raw.query(s); } catch (e) { console.error('DDL error', e); }
      }
    })();

  } else {
    db = createSqlite();
    db.raw.serialize(() => {
      db.raw.run(`CREATE TABLE IF NOT EXISTS roles (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT UNIQUE NOT NULL)`);
      db.raw.run(`CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY AUTOINCREMENT, username TEXT UNIQUE, password TEXT, role TEXT, name TEXT, created_at TEXT)`);
      db.raw.run(`CREATE TABLE IF NOT EXISTS departments (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT UNIQUE NOT NULL)`);
      db.raw.run(`CREATE TABLE IF NOT EXISTS classes (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, department_id INTEGER, wali INTEGER)`);
      db.raw.run(`CREATE TABLE IF NOT EXISTS students (id INTEGER PRIMARY KEY AUTOINCREMENT, nisn TEXT UNIQUE, name TEXT, birthdate TEXT, class_id INTEGER, department_id INTEGER, photo TEXT, created_at TEXT)`);
      db.raw.run(`CREATE TABLE IF NOT EXISTS teachers (id INTEGER PRIMARY KEY AUTOINCREMENT, nidn TEXT UNIQUE, name TEXT, email TEXT, photo TEXT)`);
      db.raw.run(`CREATE TABLE IF NOT EXISTS subjects (id INTEGER PRIMARY KEY AUTOINCREMENT, code TEXT, name TEXT, teacher_id INTEGER)`);
      db.raw.run(`CREATE TABLE IF NOT EXISTS schedules (id INTEGER PRIMARY KEY AUTOINCREMENT, class_id INTEGER, subject_id INTEGER, day TEXT, start_time TEXT, end_time TEXT)`);
      db.raw.run(`CREATE TABLE IF NOT EXISTS registrations (id INTEGER PRIMARY KEY AUTOINCREMENT, registration_no TEXT UNIQUE, name TEXT, birthdate TEXT, status TEXT DEFAULT 'pending', created_at TEXT)`);
      db.raw.run(`CREATE TABLE IF NOT EXISTS attendances (id INTEGER PRIMARY KEY AUTOINCREMENT, student_id INTEGER, date TEXT, status TEXT, note TEXT)`);
      db.raw.run(`CREATE TABLE IF NOT EXISTS grades (id INTEGER PRIMARY KEY AUTOINCREMENT, student_id INTEGER, subject_id INTEGER, teacher_id INTEGER, task_score REAL, uts_score REAL, uas_score REAL, final_score REAL, term TEXT)`);
      db.raw.run(`CREATE TABLE IF NOT EXISTS payments (id INTEGER PRIMARY KEY AUTOINCREMENT, student_id INTEGER, amount REAL, type TEXT, status TEXT, proof TEXT, date TEXT)`);
      db.raw.run(`CREATE TABLE IF NOT EXISTS announcements (id INTEGER PRIMARY KEY AUTOINCREMENT, title TEXT, content TEXT, target TEXT, created_at TEXT)`);
    });
  }
}

module.exports = { db: exportedDb, init };
