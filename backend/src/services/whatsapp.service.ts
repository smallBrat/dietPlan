import { User } from '../models/user.model';
import { DietPlan } from '../models/dietPlan.model';
import { qaModel, buildSystemUserContents, QA_SYSTEM_INSTRUCTION } from '../config/ai';
import { WHATSAPP_QA_PROMPT } from '../utils/prompts';
import { AppError } from '../utils/AppError';

export class WhatsAppService {
    /**
     * Handle WhatsApp query using RAG pattern with stored diet plan
     * Stateless design for n8n compatibility
     * @param phone User's phone number
     * @param message User's question
     * @returns Plain text response (n8n compatible)
     */
    static async handleQuery(phone: string, message: string): Promise<string> {
        try {
            // Step 1: Find user by phone number
            console.log(`🔍 Looking up user with phone: ${phone}`);
            const user = await User.findOne({ phone });

            if (!user) {
                console.warn(`⚠️  User not found for phone: ${phone}`);
                return 'Sorry, I could not find an account associated with this phone number. Please register on the MediDiet platform first.';
            }

            console.log(`✅ User found: ${user.name} (${user.email})`);

            // Step 2: Fetch active diet plan
            console.log(`📋 Fetching active diet plan for user: ${user._id}`);
            const dietPlan = await DietPlan.findOne({
                user: user._id,
                isActive: true,
            });

            if (!dietPlan) {
                console.warn(`⚠️  No active diet plan found for user: ${user._id}`);
                return "You don't have an active diet plan yet. Please visit the MediDiet platform to generate a personalized diet plan.";
            }

            console.log(`✅ Diet plan found (v${dietPlan.version})`);

            // Step 3: Build RAG prompt
            const planContext = JSON.stringify(dietPlan.planData, null, 2);
            const prompt = WHATSAPP_QA_PROMPT
                .replace('{diet_plan}', planContext)
                .replace('{question}', message);

            console.log(`💬 Processing query: "${message.substring(0, 50)}..."`);

            // Step 4: Get AI response
            const contents = buildSystemUserContents(QA_SYSTEM_INSTRUCTION, prompt);
            const result = await qaModel.generateContent({ contents });
            const response = await result.response;
            const answerText = response.text().trim();

            console.log(`✅ Response generated successfully`);

            // Step 5: Return plain text (n8n compatible)
            return answerText;
        } catch (error) {
            console.error('❌ WhatsApp Service Error:', error);

            // Return user-friendly error message without exposing internal details
            if (error instanceof Error) {
                if (error.message.includes('API key')) {
                    return 'Sorry, there is a configuration issue. Please try again later.';
                }
                if (error.message.includes('rate limit')) {
                    return 'Too many requests. Please wait a moment and try again.';
                }
            }

            return 'Sorry, I encountered an error processing your request. Please try again in a moment.';
        }
    }
}
