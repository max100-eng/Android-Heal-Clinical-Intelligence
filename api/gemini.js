import { GoogleGenerativeAI } from "@google/generative-ai";

// Accede a la llave que configuraste en Vercel
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY);

export async function analyzeImage(base64Data, mimeType, modality) {
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const prompt = `Actúa como un experto en diagnóstico clínico. Analiza esta imagen de ${modality} y proporciona un informe detallado con: 
  1. Hallazgos principales.
  2. Diagnóstico diferencial.
  3. Sugerencias de seguimiento. 
  Responde siempre en español y con un tono profesional.`;

  const imagePart = {
    inlineData: {
      data: base64Data,
      mimeType
    },
  };

  const result = await model.generateContent([prompt, imagePart]);
  const response = await result.response;
  return { text: response.text() };
}