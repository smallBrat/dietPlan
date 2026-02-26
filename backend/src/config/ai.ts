import { GoogleGenerativeAI, type Content } from '@google/generative-ai';
import { env } from './env';

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY);

/**
 * Diet Plan Generation Model
 * Uses Gemini 1.5 Flash for fast JSON generation with structured output
 */
export const DIET_SYSTEM_INSTRUCTION =
    'MANDATORY JSON RULES (FOLLOW STRICTLY): 1) Output ONLY valid JSON. 2) NO markdown, NO code blocks, NO explanations, NO comments. 3) NO newline characters inside strings. 4) Every array item must be a SINGLE-LINE string. 5) Double quotes only. 6) No trailing commas. 7) Follow the schema EXACTLY. 8) If you cannot comply, output exactly: {"error":"INVALID_FORMAT"}. You are an expert Indian clinical dietitian.';

export const QA_SYSTEM_INSTRUCTION =
    'You are a helpful diet assistant. Provide concise, friendly advice based on the provided diet plan. Never provide medical diagnosis. Always suggest consulting a healthcare provider for medical concerns.';

export const aiModel = genAI.getGenerativeModel({
    model: 'models/gemini-2.5-flash',
    generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
    },
});

/**
 * WhatsApp Query Response Model
 * Uses Gemini 1.5 Flash for quick, contextual responses
 */
export const qaModel = genAI.getGenerativeModel({
    model: 'models/gemini-2.5-flash',
    generationConfig: {
        temperature: 0.4,
        topK: 40,
        topP: 0.95,
    },
});

export const buildSystemUserContents = (systemText: string, userText: string): Content[] => [
    {
        role: 'user',
        parts: [{ text: `${systemText}\n\n${userText}` }],
    },
];
