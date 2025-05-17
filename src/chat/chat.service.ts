import axios from 'axios';

export const chatWithGeminiService = async (
  message: string,
  history?: { role: string; parts: { text: string }[] }[],
) => {
  const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
  const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;

  const contents = [...(history || []), { role: 'user', parts: [{ text: message }] }];
  const body = { contents };
  const response = await axios.post(GEMINI_API_URL, body);
  return response.data.candidates?.[0]?.content?.parts?.[0]?.text || 'No response';
};
