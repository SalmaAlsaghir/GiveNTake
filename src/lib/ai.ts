import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini AI - check for both possible env var names
const apiKey = process.env.GOOGLE_GENAI_API_KEY || process.env.GEMINI_API_KEY || '';
const genAI = new GoogleGenerativeAI(apiKey);

export interface GenerateListingDetailsInput {
  title: string;
  description: string;
  images: string[]; // Base64 encoded images (data URIs)
}

export interface GenerateListingDetailsOutput {
  suggestedTitle: string;
  suggestedDescription: string;
  suggestedCategory?: string;
  suggestedCondition?: 'like-new' | 'good' | 'fair';
}

export class AIService {
  static async generateListingDetails(input: GenerateListingDetailsInput): Promise<GenerateListingDetailsOutput> {
    try {
      if (!apiKey) {
        throw new Error('AI API key not configured. Please set GOOGLE_GENAI_API_KEY in your environment variables.');
      }

      const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

      // Prepare the prompt based on what information is available
      const hasImages = input.images && input.images.length > 0;
      const hasTitle = input.title && input.title.trim().length > 0;
      const hasDescription = input.description && input.description.trim().length > 0;

      let prompt = `You are an expert in creating appealing listings for items on a marketplace. 
Analyze the provided information and images to generate a professional, engaging listing.

`;

      if (hasTitle) {
        prompt += `Current Title: ${input.title}\n`;
      }
      if (hasDescription) {
        prompt += `Current Description: ${input.description}\n`;
      }

      if (hasImages) {
        prompt += `\nI have provided ${input.images.length} image(s) of the item. Please analyze them carefully to:\n`;
        prompt += `- Identify the item type and key features\n`;
        prompt += `- Assess the condition (like-new, good, or fair)\n`;
        prompt += `- Note any visible details, brand names, or distinctive features\n`;
      }

      prompt += `\nPlease generate:
1. A catchy, SEO-friendly title (max 80 characters) that clearly describes the item
2. A compelling description (100-300 words) that includes:
   - What the item is
   - Key features and specifications
   - Condition assessment
   - Any notable details visible in the images
   - Why this would be valuable to a buyer

${hasImages ? 'Base your description primarily on what you can see in the images.' : 'Create an enhanced version based on the provided information.'}

Format your response as valid JSON:
{
  "suggestedTitle": "Your suggested title here",
  "suggestedDescription": "Your suggested description here",
  "suggestedCondition": "like-new" or "good" or "fair"
}`;

      // Prepare content parts with images
      const parts: Array<{ text: string } | { inlineData: { data: string; mimeType: string } }> = [
        { text: prompt }
      ];

      // Add images if provided
      if (hasImages) {
        for (const imageDataUri of input.images) {
          try {
            // Extract base64 data and mime type from data URI
            const matches = imageDataUri.match(/^data:([^;]+);base64,(.+)$/);
            if (matches) {
              const mimeType = matches[1];
              const base64Data = matches[2];
              parts.push({
                inlineData: {
                  data: base64Data,
                  mimeType: mimeType
                }
              });
            }
          } catch (err) {
            console.warn('Failed to process image:', err);
          }
        }
      }

      // Generate content with images
      const result = await model.generateContent(parts);
      const response = await result.response;
      const text = response.text();

      // Parse JSON response
      try {
        console.log('Raw AI response:', text);
        
        // Clean up the response - remove markdown code blocks if present
        let cleanedText = text.trim();
        if (cleanedText.startsWith('```json')) {
          cleanedText = cleanedText.replace(/```json\n?/g, '').replace(/```\n?/g, '');
        } else if (cleanedText.startsWith('```')) {
          cleanedText = cleanedText.replace(/```\n?/g, '');
        }
        
        const parsed = JSON.parse(cleanedText);
        console.log('Parsed AI response:', parsed);
        
        return {
          suggestedTitle: parsed.suggestedTitle || input.title || 'Untitled Item',
          suggestedDescription: parsed.suggestedDescription || input.description || '',
          suggestedCondition: parsed.suggestedCondition || undefined,
        };
      } catch (parseError) {
        console.error('Failed to parse AI response as JSON:', parseError);
        console.error('Response text:', text);
        
        // Fallback: try to extract title and description from text
        const titleMatch = text.match(/"suggestedTitle"\s*:\s*"([^"]+)"/);
        const descMatch = text.match(/"suggestedDescription"\s*:\s*"([^"]+)"/);
        
        if (titleMatch || descMatch) {
          return {
            suggestedTitle: titleMatch?.[1] || input.title || 'Untitled Item',
            suggestedDescription: descMatch?.[1] || input.description || '',
          };
        }
        
        // If all else fails, return original values
        throw new Error('Unable to parse AI response');
      }
    } catch (error) {
      console.error('Error generating AI content:', error);
      throw error;
    }
  }
}
