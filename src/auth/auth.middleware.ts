import { Request, Response, NextFunction } from 'express';
import { UnauthorizedException } from '../common/errorHandler';
import { refreshSupabaseAccessToken } from './auth.service';

export const supabaseAuthMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  const accessToken = req.cookies.access_token;
  const refreshToken = req.cookies.refresh_token;
  const authType = req.cookies.auth_type;

  if (!accessToken && !refreshToken) {
    next(new UnauthorizedException('User is not authenticated'));
    return;
  }

  if (authType !== 'supabase_oauth') {
    // Ignore any checks if auth type is not supabase_oauth
    next();
    return;
  }

  if (!accessToken && refreshToken) {
    const data = await refreshSupabaseAccessToken(refreshToken);
    res.cookie('access_token', data.access_token, { httpOnly: true, maxAge: 3600_000 });
  }

  next();
};
