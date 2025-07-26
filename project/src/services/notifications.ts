export class NotificationService {
  private static isSupported(): boolean {
    return 'Notification' in window && 'serviceWorker' in navigator;
  }

  static async requestPermission(): Promise<boolean> {
    if (!this.isSupported()) {
      console.warn('Notificações não são suportadas neste navegador');
      return false;
    }

    if (Notification.permission === 'granted') {
      return true;
    }

    if (Notification.permission === 'denied') {
      return false;
    }

    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }

  static async showMeetingNotification(
    title: string,
    responsibleName: string,
    startDateTime: string,
    participants: string[]
  ): Promise<void> {
    const hasPermission = await this.requestPermission();
    
    if (!hasPermission) {
      console.warn('Permissão para notificações negada');
      return;
    }

    const meetingDate = new Date(startDateTime);
    const formattedDate = meetingDate.toLocaleString('pt-BR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    const notificationTitle = '📅 Nova Reunião Agendada';
    const notificationBody = `${title}\n\nResponsável: ${responsibleName}\nData: ${formattedDate}\nParticipantes: ${participants.length}`;

    const options: NotificationOptions = {
      body: notificationBody,
      icon: '/icon-192.png',
      badge: '/icon-192.png',
      tag: 'meeting-notification',
      requireInteraction: true,
      vibrate: [200, 100, 200],
      data: {
        title,
        responsibleName,
        startDateTime,
        participants
      },
      actions: [
        {
          action: 'view',
          title: '👁️ Ver Detalhes'
        },
        {
          action: 'dismiss',
          title: '❌ Dispensar'
        }
      ]
    };

    try {
      // Try to use service worker for better notification handling
      if ('serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.ready;
        await registration.showNotification(notificationTitle, options);
      } else {
        // Fallback to regular notification
        new Notification(notificationTitle, options);
      }
    } catch (error) {
      console.error('Erro ao mostrar notificação:', error);
      
      // Fallback to browser notification
      try {
        const notification = new Notification(notificationTitle, {
          body: `${title}\n\nResponsável: ${responsibleName}\nData: ${formattedDate}`,
          icon: '/icon-192.png'
        });

        notification.onclick = () => {
          window.focus();
          notification.close();
        };

        // Auto close after 10 seconds
        setTimeout(() => {
          notification.close();
        }, 10000);
      } catch (fallbackError) {
        console.error('Erro no fallback de notificação:', fallbackError);
      }
    }
  }

  static async showInstallPrompt(): Promise<void> {
    const hasPermission = await this.requestPermission();
    
    if (!hasPermission) return;

    const options: NotificationOptions = {
      body: 'Instale o app para acesso rápido e notificações offline!',
      icon: '/icon-192.png',
      badge: '/icon-192.png',
      tag: 'install-prompt',
      actions: [
        {
          action: 'install',
          title: '📱 Instalar App'
        },
        {
          action: 'later',
          title: '⏰ Mais Tarde'
        }
      ]
    };

    try {
      if ('serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.ready;
        await registration.showNotification('🚀 App Disponível para Instalação', options);
      }
    } catch (error) {
      console.error('Erro ao mostrar prompt de instalação:', error);
    }
  }

  // Check if user is included in participants and show notification
  static shouldNotifyUser(participants: string[], currentUserName: string): boolean {
    return participants.some(participant => 
      participant.toLowerCase().includes(currentUserName.toLowerCase()) ||
      currentUserName.toLowerCase().includes(participant.toLowerCase())
    );
  }
}