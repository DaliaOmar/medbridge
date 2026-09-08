export interface User {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    phone?: string;
    role: 'ADMIN' | 'USER';
    isActive: boolean;
    createdAt: string;
    _count?: { enrollments: number; wishlists?: number };
  }
  export interface AuthResponse {
    success: boolean;
    message: string;
    data: {
      user: User;
      token: string;
    };
  }
  export interface RegisterPayload {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phone?: string;
  }
  export interface LoginPayload {
    email: string;
    password: string;
  }