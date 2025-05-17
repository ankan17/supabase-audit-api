import { Router } from 'express';
import { supabaseAuthMiddleware } from '../auth/auth.middleware';
import { getOrganizationsController } from './users.controllers';

const router = Router();

router.get('/supabase/organisations', supabaseAuthMiddleware, getOrganizationsController);

export default router;
