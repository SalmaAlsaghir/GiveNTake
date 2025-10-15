# AI Feature Setup Guide

## Overview
The GiveNTake marketplace includes an AI-powered listing generator that uses Google's Gemini AI to analyze images and create detailed, professional listings automatically.

## How It Works

### User Flow
1. User uploads 1-3 images of their item
2. Optionally enters a basic title or description
3. Clicks "Generate with AI" button
4. AI analyzes the images and generates:
   - Professional, SEO-friendly title
   - Detailed description highlighting key features
   - Suggested condition rating (like-new, good, fair)

### Technical Flow
```
Frontend (page.tsx) 
  → Convert images to base64 data URIs
  → POST to /api/ai/generate-listing
    → AIService.generateListingDetails()
      → Google Gemini Vision API
      → Parse JSON response
    ← Return suggestions
  ← Update form fields
```

## Setup Instructions

### 1. Get Google AI API Key

1. Go to [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy the generated key

### 2. Configure Environment Variable

Add to your `.env.local` file:

```bash
GOOGLE_GENAI_API_KEY=your_api_key_here
```

**Note:** The code also supports the legacy variable name `GEMINI_API_KEY` for backward compatibility.

### 3. Verify Setup

1. Start the development server:
   ```bash
   npm run dev
   ```

2. Navigate to http://localhost:9002/list/new

3. Upload an image

4. Click "Generate with AI"

5. Check the browser console for any errors

## Configuration

### AI Model
Currently using: `gemini-2.0-flash-exp`

To change the model, edit `src/lib/ai.ts`:
```typescript
const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });
```

Available models:
- `gemini-2.0-flash-exp` - Latest experimental (recommended)
- `gemini-1.5-pro` - Production stable
- `gemini-1.5-flash` - Faster, lower cost

### Prompt Customization

The AI prompt can be customized in `src/lib/ai.ts` around line 30. The current prompt instructs the AI to:

- Identify the item from images
- Assess condition
- Note visible features and brands
- Generate professional listings

## Features

### Image Analysis
- ✅ Analyzes up to 3 images
- ✅ Identifies item type and features
- ✅ Assesses condition from visual inspection
- ✅ Detects brand names and specifications

### Smart Generation
- ✅ Works with images only (no text required)
- ✅ Enhances existing title/description if provided
- ✅ Suggests appropriate condition rating
- ✅ SEO-optimized titles (max 80 characters)
- ✅ Detailed descriptions (100-300 words)

### Error Handling
- ✅ Validates API key presence
- ✅ Graceful fallback if JSON parsing fails
- ✅ User-friendly error messages
- ✅ Detailed console logging for debugging

## Troubleshooting

### "AI API key not configured"
**Problem:** Environment variable not set or incorrect name

**Solution:** 
1. Check `.env.local` file exists
2. Verify `GOOGLE_GENAI_API_KEY` is set
3. Restart the development server

### "Failed to generate AI content"
**Problem:** API request failed

**Solutions:**
1. Check internet connection
2. Verify API key is valid
3. Check Google AI API quota
4. Review browser console for specific errors

### Images not being analyzed
**Problem:** Images not properly converted to base64

**Solution:**
1. Check image file size (max recommended: 5MB)
2. Verify image format (JPG, PNG supported)
3. Check browser console for conversion errors

### JSON parsing errors
**Problem:** AI response not in expected format

**Solution:**
The code includes fallback parsing. If you see this often:
1. Check the AI model version
2. Review the prompt clarity
3. Examine raw response in console logs

## API Costs

Google Gemini API pricing (as of 2025):
- **gemini-2.0-flash-exp**: Free tier available
- Rate limits apply
- Check [Google AI Pricing](https://ai.google.dev/pricing) for current rates

### Cost Optimization
- Images are sent as base64 (data URIs)
- Currently supports up to 3 images per request
- Average tokens per request: ~1000-2000

## Security Considerations

### API Key Protection
- ✅ API key stored in environment variables
- ✅ Never exposed to client-side code
- ✅ API route acts as proxy
- ✅ .env files gitignored

### Image Handling
- Images converted to base64 in browser
- Not stored on server
- Sent directly to Google API
- Consider adding file size validation

### Rate Limiting
Consider implementing rate limiting on the API route:
```typescript
// Example: Limit to 10 requests per minute per user
```

## Future Enhancements

### Planned Features
- [ ] Category auto-detection
- [ ] Price suggestion based on similar items
- [ ] Multi-language support
- [ ] Batch processing for multiple listings
- [ ] Save AI suggestions history

### Optimization Ideas
- [ ] Cache common item types
- [ ] Progressive image loading
- [ ] Streaming responses for real-time updates
- [ ] A/B testing different prompts

## Code Structure

### Key Files
```
src/
├── lib/
│   └── ai.ts                    # AI service implementation
├── app/
│   ├── api/
│   │   └── ai/
│   │       └── generate-listing/
│   │           └── route.ts     # API endpoint
│   └── list/
│       └── new/
│           └── page.tsx         # UI with generate button
```

### Type Definitions
```typescript
// Input
interface GenerateListingDetailsInput {
  title: string;
  description: string;
  images: string[];  // Base64 data URIs
}

// Output
interface GenerateListingDetailsOutput {
  suggestedTitle: string;
  suggestedDescription: string;
  suggestedCondition?: 'like-new' | 'good' | 'fair';
}
```

## Support

If you encounter issues:
1. Check browser console for error details
2. Review server logs for API errors
3. Verify environment variables are set correctly
4. Test with a simple image first

For Google AI API issues:
- [Google AI Documentation](https://ai.google.dev/docs)
- [Google AI Support](https://ai.google.dev/support)

---

**Last Updated:** October 15, 2025
