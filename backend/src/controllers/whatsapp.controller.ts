import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { WhatsAppService } from '../services/whatsapp.service';

// Validation schema for WhatsApp webhook input
const whatsappQuerySchema = z.object({
    phone: z
        .string()
        .min(10, 'Phone number must be at least 10 digits')
        .regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone format (E.164 recommended)'),
    message: z
        .string()
        .min(1, 'Message cannot be empty')
        .max(1000, 'Message too long'),
});

/**
 * Handle WhatsApp query endpoint
 * Input: { phone: string, message: string }
 * Output: plain text response (n8n friendly)
 * Authentication: None (webhook style for n8n)
 */
export const handleWhatsAppQuery = async (req: Request, res: Response, next: NextFunction) => {
    try {
        // Validate input
        const { phone, message } = whatsappQuerySchema.parse(req.body);

        console.log(`📱 WhatsApp Query - Phone: ${phone}, Message length: ${message.length}`);

        // Process query
        const responseText = await WhatsAppService.handleQuery(phone, message);

        // Return plain text response (n8n compatible)
        // Do not use JSON response to keep it simple for n8n
        res.status(200)
            .set('Content-Type', 'text/plain; charset=utf-8')
            .send(responseText);
    } catch (error) {
        console.error('❌ WhatsApp Controller Error:', error);

        if (error instanceof z.ZodError) {
            const errorMessages = error.errors.map((e) => `${e.path.join('.')} - ${e.message}`);
            res.status(400)
                .set('Content-Type', 'text/plain; charset=utf-8')
                .send(`Invalid input format. Issues: ${errorMessages.join('; ')}`);
        } else {
            res.status(500)
                .set('Content-Type', 'text/plain; charset=utf-8')
                .send('Internal server error. Please try again later.');
        }
    }
};
