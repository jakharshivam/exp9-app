const express = require('express');
const helmet = require('helmet');
const app = express();
app.use(helmet());
app.use(express.json());

const API_KEY = process.env.API_KEY;
const patients = [
  { id: 1, name: 'A. Kumar', ward: 'Cardiology' },
  { id: 2, name: 'S. Rao', ward: 'Neurology' }
];

app.get('/health', (req, res) => res.json({ status: 'ok' }));

app.use((req, res, next) => {
  if (!API_KEY || req.header('x-api-key') !== API_KEY) {
    return res.status(401).json({ error: 'unauthorized' });
  }
  next();
});

app.get('/patients', (req, res) => res.json(patients));

app.listen(3000);
