import { Router } from 'express';
import { chatController } from './chat.controllers';
import { supabaseAuthMiddleware } from '../auth/auth.middleware';

const router = Router();

router.post('/', supabaseAuthMiddleware, chatController);

export default router;
