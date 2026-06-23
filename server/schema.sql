-- Schema untuk MySQL / MariaDB
-- Tabel roles
CREATE TABLE IF NOT EXISTS roles (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(50) UNIQUE NOT NULL
);

-- Tabel users
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role_id INT,
  name VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (role_id) REFERENCES roles(id)
);

-- Tabel departments (jurusan)
CREATE TABLE IF NOT EXISTS departments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(150) UNIQUE NOT NULL
);

-- Tabel classes
CREATE TABLE IF NOT EXISTS classes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  department_id INT,
  wali_id INT,
  FOREIGN KEY (department_id) REFERENCES departments(id)
);

-- Tabel students
CREATE TABLE IF NOT EXISTS students (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nisn VARCHAR(30) UNIQUE,
  name VARCHAR(255),
  birthdate DATE,
  class_id INT,
  department_id INT,
  photo VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (class_id) REFERENCES classes(id),
  FOREIGN KEY (department_id) REFERENCES departments(id)
);

-- Tabel teachers
CREATE TABLE IF NOT EXISTS teachers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nidn VARCHAR(50) UNIQUE,
  name VARCHAR(255),
  email VARCHAR(150),
  photo VARCHAR(255)
);

-- Tabel subjects
CREATE TABLE IF NOT EXISTS subjects (
  id INT AUTO_INCREMENT PRIMARY KEY,
  code VARCHAR(50),
  name VARCHAR(255),
  teacher_id INT,
  FOREIGN KEY (teacher_id) REFERENCES teachers(id)
);

-- Tabel schedules
CREATE TABLE IF NOT EXISTS schedules (
  id INT AUTO_INCREMENT PRIMARY KEY,
  class_id INT,
  subject_id INT,
  day VARCHAR(20),
  start_time TIME,
  end_time TIME,
  FOREIGN KEY (class_id) REFERENCES classes(id),
  FOREIGN KEY (subject_id) REFERENCES subjects(id)
);

-- Tabel registrations (PPDB)
CREATE TABLE IF NOT EXISTS registrations (
  id INT AUTO_INCREMENT PRIMARY KEY,
  registration_no VARCHAR(100) UNIQUE,
  name VARCHAR(255),
  birthdate DATE,
  status VARCHAR(50) DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabel attendances
CREATE TABLE IF NOT EXISTS attendances (
  id INT AUTO_INCREMENT PRIMARY KEY,
  student_id INT,
  date DATE,
  status VARCHAR(20),
  note TEXT,
  FOREIGN KEY (student_id) REFERENCES students(id)
);

-- Tabel grades
CREATE TABLE IF NOT EXISTS grades (
  id INT AUTO_INCREMENT PRIMARY KEY,
  student_id INT,
  subject_id INT,
  teacher_id INT,
  task_score FLOAT,
  uts_score FLOAT,
  uas_score FLOAT,
  final_score FLOAT,
  term VARCHAR(50),
  FOREIGN KEY (student_id) REFERENCES students(id),
  FOREIGN KEY (subject_id) REFERENCES subjects(id),
  FOREIGN KEY (teacher_id) REFERENCES teachers(id)
);

-- Tabel payments
CREATE TABLE IF NOT EXISTS payments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  student_id INT,
  amount DECIMAL(12,2),
  type VARCHAR(50),
  status VARCHAR(50),
  proof VARCHAR(255),
  date DATE,
  FOREIGN KEY (student_id) REFERENCES students(id)
);

-- Tabel announcements
CREATE TABLE IF NOT EXISTS announcements (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255),
  content TEXT,
  target VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Contoh data awal (roles)
INSERT INTO roles (name) VALUES ('admin') ON DUPLICATE KEY UPDATE name=name;
INSERT INTO roles (name) VALUES ('guru') ON DUPLICATE KEY UPDATE name=name;
INSERT INTO roles (name) VALUES ('siswa') ON DUPLICATE KEY UPDATE name=name;
INSERT INTO roles (name) VALUES ('orangtua') ON DUPLICATE KEY UPDATE name=name;

-- Contoh department
INSERT INTO departments (name) VALUES ('IPA') ON DUPLICATE KEY UPDATE name=name;
INSERT INTO departments (name) VALUES ('IPS') ON DUPLICATE KEY UPDATE name=name;

-- Contoh subject
INSERT INTO subjects (code, name) VALUES ('MAT', 'Matematika') ON DUPLICATE KEY UPDATE name=name;
INSERT INTO subjects (code, name) VALUES ('ENG', 'Bahasa Inggris') ON DUPLICATE KEY UPDATE name=name;
