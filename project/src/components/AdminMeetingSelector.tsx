import React from 'react';
import { Meeting } from '../types';

interface AdminMeetingSelectorProps {
  meetings: Meeting[];
  onSelect: (meeting: Meeting) => void;
}

const AdminMeetingSelector: React.FC<AdminMeetingSelectorProps> = ({ meetings, onSelect }) => {
  return (
    <div className="p-6 bg-white rounded shadow-md max-w-xl mx-auto mt-8 border border-blue-200">
      <h2 className="text-2xl font-bold mb-4 text-blue-700">Selecione a Reunião para Gerenciar</h2>
      <ul className="divide-y divide-gray-200">
        {meetings.length === 0 && (
          <li className="py-4 text-gray-500">Nenhuma reunião agendada.</li>
        )}
        {meetings.map(meeting => (
          <li key={meeting.id} className="py-4 flex justify-between items-center">
            <div>
              <div className="font-semibold text-gray-800">{meeting.title}</div>
              <div className="text-gray-600 text-sm">{new Date(meeting.startDateTime).toLocaleString()}</div>
            </div>
            <button
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              onClick={() => onSelect(meeting)}
            >
              Gerenciar
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default AdminMeetingSelector;
