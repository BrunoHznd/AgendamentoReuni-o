import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import {
  uploadAudioToTranskriptor,
  getTranskriptorFileStatus
} from '../services/transkriptor.js';
import axios from 'axios';
import { Client } from '@notionhq/client';

const router = express.Router();
const upload = multer({ dest: path.join(process.cwd(), 'uploads/') });

const notion = new Client({ auth: process.env.NOTION_TOKEN });
const databaseId = process.env.NOTION_DATABASE_ID;

// POST /transcription/upload - Upload audio/video for transcription
router.post('/upload', upload.single('file'), async (req, res) => {
  try {
    console.log('Recebendo upload para transcrição...');
    if (!req.file) {
      console.error('Nenhum arquivo enviado!');
      return res.status(400).json({ error: 'Arquivo não enviado.' });
    }
    const { meetingId } = req.body;
    console.log('Arquivo recebido:', req.file.originalname, 'Path:', req.file.path, 'MeetingId:', meetingId);
    // Envia para o Transkriptor
    const result = await uploadAudioToTranskriptor(req.file.path, req.file.originalname);
    console.log('Resposta do Transkriptor:', result);
    // Salva o ID do arquivo transkriptor junto à reunião (pode ser implementado)
    res.status(200).json({ fileId: result.id, status: result.status, transkriptorData: result });
  } catch (err) {
    console.error('Erro no upload/transcrição:', err);
    res.status(500).json({ error: 'Erro ao enviar arquivo para transcrição', detail: err.message });
  }
});

// POST /transcription/live - Inicia transcrição ao vivo via link
router.post('/live', async (req, res) => {
  try {
    console.log('--- [POST /transcription/live] ---');
    console.log('Body recebido:', req.body);
    const { meetingUrl, meeting_language, meeting_bot_name, summary_template_id } = req.body;
    if (!meetingUrl) {
      console.error('meetingUrl não enviado no body');
      return res.status(400).json({ error: 'meetingUrl obrigatório.' });
    }
    console.log('Iniciando transcrição ao vivo para:', meetingUrl);
    const apiKey = process.env.TRANSKRIPTOR_TOKEN;
    console.log('Token usado (primeiros 8 chars):', apiKey ? apiKey.substring(0,8) : 'undefined');
    const payload = {
      meetingUrl,
      ...(meeting_language ? { meeting_language } : {}),
      ...(meeting_bot_name ? { meeting_bot_name } : {}),
      ...(summary_template_id ? { summary_template_id } : {})
    };
    console.log('Payload enviado para Transkriptor:', payload);
    const response = await axios.post(
      'https://api.tor.app/developer/transcription/meeting',
      payload,
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        }
      }
    );
    console.log('Resposta da API Transkriptor:', response.data);
    res.status(200).json(response.data);
  } catch (err) {
    if (err.response) {
      console.error('Erro Transkriptor status:', err.response.status);
      console.error('Erro Transkriptor data:', err.response.data);
    } else {
      console.error('Erro ao iniciar transcrição ao vivo:', err.message);
    }
    res.status(500).json({ error: 'Erro ao iniciar transcrição ao vivo', detail: err?.response?.data || err.message });
  }
});

// GET /transcription/status/:fileId - Check transcription status
router.get('/status/:fileId', async (req, res) => {
  try {
    const { fileId } = req.params;
    console.log('Consultando status da transcrição para fileId:', fileId);
    const result = await getTranskriptorFileStatus(fileId);
    console.log('Status retornado:', result);
    res.status(200).json(result);
  } catch (err) {
    console.error('Erro ao consultar status:', err);
    res.status(500).json({ error: 'Erro ao consultar status da transcrição', detail: err.message });
  }
});

// POST /transcription/send-to-notion - Save transcript to Notion
router.post('/send-to-notion', async (req, res) => {
  try {
    const { meetingId, transcript } = req.body;
    console.log('Enviando transcrição ao Notion:', { meetingId, transcriptLength: transcript?.length });
    if (!meetingId || !transcript) {
      console.error('meetingId ou transcript ausente!');
      return res.status(400).json({ error: 'meetingId e transcript obrigatórios.' });
    }
    // Adiciona a transcrição como comentário (discussion) na página do Notion
    const notionRes = await notion.comments.create({
      parent: { page_id: meetingId },
      rich_text: [{ text: { content: transcript } }]
    });
    console.log('Comentário criado no Notion:', notionRes);
    res.status(200).json({ ok: true });
  } catch (err) {
    console.error('Erro ao enviar transcrição ao Notion:', err);
    res.status(500).json({ error: 'Erro ao enviar transcrição ao Notion', detail: err.message });
  }
});

// Rota para o webhook do Transkriptor
router.post('/webhook', async (req, res) => {
  try {
    console.log('--- [WEBHOOK TRANSKRIPTOR RECEBIDO] ---');
    console.log('Headers:', JSON.stringify(req.headers, null, 2));
    console.log('Body:', JSON.stringify(req.body, null, 2));

    // TODO: Implementar a lógica para processar a transcrição
    // 1. Extrair o ID da reunião e o texto da transcrição do req.body
    // 2. Buscar o ID da página do Notion correspondente à reunião
    // 3. Adicionar a transcrição como um comentário na página do Notion

    res.status(200).send('Webhook recebido com sucesso!');
  } catch (error) {
    console.error('Erro ao processar webhook do Transkriptor:', error);
    res.status(500).json({ error: 'Erro interno no servidor ao processar o webhook' });
  }
});

export default router;
