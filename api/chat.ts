import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getGeminiResponse } from './gemini';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Solo aceptamos peticiones POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  try {
    const { message, image, mimeType } = req.body;

    // Llamamos a la función que acabas de configurar
    const response = await getGeminiResponse(message, image, mimeType);

    return res.status(200).json({ response });
  } catch (error: any) {
    console.error("Error en el manejador de chat:", error);
    return res.status(500).json({ error: error.message || "Error interno del servidor" });
  }
}