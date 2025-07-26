import { Client } from '@notionhq/client';
import { MeetingFormData } from '../types';

const notion = new Client({ auth: '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' });
const databaseId = '235d54ba26c6806ca319f045f4da8c1a';

export async function createNotionMeeting(formData: MeetingFormData, responsible: string) {
  const participants = formData.participants.split(',').map(p => p.trim()).filter(Boolean);
  
  const response = await notion.pages.create({
    parent: { database_id: databaseId },
    properties: {
      'Name': {
        title: [
          {
            text: {
              content: formData.title,
            },
          },
        ],
      },
      'Líder': {
        rich_text: [
          {
            text: {
              content: responsible,
            },
          },
        ],
      },
      'Tipo': {
        select: {
          name: formData.type,
        },
      },
      'Data do evento': {
        date: {
          start: formData.startDateTime,
        },
      },
      'Participantes': {
        rich_text: [
          {
            text: {
              content: participants.join(', '),
            },
          },
        ],
      },
    },
  });
  return response.id;
}
