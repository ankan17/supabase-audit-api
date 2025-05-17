import { Router } from 'express';

import {
  logoutController,
  supabaseCallbackController,
  supabaseLoginController,
  authVerifyController,
} from './auth.controllers';
import { supabaseAuthMiddleware } from './auth.middleware';

const router = Router();

router.get('/supabase/login', supabaseLoginController);

router.post('/supabase/callback', supabaseCallbackController);

router.get('/verify', supabaseAuthMiddleware, authVerifyController);

router.post('/logout', supabaseAuthMiddleware, logoutController);

export default router;
