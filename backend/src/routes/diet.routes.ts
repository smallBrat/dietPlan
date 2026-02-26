import express from 'express';
import { generateDiet, getLatestDiet, getDietById } from '../controllers/diet.controller';
import { protect } from '../middleware/auth.middleware';

const router = express.Router();

router.use(protect); // All routes protected

router.post('/generate', generateDiet);
router.get('/latest', getLatestDiet);
router.get('/:id', getDietById);

export default router;
