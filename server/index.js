const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const { init } = require('./db');

init();

const app = express();
app.use(cors());
app.use(bodyParser.json());

app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/students', require('./routes/students'));
app.use('/api/classes', require('./routes/classes'));
app.use('/api/ppdb', require('./routes/ppdb'));
app.use('/api/grades', require('./routes/grades'));
app.use('/api/attendance', require('./routes/attendance'));
app.use('/api/finance', require('./routes/finance'));
app.use('/api/reports', require('./routes/reports'));

// Serve client static files
app.use('/', express.static(path.join(__dirname, '..', 'client')));

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log('Server running on port', PORT));
