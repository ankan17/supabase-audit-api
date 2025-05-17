import { Request, Response } from 'express';
import { asyncWrap } from '../common/asyncWrap';
import { getMfaData, getPitrData, getRlsData } from './checks.service';

export const mfaCheckController = asyncWrap(async (req: Request, res: Response) => {
  const { orgId: organizationId } = req.query;
  const accessToken = req.cookies.access_token;
  const data = await getMfaData(organizationId as string, accessToken);
  res.status(200).json({ status: 'success', data });
});

export const rlsCheckController = asyncWrap(async (req: Request, res: Response) => {
  const { orgId: organizationId } = req.query;
  const accessToken = req.cookies.access_token;
  const data = await getRlsData(organizationId as string, accessToken);
  res.status(200).json({ status: 'success', data });
});

export const pitrCheckController = asyncWrap(async (req: Request, res: Response) => {
  const { orgId: organizationId } = req.query;
  const accessToken = req.cookies.access_token;
  const data = await getPitrData(organizationId as string, accessToken);
  res.status(200).json({ status: 'success', data });
});
