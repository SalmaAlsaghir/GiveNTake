import { NextRequest, NextResponse } from 'next/server';
import { AIService } from '@/lib/ai';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, description, images } = body;


    // Validate input: allow if images OR title/description are provided
    const hasImages = images && Array.isArray(images) && images.length > 0;
    const hasText = (title && title.trim().length > 0) || (description && description.trim().length > 0);
    if (!hasImages && !hasText) {
      return NextResponse.json(
        { error: 'Please provide at least one image or some text.' },
        { status: 400 }
      );
    }

    // Generate AI content
    const result = await AIService.generateListingDetails({
      title,
      description,
      images: images || [],
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('AI generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate AI content' },
      { status: 500 }
    );
  }
}
