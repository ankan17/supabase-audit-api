import axios from 'axios';

export const generateSupabaseAccessToken = async (code: string, code_verifier: string) => {
  const { data } = await axios.post(
    'https://api.supabase.com/v1/oauth/token',
    {
      grant_type: 'authorization_code',
      code,
      redirect_uri: process.env.SUPABASE_REDIRECT_URI!,
      code_verifier,
    },
    {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Accept: 'application/json',
        Authorization: `Basic ${btoa(`${process.env.SUPABASE_CLIENT_ID}:${process.env.SUPABASE_CLIENT_SECRET}`)}`,
      },
    },
  );
  return data;
};

export const refreshSupabaseAccessToken = async (refreshToken: string) => {
  const { data } = await axios.post(
    'https://api.supabase.com/v1/oauth/token',
    {
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
    },
    {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Accept: 'application/json',
        Authorization: `Basic ${btoa(`${process.env.SUPABASE_CLIENT_ID}:${process.env.SUPABASE_CLIENT_SECRET}`)}`,
      },
    },
  );
  return data;
};

export const revokeSupabaseRefreshToken = async (refreshToken: string) => {
  const { data } = await axios.post('https://api.supabase.com/v1/oauth/revoke', {
    client_id: process.env.SUPABASE_CLIENT_ID!,
    client_secret: process.env.SUPABASE_CLIENT_SECRET!,
    refresh_token: refreshToken,
  });
  return data;
};
