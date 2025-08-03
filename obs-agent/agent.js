import express from 'express';
import cors from 'cors';
import OBSWebSocket from 'obs-websocket-js';

const app = express();
const port = 4456; // Porta para o nosso agente local

const obs = new OBSWebSocket();

app.use(cors()); // Permite que o frontend faça requisições
app.use(express.json());

async function connectToOBS() {
  try {
    if (!obs.identified) {
      await obs.connect('ws://127.0.0.1:4455'); // Endereço padrão do OBS WebSocket
      console.log('Conectado ao OBS Studio com sucesso!');
    }
    return true;
  } catch (error) {
    console.error('Falha ao conectar ao OBS Studio:', error.message);
    return false;
  }
}

// Rota para iniciar a gravação
app.post('/start-recording', async (req, res) => {
  console.log('Recebida requisição para iniciar a gravação...');
  if (!(await connectToOBS())) {
    return res.status(500).json({ error: 'Não foi possível conectar ao OBS Studio.' });
  }

  try {
    // Garante que estamos na cena correta
    await obs.call('SetCurrentProgramScene', { sceneName: 'Reuniao' });
    console.log('Cena alterada para \"Reuniao\"');

    // Inicia a gravação
    await obs.call('StartRecord');
    console.log('Gravação iniciada.');
    res.status(200).json({ message: 'Gravação iniciada com sucesso.' });
  } catch (error) {
    console.error('Erro ao iniciar a gravação:', error.message);
    res.status(500).json({ error: 'Erro ao iniciar a gravação.', detail: error.message });
  }
});

// Rota para parar a gravação
app.post('/stop-recording', async (req, res) => {
  console.log('Recebida requisição para parar a gravação...');
  if (!(await connectToOBS())) {
    return res.status(500).json({ error: 'Não foi possível conectar ao OBS Studio.' });
  }

  try {
    await obs.call('StopRecord');
    console.log('Gravação parada.');
    res.status(200).json({ message: 'Gravação parada com sucesso.' });
  } catch (error) {
    console.error('Erro ao parar a gravação:', error.message);
    res.status(500).json({ error: 'Erro ao parar a gravação.', detail: error.message });
  }
});

// Rota de status para verificar a conexão
app.get('/status', async (req, res) => {
  const connected = await connectToOBS();
  if (connected) {
    res.status(200).json({ status: 'Conectado ao OBS Studio' });
  } else {
    res.status(500).json({ status: 'Desconectado do OBS Studio' });
  }
});

app.listen(port, () => {
  console.log(`Agente OBS rodando em http://localhost:${port}`);
  console.log('Aguardando comandos da aplicação de reuniões...');
  console.log('Certifique-se de que o OBS Studio está aberto e o plugin WebSocket está ativado na porta 4455.');
});
