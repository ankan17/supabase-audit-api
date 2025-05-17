import axios from 'axios';

export const getSupabaseOrganizations = async (accessToken: string) => {
  const { data } = await axios.get('https://api.supabase.com/v1/organizations', {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
  return data;
};
