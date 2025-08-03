import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import meetingsRouter from './routes/meetings.js';
import transcriptionRouter from './routes/transcription.js';

dotenv.config();

const app = express();
// Lê a porta da variável de ambiente ou usa 3001 como padrão.
// Isso garante que o servidor escute na mesma porta que o Traefik espera.
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('API de Reuniões rodando!');
});

app.use('/api/meetings', meetingsRouter);
app.use('/api/transcription', transcriptionRouter);

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Servidor backend rodando em http://0.0.0.0:${PORT}`);
});
