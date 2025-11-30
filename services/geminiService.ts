import { GoogleGenAI, Modality } from "@google/genai";
import { VoiceName } from "../types";
import { fallbackKeys } from "./apiKeys";

// --- Gerenciamento de Chaves de API ---

// Função segura para pegar a chave do ambiente sem quebrar se 'process' não existir
const getEnvKey = () => {
  try {
    // O vite.config.ts vai substituir isso pelo valor real da string no build
    return process.env.API_KEY;
  } catch (e) {
    console.warn("Ambiente 'process' não encontrado. Verifique vite.config.ts");
    return undefined;
  }
};

const rawKeys = [
  getEnvKey(),
  ...fallbackKeys
];

// Filtra chaves vazias ou placeholders
const availableKeys = rawKeys.filter(key => 
  key && 
  key.length > 10 && 
  !key.includes("INSIRA_SUA_CHAVE")
);

// Se nenhuma chave válida for encontrada
if (availableKeys.length === 0) {
  console.error("ERRO CRÍTICO: Nenhuma chave de API válida encontrada. Configure a variável de ambiente API_KEY na Vercel.");
}

let currentKeyIndex = 0;

/**
 * Retorna uma instância do cliente com a chave atual.
 */
const getClient = (): GoogleGenAI => {
  const key = availableKeys[currentKeyIndex];
  if (!key) throw new Error("Nenhuma chave de API configurada. Adicione API_KEY nas Variáveis de Ambiente da Vercel.");
  return new GoogleGenAI({ apiKey: key });
};

/**
 * Função Wrapper que executa uma operação e rotaciona a chave em caso de erro.
 */
async function withKeyRotation<T>(operation: (client: GoogleGenAI) => Promise<T>): Promise<T> {
  const maxAttempts = Math.max(1, availableKeys.length);
  let attempts = 0;
  let lastError: any;

  while (attempts < maxAttempts) {
    try {
      const client = getClient();
      return await operation(client);
    } catch (error: any) {
      lastError = error;
      console.warn(`Erro na tentativa ${attempts + 1} com a chave ${currentKeyIndex + 1}/${availableKeys.length}:`, error.message);

      // Se for erro de permissão ou cota, tenta a próxima chave
      const isAuthError = error.message?.includes('403') || error.message?.includes('429') || error.status === 403 || error.status === 429;

      if (isAuthError && attempts + 1 < maxAttempts) {
        attempts++;
        currentKeyIndex = (currentKeyIndex + 1) % availableKeys.length;
        console.log(`Rotacionando para a chave ${currentKeyIndex + 1}...`);
      } else {
        // Se não for erro de chave, ou acabaram as chaves, falha
        throw error;
      }
    }
  }

  throw lastError || new Error("Falha na comunicação com a API.");
}

// --- Funções do Serviço ---

/**
 * Generates a text response based on chat history and character persona.
 * Supports optional image input.
 */
export const generateChatResponse = async (
  prompt: string,
  imageData: { mimeType: string; data: string } | null,
  history: { role: string; parts: { text: string }[] }[],
  systemInstruction: string
): Promise<string> => {
  return withKeyRotation(async (ai) => {
    const model = 'gemini-2.5-flash';
    
    // Construct the current message contents
    const currentParts: any[] = [];
    
    // Add image if present
    if (imageData) {
      currentParts.push({
        inlineData: {
          mimeType: imageData.mimeType,
          data: imageData.data
        }
      });
    }
    
    // Add text prompt
    if (prompt) {
      currentParts.push({ text: prompt });
    }

    const response = await ai.models.generateContent({
      model,
      contents: [
        ...history, // Previous messages
        { role: 'user', parts: currentParts } // Current message with text and/or image
      ],
      config: {
        systemInstruction,
        temperature: 0.8, // Slightly creative
      }
    });

    return response.text || "Desculpe, não consegui pensar em nada.";
  });
};

/**
 * Converts text to speech using the Gemini TTS model.
 * Returns the base64 encoded audio string.
 */
export const generateSpeech = async (text: string, voiceName: VoiceName): Promise<string> => {
  return withKeyRotation(async (ai) => {
    const model = "gemini-2.5-flash-preview-tts";
    
    const response = await ai.models.generateContent({
      model,
      contents: [{ parts: [{ text }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName }
          }
        }
      }
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    
    if (!base64Audio) {
      throw new Error("No audio data received from API");
    }

    return base64Audio;
  });
};