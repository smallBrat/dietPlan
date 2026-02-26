import express from 'express';
import { handleWhatsAppQuery } from '../controllers/whatsapp.controller';

const router = express.Router();

router.post('/query', handleWhatsAppQuery);

export default router;
