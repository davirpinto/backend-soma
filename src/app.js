const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const app = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

const authRoutes = require('./routes/authRoutes');
const assessmentRoutes = require('./routes/assessmentRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/assessments', assessmentRoutes);

app.get('/', (req, res) => {
    res.json({ message: 'Backend API is running' });
});

// 404 Handler
app.use((req, res) => {
    res.status(404).json({ error: 'Not Found' });
});

// Error Handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Internal Server Error' });
});

module.exports = app;
