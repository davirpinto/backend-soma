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

        // Garantir que todas as keys sejam strings e os valores sejam objetos
        const normalizedResponses = {};
        Object.keys(req.body.economicProfile.responses).forEach(key => {
            const stringKey = String(key);
            let value = req.body.economicProfile.responses[key];

            // Se o valor for uma string que parece JSON, tentar fazer parse
            if (typeof value === 'string') {
                try {
                    const parsed = JSON.parse(value);
                    if (typeof parsed === 'object' && parsed !== null) {
                        value = parsed;
                    }
                } catch (e) {
                    // Se falhar o parse, mantém como string original
                }
            }

            // Se o valor for um objeto com a estrutura correta, mantém
            if (typeof value === 'object' && value !== null && 'notApplicable' in value) {
                normalizedResponses[stringKey] = value;
            } else {
                // Caso contrário (string, número ou objeto sem estrutura), normaliza para o formato padrão
                normalizedResponses[stringKey] = {
                    notApplicable: false,
                    values: typeof value === 'object' && value !== null ? value : { "current": String(value) }
                };
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
