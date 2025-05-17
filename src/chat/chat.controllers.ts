import { Request, Response } from 'express';

import { chatWithGeminiService } from './chat.service';
import { asyncWrap } from '../common/asyncWrap';
import { InternalServerErrorException } from '../common/errorHandler';

export const chatController = asyncWrap(async (req: Request, res: Response) => {
  try {
    const { message, history } = req.body;
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }
    const aiResponse = await chatWithGeminiService(message, history);
    res.json({ message: aiResponse });
  } catch (err: unknown) {
    console.error(err);
    throw new InternalServerErrorException('Error in AI Chat');
  }
});
