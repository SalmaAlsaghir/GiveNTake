import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';

export const ai = genkit({
  plugins: [
    googleAI({
      // Specify the model directly for consistency.
      // gemini-1.5-flash-latest is a powerful multimodal model.
      model: 'gemini-1.5-flash-latest',
    }),
  ],
  // Remove the global model to rely on the plugin's configuration.
});
