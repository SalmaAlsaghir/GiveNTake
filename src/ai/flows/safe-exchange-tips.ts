'use server';

/**
 * @fileOverview Provides safety tips and suggested locations for exchanging goods.
 *
 * - generateSafeExchangeTips - A function that generates safety tips and suggested locations.
 * - SafeExchangeTipsInput - The input type for the generateSafeExchangeTips function.
 * - SafeExchangeTipsOutput - The return type for the generateSafeExchangeTips function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SafeExchangeTipsInputSchema = z.object({
  itemDescription: z.string().describe('The description of the item being exchanged.'),
  location: z.string().describe('The location where the exchange will take place.'),
});
export type SafeExchangeTipsInput = z.infer<typeof SafeExchangeTipsInputSchema>;

const SafeExchangeTipsOutputSchema = z.object({
  safetyTips: z.string().describe('Tailored safety tips for the exchange.'),
  suggestedLocations: z.string().describe('Suggested safe locations for the exchange.'),
});
export type SafeExchangeTipsOutput = z.infer<typeof SafeExchangeTipsOutputSchema>;

export async function generateSafeExchangeTips(
  input: SafeExchangeTipsInput
): Promise<SafeExchangeTipsOutput> {
  return safeExchangeTipsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'safeExchangeTipsPrompt',
  input: {schema: SafeExchangeTipsInputSchema},
  output: {schema: SafeExchangeTipsOutputSchema},
  prompt: `You are an AI assistant designed to provide safety advice for in-person transactions.

  Based on the item being exchanged and the proposed location, generate tailored safety tips and suggest safer alternative locations.

  Item Description: {{{itemDescription}}}
  Location: {{{location}}}

  Provide specific and actionable advice. Focus on personal safety and avoiding scams.
  Suggest well-lit, public places for the exchange, such as police stations, shopping malls, or community centers.
`,
});

const safeExchangeTipsFlow = ai.defineFlow(
  {
    name: 'safeExchangeTipsFlow',
    inputSchema: SafeExchangeTipsInputSchema,
    outputSchema: SafeExchangeTipsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
