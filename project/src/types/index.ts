export interface Meeting {
  id: string;
  responsibleName: string;
  responsibleEmail: string;
  title: string;
  description: string;
  startDateTime: string;
  duration: number; // em minutos
  meetingLink: string;
  participants: string[];
  notionPageId?: string;
  createdAt: string;
  type: string; // Tipo da reunião
}

export interface MeetingFormData {
  title: string;
  description: string;
  startDateTime: string;
  duration: number;
  meetingLink: string;
  participants: string;
  type: string; // Tipo da reunião
}

export interface User {
  id: string;
  name: string;
  email: string;
  department: string;
  createdAt: string;
  isAdminPC?: boolean;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  department: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface Department {
  name: string;
  members: string[];
}

export const DEPARTMENTS: Department[] = [
  {
    name: 'Tecnologia',
    members: ['Bruno Oliveira', 'Nickolas Custódio', 'Willian Camera', 'Walter Pozzeti', 'Raphael Kaich', 'Matheus Santos']
  },
  {
    name: 'Financeiro',
    members: ['Guilherme Barros', 'Ana Medaglia', 'Marcos']
  },
  {
    name: 'Licitações',
    members: ['Carlos Eduardo', 'Geovanna Chaves']
  },
  {
    name: 'Jurídico',
    members: ['Matheus Abrantes', 'Matheus Prado']
  },
  {
    name: 'RH',
    members: ['Gisele Lazari', 'Gracy Nascimento']
  },
  {
    name: 'Operacional',
    members: ['Ricardo Lima', 'Diego Gomes', 'Gustavo Francisco']
  },
  {
    name: 'Comercial',
    members: ['Luciana Serpeloni']
  },
  {
    name: 'Diretoria',
    members: ['Dauren Zilleti', 'Priscilla Coelho']
  }
];