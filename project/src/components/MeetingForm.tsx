import React, { useState } from 'react';
import { Calendar, Clock, Link2, FileText, CheckCircle, AlertCircle } from 'lucide-react';
import { MeetingFormData, Meeting } from '../types';
import { APIService } from '../services/api';
import { AuthService } from '../services/auth';
import { ParticipantSelector } from './ParticipantSelector';

interface MeetingFormProps {
  onMeetingCreated: (meeting: Meeting) => void;
  initialDateTime?: string;
}

export const MeetingForm: React.FC<MeetingFormProps> = ({ onMeetingCreated, initialDateTime }) => {
  const currentUser = AuthService.getCurrentUser();
  
  const [formData, setFormData] = useState<MeetingFormData>({
    title: '',
    description: '',
    startDateTime: initialDateTime || '',
    duration: 60,
    meetingLink: '',
    participants: '',
    type: '' // Tipo da reunião
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState<Meeting | null>(null);
  const [error, setError] = useState<string>('');
  const [timeConflict, setTimeConflict] = useState(false);
  const [selectedParticipants, setSelectedParticipants] = useState<string[]>([]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Reset estados de feedback
    setError('');
    if (name === 'startDateTime' || name === 'duration') {
      setTimeConflict(false);
    }
  };

  const checkTimeConflict = async () => {
    if (formData.startDateTime && formData.duration) {
      try {
        const hasConflict = await APIService.checkTimeConflict(formData.startDateTime, formData.duration);
        setTimeConflict(hasConflict);
        return hasConflict;
      } catch (err) {
        console.error('Erro ao verificar conflito:', err);
        return false;
      }
    }
    return false;
  };

  const handleDateTimeBlur = async () => {
    await checkTimeConflict();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      // Verificar conflito antes de enviar
      const hasConflict = await checkTimeConflict();
      if (hasConflict) {
        setError('Já existe uma reunião agendada para este horário!');
        setIsSubmitting(false);
        return;
      }

      const meeting = await APIService.createMeeting({
        ...formData,
        participants: selectedParticipants.join(', ')
      });
      setSuccess(meeting);
      onMeetingCreated(meeting);
      
      // Reset form
      setFormData({
        title: '',
        description: '',
        startDateTime: '',
        duration: 60,
        meetingLink: '',
        participants: ''
      });
      setSelectedParticipants([]);
      
      // Auto-hide success message after 5 seconds
      setTimeout(() => setSuccess(null), 5000);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Success Message
  if (success) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-8 max-w-2xl mx-auto">
        <div className="text-center">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Reunião Agendada com Sucesso!</h2>
          <p className="text-gray-600 mb-6">A reunião foi criada e adicionada ao Notion automaticamente.</p>
          
          <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
            <h3 className="font-semibold text-gray-900 mb-2">{success.title}</h3>
            <p className="text-sm text-gray-600">Responsável: {currentUser?.name}</p>
            <p className="text-sm text-gray-600">
              Data: {new Date(success.startDateTime).toLocaleString('pt-BR')}
            </p>
            <p className="text-sm text-gray-600">Duração: {success.duration} minutos</p>
          </div>

          <div className="space-y-3">
            {success.notionPageId && (
              <a
                href={`https://notion.so/${success.notionPageId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-6 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
              >
                <FileText className="w-5 h-5 mr-2" />
                Visualizar no Notion
              </a>
            )}
            <button
              onClick={() => setSuccess(null)}
              className="block w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Agendar Nova Reunião
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-8 max-w-2xl mx-auto">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Nova Reunião</h2>
        <p className="text-gray-600">Preencha os dados para agendar uma reunião na sala</p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center">
          <AlertCircle className="w-5 h-5 text-red-600 mr-3" />
          <p className="text-red-700">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Responsável Info */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="text-sm font-medium text-gray-700 mb-2">Responsável pela Reunião</h3>
          <p className="text-gray-900 font-medium">{currentUser?.name}</p>
          <p className="text-gray-600 text-sm">{currentUser?.email}</p>
          <p className="text-gray-600 text-sm">{currentUser?.department}</p>
        </div>

        {/* Título e Descrição */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <FileText className="w-4 h-4 inline mr-2" />
            Título da Reunião *
          </label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            required
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Ex: Reunião de Planejamento Q1"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Descrição
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            rows={3}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Descreva o objetivo e tópicos da reunião..."
          />
        </div>

        {/* Tipo da Reunião */}
        <div>
          <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">
            Tipo da reunião *
          </label>
          <select
            id="type"
            name="type"
            value={formData.type}
            onChange={handleInputChange}
            required
            className="block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Selecione o tipo</option>
            <option value="Reunião de projeto">Reunião de projeto</option>
            <option value="Fechamento de ciclo">Fechamento de ciclo</option>
            <option value="Treinamento">Treinamento</option>
            <option value="Onboarding">Onboarding</option>
            <option value="Apresentação">Apresentação</option>
            <option value="Cliente">Cliente</option>
            <option value="Alinhamento">Alinhamento</option>
            <option value="Proposta">Proposta</option>
            <option value="Brainstorming">Brainstorming</option>
          </select>
        </div>

        {/* Data/Hora e Duração */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Calendar className="w-4 h-4 inline mr-2" />
              Data da Reunião *
            </label>
            <input
              type="date"
              name="date"
              value={formData.startDateTime ? formData.startDateTime.split('T')[0] : ''}
              onChange={(e) => {
                const currentTime = formData.startDateTime ? formData.startDateTime.split('T')[1] : '09:00';
                setFormData(prev => ({ 
                  ...prev, 
                  startDateTime: e.target.value ? `${e.target.value}T${currentTime}` : ''
                }));
                setError('');
                setTimeConflict(false);
              }}
              required
              min={new Date().toISOString().split('T')[0]}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Clock className="w-4 h-4 inline mr-2" />
              Horário de Início *
            </label>
            <input
              type="time"
              name="time"
              value={formData.startDateTime ? formData.startDateTime.split('T')[1] : ''}
              onChange={(e) => {
                const currentDate = formData.startDateTime ? formData.startDateTime.split('T')[0] : new Date().toISOString().split('T')[0];
                setFormData(prev => ({ 
                  ...prev, 
                  startDateTime: currentDate ? `${currentDate}T${e.target.value}` : ''
                }));
                setError('');
                setTimeConflict(false);
              }}
              onBlur={handleDateTimeBlur}
              required
              step="900"
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                timeConflict ? 'border-red-300 bg-red-50' : 'border-gray-300'
              } text-lg`}
            />
            {timeConflict && (
              <p className="text-red-600 text-sm mt-1 flex items-center">
                <AlertCircle className="w-4 h-4 mr-1" />
                Horário já ocupado!
              </p>
            )}
          </div>
        </div>

        <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Clock className="w-4 h-4 inline mr-2" />
              Duração *
            </label>
            <select
              name="duration"
              value={formData.duration}
              onChange={(e) => {
                setFormData(prev => ({ ...prev, duration: parseInt(e.target.value) }));
                setError('');
                setTimeConflict(false);
              }}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
            >
              <option value="">Selecione a duração</option>
              <option value={60}>1 hora</option>
              <option value={120}>2 horas</option>
              <option value={180}>3 horas</option>
              <option value={240}>4 horas</option>
              <option value={300}>5 horas</option>
              <option value={360}>6 horas</option>
              <option value={420}>7 horas</option>
              <option value={480}>8 horas</option>
            </select>
        </div>

        {/* Link da Reunião */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Link2 className="w-4 h-4 inline mr-2" />
            Link da Reunião
          </label>
          <input
            type="url"
            name="meetingLink"
            value={formData.meetingLink}
            onChange={handleInputChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="https://meet.google.com/xyz ou https://teams.microsoft.com/..."
          />
        </div>

        {/* Participantes */}
        <ParticipantSelector
          selectedParticipants={selectedParticipants}
          onParticipantsChange={setSelectedParticipants}
        />

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting || timeConflict}
          className="w-full bg-blue-600 text-white py-4 px-6 rounded-lg font-semibold text-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isSubmitting ? (
            <span className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
              Agendando...
            </span>
          ) : (
            'Agendar Reunião'
          )}
        </button>
      </form>
    </div>
  );
};