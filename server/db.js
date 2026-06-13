const path = require('path');
const sqlite3 = require('sqlite3').verbose();

const DB_PATH = path.join(__dirname, 'sis.db');

const db = new sqlite3.Database(DB_PATH);

function init() {
  db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE,
      password TEXT,
      role TEXT,
      name TEXT
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS students (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nisn TEXT UNIQUE,
      name TEXT,
      kelas TEXT,
      jurusan TEXT
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS classes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT,
      wali TEXT
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS ppdb (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT,
      birthdate TEXT,
      status TEXT
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS grades (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      student_id INTEGER,
      subject TEXT,
      score REAL,
      term TEXT
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS attendance (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      student_id INTEGER,
      date TEXT,
      status TEXT
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS finance (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      student_id INTEGER,
      amount REAL,
      type TEXT,
      date TEXT
    )`);
  });
}

module.exports = { db, init };
