import { User, LoginData, RegisterData, AuthResponse } from '../types';

const AUTH_KEY = 'meeting_auth_token';
const USER_KEY = 'meeting_current_user';

// Mock users database
const mockUsers: User[] = [
  {
    id: '1',
    name: 'Bruno Oliveira',
    email: 'bruno@empresa.com',
    department: 'Tecnologia',
    createdAt: new Date().toISOString()
  },
  {
    id: '2',
    name: 'Ana Medaglia',
    email: 'ana@empresa.com',
    department: 'Financeiro',
    createdAt: new Date().toISOString()
  },
  {
    id: 'admin-pc',
    name: 'Administrador da Sala',
    email: 'admin@reuniao.local',
    department: 'Admin-PC',
    createdAt: new Date().toISOString(),
    isAdminPC: true
  }
];

export class AuthService {
  static async login(loginData: LoginData): Promise<AuthResponse> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Find user by email
    const user = mockUsers.find(u => u.email === loginData.email);
    
    if (!user) {
      throw new Error('E-mail não encontrado');
    }
    
    // In a real app, you would verify the password hash
    if (loginData.password !== '123456') {
      throw new Error('Senha incorreta');
    }
    
    const token = `token_${user.id}_${Date.now()}`;
    
    // Store in localStorage
    localStorage.setItem(AUTH_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    
    return { user, token };
  }
  
  static async register(registerData: RegisterData): Promise<AuthResponse> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Check if user already exists
    const existingUser = mockUsers.find(u => u.email === registerData.email);
    if (existingUser) {
      throw new Error('E-mail já cadastrado');
    }
    
    // Create new user
    const newUser: User = {
      id: Math.random().toString(36).substr(2, 9),
      name: registerData.name,
      email: registerData.email,
      department: registerData.department,
      createdAt: new Date().toISOString()
    };
    
    mockUsers.push(newUser);
    
    const token = `token_${newUser.id}_${Date.now()}`;
    
    // Store in localStorage
    localStorage.setItem(AUTH_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(newUser));
    
    return { user: newUser, token };
  }
  
  static getCurrentUser(): User | null {
    const userStr = localStorage.getItem(USER_KEY);
    if (!userStr) return null;
    
    try {
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  }
  
  static getToken(): string | null {
    return localStorage.getItem(AUTH_KEY);
  }
  
  static logout(): void {
    localStorage.removeItem(AUTH_KEY);
    localStorage.removeItem(USER_KEY);
  }
  
  static isAuthenticated(): boolean {
    return !!this.getToken() && !!this.getCurrentUser();
  }
}