import { GoogleGenAI } from "@google/genai";

// Initialize the Gemini API client
// Note: API key is automatically injected by the environment
export const ai = new GoogleGenAI({ 
  apiKey: process.env.GEMINI_API_KEY || "" 
});

export const MODEL_NAME = "gemini-3-flash-preview";

export interface Message {
  id: string;
  role: "user" | "model";
  content: string;
  timestamp: number;
}
