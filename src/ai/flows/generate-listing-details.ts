'use server';

/**
 * @fileOverview Generates a suggested title and description for a listing based on the textbook name, short description, and images.
 *
 * - generateListingDetails - A function that generates listing details.
 * - GenerateListingDetailsInput - The input type for the generateListingDetails function.
 * - GenerateListingDetailsOutput - The return type for the generateListingDetails function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateListingDetailsInputSchema = z.object({
  textbookName: z.string().describe('The name of the textbook.'),
  shortDescription: z.string().describe('A short description of the item.'),
  imageDataUris: z
    .array(z.string())
    .describe(
      "An array of image data URIs for the item, as data URIs that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type GenerateListingDetailsInput = z.infer<typeof GenerateListingDetailsInputSchema>;

const GenerateListingDetailsOutputSchema = z.object({
  suggestedTitle: z.string().describe('The AI-generated suggested title for the listing.'),
  suggestedDescription: z
    .string()
    .describe('The AI-generated suggested description for the listing.'),
});
export type GenerateListingDetailsOutput = z.infer<typeof GenerateListingDetailsOutputSchema>;

export async function generateListingDetails(
  input: GenerateListingDetailsInput
): Promise<GenerateListingDetailsOutput> {
  return generateListingDetailsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateListingDetailsPrompt',
  input: {schema: GenerateListingDetailsInputSchema},
  output: {schema: GenerateListingDetailsOutputSchema},
  prompt: `You are an expert copywriter for an online marketplace specializing in student items. Your task is to generate a compelling title and description for a used textbook listing based on the provided information.

Analyze the user's inputs:
- Textbook Name/Title: {{{textbookName}}}
- User's Description: {{{shortDescription}}}
{{#if imageDataUris}}
- Images: You have been provided with images of the textbook. Analyze them to assess the book's physical condition (e.g., highlighting, notes, cover wear, page condition).
{{#each imageDataUris}}
{{media url=this}}
{{/each}}
{{/if}}

Your Goal:
1.  **Create a Suggested Title**:
    - Make it clear, concise, and searchable.
    - Include the full textbook name. If you can identify an edition or author from the text or images, include that as well.
    - Example: "Introduction to Algorithms, 3rd Edition (CLRS) - Great Condition"

2.  **Create a Suggested Description**:
    - Write in a friendly, approachable tone suitable for a student marketplace.
    - Start by confirming the book's title and edition.
    - Mention the book's general condition, referencing details from the user's description and what you can see in the images (e.g., "As you can see in the photos, the cover has minor shelf wear, but the pages are clean..."). If no images are provided, rely solely on the user's description.
    - Briefly state the book's relevance (e.g., "This is the required textbook for course CS101...").
    - End with a positive closing statement.

Generate a response in the requested JSON format.`,
});

const generateListingDetailsFlow = ai.defineFlow(
  {
    name: 'generateListingDetailsFlow',
    inputSchema: GenerateListingDetailsInputSchema,
    outputSchema: GenerateListingDetailsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
