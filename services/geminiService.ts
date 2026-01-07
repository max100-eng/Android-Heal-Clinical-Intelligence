export async function analyzeImage({
  base64,
  mimeType,
  modality
}: {
  base64: string;
  mimeType: string;
  modality: string;
}) {
  try {
    const response = await fetch("/api/gemini", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        base64,
        mimeType,
        modality
      })
    });

    if (!response.ok) {
      throw new Error("Error en el servidor al procesar la imagen");
    }

    const data = await response.json();

    if (!data.result) {
      throw new Error("No se recibió respuesta del modelo");
    }

    return data.result;
  } catch (error) {
    console.error("Error en analyzeImage:", error);
    throw error;
  }
}
