import { aiModel, buildSystemUserContents, DIET_SYSTEM_INSTRUCTION } from '../config/ai';
import { DIET_PLAN_PROMPT } from '../utils/prompts';
import { AppError } from '../utils/AppError';
import { z } from 'zod';

interface DietProfile {
    age: number;
    gender: string;
    height: string;
    weight: string;
    medical_history: string;
    medications: string;
    allergies: string;
    preference: string;
    goal: string;
}

// Strictly Typed Schema for Weekly AI Response
const DaySchema = z.object({
    breakfast: z.array(z.string().min(1)).min(1),
    mid_morning: z.array(z.string().min(1)).min(1),
    lunch: z.array(z.string().min(1)).min(1),
    evening_snack: z.array(z.string().min(1)).min(1),
    dinner: z.array(z.string().min(1)).min(1),
});

const WeeklyPlanSchema = z.object({
    plan_type: z.literal('weekly'),
    calories_per_day: z.number().positive(),
    veg_or_nonveg: z.string().min(1),
    indian_foods_only: z.boolean(),
    weekly_plan: z.object({
        day_1: DaySchema,
        day_2: DaySchema,
        day_3: DaySchema,
        day_4: DaySchema,
        day_5: DaySchema,
        day_6: DaySchema,
        day_7: DaySchema,
    }),
    precautions: z.array(z.string().min(1)).min(1),
    disclaimer: z.string().min(1),
});

export type DietPlanType = z.infer<typeof WeeklyPlanSchema>;

export class DietService {
    private static stripMarkdownFences(text: string): string {
        return text
            .replace(/^```json\s*/i, '')
            .replace(/^```\s*/i, '')
            .replace(/```\s*$/i, '')
            .trim();
    }

    private static extractJsonObject(text: string): string {
        const match = text.match(/{[\s\S]*}/);
        if (!match) {
            throw new AppError('AI response did not contain a JSON object.', 502);
        }
        return match[0].trim();
    }
    
    private static buildDietPrompt(profile: DietProfile): string {
        const normalize = (value: string | undefined): string => {
            const trimmed = value?.trim();
            return trimmed && trimmed.length > 0 ? trimmed : 'None reported';
        };

        return DIET_PLAN_PROMPT
            .replace('{age}', profile.age.toString())
            .replace('{gender}', profile.gender)
            .replace('{height}', profile.height)
            .replace('{weight}', profile.weight)
            .replace('{medical_history}', normalize(profile.medical_history))
            .replace('{medications}', normalize(profile.medications))
            .replace('{allergies}', normalize(profile.allergies))
            .replace('{preference}', profile.preference)
            .replace('{goal}', profile.goal);
    }

    private static validatePlanShape(plan: DietPlanType): void {
        const days = Object.values(plan.weekly_plan);
        const mealArrays = days.flatMap((day) => [
            day.breakfast,
            day.mid_morning,
            day.lunch,
            day.evening_snack,
            day.dinner,
        ]);

        const allStrings = mealArrays.every((items) => items.every((item) => typeof item === 'string'));
        if (!allStrings) {
            throw new AppError('Diet plan contains invalid meal entries.', 502);
        }

        if (typeof plan.calories_per_day !== 'number') {
            throw new AppError('Diet plan calories value is invalid.', 502);
        }

        if (typeof plan.indian_foods_only !== 'boolean') {
            throw new AppError('Diet plan foods_only flag is invalid.', 502);
        }
    }

    /**
     * Generate a personalized diet plan using Gemini AI
     * @param profile User's diet profile
     * @returns Validated diet plan object
     * @throws AppError if generation or validation fails
     */
    static async generateDietPlan(profile: DietProfile): Promise<DietPlanType> {
        try {
            const prompt = DietService.buildDietPrompt(profile);
            console.log('Prompt chars:', prompt.length);

            console.log('📝 Generating diet plan for:', {
                age: profile.age,
                preference: profile.preference,
                goal: profile.goal,
            });

            console.log('Calling Gemini API for diet generation');
            console.log(`Gemini model: gemini-2.5-flash`);
            const contents = buildSystemUserContents(DIET_SYSTEM_INSTRUCTION, prompt);
            const requestGemini = async (): Promise<string> => {
                const start = Date.now();
                const result = (await Promise.race([
                    aiModel.generateContent({
                        contents,
                        generationConfig: {
                            temperature: 0.7,
                        },
                    }),
                    new Promise((_, reject) =>
                        setTimeout(
                            () => reject(new AppError('Gemini request timed out.', 504)),
                            30000
                        )
                    ),
                ])) as Awaited<ReturnType<typeof aiModel.generateContent>>;
                const response = await result.response;
                const elapsedSeconds = (Date.now() - start) / 1000;
                const text = response.text();
                console.log('Gemini response text:', text);
                console.log(`Gemini response received in ${elapsedSeconds.toFixed(1)}s`);
                return text;
            };

            const parseGeminiJson = async (allowRetry: boolean): Promise<unknown> => {
                const rawResponse = await requestGemini();
                if (!rawResponse || rawResponse.trim().length === 0) {
                    throw new AppError('Gemini returned an empty response.', 500);
                }
                
                const raw = DietService.stripMarkdownFences(rawResponse).trim();
                if (!raw.endsWith('}')) {
                    console.warn('Gemini response appears truncated');
                    if (allowRetry) {
                        console.warn('Retrying Gemini for a complete response');
                        return parseGeminiJson(false);
                    }
                }
                
                const firstBrace = raw.indexOf('{');
                const lastBrace = raw.lastIndexOf('}');
                if (firstBrace === -1 || lastBrace === -1 || lastBrace < firstBrace) {
                    throw new AppError('No JSON object found in AI response', 500);
                }
                
                const jsonString = raw.substring(firstBrace, lastBrace + 1);
                
                try {
                    return JSON.parse(jsonString);
                } catch (parseError) {
                    if (
                        allowRetry &&
                        parseError instanceof SyntaxError &&
                        /Unexpected end of JSON input/i.test(parseError.message)
                    ) {
                        console.warn('Gemini JSON appears incomplete; retrying for a complete response.');
                        return parseGeminiJson(false);
                    }
                    throw new AppError('AI returned incomplete JSON', 502);
                }
            };

            const json = await parseGeminiJson(true);
            console.log('✅ Valid complete JSON received from Gemini');

            const parsedResult = WeeklyPlanSchema.safeParse(json);
            if (!parsedResult.success) {
                console.error(
                    '❌ AI Response Format Error (Schema Validation):',
                    JSON.stringify(parsedResult.error.format())
                );
                throw new AppError('Invalid weekly plan structure returned by AI', 500);
            }

            DietService.validatePlanShape(parsedResult.data);
            console.log('✅ Weekly diet plan generated successfully');
            return parsedResult.data;
        } catch (error) {
            if (error instanceof AppError) {
                throw error;
            }

            console.error('❌ Diet Generation Error:', error);

            if (error instanceof Error) {
                throw new AppError(error.message, 500);
            }

            throw new AppError('Gemini API failed to generate a diet plan.', 500);
        }
    }
}
