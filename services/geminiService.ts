import { GoogleGenAI } from "@google/genai";

export const extractQuestionFromImage = async (
  imageBase64: string,
  mimeType: string,
): Promise<string> => {
  try {
    if (!process.env.API_KEY) {
      throw new Error("API key not found. Please set the API_KEY environment variable.");
    }

    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    const imagePart = {
      inlineData: {
        data: imageBase64,
        mimeType: mimeType,
      },
    };

    const textPart = {
      text: `Your ONLY task is to meticulously extract the main question text from the image, correcting any obvious OCR errors.
- IGNORE ALL answer choices (like A, B, C, D), question numbers, or any other metadata.
- Remove any newline characters and trim all whitespace.
- The output MUST be a single, clean line of text representing only the question.
Example: If the image shows "Qvestion 5: Whot is the capitel of Fr@nce? A. Berlin B. Paris", you must return ONLY "What is the capital of France?".`,
    };

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [{ parts: [imagePart, textPart] }],
    });

    return response.text.trim();
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    if (error instanceof Error) {
        throw new Error(`Đã xảy ra lỗi khi phân tích ảnh: ${error.message}`);
    }
    throw new Error("Đã xảy ra lỗi không xác định khi phân tích ảnh.");
  }
};