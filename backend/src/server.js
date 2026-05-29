// TODO Dev 1 — Sprint 1
// Entry point do servidor Express

require('dotenv').config();
const express = require('express');
const cors    = require('cors');
// const mongoose = require('mongoose');
// const routes   = require('./routes');

const app  = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// TODO: app.use('/api', routes);

app.get('/health', (_req, res) => res.json({ status: 'ok' }));

app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));
