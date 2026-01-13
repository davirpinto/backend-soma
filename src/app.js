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

// Middleware para corrigir economicProfile se vier com keys numéricas ou stringificado
app.use((req, res, next) => {
    if (req.body?.economicProfile?.responses) {
        const responses = req.body.economicProfile.responses;
        
        // Se responses é uma string, fazer parse
        if (typeof responses === 'string') {
            try {
                req.body.economicProfile.responses = JSON.parse(responses);
            } catch (e) {
                console.error('Failed to parse economicProfile.responses:', e);
            }
        }
        
        // Garantir que todas as keys sejam strings
        const normalizedResponses = {};
        Object.keys(req.body.economicProfile.responses).forEach(key => {
            const stringKey = String(key);
            const value = req.body.economicProfile.responses[key];
            
            // Se o valor for uma string, tentar fazer parse
            if (typeof value === 'string') {
                try {
                    normalizedResponses[stringKey] = JSON.parse(value);
                } catch (e) {
                    normalizedResponses[stringKey] = value;
                }
            } else {
                normalizedResponses[stringKey] = value;
            }
        });
        
        req.body.economicProfile.responses = normalizedResponses;
    }
    next();
});

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
