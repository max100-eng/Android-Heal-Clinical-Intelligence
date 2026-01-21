import { GoogleGenerativeAI } from "@google/generative-ai";

// Error TS14,42: Solucionado asegurando que la clave no sea undefined
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

// Error TS7006: Solucionado definiendo el tipo del request
export async function getGeminiResponse(prompt: string, imageBase64?: string, mimeType?: string) {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    if (imageBase64 && mimeType) {
      const result = await model.generateContent([
        prompt,
        {
          inlineData: {
            data: imageBase64,
            mimeType: mimeType
          }
        }
      ]);
      return result.response.text();
    }

    const result = await model.generateContent(prompt);
    return result.response.text();
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw new Error("Fallo en la comunicación con el motor clínico.");
  }
}
