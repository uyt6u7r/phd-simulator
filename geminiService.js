import { GoogleGenAI, Type } from "@google/genai";

const MODEL_NAME = 'gemini-2.5-flash';

const projectSchema = {
  type: Type.OBJECT,
  properties: {
    title: { type: Type.STRING },
    description: { type: Type.STRING },
    difficulty: { type: Type.INTEGER },
    potential: { type: Type.INTEGER },
    novelty: { type: Type.INTEGER },
    feasibility: { type: Type.INTEGER },
    resources: { type: Type.INTEGER },
    attraction: { type: Type.INTEGER }
  },
  required: ["title", "description", "difficulty", "potential"]
};

const getAI = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    console.warn("API Key is missing. AI features will use fallback data.");
    return null;
  }
  return new GoogleGenAI({ apiKey });
};

export const generateResearchTopic = async (field) => {
  const ai = getAI();
  if (!ai) return getFallbackTopic();

  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: `Generate a satirical research topic for ${field}.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: projectSchema,
        temperature: 0.8,
      }
    });
    if (response.text) return JSON.parse(response.text);
    throw new Error("No text");
  } catch (error) {
    console.error("Gemini Error:", error);
    return getFallbackTopic();
  }
};

const getFallbackTopic = () => ({
  title: "Analysis of API Errors",
  description: "Why things break when demos start (Offline Mode).",
  difficulty: 50, potential: 50, novelty: 20, feasibility: 90, resources: 30, attraction: 40
});
