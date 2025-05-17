import { Request, Response } from 'express';
import { getSupabaseOrganizations } from './users.service';

export const getOrganizationsController = async (req: Request, res: Response) => {
  const accessToken = req.cookies.access_token;
  const organizations = await getSupabaseOrganizations(accessToken);
  res.status(200).json({ status: 'success', data: organizations });
};
