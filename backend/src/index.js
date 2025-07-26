import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import meetingsRouter from './routes/meetings.js';
import transcriptionRouter from './routes/transcription.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8000;

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('API de Reuniões rodando!');
});

app.use('/api/meetings', meetingsRouter);
app.use('/api/transcription', transcriptionRouter);

app.listen(PORT, () => {
  console.log(`Servidor backend rodando em http://localhost:${PORT}`);
});
