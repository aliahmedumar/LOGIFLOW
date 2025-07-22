
import {genkit, type Genkit as GenkitType} from 'genkit';
import {googleAI, type GoogleAIPlugin} from '@genkit-ai/googleai';

// Augment globalThis for TypeScript to recognize our custom global variable
declare global {
  // eslint-disable-next-line no-var
  var __genkit_ai_instance: GenkitType<[GoogleAIPlugin]> | undefined;
}

let aiInstance: GenkitType<[GoogleAIPlugin]>;

if (process.env.NODE_ENV === 'production') {
  // In production, always create a new instance
  aiInstance = genkit({
    plugins: [googleAI()],
    model: 'googleai/gemini-2.0-flash',
  });
} else {
  // In development, use a global instance to avoid re-creating it on HMR
  if (!global.__genkit_ai_instance) {
    console.log('Initializing new Genkit AI instance for development...');
    global.__genkit_ai_instance = genkit({
      plugins: [googleAI()],
      model: 'googleai/gemini-2.0-flash',
    });
  } else {
    console.log('Reusing existing Genkit AI instance for development.');
  }
  aiInstance = global.__genkit_ai_instance;
}

export const ai = aiInstance;
