import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export interface GenerateListingDetailsInput {
  title: string;
  description: string;
  images: string[]; // Base64 encoded images
}

export interface GenerateListingDetailsOutput {
  suggestedTitle: string;
  suggestedDescription: string;
}

export class AIService {
  static async generateListingDetails(input: GenerateListingDetailsInput): Promise<GenerateListingDetailsOutput> {
    try {
      const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

      // Prepare the prompt
      const prompt = `You are an expert in creating appealing listings for items. 

Based on the current title, description, and images, generate an improved title and description that will make the listing more attractive to potential buyers.

Current Title: ${input.title}
Current Description: ${input.description}

Please provide:
1. A catchy, SEO-friendly title (max 60 characters)
2. A compelling description that highlights key features, condition, and benefits

Make the description engaging and include relevant details that would appeal to buyers. Keep it professional but friendly.

Format your response as JSON:
{
  "suggestedTitle": "Your suggested title here",
  "suggestedDescription": "Your suggested description here"
}`;

      // Generate content
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      // Try to parse JSON response
      try {
        console.log('Raw AI response:', text);
        const parsed = JSON.parse(text);
        console.log('Parsed AI response:', parsed);
        return {
          suggestedTitle: parsed.suggestedTitle || input.title,
          suggestedDescription: parsed.suggestedDescription || input.description,
        };
      } catch (parseError) {
        // If JSON parsing fails, extract from text
        console.warn('Failed to parse AI response as JSON, extracting from text');
        
        // Simple text extraction as fallback
        const lines = text.split('\n');
        let title = input.title;
        let description = input.description;
        
        for (const line of lines) {
          if (line.toLowerCase().includes('title:') || line.toLowerCase().includes('title -')) {
            title = line.split(':')[1]?.trim() || line.split('-')[1]?.trim() || title;
          }
          if (line.toLowerCase().includes('description:') || line.toLowerCase().includes('description -')) {
            description = line.split(':')[1]?.trim() || line.split('-')[1]?.trim() || description;
          }
        }
        
        return { suggestedTitle: title, suggestedDescription: description };
      }
    } catch (error) {
      console.error('Error generating AI content:', error);
      throw new Error('Failed to generate AI content. Please try again.');
    }
  }
}
