import { GoogleGenerativeAI } from "@google/generative-ai";

export default async function handler(req, res) {
  // 1. Solo permitir peticiones POST (seguridad)
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  try {
    const { image, mimeType, type } = req.body;

    // 2. Validar que la API KEY existe en Vercel
    const apiKey = process.env.VITE_GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("Configuración del servidor incompleta (API KEY missing)");
    }

    // 3. Inicializar Gemini
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash",
      // Ajustamos la configuración para un análisis técnico preciso
      generationConfig: {
        temperature: 0.4,
        topP: 0.8,
        maxOutputTokens: 2048,
      }
    });

    // 4. El Prompt Médico (El mismo que usabas en AI Studio)
    const prompt = `Actúa como un experto en diagnóstico clínico avanzado. 
    Analiza esta imagen de modalidad: ${type}.
    
    Proporciona un informe técnico estructurado que incluya:
    1. Hallazgos principales.
    2. Observaciones técnicas detalladas.
    3. Impresión diagnóstica preliminar.
    
    IMPORTANTE: Incluye siempre una nota indicando que este es un análisis asistido por IA y debe ser revisado por un profesional facultativo.`;

    // 5. Ejecutar el análisis
    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          data: image,
          mimeType: mimeType
        }
      }
    ]);

    const response = await result.response;
    const text = response.text();

    // 6. Enviar la respuesta de vuelta a la App
    return res.status(200).json({ text: text });

  } catch (error) {
    console.error("Error en el servidor Gemini:", error);
    return res.status(500).json({ 
      error: "Error interno en el procesamiento del análisis clínico.",
      details: error.message 
    });
  }
}
