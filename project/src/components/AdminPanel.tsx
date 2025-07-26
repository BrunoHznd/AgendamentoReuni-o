import React, { useState } from 'react';
import { Video, Mic, FileAudio, Play, StopCircle, UploadCloud } from 'lucide-react';

import { Trash2 } from 'lucide-react';
import { Meeting } from '../types';

interface AdminPanelProps {
  onStartOBS: () => void;
  onStopOBS: () => void;
  obsStatus: string;
  transcriptorStatus: string;
  meeting: Meeting;
  currentUserEmail: string;
  onCancelMeeting: (meetingId: string) => void;
}

const AdminPanel: React.FC<AdminPanelProps> = ({
  onStartOBS,
  onStopOBS,
  obsStatus,
  transcriptorStatus,
  meeting,
  currentUserEmail,
  onCancelMeeting
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [fileId, setFileId] = useState<string | null>(null);
  const [transcript, setTranscript] = useState<string | null>(null);
  const [status, setStatus] = useState<string>('Aguardando arquivo');

  // Real upload handler
  const handleSendToTranscriptor = async (file: File) => {
    setUploading(true);
    setStatus('Enviando para transcrição...');
    try {
      const formData = new FormData();
      formData.append('file', file);
      // meetingId pode ser passado se necessário
      const res = await fetch('http://localhost:8000/api/transcription/upload', {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      if (data.fileId) {
        setFileId(data.fileId);
        setStatus('Transcrevendo...');
        // Poll status
        const poll = setInterval(async () => {
          const statusRes = await fetch(`http://localhost:8000/api/transcription/status/${data.fileId}`);
          const statusData = await statusRes.json();
          if (statusData.status === 'completed' && statusData.transcript) {
            setTranscript(statusData.transcript);
            setStatus('Transcrição concluída!');
            clearInterval(poll);
            // Enviar para o Notion automaticamente
            if (statusData.transcript && statusData.meetingId) {
              await fetch('http://localhost:8000/api/transcription/send-to-notion', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ meetingId: statusData.meetingId, transcript: statusData.transcript })
              });
            }
          } else if (statusData.status === 'error') {
            setStatus('Erro na transcrição');
            clearInterval(poll);
          }
        }, 4000);
      } else {
        setStatus('Erro ao enviar arquivo');
      }
    } catch (err) {
      setStatus('Erro ao transcrever');
    } finally {
      setUploading(false);
    }
  };

  const canCancel = currentUserEmail === meeting.responsibleEmail || currentUserEmail === 'admin@reuniao.local';
  const handleCancel = () => {
    if (window.confirm('Tem certeza que deseja cancelar esta reunião?')) {
      onCancelMeeting(meeting.id);
    }
  };

  return (
    <div className="p-8 bg-gradient-to-br from-blue-50 via-white to-indigo-100 rounded-2xl shadow-xl max-w-3xl mx-auto mt-12 border border-blue-200">
      <h2 className="text-3xl font-extrabold mb-8 text-blue-800 text-center tracking-tight drop-shadow-sm">
        Painel do Administrador da Sala
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        {/* Coluna 1: OBS Studio */}
        <div className="bg-white rounded-xl shadow p-6 flex flex-col items-center">
          <div className="mb-3 flex items-center gap-2">
            <Video className="w-8 h-8 text-blue-600" />
            <span className="text-xl font-semibold text-blue-900">OBS Studio</span>
          </div>
          <div className="mb-4">
            <span className="font-semibold">Status:</span>
            <span className={`ml-2 px-2 py-1 rounded text-xs font-bold ${obsStatus === 'Gravando...' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>{obsStatus}</span>
          </div>
          <button
            className="bg-gradient-to-r from-green-500 to-green-700 text-white px-5 py-3 rounded-lg font-bold text-lg shadow hover:scale-105 transition mb-3 flex items-center gap-2 w-full justify-center"
            onClick={onStartOBS}
          >
            <Play className="w-5 h-5" /> Iniciar Gravação OBS
          </button>
          <button
            className="bg-gradient-to-r from-red-500 to-red-700 text-white px-5 py-3 rounded-lg font-bold text-lg shadow hover:scale-105 transition flex items-center gap-2 w-full justify-center"
            onClick={onStopOBS}
          >
            <StopCircle className="w-5 h-5" /> Parar Gravação OBS
          </button>
        </div>
        {/* Coluna 2: Transcrição */}
        {/* Cancel Meeting Button */}
        {canCancel && (
          <div className="col-span-2 flex justify-end mt-4">
            <button
              className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
              onClick={handleCancel}
            >
              <Trash2 className="w-4 h-4 mr-2" /> Cancelar Reunião
            </button>
          </div>
        )}

        <div className="bg-white rounded-xl shadow p-6 flex flex-col items-center">
          <div className="mb-3 flex items-center gap-2">
            <Mic className="w-8 h-8 text-indigo-600" />
            <span className="text-xl font-semibold text-indigo-900">Transcrição</span>
          </div>
          <div className="mb-4">
            <span className="font-semibold">Status:</span>
            <span className={`ml-2 px-2 py-1 rounded text-xs font-bold ${transcriptorStatus.includes('concluída') ? 'bg-green-100 text-green-700' : transcriptorStatus.includes('Transcrevendo') ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-600'}`}>{transcriptorStatus}</span>
          </div>
          <label className="flex flex-col items-center w-full cursor-pointer mb-3">
            <span className="mb-1 text-gray-600 flex items-center gap-1"><FileAudio className="w-5 h-5" /> Selecione o arquivo de áudio/vídeo:</span>
            <input
              type="file"
              accept="audio/*,video/*"
              className="hidden"
              onChange={e => setSelectedFile(e.target.files?.[0] || null)}
            />
            <div className="w-full flex items-center gap-2 mt-2">
              <span className="flex-1 truncate bg-gray-100 border rounded px-2 py-1 text-gray-700">
                {selectedFile ? selectedFile.name : 'Nenhum arquivo selecionado'}
              </span>
              <UploadCloud className="w-6 h-6 text-blue-500" />
            </div>
          </label>
          <button
            className={`bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-5 py-3 rounded-lg font-bold text-lg shadow hover:scale-105 transition flex items-center gap-2 w-full justify-center ${!selectedFile ? 'opacity-60 cursor-not-allowed' : ''}`}
            onClick={() => selectedFile && handleSendToTranscriptor(selectedFile)}
            disabled={!selectedFile || uploading}
          >
            <UploadCloud className="w-5 h-5" /> {uploading ? 'Enviando...' : 'Enviar para Transcrição'}
          </button>
          {status && <div className="mt-3 text-sm text-gray-800"><b>Status:</b> {status}</div>}
          {transcript && <div className="mt-4 p-3 bg-gray-50 border rounded text-xs text-gray-700 whitespace-pre-wrap"><b>Transcrição:</b><br />{transcript}</div>}

        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
