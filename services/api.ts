import { api } from '../src/lib/api';

/**
 * Uploads a diet plan file (PDF/Image) to the backend/n8n workflow
 */
export const uploadDietPlan = async (file: File): Promise<{ success: boolean; id: string }> => {
  console.log('API: Uploading file...', file.name);
  throw new Error('Upload endpoint is not configured.');
};

/**
 * Generates a diet plan based on structured data using Gemini via n8n
 */
export type DietGenerationPayload = {
  age: number;
  gender: 'Male' | 'Female' | 'Other';
  height: string;
  weight: string;
  medical_history: string;
  medications: string;
  allergies: string;
  preference: 'Veg' | 'Non-Veg' | 'Eggetarian';
  goal: string;
};

export type DietPlanResponse = {
  status: string;
  message?: string;
  data: {
    dietPlan: {
      planData: unknown;
    };
  };
};

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

const getAuthToken = (): string | null => {
  try {
    return localStorage.getItem('auth_token');
  } catch {
    return null;
  }
};

export const generateDietPlan = async (profile: DietGenerationPayload) => {
  const token = getAuthToken();
  const response = await api.post<DietPlanResponse>(
    '/api/diet/generate',
    profile,
    {
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      validateStatus: () => true,
    }
  );

  if (response.status !== 201 && response.status !== 200) {
    const message = response.data?.message || 'Failed to generate diet plan.';
    throw new ApiError(message, response.status);
  }

  return response;
};

export const getLatestDietPlan = async () => {
  const token = getAuthToken();
  const response = await api.get<DietPlanResponse>('/api/diet/latest', {
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    validateStatus: () => true,
  });

  if (response.status !== 200) {
    const message = response.data?.message || 'Failed to fetch diet plan.';
    throw new ApiError(message, response.status);
  }

  return response;
};

export const fetchWhatsAppQueries = async (): Promise<any[]> => {
  throw new Error('WhatsApp query endpoint is not configured.');
};
