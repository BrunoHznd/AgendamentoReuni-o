import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { Meeting } from '../types';
import { MeetingDetailsModal } from './MeetingDetailsModal';

interface CalendarViewProps {
  meetings: Meeting[];
  onTimeSlotClick: (dateTime: string) => void;
  onMeetingCancel: (meetingId: string) => void;
  currentUserEmail: string;
}

export const CalendarView: React.FC<CalendarViewProps> = ({ 
  meetings, 
  onTimeSlotClick, 
  onMeetingCancel,
  currentUserEmail 
}) => {
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [selectedMeeting, setSelectedMeeting] = useState<Meeting | null>(null);

  // Get start of week (Monday)
  const getWeekStart = (date: Date) => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(d.setDate(diff));
  };

  // Generate week days
  const getWeekDays = (startDate: Date) => {
    const days = [];
    for (let i = 0; i < 5; i++) { // Monday to Friday
      const day = new Date(startDate);
      day.setDate(startDate.getDate() + i);
      days.push(day);
    }
    return days;
  };

  // Generate time slots (8:00 to 18:00)
  const timeSlots = [];
  for (let hour = 8; hour <= 17; hour++) {
    timeSlots.push(`${hour.toString().padStart(2, '0')}:00`);
  }

  const weekStart = getWeekStart(currentWeek);
  const weekDays = getWeekDays(weekStart);

  const navigateWeek = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentWeek);
    newDate.setDate(currentWeek.getDate() + (direction === 'next' ? 7 : -7));
    setCurrentWeek(newDate);
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('pt-BR', {
      weekday: 'short',
      day: '2-digit',
      month: '2-digit'
    });
  };

  const getMeetingForSlot = (date: Date, time: string) => {
    const slotDateTime = new Date(date);
    const [hours] = time.split(':').map(Number);
    slotDateTime.setHours(hours, 0, 0, 0);
    
    return meetings.find(meeting => {
      const meetingDate = new Date(meeting.startDateTime);
      const meetingEndDate = new Date(meetingDate.getTime() + meeting.duration * 60000);
      
      return slotDateTime >= meetingDate && slotDateTime < meetingEndDate;
    });
  };

  const handleSlotClick = (date: Date, time: string) => {
    const slotDateTime = new Date(date);
    const [hours] = time.split(':').map(Number);
    slotDateTime.setHours(hours, 0, 0, 0);
    
    // Check if slot is not occupied
    const meeting = getMeetingForSlot(date, time);
    if (!meeting) {
      onTimeSlotClick(slotDateTime.toISOString());
    }
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isPastSlot = (date: Date, time: string) => {
    const slotDateTime = new Date(date);
    const [hours] = time.split(':').map(Number);
    slotDateTime.setHours(hours, 0, 0, 0);
    
    return slotDateTime < new Date();
  };

  const handleMeetingClick = (meeting: Meeting) => {
    setSelectedMeeting(meeting);
  };

  return (
    <>
      <div className="bg-white rounded-xl shadow-lg p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Calendário Semanal</h2>
          <p className="text-gray-600">
            {weekStart.toLocaleDateString('pt-BR', { 
              day: '2-digit', 
              month: 'long', 
              year: 'numeric' 
            })} - {weekDays[4].toLocaleDateString('pt-BR', { 
              day: '2-digit', 
              month: 'long', 
              year: 'numeric' 
            })}
          </p>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={() => navigateWeek('prev')}
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={() => setCurrentWeek(new Date())}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          >
            Hoje
          </button>
          <button
            onClick={() => navigateWeek('next')}
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="overflow-x-auto">
        <div className="min-w-full">
          {/* Header Row */}
          <div className="grid grid-cols-6 gap-1 mb-2">
            <div className="p-3 text-sm font-medium text-gray-500 text-center">
              HORÁRIO
            </div>
            {weekDays.map((day, index) => (
              <div
                key={index}
                className={`p-3 text-sm font-medium text-center rounded-lg ${
                  isToday(day)
                    ? 'bg-blue-100 text-blue-800'
                    : 'text-gray-700'
                }`}
              >
                {formatDate(day).toUpperCase()}
              </div>
            ))}
          </div>

          {/* Time Slots */}
          {timeSlots.map(time => (
            <div key={time} className="grid grid-cols-6 gap-1 mb-1">
              <div className="p-3 text-sm font-medium text-gray-600 text-center border-r border-gray-200">
                {time}
              </div>
              {weekDays.map((day, dayIndex) => {
                const meeting = getMeetingForSlot(day, time);
                const isPast = isPastSlot(day, time);
                
                return (
                  <div
                    key={dayIndex}
                    onClick={() => {
                      if (meeting) {
                        handleMeetingClick(meeting);
                      } else if (!isPast) {
                        handleSlotClick(day, time);
                      }
                    }}
                    className={`
                      min-h-[60px] p-2 border border-gray-200 rounded-lg transition-all
                      ${meeting 
                        ? 'bg-blue-500 text-white cursor-pointer hover:bg-blue-600' 
                        : isPast
                        ? 'bg-gray-50 text-gray-400 cursor-not-allowed'
                        : 'bg-white hover:bg-gray-50 hover:border-gray-300 cursor-pointer'
                      }
                    `}
                  >
                    {meeting ? (
                      <div className="text-xs">
                        <div className="font-medium truncate">{meeting.title}</div>
                        <div className="opacity-90 truncate">{meeting.responsibleName}</div>
                      </div>
                    ) : !isPast ? (
                      <div className="flex items-center justify-center h-full text-gray-400 hover:text-gray-600">
                        <Plus className="w-4 h-4" />
                      </div>
                    ) : null}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="mt-6 flex items-center justify-center space-x-6 text-sm text-gray-600">
        <div className="flex items-center">
          <div className="w-4 h-4 bg-blue-500 rounded mr-2"></div>
          <span>Reunião agendada</span>
        </div>
        <div className="flex items-center">
          <div className="w-4 h-4 bg-gray-50 border border-gray-200 rounded mr-2"></div>
          <span>Horário passado</span>
        </div>
        <div className="flex items-center">
          <div className="w-4 h-4 bg-white border border-gray-200 rounded mr-2"></div>
          <span>Disponível</span>
        </div>
      </div>
      </div>

      {/* Meeting Details Modal */}
      {selectedMeeting && (
        <MeetingDetailsModal
          meeting={selectedMeeting}
          onClose={() => setSelectedMeeting(null)}
          onCancel={onMeetingCancel}
          currentUserEmail={currentUserEmail}
        />
      )}
    </>
  );
};