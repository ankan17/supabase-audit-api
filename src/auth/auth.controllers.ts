import { Request, Response } from 'express';
import { randomUUID } from 'crypto';

import { asyncWrap } from '../common/asyncWrap';
import { InternalServerErrorException } from '../common/errorHandler';
import { genChallenge, genVerifier } from './auth.utils';
import { generateSupabaseAccessToken, revokeSupabaseRefreshToken } from './auth.service';

export const supabaseLoginController = asyncWrap(async (_req: Request, res: Response) => {
  const code_verifier = genVerifier();
  const code_challenge = genChallenge(code_verifier);
  const state = randomUUID();

  // http-only cookie (5 min)
  res.cookie('code_verifier', code_verifier, { httpOnly: true, maxAge: 300000 });

  const params = new URLSearchParams({
    response_type: 'code',
    client_id: process.env.SUPABASE_CLIENT_ID!,
    redirect_uri: process.env.SUPABASE_REDIRECT_URI!,
    code_challenge,
    code_challenge_method: 'S256',
    state,
  });

  res.redirect(`https://api.supabase.com/v1/oauth/authorize?${params}`);
});

export const supabaseCallbackController = asyncWrap(async (req: Request, res: Response) => {
  const { code, state } = req.body;
  if (!code || !state) return res.status(400).send('Missing params');

  const code_verifier = req.cookies.code_verifier;

  try {
    const data = await generateSupabaseAccessToken(code as string, code_verifier);

    // store tokens – simplest is http-only cookies
    res.cookie('access_token', data.access_token, { httpOnly: true, maxAge: 3600_000 });
    res.cookie('refresh_token', data.refresh_token, { httpOnly: true, maxAge: 7 * 24 * 3600_000 });
    res.cookie('auth_type', 'supabase_oauth', { httpOnly: true, maxAge: 7 * 24 * 3600_000 });

    return res.status(200).json({
      status: 'success',
      message: 'Token exchange successful',
    });
  } catch (err) {
    console.error(err);
    throw new InternalServerErrorException('Token exchange failed');
  }
});

export const logoutController = asyncWrap(async (req: Request, res: Response) => {
  const authType = req.cookies.auth_type;

  // Revoke the supabase oauth refresh token
  if (authType === 'supabase_oauth') {
    await revokeSupabaseRefreshToken(req.cookies.refresh_token);
  }

  res.clearCookie('access_token');
  res.clearCookie('refresh_token');
  res.clearCookie('auth_type');

  res.status(200).json({ message: 'Logged out' });
});

export const authVerifyController = asyncWrap(async (req: Request, res: Response) => {
  return res
    .status(200)
    .json({ status: 'success', message: 'Authenticated', data: { authenticated: true } });
});
