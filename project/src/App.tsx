import React, { useState, useEffect } from 'react';
import { Calendar, RefreshCw, AlertTriangle, LogOut, Download } from 'lucide-react';
import { MeetingForm } from './components/MeetingForm';
import { MeetingList } from './components/MeetingList';
import { LoginForm } from './components/LoginForm';
import { RegisterForm } from './components/RegisterForm';
import AdminPanel from './components/AdminPanel';
import AdminMeetingSelector from './components/AdminMeetingSelector';
import { Meeting } from './types';
import { APIService } from './services/api';
import { AuthService } from './services/auth';
import { NotificationService } from './services/notifications';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(AuthService.isAuthenticated());
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'form' | 'list'>('form');
  const [selectedDateTime, setSelectedDateTime] = useState<string>('');
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  const currentUser = AuthService.getCurrentUser();
  const [obsStatus, setObsStatus] = useState('Parado');
  const [transcriptorStatus, setTranscriptorStatus] = useState('Aguardando arquivo');

  // Simulações iniciais de integração OBS/Transcriptor
  const handleStartOBS = () => {
    setObsStatus('Gravando...');
    NotificationService.notify('OBS Studio: Gravação iniciada!');
    // Aqui você pode acionar uma API local ou WebSocket para o OBS
  };
  const handleStopOBS = () => {
    setObsStatus('Parado');
    NotificationService.notify('OBS Studio: Gravação parada!');
    // Aqui você pode acionar uma API local ou WebSocket para o OBS
  };
  const handleSendToTranscriptor = (file: File) => {
    setTranscriptorStatus('Transcrevendo...');
    setTimeout(() => {
      setTranscriptorStatus('Transcrição concluída! (simulado)');
      NotificationService.notify('Arquivo enviado para transcrição!');
    }, 3000);
    // Aqui você pode integrar com seu Transcriptor real
  };


  const loadMeetings = async () => {
    try {
      setLoading(true);
      const meetingsData = await APIService.getMeetings();
      setMeetings(meetingsData);
      setError('');
    } catch (err) {
      setError('Não foi possível conectar com o servidor. Certifique-se de que o backend está rodando.');
      console.error('Erro ao carregar reuniões:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadMeetings();
      
      // Request notification permission when user logs in
      NotificationService.requestPermission();
      
      // Check for install prompt
      const handleBeforeInstallPrompt = (e: any) => {
        e.preventDefault();
        setDeferredPrompt(e);
        setIsInstallable(true);
      };
      
      const handleAppInstalled = () => {
        setIsInstalled(true);
        setIsInstallable(false);
        setDeferredPrompt(null);
      };
      
      window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.addEventListener('appinstalled', handleAppInstalled);
      
      return () => {
        window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        window.removeEventListener('appinstalled', handleAppInstalled);
      };
    }
  }, [isAuthenticated]);

  const handleMeetingCreated = (newMeeting: Meeting) => {
    setMeetings(prev => [...prev, newMeeting]);
    setActiveTab('list');
  };

  const handleRefresh = () => {
    loadMeetings();
  };

  const handleLogin = () => {
    setIsAuthenticated(true);
    setActiveTab('form');
  };

  const handleLogout = () => {
    AuthService.logout();
    setIsAuthenticated(false);
    setMeetings([]);
    setError('');
  };

  const handleScheduleFromCalendar = (dateTime: string) => {
    setSelectedDateTime(dateTime);
    setActiveTab('form');
  };

  const handleCancelMeeting = async (meetingId: string) => {
    try {
      await APIService.deleteMeeting(meetingId);
      setMeetings(prev => prev.filter(m => m.id !== meetingId));
    } catch (err) {
      setError('Erro ao cancelar reunião: ' + (err instanceof Error ? err.message : 'Erro desconhecido'));
    }
  };

  const handleInstallApp = async () => {
    if (!deferredPrompt) {
      // Fallback: show manual installation instructions
      alert('Para instalar o app:\n\n• Chrome/Edge: Clique no ícone de instalação na barra de endereços\n• Safari: Toque em "Compartilhar" → "Adicionar à Tela de Início"\n• Firefox: Menu → "Instalar"');
      return;
    }
    
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      setIsInstalled(true);
    }
    
    setDeferredPrompt(null);
    setIsInstallable(false);
  };

  // Show auth forms if not authenticated
  if (!isAuthenticated) {
    return authMode === 'login' ? (
      <LoginForm 
        onLogin={handleLogin}
        onSwitchToRegister={() => setAuthMode('register')}
      />
    ) : (
      <RegisterForm 
        onRegister={handleLogin}
        onSwitchToLogin={() => setAuthMode('login')}
      />
    );
  }

  // Se for admin-pc, mostra painel especial
  const [adminSelectedMeeting, setAdminSelectedMeeting] = useState<Meeting | null>(null);

  if (currentUser?.isAdminPC) {
    return (
      <div className="min-h-screen bg-gray-100">
        <header className="bg-blue-700 text-white py-4 shadow">
          <div className="container mx-auto flex items-center justify-between px-4">
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Calendar /> Reunião App (Admin-PC)
            </h1>
            <button
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded ml-4"
              onClick={() => {
                AuthService.logout();
                window.location.reload();
              }}
            >
              Sair do Admin
            </button>
          </div>
        </header>
        <main className="container mx-auto px-4 py-8">
          {!adminSelectedMeeting ? (
            <AdminMeetingSelector meetings={meetings} onSelect={setAdminSelectedMeeting} />
          ) : (
            <>
              <button
                className="mb-4 bg-gray-200 text-gray-700 px-4 py-2 rounded hover:bg-gray-300"
                onClick={() => setAdminSelectedMeeting(null)}
              >
                Voltar para lista de reuniões
              </button>

              <div className="bg-white rounded-xl shadow p-5 flex flex-col gap-2 max-w-lg mb-8">
                <div className="font-extrabold text-xl text-blue-900 mb-1">{adminSelectedMeeting.title}</div>
                <div className="text-gray-700 font-medium mb-1 flex items-center gap-2">
                  <span className="inline-block bg-blue-100 text-blue-800 px-2 py-0.5 rounded text-xs font-semibold">{new Date(adminSelectedMeeting.startDateTime).toLocaleString()}</span>
                </div>
                <div className="text-gray-600 text-base mb-2">{adminSelectedMeeting.description}</div>
                {adminSelectedMeeting.meetingLink && (
                  <div className="flex items-center gap-2 mt-2">
                    <a
                      href={adminSelectedMeeting.meetingLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-700 underline font-semibold hover:text-blue-900 transition"
                    >
                      Acessar link da reunião
                    </a>
                    <button
                      className="bg-blue-100 text-blue-800 px-3 py-1 rounded font-medium text-sm hover:bg-blue-200 transition"
                      onClick={() => {
                        if(adminSelectedMeeting.meetingLink) navigator.clipboard.writeText(adminSelectedMeeting.meetingLink);
                      }}
                    >
                      Copiar link
                    </button>
                  </div>
                )}
              </div>
              
              <AdminPanel
                meeting={adminSelectedMeeting}
                currentUserEmail={currentUser.email}
                onCancelMeeting={handleCancelMeeting}
                onStartOBS={handleStartOBS}
                onStopOBS={handleStopOBS}
                obsStatus={obsStatus}
                transcriptorStatus={transcriptorStatus}
              />
            </>
          )}
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <Calendar className="w-8 h-8 text-blue-600 mr-3" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Gerenciador de Sala de Reuniões
                </h1>
                <p className="text-gray-600">
                  Bem-vindo, {currentUser?.name} • {currentUser?.department}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <button
                onClick={handleRefresh}
                className="inline-flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                disabled={loading}
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Atualizar
              </button>
              
              {!isInstalled && (
                <div className="relative">
                  <button
                    onClick={handleInstallApp}
                    className={`inline-flex items-center px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                      isInstallable 
                        ? 'bg-green-600 text-white hover:bg-green-700 shadow-lg animate-pulse' 
                        : 'bg-blue-600 text-white hover:bg-blue-700'
                    }`}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    {isInstallable ? 'Instalar App Agora!' : 'Instalar App'}
                  </button>
                  {isInstallable && (
                    <div className="absolute -top-2 -right-2 w-3 h-3 bg-red-500 rounded-full animate-ping"></div>
                  )}
                </div>
              )}
              
              {isInstalled && (
                <div className="inline-flex items-center px-4 py-2 bg-green-100 text-green-800 rounded-lg">
                  <Download className="w-4 h-4 mr-2" />
                  App Instalado ✓
                </div>
              )}
              
              <button
                onClick={handleLogout}
                className="inline-flex items-center px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sair
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Error Banner */}
      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center">
              <AlertTriangle className="w-5 h-5 text-red-400 mr-3" />
              <p className="text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        <div className="flex space-x-1 bg-gray-100 rounded-lg p-1 max-w-md">
          <button
            onClick={() => setActiveTab('form')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'form'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Nova Reunião
          </button>
          <button
            onClick={() => setActiveTab('list')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'list'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Reuniões ({meetings.filter(m => new Date(m.startDateTime) >= new Date()).length})
          </button>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'form' && (
          <MeetingForm 
            onMeetingCreated={handleMeetingCreated}
            initialDateTime={selectedDateTime}
          />
        )}
        
        {activeTab === 'list' && (
          <>
            {loading ? (
              <div className="bg-white rounded-xl shadow-lg p-8 max-w-4xl mx-auto text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Carregando reuniões...</p>
              </div>
            ) : (
              <MeetingList 
                meetings={meetings}
                onScheduleMeeting={handleScheduleFromCalendar}
                onCancelMeeting={handleCancelMeeting}
                currentUserEmail={currentUser?.email || ''}
              />
            )}
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-gray-50 border-t border-gray-200 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-gray-600">
            <p className="mb-2">Sistema de Gerenciamento de Sala de Reuniões</p>
            <p className="text-sm">
              Integração automática com Notion • Backend Python • Frontend React
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;