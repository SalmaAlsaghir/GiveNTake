import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';

export const ai = genkit({
  plugins: [
    googleAI({
      // Specify the model(s) array for plugin options.
      models: ['gemini-1.5-flash-latest'],
    }),
  ],
  // Remove the global model to rely on the plugin's configuration.
});
