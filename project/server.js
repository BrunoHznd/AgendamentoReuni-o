import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const app = express();
const PORT = process.env.PORT || 3200;

// Corrige __dirname em ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Serve arquivos estáticos da pasta dist
app.use(express.static(path.join(__dirname, 'dist')));

// Para SPA: redireciona todas as rotas que não possuem ponto (.) para index.html
app.get('*', (req, res) => {
  if (!req.path.includes('.')) {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
  } else {
    res.status(404).end();
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Servidor rodando em http://0.0.0.0:${PORT}`);
});
