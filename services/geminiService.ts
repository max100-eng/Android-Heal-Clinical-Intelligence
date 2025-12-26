import { GoogleGenerativeAI } from "@google/generative-ai";

// Buscamos la clave en las variables de entorno de Vite
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

const genAI = new GoogleGenerativeAI(API_KEY || "");

export const chatWithClinicalAI = async (base64Image: string, userPrompt: string) => {
  if (!API_KEY) {
    throw new Error("API_KEY no detectada. Configura VITE_GEMINI_API_KEY en Vercel.");
  }

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // Limpieza de la cadena base64 para Gemini
    const cleanBase64 = base64Image.includes(",") 
      ? base64Image.split(",")[1] 
      : base64Image;

    const result = await model.generateContent([
      {
        inlineData: {
          data: cleanBase64,
          mimeType: "image/jpeg",
        },
      },
      { text: `Como experto clínico, analiza lo siguiente: ${userPrompt}` },
    ]);

    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error("Error en el servicio de Gemini:", error);
    throw new Error("Error al procesar la imagen clínica.");
  }
};