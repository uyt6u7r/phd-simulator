
import { GoogleGenAI, Type, Schema } from "@google/genai";
import { ResearchField } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const MODEL_NAME = 'gemini-2.5-flash';

// Define schemas using the @google/genai Type enum
const projectSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    title: { type: Type.STRING, description: "The title of the research paper." },
    description: { type: Type.STRING, description: "A one sentence abstract or description." },
    difficulty: { type: Type.INTEGER, description: "General difficulty level from 1 to 100." },
    potential: { type: Type.INTEGER, description: "Potential impact factor from 1 to 100." },
    novelty: { type: Type.INTEGER, description: "Novelty/Originality score from 1 to 100." },
    feasibility: { type: Type.INTEGER, description: "Feasibility score from 1 to 100." },
    resources: { type: Type.INTEGER, description: "Resource requirement (Equipment/Cost) from 1 to 100." },
    attraction: { type: Type.INTEGER, description: "General appeal/attraction of the topic from 1 to 100." }
  },
  required: ["title", "description", "difficulty", "potential", "novelty", "feasibility", "resources", "attraction"]
};

const reviewSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    accepted: { type: Type.BOOLEAN, description: "Whether the paper is accepted." },
    score: { type: Type.INTEGER, description: "Review score from 1 to 10." },
    comment: { type: Type.STRING, description: "A sarcastic or constructive comment from Reviewer #2." }
  },
  required: ["accepted", "score", "comment"]
};

export const generateResearchTopic = async (field: ResearchField, context?: string) => {
  try {
    const contextPrompt = context ? `Context: ${context}.` : "";
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: `Generate a satirical but plausible research topic for a PhD student in the field of ${field}. ${contextPrompt} The generated stats (1-100) should roughly align with the context if provided.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: projectSchema,
        temperature: 0.8,
      }
    });
    
    if (response.text) {
      return JSON.parse(response.text);
    }
    throw new Error("No text returned from Gemini");
  } catch (error) {
    console.error("Gemini Error:", error);
    // Fallback if API fails
    return {
      title: "Analysis of API Errors in Modern Computing",
      description: "Why things break when we need them most.",
      difficulty: 50,
      potential: 50,
      novelty: 20,
      feasibility: 90,
      resources: 30,
      attraction: 40
    };
  }
};

export const generatePeerReview = async (title: string, quality: number) => {
  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: `Simulate a peer review for a paper titled "${title}" with a calculated internal quality of ${quality}/100. 
      If quality is below 50, be harsh and reject. If above 80, be likely to accept but nitpicky. 
      Act as "Reviewer #2". Be witty, academic, and slightly mean if rejected.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: reviewSchema,
        temperature: 0.9,
      }
    });

    if (response.text) {
      return JSON.parse(response.text);
    }
    throw new Error("No text returned from Gemini");
  } catch (error) {
    console.error("Gemini Error:", error);
    return {
      accepted: false,
      score: 1,
      comment: "The reviewer was unable to read the file due to a format error (API Failure)."
    };
  }
};

export const generateRandomEvent = async (currentStats: any) => {
    try {
        const response = await ai.models.generateContent({
            model: MODEL_NAME,
            contents: `Generate a random 1-sentence event happening to a PhD student. 
            Current status: Stress ${currentStats.stress}/100, Funds ${currentStats.funds}.
            Return plain text only. Examples: "Free pizza in the lounge!", "Lab equipment caught fire.", "Advisor ignored your email."`,
            config: {
                temperature: 1.0,
                maxOutputTokens: 50,
            }
        });
        return response.text?.trim() || "Nothing interesting happened today.";
    } catch (e) {
        return "You stared at the wall for an hour.";
    }
}
