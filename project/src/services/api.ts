import { Meeting, MeetingFormData } from '../types';
import { AuthService } from './auth';
import { NotificationService } from './notifications';

// Com o Traefik, o frontend fará chamadas para um caminho relativo, e o Traefik redirecionará para o backend.
const API_BASE_URL = 'http://92.113.38.123:3001/api'; // Real backend URL
const USE_MOCK = false; // Set to false when using real backend

// // Mock data for development
// const mockMeetings: Meeting[] = [
//   {
//     id: '1',
//     responsibleName: 'Bruno Oliveira',
//     responsibleEmail: 'bruno@empresa.com',
//     title: 'Reunião de Planejamento Q1',
//     description: 'Discussão sobre metas e objetivos para o primeiro trimestre',
//     startDateTime: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(), // 2 horas no futuro
//     duration: 60,
//     meetingLink: 'https://meet.google.com/abc-defg-hij',
//     participants: ['Maria Santos', 'Pedro Costa', 'Ana Lima'],
//     notionPageId: 'notion-page-1',
//     createdAt: new Date().toISOString()
//   },
//   {
//     id: '2', 
//     responsibleName: 'Ana Medaglia',
//     responsibleEmail: 'ana@empresa.com',
//     title: 'Reunião de Status do Projeto',
//     description: 'Acompanhamento do progresso do projeto Alpha',
//     startDateTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // amanhã
//     duration: 45,
//     meetingLink: 'https://teams.microsoft.com/xyz-123',
//     participants: ['Bruno Oliveira', 'Carlos Oliveira'],
//     notionPageId: 'notion-page-2',
//     createdAt: new Date().toISOString()
//   }
// ];

// Mock API functions
import { createNotionMeeting } from './notion';

const mockAPI = {
  async createMeeting(formData: MeetingFormData): Promise<Meeting> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const currentUser = AuthService.getCurrentUser();
    if (!currentUser) {
      throw new Error('Usuário não autenticado');
    }
    
    // Cria a reunião localmente
    const newMeeting: Meeting = {
      id: Math.random().toString(36).substr(2, 9),
      responsibleName: currentUser.name,
      responsibleEmail: currentUser.email,
      title: formData.title,
      description: formData.description,
      startDateTime: formData.startDateTime,
      duration: formData.duration,
      meetingLink: formData.meetingLink,
      participants: formData.participants.split(',').map(p => p.trim()).filter(p => p),
      notionPageId: '',
      createdAt: new Date().toISOString(),
      type: formData.type
    };

    // Cria a reunião no Notion
    try {
      const notionPageId = await createNotionMeeting(formData, currentUser.name);
      newMeeting.notionPageId = notionPageId;
    } catch (err) {
      console.error('Erro ao criar reunião no Notion:', err);
    }
    
    mockMeetings.push(newMeeting);
    
    // Send notifications to participants
    if (currentUser && newMeeting.participants.length > 0) {
      // Check if any participant should be notified (excluding the creator)
      const participantsToNotify = newMeeting.participants.filter(participant => 
        !participant.toLowerCase().includes(currentUser.name.toLowerCase())
      );
      
      if (participantsToNotify.length > 0) {
        // In a real app, you would send notifications to specific users
        // For demo purposes, we'll show a notification if the current user is in participants
        if (NotificationService.shouldNotifyUser(newMeeting.participants, currentUser.name)) {
          await NotificationService.showMeetingNotification(
            newMeeting.title,
            newMeeting.responsibleName,
            newMeeting.startDateTime,
            newMeeting.participants
          );
        }
      }
    }
    
    return newMeeting;
  },

  async getMeetings(): Promise<Meeting[]> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    return [...mockMeetings];
  },

  async checkTimeConflict(startDateTime: string, duration: number): Promise<boolean> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const startTime = new Date(startDateTime);
    const endTime = new Date(startTime.getTime() + duration * 60 * 1000);
    
    // Check for conflicts with existing meetings
    const hasConflict = mockMeetings.some(meeting => {
      const meetingStart = new Date(meeting.startDateTime);
      const meetingEnd = new Date(meetingStart.getTime() + meeting.duration * 60 * 1000);
      
      return (startTime < meetingEnd && endTime > meetingStart);
    });
    
    return hasConflict;
  },

  async deleteMeeting(meetingId: string): Promise<void> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const index = mockMeetings.findIndex(meeting => meeting.id === meetingId);
    if (index === -1) {
      throw new Error('Reunião não encontrada');
    }
    
    mockMeetings.splice(index, 1);
  }
};

// Real API functions
const realAPI = {
  async createMeeting(formData: MeetingFormData): Promise<Meeting> {
    const currentUser = AuthService.getCurrentUser();
    if (!currentUser) {
      throw new Error('Usuário não autenticado');
    }

    const response = await fetch(`${API_BASE_URL}/meetings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${AuthService.getToken()}`
      },
      body: JSON.stringify({
        ...formData,
        participants: formData.participants.split(',').map(p => p.trim()).filter(p => p)
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Erro ao criar reunião');
    }

    return response.json();
  },

  async getMeetings(): Promise<Meeting[]> {
    const response = await fetch(`${API_BASE_URL}/meetings`, {
      headers: {
        'Authorization': `Bearer ${AuthService.getToken()}`
      }
    });
    
    if (!response.ok) {
      throw new Error('Erro ao carregar reuniões');
    }

    return response.json();
  },

  async checkTimeConflict(startDateTime: string, duration: number): Promise<boolean> {
    const response = await fetch(`${API_BASE_URL}/meetings/check-conflict`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${AuthService.getToken()}`
      },
      body: JSON.stringify({ startDateTime, duration }),
    });

    if (!response.ok) {
      throw new Error('Erro ao verificar conflito');
    }

    const result = await response.json();
    return result.hasConflict;
  },

  async deleteMeeting(meetingId: string): Promise<void> {
    const currentUser = AuthService.getCurrentUser();
    const response = await fetch(`${API_BASE_URL}/meetings/${meetingId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${AuthService.getToken()}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ userEmail: currentUser?.email })
    });

    if (!response.ok) {
      throw new Error('Erro ao cancelar reunião');
    }
  }
};

// Export the appropriate API based on USE_MOCK flag
export const APIService = USE_MOCK ? mockAPI : realAPI;