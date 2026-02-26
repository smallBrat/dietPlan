export enum UserRole {
  PATIENT = 'PATIENT',
  DOCTOR = 'DOCTOR',
  ADMIN = 'ADMIN'
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl?: string;
}

export interface DietPlan {
  id: string;
  patientId: string;
  createdAt: string;
  status: 'active' | 'archived' | 'draft';
  source: 'upload' | 'generated';
  meals: {
    type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
    time: string;
    items: string[];
    notes?: string;
    allowed: boolean;
  }[];
}

export interface MedicalProfile {
  age: number;
  gender: 'male' | 'female' | 'other';
  heightCm: number;
  weightKg: number;
  conditions: string[];
  medications: string[];
  allergies: string[];
  dietaryPreference: 'veg' | 'non-veg' | 'vegan' | 'eggetarian';
  goal: 'weight_loss' | 'weight_gain' | 'maintenance' | 'recovery';
}

export interface WhatsAppQuery {
  id: string;
  patientId: string;
  timestamp: string;
  query: string;
  response: string;
  intent: string;
}
