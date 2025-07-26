import React from 'react';
import { X, Calendar, Clock, Users, Link2, User, Mail, Building, Trash2 } from 'lucide-react';
import { Meeting } from '../types';

interface MeetingDetailsModalProps {
  meeting: Meeting;
  onClose: () => void;
  onCancel: (meetingId: string) => void;
  currentUserEmail: string;
}

export const MeetingDetailsModal: React.FC<MeetingDetailsModalProps> = ({
  meeting,
  onClose,
  onCancel,
  currentUserEmail
}) => {
  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('pt-BR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getEndTime = (startDateTime: string, duration: number) => {
    const start = new Date(startDateTime);
    const end = new Date(start.getTime() + duration * 60000);
    return formatTime(end.toISOString());
  };

  const canCancel = currentUserEmail === meeting.responsibleEmail || currentUserEmail === 'admin@reuniao.local';

  const handleCancel = () => {
    if (window.confirm('Tem certeza que deseja cancelar esta reunião?')) {
      onCancel(meeting.id);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">Detalhes da Reunião</h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Title */}
          <div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {meeting.title}
            </h3>
            {meeting.description && (
              <p className="text-gray-600">{meeting.description}</p>
            )}
          </div>

          {/* Responsible */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
              <User className="w-4 h-4 mr-2" />
              Responsável
            </h4>
            <div className="space-y-1">
              <p className="font-medium text-gray-900">{meeting.responsibleName}</p>
              <p className="text-sm text-gray-600 flex items-center">
                <Mail className="w-4 h-4 mr-2" />
                {meeting.responsibleEmail}
              </p>
            </div>
          </div>

          {/* Date and Time */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-blue-50 rounded-lg p-4">
              <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                <Calendar className="w-4 h-4 mr-2" />
                Data e Hora
              </h4>
              <p className="text-gray-900 capitalize">
                {formatDateTime(meeting.startDateTime)}
              </p>
            </div>

            <div className="bg-green-50 rounded-lg p-4">
              <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                <Clock className="w-4 h-4 mr-2" />
                Duração
              </h4>
              <p className="text-gray-900">
                {formatTime(meeting.startDateTime)} - {getEndTime(meeting.startDateTime, meeting.duration)}
              </p>
              <p className="text-sm text-gray-600">{meeting.duration} minutos</p>
            </div>
          </div>

          {/* Meeting Link */}
          {meeting.meetingLink && (
            <div className="bg-purple-50 rounded-lg p-4">
              <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                <Link2 className="w-4 h-4 mr-2" />
                Link da Reunião
              </h4>
              <a
                href={meeting.meetingLink}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 break-all"
              >
                {meeting.meetingLink}
              </a>
            </div>
          )}

          {/* Participants */}
          {meeting.participants.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
                <Users className="w-4 h-4 mr-2" />
                Participantes ({meeting.participants.length})
              </h4>
              <div className="flex flex-wrap gap-2">
                {meeting.participants.map((participant, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800"
                  >
                    {participant}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Created At */}
          <div className="text-xs text-gray-500 border-t border-gray-200 pt-4">
            Criada em: {new Date(meeting.createdAt).toLocaleString('pt-BR')}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
          <div className="flex space-x-3">
            {meeting.notionPageId && (
              <a
                href={`https://notion.so/${meeting.notionPageId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors text-sm"
              >
                <Building className="w-4 h-4 mr-2" />
                Ver no Notion
              </a>
            )}
          </div>

          <div className="flex space-x-3">
            {canCancel && (
              <button
                onClick={handleCancel}
                className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Cancelar Reunião
              </button>
            )}
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors text-sm"
            >
              Fechar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};