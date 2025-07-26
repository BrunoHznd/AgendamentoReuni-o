import express from 'express';
import { Client } from '@notionhq/client';

const router = express.Router();

// Configure Notion client
const notion = new Client({ auth: process.env.NOTION_TOKEN || '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' });
const databaseId = process.env.NOTION_DATABASE_ID || '235d54ba26c6806ca319f045f4da8c1a';

import fs from 'fs';
import path from 'path';

import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const meetingsFile = path.resolve(__dirname, '..', 'meetings.json');

function loadMeetings() {
  try {
    const data = fs.readFileSync(meetingsFile, 'utf-8');
    return JSON.parse(data);
  } catch (err) {
    return [];
  }
}
function saveMeetings(meetings) {
  fs.writeFileSync(meetingsFile, JSON.stringify(meetings, null, 2), 'utf-8');
}

let meetings = loadMeetings();

// GET /meetings - List all meetings
router.get('/', (req, res) => {
  res.json(meetings);
});

// POST /meetings - Create meeting and send to Notion
router.post('/', async (req, res) => {
  try {
    const {
      title,
      description,
      startDateTime,
      duration,
      meetingLink,
      participants,
      type,
      responsibleName,
      responsibleEmail
    } = req.body;

    // Create meeting in Notion
    const notionRes = await notion.pages.create({
      parent: { database_id: databaseId },
      properties: {
        Name: { title: [{ text: { content: title } }] },
        Líder: { rich_text: [{ text: { content: responsibleName || responsibleEmail || 'Desconhecido' } }] },
        'Tipo': { select: { name: type } },
        'Data do evento': { date: { start: startDateTime } },
        Participantes: { rich_text: [{ text: { content: Array.isArray(participants) ? participants.join(', ') : (participants || '') } }] }
      },
      // Optionally add description as a property or in content
    });

    const newMeeting = {
      id: notionRes.id,
      title,
      description,
      startDateTime,
      duration,
      meetingLink,
      participants,
      type,
      responsibleName,
      responsibleEmail,
      notionPageId: notionRes.id,
      createdAt: new Date().toISOString()
    };
    meetings.push(newMeeting);
    saveMeetings(meetings);
    res.status(201).json(newMeeting);
  } catch (err) {
    console.error('Erro ao criar reunião/Notion:', err);
    res.status(500).json({ error: 'Erro ao criar reunião ou integrar com Notion', detail: err.message });
  }
});

// DELETE /meetings/:id - Cancelar reunião (remove do arquivo e do Notion)
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { userEmail } = req.body; // deve ser enviado pelo frontend

    const meeting = meetings.find(m => m.id === id);
    if (!meeting) {
      return res.status(404).json({ error: 'Reunião não encontrada' });
    }
    // Permitir apenas admin ou responsável
    if (userEmail !== meeting.responsibleEmail && userEmail !== 'admin@reuniao.local') {
      return res.status(403).json({ error: 'Apenas o responsável ou admin pode cancelar' });
    }

    // Remove do Notion
    try {
      await notion.pages.update({
        page_id: meeting.notionPageId,
        archived: true
      });
    } catch (e) {
      // Se falhar, loga mas continua (pode já ter sido removido)
      console.warn('Falha ao arquivar página no Notion:', e.message);
    }
    // Remove do arquivo local
    meetings = meetings.filter(m => m.id !== id);
    saveMeetings(meetings);
    res.json({ ok: true });
  } catch (err) {
    console.error('Erro ao cancelar reunião:', err);
    res.status(500).json({ error: 'Erro ao cancelar reunião', detail: err.message });
  }
});

export default router;
