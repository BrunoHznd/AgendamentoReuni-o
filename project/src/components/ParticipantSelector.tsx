import React, { useState } from 'react';
import { Users, Building, User, Plus, X } from 'lucide-react';
import { DEPARTMENTS } from '../types';

interface ParticipantSelectorProps {
  selectedParticipants: string[];
  onParticipantsChange: (participants: string[]) => void;
}

export const ParticipantSelector: React.FC<ParticipantSelectorProps> = ({
  selectedParticipants,
  onParticipantsChange
}) => {
  const [selectionMode, setSelectionMode] = useState<'department' | 'individual'>('individual');
  const [selectedDepartments, setSelectedDepartments] = useState<string[]>([]);
  const [individualName, setIndividualName] = useState('');

  const handleDepartmentToggle = (departmentName: string) => {
    const department = DEPARTMENTS.find(d => d.name === departmentName);
    if (!department) return;

    const isSelected = selectedDepartments.includes(departmentName);
    
    if (isSelected) {
      // Remove department
      setSelectedDepartments(prev => prev.filter(d => d !== departmentName));
      // Remove all members from participants
      const membersToRemove = department.members;
      onParticipantsChange(selectedParticipants.filter(p => !membersToRemove.includes(p)));
    } else {
      // Add department
      setSelectedDepartments(prev => [...prev, departmentName]);
      // Add all members to participants
      const newParticipants = [...selectedParticipants];
      department.members.forEach(member => {
        if (!newParticipants.includes(member)) {
          newParticipants.push(member);
        }
      });
      onParticipantsChange(newParticipants);
    }
  };

  const handleIndividualAdd = () => {
    if (individualName.trim() && !selectedParticipants.includes(individualName.trim())) {
      onParticipantsChange([...selectedParticipants, individualName.trim()]);
      setIndividualName('');
    }
  };

  const handleRemoveParticipant = (participant: string) => {
    onParticipantsChange(selectedParticipants.filter(p => p !== participant));
    
    // Update selected departments if needed
    DEPARTMENTS.forEach(dept => {
      if (dept.members.includes(participant)) {
        const allMembersSelected = dept.members.every(member => 
          selectedParticipants.includes(member) && member !== participant
        );
        if (!allMembersSelected) {
          setSelectedDepartments(prev => prev.filter(d => d !== dept.name));
        }
      }
    });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleIndividualAdd();
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          <Users className="w-4 h-4 inline mr-2" />
          Participantes
        </label>
        
        {/* Mode Selection */}
        <div className="flex space-x-1 bg-gray-100 rounded-lg p-1 mb-4">
          <button
            type="button"
            onClick={() => setSelectionMode('individual')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              selectionMode === 'individual'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <User className="w-4 h-4 inline mr-2" />
            Individual
          </button>
          <button
            type="button"
            onClick={() => setSelectionMode('department')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              selectionMode === 'department'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Building className="w-4 h-4 inline mr-2" />
            Por Departamento
          </button>
        </div>

        {/* Individual Selection */}
        {selectionMode === 'individual' && (
          <div className="space-y-3">
            <div className="flex gap-2">
              <input
                type="text"
                value={individualName}
                onChange={(e) => setIndividualName(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Digite o nome do participante"
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button
                type="button"
                onClick={handleIndividualAdd}
                disabled={!individualName.trim()}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
            
            {/* Quick Add from Departments */}
            <div className="space-y-2">
              <p className="text-sm text-gray-600">Ou selecione de um departamento:</p>
              {DEPARTMENTS.map(dept => (
                <div key={dept.name} className="border border-gray-200 rounded-lg p-3">
                  <h4 className="font-medium text-gray-900 mb-2">{dept.name}</h4>
                  <div className="flex flex-wrap gap-2">
                    {dept.members.map(member => (
                      <button
                        key={member}
                        type="button"
                        onClick={() => {
                          if (!selectedParticipants.includes(member)) {
                            onParticipantsChange([...selectedParticipants, member]);
                          }
                        }}
                        disabled={selectedParticipants.includes(member)}
                        className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        {member}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Department Selection */}
        {selectionMode === 'department' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {DEPARTMENTS.map(dept => (
              <div
                key={dept.name}
                className={`border-2 rounded-lg p-4 cursor-pointer transition-colors ${
                  selectedDepartments.includes(dept.name)
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => handleDepartmentToggle(dept.name)}
              >
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-gray-900">{dept.name}</h4>
                  <span className="text-sm text-gray-500">
                    {dept.members.length} pessoas
                  </span>
                </div>
                <div className="text-sm text-gray-600">
                  {dept.members.slice(0, 3).join(', ')}
                  {dept.members.length > 3 && '...'}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Selected Participants */}
      {selectedParticipants.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-3">
            Participantes Selecionados ({selectedParticipants.length})
          </h4>
          <div className="flex flex-wrap gap-2">
            {selectedParticipants.map(participant => (
              <span
                key={participant}
                className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800"
              >
                {participant}
                <button
                  type="button"
                  onClick={() => handleRemoveParticipant(participant)}
                  className="ml-2 text-blue-600 hover:text-blue-800"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};