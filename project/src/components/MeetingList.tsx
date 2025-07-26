import React from 'react';
import { Calendar, Clock, Users, Link2, ExternalLink, List, Grid, Trash2 } from 'lucide-react';
import { Meeting } from '../types';
import { CalendarView } from './CalendarView';

interface MeetingListProps {
  meetings: Meeting[];
  onScheduleMeeting?: (dateTime: string) => void;
  onCancelMeeting: (meetingId: string) => void;
  currentUserEmail: string;
}

export const MeetingList: React.FC<MeetingListProps> = ({ 
  meetings, 
  onScheduleMeeting, 
  onCancelMeeting,
  currentUserEmail 
}) => {
  const [viewMode, setViewMode] = React.useState<'list' | 'calendar'>('list');

  // Organizar reuniões por data
  const groupMeetingsByDate = (meetings: Meeting[]) => {
    const groups: { [date: string]: Meeting[] } = {};
    
    meetings.forEach(meeting => {
      const date = new Date(meeting.startDateTime).toDateString();
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(meeting);
    });
    
    // Ordenar por data
    Object.keys(groups).forEach(date => {
      groups[date].sort((a, b) => 
        new Date(a.startDateTime).getTime() - new Date(b.startDateTime).getTime()
      );
    });
    
    return groups;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    if (date.toDateString() === today.toDateString()) {
      return 'Hoje';
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return 'Amanhã';
    } else {
      return date.toLocaleDateString('pt-BR', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
    }
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleCancelMeeting = (meetingId: string, responsibleEmail: string) => {
    if (currentUserEmail !== responsibleEmail) {
      alert('Apenas o responsável pela reunião pode cancelá-la.');
      return;
    }

    if (window.confirm('Tem certeza que deseja cancelar esta reunião?')) {
      onCancelMeeting(meetingId);
    }
  };

  const getEndTime = (startDateTime: string, duration: number) => {
    const start = new Date(startDateTime);
    const end = new Date(start.getTime() + duration * 60000);
    return formatTime(end.toISOString());
  };

  // Filtrar reuniões futuras e passadas
  const now = new Date();
  const futureMeetings = meetings.filter(
    meeting => new Date(meeting.startDateTime) >= now
  );
  const pastMeetings = meetings.filter(
    meeting => new Date(meeting.startDateTime) < now
  );

  const groupedMeetings = groupMeetingsByDate(futureMeetings);
  const sortedDates = Object.keys(groupedMeetings).sort(
    (a, b) => new Date(a).getTime() - new Date(b).getTime()
  );

  // Agrupar e ordenar reuniões passadas
  const groupedPastMeetings = groupMeetingsByDate(pastMeetings);
  const sortedPastDates = Object.keys(groupedPastMeetings).sort(
    (a, b) => new Date(b).getTime() - new Date(a).getTime()
  );

  if (futureMeetings.length === 0) {
    return (
      <div className="space-y-6">
        {/* View Toggle */}
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Reuniões</h2>
            <p className="text-gray-600">Nenhuma reunião agendada</p>
          </div>
          
          <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('list')}
              className={`py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                viewMode === 'list'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <List className="w-4 h-4 inline mr-2" />
              Lista
            </button>
            <button
              onClick={() => setViewMode('calendar')}
              className={`py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                viewMode === 'calendar'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Grid className="w-4 h-4 inline mr-2" />
              Calendário
            </button>
          </div>
        </div>

        {viewMode === 'calendar' ? (
          <CalendarView 
            meetings={meetings} 
            onTimeSlotClick={onScheduleMeeting || (() => {})} 
          />
        ) : (
          <div className="bg-white rounded-xl shadow-lg p-8 max-w-4xl mx-auto text-center">
            <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Nenhuma reunião agendada</h3>
            <p className="text-gray-600">Agende sua primeira reunião usando o formulário acima.</p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* View Toggle */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Próximas Reuniões</h2>
          <p className="text-gray-600">{futureMeetings.length} reunião(ões) agendada(s)</p>
        </div>
        <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setViewMode('list')}
            className={`py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              viewMode === 'list'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <List className="w-4 h-4 inline mr-2" />
            Lista
          </button>
          <button
            onClick={() => setViewMode('calendar')}
            className={`py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              viewMode === 'calendar'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Grid className="w-4 h-4 inline mr-2" />
            Calendário
          </button>
        </div>
      </div>

      {/* Seção de reuniões antigas */}
      {viewMode === 'list' && pastMeetings.length > 0 && (
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-4xl mx-auto mt-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2 border-b pb-2">Reuniões Antigas</h2>
          <p className="text-gray-600 mb-6">{pastMeetings.length} reunião(ões) realizadas</p>
          <div className="space-y-8">
            {sortedPastDates.map(date => (
              <div key={date}>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 capitalize">
                  {formatDate(date)}
                </h3>
                <div className="space-y-4">
                  {groupedPastMeetings[date].map(meeting => (
                    <div
                      key={meeting.id}
                      className="border border-gray-100 rounded-lg p-6 bg-gray-50 hover:shadow transition-shadow"
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h4 className="text-xl font-semibold text-gray-900 mb-2">
                            {meeting.title}
                          </h4>
                          <p className="text-gray-600 text-sm">
                            Responsável: {meeting.responsibleName || meeting.responsibleEmail || 'Desconhecido'}
                          </p>
                        </div>
                        <div className="flex space-x-2">
                          {meeting.notionPageId && (
                            <a
                              href={`https://www.notion.so/${meeting.notionPageId.replace(/-/g, '')}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm"
                            >
                              <ExternalLink className="w-4 h-4 mr-1" />
                              Ver no Notion
                            </a>
                          )}
                        </div>
                        {(currentUserEmail === meeting.responsibleEmail || currentUserEmail === 'admin@reuniao.local') && (
                          <button
                            className="inline-flex items-center px-3 py-2 ml-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors text-sm"
                            onClick={() => onCancelMeeting(meeting.id)}
                          >
                            <Trash2 className="w-4 h-4 mr-1" />
                            Cancelar
                          </button>
                        )}
                      </div>
                      {meeting.description && (
                        <p className="text-gray-700 mb-4">{meeting.description}</p>
                      )}
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                        <div className="flex items-center text-gray-600">
                          <Clock className="w-4 h-4 mr-2" />
                          <span>
                            {formatTime(meeting.startDateTime)} - {getEndTime(meeting.startDateTime, meeting.duration)}
                          </span>
                        </div>
                        <div className="flex items-center text-gray-600">
                          <Calendar className="w-4 h-4 mr-2" />
                          <span>{meeting.duration} minutos</span>
                        </div>
                        {meeting.participants.length > 0 && (
                          <div className="flex items-center text-gray-600">
                            <Users className="w-4 h-4 mr-2" />
                            <span>{meeting.participants.length} participante(s)</span>
                          </div>
                        )}
                      </div>
                      {meeting.participants.length > 0 && (
                        <div className="mt-4">
                          <p className="text-sm font-medium text-gray-700 mb-2">Participantes:</p>
                          <div className="flex flex-wrap gap-2">
                            {meeting.participants.map((participant, index) => (
                              <span
                                key={index}
                                className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                              >
                                {participant}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                      {meeting.meetingLink && (
                        <div className="mt-4">
                          <a
                            href={meeting.meetingLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center text-blue-600 hover:text-blue-800 text-sm"
                          >
                            <Link2 className="w-4 h-4 mr-2" />
                            Acessar reunião
                          </a>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Content */}
      {viewMode === 'calendar' ? (
        <CalendarView 
          meetings={meetings}
          onTimeSlotClick={onScheduleMeeting || (() => {})}
          onMeetingCancel={onCancelMeeting}
          currentUserEmail={currentUserEmail}
        />
      ) : (
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-4xl mx-auto">
          <div className="space-y-8">
            {sortedDates.map(date => (
              <div key={date}>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 capitalize">
                  {formatDate(date)}
                </h3>
                
                <div className="space-y-4">
                  {groupedMeetings[date].map(meeting => (
                    <div
                      key={meeting.id}
                      className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h4 className="text-xl font-semibold text-gray-900 mb-2">
                            {meeting.title}
                          </h4>
                          <p className="text-gray-600 text-sm">
                            Responsável: {meeting.responsibleName || meeting.responsibleEmail || 'Desconhecido'}
                          </p>
                        </div>
                        
                        <div className="flex space-x-2">
                          {meeting.notionPageId && (
                            <a
                              href={`https://www.notion.so/${meeting.notionPageId.replace(/-/g, '')}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm"
                            >
                              <ExternalLink className="w-4 h-4 mr-1" />
                              Ver no Notion
                            </a>
                          )}
                          
                          {currentUserEmail === meeting.responsibleEmail && (
                            <button
                              onClick={() => handleCancelMeeting(meeting.id, meeting.responsibleEmail)}
                              className="inline-flex items-center px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors text-sm"
                            >
                              <Trash2 className="w-4 h-4 mr-1" />
                              Cancelar
                            </button>
                          )}
                        </div>
                        {(currentUserEmail === meeting.responsibleEmail || currentUserEmail === 'admin@reuniao.local') && (
                          <button
                            className="inline-flex items-center px-3 py-2 ml-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors text-sm"
                            onClick={() => onCancelMeeting(meeting.id)}
                          >
                            <Trash2 className="w-4 h-4 mr-1" />
                            Cancelar
                          </button>
                        )}
                      </div>

                      {meeting.description && (
                        <p className="text-gray-700 mb-4">{meeting.description}</p>
                      )}

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                        <div className="flex items-center text-gray-600">
                          <Clock className="w-4 h-4 mr-2" />
                          <span>
                            {formatTime(meeting.startDateTime)} - {getEndTime(meeting.startDateTime, meeting.duration)}
                          </span>
                        </div>
                        
                        <div className="flex items-center text-gray-600">
                          <Calendar className="w-4 h-4 mr-2" />
                          <span>{meeting.duration} minutos</span>
                        </div>
                        
                        {meeting.participants.length > 0 && (
                          <div className="flex items-center text-gray-600">
                            <Users className="w-4 h-4 mr-2" />
                            <span>{meeting.participants.length} participante(s)</span>
                          </div>
                        )}
                      </div>

                      {meeting.participants.length > 0 && (
                        <div className="mt-4">
                          <p className="text-sm font-medium text-gray-700 mb-2">Participantes:</p>
                          <div className="flex flex-wrap gap-2">
                            {meeting.participants.map((participant, index) => (
                              <span
                                key={index}
                                className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                              >
                                {participant}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {meeting.meetingLink && (
                        <div className="mt-4">
                          <a
                            href={meeting.meetingLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center text-blue-600 hover:text-blue-800 text-sm"
                          >
                            <Link2 className="w-4 h-4 mr-2" />
                            Acessar reunião
                          </a>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};