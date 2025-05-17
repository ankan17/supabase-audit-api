import { Router } from 'express';
import { supabaseAuthMiddleware } from '../auth/auth.middleware';
import { mfaCheckController, pitrCheckController, rlsCheckController } from './checks.controllers';

const router = Router();

router.get('/supabase/mfa', supabaseAuthMiddleware, mfaCheckController);

router.get('/supabase/rls', supabaseAuthMiddleware, rlsCheckController);

router.get('/supabase/pitr', supabaseAuthMiddleware, pitrCheckController);

export default router;
